from app.celery_app import celery_app
from app.tasks.document_tasks import process_document_task as _process_document


@celery_app.task(name="app.tasks.process_document", bind=True, max_retries=3)
def process_document(self, document_id: str) -> dict[str, str | int]:  # type: ignore[no-untyped-def]
    try:
        return _process_document(document_id)
    except Exception as exc:
        raise self.retry(exc=exc, countdown=30) from exc
