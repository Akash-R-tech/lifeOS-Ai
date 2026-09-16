import os
from typing import List, Dict, Any

class FilesIntegration:
    """Safe local filesystem observer for project directories and assignments."""
    def __init__(self, watch_path: str = "./workspace"):
        self.watch_path = watch_path
        os.makedirs(self.watch_path, exist_ok=True)

    def list_project_files(self) -> List[str]:
        if not os.path.exists(self.watch_path):
            return []
        return os.listdir(self.watch_path)
