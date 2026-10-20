import { useEffect, useRef, useState, useCallback } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const WIN_SCORE = 150;

const LEVELS = [
  { min: 0,   label: "Still in college 🎓" },
  { min: 15,  label: "Entry level grind 💪" },
  { min: 35,  label: "Mid-level pro 📈" },
  { min: 60,  label: "Senior specialist 💼" },
  { min: 90,  label: "VP of Vibes ✨" },
  { min: 120, label: "Dream job! 🏆" },
];

const GOOD = [
  { t: "Good mentor",    e: "🧑‍🏫", pts: 5 },
  { t: "Alumni hookup",  e: "🤝",   pts: 4 },
  { t: "Dream referral", e: "⭐",   pts: 6 },
  { t: "Raise secured",  e: "💰",   pts: 5 },
  { t: "LinkedIn rec",   e: "👍",   pts: 3 },
  { t: "Project viral",  e: "🚀",   pts: 6 },
  { t: "Coffee chat",    e: "☕",   pts: 2 },
  { t: "Strong network", e: "🌐",   pts: 4 },
  { t: "Got internship", e: "🎉",   pts: 3 },
  { t: "Updated resume", e: "📄",   pts: 2 },
];

const BAD = [
  { t: "Unpaid intern",    e: "👻", pts: -4 },
  { t: "Like a family",    e: "🚩", pts: -5 },
  { t: "Slack layoff",     e: "👻", pts: -6 },
  { t: "Idea stolen",      e: "😡", pts: -5 },
  { t: "Reorg, bye",       e: "🔥", pts: -6 },
  { t: "Fake promotion",   e: "🤡", pts: -4 },
  { t: "Equity only",      e: "📉", pts: -4 },
  { t: "3yr exp entry",    e: "🙄", pts: -3 },
  { t: "Micromanager",     e: "👻", pts: -4 },
  { t: "Moved goalposts",  e: "🎯", pts: -3 },
];

const BONUS = [
  { t: "MBA 🛡️",       e: "shield", color: "#7F77DD" },
  { t: "Network 🐢",    e: "slow",   color: "#1D9E75" },
  { t: "Magnet 🧲",     e: "magnet", color: "#EF9F27" },
  { t: "x2 Points 💎",  e: "double", color: "#378ADD" },
];

