// ====================== themes.js ======================

const THEMES_CONFIG = {
  foret: {
    name: "Forêt Magique",
    icon: "🌿",
    className: "theme-foret"
  },
  desert: {
    name: "Désert Apocalypse",
    icon: "🏜️",
    className: "theme-desert"
  },
  chateau: {
    name: "Château Hanté",
    icon: "🏰",
    className: "theme-chateau"
  },
  sorcier: {
    name: "Sorcier & Magie",
    icon: "✨",
    className: "theme-sorcier"
  }
};

// ====================== TOUS LES STYLES DES THÈMES ======================
const themeStyles = `
:root {
  --col-accent: #a855f7;
  --col-accent2: #22d3ee;
  --col-border: #7c3aed;
  --col-border-light: #a855f7;
  --col-bg: #0a0a0a;
  --col-sidebar: rgba(15,23,42,0.95);
  --col-btn-from: #7c3aed;
  --col-btn-to: #4f46e5;
  --col-bubble-gm-from: #1e1b4b;
  --col-bubble-gm-to: #312e81;
  --col-bubble-gm-border: #6366f1;
  --col-bubble-pl-from: #4c1d95;
  --col-bubble-pl-to: #6b21a8;
  --col-bubble-pl-border: #c026d3;
  --col-text-accent: #c4b5fd;
  --col-text-secondary: #a78bfa;
  --col-glow1: #a855f7;
  --col-glow2: #22d3ee;
  --col-header-bg: rgba(0,0,0,0.85);
}

/* ====================== THÈMES SPÉCIFIQUES ====================== */
body.theme-foret {
  --col-accent: #4ade80; --col-accent2: #86efac; --col-border: #16a34a; --col-border-light: #4ade80;
  --col-bg: #030f05; --col-sidebar: rgba(5,22,11,0.97); --col-btn-from: #15803d; --col-btn-to: #166534;
  --col-bubble-gm-from: #052e16; --col-bubble-gm-to: #14532d; --col-bubble-gm-border: #16a34a;
  --col-bubble-pl-from: #14532d; --col-bubble-pl-to: #166534; --col-bubble-pl-border: #4ade80;
  --col-text-accent: #bbf7d0; --col-text-secondary: #86efac; --col-glow1: #4ade80; --col-glow2: #a3e635;
  --col-header-bg: rgba(0,8,2,0.88);
}

body.theme-desert {
  --col-accent: #fb923c; --col-accent2: #fbbf24; --col-border: #b45309; --col-border-light: #fb923c;
  --col-bg: #0f0700; --col-sidebar: rgba(20,10,0,0.97); --col-btn-from: #b45309; --col-btn-to: #92400e;
  --col-bubble-gm-from: #1c0f00; --col-bubble-gm-to: #451a03; --col-bubble-gm-border: #b45309;
  --col-bubble-pl-from: #451a03; --col-bubble-pl-to: #78350f; --col-bubble-pl-border: #fb923c;
  --col-text-accent: #fed7aa; --col-text-secondary: #fdba74; --col-glow1: #fb923c; --col-glow2: #fbbf24;
  --col-header-bg: rgba(10,4,0,0.88);
}

body.theme-chateau {
  --col-accent: #60a5fa; --col-accent2: #818cf8; --col-border: #1d4ed8; --col-border-light: #60a5fa;
  --col-bg: #020408; --col-sidebar: rgba(2,4,14,0.97); --col-btn-from: #1d4ed8; --col-btn-to: #1e3a8a;
  --col-bubble-gm-from: #0f172a; --col-bubble-gm-to: #1e3a8a; --col-bubble-gm-border: #1d4ed8;
  --col-bubble-pl-from: #1e3a8a; --col-bubble-pl-to: #1e40af; --col-bubble-pl-border: #60a5fa;
  --col-text-accent: #bfdbfe; --col-text-secondary: #93c5fd; --col-glow1: #60a5fa; --col-glow2: #818cf8;
  --col-header-bg: rgba(1,2,8,0.90);
}

body.theme-sorcier {
  --col-accent: #e879f9; --col-accent2: #a855f7; --col-border: #9333ea; --col-border-light: #e879f9;
  --col-bg: #0b0010; --col-sidebar: rgba(11,0,20,0.97); --col-btn-from: #9333ea; --col-btn-to: #7e22ce;
  --col-bubble-gm-from: #1a0030; --col-bubble-gm-to: #3b0764; --col-bubble-gm-border: #9333ea;
  --col-bubble-pl-from: #3b0764; --col-bubble-pl-to: #581c87; --col-bubble-pl-border: #e879f9;
  --col-text-accent: #f5d0fe; --col-text-secondary: #d946ef; --col-glow1: #e879f9; --col-glow2: #a855f7;
  --col-header-bg: rgba(5,0,12,0.90);
}

body {
  background-color: var(--col-bg);
  color: #ffffff;
  font-family: 'Cinzel', serif;
  transition: background-color 0.6s ease;
  overflow: hidden;
}

.rune-font { font-family: 'UnifrakturMaguntia', cursive; }
.magic-glow {
  text-shadow: 0 0 15px var(--col-glow1), 0 0 30px var(--col-glow2);
  color: #ffffff !important;
}

/* ====================== FONDS COMMUNS & THÈMES ====================== */
#bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

/* DÉSERT */
.desert-bg { display: none; position: absolute; inset: 0; }
body.theme-desert .desert-bg { display: block; }
.desert-sky {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, #7c2d00 0%, #b45309 25%, #d97706 50%, #f59e0b 70%, #fbbf24 85%, #fde68a 100%);
}
.desert-grain {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E");
  background-size: 300px; opacity: 0.4; mix-blend-mode: overlay;
}
.dune {
  position: absolute; bottom: 0; width: 200%; border-radius: 50% 50% 0 0;
}
.dune-1 { height: 38%; background: linear-gradient(180deg, #92400e 0%, #78350f 100%); animation: duneDrift 18s linear infinite; bottom: 0; opacity: 0.95; }
.dune-2 { height: 28%; background: linear-gradient(180deg, #b45309 0%, #92400e 100%); animation: duneDrift 13s linear infinite reverse; bottom: 5%; opacity: 0.85; }
.dune-3 { height: 18%; background: linear-gradient(180deg, #d97706 0%, #b45309 100%); animation: duneDrift 8s linear infinite; bottom: 12%; opacity: 0.7; }
@keyframes duneDrift { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.sand-wind { position: absolute; inset: 0; overflow: hidden; }
.wind-streak {
  position: absolute; height: 1px; background: linear-gradient(90deg, transparent, rgba(251,191,36,0.5), transparent);
  animation: windBlow linear infinite; border-radius: 2px;
}
.wind-streak:nth-child(1)  { top: 15%; width: 60%; animation-duration: 2.1s; animation-delay: 0s;   opacity: 0.6; }
.wind-streak:nth-child(2)  { top: 22%; width: 40%; animation-duration: 1.7s; animation-delay: 0.3s; opacity: 0.4; }
.wind-streak:nth-child(3)  { top: 30%; width: 70%; animation-duration: 2.5s; animation-delay: 0.8s; opacity: 0.5; height: 2px; }
.wind-streak:nth-child(4)  { top: 40%; width: 50%; animation-duration: 1.9s; animation-delay: 1.2s; opacity: 0.35; }
.wind-streak:nth-child(5)  { top: 50%; width: 80%; animation-duration: 3.1s; animation-delay: 0.5s; opacity: 0.6; height: 2px; }
.wind-streak:nth-child(6)  { top: 58%; width: 45%; animation-duration: 2.3s; animation-delay: 1.5s; opacity: 0.45; }
.wind-streak:nth-child(7)  { top: 67%; width: 65%; animation-duration: 1.8s; animation-delay: 0.2s; opacity: 0.55; }
.wind-streak:nth-child(8)  { top: 75%; width: 35%; animation-duration: 2.8s; animation-delay: 1.0s; opacity: 0.4; }
.wind-streak:nth-child(9)  { top: 10%; width: 55%; animation-duration: 2.0s; animation-delay: 0.7s; opacity: 0.3; }
.wind-streak:nth-child(10) { top: 85%; width: 75%; animation-duration: 1.6s; animation-delay: 0.4s; opacity: 0.5; height: 2px; }
@keyframes windBlow { 0% { transform: translateX(110vw); } 100% { transform: translateX(-150vw); } }
.heat-haze {
  position: absolute; bottom: 30%; left: 0; right: 0; height: 120px;
  background: linear-gradient(180deg, transparent, rgba(251,191,36,0.15), transparent);
  animation: heatPulse 4s ease-in-out infinite;
}
@keyframes heatPulse { 0%, 100% { opacity: 0.4; transform: scaleY(1); } 50% { opacity: 0.8; transform: scaleY(1.3); } }

/* FORÊT */
.foret-bg { display: none; position: absolute; inset: 0; }
body.theme-foret .foret-bg { display: block; }
.foret-sky {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, #020c04 0%, #052e16 30%, #14532d 60%, #15803d 80%, #166534 100%);
}
.god-rays { position: absolute; inset: 0; overflow: hidden; }
.ray {
  position: absolute; top: -10%; width: 60px; height: 120%; background: linear-gradient(180deg, rgba(134,239,172,0.18), transparent);
  transform-origin: top center; filter: blur(8px); animation: rayFlicker ease-in-out infinite;
}
.ray:nth-child(1) { left: 8%;  transform: rotate(-15deg); animation-duration: 7s;  animation-delay: 0s;   opacity: 0.7; }
.ray:nth-child(2) { left: 20%; transform: rotate(-8deg);  animation-duration: 9s;  animation-delay: 1.5s; opacity: 0.5; width: 40px; }
.ray:nth-child(3) { left: 35%; transform: rotate(5deg);   animation-duration: 11s; animation-delay: 3s;   opacity: 0.6; width: 80px; }
.ray:nth-child(4) { left: 55%; transform: rotate(-12deg); animation-duration: 8s;  animation-delay: 2s;   opacity: 0.4; }
.ray:nth-child(5) { left: 70%; transform: rotate(10deg);  animation-duration: 13s; animation-delay: 0.5s; opacity: 0.65; width: 50px; }
.ray:nth-child(6) { left: 85%; transform: rotate(-5deg);  animation-duration: 6s;  animation-delay: 4s;   opacity: 0.5; width: 35px; }
@keyframes rayFlicker { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.15; } }
.leaves-layer { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.leaf {
  position: absolute; top: -30px; font-size: 14px; animation: leafFall linear infinite; will-change: transform;
}
.leaf:nth-child(1)  { left: 5%;  animation-duration: 8s;  animation-delay: 0s;   font-size: 12px; }
.leaf:nth-child(2)  { left: 15%; animation-duration: 12s; animation-delay: 2s;   font-size: 16px; }
.leaf:nth-child(3)  { left: 25%; animation-duration: 9s;  animation-delay: 4s;   font-size: 10px; }
.leaf:nth-child(4)  { left: 38%; animation-duration: 14s; animation-delay: 1s;   font-size: 14px; }
.leaf:nth-child(5)  { left: 50%; animation-duration: 10s; animation-delay: 6s;   font-size: 18px; }
.leaf:nth-child(6)  { left: 62%; animation-duration: 11s; animation-delay: 3s;   font-size: 12px; }
.leaf:nth-child(7)  { left: 74%; animation-duration: 7s;  animation-delay: 5s;   font-size: 10px; }
.leaf:nth-child(8)  { left: 85%; animation-duration: 13s; animation-delay: 0.5s; font-size: 16px; }
.leaf:nth-child(9)  { left: 92%; animation-duration: 9s;  animation-delay: 7s;   font-size: 14px; }
.leaf:nth-child(10) { left: 45%; animation-duration: 15s; animation-delay: 2.5s; font-size: 11px; }
@keyframes leafFall {
  0%   { transform: translateY(-30px) rotate(0deg) translateX(0); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 0.7; }
  100% { transform: translateY(110vh) rotate(720deg) translateX(80px); opacity: 0; }
}
.forest-mist { position: absolute; bottom: 0; left: 0; right: 0; height: 200px; overflow: hidden; }
.mist-cloud {
  position: absolute; bottom: 0; height: 120px; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(134,239,172,0.12), transparent 70%);
  filter: blur(20px); animation: mistDrift ease-in-out infinite;
}
.mist-cloud:nth-child(1) { width: 500px; left: -100px; animation-duration: 14s; animation-delay: 0s; }
.mist-cloud:nth-child(2) { width: 400px; left: 30%;    animation-duration: 18s; animation-delay: 3s; }
.mist-cloud:nth-child(3) { width: 600px; left: 60%;    animation-duration: 12s; animation-delay: 6s; }
@keyframes mistDrift { 0%, 100% { transform: translateX(0) scaleY(1); opacity: 0.6; } 50% { transform: translateX(40px) scaleY(1.3); opacity: 1; } }

/* CHÂTEAU */
.chateau-bg { display: none; position: absolute; inset: 0; }
body.theme-chateau .chateau-bg { display: block; }
.chateau-sky {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, #000000 0%, #020408 20%, #0a0e1a 50%, #0f172a 75%, #1e293b 100%);
}
.chateau-mist { position: absolute; bottom: 0; left: 0; right: 0; height: 300px; overflow: hidden; }
.mist-strip {
  position: absolute; bottom: 0; height: 80px;
  background: linear-gradient(90deg, transparent, rgba(96,165,250,0.08), rgba(148,163,184,0.12), transparent);
  filter: blur(15px); animation: mistCrawl linear infinite; border-radius: 50%;
}
.mist-strip:nth-child(1) { width: 120%; left: -10%; animation-duration: 20s; animation-delay: 0s;  bottom: 0;    }
.mist-strip:nth-child(2) { width: 140%; left: -20%; animation-duration: 27s; animation-delay: 5s;  bottom: 30px; height: 60px; opacity: 0.7; }
.mist-strip:nth-child(3) { width: 110%; left: -5%;  animation-duration: 16s; animation-delay: 10s; bottom: 60px; height: 50px; opacity: 0.5; }
.mist-strip:nth-child(4) { width: 130%; left: -15%; animation-duration: 22s; animation-delay: 2s;  bottom: 100px; height: 40px; opacity: 0.4; }
@keyframes mistCrawl { 0% { transform: translateX(-20%); } 100% { transform: translateX(20%); } }
.lightning-layer { position: absolute; inset: 0; pointer-events: none; }
.lightning-flash {
  position: absolute; inset: 0; background: rgba(147,197,253,0.03); animation: lightningFlicker ease-in-out infinite;
}
.lightning-flash:nth-child(1) { animation-duration: 7s;  animation-delay: 0s; }
.lightning-flash:nth-child(2) { animation-duration: 11s; animation-delay: 3.5s; }
.lightning-flash:nth-child(3) { animation-duration: 13s; animation-delay: 7s; }
@keyframes lightningFlicker {
  0%, 92%, 96%, 100% { opacity: 0; }
  93% { opacity: 1; background: rgba(147,197,253,0.08); }
  94% { opacity: 0; }
  95% { opacity: 0.7; }
}
.castle-silhouette {
  position: absolute; bottom: 15%; left: 50%; transform: translateX(-50%);
  width: 600px; height: 200px; opacity: 0.15; background: #0a0e1a;
  clip-path: polygon(0% 100%, 0% 70%, 5% 70%, 5% 50%, 8% 50%, 8% 70%, 12% 70%, 12% 30%, 14% 30%, 14% 20%, 16% 20%, 16% 30%, 18% 30%, 18% 70%, 22% 70%, 22% 40%, 30% 40%, 30% 10%, 32% 10%, 32% 0%, 34% 0%, 34% 10%, 36% 10%, 36% 40%, 44% 40%, 44% 0%, 46% 0%, 46% 40%, 54% 40%, 54% 0%, 56% 0%, 56% 40%, 64% 40%, 64% 10%, 66% 10%, 66% 0%, 68% 0%, 68% 10%, 70% 10%, 70% 40%, 78% 40%, 78% 70%, 82% 70%, 82% 30%, 84% 30%, 84% 20%, 86% 20%, 86% 30%, 88% 30%, 88% 70%, 92% 70%, 92% 50%, 95% 50%, 95% 70%, 100% 70%, 100% 100%);
}
.shadow-veil {
  position: absolute; top: 0; width: 120px; height: 100%;
  background: linear-gradient(90deg, rgba(0,0,0,0.4), transparent); filter: blur(30px);
  animation: veilFloat ease-in-out infinite;
}
.shadow-veil:nth-child(1) { left: 10%; animation-duration: 15s; animation-delay: 0s; }
.shadow-veil:nth-child(2) { left: 40%; animation-duration: 20s; animation-delay: 5s; }
.shadow-veil:nth-child(3) { left: 70%; animation-duration: 17s; animation-delay: 9s; }
@keyframes veilFloat { 0%, 100% { transform: translateX(0) scaleX(1); opacity: 0.5; } 50% { transform: translateX(30px) scaleX(1.5); opacity: 0.9; } }

/* SORCIER */
.sorcier-bg { display: none; position: absolute; inset: 0; }
body.theme-sorcier .sorcier-bg { display: block; }
.sorcier-sky {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 30% 40%, #3b0764 0%, #1a0030 40%, #0b0010 70%, #000005 100%);
}
.rune-layer { position: absolute; inset: 0; overflow: hidden; }
.rune-circle {
  position: absolute; border-radius: 50%; border: 1px solid rgba(232,121,249,0.15); animation: runeSpin linear infinite;
}
.rune-circle::before {
  content: ''; position: absolute; inset: 8px; border-radius: 50%; border: 1px dashed rgba(168,85,247,0.1);
}
.rune-circle:nth-child(1) { width: 600px; height: 600px; top: 50%; left: 50%; margin: -300px;  animation-duration: 60s; }
.rune-circle:nth-child(2) { width: 400px; height: 400px; top: 20%; left: 20%;                  animation-duration: 45s; animation-direction: reverse; border-color: rgba(168,85,247,0.1); }
.rune-circle:nth-child(3) { width: 250px; height: 250px; top: 60%; left: 70%;                  animation-duration: 30s; border-color: rgba(232,121,249,0.08); }
@keyframes runeSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.magic-flux { position: absolute; inset: 0; overflow: hidden; }
.flux-line {
  position: absolute; border-radius: 50%; border: 1px solid transparent;
  border-top-color: rgba(232,121,249,0.4); border-left-color: rgba(168,85,247,0.2);
  animation: fluxOrbit linear infinite;
}
.flux-line:nth-child(1) { width: 300px; height: 100px; top: 30%; left: 50%; margin-left: -150px;   animation-duration: 8s; }
.flux-line:nth-child(2) { width: 200px; height: 60px;  top: 60%; left: 30%;                        animation-duration: 5s; animation-direction: reverse; border-top-color: rgba(168,85,247,0.5); }
.flux-line:nth-child(3) { width: 400px; height: 150px; top: 50%; left: 50%; margin: -75px -200px;  animation-duration: 12s; opacity: 0.6; }
.flux-line:nth-child(4) { width: 150px; height: 50px;  top: 15%; left: 70%;                        animation-duration: 6s; border-top-color: rgba(232,121,249,0.6); }
@keyframes fluxOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.sparks-layer { position: absolute; inset: 0; overflow: hidden; }
.spark {
  position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #e879f9;
  box-shadow: 0 0 6px #e879f9, 0 0 12px #a855f7; animation: sparkTwinkle ease-in-out infinite;
}
.spark:nth-child(1)  { top: 15%; left: 10%; animation-duration: 2.5s; animation-delay: 0s;    }
.spark:nth-child(2)  { top: 30%; left: 25%; animation-duration: 3.1s; animation-delay: 0.4s;  }
.spark:nth-child(3)  { top: 20%; left: 45%; animation-duration: 2.8s; animation-delay: 0.9s;  }
.spark:nth-child(4)  { top: 60%; left: 60%; animation-duration: 3.5s; animation-delay: 1.3s;  }
.spark:nth-child(5)  { top: 75%; left: 30%; animation-duration: 2.2s; animation-delay: 0.6s;  }
.spark:nth-child(6)  { top: 45%; left: 75%; animation-duration: 4.0s; animation-delay: 1.8s;  }
.spark:nth-child(7)  { top: 85%; left: 80%; animation-duration: 2.7s; animation-delay: 0.2s;  }
.spark:nth-child(8)  { top: 10%; left: 55%; animation-duration: 3.3s; animation-delay: 1.0s;  }
.spark:nth-child(9)  { top: 50%; left: 15%; animation-duration: 2.9s; animation-delay: 2.1s;  }
.spark:nth-child(10) { top: 35%; left: 88%; animation-duration: 3.7s; animation-delay: 0.7s;  }
.spark:nth-child(11) { top: 65%; left: 50%; animation-duration: 2.4s; animation-delay: 1.5s;  }
.spark:nth-child(12) { top: 90%; left: 20%; animation-duration: 3.0s; animation-delay: 0.3s;  }
@keyframes sparkTwinkle {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50%       { opacity: 1; transform: scale(1.5); }
}
.magic-aura {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 80vw; height: 80vh; background: radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%);
  animation: auraPulse 5s ease-in-out infinite; pointer-events: none;
}
@keyframes auraPulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; } 50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } }

/* ====================== UI COMMUNE ====================== */
#theme-band { display: flex; gap: 10px; flex-wrap: nowrap; }
.theme-btn {
  padding: 7px 16px; border-radius: 9999px; font-size: 0.85rem; font-weight: 600;
  border: 2px solid transparent; background: rgba(255,255,255,0.07); color: #e2e8f0;
  transition: all 0.3s ease; white-space: nowrap; cursor: pointer;
}
.theme-btn:hover { transform: scale(1.06); background: rgba(255,255,255,0.12); }
.theme-btn.active {
  border-color: var(--col-accent); background: rgba(255,255,255,0.15); box-shadow: 0 0 18px var(--col-accent);
}
.sidebar { background: var(--col-sidebar); }
.chat-bubble-gm {
  background: linear-gradient(135deg, var(--col-bubble-gm-from), var(--col-bubble-gm-to));
  border: 1px solid var(--col-bubble-gm-border);
}
.chat-bubble-player {
  background: linear-gradient(135deg, var(--col-bubble-pl-from), var(--col-bubble-pl-to));
  border: 1px solid var(--col-bubble-pl-border);
}
`;

// ====================== FONCTIONS ======================
function injectThemeStyles() {
  if (document.getElementById('theme-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'theme-styles';
  styleEl.textContent = themeStyles;
  document.head.appendChild(styleEl);
}

function setTheme(themeKey, btn = null) {
  if (!THEMES_CONFIG[themeKey]) return;

  document.body.className = `${THEMES_CONFIG[themeKey].className} text-white min-h-screen`;

  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const headerIcon = document.getElementById('header-icon');
  if (headerIcon) headerIcon.textContent = THEMES_CONFIG[themeKey].icon;
}

window.THEMES_CONFIG = THEMES_CONFIG;
window.setTheme = setTheme;
window.injectThemeStyles = injectThemeStyles;
