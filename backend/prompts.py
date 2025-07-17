import requests
import json
import re

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma3"

def call_ollama(prompt: str) -> str:
    response = requests.post(OLLAMA_URL, json={
        "model": MODEL,
        "prompt": prompt,
        "stream": False
    })
    return response.json()["response"].strip()

def parse_preferences(user_input: str) -> dict:
    prompt = f"""
You are an AI that extracts structured preferences from user messages.

Given this message: "{user_input}"

Extract:
- likes (things they enjoy)
- dislikes (things they hate)
- lifestyle (1-2 words about their life)

Return JSON ONLY:
{{
  "likes": [...],
  "dislikes": [...],
  "lifestyle": "..."
}}
"""
    raw_output = call_ollama(prompt)

    try:
        json_str = re.search(r"{.*}", raw_output, re.DOTALL).group(0)
        return json.loads(json_str)
    except:
        return {"likes": [], "dislikes": [], "lifestyle": ""}
