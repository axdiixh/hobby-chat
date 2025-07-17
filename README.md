# 🧠 AI Hobby Suggestion Chatbot

An AI-powered chatbot built with **FastAPI**, **LangGraph**, **Ollama (Gemma3)**, and **Next.js + Shadcn**.  
It chats with users, collects their interests, dislikes, and lifestyle preferences, then uses a local LLM to recommend personalized hobbies.

---

## 🛠 How to Run Locally

### 🖥️ Frontend (Next.js + Shadcn)

To run the frontend locally:

```bash
# Step 1: Install dependencies
npm install

# If you get peer dependency issues, use:
npm install --legacy-peer-deps

# Step 2: Run the development server
npm run dev

```

### 📦 Backend (FastAPI + LangGraph + Gemma via Ollama)

1. **Python dependencies install کرو**

```bash
pip install fastapi uvicorn pydantic langgraph httpx

# Make sure Gemma is running locally:
ollama run gemma:3b

# Start the backend server
uvicorn main:app --reload

```

### EXPLAINATION

LangGraph handles conversation flow using defined nodes and edges — similar to a state machine.

| Node Name       | Description                                   |
| --------------- | --------------------------------------------- |
| `ask_interests` | Asks the user what they like                  |
| `ask_dislikes`  | Asks the user what they dislike               |
| `ask_lifestyle` | Asks about the user’s lifestyle               |
| `suggest`       | Suggests hobbies based on the collected input |

Each node either sends a prompt to the user or generates a model-based response based on the current state.

The graph flow is defined like this in graph.py:

graph.add_edge("ask_interests", "ask_dislikes")
graph.add_edge("ask_dislikes", "ask_lifestyle")
graph.add_edge("ask_lifestyle", "suggest")

graph.set_entry_point("ask_interests")
graph.set_finish_point("suggest")

So the chatbot flow goes:
➡️ ask_interests → ask_dislikes → ask_lifestyle → suggest

### How Hobby Suggestions Are Generated

Here’s how the user’s input becomes a personalized suggestion:

User Input: The user sends a message (e.g. "I like books and quiet evenings").

Preference Parsing: The parse_preferences() function extracts structured info:

{
"likes": ["books"],
"dislikes": [],
"lifestyle": "quiet"
}

LangGraph Streams the State: The graph walks through each node step-by-step, asking what’s missing (likes → dislikes → lifestyle).

Suggestion Node Triggers Gemma3: The final node uses the complete state and prompts the Gemma3 model via Ollama to return hobby ideas.

AI Response Returned: The model responds with something like:

Based on your quiet lifestyle and interest in books, you might enjoy:

- Journaling
- Reading fiction
- Gardening
- Painting
  Frontend Displays Suggestion: The result is shown to the user in the chat UI.
