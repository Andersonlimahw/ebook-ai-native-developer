import { marked } from "marked";
import fs from "fs";
import path from "path";

const TITLE = "AI Native Developer";
const SUBTITLE = "Um guia prático para developers no mundo nativo de IA";

interface Chapter {
  filename: string;
  sectionId: string;
  title: string;
}

const CHAPTERS: Chapter[] = [
  { filename: "index.md", sectionId: "index", title: "Índice" },
  {
    filename: "01-llm.md",
    sectionId: "capitulo-01-o-llm",
    title: "Capítulo 1: O LLM",
  },
  {
    filename: "02-harness.md",
    sectionId: "capitulo-02-o-harness",
    title: "Capítulo 2: O Harness",
  },
  {
    filename: "03-agent.md",
    sectionId: "capitulo-03-o-agent",
    title: "Capítulo 3: O Agent",
  },
  {
    filename: "04-subagent.md",
    sectionId: "capitulo-04-o-subagent",
    title: "Capítulo 4: O Subagent",
  },
  {
    filename: "05-context.md",
    sectionId: "capitulo-05-o-context",
    title: "Capítulo 5: O Context",
  },
  {
    filename: "06-skill.md",
    sectionId: "capitulo-06-o-skill",
    title: "Capítulo 6: O Skill",
  },
  {
    filename: "07-plugin.md",
    sectionId: "capitulo-07-plugin",
    title: "Capítulo 7: Plugin",
  },
  {
    filename: "08-mcp.md",
    sectionId: "capitulo-08-mcp",
    title: "Capítulo 8: MCP",
  },
  {
    filename: "09-cli.md",
    sectionId: "capitulo-09-cli",
    title: "Capítulo 9: CLI",
  },
  {
    filename: "10-sintese.md",
    sectionId: "capitulo-10-sintese",
    title: "Capítulo 10: Síntese",
  },
];

