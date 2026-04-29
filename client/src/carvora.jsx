import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Barlow+Condensed:wght@300;400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080808;
    --bg2: #0d0d0d;
    --surface: #111111;
    --surface2: #1a1a1a;
    --border: #222222;
    --accent: #e8a020;
    --accent2: #ff6b1a;
    --text: #f0ede8;
    --text-muted: #7a7570;
    --text-dim: #3a3530;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Barlow', sans-serif;
    font-weight: 300;
    overflow-x: hidden;
  }

  /* NOISE OVERLAY */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.4;
  }

  /* NAVBAR */
  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 60px;
    height: 72px;
    background: rgba(8,8,8,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: all 0.3s ease;
  }

  nav.scrolled {
    height: 60px;
    background: rgba(8,8,8,0.97);
  }

  .nav-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 4px;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .nav-logo span {
    color: var(--accent);
  }

  .logo-icon {
    width: 32px;
    height: 32px;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 48px;
    list-style: none;
  }

  .nav-links a {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s;
    position: relative;
  }

  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px; left: 0; right: 0;
    height: 1px;
    background: var(--accent);
    transform: scaleX(0);
    transition: transform 0.2s;
  }

  .nav-links a:hover { color: var(--text); }
  .nav-links a:hover::after { transform: scaleX(1); }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .btn-ghost {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 16px;
    transition: color 0.2s;
  }

  .btn-ghost:hover { color: var(--text); }

  .btn-primary {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--bg);
    background: var(--accent);
    border: none;
    cursor: pointer;
    padding: 10px 24px;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: background 0.2s, transform 0.1s;
    font-weight: 600;
  }

  .btn-primary:hover {
    background: var(--accent2);
    transform: translateY(-1px);
  }

  /* HERO */
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    padding: 0 60px;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(ellipse 70% 50% at 75% 60%, rgba(232,160,32,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 20% 30%, rgba(255,107,26,0.05) 0%, transparent 60%),
      linear-gradient(180deg, #080808 0%, #0a0806 100%);
  }

  .hero-grid {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 80px 80px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 70%);
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 680px;
    animation: fadeUp 1s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-eyebrow {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .hero-eyebrow::before {
    content: '';
    width: 40px;
    height: 1px;
    background: var(--accent);
  }

  .hero-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(72px, 10vw, 140px);
    line-height: 0.9;
    letter-spacing: 2px;
    margin-bottom: 32px;
    color: var(--text);
  }

  .hero-title .accent { color: var(--accent); }
  .hero-title .outline {
    -webkit-text-stroke: 1px rgba(240,237,232,0.3);
    color: transparent;
  }

  .hero-sub {
    font-size: 17px;
    line-height: 1.7;
    color: var(--text-muted);
    max-width: 480px;
    margin-bottom: 48px;
  }

  .hero-cta {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  .btn-large {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 15px;
    letter-spacing: 3px;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--bg);
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border: none;
    cursor: pointer;
    padding: 16px 40px;
    clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .btn-large::after {
    content: '';
    position: absolute;
    inset: 0;
    background: white;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .btn-large:hover::after { opacity: 0.1; }
  .btn-large:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(232,160,32,0.3); }

  .btn-outline-large {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 15px;
    letter-spacing: 3px;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--text-muted);
    background: none;
    border: 1px solid var(--border);
    cursor: pointer;
    padding: 16px 40px;
    transition: all 0.2s;
  }

  .btn-outline-large:hover {
    color: var(--text);
    border-color: var(--text-muted);
  }

  /* CAR SVG HERO ILLUSTRATION */
  .hero-car {
    position: absolute;
    right: -80px;
    bottom: 10%;
    width: 60%;
    max-width: 900px;
    opacity: 0;
    animation: carSlide 1.2s 0.3s ease both;
    filter: drop-shadow(0 40px 80px rgba(232,160,32,0.15));
  }

  @keyframes carSlide {
    from { opacity: 0; transform: translateX(80px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .hero-stats {
    position: absolute;
    bottom: 60px;
    left: 60px;
    right: 60px;
    display: flex;
    gap: 60px;
    animation: fadeUp 1s 0.6s ease both;
    opacity: 0;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 40px;
    color: var(--text);
    letter-spacing: 2px;
    line-height: 1;
  }

  .stat-num span { color: var(--accent); }

  .stat-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  .stat-sep {
    width: 1px;
    background: var(--border);
    height: 50px;
    align-self: center;
  }

  /* SCAN SECTION */
  .scan-section {
    padding: 140px 60px;
    position: relative;
    background: var(--bg2);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .section-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 80px;
  }

  .section-eyebrow {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 16px;
  }

  .section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 6vw, 88px);
    line-height: 1;
    letter-spacing: 2px;
  }

  .section-title .dim { color: var(--text-dim); }

  .section-desc {
    max-width: 340px;
    font-size: 15px;
    line-height: 1.8;
    color: var(--text-muted);
    text-align: right;
  }

  /* UPLOAD WIDGET */
  .upload-widget {
    position: relative;
    border: 1px solid var(--border);
    background: var(--surface);
    padding: 80px 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    cursor: pointer;
    transition: border-color 0.3s;
    overflow: hidden;
  }

  .upload-widget::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(232,160,32,0.05) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .upload-widget:hover { border-color: var(--accent); }
  .upload-widget:hover::before { opacity: 1; }

  .upload-icon {
    width: 80px;
    height: 80px;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    clip-path: polygon(20px 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%);
    background: var(--surface2);
    transition: border-color 0.3s;
  }

  .upload-widget:hover .upload-icon { border-color: var(--accent); }

  .upload-text {
    text-align: center;
  }

  .upload-text h3 {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .upload-text p {
    font-size: 14px;
    color: var(--text-muted);
  }

  .upload-formats {
    display: flex;
    gap: 8px;
  }

  .format-tag {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 4px 12px;
    border: 1px solid var(--border);
    color: var(--text-dim);
  }

  /* RESULT CARD */
  .result-card {
    border: 1px solid var(--accent);
    background: var(--surface);
    padding: 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 40px;
    position: relative;
    overflow: hidden;
    animation: fadeUp 0.5s ease;
  }

  .result-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
  }

  .result-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 8px;
  }

  .result-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 40px;
    letter-spacing: 2px;
    line-height: 1;
    color: var(--text);
  }

  .confidence-bar {
    margin-top: 32px;
    grid-column: 1/-1;
  }

  .confidence-track {
    height: 4px;
    background: var(--border);
    position: relative;
    margin-top: 12px;
  }

  .confidence-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    transition: width 1s ease;
  }

  .confidence-text {
    display: flex;
    justify-content: space-between;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    letter-spacing: 2px;
    color: var(--text-muted);
    margin-top: 8px;
  }

  /* FEATURES */
  .features-section {
    padding: 140px 60px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    margin-top: 80px;
  }

  .feature-card {
    background: var(--bg);
    padding: 48px 40px;
    position: relative;
    overflow: hidden;
    transition: background 0.3s;
  }

  .feature-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0;
    width: 0; height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    transition: width 0.4s ease;
  }

  .feature-card:hover { background: var(--surface); }
  .feature-card:hover::after { width: 100%; }

  .feature-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 72px;
    color: var(--text-dim);
    line-height: 1;
    margin-bottom: 24px;
    transition: color 0.3s;
  }

  .feature-card:hover .feature-num { color: rgba(232,160,32,0.15); }

  .feature-icon-wrap {
    width: 48px;
    height: 48px;
    background: var(--surface2);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }

  .feature-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .feature-desc {
    font-size: 14px;
    line-height: 1.8;
    color: var(--text-muted);
  }

  /* HOW IT WORKS */
  .hiw-section {
    padding: 140px 60px;
    background: var(--bg2);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .hiw-steps {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    margin-top: 80px;
    position: relative;
  }

  .hiw-steps::before {
    content: '';
    position: absolute;
    top: 36px; left: 5%; right: 5%;
    height: 1px;
    background: var(--border);
    z-index: 0;
  }

  .hiw-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 24px;
    position: relative;
    z-index: 1;
  }

  .step-circle {
    width: 72px;
    height: 72px;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg2);
    margin-bottom: 32px;
    position: relative;
    clip-path: polygon(16px 0%, 100% 0%, calc(100% - 16px) 100%, 0% 100%);
    transition: background 0.3s;
  }

  .hiw-step:hover .step-circle {
    background: var(--surface);
    border-color: var(--accent);
  }

  .step-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px;
    letter-spacing: 2px;
    color: var(--accent);
  }

  .step-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .step-desc {
    font-size: 13px;
    line-height: 1.8;
    color: var(--text-muted);
  }

  /* CTA SECTION */
  .cta-section {
    padding: 140px 60px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .cta-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(232,160,32,0.06) 0%, transparent 70%);
  }

  .cta-section .section-title {
    margin-bottom: 24px;
  }

  .cta-sub {
    font-size: 17px;
    color: var(--text-muted);
    margin-bottom: 48px;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.7;
  }

  .cta-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  /* FOOTER */
  footer {
    padding: 48px 60px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-copy {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color:  var(--text-muted);
  }

  .footer-links {
    display: flex;
    gap: 32px;
  }

  .footer-links a {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color:  var(--text-muted);
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-links a:hover { color: var(--text-muted); }

  /* MODAL */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(8px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border);
    width: 100%;
    max-width: 420px;
    position: relative;
    animation: modalUp 0.3s ease;
  }

  @keyframes modalUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .modal-header {
    padding: 40px 40px 0;
    border-bottom: 1px solid var(--border);
    padding-bottom: 24px;
    margin-bottom: 32px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .modal-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    letter-spacing: 3px;
  }

  .modal-title span { color: var(--accent); }

  .modal-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 20px;
    padding: 4px;
    transition: color 0.2s;
  }

  .modal-close:hover { color: var(--text); }

  .modal-body {
    padding: 0 40px 40px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .form-input {
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'Barlow', sans-serif;
    font-size: 15px;
    padding: 14px 16px;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
  }

  .form-input:focus { border-color: var(--accent); }
  .form-input::placeholder { color: var(--text-dim); }

  .modal-footer {
    padding: 16px 40px;
    border-top: 1px solid var(--border);
    font-size: 13px;
    color: var(--text-muted);
    text-align: center;
  }

  .modal-footer button {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    font-size: 13px;
    font-family: 'Barlow', sans-serif;
    text-decoration: underline;
  }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-dim); }
