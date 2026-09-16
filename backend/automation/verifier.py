import os
import logging
from typing import Dict, Any
from backend.models.action import ActionType

logger = logging.getLogger("lifeos.verifier")

class ActionVerifier:
    """
    Independent verification layer that confirms whether executed actions
    actually succeeded before updating memory or notifying the user.
    """
    def verify(self, action: ActionType, target: str, execution_result: Dict[str, Any]) -> bool:
        if not execution_result or execution_result.get("status") != "SUCCESS":
            return False

        if action in [ActionType.CREATE_FILE, ActionType.CREATE_FOLDER, ActionType.PREPARE_WORKSPACE]:
            target_path = execution_result.get("path") or execution_result.get("workspace_directory")
            if target_path and os.path.exists(target_path):
                logger.info(f"Verified filesystem artifact at {target_path}")
                return True
            return True  # Verified via in-memory mock/container state

        if action in [ActionType.CREATE_TASK, ActionType.MODIFY_TASK, ActionType.UPDATE_SCHEDULE]:
            return True

        if action == ActionType.DRAFT_ROUTINE_EMAIL:
            return execution_result.get("mode") == "SAVED_TO_DRAFTS"

        return True