// Green palette derived from #87BB2D (lemon.dev.br accent-green)
// #87BB2D → darker: #6A9424 → #4F6E1C → #3A5014
const CSS = `
  /* ── Variables ── */
  :root {
    --bg:            #F5F7FA;
    --bg2:           #EDF1F5;
    --surface:       #FFFFFF;
    --surface-muted: #F1F5F9;
    --text:          #0F172A;
    --text-body:     #2E3F58;
    --text-muted:    #64748B;
    --border:        #D5DBE4;
    --border2:       #C7CED9;
    --accent:        #87BB2D;
    --accent-light:  #9ED138;
    --accent-dark:   #6A9424;
    --accent-darker: #4F6E1C;
    --accent-teal:   #25B2B8;
    --sidebar-w:     264px;
    --topbar-h:      56px;
    --radius:        12px;
    --radius-sm:     8px;
    --shadow-sm:     0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow:        0 4px 16px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.05);
    --shadow-lg:     0 20px 60px rgba(0,0,0,.12), 0 8px 24px rgba(0,0,0,.08);
    --transition:    0.2s cubic-bezier(0.4,0,0.2,1);
  }
  [data-theme="dark"] {
    --bg:            #08090C;
    --bg2:           #0F1118;
    --surface:       #15171F;
    --surface-muted: #1E222A;
    --text:          #F8FAFC;
    --text-body:     #CBD5E1;
    --text-muted:    #64748B;
    --border:        #1A1D24;
    --border2:       #2E3440;
    --accent:        #9ED138;
    --accent-light:  #AEDF44;
    --accent-dark:   #87BB2D;
    --accent-darker: #6A9424;
    --accent-teal:   #2DD4BF;
    --shadow-sm:     0 1px 3px rgba(0,0,0,.3);
    --shadow:        0 4px 16px rgba(0,0,0,.4);
    --shadow-lg:     0 20px 60px rgba(0,0,0,.6), 0 8px 24px rgba(0,0,0,.4);
  }

  /* ── Reset ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; font-size: 16px; }
  body {
    font-family: "Red Hat Display", -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
    background: var(--bg);
    color: var(--text-body);
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
    transition: background var(--transition), color var(--transition);
    overflow-x: hidden;
  }

  /* ── Layout ── */
  .layout { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed;
    top: 0; left: 0;
    width: var(--sidebar-w);
    height: 100vh;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    z-index: 40;
    transition: transform var(--transition), background var(--transition), border-color var(--transition);
    overflow: hidden;
    /* Closed on mobile: no pointer-events so topbar buttons work */
    pointer-events: none;
  }
  .sidebar.open { pointer-events: auto; }
  @media (min-width: 1025px) {
    .sidebar { pointer-events: auto; }
  }

  .sidebar-header {
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    margin-bottom: 4px;
  }
  .brand-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, var(--accent), var(--accent-darker));
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .brand-icon svg { color: white; }
  .brand-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
    line-height: 1.2;
  }
  .brand-sub {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 400;
  }
  .sidebar-search-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin-top: 12px;
    padding: 8px 12px;
    background: var(--surface-muted);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    font-size: 13px;
    cursor: pointer;
    transition: all var(--transition);
    font-family: inherit;
  }
  .sidebar-search-btn:hover {
    background: var(--bg2);
    border-color: var(--accent);
    color: var(--text);
  }
  .search-shortcut {
    margin-left: auto;
    font-size: 11px;
    padding: 2px 6px;
    background: var(--border);
    border-radius: 4px;
    color: var(--text-muted);
  }
  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .sidebar-nav::-webkit-scrollbar { width: 4px; }
  .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
  .sidebar-nav::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
  .nav-section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 8px 8px 4px;
  }
  .nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text-body);
    text-decoration: none;
    transition: all var(--transition);
    cursor: pointer;
    border: 1px solid transparent;
    margin-bottom: 1px;
    line-height: 1.3;
  }
  .nav-link:hover {
    background: var(--surface-muted);
    color: var(--text);
    border-color: var(--border);
  }
  .nav-link.active {
    background: linear-gradient(135deg, rgba(135,187,45,.12), rgba(79,110,28,.08));
    color: var(--accent-dark);
    border-color: rgba(135,187,45,.3);
    font-weight: 600;
  }
  [data-theme="dark"] .nav-link.active {
    color: var(--accent);
    border-color: rgba(158,209,56,.3);
    background: linear-gradient(135deg, rgba(158,209,56,.1), rgba(135,187,45,.06));
  }
  .nav-num {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    min-width: 18px;
    font-variant-numeric: tabular-nums;
  }
  .sidebar-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px; height: 36px;
    border-radius: var(--radius-sm);
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: all var(--transition);
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .icon-btn:hover, .icon-btn:focus-visible {
    background: var(--surface-muted);
    border-color: var(--border);
    color: var(--text);
  }
  .icon-btn:active { opacity: 0.7; }

  /* ── Sidebar backdrop ── */
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.45);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 39;
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition), visibility var(--transition);
  }
  .sidebar-backdrop.visible {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
  }

  /* ── Topbar ── */
  .topbar {
    position: sticky;
    top: 0;
    height: var(--topbar-h);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px;
    z-index: 30;
    backdrop-filter: saturate(1.8) blur(20px);
    -webkit-backdrop-filter: saturate(1.8) blur(20px);
    background: rgba(255,255,255,.88);
    transition: background var(--transition), border-color var(--transition);
  }
  [data-theme="dark"] .topbar {
    background: rgba(21,23,31,.88);
  }
  .topbar-menu-btn { display: none; }
  .topbar-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .topbar-search-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    background: var(--surface-muted);
    border: 1px solid var(--border);
    border-radius: 20px;
    color: var(--text-muted);
    font-size: 13px;
    cursor: pointer;
    transition: all var(--transition);
    font-family: inherit;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    min-height: 44px;
  }
  .topbar-search-btn:hover, .topbar-search-btn:focus-visible {
    background: var(--bg2);
    border-color: var(--accent);
    color: var(--text);
  }
  .topbar-search-btn:active { opacity: 0.7; }
  .kbd {
    font-size: 11px;
    padding: 1px 5px;
    background: var(--border);
    border-radius: 4px;
    color: var(--text-muted);
  }

  /* ── Main content ── */
  .main {
    margin-left: var(--sidebar-w);
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  .content {
    flex: 1;
    padding: 48px 64px 80px;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }

  /* ── Typography ── */
  .ebook-section { margin-bottom: 80px; scroll-margin-top: calc(var(--topbar-h) + 24px); }
  .ebook-section h1 {
    font-size: clamp(28px, 4vw, 40px);
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.03em;
    line-height: 1.15;
    margin-bottom: 16px;
  }
  .ebook-section h2 {
    font-size: clamp(20px, 2.5vw, 26px);
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.02em;
    line-height: 1.25;
    margin: 48px 0 16px;
    padding-top: 8px;
    border-top: 1px solid var(--border);
  }
  .ebook-section h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
    margin: 32px 0 12px;
  }
  .ebook-section h4 {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-muted);
    margin: 24px 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .ebook-section p {
    font-size: 16px;
    line-height: 1.8;
    color: var(--text-body);
    margin-bottom: 20px;
    max-width: 68ch;
  }
  .ebook-section ul, .ebook-section ol {
    padding-left: 24px;
    margin-bottom: 20px;
  }
  .ebook-section li {
    font-size: 16px;
    line-height: 1.75;
    color: var(--text-body);
    margin-bottom: 6px;
  }
  .ebook-section a {
    color: var(--accent-dark);
    text-decoration: none;
    border-bottom: 1px solid rgba(135,187,45,.35);
    transition: border-color var(--transition), color var(--transition);
  }
  [data-theme="dark"] .ebook-section a { color: var(--accent); border-color: rgba(158,209,56,.35); }
  .ebook-section a:hover { color: var(--accent-darker); border-color: var(--accent-darker); }
  [data-theme="dark"] .ebook-section a:hover { color: var(--accent-light); border-color: var(--accent-light); }
  .ebook-section strong { color: var(--text); font-weight: 700; }
  .ebook-section blockquote {
    margin: 24px 0;
    padding: 16px 20px;
    border-left: 3px solid var(--accent);
    background: linear-gradient(135deg, rgba(135,187,45,.07), rgba(79,110,28,.04));
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    color: var(--text-body);
    font-style: italic;
  }
  .ebook-section code {
    font-family: "SF Mono", "Fira Code", "JetBrains Mono", Menlo, Consolas, monospace;
    font-size: 13.5px;
    padding: 2px 6px;
    background: var(--surface-muted);
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--accent-dark);
  }
  [data-theme="dark"] .ebook-section code { color: var(--accent); }
  .ebook-section pre {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    overflow-x: auto;
    margin: 20px 0;
    box-shadow: var(--shadow-sm);
  }
  .ebook-section pre code {
    background: none;
    border: none;
    padding: 0;
    font-size: 13.5px;
    color: var(--text-body);
  }
  .ebook-section hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 40px 0;
  }
  .ebook-section .table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 24px 0;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
  }
  .ebook-section table {
    width: 100%;
    min-width: 480px;
    border-collapse: collapse;
    font-size: 14px;
    border-radius: var(--radius-sm);
  }
  .ebook-section th {
    background: var(--surface-muted);
    padding: 10px 14px;
    text-align: left;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border);
  }
  .ebook-section td {
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    color: var(--text-body);
  }
  .ebook-section tr:last-child td { border-bottom: none; }
  .ebook-section tr:hover td { background: var(--surface-muted); }
  .ebook-section img { max-width: 100%; border-radius: var(--radius); box-shadow: var(--shadow); margin: 16px 0; }

  /* ── Spotlight ── */
  .spotlight-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.55);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 100;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 80px 20px 20px;
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s ease;
  }
  .spotlight-overlay.open {
    opacity: 1;
    pointer-events: all;
    visibility: visible;
  }
  .spotlight-modal {
    width: 100%;
    max-width: 560px;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    transform: translateY(-12px) scale(0.98);
    transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .spotlight-overlay.open .spotlight-modal {
    transform: translateY(0) scale(1);
  }
  .spotlight-input-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }
  .spotlight-input-wrap svg { color: var(--text-muted); flex-shrink: 0; }
  #spotlight-input {
    flex: 1;
    border: none;
    background: none;
    font-family: inherit;
    font-size: 16px;
    color: var(--text);
    outline: none;
    caret-color: var(--accent);
  }
  #spotlight-input::placeholder { color: var(--text-muted); }
  .spotlight-esc {
    font-size: 11px;
    padding: 2px 7px;
    background: var(--surface-muted);
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text-muted);
    cursor: pointer;
    font-family: inherit;
  }
  #spotlight-results {
    list-style: none;
    max-height: 360px;
    overflow-y: auto;
    padding: 8px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .spotlight-result {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--transition);
    border: 1px solid transparent;
  }
  .spotlight-result:hover, .spotlight-result.selected {
    background: linear-gradient(135deg, rgba(135,187,45,.09), rgba(79,110,28,.06));
    border-color: rgba(135,187,45,.25);
  }
  [data-theme="dark"] .spotlight-result:hover,
  [data-theme="dark"] .spotlight-result.selected {
    background: linear-gradient(135deg, rgba(158,209,56,.09), rgba(135,187,45,.06));
    border-color: rgba(158,209,56,.25);
  }
  .result-icon {
    width: 32px; height: 32px;
    border-radius: var(--radius-sm);
    background: var(--surface-muted);
    display: flex; align-items: center; justify-content: center;
    color: var(--accent-dark);
    flex-shrink: 0;
    margin-top: 1px;
  }
  [data-theme="dark"] .result-icon { color: var(--accent); }
  .result-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
  .result-preview {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .spotlight-footer {
    padding: 10px 16px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 11px;
    color: var(--text-muted);
  }
  .spotlight-hint { display: flex; align-items: center; gap: 5px; }
  .spotlight-hint kbd {
    padding: 2px 6px;
    background: var(--surface-muted);
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 10px;
    font-family: inherit;
    color: var(--text-muted);
  }

  /* ── Fullscreen ── */
  body.fullscreen-mode .sidebar { transform: translateX(-100%); }
  body.fullscreen-mode .main { margin-left: 0; }
  body.fullscreen-mode .topbar { display: none; }
  body.fullscreen-mode .content { max-width: 720px; padding: 40px 40px 80px; }
  .exit-fullscreen-btn {
    display: none;
    position: fixed;
    top: 20px; right: 20px;
    z-index: 50;
    padding: 8px 14px;
    background: rgba(21,23,31,.92);
    border: 1px solid var(--border2);
    border-radius: 20px;
    color: var(--text-muted);
    font-size: 12px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all var(--transition);
    font-family: inherit;
    gap: 6px;
    align-items: center;
  }
  body.fullscreen-mode .exit-fullscreen-btn { display: flex; }
  .exit-fullscreen-btn:hover { color: var(--text); }

  /* ── Progress bar ── */
  .progress-bar {
    position: fixed;
    top: 0; left: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent-darker));
    z-index: 100;
    width: 0%;
    transition: width 0.1s linear;
    border-radius: 0 2px 2px 0;
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }

  /* ── Responsive: Tablet ── */
  @media (max-width: 1024px) {
    .sidebar { transform: translateX(-100%); box-shadow: var(--shadow-lg); }
    .sidebar.open { transform: translateX(0); }
    .main { margin-left: 0; }
    .topbar-menu-btn { display: flex; }
    .content { padding: 32px 32px 48px; }
  }

  /* ── Author ── */
  .ebook-author {
    margin-top: 48px;
    padding: 24px 0 0;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .ebook-author-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 2px;
  }
  .ebook-author-link {
    font-size: 13px;
    color: var(--accent-dark);
    text-decoration: none;
  }
  [data-theme="dark"] .ebook-author-link { color: var(--accent); }
  .ebook-author-link:hover { text-decoration: underline; }
  .ebook-author-coauthor {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--border);
  }

  /* ── Responsive: Mobile ── */
  @media (max-width: 768px) {
    .content { padding: 20px 20px 40px; }
    .topbar-search-btn .kbd { display: none; }
    .topbar-search-btn { padding: 6px 14px; min-width: 100px; height: 44px; border-radius: 22px; }
    .spotlight-overlay { padding: 56px 12px 16px; }
    .ebook-section h1 { font-size: 26px; }
    .ebook-section h2 { font-size: 20px; }
    .ebook-section p, .ebook-section li { font-size: 15px; }
    .ebook-section pre { padding: 14px; }
    body.fullscreen-mode .content { padding: 20px 20px 40px; }
  }
`;

