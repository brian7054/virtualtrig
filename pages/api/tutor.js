// pages/api/tutor.js
export default async function handler(req, res) {
  if (req.method === "GET") return res.status(200).json({ ok: true });

  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const { skill, problem, answer, userMessage, mode } = req.body || {};
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const sys = [
    "You are a patient trig tutor.",
    "Use short Socratic hints first; reveal answers only after 1–2 nudges if the student asks.",
    "Key reminders: deg↔rad via π/180, x=r cosθ, y=r sinθ, r=√(x²+y²), θ=atan2(y,x), SOH-CAH-TOA, identity basics.",
  ].join(" ");

  const context = `Skill: ${skill}\nProblem: ${JSON.stringify(problem)}\nStudentAnswer: ${answer || "(none)"}\nMode: ${mode || "chat"}`;

  // Friendly fallback if the key is missing
  if (!OPENAI_API_KEY) {
    const fallback =
      mode === "hint"
        ? "Think definitions first: deg→rad multiply by π/180; polar→rect uses x=r cosθ, y=r sinθ; rect→polar uses r=√(x²+y²), θ=atan2(y,x)."
        : "AI tutor isn’t connected yet. Which definition fits here?";
    return res.status(200).json({ answer: fallback, offline: true });
  }

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 400,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: context },
          ...(userMessage ? [{ role: "user", content: userMessage }] : []),
        ],
      }),
    });

    const json = await r.json();
    const answerText = json?.choices?.[0]?.message?.content || "I couldn’t form a hint right now.";
    return res.status(200).json({ answer: answerText });
  } catch (e) {
    console.error(e);
    return res.status(200).json({
      answer:
        "AI tutor had trouble responding. Use the built-in hint: start from the definition and draw a quick diagram.",
      offline: true,
    });
  }
}
