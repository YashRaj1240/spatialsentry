import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import META_MODEL_API_KEY, META_API_BASE_URL, MOCK_MODE
from app.models import mock_engine

logger = logging.getLogger("meta_client")

class MetaModelClient:
    def __init__(self):
        self.api_key = META_MODEL_API_KEY
        self.base_url = META_API_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        """Calls Meta Model API Muse Voice Transcribe or fallback mock"""
        if MOCK_MODE or not self.api_key or self.api_key.startswith("your_"):
            return mock_engine.mock_transcribe_audio(audio_bytes)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                files = {"file": (filename, audio_bytes, "audio/wav")}
                headers = {"Authorization": f"Bearer {self.api_key}"}
                response = await client.post(
                    f"{self.base_url}/audio/transcriptions",
                    headers=headers,
                    files=files,
                    data={"model": "muse-voice-transcribe"}
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("text", "")
                else:
                    logger.warning(f"Meta Voice API returned {response.status_code}: {response.text}")
                    return mock_engine.mock_transcribe_audio(audio_bytes)
        except Exception as e:
            logger.error(f"Error calling Muse Voice Transcribe: {e}")
            return mock_engine.mock_transcribe_audio(audio_bytes)

    async def segment_frame(self, image_bytes: bytes, prompt: Optional[str] = None) -> List[Dict[str, Any]]:
        """Calls Meta Model API SAM 3.1 (Segment Anything) or fallback mock"""
        if MOCK_MODE or not self.api_key or self.api_key.startswith("your_"):
            return mock_engine.mock_segment_anything(image_bytes, target_label=prompt)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                payload = {
                    "model": "sam-3-1",
                    "prompt": prompt or "foreground objects, keys, phone, wallet, tools",
                    "return_polygon": True
                }
                response = await client.post(
                    f"{self.base_url}/models/sam-3-1/predict",
                    headers=self.headers,
                    json=payload
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("segments", [])
                else:
                    logger.warning(f"SAM 3.1 API returned {response.status_code}: {response.text}")
                    return mock_engine.mock_segment_anything(image_bytes, target_label=prompt)
        except Exception as e:
            logger.error(f"Error calling SAM 3.1: {e}")
            return mock_engine.mock_segment_anything(image_bytes, target_label=prompt)

    async def reason_spatial_query(self, query: str, candidate_memories: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calls Muse Spark via Chat Completions endpoint to reason over temporal memory graph"""
        if MOCK_MODE or not self.api_key or self.api_key.startswith("your_"):
            return mock_engine.mock_muse_spark_reasoning(query, candidate_memories)

        try:
            system_prompt = (
                "You are SpatialSentry, an ephemeral spatial-temporal memory intelligence and 24/7 AI smartphone bodyguard. "
                "Analyze the user's spoken question and the list of observed memories or security incidents (with timestamps, locations, and bounding boxes). "
                "Identify the exact target object or incident the user is asking about, explain where and when it was observed, "
                "and return your decision strictly as a JSON object with keys: "
                "found (boolean), target_object (string), location_context (string), last_seen_timestamp (string), "
                "confidence (float 0-1), explanation (string)."
            )
            
            user_content = json.dumps({
                "user_query": query,
                "candidate_memories": candidate_memories[:10]
            })

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": "muse-spark",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_content}
                        ],
                        "temperature": 0.2,
                        "response_format": {"type": "json_object"}
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)
                else:
                    logger.warning(f"Muse Spark API returned {response.status_code}: {response.text}")
                    return mock_engine.mock_muse_spark_reasoning(query, candidate_memories)
        except Exception as e:
            logger.error(f"Error calling Muse Spark: {e}")
            return mock_engine.mock_muse_spark_reasoning(query, candidate_memories)

# Global singleton
meta_client = MetaModelClient()