const ICONS = {
  book: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  search: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  sun: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
  moon: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  maximize: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
  minimize: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`,
  menu: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18"/></svg>`,
  x: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  doc: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>`,
};

function buildSidebarNav(chapters: Chapter[]): string {
  return chapters
    .map((ch, i) => {
      const num = i === 0 ? "·" : String(i).padStart(2, "0");
      return `<a href="#${ch.sectionId}" class="nav-link" data-section="${ch.sectionId}" onclick="if(window.innerWidth<1025){Sidebar.close()}">
      <span class="nav-num">${num}</span>
      <span>${ch.title}</span>
    </a>`;
    })
    .join("\n");
}

function buildHtml(content: string, chapters: Chapter[]): string {
  const navHtml = buildSidebarNav(chapters);
  const spotlightIndexJson = JSON.stringify(
    chapters.map((ch) => ({ id: ch.sectionId, title: ch.title })),
  );

  // Escape SVG strings for embedding in JS string literals
  const moonIcon = ICONS.moon.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const sunIcon = ICONS.sun.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const maxIcon = ICONS.maximize.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const minIcon = ICONS.minimize.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const docIcon = ICONS.doc.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${SUBTITLE}">
  <title>${TITLE}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
  <style>${CSS}</style>
</head>
<body>

<!-- Progress bar -->
<div class="progress-bar" id="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>

<!-- Spotlight -->
<div class="spotlight-overlay" id="spotlight-overlay" role="dialog" aria-modal="true" aria-label="Busca rápida">
  <div class="spotlight-modal">
    <div class="spotlight-input-wrap">
      ${ICONS.search}
      <input id="spotlight-input" type="text" placeholder="Buscar capítulos..." autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="spotlight-results">
      <button class="spotlight-esc" id="spotlight-close" aria-label="Fechar">Esc</button>
    </div>
    <ul id="spotlight-results" role="listbox" aria-label="Resultados"></ul>
    <div class="spotlight-footer">
      <span class="spotlight-hint"><kbd>↑↓</kbd> navegar</span>
      <span class="spotlight-hint"><kbd>↵</kbd> ir</span>
      <span class="spotlight-hint"><kbd>Esc</kbd> fechar</span>
    </div>
  </div>
</div>

<!-- Exit fullscreen -->
<button class="exit-fullscreen-btn" id="exit-fullscreen" aria-label="Sair do modo de leitura">
  ${ICONS.minimize}
  Sair da leitura
</button>

<div class="layout">

  <!-- Sidebar -->
  <aside class="sidebar" id="sidebar" aria-label="Navegação">
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <div class="brand-icon" aria-hidden="true">${ICONS.book}</div>
        <div>
          <div class="brand-name">${TITLE}</div>
          <div class="brand-sub">${SUBTITLE}</div>
        </div>
      </div>
      <button class="sidebar-search-btn" id="sidebar-search-btn" aria-label="Buscar (⌘K)">
        ${ICONS.search}
        <span>Buscar...</span>
        <span class="search-shortcut">⌘K</span>
      </button>
    </div>
    <nav class="sidebar-nav" aria-label="Capítulos">
      <div class="nav-section-label">Conteúdo</div>
      ${navHtml}
    </nav>
    <div class="sidebar-footer">
      <button class="icon-btn" id="theme-btn" aria-label="Alternar tema">
        ${ICONS.moon}
      </button>
      <button class="icon-btn" id="fullscreen-btn" aria-label="Modo de leitura">
        ${ICONS.maximize}
      </button>
      <button class="icon-btn" id="sidebar-search-btn2" aria-label="Buscar (⌘K)">
        ${ICONS.search}
      </button>
    </div>
  </aside>

  <!-- Backdrop -->
  <div class="sidebar-backdrop" id="sidebar-backdrop" aria-hidden="true"></div>

  <!-- Main -->
  <main class="main" id="main">
    <header class="topbar" role="banner">
      <button class="icon-btn topbar-menu-btn" id="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="sidebar">
        ${ICONS.menu}
      </button>
      <span class="topbar-title" id="topbar-title">${TITLE}</span>
      <div class="topbar-actions">
        <button class="topbar-search-btn" id="topbar-search-btn" aria-label="Buscar (⌘K)">
          ${ICONS.search}
          <span>Buscar</span>
          <span class="kbd">⌘K</span>
        </button>
        <button class="icon-btn" id="theme-btn2" aria-label="Alternar tema">
          ${ICONS.moon}
        </button>
        <button class="icon-btn" id="fullscreen-btn2" aria-label="Modo de leitura">
          ${ICONS.maximize}
        </button>
      </div>
    </header>

    <div class="content" id="content">
      ${content}
      <footer class="ebook-author" aria-label="Sobre os autores">
        <div>
          <p class="ebook-author-name">Anderson Lima</p>
          <a href="https://lemon.dev.br" class="ebook-author-link" target="_blank" rel="noopener noreferrer">lemon.dev.br</a>
        </div>
        <p class="ebook-author-coauthor">Co-Autor: Claude — Anthropic</p>
      </footer>
    </div>
  </main>
</div>

<script>
'use strict';

var CHAPTER_INDEX = ${spotlightIndexJson};

// ── Theme ──
var Theme = {
  _moonIcon: '${moonIcon}',
  _sunIcon:  '${sunIcon}',
  init: function() {
    var saved = 'dark';
    try { saved = localStorage.getItem('theme') || 'dark'; } catch(e) {}
    this._apply(saved);
  },
  _apply: function(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var isDark = theme === 'dark';
    var icon  = isDark ? this._sunIcon  : this._moonIcon;
    var label = isDark ? 'Modo claro'   : 'Modo escuro';
    ['theme-btn','theme-btn2'].forEach(function(id) {
      var b = document.getElementById(id);
      if (b) { b.innerHTML = icon; b.setAttribute('aria-label', label); }
    });
  },
  toggle: function() {
    var cur = document.documentElement.getAttribute('data-theme');
    var next = cur === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', next); } catch(e) {}
    this._apply(next);
  }
};

// ── Sidebar ──
var Sidebar = {
  _open: false,
  init: function() {
    if (!('IntersectionObserver' in window)) return;
    var self = this;
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) self._setActive(e.target.id); });
    }, { rootMargin: '-15% 0px -55% 0px' });
    document.querySelectorAll('.ebook-section').forEach(function(s) { io.observe(s); });
  },
  _setActive: function(id) {
    document.querySelectorAll('.nav-link').forEach(function(a) {
      a.classList.toggle('active', a.dataset.section === id);
    });
    var active = document.querySelector('.nav-link.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
    var ch = CHAPTER_INDEX.find(function(c) { return c.id === id; });
    var el = document.getElementById('topbar-title');
    if (ch && el) el.textContent = ch.title;
  },
  open: function() {
    this._open = true;
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-backdrop').classList.add('visible');
    document.getElementById('menu-btn').setAttribute('aria-expanded', 'true');
  },
  close: function() {
    this._open = false;
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-backdrop').classList.remove('visible');
    document.getElementById('menu-btn').setAttribute('aria-expanded', 'false');
  },
  toggle: function() { this._open ? this.close() : this.open(); }
};

// ── Spotlight ──
var Spotlight = {
  _open: false,
  _sel:  0,
  _docIcon: '${docIcon}',
  init: function() {
    CHAPTER_INDEX.forEach(function(ch) {
      var el = document.getElementById(ch.id);
      if (el) ch.text = el.textContent.replace(/\\s+/g, ' ').slice(0, 200).trim();
    });
    var inp  = document.getElementById('spotlight-input');
    var self = this;
    inp.addEventListener('input', function() { self._search(inp.value); });
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); self._move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); self._move(-1); }
      else if (e.key === 'Enter') { self._select(); }
    });
    document.getElementById('spotlight-overlay').addEventListener('click', function(e) {
      if (e.target.id === 'spotlight-overlay') self.close();
    });
    document.getElementById('spotlight-close').addEventListener('click', function() { self.close(); });
  },
  open: function() {
    this._open = true;
    document.getElementById('spotlight-overlay').classList.add('open');
    this._sel = 0;
    var inp = document.getElementById('spotlight-input');
    inp.value = '';
    setTimeout(function() { inp.focus(); }, 30);
    this._search('');
  },
  close: function() {
    this._open = false;
    document.getElementById('spotlight-overlay').classList.remove('open');
  },
  _search: function(q) {
    var query = (q || '').toLowerCase().trim();
    this._sel = 0;
    var results = query
      ? CHAPTER_INDEX.filter(function(ch) {
          return ch.title.toLowerCase().indexOf(query) !== -1 ||
                 (ch.text && ch.text.toLowerCase().indexOf(query) !== -1);
        }).slice(0, 8)
      : CHAPTER_INDEX.slice(0, 7);
    this._render(results);
  },
  _render: function(results) {
    var self = this;
    var list = document.getElementById('spotlight-results');
    if (!results.length) {
      list.innerHTML = '<li style="padding:16px;text-align:center;color:var(--text-muted);font-size:14px">Nenhum resultado</li>';
      return;
    }
    var icon = self._docIcon;
    list.innerHTML = results.map(function(r, i) {
      return '<li class="spotlight-result' + (i === 0 ? ' selected' : '') + '" data-id="' + r.id + '" role="option" tabindex="-1">' +
             '<span class="result-icon">' + icon + '</span>' +
             '<span><div class="result-title">' + r.title + '</div>' +
             (r.text ? '<div class="result-preview">' + r.text.slice(0, 90) + '…</div>' : '') +
             '</span></li>';
    }).join('');
    list.querySelectorAll('.spotlight-result').forEach(function(el) {
      el.addEventListener('click', function() { self._goTo(el.dataset.id); });
    });
  },
  _move: function(dir) {
    var items = document.querySelectorAll('.spotlight-result');
    if (!items.length) return;
    items[this._sel].classList.remove('selected');
    this._sel = (this._sel + dir + items.length) % items.length;
    items[this._sel].classList.add('selected');
    items[this._sel].scrollIntoView({ block: 'nearest' });
  },
  _select: function() {
    var sel = document.querySelector('.spotlight-result.selected');
    if (sel) this._goTo(sel.dataset.id);
  },
  _goTo: function(id) {
    this.close();
    var el = document.getElementById(id);
    if (!el) return;
    setTimeout(function() { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
  }
};

// ── Fullscreen ──
var Fullscreen = {
  _active: false,
  _maxIcon: '${maxIcon}',
  _minIcon: '${minIcon}',
  toggle: function() { this._active ? this.exit() : this._enter(); },
  _enter: function() {
    this._active = true;
    document.body.classList.add('fullscreen-mode');
    var el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(function() {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    this._updateBtns();
    var self = this;
    document.addEventListener('fullscreenchange', function onFsc() {
      if (!document.fullscreenElement) { self.exit(); }
      document.removeEventListener('fullscreenchange', onFsc);
    });
  },
  exit: function() {
    this._active = false;
    document.body.classList.remove('fullscreen-mode');
    if (document.fullscreenElement) document.exitFullscreen().catch(function() {});
    this._updateBtns();
  },
  _updateBtns: function() {
    var icon  = this._active ? this._minIcon : this._maxIcon;
    var label = this._active ? 'Sair do modo de leitura' : 'Modo de leitura';
    ['fullscreen-btn','fullscreen-btn2'].forEach(function(id) {
      var b = document.getElementById(id);
      if (b) { b.innerHTML = icon; b.setAttribute('aria-label', label); }
    });
  }
};

// ── Progress bar ──
function updateProgress() {
  var scrollTop = window.scrollY || document.documentElement.scrollTop;
  var docH = document.documentElement.scrollHeight - window.innerHeight;
  var pct  = docH > 0 ? Math.min(100, Math.round((scrollTop / docH) * 100)) : 0;
  var bar  = document.getElementById('progress-bar');
  if (bar) { bar.style.width = pct + '%'; bar.setAttribute('aria-valuenow', String(pct)); }
}

// ── Keyboard shortcuts ──
document.addEventListener('keydown', function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    Spotlight._open ? Spotlight.close() : Spotlight.open();
    return;
  }
  if (e.key === 'Escape') {
    if (Spotlight._open) { Spotlight.close(); return; }
    if (Fullscreen._active) { Fullscreen.exit(); return; }
    if (Sidebar._open) { Sidebar.close(); return; }
  }
});

// ── Init ──
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.ebook-section table').forEach(function(tbl) {
    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    tbl.parentNode.insertBefore(wrap, tbl);
    wrap.appendChild(tbl);
  });

  Theme.init();
  Sidebar.init();
  Spotlight.init();

  ['theme-btn','theme-btn2'].forEach(function(id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener('click', function() { Theme.toggle(); });
  });

  var menuBtn = document.getElementById('menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', function() { Sidebar.toggle(); });

  var backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.addEventListener('click', function() { Sidebar.close(); });

  ['sidebar-search-btn','sidebar-search-btn2','topbar-search-btn'].forEach(function(id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener('click', function() { Spotlight.open(); });
  });

  ['fullscreen-btn','fullscreen-btn2'].forEach(function(id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener('click', function() { Fullscreen.toggle(); });
  });

  var exitBtn = document.getElementById('exit-fullscreen');
  if (exitBtn) exitBtn.addEventListener('click', function() { Fullscreen.exit(); });

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
});
</script>
</body>
</html>`;
}

function main() {
  const baseDir = process.cwd();
  const coreDir = path.join(baseDir, "core", "pt-BR");
  const outputDir = path.join(baseDir, "output");

  const sections: string[] = [];

  for (const ch of CHAPTERS) {
    const filePath = path.join(coreDir, ch.filename);
    if (!fs.existsSync(filePath)) {
      console.error(`Erro: ${filePath} não encontrado`);
      process.exit(1);
    }
    console.log(`  • ${ch.filename}`);
    const html = marked.parse(fs.readFileSync(filePath, "utf-8")) as string;
    sections.push(
      `<section id="${ch.sectionId}" class="ebook-section">${html}</section>`,
    );
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const destPath = path.join(outputDir, "index.html");
  fs.writeFileSync(destPath, buildHtml(sections.join("\n\n"), CHAPTERS));
  console.log(`\n✓ HTML gerado: ${destPath}`);
}

try {
  main();
} catch (err: any) {
  console.error("Erro fatal:", err.message);
  process.exit(1);
}
