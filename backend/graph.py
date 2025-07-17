from langgraph.graph import StateGraph
from typing import TypedDict, List
from prompts import call_ollama

class ConversationState(TypedDict, total=False):
    likes: List[str]
    dislikes: List[str]
    lifestyle: str
    message: str  # Optional but needed to return
    type: str

# Each step will pass the state to the model via prompt

def suggest(state: ConversationState) -> ConversationState:
    print("🔮 Calling suggest with state:", state)
    prompt = f"""
You are a hobby recommendation bot.

Based on these preferences:
- Likes: {state['likes']}
- Dislikes: {state['dislikes']}
- Lifestyle: {state['lifestyle']}

Suggest hobbies they might enjoy. Return just the response as if you were chatting.
"""
    suggestion = call_ollama(prompt)
    print("📤 Suggestion from model:", suggestion)

    # Return updated state with embedded message
    return {
        **state,
        "message": suggestion,
        "type": "suggestion"
    }


builder = StateGraph(ConversationState)

# Build the flow: Start → Ask interests → Ask dislikes → Ask lifestyle → Suggest
builder.add_node("ask_interests", lambda s: {"message": "What are some things you like?"})
builder.add_node("ask_dislikes", lambda s: {"message": "What do you dislike?"})
builder.add_node("ask_lifestyle", lambda s: {"message": "Tell me a bit about your lifestyle."})
builder.add_node("suggest", suggest)

builder.set_entry_point("ask_interests")
builder.add_edge("ask_interests", "ask_dislikes")
builder.add_edge("ask_dislikes", "ask_lifestyle")
builder.add_edge("ask_lifestyle", "suggest")

graph = builder.compile()
