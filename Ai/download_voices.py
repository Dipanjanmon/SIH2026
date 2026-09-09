import asyncio
import edge_tts

VOICES = {
    "male_bn": ("bn-IN-BashkarNeural", 1.0, 0.0, "শোনো ভাই, আমি এখন তোমার সাথে মানুষের মতো কথা বলবো। বলো, কোন সমস্যায় সাহায্য করতে পারি?"),
    "female_bn": ("bn-IN-TanishaaNeural", 1.0, 0.0, "ভালো আছো তো? আমি তোমার সাথে মিষ্টি করে কথা বলবো। বলো, আজ তোমার জন্য কী করতে পারি?"),
    "male_hi": ("hi-IN-MadhurNeural", 1.0, 0.0, "सुनो भाई, मैं अब तुम्हारे साथ इंसान की तरह बात करूंगा। बताओ, किस चीज़ में मदद कर सकता हूं?"),
    "female_hi": ("hi-IN-SwaraNeural", 1.0, 0.0, "नमस्ते दोस्त! मैं प्यार से बात करती हूं। बताओ, आज मैं तुम्हारे लिए क्या कर सकती हूं?"),
    "male_en": ("en-IN-PrabhatNeural", 1.0, 0.0, "Hey, I'm here to talk with you like a real human. Tell me, how can I help you today?"),
    "female_en": ("en-IN-NeerjaNeural", 1.0, 0.0, "Hello! I'm so glad you're here. Tell me, what can I do for you today?"),
}

async def generate():
    for name, (voice, rate, pitch, text) in VOICES.items():
        out = rf"C:\Users\Aniketh\Desktop\whatsapp-agent\AI\voices\{name}.mp3"
        tts = edge_tts.Communicate(text, voice=voice)
        await tts.save(out)
        print("OK:", name, "->", out)

asyncio.run(generate())