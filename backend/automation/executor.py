import os
import json
import logging
from typing import Dict, Any, Tuple
from backend.models.action import ActionType, ActionLog, Capability
from backend.automation.permission_engine import PermissionEngine

logger = logging.getLogger("lifeos.executor")

class ComputerExecutor:
    """
    Sandboxed computer automation layer.
    Strictly forbids arbitrary shell execution.
    Executes controlled file, application, task, and workspace operations.
    """
    def __init__(self, workspace_root: str = "./lifeos_workspaces"):
        self.workspace_root = workspace_root
        os.makedirs(self.workspace_root, exist_ok=True)

    async def execute(self, action: ActionType, target: str, payload: Dict[str, Any] = None) -> Dict[str, Any]:
        payload = payload or {}
        logger.info(f"Executing {action} on target {target}")

        if action == ActionType.CREATE_FOLDER:
            folder_path = os.path.join(self.workspace_root, target)
            os.makedirs(folder_path, exist_ok=True)
            return {"status": "SUCCESS", "path": folder_path, "created": True}

        elif action == ActionType.CREATE_FILE:
            file_path = os.path.join(self.workspace_root, target)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            content = payload.get("content", "# LifeOS Workspace Document\n")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            return {"status": "SUCCESS", "path": file_path, "bytes_written": len(content)}

        elif action == ActionType.OPEN_FILE:
            file_path = os.path.join(self.workspace_root, target)
            exists = os.path.exists(file_path)
            return {"status": "SUCCESS" if exists else "NOT_FOUND", "path": file_path, "opened": exists}

        elif action == ActionType.PREPARE_WORKSPACE:
            # Prepares structured directory with README, draft solutions, and requirements
            ws_dir = os.path.join(self.workspace_root, target)
            os.makedirs(ws_dir, exist_ok=True)
            
            readme_path = os.path.join(ws_dir, "WORKSPACE.md")
            with open(readme_path, "w", encoding="utf-8") as f:
                f.write(f"# Workspace: {target}\n\n"
                        f"Prepared automatically by LifeOS AI.\n"
                        f"Status: Ready for work\n"
                        f"Subtasks:\n" + 
                        "\n".join([f"- [ ] {st}" for st in payload.get("subtasks", ["Part 1: Initial Setup", "Part 2: Core Implementation"])]))
            
            return {
                "status": "SUCCESS",
                "workspace_directory": ws_dir,
                "manifest": readme_path,
                "files_staged": ["WORKSPACE.md"]
            }

        elif action == ActionType.OPEN_APPLICATION:
            return {"status": "SUCCESS", "app": target, "state": "LAUNCHED_IN_BACKGROUND"}

        elif action == ActionType.DRAFT_ROUTINE_EMAIL:
            return {
                "status": "SUCCESS",
                "recipient": target,
                "subject": payload.get("subject", "Update on assignment"),
                "draft_body": payload.get("body", "Respected Professor, I will submit my assignment tonight. Thank you."),
                "mode": "SAVED_TO_DRAFTS"
            }

        elif action == ActionType.UPDATE_SCHEDULE:
            return {
                "status": "SUCCESS",
                "slot": target,
                "updated_plan": payload.get("plan", [])
            }

        elif action == ActionType.CREATE_TASK or action == ActionType.MODIFY_TASK:
            return {"status": "SUCCESS", "task": target, "payload": payload}

        return {"status": "UNKNOWN_ACTION", "action": action}
