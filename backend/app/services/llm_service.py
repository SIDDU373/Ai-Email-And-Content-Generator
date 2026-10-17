import re
import json
import logging
from typing import List, Optional, Tuple, Dict, Any
import httpx
from fastapi import HTTPException

from app.config import settings
from app.schemas.generate import (
    EmailGenerateRequest,
    EmailGenerateResponse,
    EmailVariation,
    ContentGenerateRequest,
    ContentGenerateResponse,
    ContentItemResponse,
    ContentFormatType,
    EnhancePromptRequest,
    EnhancePromptResponse,
    EnhancedPromptSpec,
    ToneType
)
from app.schemas.rewrite import RewriteRequest, RewriteResponse, RewriteActionType
from app.schemas.profile import WritingProfileSchema
from app.services.prompts import (
    build_email_prompts,
    build_content_prompts,
    build_rewrite_prompts,
    build_prompt_enhance_prompts
)

logger = logging.getLogger("writeflow.llm")
logging.basicConfig(level=logging.INFO)

class LLMService:
    def __init__(self):
        self.api_key = settings.NVIDIA_API_KEY
        self.base_url = settings.NVIDIA_BASE_URL.rstrip("/")
        self.timeout = settings.LLM_TIMEOUT_SECONDS

    @property
    def model(self) -> str:
        return settings.NVIDIA_MODEL

    async def _call_nvidia_api(self, system_prompt: str, user_prompt: str, temperature: float = 0.5, model: Optional[str] = None) -> str:
        """Call the official NVIDIA hosted chat completions API."""
        if not settings.has_nvidia_credentials:
            raise HTTPException(
                status_code=503,
                detail="NVIDIA API key not configured. Add NVIDIA_API_KEY to your backend .env file or enable mock mode."
            )

        target_model = model or self.model
        headers = {
            "Authorization": f"Bearer {settings.NVIDIA_API_KEY.strip()}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        payload = {
            "model": target_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "max_tokens": settings.LLM_MAX_TOKENS,
            "top_p": 0.95
        }

        endpoint = f"{self.base_url}/chat/completions"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(endpoint, headers=headers, json=payload)
            except httpx.TimeoutException:
                logger.error("Timeout connecting to NVIDIA API")
                raise HTTPException(status_code=504, detail="Request to NVIDIA LLM API timed out. Please try again.")
            except httpx.RequestError as exc:
                logger.error(f"Network error connecting to NVIDIA API: {exc}")
                raise HTTPException(status_code=502, detail="Failed to connect to NVIDIA API service.")

            if response.status_code == 401:
                logger.error("NVIDIA API 401 Unauthorized: Invalid API key")
                raise HTTPException(status_code=401, detail="Invalid NVIDIA API key. Please check your credentials.")
            elif response.status_code == 403:
                logger.error("NVIDIA API 403 Forbidden")
                raise HTTPException(status_code=403, detail="Forbidden. Your NVIDIA account may lack permission for this model.")
            elif response.status_code == 429:
                logger.warning("NVIDIA API 429 Rate limited")
                raise HTTPException(status_code=429, detail="NVIDIA API rate limit exceeded. Please wait a moment and try again.")
            elif response.status_code >= 500:
                logger.error(f"NVIDIA API {response.status_code} upstream error")
                raise HTTPException(status_code=502, detail=f"NVIDIA API upstream error ({response.status_code}).")
            elif response.status_code != 200:
                logger.error(f"NVIDIA API error: {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"LLM provider error: {response.text}")

            data = response.json()
            try:
                content = data["choices"][0]["message"]["content"]
                return content.strip()
            except (KeyError, IndexError) as exc:
                logger.error(f"Unexpected response schema from NVIDIA API: {data}")
                raise HTTPException(status_code=502, detail="Unexpected response structure from NVIDIA LLM provider.")

    def _parse_email_output(self, raw_text: str) -> Tuple[str, str]:
        """Extract subject and body from the model output."""
        lines = raw_text.splitlines()
        subject = "Untitled Email"
        body_lines = []
        subject_found = False

        for i, line in enumerate(lines):
            stripped = line.strip()
            if not subject_found and stripped.lower().startswith("subject:"):
                subject = stripped[8:].strip()
                subject_found = True
            else:
                body_lines.append(line)

        body = "\n".join(body_lines).strip()
        # Clean any leading blank lines or leftover separator
        if body.startswith("---"):
            body = body.lstrip("- \n")
        return subject, body or raw_text

    async def generate_email(self, req: EmailGenerateRequest, profile: Optional[WritingProfileSchema] = None) -> EmailGenerateResponse:
        system_prompt, user_prompt = build_email_prompts(req, profile)

        if settings.has_nvidia_credentials:
            try:
                raw_text = await self._call_nvidia_api(system_prompt, user_prompt, temperature=settings.LLM_TEMPERATURE)
                subject, body = self._parse_email_output(raw_text)

                variations: List[EmailVariation] = []
                if req.num_variations > 1:
                    for v_idx in range(2, req.num_variations + 1):
                        v_raw = await self._call_nvidia_api(system_prompt, user_prompt, temperature=min(0.85, settings.LLM_TEMPERATURE + 0.2 * (v_idx - 1)))
                        v_sub, v_body = self._parse_email_output(v_raw)
                        variations.append(EmailVariation(
                            variant_id=v_idx,
                            label=f"Variation {v_idx}",
                            subject=v_sub,
                            body=v_body
                        ))

                return EmailGenerateResponse(
                    subject=subject,
                    body=body,
                    variations=variations,
                    model_used=self.model,
                    is_mock=False
                )
            except Exception as e:
                logger.warning(f"Live NVIDIA call failed or timed out: {e}")
                if not settings.ALLOW_MOCK_FALLBACK:
                    raise

        if not settings.ALLOW_MOCK_FALLBACK:
            raise HTTPException(
                status_code=503,
                detail="NVIDIA API key is required. Set NVIDIA_API_KEY in your environment or enable mock fallback."
            )

        # Context-aware mock generator for seamless offline evaluation
        mock_subject = f"[{req.use_case.value.replace('_', ' ').title()}] {req.purpose.strip()[:60]}"
        salutation = f"Hi {req.recipient}," if req.recipient else "Hello,"
        
        body_points = f"- {req.key_points}" if req.key_points else "- Reviewing our upcoming milestones and next steps."
        closing_signoff = "Best regards,\n[Your Name]"
        if req.tone == ToneType.CONVERSATIONAL or req.tone == ToneType.FRIENDLY:
            closing_signoff = "Warmly,\n[Your Name]"
        elif req.tone == ToneType.FORMAL:
            closing_signoff = "Sincerely,\n[Your Name]\n[Your Title]"

        mock_body = (
            f"{salutation}\n\n"
            f"I am writing regarding {req.purpose.lower().rstrip('.')}.\n\n"
            f"{body_points}\n\n"
            f"Desired outcome: {req.desired_outcome if req.desired_outcome else 'Please let me know if you have any questions or how you would like to proceed.'}\n\n"
            f"{closing_signoff}"
        )

        variations = []
        if req.num_variations > 1:
            for v_idx in range(2, req.num_variations + 1):
                variations.append(EmailVariation(
                    variant_id=v_idx,
                    label=f"Alternative {v_idx}",
                    subject=f"Update: {req.purpose.strip()[:50]}",
                    body=(
                        f"{salutation}\n\n"
                        f"Quick touchpoint on {req.purpose.lower().rstrip('.')}.\n\n"
                        f"Key detail: {req.key_points or 'Please review the attached details.'}\n\n"
                        f"Looking forward to your thoughts.\n\n"
                        f"{closing_signoff}"
                    )
                ))

        return EmailGenerateResponse(
            subject=mock_subject,
            body=mock_body,
            variations=variations,
            model_used=f"{self.model} (Preview Mock Mode)",
            is_mock=True
        )

    async def generate_content(self, req: ContentGenerateRequest, profile: Optional[WritingProfileSchema] = None) -> ContentGenerateResponse:
        items: List[ContentItemResponse] = []

        for fmt in req.formats:
            system_prompt, user_prompt = build_content_prompts(req, fmt, profile)
            generated_live = False

            if settings.has_nvidia_credentials:
                try:
                    content_text = await self._call_nvidia_api(system_prompt, user_prompt, temperature=0.6)
                    title = f"{fmt.value.replace('_', ' ').title()}: {req.brief[:50]}"
                    items.append(ContentItemResponse(
                        format=fmt,
                        title=title,
                        content=content_text
                    ))
                    generated_live = True
                except Exception as e:
                    logger.warning(f"Live NVIDIA call failed for format {fmt}: {e}")
                    if not settings.ALLOW_MOCK_FALLBACK:
                        raise

            if not generated_live:
                if not settings.ALLOW_MOCK_FALLBACK:
                    raise HTTPException(status_code=503, detail="NVIDIA API key required.")
                
                # High quality mock content tailored per format
                if fmt == ContentFormatType.EMAIL:
                    c_title = f"Email: {req.brief[:40]}"
                    c_body = f"Subject: Important Update: {req.brief[:50]}\n\nHello Team,\n\nHere is the latest update regarding our initiative: {req.brief}.\n\nKey takeaways:\n1. Execution is on schedule.\n2. Cross-team collaboration remains vital.\n\nPlease share your feedback by Friday.\n\nBest,\n[Your Name]"
                elif fmt == ContentFormatType.SOCIAL_POST:
                    c_title = f"Social Post: {req.brief[:40]}"
                    c_body = f"Big milestones deserve focused execution.\n\nHere is what we are seeing with {req.brief[:70]}:\n\n- Consistency compounds over time\n- Clear communication eliminates friction\n\nWhat has been your team's biggest writing breakthrough this quarter?\n\n#Productivity #Writing #Leadership"
                elif fmt == ContentFormatType.BLOG_OUTLINE:
                    c_title = f"Article Outline: {req.brief[:40]}"
                    c_body = f"# Blueprint: Mastering {req.brief[:50]}\n\n## 1. Introduction & Context\n- The modern landscape and friction points\n- Why conventional methods fall short\n\n## 2. Core Strategy & Framework\n- Foundational principles\n- Step-by-step implementation guide\n\n## 3. Real-World Applications\n- Case studies and measurable impact\n\n## 4. Conclusion & Key Takeaway\n- Action checklist for getting started today"
                elif fmt == ContentFormatType.ANNOUNCEMENT:
                    c_title = f"Announcement: {req.brief[:40]}"
                    c_body = f"### ANNOUNCEMENT: {req.brief[:60]}\n\nWe are excited to share a key update regarding {req.brief}.\n\n**What is changing:**\nWe are introducing improved workflows designed to save time and enhance quality.\n\n**What this means for you:**\nNo action is needed immediately; full documentation will be available at [Link].\n\nThank you for your continued partnership."
                else: # SHORT_MESSAGE
                    c_title = f"Direct Message: {req.brief[:40]}"
                    c_body = f"Hey everyone — quick heads up regarding {req.brief[:60]}. Please take a moment to review and let me know if you have questions before tomorrow's sync."

                items.append(ContentItemResponse(
                    format=fmt,
                    title=c_title,
                    content=c_body
                ))

        return ContentGenerateResponse(
            items=items,
            model_used=self.model,
            is_mock=not any(items)
        )

    async def rewrite_text(self, req: RewriteRequest) -> RewriteResponse:
        system_prompt, user_prompt = build_rewrite_prompts(req)

        if settings.has_nvidia_credentials:
            try:
                output = await self._call_nvidia_api(system_prompt, user_prompt, temperature=0.3)
                summary = "Text refined according to requested directives."
                revised = output

                if "SUMMARY_OF_CHANGES:" in output and "REVISED_TEXT:" in output:
                    parts = output.split("REVISED_TEXT:")
                    summary_part = parts[0].replace("SUMMARY_OF_CHANGES:", "").strip()
                    if summary_part:
                        summary = summary_part
                    revised = parts[1].strip()

                return RewriteResponse(
                    original_text=req.text,
                    revised_text=revised,
                    action=req.action,
                    target_tone=req.target_tone,
                    summary_of_changes=summary,
                    model_used=self.model,
                    is_mock=False
                )
            except Exception as e:
                logger.warning(f"Live NVIDIA call failed in rewrite: {e}")
                if not settings.ALLOW_MOCK_FALLBACK:
                    raise

        if not settings.ALLOW_MOCK_FALLBACK:
            raise HTTPException(status_code=503, detail="NVIDIA API key required.")

        # Deterministic transformation for mock mode
        action = req.action
        text = req.text.strip()
        summary = ""
        revised = text

        if action == RewriteActionType.IMPROVE_CLARITY:
            summary = "Streamlined sentence structure and removed ambiguous transitions."
            revised = f"In clear terms: {text}"
        elif action == RewriteActionType.FIX_GRAMMAR:
            summary = "Corrected punctuation, syntax agreement, and phrasing polish."
            revised = text[0].upper() + text[1:] if text else text
            if not revised.endswith("."):
                revised += "."
        elif action == RewriteActionType.SHORTEN:
            summary = "Cut redundant wording and tightened phrasing by 35%."
            words = text.split()
            revised = " ".join(words[:max(5, int(len(words) * 0.65))])
            if not revised.endswith("."):
                revised += "."
        elif action == RewriteActionType.EXPAND:
            summary = "Added thorough explanatory context and refined bridge transitions."
            revised = f"{text}\n\nFurthermore, this ensures comprehensive alignment across all stakeholders, leaving no ambiguities unresolved."
        elif action == RewriteActionType.SIMPLIFY:
            summary = "Translated complex or formal terms into direct, everyday plain English."
            revised = f"To put it simply: {text}"
        elif action == RewriteActionType.MAKE_PROFESSIONAL:
            summary = "Elevated tone to executive-ready business standard."
            revised = f"I would like to respectfully note: {text}"
        elif action == RewriteActionType.MAKE_FRIENDLY:
            summary = "Infused warm, collegiate warmth and positive interpersonal tone."
            revised = f"Great to connect! Just wanted to share: {text} Hope you're having a wonderful week!"
        elif action == RewriteActionType.MAKE_PERSUASIVE:
            summary = "Sharpened call to action and emphasized concrete value."
            revised = f"By taking action now, {text.lower()} — maximizing our collective efficiency and outcomes."
        elif action == RewriteActionType.CHANGE_TONE:
            tone_name = req.target_tone.value if req.target_tone else "professional"
            summary = f"Adapted voice and stylistic vocabulary to sound distinctly {tone_name}."
            revised = f"[{tone_name.capitalize()} style] {text}"

        return RewriteResponse(
            original_text=req.text,
            revised_text=revised,
            action=req.action,
            target_tone=req.target_tone,
            summary_of_changes=summary,
            model_used=f"{self.model} (Preview Mock Mode)",
            is_mock=True
        )

    async def enhance_prompt(self, req: EnhancePromptRequest) -> EnhancePromptResponse:
        system_prompt, user_prompt = build_prompt_enhance_prompts(req.raw_prompt, req.target_format or "email")

        if settings.has_nvidia_credentials:
            try:
                raw_output = await self._call_nvidia_api(system_prompt, user_prompt, temperature=0.2)
                try:
                    match = re.search(r"\{.*\}", raw_output, re.DOTALL)
                    parsed = json.loads(match.group(0)) if match else json.loads(raw_output)

                    spec = EnhancedPromptSpec(
                        objective=parsed.get("objective", "Draft message"),
                        audience=parsed.get("audience", "Relevant recipient"),
                        format=parsed.get("format", req.target_format or "email"),
                        context=parsed.get("context", "Workplace correspondence"),
                        tone=parsed.get("tone", "Professional"),
                        length=parsed.get("length", "Balanced"),
                        required_points=parsed.get("required_points", []),
                        restrictions=parsed.get("restrictions", [])
                    )
                except Exception as e:
                    logger.warning(f"Could not parse enhance prompt JSON: {e}")
                    spec = EnhancedPromptSpec(
                        objective=req.raw_prompt[:80],
                        audience="Target stakeholder",
                        format=req.target_format or "email",
                        context=req.raw_prompt,
                        tone="Professional",
                        length="Balanced",
                        required_points=[req.raw_prompt],
                        restrictions=["Do not make unsupported factual commitments"]
                    )

                enhanced_prompt = (
                    f"Write a {spec.tone.lower()} {spec.format} for {spec.audience}. "
                    f"Objective: {spec.objective}. "
                    f"Context: {spec.context}. "
                    f"Length: {spec.length}."
                )

                return EnhancePromptResponse(
                    enhanced_prompt=enhanced_prompt,
                    spec=spec,
                    model_used=self.model,
                    is_mock=False
                )
            except Exception as e:
                logger.warning(f"Live NVIDIA call failed in enhance_prompt: {e}")
                if not settings.ALLOW_MOCK_FALLBACK:
                    raise

        if not settings.ALLOW_MOCK_FALLBACK:
            raise HTTPException(status_code=503, detail="NVIDIA API key required.")

        spec = EnhancedPromptSpec(
            objective=f"Communicate clearly regarding: {req.raw_prompt[:60]}",
            audience="Colleague / Client",
            format=req.target_format or "email",
            context="Professional workplace correspondence",
            tone="Professional",
            length="Balanced",
            required_points=[req.raw_prompt],
            restrictions=["Avoid vague promises", "Stick to verified facts"]
        )

        return EnhancePromptResponse(
            enhanced_prompt=f"Draft a clear, balanced {req.target_format or 'email'} to communicate: {req.raw_prompt}. Emphasize next steps and maintain a professional tone.",
            spec=spec,
            model_used=f"{self.model} (Preview Mock Mode)",
            is_mock=True
        )

llm_service = LLMService()
