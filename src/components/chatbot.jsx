import { useState } from "react";
import { BACKEND_BASE_URL } from "../lib/backend";

export default function Chatbot({ userId = 1 }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userId }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "user", content: input },
        { role: "assistant", content: data.reply },
      ]);
      setInput("");
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Server unreachable. Check backend." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 rounded-lg bg-white shadow-md w-full max-w-md border border-gray-200 flex flex-col">
      <h2 className="text-xl font-bold mb-3 text-blue-700">💬 MoneyMind Assistant</h2>

      <div className="flex-1 overflow-y-auto mb-3 h-80 border rounded p-2 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`my-1 p-2 rounded-lg ${
            msg.role === "user" ? "bg-blue-100 self-end text-right" : "bg-green-100 self-start"
          }`}>
            <b>{msg.role === "user" ? "You:" : "AI:"}</b> {msg.content}
          </div>
        ))}
        {loading && <p className="text-gray-500 italic">Thinking...</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something like 'Can I buy shoes?'"
          className="flex-1 border p-2 rounded focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
