import { useState, useEffect } from "react";

const QUESTIONS = [
  { id: "sector", text: "Dans quel secteur travaillez-vous ?", type: "choice", options: ["E-commerce", "SaaS / Tech", "Agence", "Consulting", "Industrie", "Autre"] },
  { id: "team_size", text: "Combien de personnes dans votre équipe ?", type: "choice", options: ["1 (solo)", "2–5", "6–20", "20+"] },
  { id: "pain_tasks", text: "Quelles tâches répétitives vous font perdre le plus de temps ?", type: "text", placeholder: "Ex : relances clients, tri d'emails, reporting..." },
  { id: "tools", text: "Quels outils utilisez-vous au quotidien ?", type: "text", placeholder: "Ex : Notion, Gmail, Slack, HubSpot, Airtable..." },
  { id: "frequency", text: "À quelle fréquence ces tâches sont-elles réalisées ?", type: "choice", options: ["Plusieurs fois par jour", "Quotidiennement", "Chaque semaine", "Ponctuellement"] },
  { id: "goal", text: "Quel est votre objectif principal ?", type: "choice", options: ["Gagner du temps", "Réduire les erreurs", "Scaler sans recruter", "Améliorer l'expérience client"] },
];

const S = {
  page: { minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", padding: "20px" },
  card: { background: "#0e0e1c", border: "1px solid #2a2a4a", borderRadius: "4px", padding: "48px 44px", width: "100%", maxWidth: "580px" },
  label: { color: "#5a5a8a", fontSize: "10px", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "28px", display: "block" },
  title: { color: "#e8e4ff", fontSize: "34px", fontWeight: "400", margin: "0 0 16px", lineHeight: "1.25", fontStyle: "italic" },
  subtitle: { color: "#4a4a6a", fontSize: "14px", lineHeight: "1.8", margin: "0 0 40px" },
  btn: { background: "transparent", color: "#a09aff", border: "1px solid #a09aff", padding: "12px 32px", borderRadius: "2px", fontSize: "13px", fontWeight: "700", cursor: "pointer", letterSpacing: "2px", textTransform: "uppercase", transition: "all 0.2s" },
  btnFilled: { background: "#a09aff", color: "#080810" },
  progressWrap: { display: "flex", gap: "4px", marginBottom: "40px" },
  progressDot: { flex: 1, height: "2px", background: "#1e1e3a", borderRadius: "2px", transition: "background 0.3s" },
  progressDotActive: { background: "#a09aff" },
  counter: { color: "#3a3a5a", fontSize: "11px", letterSpacing: "3px", marginBottom: "20px" },
  question: { color: "#e8e4ff", fontSize: "22px", fontWeight: "400", marginBottom: "32px", lineHeight: "1.5", fontStyle: "italic" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  choice: { background: "#0e0e1c", border: "1px solid #2a2a4a", borderRadius: "2px", padding: "14px 18px", color: "#8a84c8", fontSize: "14px", cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "'Georgia', serif" },
  textarea: { width: "100%", background: "#080810", border: "1px solid #2a2a4a", borderRadius: "2px", padding: "16px", color: "#e8e4ff", fontSize: "14px", resize: "none", outline: "none", fontFamily: "'Georgia', serif", lineHeight: "1.7", boxSizing: "border-box" },
  spinWrap: { textAlign: "center", padding: "40px 0" },
  spinner: { width: "32px", height: "32px", border: "1px solid #2a2a4a", borderTop: "1px solid #a09aff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" },
  loadText: { color: "#5a5a8a", fontSize: "13px", letterSpacing: "2px" },
  resultCard: { borderTop: "1px solid #1e1e3a", paddingTop: "24px", marginTop: "24px" },
  resultHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" },
  resultTitle: { color: "#e8e4ff", fontSize: "16px", fontWeight: "400", fontStyle: "italic", flex: 1, marginRight: "16px" },
  badge: { fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "2px", letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap" },
  desc: { color: "#6a648a", fontSize: "13px", lineHeight: "1.7", marginBottom: "14px" },
  metrics: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" },
  metric: { background: "#080810", border: "1px solid #1e1e3a", borderRadius: "2px", padding: "10px 12px" },
  metricLabel: { color: "#3a3a5a", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" },
  metricVal: { color: "#a09aff", fontSize: "14px", fontWeight: "700" },
  toolsRow: { display: "flex", flexWrap: "wrap", gap: "6px" },
  tool: { color: "#5a5a8a", fontSize: "11px", padding: "2px 8px", border: "1px solid #2a2a4a", borderRadius: "2px", letterSpacing: "1px" },
};

export default function WorkflowDiscovery() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [phase, setPhase] = useState("intro");
  const [results, setResults] = useState(null);
  const [dots, setDots] = useState("");
  const [hoveredChoice, setHoveredChoice] = useState(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = `@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } } .fade-up { animation: fadeUp 0.4s ease forwards; }`;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    const iv = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 500);
    analyze();
    return () => clearInterval(iv);
  }, [phase]);

  const q = QUESTIONS[current];

  function next(value) {
    const updated = { ...answers, [q.id]: value };
    setAnswers(updated);
    setInputValue("");
    if (current + 1 < QUESTIONS.length) setCurrent(current + 1);
    else { setPhase("loading"); }
  }

  async function analyze() {
    const a = answers;
    const prompt = `Tu es un expert en automatisation de workflows pour entreprises (N8n, Make, Zapier, Python).

Profil client :
- Secteur : ${a.sector}
- Taille équipe : ${a.team_size}
- Tâches chronophages : ${a.pain_tasks}
- Outils actuels : ${a.tools}
- Fréquence : ${a.frequency}
- Objectif : ${a.goal}

Génère exactement 4 automatisations très concrètes et chiffrées pour ce profil.
Pour chaque automatisation, estime précisément le temps gagné et l'argent économisé (base : 50€/h).

Réponds UNIQUEMENT en JSON valide, zéro markdown, zéro backtick :
{"automations":[{"title":"...","description":"Ce que ça fait exactement en 2 phrases.","tools":["Outil1","Outil2"],"time_saved_week":"Xh","money_saved_month":"X€","difficulty":"Facile","trigger":"Événement déclencheur précis","roi":"Délai de retour sur investissement"}]}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      let text = data.content[0].text.trim();
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);
      setResults(parsed.automations);
    } catch (e) {
      setResults([{ title: "Erreur de connexion", description: e.message, tools: [], time_saved_week: "-", money_saved_month: "-", difficulty: "—", trigger: "—", roi: "—" }]);
    }
    setPhase("results");
  }

  const diffStyle = {
    Facile: { background: "#0a1f0a", color: "#22c55e", border: "1px solid #22c55e33" },
    Moyen: { background: "#1f1500", color: "#f59e0b", border: "1px solid #f59e0b33" },
    Avancé: { background: "#1f0a0a", color: "#ef4444", border: "1px solid #ef444433" },
  };

  return (
    <div style={S.page}>
      <div style={S.card} className="fade-up">

        {phase === "intro" && (
          <div>
            <span style={S.label}>Workflow Discovery</span>
            <h1 style={S.title}>Quelles automatisations pouvez-vous mettre en place ?</h1>
            <p style={S.subtitle}>6 questions. Une analyse IA. Des économies chiffrées en temps et en argent.</p>
            <button style={S.btn} onClick={() => setPhase("questions")}
              onMouseEnter={e => Object.assign(e.target.style, S.btnFilled)}
              onMouseLeave={e => Object.assign(e.target.style, { background: "transparent", color: "#a09aff" })}>
              Commencer
            </button>
          </div>
        )}

        {phase === "questions" && (
          <div className="fade-up" key={current}>
            <div style={S.progressWrap}>
              {QUESTIONS.map((_, i) => (
                <div key={i} style={{ ...S.progressDot, ...(i <= current ? S.progressDotActive : {}) }} />
              ))}
            </div>
            <div style={S.counter}>{current + 1} / {QUESTIONS.length}</div>
            <h2 style={S.question}>{q.text}</h2>

            {q.type === "choice" && (
              <div style={S.grid}>
                {q.options.map((opt, i) => (
                  <button key={opt} style={{ ...S.choice, ...(hoveredChoice === i ? { borderColor: "#a09aff", color: "#e8e4ff" } : {}) }}
                    onClick={() => next(opt)}
                    onMouseEnter={() => setHoveredChoice(i)}
                    onMouseLeave={() => setHoveredChoice(null)}>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.type === "text" && (
              <div>
                <textarea style={S.textarea} placeholder={q.placeholder} value={inputValue} rows={3}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (inputValue.trim()) next(inputValue.trim()); } }} />
                <button style={{ ...S.btn, marginTop: 16 }} onClick={() => { if (inputValue.trim()) next(inputValue.trim()); }}>
                  Suivant →
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "loading" && (
          <div style={S.spinWrap}>
            <div style={S.spinner} />
            <div style={S.loadText}>ANALYSE EN COURS{dots}</div>
            <div style={{ ...S.loadText, marginTop: 8, fontSize: 11 }}>Calcul des économies potentielles</div>
          </div>
        )}

        {phase === "results" && results && (
          <div className="fade-up">
            <span style={S.label}>Résultats — {results.length} automatisations identifiées</span>
            <h2 style={{ ...S.title, fontSize: 26, marginBottom: 8 }}>Votre plan d'automatisation</h2>
            <p style={{ ...S.subtitle, marginBottom: 0 }}>
              Économies estimées :{" "}
              <span style={{ color: "#a09aff" }}>
                {results.reduce((acc, r) => {
                  const n = parseInt(r.money_saved_month);
                  return acc + (isNaN(n) ? 0 : n);
                }, 0)}€/mois
              </span>
              {" · "}
              <span style={{ color: "#a09aff" }}>
                {results.reduce((acc, r) => {
                  const n = parseFloat(r.time_saved_week);
                  return acc + (isNaN(n) ? 0 : n);
                }, 0)}h/semaine
              </span>
            </p>

            {results.map((item, i) => (
              <div key={i} style={S.resultCard}>
                <div style={S.resultHead}>
                  <span style={S.resultTitle}>{item.title}</span>
                  <span style={{ ...S.badge, ...(diffStyle[item.difficulty] || { background: "#1a1a2a", color: "#888" }) }}>{item.difficulty}</span>
                </div>
                <p style={S.desc}>{item.description}</p>
                <div style={S.metrics}>
                  <div style={S.metric}>
                    <div style={S.metricLabel}>Temps gagné</div>
                    <div style={S.metricVal}>{item.time_saved_week}</div>
                  </div>
                  <div style={S.metric}>
                    <div style={S.metricLabel}>Économie/mois</div>
                    <div style={S.metricVal}>{item.money_saved_month}</div>
                  </div>
                  <div style={S.metric}>
                    <div style={S.metricLabel}>ROI</div>
                    <div style={S.metricVal} style={{ color: "#22c55e", fontSize: 12 }}>{item.roi}</div>
                  </div>
                </div>
                <div style={{ ...S.desc, fontSize: 12, marginBottom: 12 }}>⚡ {item.trigger}</div>
                <div style={S.toolsRow}>{item.tools.map(t => <span key={t} style={S.tool}>{t}</span>)}</div>
              </div>
            ))}

            <button style={{ ...S.btn, marginTop: 36 }}
              onClick={() => { setCurrent(0); setAnswers({}); setResults(null); setPhase("intro"); }}>
              ↩ Recommencer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
