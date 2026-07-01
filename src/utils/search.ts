import type { SearchResult, PageAnalysis } from '@/types';

export function searchPages(
  query: string,
  pageAnalyses: Map<number, PageAnalysis>
): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  for (const [pageNumber, analysis] of pageAnalyses) {
    for (const element of analysis.elements) {
      if (!element.content) continue;
      const lowerContent = element.content.toLowerCase();
      let index = 0;
      let foundIndex = lowerContent.indexOf(lowerQuery, index);
      while (foundIndex !== -1) {
        results.push({
          pageNumber,
          elementId: element.id,
          text: element.content.substring(foundIndex, foundIndex + query.length),
          index: foundIndex,
        });
        index = foundIndex + 1;
        foundIndex = lowerContent.indexOf(lowerQuery, index);
      }
    }

    if (analysis.textContent.toLowerCase().includes(lowerQuery)) {
      const pageText = analysis.textContent.toLowerCase();
      let idx = 0;
      let found = pageText.indexOf(lowerQuery, idx);
      while (found !== -1) {
        const alreadyFound = results.some(
          (r) => r.pageNumber === pageNumber && r.index === found
        );
        if (!alreadyFound) {
          results.push({
            pageNumber,
            elementId: `page-${pageNumber}`,
            text: analysis.textContent.substring(found, found + query.length),
            index: found,
          });
        }
        idx = found + 1;
        found = pageText.indexOf(lowerQuery, idx);
      }
    }
  }

  return results;
}

export function getVisiblePageRange(
  currentPage: number,
  totalPages: number,
  range: number
): number[] {
  const pages: number[] = [];
  const start = Math.max(0, currentPage - range);
  const end = Math.min(totalPages - 1, currentPage + range);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
}
