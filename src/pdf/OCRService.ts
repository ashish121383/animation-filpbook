import Tesseract from 'tesseract.js';
import type { OCRProvider } from '@/types';

class TesseractOCR implements OCRProvider {
  name = 'tesseract' as const;

  async recognize(imageData: ImageData | string): Promise<string> {
    const source = typeof imageData === 'string'
      ? imageData
      : this.imageDataToDataUrl(imageData);

    const result = await Tesseract.recognize(source, 'eng', {
      logger: () => {},
    });

    return result.data.text;
  }

  private imageDataToDataUrl(imageData: ImageData): string {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }
}

class GoogleVisionOCR implements OCRProvider {
  name = 'google-vision' as const;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_GOOGLE_VISION_API_KEY || '';
  }

  async recognize(imageData: ImageData | string): Promise<string> {
    if (!this.apiKey) {
      console.warn('Google Vision API key not configured, falling back to Tesseract');
      return tesseractOCR.recognize(imageData);
    }

    const base64 = typeof imageData === 'string'
      ? imageData.split(',')[1]
      : this.imageDataToBase64(imageData);

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64 },
            features: [{ type: 'TEXT_DETECTION' }],
          }],
        }),
      }
    );

    const data = await response.json();
    return data.responses?.[0]?.fullTextAnnotation?.text || '';
  }

  private imageDataToBase64(imageData: ImageData): string {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
  }
}

class AzureVisionOCR implements OCRProvider {
  name = 'azure-vision' as const;
  private endpoint: string;
  private apiKey: string;

  constructor() {
    this.endpoint = import.meta.env.VITE_AZURE_VISION_ENDPOINT || '';
    this.apiKey = import.meta.env.VITE_AZURE_VISION_KEY || '';
  }

  async recognize(imageData: ImageData | string): Promise<string> {
    if (!this.endpoint || !this.apiKey) {
      console.warn('Azure Vision not configured, falling back to Tesseract');
      return tesseractOCR.recognize(imageData);
    }

    const blob = typeof imageData === 'string'
      ? await fetch(imageData).then((r) => r.blob())
      : await this.imageDataToBlob(imageData);

    const response = await fetch(
      `${this.endpoint}/vision/v3.2/read/analyze`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/octet-stream',
        },
        body: blob,
      }
    );

    const operationLocation = response.headers.get('Operation-Location');
    if (!operationLocation) return '';

    let result;
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const poll = await fetch(operationLocation, {
        headers: { 'Ocp-Apim-Subscription-Key': this.apiKey },
      });
      result = await poll.json();
      if (result.status === 'succeeded') break;
    }

    return result?.analyzeResult?.readResults
      ?.flatMap((page: { lines: Array<{ text: string }> }) => page.lines.map((l) => l.text))
      .join('\n') || '';
  }

  private async imageDataToBlob(imageData: ImageData): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');
    ctx.putImageData(imageData, 0, 0);
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/png');
    });
  }
}

export const tesseractOCR = new TesseractOCR();
export const googleVisionOCR = new GoogleVisionOCR();
export const azureVisionOCR = new AzureVisionOCR();

export type OCRProviderName = 'tesseract' | 'google-vision' | 'azure-vision';

export function getOCRProvider(name: OCRProviderName): OCRProvider {
  switch (name) {
    case 'google-vision':
      return googleVisionOCR;
    case 'azure-vision':
      return azureVisionOCR;
    default:
      return tesseractOCR;
  }
}

export async function performOCR(
  imageSource: ImageData | string,
  provider: OCRProviderName = 'tesseract'
): Promise<string> {
  return getOCRProvider(provider).recognize(imageSource);
}
