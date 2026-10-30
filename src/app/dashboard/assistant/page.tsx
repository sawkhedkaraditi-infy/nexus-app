'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/client';
import type { AssistantAnswer } from '@/lib/types';
import { Icon } from '@/components/Icon';

interface Msg {
  role: 'user' | 'bot';
  text: string;
  sources?: AssistantAnswer['sources'];
}

const SUGGESTIONS = [
  'When is a project marked At Risk?',
  'What does loan eligibility depend on?',
  'When does a plant raise a warning alert?',
  'How do I book a site visit?',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'bot', text: 'Hi! I answer questions from a small set of dummy documents (project handbook, safety policy, loan FAQ, energy guide, realty FAQ). Citations are shown under each answer.' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function ask(question: string) {
    const text = question.trim();
    if (text.length < 3 || busy) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setBusy(true);
    try {
      const res = await api<AssistantAnswer>('/api/assistant', { method: 'POST', body: JSON.stringify({ question: text }) });
      setMessages((m) => [...m, { role: 'bot', text: res.answer, sources: res.sources }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'bot', text: e instanceof Error ? e.message : 'Something went wrong.' }]);
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Smart Assistant <span className="tag">Add-on</span></h1>
          <p className="muted">Keyword retrieval over documents stored in the database. It is a stepping stone toward embeddings and an LLM.</p>
        </div>
      </div>

      <div className="chat card">
        <div className="chat-log">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="bubble">{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <ul className="sources">
                  {m.sources.map((s, j) => (
                    <li key={j}><b>[{j + 1}] {s.doc}</b> <span className="muted">relevance {s.score}</span></li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {busy && <div className="msg bot"><div className="bubble typing"><i /><i /><i /></div></div>}
          <div ref={endRef} />
        </div>

        <div className="chips">
          {SUGGESTIONS.map((s) => <button key={s} className="chip" onClick={() => ask(s)}>{s}</button>)}
        </div>

        <form className="chat-input" onSubmit={submit}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question…" maxLength={300} />
          <button className="btn primary" disabled={busy || input.trim().length < 3}><Icon name="send" size={16} /> Send</button>
        </form>
      </div>
    </div>
  );
}
