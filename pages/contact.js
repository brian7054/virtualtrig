// pages/contact.js
import { useState } from "react";

export default function Contact() {
  const [status, setStatus] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    setStatus("Sending…");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setStatus(res.ok ? "Sent!" : "Failed to send");
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold">Contact us</h1>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input name="name" className="w-full border rounded-xl px-3 py-2" placeholder="Your name" required />
          <input name="email" type="email" className="w-full border rounded-xl px-3 py-2" placeholder="you@email.com" required />
          <textarea name="message" rows="5" className="w-full border rounded-xl px-3 py-2" placeholder="How can we help?" required />
          <button className="rounded-xl bg-black text-white px-4 py-2">Send</button>
        </form>
        {status && <p className="mt-2 text-sm">{status}</p>}
      </div>
    </main>
  );
}
