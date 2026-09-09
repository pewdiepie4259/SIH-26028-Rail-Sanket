from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import os
import json
import httpx


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_explanation(self, context_payload: Dict[str, Any]) -> Dict[str, str]:
        """
        Receives deterministic ETA, delay, and conflict data and generates:
        1. Natural language delay explanation
        2. Actionable dispatch recommendation
        """
        pass


class RuleBasedMockLLMProvider(BaseLLMProvider):
    """Zero-cost local deterministic fallback for development and testing."""

    async def generate_explanation(self, context_payload: Dict[str, Any]) -> Dict[str, str]:
        train_num = context_payload.get("train_number", "Unknown")
        target_station = context_payload.get("target_station", "Unknown")
        delay = context_payload.get("predicted_delay_minutes", 0.0)
        conflicts = context_payload.get("conflicts", [])

        explanation = (
            f"Train {train_num} is projected to arrive at {target_station} with a delay of {delay} minutes. "
            f"Primary delay causes include headway compression and section transit bottlenecks."
        )

        if conflicts:
            conf_details = conflicts[0]
            recommendation = (
                f"High headway conflict detected at {conf_details.get('station_code')} with Train "
                f"{conf_details.get('conflicting_train_number')}. Recommendation: {conf_details.get('recommended_action')}."
            )
        else:
            recommendation = f"Maintain standard track clearance. No imminent platform or block conflicts detected."

        return {
            "explanation": explanation,
            "recommendation": recommendation,
            "provider": "MOCK_DETERMINISTIC"
        }


class GeminiLLMProvider(BaseLLMProvider):
    """Google Gemini integration via REST API."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-1.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model = model
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

    async def generate_explanation(self, context_payload: Dict[str, Any]) -> Dict[str, str]:
        if not self.api_key:
            return await RuleBasedMockLLMProvider().generate_explanation(context_payload)

        prompt = (
            "You are an expert Indian Railways Section Controller Copilot for the Bengaluru division.\n"
            "Analyze this structured delay and propagation forecast and respond strictly in JSON with two keys: "
            "'explanation' (concise natural explanation of why the train is delayed) and 'recommendation' (dispatch actions for controllers).\n\n"
            f"Context:\n{json.dumps(context_payload, indent=2)}"
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"}
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(self.endpoint, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text)
                return {
                    "explanation": parsed.get("explanation", ""),
                    "recommendation": parsed.get("recommendation", ""),
                    "provider": "GEMINI"
                }
            return await RuleBasedMockLLMProvider().generate_explanation(context_payload)


def get_llm_provider() -> BaseLLMProvider:
    provider_name = os.getenv("LLM_PROVIDER", "MOCK").upper()
    if provider_name == "GEMINI" and os.getenv("GEMINI_API_KEY"):
        return GeminiLLMProvider()
    return RuleBasedMockLLMProvider()