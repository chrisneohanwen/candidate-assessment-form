import { useState } from "react";

const ANTHROPIC_API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;
const GMAIL_MCP_URL = "https://gmailmcp.googleapis.com/mcp/v1";
const HR_EMAIL = "chrisn.office.hr@gmail.com";

const SECTIONS = ["Personal Particulars", "Educational Background", "Work Experience", "Aptitude Assessment", "Personality Assessment"];
const likertOptions = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
const ratingOptions = [1, 2, 3, 4, 5];

const inp = { base: { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13, color: "#1e293b", background: "#f8fafc", boxSizing: "border-box", outline: "none" } };

function Input({ type = "text", value, onChange, placeholder, min }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} style={inp.base} />;
}
function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inp.base, resize: "vertical" }} />;
}
function Select({ value, onChange, options, placeholder }) {
  return <select value={value} onChange={e => onChange(e.target.value)} style={inp.base}><option value="">{placeholder || "Select..."}</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>;
}
function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#1e293b", marginBottom: 5 }}>{label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}</label>
      {hint && <div style={{ fontSize: 11, color: "#64748b", marginBottom: 5 }}>{hint}</div>}
      {children}
    </div>
  );
}
function ProgressBar({ current, total }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        {SECTIONS.map((s, i) => <span key={i} style={{ fontSize: 10, fontWeight: i === current ? 700 : 400, color: i <= current ? "#1e40af" : "#94a3b8", flex: 1, textAlign: "center" }}>{s}</span>)}
      </div>
      <div style={{ height: 6, background: "#e2e8f0", borderRadius: 99 }}>
        <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#1e40af,#3b82f6)", width: `${((current + 1) / total) * 100}%`, transition: "width 0.4s" }} />
      </div>
      <div style={{ textAlign: "right", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Step {current + 1} of {total}</div>
    </div>
  );
}
function Likert({ value, onChange, question }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, marginBottom: 10 }}>{question}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {likertOptions.map((opt, i) => (
          <button key={i} onClick={() => onChange(opt)} style={{ padding: "7px 13px", borderRadius: 20, border: "1.5px solid", borderColor: value === opt ? "#1e40af" : "#cbd5e1", background: value === opt ? "#1e40af" : "#f8fafc", color: value === opt ? "#fff" : "#475569", fontSize: 12, cursor: "pointer", fontWeight: value === opt ? 600 : 400 }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}
function RatingRow({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, marginBottom: 7 }}>{label}</div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>Low</span>
        {ratingOptions.map(n => (
          <button key={n} onClick={() => onChange(n)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid", borderColor: value === n ? "#1e40af" : "#cbd5e1", background: value === n ? "#1e40af" : "#f8fafc", color: value === n ? "#fff" : "#475569", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{n}</button>
        ))}
        <span style={{ fontSize: 11, color: "#94a3b8" }}>High</span>
      </div>
    </div>
  );
}

const discSets = [
  { id: "d1", words: [{ w: "Decisive", t: "D" }, { w: "Inspiring", t: "I" }, { w: "Supportive", t: "S" }, { w: "Careful", t: "C" }] },
  { id: "d2", words: [{ w: "Results-driven", t: "D" }, { w: "Enthusiastic", t: "I" }, { w: "Patient", t: "S" }, { w: "Analytical", t: "C" }] },
  { id: "d3", words: [{ w: "Direct", t: "D" }, { w: "Optimistic", t: "I" }, { w: "Reliable", t: "S" }, { w: "Systematic", t: "C" }] },
  { id: "d4", words: [{ w: "Competitive", t: "D" }, { w: "Persuasive", t: "I" }, { w: "Collaborative", t: "S" }, { w: "Precise", t: "C" }] },
  { id: "d5", words: [{ w: "Bold", t: "D" }, { w: "Sociable", t: "I" }, { w: "Steady", t: "S" }, { w: "Thorough", t: "C" }] },
  { id: "d6", words: [{ w: "Assertive", t: "D" }, { w: "Expressive", t: "I" }, { w: "Harmonious", t: "S" }, { w: "Methodical", t: "C" }] },
];

const enneagramTypes = [
  { num: 1, label: "The Reformer", stmt: "I have a strong sense of right and wrong and feel compelled to improve things around me. I hold myself and others to high standards." },
  { num: 2, label: "The Helper", stmt: "I am attuned to others' needs and feel most fulfilled when I am genuinely helping or supporting the people around me." },
  { num: 3, label: "The Achiever", stmt: "I am driven to succeed and be seen as competent. I adapt quickly to what's needed and am motivated by accomplishment and recognition." },
  { num: 4, label: "The Individualist", stmt: "I value authenticity and depth. I often feel different from others and am drawn to meaningful, creative, or emotionally rich experiences." },
  { num: 5, label: "The Investigator", stmt: "I prefer to observe and analyse before acting. I value knowledge and privacy, and feel most capable when I am well-prepared." },
  { num: 6, label: "The Loyalist", stmt: "I am alert to risks and value security and trust. I am a dependable team member who thinks through what could go wrong before committing." },
  { num: 7, label: "The Enthusiast", stmt: "I am energised by new ideas, experiences, and possibilities. I am optimistic and prefer to keep things moving and exciting." },
  { num: 8, label: "The Challenger", stmt: "I am confident, direct, and protective of those I care about. I take charge naturally and am not afraid of confrontation or hard decisions." },
  { num: 9, label: "The Peacemaker", stmt: "I value harmony and tend to see all sides of a situation. I am easy-going and work well with others, though I may avoid conflict." },
];

function computeDisc(disc) {
  const scores = { D: 0, I: 0, S: 0, C: 0 };
  Object.values(disc).forEach(set => {
    if (set.mostType) scores[set.mostType]++;
    if (set.leastType) scores[set.leastType]--;
  });
  return scores;
}

function topEnneagram(enneagram) {
  return Object.entries(enneagram).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([num, score]) => ({ num: parseInt(num), label: enneagramTypes.find(t => t.num === parseInt(num))?.label, score }));
}

async function generateAssessment(candidate, disc, enneagram) {
  const discScores = computeDisc(disc);
  const dominantDisc = Object.entries(discScores).sort((a, b) => b[1] - a[1])[0][0];
  const topEnn = topEnneagram(enneagram);
  const prompt = `You are an expert talent assessor evaluating a candidate for a client-facing role. Assess the following and provide a structured JSON evaluation.

CANDIDATE: ${candidate.fullName}
EXPERIENCE: ${candidate.totalYears} | Current: ${candidate.currentRole} at ${candidate.currentCompany}

--- APTITUDE (Likert) ---
Proactive prospecting: ${candidate.likert1}
Resilience under rejection: ${candidate.likert2}
Self-driven learning: ${candidate.likert3}
Problem ownership: ${candidate.likert4}
Energised by difficult prospects: ${candidate.likert5}
Accountability: ${candidate.likert6}

--- SITUATIONAL ---
Q1 (Client Sourcing): ${candidate.scenario1}
Q2 (Resilience): ${candidate.scenario2}
Q3 (Ownership): ${candidate.scenario3}

--- SELF-RATINGS (1-5) ---
Prospecting: ${candidate.ratingProspecting}/5 | Resilience: ${candidate.ratingResilience}/5 | Learning: ${candidate.ratingLearning}/5 | Ownership: ${candidate.ratingOwnership}/5

--- DISC PROFILE ---
Raw scores — D:${discScores.D}, I:${discScores.I}, S:${discScores.S}, C:${discScores.C}
Dominant type: ${dominantDisc}

--- ENNEAGRAM ---
Top types: ${topEnn.map(t => `Type ${t.num} (${t.label}): ${t.score}/5`).join(", ")}

Respond ONLY in this JSON format, no markdown:
{
  "overallScore": <1-10>,
  "recommendation": "<Strong Hire | Hire | Consider | Do Not Hire>",
  "summary": "<2-3 sentences>",
  "aptitudeDimensions": [
    { "name": "Client Sourcing & Prospecting", "score": <1-10>, "assessment": "<2-3 sentences>" },
    { "name": "Resilience & Determination", "score": <1-10>, "assessment": "<2-3 sentences>" },
    { "name": "Learning Hunger & Growth Mindset", "score": <1-10>, "assessment": "<2-3 sentences>" },
    { "name": "Ownership & Accountability", "score": <1-10>, "assessment": "<2-3 sentences>" }
  ],
  "disc": {
    "profile": "<e.g. High D/I>",
    "dominantType": "<D/I/S/C>",
    "description": "<2 sentences>",
    "clientFacingFit": "<2 sentences>"
  },
  "enneagram": {
    "dominantType": <number>,
    "dominantLabel": "<label>",
    "secondaryType": <number>,
    "secondaryLabel": "<label>",
    "description": "<2 sentences>",
    "clientFacingFit": "<2 sentences>"
  },
  "personalityRoleAlignment": "<2-3 sentences>",
  "strengths": ["<s1>", "<s2>", "<s3>"],
  "watchouts": ["<w1>", "<w2>"],
  "interviewFocusAreas": ["<a1>", "<a2>", "<a3>"]
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] })
  });
  const data = await res.json();
  const text = data.content.map(i => i.text || "").join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

async function sendEmailDraft(candidate, disc, enneagram, assessment) {
  const discScores = computeDisc(disc);
  const topEnn = topEnneagram(enneagram);
  const a = assessment;
  const dimColor = s => s >= 8 ? "#16a34a" : s >= 6 ? "#d97706" : "#dc2626";
  const recMap = { "Strong Hire": ["#dcfce7", "#16a34a"], "Hire": ["#dbeafe", "#1e40af"], "Consider": ["#fef3c7", "#d97706"], "Do Not Hire": ["#fee2e2", "#dc2626"] };
  const [recBg, recFg] = recMap[a.recommendation] || ["#f1f5f9", "#64748b"];

  const htmlBody = `<div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;color:#1e293b;">
  <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:24px 28px;border-radius:10px 10px 0 0;">
    <div style="color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Role Application</div>
    <div style="color:#fff;font-size:20px;font-weight:800;">New Assessment Submission</div>
    <div style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px;">Submitted: ${new Date(candidate.submittedAt).toLocaleString()}</div>
  </div>
  <div style="background:#f8fafc;padding:20px 28px;border:1px solid #e2e8f0;">
    <div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Personal Particulars</div>
    <table style="width:100%;font-size:13px;">
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;width:180px;">Full Name</td><td>${candidate.fullName}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Email</td><td>${candidate.email}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Phone</td><td>${candidate.phone}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Nationality</td><td>${candidate.nationality}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Location</td><td>${candidate.location}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Available From</td><td>${candidate.startDate}</td></tr>
    </table>
  </div>
  <div style="background:#fff;padding:20px 28px;border:1px solid #e2e8f0;border-top:none;">
    <div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Education</div>
    <table style="width:100%;font-size:13px;">
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;width:180px;">Qualification</td><td>${candidate.qualification} — ${candidate.fieldOfStudy}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Institution</td><td>${candidate.institution} (${candidate.gradYear})</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Study Mode</td><td>${candidate.studyMode}${candidate.studyMode === "Part-time" ? ` — ${candidate.totalStudyHours} hours` : ""}</td></tr>
      ${candidate.certifications ? `<tr><td style="font-weight:700;color:#475569;padding:5px 0;">Certifications</td><td>${candidate.certifications}</td></tr>` : ""}
    </table>
  </div>
  <div style="background:#f8fafc;padding:20px 28px;border:1px solid #e2e8f0;border-top:none;">
    <div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Work Experience</div>
    <table style="width:100%;font-size:13px;">
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;width:180px;">Current Role</td><td>${candidate.currentRole} at ${candidate.currentCompany}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Duration</td><td>${candidate.duration}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Total Experience</td><td>${candidate.totalYears}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;vertical-align:top;">Responsibilities</td><td>${candidate.responsibilities}</td></tr>
      ${candidate.achievements ? `<tr><td style="font-weight:700;color:#475569;padding:5px 0;vertical-align:top;">Achievements</td><td>${candidate.achievements}</td></tr>` : ""}
    </table>
  </div>
  <div style="background:#fff;padding:20px 28px;border:1px solid #e2e8f0;border-top:none;">
    <div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Aptitude — Mindset & Drive</div>
    <table style="width:100%;font-size:13px;">
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;width:200px;">Proactive Prospecting</td><td>${candidate.likert1}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Resilience</td><td>${candidate.likert2}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Self-Driven Learning</td><td>${candidate.likert3}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Problem Ownership</td><td>${candidate.likert4}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Prospect Energy</td><td>${candidate.likert5}</td></tr>
      <tr><td style="font-weight:700;color:#475569;padding:5px 0;">Accountability</td><td>${candidate.likert6}</td></tr>
    </table>
  </div>
  <div style="background:#f8fafc;padding:20px 28px;border:1px solid #e2e8f0;border-top:none;">
    <div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Situational Responses</div>
    <div style="font-size:13px;margin-bottom:14px;"><strong>Q1 — Client Sourcing:</strong><br/><span style="color:#334155;">${candidate.scenario1}</span></div>
    <div style="font-size:13px;margin-bottom:14px;"><strong>Q2 — Resilience & Setbacks:</strong><br/><span style="color:#334155;">${candidate.scenario2}</span></div>
    <div style="font-size:13px;"><strong>Q3 — Problem Ownership:</strong><br/><span style="color:#334155;">${candidate.scenario3}</span></div>
  </div>
  <div style="background:#fff;padding:20px 28px;border:1px solid #e2e8f0;border-top:none;">
    <div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">DISC Profile</div>
    <div style="display:flex;gap:12px;margin-bottom:12px;">
      ${["D", "I", "S", "C"].map(k => `<div style="text-align:center;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;padding:10px 16px;"><div style="font-size:18px;font-weight:800;color:#1e40af;">${discScores[k]}</div><div style="font-size:11px;color:#64748b;font-weight:700;">${k}</div></div>`).join("")}
    </div>
    <table style="width:100%;font-size:12px;color:#475569;">
      ${discSets.map((s, i) => `<tr><td style="padding:4px 0;width:70px;font-weight:700;">Set ${i + 1}</td><td style="color:#16a34a;">Most: ${disc[s.id]?.most || "—"}</td><td style="color:#dc2626;">Least: ${disc[s.id]?.least || "—"}</td></tr>`).join("")}
    </table>
  </div>
  <div style="background:#f8fafc;padding:20px 28px;border:1px solid #e2e8f0;border-top:none;">
    <div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Enneagram Profile</div>
    <table style="width:100%;font-size:13px;">
      ${topEnn.map(t => `<tr><td style="font-weight:700;color:#6d28d9;padding:5px 0;width:240px;">Type ${t.num} — ${t.label}</td><td style="font-weight:700;color:#7c3aed;">${t.score}/5</td></tr>`).join("")}
    </table>
  </div>
  <div style="background:linear-gradient(135deg,#f0fdf4,#eff6ff);padding:20px 28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px;">
    <div style="font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">🤖 AI Assessment</div>
    <div style="display:flex;gap:10px;margin-bottom:16px;align-items:center;flex-wrap:wrap;">
      <span style="background:#1e40af;color:#fff;font-weight:700;border-radius:20px;padding:6px 18px;font-size:16px;">${a.overallScore}/10</span>
      <span style="background:${recBg};color:${recFg};font-weight:700;border-radius:20px;padding:6px 16px;font-size:13px;">${a.recommendation}</span>
    </div>
    <p style="font-size:13px;color:#1e293b;line-height:1.6;margin:0 0 18px;">${a.summary}</p>
    <div style="font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Aptitude Dimensions</div>
    ${a.aptitudeDimensions.map(d => `<div style="margin-bottom:12px;"><div style="font-size:12px;font-weight:700;color:#1e293b;">${d.name} — <span style="color:${dimColor(d.score)}">${d.score}/10</span></div><div style="height:4px;background:#e2e8f0;border-radius:99px;margin:4px 0 6px;"><div style="height:100%;width:${d.score * 10}%;background:${dimColor(d.score)};border-radius:99px;"></div></div><div style="font-size:12px;color:#475569;line-height:1.5;">${d.assessment}</div></div>`).join("")}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;">
      <div style="background:#fff;border-radius:8px;padding:14px;border:1px solid #e2e8f0;">
        <div style="font-size:11px;font-weight:700;color:#1e40af;margin-bottom:8px;">🔲 DISC — ${a.disc.profile}</div>
        <div style="font-size:12px;color:#334155;margin-bottom:6px;">${a.disc.description}</div>
        <div style="font-size:12px;color:#475569;"><strong>Role Fit:</strong> ${a.disc.clientFacingFit}</div>
      </div>
      <div style="background:#fff;border-radius:8px;padding:14px;border:1px solid #e2e8f0;">
        <div style="font-size:11px;font-weight:700;color:#7c3aed;margin-bottom:8px;">⬡ Enneagram — Type ${a.enneagram.dominantType} (${a.enneagram.dominantLabel}) w/ ${a.enneagram.secondaryType} (${a.enneagram.secondaryLabel})</div>
        <div style="font-size:12px;color:#334155;margin-bottom:6px;">${a.enneagram.description}</div>
        <div style="font-size:12px;color:#475569;"><strong>Role Fit:</strong> ${a.enneagram.clientFacingFit}</div>
      </div>
    </div>
    <div style="background:#fff;border-radius:8px;padding:14px;border:1px solid #e2e8f0;margin-top:12px;">
      <div style="font-size:11px;font-weight:700;color:#d97706;margin-bottom:6px;">🧩 Personality × Role Alignment</div>
      <div style="font-size:12px;color:#334155;line-height:1.5;">${a.personalityRoleAlignment}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px;">
      <div style="background:#fff;border-radius:8px;padding:12px;border:1px solid #e2e8f0;">
        <div style="font-size:11px;font-weight:700;color:#16a34a;margin-bottom:6px;">✓ Strengths</div>
        ${a.strengths.map(s => `<div style="font-size:11px;color:#1e293b;margin-bottom:3px;">• ${s}</div>`).join("")}
      </div>
      <div style="background:#fff;border-radius:8px;padding:12px;border:1px solid #e2e8f0;">
        <div style="font-size:11px;font-weight:700;color:#d97706;margin-bottom:6px;">⚠ Watch-outs</div>
        ${a.watchouts.map(s => `<div style="font-size:11px;color:#1e293b;margin-bottom:3px;">• ${s}</div>`).join("")}
      </div>
      <div style="background:#fff;border-radius:8px;padding:12px;border:1px solid #e2e8f0;">
        <div style="font-size:11px;font-weight:700;color:#1e40af;margin-bottom:6px;">🎯 Interview Focus</div>
        ${a.interviewFocusAreas.map(s => `<div style="font-size:11px;color:#1e293b;margin-bottom:3px;">• ${s}</div>`).join("")}
      </div>
    </div>
  </div>
</div>`;

  await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      mcp_servers: [{ type: "url", url: GMAIL_MCP_URL, name: "gmail" }],
      messages: [{ role: "user", content: `Use the create_draft tool to create a Gmail draft:\n- to: ["${HR_EMAIL}"]\n- subject: "New Assessment Submission — ${candidate.fullName}"\n- htmlBody: ${JSON.stringify(htmlBody)}` }]
    })
  });
}

function Section1({ d, set }) {
  return <div>
    <Field label="Full Name" required><Input value={d.fullName} onChange={v => set("fullName", v)} placeholder="e.g. Jane Tan" /></Field>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Field label="Email Address" required><Input type="email" value={d.email} onChange={v => set("email", v)} placeholder="jane@email.com" /></Field>
      <Field label="Phone Number" required><Input value={d.phone} onChange={v => set("phone", v)} placeholder="+65 9123 4567" /></Field>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Field label="Nationality" required><Input value={d.nationality} onChange={v => set("nationality", v)} placeholder="e.g. Singaporean" /></Field>
      <Field label="Current Location" required><Input value={d.location} onChange={v => set("location", v)} placeholder="e.g. Singapore" /></Field>
    </div>
    <Field label="Earliest Available Start Date" required><Input type="date" value={d.startDate} onChange={v => set("startDate", v)} /></Field>
  </div>;
}
function Section2({ d, set }) {
  const quals = ["Diploma", "Bachelor's Degree", "Postgraduate Diploma", "Master's Degree", "Doctorate (PhD)", "Professional Certification", "Other"];
  return <div>
    <Field label="Highest Qualification" required><Select value={d.qualification} onChange={v => set("qualification", v)} options={quals} /></Field>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Field label="Institution" required><Input value={d.institution} onChange={v => set("institution", v)} placeholder="e.g. NUS" /></Field>
      <Field label="Field of Study" required><Input value={d.fieldOfStudy} onChange={v => set("fieldOfStudy", v)} placeholder="e.g. Business Analytics" /></Field>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Field label="Graduation Year" required><Input type="number" value={d.gradYear} onChange={v => set("gradYear", v)} placeholder="e.g. 2022" min="1970" /></Field>
      <Field label="Study Mode" required><Select value={d.studyMode} onChange={v => set("studyMode", v)} options={["Full-time", "Part-time"]} /></Field>
    </div>
    {d.studyMode === "Part-time" && <Field label="Total Study Hours (Part-time)" required hint="Total hours completed for your degree programme."><Input type="number" value={d.totalStudyHours} onChange={v => set("totalStudyHours", v)} placeholder="e.g. 1200" min="0" /></Field>}
    <Field label="Relevant Certifications / Courses" hint="Optional"><Textarea value={d.certifications} onChange={v => set("certifications", v)} placeholder="e.g. PMP (2023), AWS Cloud Practitioner (2024)" /></Field>
  </div>;
}
function Section3({ d, set }) {
  const yrs = ["Less than 1 year", "1–2 years", "3–5 years", "6–10 years", "More than 10 years"];
  return <div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Field label="Current / Most Recent Job Title" required><Input value={d.currentRole} onChange={v => set("currentRole", v)} placeholder="e.g. Business Analyst" /></Field>
      <Field label="Company" required><Input value={d.currentCompany} onChange={v => set("currentCompany", v)} placeholder="e.g. Accenture" /></Field>
    </div>
    <Field label="Duration in Role" required hint="e.g. Jan 2022 – Present"><Input value={d.duration} onChange={v => set("duration", v)} placeholder="e.g. Jan 2022 – Present" /></Field>
    <Field label="Key Responsibilities" required><Textarea value={d.responsibilities} onChange={v => set("responsibilities", v)} placeholder="Briefly describe your main responsibilities..." rows={3} /></Field>
    <Field label="Total Years of Working Experience" required><Select value={d.totalYears} onChange={v => set("totalYears", v)} options={yrs} /></Field>
    <Field label="Notable Achievements or Projects" hint="Optional"><Textarea value={d.achievements} onChange={v => set("achievements", v)} placeholder="e.g. Independently identified and closed a new account..." rows={3} /></Field>
  </div>;
}
function Section4({ d, set }) {
  return <div>
    <div style={{ background: "#f1f5f9", borderRadius: 10, padding: "14px 16px", marginBottom: 22 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Mindset & Drive</div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 14 }}>Rate how accurately each statement describes you.</div>
      <Likert question="I actively seek out new business opportunities and enjoy identifying potential clients, even without being asked to." value={d.likert1} onChange={v => set("likert1", v)} />
      <Likert question="When I face repeated rejections or setbacks, I find ways to adjust my approach and keep going rather than stepping back." value={d.likert2} onChange={v => set("likert2", v)} />
      <Likert question="I regularly invest time outside of work to learn new skills, read industry content, or seek feedback to improve myself." value={d.likert3} onChange={v => set("likert3", v)} />
      <Likert question="When I encounter a problem, I take full ownership of resolving it — I don't wait to be told what to do next." value={d.likert4} onChange={v => set("likert4", v)} />
      <Likert question="I am energised by the challenge of winning over a skeptical or difficult prospect." value={d.likert5} onChange={v => set("likert5", v)} />
      <Likert question="I hold myself accountable when outcomes fall short, and proactively find ways to course-correct." value={d.likert6} onChange={v => set("likert6", v)} />
    </div>
    <div style={{ background: "#f1f5f9", borderRadius: 10, padding: "14px 16px", marginBottom: 22 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Situational Questions</div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 14 }}>Be as specific as possible.</div>
      <Field label="Tell us about a time you identified and pursued a new client or business opportunity entirely on your own initiative. What steps did you take, and what was the outcome?" required>
        <Textarea value={d.scenario1} onChange={v => set("scenario1", v)} placeholder="Walk us through the situation, your actions, and the result..." rows={4} />
      </Field>
      <Field label="Describe a situation where you faced significant setbacks or repeated failures in achieving a goal. How did you stay motivated and what did you ultimately do to succeed?" required>
        <Textarea value={d.scenario2} onChange={v => set("scenario2", v)} placeholder="Be specific about the challenge, how you felt, and what you did next..." rows={4} />
      </Field>
      <Field label="Give an example of a problem at work that was not technically your responsibility, but that you took ownership of anyway. What drove you to step in, and what happened?" required>
        <Textarea value={d.scenario3} onChange={v => set("scenario3", v)} placeholder="Describe the situation and why you chose to take ownership..." rows={4} />
      </Field>
    </div>
    <div style={{ background: "#f1f5f9", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Self-Assessment</div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 14 }}>Rate yourself honestly from 1 (low) to 5 (high).</div>
      <RatingRow label="Ability to source, prospect, and develop new client relationships" value={d.ratingProspecting} onChange={v => set("ratingProspecting", v)} />
      <RatingRow label="Resilience and determination to push through obstacles and setbacks" value={d.ratingResilience} onChange={v => set("ratingResilience", v)} />
      <RatingRow label="Hunger and initiative to continuously learn and grow" value={d.ratingLearning} onChange={v => set("ratingLearning", v)} />
      <RatingRow label="Ownership mindset — taking accountability for problems and outcomes" value={d.ratingOwnership} onChange={v => set("ratingOwnership", v)} />
    </div>
  </div>;
}
function Section5({ disc, onDisc, enneagram, onEnneagram }) {
  const handleDisc = (setId, type, word, typeCode) => {
    const current = disc[setId] || {};
    if (type === "most" && current.least === word) return;
    if (type === "least" && current.most === word) return;
    onDisc({ ...disc, [setId]: { ...current, [type]: word, [`${type}Type`]: typeCode } });
  };
  return <div>
    <div style={{ background: "#f1f5f9", borderRadius: 10, padding: "14px 16px", marginBottom: 22 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>DISC Profile</div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 16 }}>For each row, select the word that describes you <strong>most</strong> and the word that describes you <strong>least</strong>.</div>
      {discSets.map((set, si) => (
        <div key={set.id} style={{ marginBottom: 20, background: "#fff", borderRadius: 10, border: "1.5px solid #e2e8f0", padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 10 }}>Set {si + 1}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}></div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", textAlign: "center" }}>Most</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", textAlign: "center" }}>Least</div>
            {set.words.map(w => (
              <>
                <div key={w.w} style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{w.w}</div>
                <div style={{ textAlign: "center" }}><button onClick={() => handleDisc(set.id, "most", w.w, w.t)} style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid", borderColor: disc[set.id]?.most === w.w ? "#16a34a" : "#cbd5e1", background: disc[set.id]?.most === w.w ? "#16a34a" : "#f8fafc", cursor: "pointer" }} /></div>
                <div style={{ textAlign: "center" }}><button onClick={() => handleDisc(set.id, "least", w.w, w.t)} style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid", borderColor: disc[set.id]?.least === w.w ? "#dc2626" : "#cbd5e1", background: disc[set.id]?.least === w.w ? "#dc2626" : "#f8fafc", cursor: "pointer" }} /></div>
              </>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div style={{ background: "#f1f5f9", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Enneagram Type</div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 16 }}>Rate how closely each statement resonates with you from 1 (not at all) to 5 (very strongly).</div>
      {enneagramTypes.map(t => (
        <div key={t.num} style={{ marginBottom: 16, background: "#fff", borderRadius: 10, border: "1.5px solid #e2e8f0", padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 4 }}>Type {t.num} — {t.label}</div>
          <div style={{ fontSize: 13, color: "#334155", marginBottom: 10, lineHeight: 1.5 }}>{t.stmt}</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Not me</span>
            {ratingOptions.map(n => (
              <button key={n} onClick={() => onEnneagram({ ...enneagram, [t.num]: n })} style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid", borderColor: enneagram[t.num] === n ? "#1e40af" : "#cbd5e1", background: enneagram[t.num] === n ? "#1e40af" : "#f8fafc", color: enneagram[t.num] === n ? "#fff" : "#475569", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{n}</button>
            ))}
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Very me</span>
          </div>
        </div>
      ))}
    </div>
  </div>;
}

const initData = {
  fullName: "", email: "", phone: "", nationality: "", location: "", startDate: "",
  qualification: "", institution: "", fieldOfStudy: "", gradYear: "", studyMode: "", totalStudyHours: "", certifications: "",
  currentRole: "", currentCompany: "", duration: "", responsibilities: "", totalYears: "", achievements: "",
  likert1: "", likert2: "", likert3: "", likert4: "", likert5: "", likert6: "",
  scenario1: "", scenario2: "", scenario3: "",
  ratingProspecting: 0, ratingResilience: 0, ratingLearning: 0, ratingOwnership: 0,
};

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initData);
  const [disc, setDisc] = useState({});
  const [enneagram, setEnneagram] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setData(prev => ({ ...prev, [k]: v }));
  const discComplete = discSets.every(s => disc[s.id]?.most && disc[s.id]?.least);
  const enneagramComplete = enneagramTypes.every(t => enneagram[t.num] > 0);
  const validate = () => {
    if (step === 0) return data.fullName && data.email && data.phone && data.nationality && data.location && data.startDate;
    if (step === 1) return data.qualification && data.institution && data.fieldOfStudy && data.gradYear && data.studyMode && (data.studyMode !== "Part-time" || data.totalStudyHours);
    if (step === 2) return data.currentRole && data.currentCompany && data.duration && data.responsibilities && data.totalYears;
    if (step === 3) return data.likert1 && data.likert2 && data.likert3 && data.likert4 && data.likert5 && data.likert6 && data.scenario1 && data.scenario2 && data.scenario3 && data.ratingProspecting && data.ratingResilience && data.ratingLearning && data.ratingOwnership;
    if (step === 4) return discComplete && enneagramComplete;
    return true;
  };
  const handleSubmit = async () => {
    setSaving(true);
    try {
      const record = { ...data, submittedAt: new Date().toISOString() };
      const assessment = await generateAssessment(data, disc, enneagram);
      await sendEmailDraft(record, disc, enneagram, assessment);
      setSubmitted(true);
    } catch (e) { console.error(e); }
    setSaving(false);
  };
  const next = () => { if (step < 4) setStep(s => s + 1); else handleSubmit(); };
  const back = () => setStep(s => s - 1);
  const btnStyle = (primary, disabled) => ({ padding: "10px 26px", borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer", background: primary ? (disabled ? "#94a3b8" : "#1e40af") : "#f1f5f9", color: primary ? "#fff" : "#475569", fontWeight: 600, fontSize: 14 });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 16px" }}>
      <div style={{ width: "100%", maxWidth: 720, background: "#fff", borderRadius: 16, boxShadow: "0 4px 32px rgba(30,64,175,0.09)", padding: "36px 40px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Role Application</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>Candidate Pre-Interview Aptitude Assessment</div>
        </div>
        {!submitted ? <>
          <ProgressBar current={step} total={5} />
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1e40af", marginBottom: 20 }}>{SECTIONS[step]}</div>
          {step === 0 && <Section1 d={data} set={set} />}
          {step === 1 && <Section2 d={data} set={set} />}
          {step === 2 && <Section3 d={data} set={set} />}
          {step === 3 && <Section4 d={data} set={set} />}
          {step === 4 && <Section5 disc={disc} onDisc={setDisc} enneagram={enneagram} onEnneagram={setEnneagram} />}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button style={btnStyle(false, step === 0)} onClick={back} disabled={step === 0}>← Back</button>
            <button style={btnStyle(true, !validate() || saving)} onClick={next} disabled={!validate() || saving}>
              {saving ? "Submitting... (this may take up to 60 seconds)" : step === 4 ? "Submit Assessment" : "Next →"}
            </button>
          </div>
        </> : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}>Submission Complete</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 8, maxWidth: 440, margin: "8px auto 0" }}>Thank you, {data.fullName}. Your responses have been received. Our team will review your assessment and be in touch shortly.</div>
          </div>
        )}
      </div>
    </div>
  );
}