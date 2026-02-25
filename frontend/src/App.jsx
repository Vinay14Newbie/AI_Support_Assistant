import { useEffect, useState } from "react";

function App() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]); // { role, content, created_at }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // initialize session id from localStorage or create new
  useEffect(() => {
    let id = localStorage.getItem("sessionId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sessionId", id);
    }
    setSessionId(id);
  }, []);

  // load conversation history when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadHistory();
    }
  }, [sessionId]);

  async function loadHistory() {
    try {
      const res = await fetch(`/api/conversations/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        console.error("Failed to load history, status", res.status);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    }
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = {
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: input }),
      });
      if (!res.ok) {
        console.error("Chat request failed", res.status);
        throw new Error("Network response was not ok");
      }
      const data = await res.json();
      const botMsg = {
        role: "assistant",
        content: data.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Error: could not get reply.",
          created_at: new Date().toISOString(),
        },
      ]);
      console.error(err);
    }

    setLoading(false);
    setInput("");
  }

  function handleNewChat() {
    const newId = crypto.randomUUID();
    localStorage.setItem("sessionId", newId);
    setSessionId(newId);
    setMessages([]);
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <h1 className="text-lg font-bold">AI Support Assistant</h1>
        <button
          onClick={handleNewChat}
          className="bg-white text-blue-600 px-3 py-1 rounded"
        >
          New Chat
        </button>
      </header>
      <main className="flex-1 overflow-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${
              m.role === "assistant" ? "text-left" : "text-right"
            }`}
          >
            <div
              className={`inline-block px-3 py-2 rounded ${
                m.role === "assistant"
                  ? "bg-gray-200"
                  : "bg-blue-500 text-white"
              }`}
            >
              {m.content}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(m.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {loading && <div className="text-center text-gray-500">Typing...</div>}
      </main>
      <footer className="p-4 bg-white flex">
        <input
          className="flex-1 border rounded px-3 py-2 mr-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </footer>
    </div>
  );
}

export default App;
