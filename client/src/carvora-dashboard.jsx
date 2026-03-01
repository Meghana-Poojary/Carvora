import { useState, useRef, useEffect, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Barlow+Condensed:wght@300;400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080808; --bg2: #0d0d0d; --surface: #111111; --surface2: #161616;
    --surface3: #1a1a1a; --border: #222222; --border2: #2a2a2a;
    --accent: #e8a020; --accent2: #ff6b1a;
    --text: #f0ede8; --text-muted: #7a7570; --text-dim: #3a3530;
    --green: #22c55e; --red: #ef4444;
  }

  html, body { height: 100%; overflow: hidden; }
  body { background: var(--bg); color: var(--text); font-family: 'Barlow', sans-serif; font-weight: 300; }
  body::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.4;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  }

  .app { display: flex; height: 100vh; overflow: hidden; }

  /* ── SIDEBAR ── */
  .sidebar { width: 220px; flex-shrink: 0; background: var(--bg2); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 100; }
  .sidebar-logo { padding: 24px 24px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .logo-text { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 4px; color: var(--text); }
  .logo-text span { color: var(--accent); }
  .sidebar-nav { flex: 1; padding: 16px 0; overflow-y: auto; }
  .nav-section-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--text-dim); padding: 16px 24px 8px; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 24px; cursor: pointer; transition: background 0.15s; position: relative; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted); border: none; background: none; width: 100%; text-align: left; }
  .nav-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--accent); transform: scaleY(0); transition: transform 0.2s; }
  .nav-item:hover { background: rgba(255,255,255,0.02); color: var(--text); }
  .nav-item.active { background: rgba(232,160,32,0.06); color: var(--text); }
  .nav-item.active::before { transform: scaleY(1); }
  .nav-icon { width: 16px; height: 16px; opacity: 0.7; flex-shrink: 0; }
  .nav-item.active .nav-icon, .nav-item:hover .nav-icon { opacity: 1; }
  .sidebar-footer { padding: 16px 24px; border-top: 1px solid var(--border); }
  .user-chip { display: flex; align-items: center; gap: 10px; }
  .user-avatar { width: 32px; height: 32px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%); font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: var(--bg); letter-spacing: 1px; flex-shrink: 0; }
  .user-info { flex: 1; min-width: 0; }
  .user-name { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; letter-spacing: 1px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-plan { font-size: 11px; color: var(--accent); letter-spacing: 1px; }

  /* ── MAIN ── */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  /* ── TOPBAR ── */
  .topbar { height: 56px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; flex-shrink: 0; background: var(--bg); }
  .topbar-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 4px; color: var(--text); }
  .topbar-title span { color: var(--accent); }

  /* VORA AI button */
  .vora-btn { display: flex; align-items: center; gap: 8px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 600; color: var(--bg); background: linear-gradient(135deg, var(--accent), var(--accent2)); border: none; cursor: pointer; padding: 9px 22px; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%); transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s; position: relative; overflow: hidden; }
  .vora-btn::after { content: ''; position: absolute; inset: 0; background: white; opacity: 0; transition: opacity 0.2s; }
  .vora-btn:hover::after { opacity: 0.1; }
  .vora-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(232,160,32,0.3); }
  .vora-btn-pulse { width: 6px; height: 6px; background: var(--bg); border-radius: 50%; animation: vorapulse 2s ease-in-out infinite; flex-shrink: 0; }
  @keyframes vorapulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.65)} }

  /* ── CONTENT ── */
  .content { flex: 1; display: flex; overflow: hidden; }

  /* ── LEFT PANEL ── */
  .left-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; border-right: 1px solid var(--border); min-width: 300px; }
  .left-inner { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .pane-top { overflow: hidden; display: flex; flex-direction: column; min-height: 100px; }
  .pane-bottom { overflow: hidden; display: flex; flex-direction: column; min-height: 60px; background: var(--bg2); }
  .pane-bottom-label { padding: 9px 20px 8px; border-bottom: 1px solid var(--border); font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--text-dim); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .pane-bottom-label em { color: var(--accent); font-style: normal; }

  /* ── RESIZE HANDLE ── */
  .resize-handle { height: 7px; flex-shrink: 0; background: var(--bg); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); cursor: ns-resize; display: flex; align-items: center; justify-content: center; transition: background 0.2s; user-select: none; z-index: 10; }
  .resize-handle:hover, .resize-handle.dragging { background: rgba(232,160,32,0.07); border-color: rgba(232,160,32,0.3); }
  .rh-dots { display: flex; gap: 3px; pointer-events: none; }
  .rh-dot { width: 3px; height: 3px; background: var(--text-dim); border-radius: 50%; transition: background 0.2s; }
  .resize-handle:hover .rh-dot, .resize-handle.dragging .rh-dot { background: var(--accent); }

  /* ── TABS ── */
  .tabs { display: flex; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .tab { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; padding: 13px 22px; cursor: pointer; color: var(--text-muted); border: none; background: none; position: relative; transition: color 0.2s; display: flex; align-items: center; gap: 8px; }
  .tab::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--accent), var(--accent2)); transform: scaleX(0); transition: transform 0.2s; }
  .tab:hover { color: var(--text); }
  .tab.active { color: var(--text); }
  .tab.active::after { transform: scaleX(1); }
  .tab-badge { background: var(--surface3); border: 1px solid var(--border); color: var(--text-muted); font-size: 10px; padding: 1px 6px; letter-spacing: 1px; }

  /* ── SCANNER PANEL ── */
  .scanner-panel { flex: 1; overflow-y: auto; padding: 18px 22px; display: flex; flex-direction: column; gap: 14px; }
  .scanner-panel::-webkit-scrollbar { width: 3px; }
  .scanner-panel::-webkit-scrollbar-thumb { background: var(--border); }

  /* ── UPLOAD ZONE ── */
  .upload-zone { border: 1px dashed var(--border2); background: var(--surface); padding: 36px 24px; display: flex; flex-direction: column; align-items: center; gap: 14px; cursor: pointer; transition: all 0.25s; position: relative; overflow: hidden; text-align: center; }
  .upload-zone::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(232,160,32,0.05) 0%, transparent 70%); opacity: 0; transition: opacity 0.3s; }
  .upload-zone:hover, .upload-zone.drag { border-color: var(--accent); border-style: solid; }
  .upload-zone:hover::before, .upload-zone.drag::before { opacity: 1; }
  .upload-zone-icon { width: 54px; height: 54px; background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%); }
  .upload-zone h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
  .upload-zone p { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
  .upload-formats { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
  .fmt { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 3px 10px; border: 1px solid var(--border); color: var(--text-dim); }

  /* ── PREVIEW ── */
  .preview-box { position: relative; background: var(--surface); border: 1px solid var(--border); overflow: hidden; animation: fadeUp 0.4s ease; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .preview-img { width: 100%; max-height: 210px; object-fit: cover; display: block; }
  .preview-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(8,8,8,0.6); }
  .scan-ring { width: 68px; height: 68px; border: 2px solid var(--accent); border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; position: relative; }
  .scan-ring::after { content: ''; position: absolute; inset: 6px; border: 1px solid rgba(232,160,32,0.3); border-top-color: transparent; border-radius: 50%; animation: spin 1.2s linear infinite reverse; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .scan-line { position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); animation: scanMove 1.5s ease-in-out infinite; }
  @keyframes scanMove { 0%{top:0;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
  .preview-clear { position: absolute; top: 10px; right: 10px; background: rgba(8,8,8,0.85); border: 1px solid var(--border); color: var(--text-muted); width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 11px; transition: all 0.2s; }
  .preview-clear:hover { color: var(--text); border-color: var(--text-muted); }

  /* ── RESULT CARD ── */
  .result-card { background: var(--surface); border: 1px solid var(--border); position: relative; overflow: hidden; animation: fadeUp 0.5s ease; }
  .result-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--accent), var(--accent2)); }
  .result-header { padding: 14px 18px 12px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .result-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); }
  .confidence-pill { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 2px; color: var(--bg); background: linear-gradient(90deg, var(--accent), var(--accent2)); padding: 4px 12px; clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%); }
  .result-main { padding: 14px 18px; display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; border-bottom: 1px solid var(--border); }
  .rf-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 3px; }
  .rf-value { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 2px; color: var(--text); line-height: 1; }
  .rf-value.sm { font-size: 18px; }
  .result-specs { padding: 12px 18px; display: flex; gap: 18px; flex-wrap: wrap; }
  .spec-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-dim); }
  .spec-val { font-size: 12px; font-weight: 500; color: var(--text-muted); }
  .result-actions { padding: 12px 18px; border-top: 1px solid var(--border); display: flex; gap: 8px; }
  .btn-sm { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; padding: 7px 14px; border: 1px solid var(--border); background: none; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
  .btn-sm:hover { border-color: var(--accent); color: var(--accent); }
  .btn-sm.filled { background: var(--accent); color: var(--bg); border-color: var(--accent); font-weight: 600; }
  .btn-sm.filled:hover { background: var(--accent2); border-color: var(--accent2); color: var(--bg); }

  /* ── HISTORY ── */
  .history-toolbar { padding: 12px 20px 0; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .history-count { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); }
  .history-count span { color: var(--accent); }
  .history-clear { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; background: none; border: none; color: var(--text-dim); cursor: pointer; transition: color 0.2s; }
  .history-clear:hover { color: var(--red); }
  .history-panel { flex: 1; overflow-y: auto; padding: 10px 18px; display: flex; flex-direction: column; gap: 8px; }
  .history-panel::-webkit-scrollbar { width: 3px; }
  .history-panel::-webkit-scrollbar-thumb { background: var(--border); }
  .history-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--text-dim); text-align: center; padding: 40px 0; }
  .history-empty-icon { font-size: 32px; opacity: 0.25; }
  .history-empty p { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
  .history-item { background: var(--surface); border: 1px solid var(--border); padding: 12px 14px; cursor: pointer; transition: all 0.2s; position: relative; display: flex; gap: 12px; align-items: flex-start; overflow: hidden; }
  .history-item::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, var(--accent), var(--accent2)); transform: scaleY(0); transition: transform 0.2s; transform-origin: bottom; }
  .history-item:hover { border-color: var(--border2); background: var(--surface2); }
  .history-item:hover::after { transform: scaleY(1); }
  .hi-thumb { width: 50px; height: 38px; background: var(--surface3); border: 1px solid var(--border); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 15px; overflow: hidden; }
  .hi-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .hi-info { flex: 1; min-width: 0; }
  .hi-car { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
  .hi-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-dim); }
  .hi-conf { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 1px; color: var(--accent); }
  .hi-time { font-size: 11px; color: var(--text-dim); margin-left: auto; flex-shrink: 0; }

  /* ── RIGHT PANEL / CHAT ── */
  .right-panel { width: 360px; flex-shrink: 0; display: flex; flex-direction: column; background: var(--bg2); overflow: hidden; min-width: 260px; border-left: 1px solid var(--border); }
  .chat-header { padding: 13px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .chat-header-icon { width: 32px; height: 32px; background: linear-gradient(135deg, rgba(232,160,32,0.15), rgba(255,107,26,0.1)); border: 1px solid rgba(232,160,32,0.3); display: flex; align-items: center; justify-content: center; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%); flex-shrink: 0; }
  .chat-title { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
  .chat-subtitle { font-size: 11px; color: var(--text-muted); }
  .chat-status { margin-left: auto; display: flex; align-items: center; gap: 5px; font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--green); }
  .status-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; animation: statuspulse 2s ease-in-out infinite; }
  @keyframes statuspulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  .chat-messages { overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column; gap: 12px; }
  .chat-messages::-webkit-scrollbar { width: 3px; }
  .chat-messages::-webkit-scrollbar-thumb { background: var(--border); }
  .msg { display: flex; gap: 8px; animation: fadeUp 0.3s ease; }
  .msg.user { flex-direction: row-reverse; }
  .msg-avatar { width: 26px; height: 26px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%); }
  .msg.bot .msg-avatar { background: linear-gradient(135deg, rgba(232,160,32,0.2), rgba(255,107,26,0.15)); border: 1px solid rgba(232,160,32,0.3); }
  .msg.user .msg-avatar { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: var(--bg); font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; }
  .msg-bubble { max-width: 84%; padding: 9px 13px; font-size: 12.5px; line-height: 1.65; }
  .msg.bot .msg-bubble { background: var(--surface); border: 1px solid var(--border); color: var(--text); border-radius: 0 4px 4px 4px; }
  .msg.user .msg-bubble { background: rgba(232,160,32,0.09); border: 1px solid rgba(232,160,32,0.22); color: var(--text); border-radius: 4px 0 4px 4px; }
  .msg-time { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1px; color: var(--text-dim); margin-top: 3px; display: block; }
  .msg.user .msg-time { text-align: right; }
  .typing-indicator { display: flex; gap: 4px; padding: 4px 0; align-items: center; }
  .typing-dot { width: 5px; height: 5px; background: var(--accent); border-radius: 50%; animation: typingDot 1.2s ease-in-out infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-5px);opacity:1} }
  .quick-prompts { padding: 8px 14px; display: flex; flex-wrap: wrap; gap: 5px; flex-shrink: 0; }
  .quick-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; padding: 5px 11px; border: 1px solid var(--border); background: none; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
  .quick-btn:hover { border-color: var(--accent); color: var(--accent); }
  .chat-input-area { padding: 10px 14px; border-top: 1px solid var(--border); flex-shrink: 0; }
  .chat-input-wrap { display: flex; gap: 7px; align-items: flex-end; }
  .chat-input { flex: 1; background: var(--surface); border: 1px solid var(--border); color: var(--text); font-family: 'Barlow', sans-serif; font-size: 13px; padding: 8px 12px; resize: none; outline: none; transition: border-color 0.2s; max-height: 90px; line-height: 1.5; min-height: 36px; }
  .chat-input:focus { border-color: rgba(232,160,32,0.4); }
  .chat-input::placeholder { color: var(--text-dim); }
  .chat-send { width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent), var(--accent2)); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%); transition: opacity 0.2s, transform 0.1s; flex-shrink: 0; }
  .chat-send:hover { opacity: 0.9; transform: translateY(-1px); }
  .chat-send:disabled { opacity: 0.3; cursor: default; transform: none; }

  body.resizing * { cursor: ns-resize !important; user-select: none !important; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); }
