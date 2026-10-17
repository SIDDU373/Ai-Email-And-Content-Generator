from typing import Optional, List
from app.schemas.generate import EmailGenerateRequest, ContentGenerateRequest, ContentFormatType, ToneType, LengthType
from app.schemas.rewrite import RewriteRequest, RewriteActionType
from app.schemas.profile import WritingProfileSchema

TONE_DESCRIPTIONS = {
    ToneType.PROFESSIONAL: "Polished, competent, respectful, and workplace-appropriate without being stiff.",
    ToneType.FRIENDLY: "Warm, approachable, conversational, and collegial while remaining courteous.",
    ToneType.CONCISE: "Direct, punchy, high signal-to-noise ratio, eliminating all unnecessary filler.",
    ToneType.PERSUASIVE: "Compelling, benefit-focused, motivating, with a clear call-to-action.",
    ToneType.EMPATHETIC: "Understanding, considerate, attentive to the recipient's feelings and situation.",
    ToneType.CONFIDENT: "Decisive, clear, assertive without being aggressive, projecting certainty.",
    ToneType.FORMAL: "Traditional business etiquette, refined phrasing, strictly structured.",
    ToneType.CONVERSATIONAL: "Natural, speaking-voice rhythm, modern and casual yet appropriate."
}

LENGTH_DESCRIPTIONS = {
    LengthType.SHORT: "Under 100 words. Crisp, brief, immediate.",
    LengthType.BALANCED: "120-250 words. Complete yet easy to read quickly.",
    LengthType.DETAILED: "250-500 words. Thorough, fully articulated with full context and nuance."
}

def format_profile_instructions(profile: Optional[WritingProfileSchema]) -> str:
    if not profile or not profile.is_enabled:
        return ""

    instructions = ["\n[WRITING PROFILE PREFERENCES]"]
    if profile.default_tone:
        instructions.append(f"- Baseline tone preference: {profile.default_tone}")
    instructions.append(f"- Formality level: {profile.formality_level}/5")
    if profile.preferred_length:
        instructions.append(f"- Preferred length: {profile.preferred_length}")
    if profile.vocabulary_preferences:
        instructions.append(f"- Preferred vocabulary style: {profile.vocabulary_preferences}")
    if profile.formatting_preferences:
        instructions.append(f"- Preferred formatting style: {profile.formatting_preferences}")
    if profile.words_to_avoid:
        avoid_str = ", ".join(profile.words_to_avoid)
        instructions.append(f"- WORDS/PHRASES TO STRICTLY AVOID: {avoid_str}")
    if profile.style_examples:
        instructions.append("- Stylistic reference from user's prior writing:")
        for idx, ex in enumerate(profile.style_examples[:2], 1):
            instructions.append(f"  Example {idx}: \"{ex.strip()}\"")

    return "\n".join(instructions)

