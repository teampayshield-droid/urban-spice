"use client";
import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { MenuItemDTO } from "@/types";

export default function DishGuide({ items }: { items: MenuItemDTO[] }) {
  const [open, setOpen] = useState(false);
  const [menuItemId, setMenuItemId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);
  async function ask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() || pending) return;
    setPending(true);
    setAnswer("");
    try {
      const response = await fetch("/api/menu/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId, question }),
      });
      const data = await response.json();
      setAnswer(response.ok ? data.answer : data.error || "I couldn’t get dish details just now.");
    } catch {
      setAnswer("I couldn’t connect to the dish guide. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {open && (
        <section className="fixed bottom-40 right-4 z-40 flex max-h-[min(70vh,34rem)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-white/10 bg-charcoal-900 shadow-2xl shadow-black/50" aria-label="Menu guide">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="font-semibold">Menu guide</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close dish guide" className="rounded-md p-1 text-white/60 hover:text-white"><X size={18} /></button>
          </header>
          <div className="space-y-3 overflow-y-auto p-4">
            <label className="block text-xs text-white/60">Optional dish
              <select value={menuItemId} onChange={(event) => { setMenuItemId(event.target.value); setAnswer(""); }} className="mt-1 w-full rounded-lg border border-white/10 bg-charcoal-800 px-3 py-2 text-sm text-white">
                <option value="">Ask about the whole menu</option>
                {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            {answer && <p aria-live="polite" className="rounded-lg bg-white/5 p-3 text-sm leading-relaxed text-white/80">{answer}</p>}
          </div>
          <form onSubmit={ask} className="flex gap-2 border-t border-white/10 p-3">
            <input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={500} placeholder="Ask anything about the menu" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-charcoal-800 px-3 py-2 text-sm text-white placeholder:text-white/35" />
            <button type="submit" disabled={!question.trim() || pending} aria-label="Ask about menu" className="rounded-lg gold-gradient px-3 text-charcoal-950 disabled:opacity-50"><Send size={16} /></button>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="fixed bottom-24 right-4 z-40 inline-flex items-center gap-2 rounded-full gold-gradient px-4 py-3 text-sm font-semibold text-charcoal-950 shadow-lg shadow-black/30">
        <MessageCircle size={17} /> Menu guide
      </button>
    </>
  );
}