`;

// SVG Car
const CarSVG = () => (
  <svg viewBox="0 0 900 350" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%'}}>
    {/* Body shadow */}
    <ellipse cx="450" cy="330" rx="380" ry="20" fill="rgba(0,0,0,0.4)"/>
    {/* Main body */}
    <path d="M80 240 L120 180 L200 150 L300 130 L420 120 L560 125 L680 145 L760 180 L800 220 L820 240 L80 240Z" 
      fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
    {/* Roof */}
    <path d="M220 175 L280 135 L380 115 L500 112 L590 120 L650 145 L670 175Z" 
      fill="#141414" stroke="#2a2a2a" strokeWidth="1"/>
    {/* Windows */}
    <path d="M235 170 L285 138 L375 120 L485 117 L485 168Z" fill="#0d1a2a" stroke="#1a3a5a" strokeWidth="1"/>
    <path d="M495 117 L590 122 L640 142 L650 170 L495 170Z" fill="#0d1a2a" stroke="#1a3a5a" strokeWidth="1"/>
    {/* Window divider */}
    <line x1="490" y1="117" x2="490" y2="170" stroke="#2a2a2a" strokeWidth="2"/>
    {/* Hood */}
    <path d="M680 145 L760 178 L800 218 L800 240 L670 240 L670 178Z" fill="#161616" stroke="#2a2a2a" strokeWidth="1"/>
    {/* Front grille */}
    <path d="M790 215 L820 230 L820 255 L790 255Z" fill="#e8a020" opacity="0.3"/>
    <rect x="800" y="220" width="20" height="4" fill="#e8a020" opacity="0.6"/>
    <rect x="800" y="228" width="20" height="4" fill="#e8a020" opacity="0.4"/>
    <rect x="800" y="236" width="20" height="4" fill="#e8a020" opacity="0.2"/>
    {/* Headlight */}
    <path d="M792 195 L820 208 L820 225 L792 220Z" fill="#e8a020" opacity="0.8"/>
    <path d="M792 195 L820 208 L820 225 L792 220Z" fill="url(#headlight)" />
    <defs>
      <radialGradient id="headlight" cx="80%" cy="50%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#e8a020" stopOpacity="0"/>
      </radialGradient>
    </defs>
    {/* Tail light */}
    <path d="M80 215 L110 210 L110 235 L80 240Z" fill="#cc2200" opacity="0.8"/>
    {/* Door lines */}
    <line x1="400" y1="175" x2="400" y2="240" stroke="#262626" strokeWidth="1.5"/>
    <line x1="560" y1="168" x2="560" y2="240" stroke="#262626" strokeWidth="1.5"/>
    {/* Door handles */}
    <rect x="470" y="205" width="20" height="4" rx="2" fill="#333"/>
    <rect x="620" y="205" width="20" height="4" rx="2" fill="#333"/>
    {/* Front wheel */}
    <circle cx="700" cy="248" r="54" fill="#0d0d0d" stroke="#2a2a2a" strokeWidth="2"/>
    <circle cx="700" cy="248" r="38" fill="#111" stroke="#333" strokeWidth="1"/>
    <circle cx="700" cy="248" r="14" fill="#1a1a1a"/>
    {[0,60,120,180,240,300].map(a => (
      <line key={a} x1="700" y1="248" 
        x2={700 + 32*Math.cos(a*Math.PI/180)} 
        y2={248 + 32*Math.sin(a*Math.PI/180)} 
        stroke="#e8a020" strokeWidth="2" opacity="0.5"/>
    ))}
    {/* Rear wheel */}
    <circle cx="200" cy="248" r="54" fill="#0d0d0d" stroke="#2a2a2a" strokeWidth="2"/>
    <circle cx="200" cy="248" r="38" fill="#111" stroke="#333" strokeWidth="1"/>
    <circle cx="200" cy="248" r="14" fill="#1a1a1a"/>
    {[0,60,120,180,240,300].map(a => (
      <line key={a} x1="200" y1="248" 
        x2={200 + 32*Math.cos(a*Math.PI/180)} 
        y2={248 + 32*Math.sin(a*Math.PI/180)} 
        stroke="#e8a020" strokeWidth="2" opacity="0.5"/>
    ))}
    {/* Accent line */}
    <path d="M110 215 L400 205 L560 200 L680 205 L790 218" stroke="#e8a020" strokeWidth="1.5" opacity="0.4"/>
    {/* Scan lines overlay */}
    {[0,1,2,3,4].map(i => (
      <line key={i} x1="0" y1={100+i*50} x2="900" y2={100+i*50} 
        stroke="rgba(232,160,32,0.03)" strokeWidth="1"/>
    ))}
  </svg>
);

// Icons
const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e8a020" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
  </svg>
);

const features = [
  { num: "01", title: "AI Recognition", icon: "🔍", desc: "Advanced neural networks trained on 50,000+ car models. Detects make, model, year, and trim level from any angle." },
  { num: "02", title: "Instant Analysis", icon: "⚡", desc: "Get results in under 2 seconds. Our edge-optimized inference pipeline processes your image at lightning speed." },
  { num: "03", title: "Deep Metadata", icon: "📊", desc: "Beyond the basics — horsepower, torque, MSRP, production years, rarity score, and market value estimates." },
  { num: "04", title: "Multi-Angle", icon: "🔄", desc: "Front, rear, side, or three-quarter views. Our model handles partial occlusions and challenging lighting." },
  { num: "05", title: "Global Database", icon: "🌐", desc: "Over 200 brands from 40 countries. From American muscle to JDM legends, European exotics to Chinese EVs." },
  { num: "06", title: "History Reports", icon: "📋", desc: "Save your scans, build collections, track your garage. Full history with export to PDF or CSV." },
];

const steps = [
  { num: "01", title: "Upload Photo", desc: "Drop any car image — photo, screenshot, or URL. JPG, PNG, WEBP accepted." },
  { num: "02", title: "AI Scans", desc: "Our vision model analyzes 300+ visual features in milliseconds." },
  { num: "03", title: "Get Results", desc: "Brand, model, year, trim, and confidence score delivered instantly." },
  { num: "04", title: "Explore Details", desc: "Dive deep with specs, history, market data, and similar models." },
];

export default function Carvora() {
  const [scrolled, setScrolled] = useState(false);
  const [modal, setModal] = useState(null); // 'login' | 'signup' | null
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();
  const resultRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [result]);


  const simulateScan = async (file) => {
    if (!file) return;

    setScanning(true);
    setResult(null);
    setImagePreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("API Response:", data);

      // Parse prediction string: "Brand Model Type Year"
      // Examples: "BMW 3 Series Sedan 2012", "Ferrari 458 Italia Convertible 2012"
      const parts = data.prediction.split(" ");
      const year = parts[parts.length - 1]; // Last part is year
      const type = parts[parts.length - 2]; // Second to last is type (Sedan, SUV, etc)
      const modelAndBrand = parts.slice(0, -2).join(" "); // Everything else
      
      // Try to split brand and model more intelligently
      const brandModelParts = modelAndBrand.split(" ");
      const brand = brandModelParts[0];
      const model = brandModelParts.slice(1).join(" ");

      setResult({
        brand: brand,
        model: model,
        year: year,
        trim: type,
        fullName: data.prediction,
        confidence: data.confidence,
      });

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to scan vehicle. Please try again.");
    }

    setScanning(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    setImagePreview(URL.createObjectURL(file));
    simulateScan(file);
  };

  return (
    <>
      <style>{styles}</style>

      {/* NAVBAR */}
      <nav className={scrolled ? 'scrolled' : ''}>
        <a href="#" className="nav-logo">
          <svg className="logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer rim */}
            <circle cx="16" cy="16" r="13" stroke="#e8a020" strokeWidth="1.5"/>
            {/* Inner hub */}
            <circle cx="16" cy="16" r="3.5" fill="#e8a020"/>
            {/* 5 spokes with speed rake (offset angle for motion feel) */}
            {[0, 72, 144, 216, 288].map((angle, i) => {
              const rad = (angle - 18) * Math.PI / 180;
              const radEnd = (angle + 12) * Math.PI / 180;
              const x1 = 16 + 4 * Math.cos(rad);
              const y1 = 16 + 4 * Math.sin(rad);
              const x2 = 16 + 12.2 * Math.cos(radEnd);
              const y2 = 16 + 12.2 * Math.sin(radEnd);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e8a020" strokeWidth="2" strokeLinecap="round"/>;
            })}
            {/* Speed slash accent */}
            <path d="M9 22 L14 10" stroke="rgba(232,160,32,0.25)" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          CAR<span>VORA</span>
        </a>

        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#scan">Try It</a></li>
          <li><a href="#how">How It Works</a></li>
        </ul>

        {/* <div className="nav-actions">
          <button className="btn-ghost" onClick={() => setModal('login')}>Login</button>
          <button className="btn-primary" onClick={() => setModal('signup')}>Sign Up</button>
        </div> */}
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"/>
        <div className="hero-grid"/>

        <div className="hero-content">
          <div className="hero-eyebrow">AI-Powered Vehicle Recognition</div>
          <h1 className="hero-title">
            KNOW<br/>
            EVERY<br/>
            <span className="outline">CAR</span><span className="accent">.</span>
          </h1>
          <p className="hero-sub">
            Point. Shoot. Know. Carvora identifies any car model and brand in seconds.
          </p>
          
        </div>

        <div className="hero-car">
          <CarSVG/>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num">50<span>K+</span></div>
            <div className="stat-label">Car Models</div>
          </div>
          <div className="stat-sep"/>
          <div className="stat">
            <div className="stat-num">99<span>%</span></div>
            <div className="stat-label">Accuracy Rate</div>
          </div>
          <div className="stat-sep"/>
          <div className="stat">
            <div className="stat-num">2<span>s</span></div>
            <div className="stat-label">Avg Scan Time</div>
          </div>
          <div className="stat-sep"/>
          <div className="stat">
            <div className="stat-num">200<span>+</span></div>
            <div className="stat-label">Global Brands</div>
          </div>
        </div>
      </section>

      {/* SCAN SECTION */}
      <section className="scan-section" id="scan">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Live Demo</div>
            <h2 className="section-title">TRY IT<br/><span className="dim">NOW</span></h2>
          </div>
          <p className="section-desc">Drop any car image and watch our AI identify the make, model, and year in real time.</p>
        </div>

        <div
          className="upload-widget"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !imagePreview && fileRef.current?.click()}
          style={{ borderColor: dragging ? 'var(--accent)' : undefined, cursor: imagePreview ? 'default' : 'pointer', justifyContent: imagePreview ? 'center' : 'flex-start' }}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} 
          onChange={(e) => {
            const file = e.target.files[0];
            simulateScan(file);
          }}/>

          {imagePreview ? (
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', width:'100%', position:'relative', zIndex:10}}>
              <img src={imagePreview} alt="Uploaded car image" style={{maxWidth:'100%', maxHeight:'400px', borderRadius:'8px'}} />
              {!scanning && (
                <button 
                  type="button"
                  className="btn-outline-large"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImagePreview(null);
                    setResult(null);
                    if (fileRef.current) {
                      fileRef.current.value = '';
                      fileRef.current.click();
                    }
                  }}
                  style={{position:'relative', zIndex:20, pointerEvents:'auto'}}
                >
                  Upload Another
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="upload-icon">
                {scanning ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e8a020" strokeWidth="1.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" 
                      strokeLinecap="round">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                    </path>
                  </svg>
                ) : <UploadIcon/>}
              </div>

              <div className="upload-text">
                <h3>{scanning ? 'Scanning Vehicle...' : 'Drop Your Car Photo'}</h3>
                <p>{scanning ? 'AI analyzing 300+ visual features' : 'Or click to browse files from your device'}</p>
              </div>

              {!scanning && (
                <div className="upload-formats">
                  {['JPG','PNG','WEBP','HEIC'].map(f => <span key={f} className="format-tag">{f}</span>)}
                </div>
              )}
            </>
          )}
        </div>

        {result && (
          <div className="result-card" ref={resultRef}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,#e8a020,#ff6b1a)'}}/>
            <div>
              <div className="result-label">Brand</div>
              <div className="result-value">{result.brand}</div>
            </div>
            <div>
              <div className="result-label">Model</div>
              <div className="result-value">{result.model}</div>
            </div>
            <div>
              <div className="result-label">Year</div>
              <div className="result-value">{result.year}</div>
            </div>
            <div>
              <div className="result-label">Type</div>
              <div className="result-value" style={{fontSize:'24px'}}>{result.trim}</div>
            </div>
            <div className="confidence-bar">
              <div className="result-label">Confidence Score</div>
              <div className="confidence-track">
                <div className="confidence-fill" style={{width:`${result.confidence}%`}}/>
              </div>
              <div className="confidence-text">
                <span>0%</span>
                <span style={{color:'var(--accent)',fontWeight:600}}>{result.confidence.toFixed(2)}% match</span>
                <span>100%</span>
              </div>
            </div>
            <div style={{gridColumn:'1/-1', paddingTop:'16px', borderTop:'1px solid var(--border)', marginTop:'16px'}}>
              <div className="result-label">Full Classification</div>
              <div style={{fontSize:'16px', color:'var(--text-muted)', marginTop:'8px'}}>{result.fullName}</div>
            </div>
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Capabilities</div>
            <h2 className="section-title">BUILT FOR<br/><span className="dim">ENTHUSIASTS</span></h2>
          </div>
          <p className="section-desc">Everything you need to identify, track, and learn about any car on the planet.</p>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.num}>
              <div className="feature-num">{f.num}</div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="hiw-section" id="how">
        <div style={{textAlign:'center', marginBottom:0}}>
          <div className="section-eyebrow" style={{justifyContent:'center', display:'flex'}}>Process</div>
          <h2 className="section-title" style={{marginBottom:0}}>HOW IT <span className="dim">WORKS</span></h2>
        </div>

        <div className="hiw-steps">
          {steps.map((s) => (
            <div className="hiw-step" key={s.num}>
              <div className="step-circle">
                <span className="step-num">{s.num}</span>
              </div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA
      <section className="cta-section">
        <div style={{position:'relative', zIndex:1}}>
          <div className="section-eyebrow" style={{justifyContent:'center',display:'flex'}}>Get Started</div>
          <h2 className="section-title">READY TO <span className="accent">SCAN</span>?</h2>
          <p className="cta-sub">Join 50,000+ car enthusiasts, dealers, and collectors who identify vehicles with Carvora every day.</p>
          <div className="cta-actions">
            <button className="btn-large" onClick={() => setModal('signup')}>Create Account</button>
            <button className="btn-outline-large" onClick={() => document.getElementById('scan').scrollIntoView({behavior:'smooth'})}>Try Without Signing Up</button>
          </div>
        </div>
      </section> */}

      {/* FOOTER */}
      <footer>
        <div className="footer-copy">© 2026 Carvora. All rights reserved.</div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>

      {/* MODALS */}
      {/* {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {modal === 'login' ? <>LOG <span>IN</span></> : <>SIGN <span>UP</span></>}
              </h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {modal === 'signup' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="Your Full Name" type="text"/>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" placeholder="you@example.com" type="email"/>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" placeholder="••••••••" type="password"/>
              </div>
              <button className="btn-large" style={{width:'100%',marginTop:'8px', clipPath:'none'}}>
                {modal === 'login' ? 'Login' : 'Create Account'}
              </button>
            </div>
            <div className="modal-footer">
              {modal === 'login'
                ? <>No account? <button onClick={() => setModal('signup')}>Sign up free</button></>
                : <>Already have one? <button onClick={() => setModal('login')}>Log in</button></>
              }
            </div>
          </div>
        </div>
      )} */}
    </>
  );
}
