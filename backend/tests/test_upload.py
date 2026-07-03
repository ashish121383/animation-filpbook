import uuid

import pytest
from httpx import AsyncClient

from tests.conftest import make_pdf_bytes


@pytest.mark.asyncio
async def test_upload_pdf(client: AsyncClient):
    pdf_data = make_pdf_bytes(page_count=2)
    response = await client.post(
        "/api/v1/upload",
        files={"file": ("test_document.pdf", pdf_data, "application/pdf")},
    )
    assert response.status_code == 201
    data = response.json()
    assert "document" in data
    assert data["document"]["original_filename"] == "test_document.pdf"
    assert data["document"]["status"] in ("pending", "processing", "ready")
    assert data["message"] == "Upload successful. Processing started."


@pytest.mark.asyncio
async def test_upload_rejects_non_pdf(client: AsyncClient):
    response = await client.post(
        "/api/v1/upload",
        files={"file": ("test.txt", b"not a pdf", "text/plain")},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_upload_rejects_empty_file(client: AsyncClient):
    response = await client.post(
        "/api/v1/upload",
        files={"file": ("empty.pdf", b"", "application/pdf")},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_list_documents(client: AsyncClient):
    pdf_data = make_pdf_bytes()
    await client.post(
        "/api/v1/upload",
        files={"file": ("doc1.pdf", pdf_data, "application/pdf")},
    )

    response = await client.get("/api/v1/documents")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert data["total"] >= 1
    assert len(data["data"]) >= 1


@pytest.mark.asyncio
async def test_get_document(client: AsyncClient):
    pdf_data = make_pdf_bytes()
    upload_resp = await client.post(
        "/api/v1/upload",
        files={"file": ("get_test.pdf", pdf_data, "application/pdf")},
    )
    doc_id = upload_resp.json()["document"]["id"]

    response = await client.get(f"/api/v1/documents/{doc_id}")
    assert response.status_code == 200
    assert response.json()["id"] == doc_id


@pytest.mark.asyncio
async def test_get_document_not_found(client: AsyncClient):
    fake_id = str(uuid.uuid4())
    response = await client.get(f"/api/v1/documents/{fake_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_pages(client: AsyncClient):
    pdf_data = make_pdf_bytes(page_count=3)
    upload_resp = await client.post(
        "/api/v1/upload",
        files={"file": ("pages_test.pdf", pdf_data, "application/pdf")},
    )
    doc_id = upload_resp.json()["document"]["id"]

    response = await client.get(f"/api/v1/pages?document_id={doc_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["document_id"] == doc_id
    assert data["total"] == 3
    assert len(data["data"]) == 3


@pytest.mark.asyncio
async def test_get_page(client: AsyncClient):
    pdf_data = make_pdf_bytes(page_count=1)
    upload_resp = await client.post(
        "/api/v1/upload",
        files={"file": ("single_page.pdf", pdf_data, "application/pdf")},
    )
    doc_id = upload_resp.json()["document"]["id"]

    pages_resp = await client.get(f"/api/v1/pages?document_id={doc_id}")
    page_id = pages_resp.json()["data"][0]["id"]

    response = await client.get(f"/api/v1/page/{page_id}")
    assert response.status_code == 200
    assert response.json()["page_number"] == 1


@pytest.mark.asyncio
async def test_delete_document(client: AsyncClient):
    pdf_data = make_pdf_bytes()
    upload_resp = await client.post(
        "/api/v1/upload",
        files={"file": ("delete_test.pdf", pdf_data, "application/pdf")},
    )
    doc_id = upload_resp.json()["document"]["id"]

    response = await client.delete(f"/api/v1/documents/{doc_id}")
    assert response.status_code == 200

    get_resp = await client.get(f"/api/v1/documents/{doc_id}")
    assert get_resp.status_code == 404
