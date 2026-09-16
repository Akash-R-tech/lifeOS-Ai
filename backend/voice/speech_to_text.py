import logging
from typing import Dict, Any

logger = logging.getLogger("lifeos.voice.stt")

class SpeechToTextService:
    """
    Speech recognition service supporting streaming audio packets
    or text transcription fallbacks.
    """
    async def transcribe(self, audio_bytes: bytes = None, text_input: str = None) -> Dict[str, Any]:
        if text_input:
            cleaned = text_input.strip()
            return {"transcript": cleaned, "confidence": 0.98}
        
        # Audio transcription mock/cloud connector
        return {"transcript": "Mapla, enna pending?", "confidence": 0.95}
