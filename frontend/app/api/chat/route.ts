export async function POST(req: Request) {
  const body = await req.json();

  const messages = body.messages;
  const lastMessage = messages[messages.length - 1]?.content || "";

  const res = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: lastMessage }),
  });

  const data = await res.json();

  console.log("📩 Response from FastAPI:", data);

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
