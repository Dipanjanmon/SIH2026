import google.generativeai as genai
from config import GEMINI_API_KEY, MODEL_NAME, get_system_prompt

genai.configure(api_key=GEMINI_API_KEY)

_models = {}
chat_sessions = {}


def _get_model(tone="male"):
    m = _models.get(tone)
    if m is None:
        m = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=get_system_prompt(tone),
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                top_p=0.9,
                top_k=40,
                max_output_tokens=1024,
            ),
        )
        _models[tone] = m
    return m


def get_chat(user_id: str, tone="male"):
    key = (user_id, tone)
    if key not in chat_sessions:
        chat_sessions[key] = _get_model(tone).start_chat(history=[])
    return chat_sessions[key]


def clear_history(user_id: str):
    for k in [k for k in chat_sessions if k[0] == user_id]:
        del chat_sessions[k]


async def generate_reply(user_id: str, message: str, tone: str = "male") -> str:
    try:
        chat = get_chat(user_id, tone)
        response = await chat.send_message_async(message)
        return response.text
    except Exception as e:
        clear_history(user_id)
        return f"⚠️ কিছু সমস্যা হয়েছে। আবার চেষ্টা করো।\n({e})"