def build_email_prompts(req: EmailGenerateRequest, profile: Optional[WritingProfileSchema] = None):
    system_prompt = (
        "You are WriteFlow AI, an expert executive writing partner and master communicator.\n"
        "Your mission is to craft clear, elegant, and highly effective workplace emails.\n\n"
        "STRICT EDITORIAL RULES:\n"
        "1. Never invent facts, numbers, dates, attachments, or commitments that the user did not provide.\n"
        "2. If critical details are missing, use clear bracketed placeholders like [Insert Date], [Colleague Name], or [Link].\n"
        "3. Provide exactly one strong, relevant Subject line on the first line formatted as: 'Subject: <subject>'.\n"
        "4. Follow with the email body including greeting and appropriate sign-off.\n"
        "5. Avoid generic AI cliches such as 'I hope this email finds you well', 'Delve', 'Testament', 'In today's fast-paced world', or 'Please feel free to reach out'.\n"
        "6. Do not include meta-chatter, commentary, or pleasantries outside of the email itself."
    )

    user_parts = [
        f"CORE PURPOSE: {req.purpose}",
        f"USE CASE: {req.use_case.value.replace('_', ' ').title()}",
    ]

    if req.recipient:
        user_parts.append(f"RECIPIENT: {req.recipient}")
    if req.recipient_relationship:
        user_parts.append(f"RELATIONSHIP: {req.recipient_relationship}")
    if req.desired_outcome:
        user_parts.append(f"DESIRED OUTCOME: {req.desired_outcome}")
    if req.key_points:
        user_parts.append(f"KEY POINTS & NOTES:\n{req.key_points}")
    if req.constraints:
        user_parts.append(f"SPECIFIC CONSTRAINTS:\n{req.constraints}")

    user_parts.append(f"TARGET TONE: {req.tone.value} ({TONE_DESCRIPTIONS.get(req.tone, '')})")
    user_parts.append(f"TARGET LENGTH: {req.length.value} ({LENGTH_DESCRIPTIONS.get(req.length, '')})")

    if req.apply_profile and profile and profile.is_enabled:
        user_parts.append(format_profile_instructions(profile))

    user_parts.append("\nOutput the email now, beginning with 'Subject: '.")

    return system_prompt, "\n\n".join(user_parts)

def build_content_prompts(req: ContentGenerateRequest, target_format: ContentFormatType, profile: Optional[WritingProfileSchema] = None):
    system_prompt = (
        "You are WriteFlow AI, an elite editorial content writer.\n"
        "You transform source briefs into polished, audience-ready writing tailored to specific publication formats.\n"
        "RULES:\n"
        "1. Never fabricate unstated statistics, quotes, or commitments.\n"
        "2. Strictly follow the structural conventions of the requested format.\n"
        "3. Deliver clean, ready-to-publish or ready-to-edit copy with no conversational preamble or markdown code fences unless requested."
    )

    format_specs = {
        ContentFormatType.EMAIL: (
            "Format: Professional Email\n"
            "Structure: Subject line, polite greeting, clear context, concise key information, unambiguous call to action, professional closing."
        ),
        ContentFormatType.SOCIAL_POST: (
            "Format: Social Media Post (LinkedIn / X style)\n"
            "Structure: An arresting first-line hook, spaced readable paragraphs (1-2 sentences each), valuable insight or takeaway, engaging closing question or CTA, 2-3 targeted hashtags."
        ),
        ContentFormatType.BLOG_OUTLINE: (
            "Format: Blog Article Outline & Draft Framework\n"
            "Structure:\n"
            "- Catchy Working Title\n"
            "- Target Audience & Core Thesis\n"
            "- Key Headings (H2 / H3) with 2-3 concrete bullet points explaining what to cover\n"
            "- Key Takeaway / Conclusion"
        ),
        ContentFormatType.ANNOUNCEMENT: (
            "Format: Formal Announcement / Release Note\n"
            "Structure: Clear headline, executive summary paragraph, 'What's Changing / What's New', 'Why It Matters', 'Next Steps / Action Required', and support contact placeholder."
        ),
        ContentFormatType.SHORT_MESSAGE: (
            "Format: Short Direct Message (Slack / Teams / SMS)\n"
            "Structure: Extremely compact (40-80 words maximum), immediate point upfront, zero fluff, clear next step."
        )
    }

    user_parts = [
        f"SOURCE BRIEF:\n{req.brief}",
        f"REQUESTED FORMAT SPECIFICATION:\n{format_specs.get(target_format, '')}"
    ]

    if req.target_audience:
        user_parts.append(f"TARGET AUDIENCE: {req.target_audience}")
    if req.constraints:
        user_parts.append(f"CONSTRAINTS: {req.constraints}")

    user_parts.append(f"TONE: {req.tone.value} ({TONE_DESCRIPTIONS.get(req.tone, '')})")
    user_parts.append(f"LENGTH: {req.length.value} ({LENGTH_DESCRIPTIONS.get(req.length, '')})")

    if req.apply_profile and profile and profile.is_enabled:
        user_parts.append(format_profile_instructions(profile))

    user_parts.append("\nGenerate the complete output for this format now.")

    return system_prompt, "\n\n".join(user_parts)

