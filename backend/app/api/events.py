"""
Event Audit Log API Router.
"""

from fastapi import APIRouter
from typing import Optional

from backend.app.services.contract_service import contract_service

router = APIRouter(prefix="/api/events", tags=["Events"])

@router.get("/all")
def get_event_logs(limit: int = 50, severity: Optional[str] = None):
    events = list(reversed(contract_service.event_log))
    if severity:
        events = [e for e in events if e.get("severity") == severity]
    return {"events": events[:limit], "total": len(contract_service.event_log)}