`;

// ── Data ──────────────────────────────────────────────────────────────────────
const MOCK_RESULTS = [
  { brand:"Porsche",     model:"911 Carrera S",   year:"2023", trim:"Coupe PDK",    confidence:97, hp:"450hp", torque:"530Nm", origin:"Germany", type:"Sports Car",   price:"$135,000" },
  { brand:"Ferrari",     model:"Roma",            year:"2022", trim:"V8 GT",        confidence:94, hp:"620hp", torque:"760Nm", origin:"Italy",   type:"Grand Tourer", price:"$230,000" },
  { brand:"BMW",         model:"M3 Competition",  year:"2024", trim:"xDrive Sedan", confidence:98, hp:"503hp", torque:"650Nm", origin:"Germany", type:"Sport Sedan",  price:"$75,000"  },
  { brand:"Lamborghini", model:"Huracán EVO",     year:"2021", trim:"AWD Coupé",    confidence:96, hp:"640hp", torque:"600Nm", origin:"Italy",   type:"Supercar",     price:"$280,000" },
];

const INITIAL_MESSAGES = [
  { id:1, role:"bot", text:"Hey! I'm VORA, your automotive AI assistant. Scan a car image and I'll help you explore specs, history, market values, and everything else about it. What are you curious about?", time:"Just now" },
];

const BOT_REPLIES = {
  default:["Great question! Based on typical performance cars in this class, you're looking at exceptional engineering. Want me to compare it with similar models?","That's a fascinating vehicle choice. The heritage behind this manufacturer goes back decades of racing excellence. Shall I pull up more historical context?","Interesting! This variant is one of the rarer trims in production. Let me know if you'd like market pricing or collector value estimates."],
  speed:  ["Top speed is electronically limited to 307 km/h, though in track trim it pushes beyond 320 km/h. The 0–100 sprint clocks in at just 3.4 seconds."],
  price:  ["Current market value sits between $128K–$142K for a CPO example. New MSRP starts at $135,000. Collector editions command a 15–25% premium."],
  compare:["Compared to its rivals — Ferrari Roma and Aston Martin Vantage — this model offers the best power-to-weight ratio at 2.92 kg/hp while maintaining daily usability."],
  history:["This model line debuted in 1963 and has gone through 8 generations. The current generation introduced a wider body, new 8-speed PDK, and turbocharged flat-six."],
};

function getReply(t) {
  t = t.toLowerCase();
  if (t.includes("speed")||t.includes("fast")||t.includes("accelerat")) return BOT_REPLIES.speed[0];
  if (t.includes("price")||t.includes("cost")||t.includes("worth")||t.includes("value")) return BOT_REPLIES.price[0];
  if (t.includes("compare")||t.includes("vs")||t.includes("rival")) return BOT_REPLIES.compare[0];
  if (t.includes("history")||t.includes("origin")||t.includes("old")) return BOT_REPLIES.history[0];
  return BOT_REPLIES.default[Math.floor(Math.random()*BOT_REPLIES.default.length)];
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const WheelIcon = ({ size=16, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="13" stroke={color} strokeWidth="1.5"/>
    <circle cx="16" cy="16" r="3.5" fill={color}/>
    {[0,72,144,216,288].map((a,i)=>{
      const r1=(a-18)*Math.PI/180, r2=(a+12)*Math.PI/180;
      return <line key={i} x1={16+4*Math.cos(r1)} y1={16+4*Math.sin(r1)} x2={16+12.2*Math.cos(r2)} y2={16+12.2*Math.sin(r2)} stroke={color} strokeWidth="2" strokeLinecap="round"/>;
    })}
  </svg>
);

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e8a020" strokeWidth="1.5" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
  </svg>
);

// ── Resize hook ───────────────────────────────────────────────────────────────
function useVerticalResize(containerRef, initialPct=60, minTopPx=100, minBotPx=60) {
  const [pct, setPct] = useState(initialPct);
  const [active, setActive] = useState(false);
  const startY = useRef(0);
  const startPct = useRef(0);

  const onMouseDown = useCallback((e) => {
    startY.current = e.clientY;
    startPct.current = pct;
    setActive(true);
    document.body.classList.add("resizing");
    e.preventDefault();
  }, [pct]);

  useEffect(() => {
    const onMove = (e) => {
      if (!active || !containerRef.current) return;
      const h = containerRef.current.getBoundingClientRect().height;
      const delta = ((e.clientY - startY.current) / h) * 100;
      const next = Math.min(Math.max(startPct.current + delta, (minTopPx/h)*100), 100-(minBotPx/h)*100);
      setPct(next);
    };
    const onUp = () => { setActive(false); document.body.classList.remove("resizing"); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [active, containerRef, minTopPx, minBotPx]);

  return { pct, active, onMouseDown };
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function CarvoraDashboard() {
  const [activeTab, setActiveTab] = useState("scanner");
  const [dragging, setDragging]   = useState(false);
  const [scanning, setScanning]   = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult]       = useState(null);
  const [history, setHistory]     = useState([]);
  const [messages, setMessages]   = useState(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [typing, setTyping]       = useState(false);
  const [voraOpen, setVoraOpen]   = useState(true);

  const fileRef     = useRef();
  const chatEndRef  = useRef();
  const textareaRef = useRef();
  const leftRef     = useRef();
  const rightRef    = useRef();

  const leftResize  = useVerticalResize(leftRef,  62, 100, 56);
  const rightResize = useVerticalResize(rightRef, 65, 110, 100);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, typing]);

  const timeStr = () => new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

  const simulateScan = (url) => {
    setScanning(true); setResult(null); setPreviewUrl(url);
    setTimeout(() => {
      const r = MOCK_RESULTS[Math.floor(Math.random()*MOCK_RESULTS.length)];
      setResult(r); setScanning(false);
      setHistory(prev => [{ id:Date.now(), car:`${r.year} ${r.brand} ${r.model}`, confidence:r.confidence, time:timeStr(), imgUrl:url, result:r }, ...prev]);
      setTimeout(() => {
        setMessages(prev => [...prev, { id:Date.now(), role:"bot",
          text:`I detected a **${r.year} ${r.brand} ${r.model}** with ${r.confidence}% confidence! It's a ${r.type} from ${r.origin} packing ${r.hp}. Want to know more about performance, pricing, or history?`,
          time:timeStr() }]);
        setVoraOpen(true);
      }, 700);
    }, 2500);
  };

  const handleFilePick = (e) => {
    const f = e.target.files[0];
    if (f) simulateScan(URL.createObjectURL(f));
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) simulateScan(URL.createObjectURL(f));
  };

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id:Date.now(), role:"user", text, time:timeStr() }]);
    setChatInput(""); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id:Date.now()+1, role:"bot", text:getReply(text), time:timeStr() }]);
    }, 1000 + Math.random()*700);
  };

  const handleKeyDown = (e) => { if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const quickPrompt = (text) => { setChatInput(text); textareaRef.current?.focus(); setVoraOpen(true); };

  const Dots = () => <div className="rh-dots">{[0,1,2,3,4].map(i=><div key={i} className="rh-dot"/>)}</div>;

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <a href="#" className="sidebar-logo">
            <WheelIcon size={22} color="#e8a020"/>
            <span className="logo-text">CARV<span>ORA</span></span>
          </a>
          <nav className="sidebar-nav">
            <div className="nav-section-label">Workspace</div>
            <button className={`nav-item ${activeTab==="scanner"?"active":""}`} onClick={()=>setActiveTab("scanner")}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9V6a1 1 0 011-1h4M3 15v3a1 1 0 001 1h4M21 9V6a1 1 0 00-1-1h-4M21 15v3a1 1 0 01-1 1h-4M7 12h10"/></svg>
              Scanner
            </button>
            <button className={`nav-item ${activeTab==="history"?"active":""}`} onClick={()=>setActiveTab("history")}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              History
              {history.length>0 && <span className="tab-badge" style={{marginLeft:"auto"}}>{history.length}</span>}
            </button>
            <div className="nav-section-label" style={{marginTop:8}}>Account</div>
            <button className="nav-item">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
              Profile
            </button>
            <button className="nav-item">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
              Settings
            </button>
            <button className="nav-item" style={{marginTop:8}}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Sign Out
            </button>
          </nav>
          <div className="sidebar-footer">
            <div className="user-chip">
              <div className="user-avatar">JD</div>
              <div className="user-info">
                <div className="user-name">John Doe</div>
                <div className="user-plan">Pro Plan</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">

          {/* TOPBAR — only VORA AI button */}
          <div className="topbar">
            <div className="topbar-title">
              {activeTab==="scanner" ? <>CAR <span>SCANNER</span></> : <>SCAN <span>HISTORY</span></>}
            </div>
            <button className="vora-btn" onClick={()=>setVoraOpen(o=>!o)}>
              <div className="vora-btn-pulse"/>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="2.5">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              {voraOpen ? "Hide VORA" : "VORA AI"}
            </button>
          </div>

          {/* CONTENT */}
          <div className="content">

            {/* LEFT PANEL */}
            <div className="left-panel">
              <div className="tabs">
                <button className={`tab ${activeTab==="scanner"?"active":""}`} onClick={()=>setActiveTab("scanner")}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9V6a1 1 0 011-1h4M3 15v3a1 1 0 001 1h4M21 9V6a1 1 0 00-1-1h-4M21 15v3a1 1 0 01-1 1h-4M7 12h10"/></svg>
                  Scanner
                </button>
                <button className={`tab ${activeTab==="history"?"active":""}`} onClick={()=>setActiveTab("history")}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  History
                  {history.length>0 && <span className="tab-badge">{history.length}</span>}
                </button>
              </div>

              <div className="left-inner" ref={leftRef}>
                {/* TOP PANE */}
                <div className="pane-top" style={{ height:`${leftResize.pct}%` }}>
                  {activeTab === "scanner" ? (
                    <div className="scanner-panel">
                      {!previewUrl && (
                        <div className={`upload-zone ${dragging?"drag":""}`}
                          onDragOver={(e)=>{e.preventDefault();setDragging(true);}}
                          onDragLeave={()=>setDragging(false)}
                          onDrop={handleDrop}
                          onClick={()=>fileRef.current?.click()}>
                          <div className="upload-zone-icon"><UploadIcon/></div>
                          <h3>{dragging?"Release to Scan":"Drop a Car Image"}</h3>
                          <p>Upload any photo — our AI identifies make, model, year, and trim in under 2 seconds.</p>
                          <div className="upload-formats">{["JPG","PNG","WEBP","HEIC","BMP"].map(f=><span key={f} className="fmt">{f}</span>)}</div>
                          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFilePick}/>
                        </div>
                      )}

                      {previewUrl && (
                        <div className="preview-box">
                          <img src={previewUrl} alt="car" className="preview-img" style={{filter:scanning?"brightness(0.4)":"brightness(0.85)"}}/>
                          {scanning && (<><div className="preview-overlay"><div className="scan-ring"/></div><div className="scan-line"/></>)}
                          {!scanning && <button className="preview-clear" onClick={()=>{setPreviewUrl(null);setResult(null);}}>✕</button>}
                        </div>
                      )}

                      {scanning && (
                        <p style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"11px",letterSpacing:"3px",textTransform:"uppercase",color:"var(--accent)",textAlign:"center",padding:"8px 0"}}>
                          Analyzing 300+ visual features...
                        </p>
                      )}

                      {result && !scanning && (
                        <div className="result-card">
                          <div className="result-header">
                            <span className="result-eyebrow">Detection Result</span>
                            <span className="confidence-pill">{result.confidence}% Match</span>
                          </div>
                          <div className="result-main">
                            {[["Brand",result.brand,""],["Model",result.model,""],["Year",result.year,""],["Trim",result.trim,"sm"]].map(([l,v,cls])=>(
                              <div key={l}><div className="rf-label">{l}</div><div className={`rf-value ${cls}`}>{v}</div></div>
                            ))}
                          </div>
                          <div className="result-specs">
                            {[["Power",result.hp],["Torque",result.torque],["Origin",result.origin],["Type",result.type],["Est. Price",result.price]].map(([l,v])=>(
                              <div key={l}><div className="spec-label">{l}</div><div className="spec-val">{v}</div></div>
                            ))}
                          </div>
                          <div className="result-actions">
                            <button className="btn-sm filled">Save to Garage</button>
                            <button className="btn-sm" onClick={()=>quickPrompt(`Tell me about the ${result.year} ${result.brand} ${result.model}`)}>Ask AI</button>
                            <button className="btn-sm">Export PDF</button>
                            <button className="btn-sm" onClick={()=>{setPreviewUrl(null);setResult(null);}} style={{marginLeft:"auto"}}>New Scan</button>
                          </div>
                        </div>
                      )}

                      {!previewUrl && !result && (
                        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                          {["Front view works best","Avoid heavy shadows","Include the full car"].map(t=>(
                            <div key={t} style={{flex:"1",minWidth:"130px",background:"var(--surface)",border:"1px solid var(--border)",padding:"11px 14px"}}>
                              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"var(--accent)",marginBottom:"3px"}}>Tip</div>
                              <div style={{fontSize:"12px",color:"var(--text-muted)"}}>{t}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="history-toolbar">
                        <div className="history-count"><span>{history.length}</span> scan{history.length!==1?"s":""} recorded</div>
                        {history.length>0 && <button className="history-clear" onClick={()=>setHistory([])}>Clear All</button>}
                      </div>
                      <div className="history-panel">
                        {history.length===0 ? (
                          <div className="history-empty">
                            <div className="history-empty-icon">🔍</div>
                            <p>No Scans Yet</p>
                            <button className="btn-sm" style={{marginTop:"10px"}} onClick={()=>setActiveTab("scanner")}>Open Scanner</button>
                          </div>
                        ) : history.map(item=>(
                          <div className="history-item" key={item.id} onClick={()=>{setPreviewUrl(item.imgUrl);setResult(item.result);setActiveTab("scanner");}}>
                            <div className="hi-thumb">{item.imgUrl?<img src={item.imgUrl} alt=""/>:"🚗"}</div>
                            <div className="hi-info">
                              <div className="hi-car">{item.car}</div>
                              <div className="hi-meta"><span className="hi-conf">{item.confidence}% match</span><span>·</span><span style={{fontSize:"11px",color:"var(--text-dim)"}}>{item.result.type}</span></div>
                            </div>
                            <div className="hi-time">{item.time}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* LEFT DRAG HANDLE */}
                <div className={`resize-handle ${leftResize.active?"dragging":""}`} onMouseDown={leftResize.onMouseDown} title="Drag to resize">
                  <Dots/>
                </div>

                {/* BOTTOM PANE */}
                <div className="pane-bottom" style={{ flex:1 }}>
                  <div className="pane-bottom-label">
                    <span>Session <em>Notes</em></span>
                    <span style={{fontSize:"9px",letterSpacing:"1.5px",opacity:0.5}}>↕ drag handle above</span>
                  </div>
                  <div style={{flex:1,overflow:"auto",padding:"12px 18px"}}>
                    <textarea placeholder="Add notes about this scan session..." style={{width:"100%",height:"100%",minHeight:"48px",background:"transparent",border:"none",outline:"none",color:"var(--text-muted)",fontFamily:"'Barlow',sans-serif",fontSize:"13px",lineHeight:"1.7",resize:"none",caretColor:"var(--accent)"}}/>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: VORA CHAT */}
            {voraOpen && (
              <div className="right-panel" ref={rightRef}>
                <div className="chat-header">
                  <div className="chat-header-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8a020" strokeWidth="1.5">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="chat-title">VORA AI</div>
                    <div className="chat-subtitle">Automotive Intelligence</div>
                  </div>
                  <div className="chat-status"><div className="status-dot"/>Online</div>
                  <button onClick={()=>setVoraOpen(false)} style={{marginLeft:6,background:"none",border:"none",color:"var(--text-dim)",cursor:"pointer",fontSize:"13px",padding:"2px 6px",lineHeight:1,transition:"color 0.2s"}}
                    onMouseEnter={e=>e.currentTarget.style.color="var(--text-muted)"}
                    onMouseLeave={e=>e.currentTarget.style.color="var(--text-dim)"}
                  >✕</button>
                </div>

                {/* Messages top pane */}
                <div className="chat-messages" style={{ height:`${rightResize.pct}%`, flex:"none" }}>
                  {messages.map(msg=>(
                    <div className={`msg ${msg.role}`} key={msg.id}>
                      <div className="msg-avatar">{msg.role==="bot"?"⚡":"JD"}</div>
                      <div>
                        <div className="msg-bubble">
                          {msg.text.split("**").map((part,i)=>i%2===1?<strong key={i} style={{color:"var(--accent)",fontWeight:600}}>{part}</strong>:part)}
                        </div>
                        <span className="msg-time">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div className="msg bot">
                      <div className="msg-avatar">⚡</div>
                      <div className="msg-bubble"><div className="typing-indicator"><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></div></div>
                    </div>
                  )}
                  <div ref={chatEndRef}/>
                </div>

                {/* Chat drag handle */}
                <div className={`resize-handle ${rightResize.active?"dragging":""}`} onMouseDown={rightResize.onMouseDown} style={{background:"var(--bg2)"}} title="Drag to resize">
                  <Dots/>
                </div>

                {/* Quick prompts + input */}
                <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
                  <div className="quick-prompts">
                    {["Top speed?","Compare rivals","Market price","Full history"].map(q=>(
                      <button key={q} className="quick-btn" onClick={()=>quickPrompt(q)}>{q}</button>
                    ))}
                  </div>
                  <div className="chat-input-area">
                    <div className="chat-input-wrap">
                      <textarea ref={textareaRef} className="chat-input" placeholder="Ask about any car..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={handleKeyDown} rows={1}/>
                      <button className="chat-send" onClick={sendMessage} disabled={!chatInput.trim()||typing}><SendIcon/></button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