def build_rewrite_prompts(req: RewriteRequest):
    system_prompt = (
        "You are WriteFlow AI's Precision Text Editor.\n"
        "Your task is to rewrite, improve, or re-tone the user's provided text.\n\n"
        "CRITICAL PRESERVATION DIRECTIVES:\n"
        "1. Strictly preserve all facts, numbers, dates, proper nouns, and core message from the original.\n"
        "2. Do not introduce new claims or promises not found in the original.\n"
        "3. Deliver the improved text directly without conversational intro/outro.\n"
        "4. Follow the requested edit action exactly."
    )

    action_instructions = {
        RewriteActionType.IMPROVE_CLARITY: "Enhance flow, remove ambiguity, eliminate awkward phrasing, and ensure crisp comprehension.",
        RewriteActionType.FIX_GRAMMAR: "Correct all spelling, punctuation, grammatical errors, and syntax awkwardness while keeping original voice intact.",
        RewriteActionType.SHORTEN: "Condense by 30-50%, cutting wordiness, redundancy, and passive voice while keeping every essential point.",
        RewriteActionType.EXPAND: "Elaborate with professional context, smoother transitions, and fuller phrasing without adding unsupported claims.",
        RewriteActionType.SIMPLIFY: "Convert complex jargon and convoluted sentences into accessible, plain English suitable for any reader.",
        RewriteActionType.MAKE_PROFESSIONAL: "Upgrade informal wording into polished, respectful executive-level business phrasing.",
        RewriteActionType.MAKE_FRIENDLY: "Inject collegial warmth, approachable phrasing, and positive energy while remaining polite.",
        RewriteActionType.MAKE_PERSUASIVE: "Sharpen the value proposition, use active verbs, and emphasize benefits and urgency.",
        RewriteActionType.CHANGE_TONE: f"Rewrite into a {req.target_tone.value if req.target_tone else 'professional'} tone ({TONE_DESCRIPTIONS.get(req.target_tone, '')})."
    }

    user_parts = [
        f"ACTION REQUIRED: {req.action.value} - {action_instructions.get(req.action, '')}",
    ]

    if req.custom_instruction:
        user_parts.append(f"ADDITIONAL USER INSTRUCTION: {req.custom_instruction}")

    user_parts.append(f"ORIGINAL TEXT:\n\"\"\"\n{req.text}\n\"\"\"")
    user_parts.append(
        "FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:\n"
        "SUMMARY_OF_CHANGES: <1-2 concise sentences summarizing edits made>\n"
        "REVISED_TEXT:\n<revised text here>"
    )

    return system_prompt, "\n\n".join(user_parts)

def build_prompt_enhance_prompts(raw_prompt: str, target_format: str = "email"):
    system_prompt = (
        "You are an AI Writing Task Architect. You decompose raw, messy, or underspecified user writing prompts into structured, comprehensive specifications.\n"
        "Extract or infer the optimal parameters without hallucinating arbitrary facts."
    )

    user_message = (
        f"Analyze this raw writing prompt for a {target_format}:\n\"\"\"\n{raw_prompt}\n\"\"\"\n\n"
        "Return a structured JSON object with the following keys:\n"
        "- objective: (string) core goal of the writing\n"
        "- audience: (string) primary recipient or reader\n"
        "- format: (string) format like email, memo, post\n"
        "- context: (string) background situation\n"
        "- tone: (string) recommended tone\n"
        "- length: (string) short, balanced, or detailed\n"
        "- required_points: (list of strings) key items to mention\n"
        "- restrictions: (list of strings) things to avoid or constraints"
    )

    return system_prompt, user_message
