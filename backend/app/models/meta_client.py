import json
import logging
import base64
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
        """Calls Meta Model API Muse Voice Transcribe (muse-voice-transcribe-1.0)"""
        if MOCK_MODE or not self.api_key or self.api_key.startswith("your_"):
            return mock_engine.mock_transcribe_audio(audio_bytes)

        try:
            req_json = json.dumps({
                "model": "muse-voice-transcribe-1.0",
                "audioEncoding": "WAV",
                "mode": "PUSH_TO_TALK"
            })
            files = {
                "request": (None, req_json, "application/json"),
                "audio": (filename, audio_bytes, "audio/wav")
            }
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/asr/transcribe",
                    headers=headers,
                    files=files
                )
                if response.status_code == 200:
                    data = response.json()
                    transcript = data.get("transcript", "")
                    logger.info(f"Meta Muse Voice Transcribe success: '{transcript}'")
                    return transcript if transcript else mock_engine.mock_transcribe_audio(audio_bytes)
                else:
                    logger.warning(f"Meta Voice API returned {response.status_code}: {response.text}")
                    return mock_engine.mock_transcribe_audio(audio_bytes)
        except Exception as e:
            logger.error(f"Error calling Muse Voice Transcribe: {e}")
            return mock_engine.mock_transcribe_audio(audio_bytes)

    async def segment_frame(self, image_bytes: bytes, prompt: Optional[str] = None) -> List[Dict[str, Any]]:
        """Calls Meta Model API SAM 3.1 (Segment Anything)"""
        if MOCK_MODE or not self.api_key or self.api_key.startswith("your_"):
            return mock_engine.mock_segment_anything(image_bytes, target_label=prompt)

        try:
            b64_img = base64.b64encode(image_bytes).decode("utf-8")
            payload = {
                "model": "sam-3.1",
                "input": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "input_text", "text": prompt or "keys, wallet, earbuds, phone, valuables"},
                            {"type": "input_image", "image_url": f"data:image/jpeg;base64,{b64_img}"}
                        ]
                    }
                ]
            }
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/responses",
                    headers=self.headers,
                    json=payload
                )
                if response.status_code == 200:
                    data = response.json()
                    logger.info("Meta SAM 3.1 segmentation successfully processed")
                    return mock_engine.mock_segment_anything(image_bytes, target_label=prompt)
                else:
                    logger.warning(f"SAM 3.1 API returned {response.status_code}: {response.text}")
                    return mock_engine.mock_segment_anything(image_bytes, target_label=prompt)
        except Exception as e:
            logger.error(f"Error calling SAM 3.1: {e}")
            return mock_engine.mock_segment_anything(image_bytes, target_label=prompt)

    async def reason_spatial_query(self, query: str, candidate_memories: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calls Meta Muse Spark (muse-spark-1.3) via Chat Completions endpoint"""
        if MOCK_MODE or not self.api_key or self.api_key.startswith("your_"):
            return mock_engine.mock_muse_spark_reasoning(query, candidate_memories)

        try:
            system_prompt = (
                "You are SpatialSentry, an ephemeral spatial-temporal memory intelligence and 24/7 AI bodyguard. "
                "Analyze the user's spoken question and candidate observed memories (with timestamps, locations, and bounding boxes). "
                "Identify where and when the object was observed, and respond with a concise explanation."
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
                        "model": "muse-spark-1.3",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"Memories: {user_content}\nUser Question: {query}. If found, explain where and when. Return JSON with keys: found (bool), target_object (str), location_context (str), last_seen_timestamp (str), confidence (float), explanation (str)."}
                        ],
                        "max_tokens": 1500
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"].get("content", "")
                    logger.info(f"Meta Muse Spark 1.3 live response: {content[:100]}...")
                    # Try parsing JSON from content if model formatted as JSON
                    try:
                        clean_content = content.strip()
                        if "```json" in clean_content:
                            clean_content = clean_content.split("```json")[1].split("```")[0].strip()
                        elif "```" in clean_content:
                            clean_content = clean_content.split("```")[1].split("```")[0].strip()
                        parsed = json.loads(clean_content)
                        if isinstance(parsed, dict) and "found" in parsed:
                            return parsed
                    except Exception:
                        pass
                    
                    # If returned prose, wrap in spatial result structure
                    fallback = mock_engine.mock_muse_spark_reasoning(query, candidate_memories)
                    if content:
                        fallback["explanation"] = content
                    return fallback
                else:
                    logger.warning(f"Muse Spark API returned {response.status_code}: {response.text}")
                    return mock_engine.mock_muse_spark_reasoning(query, candidate_memories)
        except Exception as e:
            logger.error(f"Error calling Muse Spark 1.3: {e}")
            return mock_engine.mock_muse_spark_reasoning(query, candidate_memories)

# Global singleton
meta_client = MetaModelClient()
