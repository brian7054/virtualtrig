import { useEffect, useState } from "react";

export default function Support() {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetch("/api/contact-status")
      .then((r) => r.json())
      .then((d) => setReady(Boolean(d?.ready)))
      .catch(() => setReady(false));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setPreviewUrl("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    setOk(res.ok);
    setLoading(false);
    if (json.previewUrl) setPreviewUrl(json.previewUrl);
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight mb-3">Contact Support</h1>

        {!ready && (
          <div className="mb-6 rounded-xl border bg-yellow-50 p-4">
            <p className="text-yellow-900">
              Email service is being activated. In the meantime, please email us directly:
              {" "}
              <a className="underline" href="mailto:support@VIRTUALtrig.com?subject=Support%20Request">
                support@VIRTUALtrig.com
              </a>
            </p>
          </div>
        )}

        {ready ? (
          <form onSubmit={onSubmit} className="space-y-3">
            <input name="honeypot" className="hidden" tabIndex={-1} autoComplete="off" />
            <input name="name" placeholder="Your name" className="w-full border rounded-xl px-3 py-2" required />
            <input name="email" type="email" placeholder="Your email" className="w-full border rounded-xl px-3 py-2" required />
            <textarea name="message" placeholder="How can we help?" className="w-full border rounded-xl px-3 py-2 min-h-[120px]" required />
            <button disabled={loading} className="px-4 py-2 rounded-xl bg-black text-white">
              {loading ? "Sending..." : "Send"}
            </button>
            {ok === true && <p className="text-green-600">Thanks! We’ll be in touch soon.</p>}
            {ok === false && <p className="text-red-600">Something went wrong. Try again.</p>}
            {previewUrl && (
              <p className="text-sm text-gray-600">
                (Dev only) Preview email:{" "}
                <a className="underline" href={previewUrl} target="_blank" rel="noreferrer">{previewUrl}</a>
              </p>
            )}
          </form>
        ) : (
          <div className="text-gray-700">
            <p className="mb-2">Or fill this out and we’ll reply from our inbox:</p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3 opacity-60 pointer-events-none">
              <input placeholder="Your name" className="w-full border rounded-xl px-3 py-2" />
              <input type="email" placeholder="Your email" className="w-full border rounded-xl px-3 py-2" />
              <textarea placeholder="How can we help?" className="w-full border rounded-xl px-3 py-2 min-h-[120px]" />
              <button className="px-4 py-2 rounded-xl bg-black text-white">Send</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
