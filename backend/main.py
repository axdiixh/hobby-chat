from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from graph import graph
from prompts import parse_preferences

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    user_input = req.message
    parsed_data = parse_preferences(user_input)

    events = graph.stream(parsed_data)
    final_output = None

    for idx, step in enumerate(events):
        print(f"🧱 Step {idx+1}: {step}")
        final_output = step

    print("✅ Final LangGraph result:", final_output)

    # Handle nested LangGraph result like {'suggest': {...}}
    if isinstance(final_output, dict):
        inner = list(final_output.values())[0]
        if isinstance(inner, dict) and "message" in inner:
            return {
                "type": inner.get("type", "suggestion"),
                "message": inner["message"]
            }

    return {
        "type": "fallback",
        "message": "Could not generate a suggestion.",
        "state": final_output
    }

