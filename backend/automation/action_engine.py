import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.models.action import ActionType, ActionLog, Capability
from backend.automation.permission_engine import PermissionEngine
from backend.automation.executor import ComputerExecutor
from backend.automation.verifier import ActionVerifier

class ActionEngine:
    def __init__(self, permission_engine: Optional[PermissionEngine] = None):
        self.permission_engine = permission_engine or PermissionEngine()
        self.executor = ComputerExecutor()
        self.verifier = ActionVerifier()
        self.action_logs: List[ActionLog] = []

    async def execute_action(
        self,
        trigger: str,
        action: ActionType,
        target: str,
        payload: Dict[str, Any] = None
    ) -> ActionLog:
        payload = payload or {}
        
        # 1. Check Permission
        is_allowed, reason = self.permission_engine.check_permission(action, target, payload)
        required_cap = self.permission_engine.ACTION_CAPABILITY_MAP.get(action, Capability.CREATE_TASKS)

        if not is_allowed:
            log = ActionLog(
                id=str(uuid.uuid4()),
                timestamp=datetime.utcnow(),
                trigger=trigger,
                action=action,
                target=target,
                permission=required_cap,
                result=reason,
                verified=False,
                details={"error": reason}
            )
            self.action_logs.append(log)
            return log

        # 2. Execute Safely
        try:
            res = await self.executor.execute(action, target, payload)
            # 3. Verify
            is_verified = self.verifier.verify(action, target, res)
            result_str = "SUCCESS" if (res.get("status") == "SUCCESS" and is_verified) else "FAILED"
            
            log = ActionLog(
                id=str(uuid.uuid4()),
                timestamp=datetime.utcnow(),
                trigger=trigger,
                action=action,
                target=target,
                permission=required_cap,
                result=result_str,
                verified=is_verified,
                details=res
            )
        except Exception as e:
            log = ActionLog(
                id=str(uuid.uuid4()),
                timestamp=datetime.utcnow(),
                trigger=trigger,
                action=action,
                target=target,
                permission=required_cap,
                result=f"ERROR: {str(e)}",
                verified=False,
                details={"exception": str(e)}
            )

        self.action_logs.append(log)
        return log

    def get_history(self) -> List[ActionLog]:
        return list(reversed(self.action_logs))
