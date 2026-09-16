from typing import Set, Dict, Any, Tuple
from backend.models.action import ActionType, Capability

class PermissionEngine:
    """
    Capability-based access control engine.
    Enforces that every action maps to a granted capability.
    Blocks irreversible actions until user confirms.
    """
    # Mapping actions to required capabilities
    ACTION_CAPABILITY_MAP: Dict[ActionType, Capability] = {
        ActionType.OPEN_FILE: Capability.READ_FILES,
        ActionType.CREATE_FILE: Capability.CREATE_FILES,
        ActionType.MODIFY_FILE: Capability.MODIFY_FILES,
        ActionType.CREATE_FOLDER: Capability.CREATE_FILES,
        ActionType.OPEN_APPLICATION: Capability.OPEN_APPLICATIONS,
        ActionType.PREPARE_WORKSPACE: Capability.CREATE_FILES,
        ActionType.CREATE_TASK: Capability.CREATE_TASKS,
        ActionType.MODIFY_TASK: Capability.MODIFY_TASKS,
        ActionType.UPDATE_SCHEDULE: Capability.CREATE_CALENDAR_EVENT,
        ActionType.DRAFT_ROUTINE_EMAIL: Capability.SEND_EMAIL,
        ActionType.VOICE_NOTIFY: Capability.VOICE_CONTROL,
    }

    # Irreversible or critical actions requiring explicit human confirmation
    IRREVERSIBLE_ACTIONS = {
        "FINAL_ACADEMIC_SUBMISSION",
        "DELETE_FILE",
        "DELETE_ACCOUNT",
        "FINANCIAL_TRANSACTION",
        "SENSITIVE_EMAIL_SEND",
    }

    def __init__(self, granted_capabilities: Set[Capability] = None):
        self.granted_capabilities: Set[Capability] = granted_capabilities or {
            Capability.READ_EMAIL,
            Capability.READ_EMAIL_ATTACHMENTS,
            Capability.READ_CALENDAR,
            Capability.CREATE_CALENDAR_EVENT,
            Capability.READ_FILES,
            Capability.CREATE_FILES,
            Capability.MODIFY_FILES,
            Capability.OPEN_APPLICATIONS,
            Capability.VOICE_CONTROL,
            Capability.READ_CLASSROOM,
            Capability.CREATE_TASKS,
            Capability.MODIFY_TASKS,
            Capability.AUTOMATIC_REMINDERS,
            Capability.AI_ASSIGNMENT_ASSISTANCE,
        }
        self.emergency_stop_active: bool = False

    def check_permission(self, action: ActionType, target: str, payload: Dict[str, Any] = None) -> Tuple[bool, str]:
        if self.emergency_stop_active:
            return False, "BLOCKED_BY_EMERGENCY_STOP: System actions are frozen."

        # Check for irreversible tags
        if payload and payload.get("is_final_submission"):
            return False, "REQUIRES_USER_CONFIRMATION: Academic safety rule prevents autonomous final submissions."
            
        if payload and payload.get("is_irreversible"):
            return False, "REQUIRES_USER_CONFIRMATION: High-impact action requires manual authorization."

        required_cap = self.ACTION_CAPABILITY_MAP.get(action)
        if not required_cap:
            return False, f"UNRECOGNIZED_ACTION: {action} has no security mapping."

        if required_cap not in self.granted_capabilities:
            return False, f"PERMISSION_DENIED: Capability {required_cap.value} not granted."

        return True, "AUTHORIZED"

    def grant_capability(self, cap: Capability):
        self.granted_capabilities.add(cap)

    def revoke_capability(self, cap: Capability):
        self.granted_capabilities.discard(cap)

    def set_emergency_stop(self, active: bool):
        self.emergency_stop_active = active
