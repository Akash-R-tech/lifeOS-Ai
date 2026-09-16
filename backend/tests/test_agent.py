import pytest
from backend.automation.permission_engine import PermissionEngine
from backend.models.action import ActionType, Capability

def test_permission_engine_blocking():
    engine = PermissionEngine()
    
    # Final academic submission must be blocked unless human confirms
    allowed, reason = engine.check_permission(
        ActionType.CREATE_TASK,
        "test_target",
        {"is_final_submission": True}
    )
    assert not allowed
    assert "Academic safety" in reason

def test_emergency_stop():
    engine = PermissionEngine()
    engine.set_emergency_stop(True)
    allowed, reason = engine.check_permission(ActionType.OPEN_FILE, "test.txt")
    assert not allowed
    assert "EMERGENCY_STOP" in reason