const QUOTES = [
  { q: "You are braver than you believe, stronger than you seem, and smarter than you think.", a: "A.A. Milne" },
  { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
  { q: "It always seems impossible until it's done.", a: "Nelson Mandela" },
  { q: "You didn't come this far to only come this far. Keep going.", a: "Unknown" },
  { q: "Believe you can and you're halfway there.", a: "Theodore Roosevelt" },
  { q: "Your potential is limitless. Don't let anyone — including yourself — tell you otherwise.", a: "Unknown" },
  { q: "Hard work beats talent when talent doesn't work hard.", a: "Tim Notke" },
  { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
  { q: "Don't watch the clock — do what it does. Keep going.", a: "Sam Levenson" },
  { q: "You are capable of more than you know.", a: "E.O. Wilson" },
  { q: "Success is not final, failure is not fatal — it is the courage to continue that counts.", a: "Winston Churchill" },
  { q: "Shine bright. The world needs exactly the kind of light only you can bring.", a: "Unknown" },
  { q: "Every expert was once a beginner. Every pro was once an amateur.", a: "Robin Sharma" },
  { q: "You have what it takes. Now go prove it to yourself.", a: "Unknown" },
  { q: "Strength comes from overcoming the things you once thought you couldn't.", a: "Rikki Rogers" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getLevel = (score) => {
  let l = LEVELS[0];
  for (const v of LEVELS) if (score >= v.min) l = v;
  return l;
};

const getLevelIndex = (score) => {
  let i = 0;
  for (let j = 0; j < LEVELS.length; j++) if (score >= LEVELS[j].min) i = j;
  return i;
};

const PILL_GOOD = "rgba(8,80,65,0.92)";
const PILL_BAD  = "rgba(90,20,20,0.92)";
const PILL_PAD  = 9;
const FONT      = "'Hanken Grotesk', sans-serif";
const W = 420, H = 560;

// Typography scale (px) — minimum 12px, all others scaled up proportionally
const T = {
  // Canvas
  cardTitle:    13,  // was 11 → +2
  cardScore:    13,  // was 11 → +2
  cardEmoji:    18,  // was 15 → +3
  bonusText:    13,  // was 11 → +2
  badgeText:    12,  // was 10 → +2  (minimum)
  floatBig:     16,  // was 14 → +2
  floatSmall:   14,  // was 12 → +2
  // HTML (as strings for CSS)
  statLabel:   "12px",  // was 10 → +2  (minimum)
  statValue:   "22px",  // was 20 → +2
  levelValue:  "14px",  // was 12 → +2
  bestValue:   "22px",  // was 20 → +2
  descText:    "13px",  // was 11 → +2
  screenTitle: "24px",  // was 22 → +2
  screenSub:   "15px",  // was 13 → +2
  legendLabel: "14px",  // was 12 → +2
  btnText:     "16px",  // was 15 → +1 (already large)
  btnSecText:  "14px",  // was 13 → +1
  scLabel:     "12px",  // was 11 → +1  (minimum)
  scValue:     "26px",  // was 24 → +2
  badgeHtml:   "12px",  // was 11 → +1  (minimum)
  quoteText:   "13px",  // was 12 → +1
  quoteAuthor: "12px",  // was 11 → +1  (minimum)
  hintText:    "12px",  // was 11 → +1  (minimum)
  toastText:   "13px",  // was 12 → +1
  controlHint: "12px",  // was 11 → +1  (minimum)
};

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * CareerCatcher
 *
 * A self-contained canvas mini-game. Drop it anywhere in your app.
 *
 * Props:
 *   onExit?: () => void   — called when the user clicks the ✕ button.
 *                           If omitted the game shows a "Thanks for playing" screen instead.
 */
export default function CareerCatcher({ onExit }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef(null);
  const rafRef     = useRef(null);
  const mouseXRef  = useRef(W / 2);
  const runningRef = useRef(false);

  const [screen, setScreen]   = useState("start");
  const [uiScore, setUiScore] = useState(0);
  const [uiLevel, setUiLevel] = useState(LEVELS[0].label);
  const [best, setBest]       = useState(0);
  const [endData, setEndData] = useState(null);
  const [toast, setToast]     = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((txt, color) => {
    setToast({ txt, color });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1300);
  }, []);

  const measureCardWidth = useCallback((t) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return 140;
    ctx.font = `600 ${T.cardTitle}px ${FONT}`;
    return Math.ceil(8 + (PILL_PAD * 2 + T.cardEmoji) + 9 + ctx.measureText(t).width + 12);
  }, []);

  const lanesFree = (existing, x, w) => {
    for (const c of existing)
      if (x < c.x + c.w + 10 && x + w > c.x - 10) return false;
    return true;
  };

  const mkCard = useCallback((forceGood) => {
    const g = forceGood != null ? forceGood : Math.random() > 0.45;
    const d = rnd(g ? GOOD : BAD);
    const w = Math.max(120, measureCardWidth(d.t));
    return { x: -999, y: -70, w, h: 54, t: d.t, e: d.e, pts: d.pts, good: g,
      color: g ? "#1D9E75" : "#E24B4A", speed: 1.1 + Math.random() * 0.5, alive: true };
  }, [measureCardWidth]);

  const placeCard = (card, existing) => {
    for (let i = 0; i < 60; i++) {
      const x = 10 + Math.random() * (W - card.w - 20);
      if (lanesFree(existing, x, card.w)) { card.x = x; return true; }
    }
    return false;
  };

  const mkBonus = () => {
    const b = rnd(BONUS);
    return { x: 20 + Math.random() * (W - 110), y: -34, w: 106, h: 34,
      t: b.t, e: b.e, color: b.color, speed: 0.9 + Math.random() * 0.4, alive: true };
  };

  const initState = useCallback(() => {
    const c1 = mkCard(true); c1.x = 40;  c1.y = -70;
    const c2 = mkCard(true); c2.x = 230; c2.y = -145;
    return {
      px: W / 2, py: H - 56, pr: 24,
      score: 0, lives: 3,
      cards: [c1, c2], bonuses: [], particles: [], floats: [],
      shield: false, slowActive: false, magnetActive: false, doubleActive: false,
      shieldTimer: 0, slowTimer: 0, magnetTimer: 0, doubleTimer: 0,
      spawnTimer: 0, bonusTimer: 0, speed: 1, speedTimer: 0,
      alive: true, prevLevel: 0,
    };
  }, [mkCard]);

  const addParticles = (x, y, color, n = 8) => {
    for (let i = 0; i < n; i++)
      stateRef.current.particles.push({
        x, y, vx: (Math.random() - 0.5) * 5, vy: -1.5 - Math.random() * 3,
        life: 1, color, r: 3 + Math.random() * 2,
      });
  };
  const starParticles = (x, y) => {
    for (let i = 0; i < 10; i++)
      stateRef.current.particles.push({
        x, y, vx: (Math.random() - 0.5) * 6, vy: -2 - Math.random() * 4,
        life: 1, color: "#59C0F3", r: 2.5 + Math.random() * 2,
      });
  };
  const addFloat = (x, y, txt, color, big = false) => {
    stateRef.current.floats.push({ x, y, txt, color, life: 1, vy: -1.4, big });
  };

  const endGame = useCallback((won) => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    const s = stateRef.current;
    const isNew = s.score > best;
    const newBest = isNew ? s.score : best;
    setBest(newBest);
    const quote = rnd(QUOTES);
    setEndData({ won, score: s.score, best: newBest, isNew, quote });
    setScreen("end");
  }, [best]);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (!s?.alive) return;

    s.speedTimer++;
    if (s.speedTimer % 600 === 0) s.speed = Math.min(2.0, s.speed + 0.12);

    s.px += (mouseXRef.current - s.px) * 0.18;
    s.px = Math.max(s.pr, Math.min(W - s.pr, s.px));

    const slow = s.slowActive ? 0.5 : 1;

    s.spawnTimer++;
    const rate = Math.max(60, 100 - s.speedTimer / 70);
    if (s.spawnTimer > rate) {
      s.spawnTimer = 0;
      const active = s.cards.filter(c => c.alive && c.y < 100);
      const nc = mkCard();
      if (placeCard(nc, active)) s.cards.push(nc);
    }

    s.bonusTimer++;
    if (s.bonusTimer > 240) {
      s.bonusTimer = 0;
      if (Math.random() < 0.45) s.bonuses.push(mkBonus());
    }

    if (s.shieldTimer  > 0) { s.shieldTimer--;  if (!s.shieldTimer)  s.shield       = false; }
    if (s.slowTimer    > 0) { s.slowTimer--;     if (!s.slowTimer)    s.slowActive   = false; }
    if (s.magnetTimer  > 0) { s.magnetTimer--;   if (!s.magnetTimer)  s.magnetActive = false; }
    if (s.doubleTimer  > 0) { s.doubleTimer--;   if (!s.doubleTimer)  s.doubleActive = false; }

    for (const c of s.cards) {
      if (!c.alive) continue;
      c.y += c.speed * s.speed * slow;
      if (s.magnetActive && c.good) {
        const cx = c.x + c.w / 2;
        c.x += (s.px - cx) * 0.05;
        c.x = Math.max(0, Math.min(W - c.w, c.x));
      }
      if (c.y > H + 10) {
        c.alive = false;
        if (c.good) {
          s.lives--;
          addParticles(c.x + c.w / 2, H - 10, "#E24B4A", 5);
          if (!s.lives) { s.alive = false; endGame(false); return; }
        }
        continue;
      }
      const dx = c.x + c.w / 2 - s.px, dy = c.y + c.h / 2 - s.py;
      if (Math.sqrt(dx * dx + dy * dy) < s.pr + c.h / 2 + 4) {
        c.alive = false;
        if (c.good) {
          const pts = s.doubleActive ? c.pts * 2 : c.pts;
          s.score = Math.max(0, s.score + pts);
          starParticles(c.x + c.w / 2, c.y + c.h / 2);
          addFloat(c.x + c.w / 2, c.y - 6, `+${pts} ✦`, "#59C0F3", true);
        } else if (s.shield) {
          s.shield = false; s.shieldTimer = 0;
          addParticles(c.x + c.w / 2, c.y + c.h / 2, "#AFA9EC", 10);
          addFloat(c.x + c.w / 2, c.y, "🛡️ blocked!", "#AFA9EC");
        } else {
          s.score = Math.max(0, s.score + c.pts);
          s.lives--;
          addParticles(c.x + c.w / 2, c.y + c.h / 2, "#E24B4A", 10);
          addFloat(c.x + c.w / 2, c.y, String(c.pts), "#F09595");
          showToast(`${c.e} ${c.t}!`, "#A32D2D");
          if (!s.lives) { s.alive = false; endGame(false); return; }
        }
      }
    }
    s.cards = s.cards.filter(c => c.alive || c.y < H + 20);

    for (const b of s.bonuses) {
      if (!b.alive) continue;
      b.y += b.speed * slow;
      if (b.y > H + 10) { b.alive = false; continue; }
      const dx = b.x + b.w / 2 - s.px, dy = b.y + b.h / 2 - s.py;
      if (Math.sqrt(dx * dx + dy * dy) < s.pr + b.h / 2 + 4) {
        b.alive = false;
        addParticles(b.x + b.w / 2, b.y + b.h / 2, b.color, 12);
        addFloat(b.x + b.w / 2, b.y, b.t, b.color);
        if (b.e === "shield") { s.shield = true; s.shieldTimer = 300; showToast("🛡️ Shield activated!", b.color); }
        else if (b.e === "slow")   { s.slowActive   = true; s.slowTimer   = 360; showToast("🐢 Slow mode!", b.color); }
        else if (b.e === "magnet") { s.magnetActive = true; s.magnetTimer = 300; showToast("🧲 Magnet on!", b.color); }
        else if (b.e === "double") { s.doubleActive = true; s.doubleTimer = 300; showToast("💎 Double points!", b.color); }
      }
    }
    s.bonuses = s.bonuses.filter(b => b.alive || b.y < H + 20);

    for (const p of s.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life -= 0.04; p.r *= 0.97; }
    s.particles = s.particles.filter(p => p.life > 0);
    for (const f of s.floats) { f.y += f.vy; f.life -= 0.025; }
    s.floats = s.floats.filter(f => f.life > 0);

    const li = getLevelIndex(s.score);
    if (li > s.prevLevel) {
      s.prevLevel = li;
      showToast("Level up! " + LEVELS[li].label, "#854F0B");
    }
    setUiScore(s.score);
    setUiLevel(getLevel(s.score).label);

    if (s.score >= WIN_SCORE) { s.alive = false; endGame(true); }
  }, [mkCard, endGame, showToast]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;
    if (!s) return;

    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#1a0533"); bg.addColorStop(1, "#0f0c29");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.08 + Math.sin(s.speedTimer * 0.04 + i) * 0.04})`;
      ctx.beginPath(); ctx.arc((i * 73 + s.speedTimer * 0.2) % W, (i * 97 + s.speedTimer * 0.1) % H, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    const drawRR = (x, y, w, h, r, fill, stroke, sw) => {
      ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
      if (fill)   { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw || 1; ctx.stroke(); }
    };

    for (const c of s.cards) {
      if (!c.alive || c.y > H) continue;
      drawRR(c.x, c.y, c.w, c.h, 9, c.good ? "rgba(29,158,117,0.25)" : "rgba(226,75,74,0.25)", c.color, 1.5);
      const ph = T.cardEmoji + PILL_PAD * 2, pw = T.cardEmoji + PILL_PAD * 2;
      const px2 = c.x + 8, py2 = c.y + (c.h - ph) / 2;
      ctx.beginPath(); ctx.roundRect(px2, py2, pw, ph, 6);
      ctx.fillStyle = c.good ? PILL_GOOD : PILL_BAD; ctx.fill();
      ctx.globalAlpha = 1; ctx.font = `${T.cardEmoji}px sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(c.e, px2 + pw / 2, py2 + ph / 2 + 1);
      const tx = px2 + pw + 9;
      ctx.globalAlpha = 1; ctx.fillStyle = "#ffffff"; ctx.font = `600 ${T.cardTitle}px ${FONT}`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(c.t, tx, c.y + c.h / 2 - 7);
      ctx.fillStyle = c.good ? "#7EEAC8" : "#FFAAAA"; ctx.font = `600 ${T.cardScore}px ${FONT}`;
      ctx.fillText((c.good ? "+" : "") + c.pts, tx, c.y + c.h / 2 + 11);
    }

    for (const b of s.bonuses) {
      if (!b.alive || b.y > H) continue;
      drawRR(b.x, b.y, b.w, b.h, 9, "rgba(255,255,255,0.1)", b.color, 1.5);
      ctx.globalAlpha = 1; ctx.fillStyle = "#ffffff"; ctx.font = `500 ${T.bonusText}px ${FONT}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(b.t, b.x + b.w / 2, b.y + b.h / 2);
    }

    for (const p of s.particles) {
      ctx.save(); ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    for (const f of s.floats) {
      ctx.save(); ctx.globalAlpha = f.life;
      ctx.font = `${f.big ? `600 ${T.floatBig}px` : `500 ${T.floatSmall}px`} ${FONT}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = f.color; ctx.fillText(f.txt, f.x, f.y); ctx.restore();
    }

    const { px, py, pr } = s;
    if (s.shield) {
      ctx.save(); ctx.strokeStyle = "#AFA9EC"; ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.5 + Math.sin(s.speedTimer * 0.15) * 0.3;
      ctx.beginPath(); ctx.arc(px, py, pr + 8, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    if (s.magnetActive) {
      ctx.save(); ctx.strokeStyle = "#EF9F27"; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]); ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(px, py, pr + 14, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.shadowColor = "rgba(89,192,243,0.65)"; ctx.shadowBlur = 18;
    ctx.fillStyle = "#59C0F3"; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,0.32)"; ctx.beginPath(); ctx.arc(px - 5, py - 8, pr * 0.55, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1a3a50";
    ctx.beginPath(); ctx.arc(px - 8, py - 3, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px + 8, py - 3, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(px - 6.5, py - 4.5, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px + 9.5, py - 4.5, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1a3a50"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(px, py + 6, 7, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();

    for (let i = 0; i < s.lives; i++) {
      ctx.fillStyle = "#E24B4A";
      const hx = W - 16 - i * 22, hy = 14;
      ctx.beginPath(); ctx.moveTo(hx, hy + 4);
      ctx.bezierCurveTo(hx, hy, hx - 6.5, hy, hx - 6.5, hy + 4);
      ctx.bezierCurveTo(hx - 6.5, hy + 8, hx, hy + 12.5, hx, hy + 12.5);
      ctx.bezierCurveTo(hx, hy + 12.5, hx + 6.5, hy + 8, hx + 6.5, hy + 4);
      ctx.bezierCurveTo(hx + 6.5, hy, hx, hy, hx, hy + 4);
      ctx.fill();
    }

    const ae = [];
    if (s.shield)       ae.push({ t: "🛡️ Shield", c: "#AFA9EC", timer: s.shieldTimer,  max: 300 });
    if (s.slowActive)   ae.push({ t: "🐢 Slow",   c: "#5DCAA5", timer: s.slowTimer,     max: 360 });
    if (s.magnetActive) ae.push({ t: "🧲 Magnet", c: "#EF9F27", timer: s.magnetTimer,   max: 300 });
    if (s.doubleActive) ae.push({ t: "💎 x2",     c: "#85B7EB", timer: s.doubleTimer,   max: 300 });
    ae.forEach((e, i) => {
      const bw = 76, bx = 8 + i * (bw + 5), by = 8;
      drawRR(bx, by, bw, 22, 6, "rgba(0,0,0,0.4)", e.c, 0.5);
      ctx.globalAlpha = 1; ctx.fillStyle = "#fff"; ctx.font = `500 ${T.badgeText}px ${FONT}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(e.t, bx + bw / 2, by + 11);
      ctx.fillStyle = e.c; ctx.fillRect(bx + 2, by + 20, Math.max(0, (bw - 4) * (e.timer / e.max)), 2);
    });
  }, []);

  const loop = useCallback(() => {
    if (!runningRef.current) return;
    update(); draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  const startGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    stateRef.current = initState();
    mouseXRef.current = W / 2;
    runningRef.current = true;
    setUiScore(0);
    setUiLevel(LEVELS[0].label);
    setScreen("game");
    rafRef.current = requestAnimationFrame(loop);
  }, [initState, loop]);

  const handleExit = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (onExit) onExit();
    else setScreen("exited");
  }, [onExit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseXRef.current = (e.clientX - r.left) * (W / r.width);
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      mouseXRef.current = (e.touches[0].clientX - r.left) * (W / r.width);
    };
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  mouseXRef.current = Math.max(0, mouseXRef.current - 20);
      if (e.key === "ArrowRight") mouseXRef.current = Math.min(W, mouseXRef.current + 20);
      if (e.key === "Escape")     handleExit();
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchstart", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchstart", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [handleExit]);

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(toastTimer.current);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
        .cc-wrap *{ box-sizing:border-box; margin:0; padding:0; font-family:'Hanken Grotesk',sans-serif; }
        .cc-wrap{ width:100%; max-width:420px; margin:0 auto; padding:12px 0; }
        .cc-header{
          display:grid; grid-template-columns:1fr 1fr 1fr;
          align-items:start; position:relative;
          background:rgba(89,192,243,0.13);
          border:0.5px solid rgba(89,192,243,0.3); border-bottom:none;
          border-radius:12px 12px 0 0; padding:12px 16px 10px;
        }
        .cc-cell{ display:flex; flex-direction:column; align-items:center; gap:3px; }
        .cc-cell:first-child{ align-items:flex-start; }
        .cc-cell:last-child{ align-items:flex-end; padding-right:32px; }
        .cc-label{ font-size:${T.statLabel}; font-weight:500; color:rgba(7,70,110,0.65); text-transform:uppercase; letter-spacing:0.06em; }
        .cc-val{ font-size:${T.statValue}; font-weight:700; color:#07304a; line-height:1; }
        .cc-val-center{ font-size:${T.levelValue}; font-weight:600; color:#07304a; line-height:1.3; text-align:center; }
        .cc-best{ font-size:${T.bestValue}; font-weight:700; color:#854F0B; line-height:1; }
        .cc-desc{ grid-column:1/-1; font-size:${T.descText}; color:rgba(7,70,110,0.6); text-align:center; padding-top:8px; border-top:0.5px solid rgba(89,192,243,0.2); margin-top:8px; line-height:1.5; }
        .cc-close{
          position:absolute; top:10px; right:12px;
          width:26px; height:26px; display:flex; align-items:center; justify-content:center;
          border-radius:50%; background:rgba(7,70,110,0.1); border:0.5px solid rgba(7,70,110,0.2);
          cursor:pointer; transition:background 0.15s;
        }
        .cc-close:hover{ background:rgba(226,75,74,0.15); border-color:rgba(226,75,74,0.4); }
        .cc-canvas-wrap{ position:relative; width:100%; }
        canvas.cc-canvas{ display:block; width:100%; border-radius:0 0 12px 12px; border:0.5px solid rgba(0,0,0,0.1); border-top:none; cursor:none; }
        .cc-toast{
          position:absolute; top:52px; left:50%; transform:translateX(-50%);
          font-size:${T.toastText}; font-weight:500; padding:6px 16px; border-radius:20px;
          pointer-events:none; white-space:nowrap; z-index:10; color:#fff; transition:opacity 0.3s;
        }
        .cc-screen{
          position:absolute; top:0; left:0; width:100%; height:100%;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          background:rgba(15,12,41,0.94); border-radius:0 0 12px 12px; gap:12px; padding:28px;
        }
        .cc-title{ font-size:${T.screenTitle}; font-weight:600; color:#fff; text-align:center; }
        .cc-sub{ font-size:${T.screenSub}; color:rgba(255,255,255,0.55); text-align:center; line-height:1.7; }
        .cc-legend{ display:flex; gap:18px; margin-top:4px; flex-wrap:wrap; justify-content:center; }
        .cc-leg{ display:flex; align-items:center; gap:7px; font-size:${T.legendLabel}; color:rgba(255,255,255,0.75); }
        .cc-leg-pill{ display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:7px; font-size:18px; }
        @keyframes cc-glow{ 0%,100%{box-shadow:0 0 10px 3px rgba(89,192,243,0.6)} 50%{box-shadow:0 0 26px 10px rgba(89,192,243,0.9)} }
        .cc-btn{
          background:#59C0F3 !important; color:#0a2233 !important;
          border:none !important; border-radius:9px; padding:12px 34px;
          font-size:${T.btnText}; font-weight:700; cursor:pointer; margin-top:8px;
          font-family:'Hanken Grotesk',sans-serif; animation:cc-glow 2s ease-in-out infinite; outline:none;
        }
        .cc-btn:hover{ background:#7fd0f7 !important; }
        .cc-btn-sec{
          background:transparent; color:rgba(255,255,255,0.6);
          border:0.5px solid rgba(255,255,255,0.2); border-radius:9px;
          padding:9px 26px; font-size:${T.btnSecText}; cursor:pointer;
          font-family:'Hanken Grotesk',sans-serif;
        }
        .cc-btn-sec:hover{ background:rgba(255,255,255,0.08); color:#fff; }
        .cc-scores{ display:flex; gap:28px; align-items:center; margin:4px 0; }
        .cc-sc{ display:flex; flex-direction:column; align-items:center; gap:3px; }
        .cc-sc-label{ font-size:${T.scLabel}; color:rgba(255,255,255,0.4); }
        .cc-sc-val{ font-size:${T.scValue}; font-weight:600; color:#fff; }
        .cc-sc-best{ font-size:${T.scValue}; font-weight:600; color:#FAC775; }
        .cc-divider{ width:1px; height:40px; background:rgba(255,255,255,0.15); }
        .cc-badge{ background:#FAC77522; border:0.5px solid #FAC775; color:#FAC775; font-size:${T.badgeHtml}; font-weight:500; padding:5px 14px; border-radius:20px; margin-top:-4px; }
        .cc-quote{ background:rgba(89,192,243,0.1); border:0.5px solid rgba(89,192,243,0.3); border-radius:9px; padding:12px 16px; font-size:${T.quoteText}; color:rgba(255,255,255,0.8); text-align:center; line-height:1.65; font-style:italic; max-width:340px; }
        .cc-quote-author{ font-size:${T.quoteAuthor}; color:rgba(89,192,243,0.8); font-style:normal; font-weight:600; margin-top:4px; text-align:center; }
        .cc-exited{ padding:36px 16px; text-align:center; color:#555; font-size:${T.screenSub}; line-height:1.6; }
        .cc-hint{ font-size:${T.hintText}; color:#888; text-align:center; padding:5px 0 2px; }
        .cc-control-hint{ font-size:${T.controlHint}; color:rgba(255,255,255,0.35); margin-top:4px; }
      `}</style>

      <div className="cc-wrap">
        <div className="cc-header">
          <div className="cc-cell">
            <span className="cc-label">Score</span>
            <span className="cc-val">{uiScore}</span>
          </div>
          <div className="cc-cell">
            <span className="cc-label">Level</span>
            <span className="cc-val-center">{uiLevel}</span>
          </div>
          <div className="cc-cell">
            <span className="cc-label">Best</span>
            <span className="cc-best">{best}</span>
          </div>
          <div className="cc-desc">
            Climb from <b>Still in college</b> all the way to <b>Dream job</b> — catch good cards, dodge the bad ones.
          </div>
          <button className="cc-close" onClick={handleExit} title="Exit game">
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
              <line x1="1" y1="1" x2="9" y2="9" stroke="rgba(7,70,110,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="1" x2="1" y2="9" stroke="rgba(7,70,110,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {screen !== "exited" && (
          <div className="cc-canvas-wrap">
            <canvas ref={canvasRef} className="cc-canvas" width={W} height={H} />

            {toast && (
              <div className="cc-toast" style={{ background: toast.color }}>{toast.txt}</div>
            )}

            {screen === "start" && (
              <div className="cc-screen">
                <div className="cc-title">Career Catcher</div>
                <div className="cc-sub">Move your cursor to catch good cards.<br/>Dodge the bad ones. Grab bonuses!</div>
                <div className="cc-legend">
                  <div className="cc-leg">
                    <div className="cc-leg-pill" style={{ background:"rgba(29,158,117,0.3)", border:"1px solid #1D9E75" }}>✅</div>
                    Catch
                  </div>
                  <div className="cc-leg">
                    <div className="cc-leg-pill" style={{ background:"rgba(226,75,74,0.3)", border:"1px solid #E24B4A" }}>👻</div>
                    Dodge
                  </div>
                  <div className="cc-leg">
                    <div className="cc-leg-pill" style={{ background:"rgba(250,199,117,0.3)", border:"1px solid #FAC775" }}>⭐</div>
                    Bonus
                  </div>
                </div>
                <button className="cc-btn" onClick={startGame}>Start climbing 🚀</button>
                <div className="cc-control-hint">Move mouse or tap to control</div>
              </div>
            )}

            {screen === "end" && endData && (
              <div className="cc-screen">
                <div className="cc-title">{endData.won ? "🏆 Dream job unlocked!" : "👻 Knocked off the ladder"}</div>
                <div className="cc-sub">{endData.won ? "You made it all the way up!" : `You reached: ${getLevel(endData.score).label}`}</div>
                <div className="cc-scores">
                  <div className="cc-sc"><span className="cc-sc-label">Score</span><span className="cc-sc-val">{endData.score}</span></div>
                  <div className="cc-divider"/>
                  <div className="cc-sc"><span className="cc-sc-label">Best</span><span className="cc-sc-best">{endData.best}</span></div>
                </div>
                {endData.isNew && <div className="cc-badge">🏆 New record!</div>}
                <div className="cc-quote">"{endData.quote.q}"</div>
                <div className="cc-quote-author">— {endData.quote.a}</div>
                <button className="cc-btn" onClick={startGame}>Play again 🔄</button>
                <button className="cc-btn-sec" onClick={() => setScreen("start")}>Main menu</button>
              </div>
            )}
          </div>
        )}

        {screen === "exited" && (
          <div className="cc-exited">
            <div style={{ fontSize:36, marginBottom:10 }}>👋</div>
            <div style={{ fontWeight:600, fontSize:17, marginBottom:6 }}>Thanks for playing!</div>
            <div>Come back anytime to keep climbing.</div>
            <button className="cc-btn" onClick={() => setScreen("start")} style={{ fontSize:14, padding:"9px 24px", marginTop:16 }}>
              Play again 🚀
            </button>
          </div>
        )}

        <div className="cc-hint">Move mouse over canvas · tap to control on mobile</div>
      </div>
    </>
  );
}
