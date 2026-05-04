import QrGenerator from '@/components/QrGenerator';

export default function Home() {
  return (
    <main>
      <header className="masthead">
        <div className="masthead-inner">
          <div className="brand">
            <div className="logo-mark" aria-hidden="true">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
              <div className="dot dot--big" />
            </div>
            <div>
              <h1 className="display-font wordmark">QR/FORGE</h1>
              <p className="tagline">No redirects · No tracking · Pure client-side</p>
            </div>
          </div>
          <nav className="nav">
            <span className="tag">v1.0</span>
            <span className="status">
              <span className="status-dot" /> READY
            </span>
          </nav>
        </div>
        <div className="ticker">
          <span>◆ DIRECT ENCODING</span>
          <span>◆ MULTIPLE DOT STYLES</span>
          <span>◆ CUSTOM COLORS</span>
          <span>◆ LOGO EMBED</span>
          <span>◆ PNG · SVG · JPEG · WEBP</span>
          <span>◆ 100% CLIENT-SIDE</span>
        </div>
      </header>

      <QrGenerator />

      <footer className="foot">
        <div className="foot-inner">
          <span>BUILT WITH NEXT.JS · QR-CODE-STYLING</span>
          <span>NO DATA LEAVES YOUR BROWSER</span>
        </div>
      </footer>

      <style>{`
        .masthead {
          border-bottom: 2px solid var(--border);
          background: var(--panel);
          margin-bottom: 32px;
        }
        .masthead-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .logo-mark {
          display: grid;
          grid-template-columns: repeat(2, 14px);
          grid-template-rows: repeat(2, 14px);
          gap: 3px;
          padding: 6px;
          border: 2px solid var(--border);
          background: var(--accent);
        }
        .logo-mark .dot {
          background: var(--fg);
        }
        .logo-mark .dot--big {
          background: var(--bg);
          border: 2px solid var(--fg);
          margin: -4px;
          width: 18px;
          height: 18px;
        }
        .wordmark {
          font-size: 28px;
          letter-spacing: -0.04em;
          font-weight: 700;
          line-height: 1;
        }
        .tagline {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--muted);
          margin-top: 4px;
        }
        .nav {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }
        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: var(--accent-2);
          border: 1px solid var(--border);
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .ticker {
          background: var(--fg);
          color: var(--bg);
          padding: 8px 0;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          border-top: 2px solid var(--border);
          border-bottom: 2px solid var(--border);
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 32px;
        }
        .ticker span { padding: 0 16px; flex-shrink: 0; }

        .foot {
          margin-top: 32px;
          border-top: 2px solid var(--border);
          background: var(--panel);
        }
        .foot-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--muted);
        }

        @media (max-width: 600px) {
          .masthead-inner { padding: 16px; flex-direction: column; gap: 12px; align-items: flex-start; }
          .wordmark { font-size: 22px; }
          .foot-inner { flex-direction: column; gap: 8px; padding: 16px; }
        }
      `}</style>
    </main>
  );
}
