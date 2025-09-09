import { useState } from "react";

export default function Contact() {
  const [ok, setOk] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true); setOk(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setOk(res.ok); setLoading(false);
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-semibold mb-3">Contact Support</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input name="honeypot" className="hidden" tabIndex={-1} autoComplete="off" />
          <input name="name" placeholder="Your name" className="w-full border rounded-xl px-3 py-2" required />
          <input name="email" type="email" placeholder="Your email" className="w-full border rounded-xl px-3 py-2" required />
          <textarea name="message" placeholder="How can we help?" className="w-full border rounded-xl px-3 py-2 min-h-[120px]" required />
          <button disabled={loading} className="px-4 py-2 rounded-xl bg-black text-white">
            {loading ? "Sending..." : "Send"}
          </button>
          {ok === true && <p className="text-green-600">Thanks! We’ll be in touch.</p>}
          {ok === false && <p className="text-red-600">Something went wrong. Try again.</p>}
        </form>
      </div>
    </main>
  );
}