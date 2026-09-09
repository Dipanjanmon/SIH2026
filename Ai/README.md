# 🤖 SmartBot — WhatsApp AI Agent

বাংলা + হিন্দি + ইংরেজি সাপোর্টেড স্মার্ট AI চ্যাটবট।

## সেটআপ

### ১. Gemini API Key নাও (ফ্রি)
- https://aistudio.google.com/apikey
- "Create API Key" এ ক্লিক করো
- Key কপি করো

### ২. config.py এ Key বসাও
```python
GEMINI_API_KEY = "তোমার_key_এখানে"
```

### ৩. ইনস্টল করো
```bash
pip install -r requirements.txt
```

### ৪. সার্ভার চালাও
```bash
python server.py
```

## WhatsApp এ কানেক্ট করো

WhatsApp agent থেকে POST পাঠাও:
```
POST http://localhost:5000/webhook
Body: {"from": "user_number", "body": "হ্যালো, তুমি কেমন আছো?"}
```

## কমান্ড

| কমান্ড | কাজ |
|---|---|
| যেকোনো মেসেজ | AI উত্তর দেবে |
| `/clear` বা `/নতুন` | চ্যাট হিস্ট্রি মুছো |
| `/help` বা `/সাহায্য` | কমান্ড লিস্ট দেখো |

## ফোল্ডার স্ট্রাকচার
```
AI/
├── config.py          ← API Key ও System Prompt
├── chat.py            ← AI Chat Engine
├── server.py          ← Flask Webhook Server
├── requirements.txt   ← Dependencies
└── README.md          ← এই ফাইল
```
