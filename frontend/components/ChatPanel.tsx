'use client';

import { useEffect, useRef, useState } from 'react';

interface Msg {
  role: 'user' | 'ai';
  text: string;
}

export default function ChatPanel({
  open,
  seed,
  onToggle,
  statsLabel,
}: {
  open: boolean;
  seed: string;
  onToggle: () => void;
  statsLabel: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open && seed && seededRef.current !== seed) {
      seededRef.current = seed;
      setInput(seed);
    }
  }, [open, seed]);

  async function send(question: string) {
    if (!question.trim() || loading) return;
    const history = messages.slice(-6);
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: res.ok
            ? data.answer
            : `⚠️ ${data.message || 'Server AI bermasalah.'}`,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: '⚠️ Gagal menghubungi server AI.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[92vw] max-w-sm h-[500px] bg-chalk border-2 border-ink shadow-hardLg flex flex-col overflow-hidden animate-fadeUp">
          <div className="bg-ink text-chalk px-4 py-3 flex items-center gap-3 border-b-2 border-ink">
            <span className="w-9 h-9 bg-grass border-2 border-chalk flex items-center justify-center text-lg">
              🎙️
            </span>
            <div>
              <p className="font-display text-sm uppercase">Komentator AI</p>
              <p className="font-mono text-[10px] text-card">{statsLabel}</p>
            </div>
            <button
              onClick={onToggle}
              aria-label="Tutup chat"
              className="ml-auto font-mono hover:text-card transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 text-sm bg-paper">
            <div className="chat-bubble-ai">
              Selamat datang di ruang siaran! 🎙️ Tanyakan apa saja:
              <br />• <em>&quot;Siapa pelatih Real Madrid?&quot;</em>
              <br />• <em>&quot;Stadion terbesar di Jerman?&quot;</em>
              <br />• <em>&quot;Bandingkan Persija dan Persib&quot;</em>
            </div>
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
                }
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble-ai font-mono">
                <span className="typing-dot">●</span>
                <span className="typing-dot">●</span>
                <span className="typing-dot">●</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <form
            className="p-3 border-t-2 border-ink flex gap-2 bg-chalk"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              placeholder="Tanya seputar dataset…"
              className="flex-1 bg-paper border-2 border-ink px-3 py-2 text-sm placeholder-ink/40 outline-none"
            />
            <button
              className="bg-grass text-chalk font-display px-4 border-2 border-ink shadow-hardSm hover:bg-ink transition-colors active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              aria-label="Kirim"
            >
              ➤
            </button>
          </form>
        </div>
      )}
      <button
        onClick={onToggle}
        aria-label="Buka chat AI"
        className="w-14 h-14 bg-card border-2 border-ink shadow-hard text-2xl hover:bg-grass transition-colors active:translate-x-0.5 active:translate-y-0.5 active:shadow-hardSm flex items-center justify-center"
      >
        🎙️
      </button>
    </div>
  );
}
