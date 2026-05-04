'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type QRCodeStyling from 'qr-code-styling';

type DotType = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
type CornerDotType = 'square' | 'dot';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type FileExtension = 'png' | 'svg' | 'jpeg' | 'webp';

const DOT_STYLES: { value: DotType; label: string }[] = [
  { value: 'square', label: 'Classic' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
];

const CORNER_SQUARE_STYLES: { value: CornerSquareType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'extra-rounded', label: 'Rounded' },
];

const CORNER_DOT_STYLES: { value: CornerDotType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
];

const PRESET_COLORS = [
  '#0a0a0a', '#ff3d00', '#00d4aa', '#0066ff',
  '#ffcc00', '#e91e63', '#7c3aed', '#ffffff',
];

export default function QrGenerator() {
  const ref = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState('https://google.com');
  const [size, setSize] = useState(360);
  const [dotType, setDotType] = useState<DotType>('rounded');
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>('extra-rounded');
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>('dot');
  const [dotColor, setDotColor] = useState('#0a0a0a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.4);
  const [logoMargin, setLogoMargin] = useState(8);
  const [hideBackgroundDots, setHideBackgroundDots] = useState(true);
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>('Q');
  const [downloadFormat, setDownloadFormat] = useState<FileExtension>('png');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { default: QRCodeStyling } = await import('qr-code-styling');
      if (cancelled) return;

      const qr = new QRCodeStyling({
        width: size,
        height: size,
        type: 'svg',
        data,
        margin: 8,
        qrOptions: { errorCorrectionLevel: errorCorrection },
        dotsOptions: { color: dotColor, type: dotType },
        backgroundOptions: { color: bgColor },
        cornersSquareOptions: { color: dotColor, type: cornerSquareType },
        cornersDotOptions: { color: dotColor, type: cornerDotType },
        imageOptions: {
          hideBackgroundDots,
          imageSize: logoSize,
          margin: logoMargin,
          crossOrigin: 'anonymous',
        },
      });

      qrCodeRef.current = qr;
      if (ref.current) {
        ref.current.innerHTML = '';
        qr.append(ref.current);
      }
      setIsReady(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!qrCodeRef.current) return;
    qrCodeRef.current.update({
      width: size,
      height: size,
      data,
      qrOptions: { errorCorrectionLevel: errorCorrection },
      dotsOptions: { color: dotColor, type: dotType },
      backgroundOptions: { color: bgColor },
      cornersSquareOptions: { color: dotColor, type: cornerSquareType },
      cornersDotOptions: { color: dotColor, type: cornerDotType },
      image: logoSrc ?? undefined,
      imageOptions: {
        hideBackgroundDots,
        imageSize: logoSize,
        margin: logoMargin,
        crossOrigin: 'anonymous',
      },
    });
  }, [
    data, size, dotType, cornerSquareType, cornerDotType,
    dotColor, bgColor, logoSrc, logoSize, logoMargin,
    hideBackgroundDots, errorCorrection,
  ]);

  const handleDownload = useCallback(() => {
    if (!qrCodeRef.current || !data.trim()) return;
    qrCodeRef.current.download({
      name: `qrcode-${Date.now()}`,
      extension: downloadFormat,
    });
  }, [downloadFormat, data]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setLogoSrc(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoSrc(null);
    if (qrCodeRef.current) {
      qrCodeRef.current.update({ image: '' });
    }
  };

  return (
    <div className="grid">
      {/* LEFT — Controls */}
      <section className="panel controls">
        <header className="section-header">
          <span className="tag">01</span>
          <h2 className="display-font section-title">Content</h2>
        </header>

        <div className="field">
          <label htmlFor="data">URL or Text</label>
          <textarea
            id="data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            rows={3}
            placeholder="https://example.com"
          />
          <p className="hint">No redirects. The QR encodes your URL directly.</p>
        </div>

        <header className="section-header">
          <span className="tag">02</span>
          <h2 className="display-font section-title">Style</h2>
        </header>

        <div className="field">
          <label>Dot Pattern</label>
          <div className="chip-grid">
            {DOT_STYLES.map((s) => (
              <button
                key={s.value}
                className={dotType === s.value ? 'chip active' : 'chip'}
                onClick={() => setDotType(s.value)}
                type="button"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Corner Frame</label>
            <select
              value={cornerSquareType}
              onChange={(e) => setCornerSquareType(e.target.value as CornerSquareType)}
            >
              {CORNER_SQUARE_STYLES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Corner Dot</label>
            <select
              value={cornerDotType}
              onChange={(e) => setCornerDotType(e.target.value as CornerDotType)}
            >
              {CORNER_DOT_STYLES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <header className="section-header">
          <span className="tag">03</span>
          <h2 className="display-font section-title">Color</h2>
        </header>

        <div className="row">
          <div className="field">
            <label>Foreground</label>
            <ColorPicker value={dotColor} onChange={setDotColor} />
          </div>
          <div className="field">
            <label>Background</label>
            <ColorPicker value={bgColor} onChange={setBgColor} />
          </div>
        </div>

        <header className="section-header">
          <span className="tag">04</span>
          <h2 className="display-font section-title">Logo</h2>
        </header>

        <div className="field">
          <label>Center Image (Optional)</label>
          <div className="logo-row">
            <button
              type="button"
              className="file-button"
              onClick={() => fileInputRef.current?.click()}
            >
              {logoSrc ? 'Replace' : 'Upload'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
            />
            {logoSrc && (
              <button onClick={removeLogo} type="button">Remove</button>
            )}
            {logoSrc && (
              <div className="logo-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt="logo" />
              </div>
            )}
          </div>
          <p className="hint">Tip: increase error correction below if QR fails to scan with logo.</p>
        </div>

        {logoSrc && (
          <>
            <div className="field">
              <label>Logo Size — {Math.round(logoSize * 100)}%</label>
              <input
                type="range"
                min={0.1}
                max={0.5}
                step={0.05}
                value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Logo Margin — {logoMargin}px</label>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={logoMargin}
                onChange={(e) => setLogoMargin(Number(e.target.value))}
              />
            </div>
            <div className="field checkbox">
              <input
                id="hideDots"
                type="checkbox"
                checked={hideBackgroundDots}
                onChange={(e) => setHideBackgroundDots(e.target.checked)}
              />
              <label htmlFor="hideDots">Clear dots behind logo</label>
            </div>
          </>
        )}

        <header className="section-header">
          <span className="tag">05</span>
          <h2 className="display-font section-title">Advanced</h2>
        </header>

        <div className="row">
          <div className="field">
            <label>Error Correction</label>
            <select
              value={errorCorrection}
              onChange={(e) => setErrorCorrection(e.target.value as ErrorCorrectionLevel)}
            >
              <option value="L">Low (~7%)</option>
              <option value="M">Medium (~15%)</option>
              <option value="Q">Quartile (~25%)</option>
              <option value="H">High (~30%)</option>
            </select>
          </div>
          <div className="field">
            <label>Size — {size}px</label>
            <input
              type="range"
              min={200}
              max={800}
              step={20}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* RIGHT — Preview & Export */}
      <section className="panel preview">
        <header className="section-header preview-header">
          <span className="tag">PREVIEW</span>
          <h2 className="display-font section-title">Output</h2>
        </header>

        <div className="qr-stage">
          <div className="qr-frame" style={{ background: bgColor }}>
            <div ref={ref} className="qr-canvas" />
            {!isReady && <div className="loading">Loading…</div>}
          </div>
          <div className="qr-meta">
            <span>{size}×{size}px</span>
            <span>·</span>
            <span>EC: {errorCorrection}</span>
            <span>·</span>
            <span>{dotType}</span>
          </div>
        </div>

        <div className="export">
          <header className="section-header">
            <span className="tag">06</span>
            <h2 className="display-font section-title">Export</h2>
          </header>
          <div className="format-grid">
            {(['png', 'svg', 'jpeg', 'webp'] as FileExtension[]).map((fmt) => (
              <button
                key={fmt}
                className={downloadFormat === fmt ? 'chip active' : 'chip'}
                onClick={() => setDownloadFormat(fmt)}
                type="button"
              >
                .{fmt}
              </button>
            ))}
          </div>
          <button
            className="primary download-btn"
            onClick={handleDownload}
            disabled={!isReady || !data.trim()}
            type="button"
          >
            ↓ Download .{downloadFormat}
          </button>
          <p className="hint">
            {downloadFormat === 'svg'
              ? 'Vector — infinitely scalable, perfect for print.'
              : downloadFormat === 'png'
              ? 'Raster with transparency support.'
              : 'Compressed raster format.'}
          </p>
        </div>
      </section>

      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 0 32px 64px;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
            padding: 0 16px 48px;
          }
        }

        .panel {
          background: var(--panel);
          border: 2px solid var(--border);
          box-shadow: var(--shadow);
          padding: 28px;
        }

        .preview {
          position: sticky;
          top: 24px;
          align-self: start;
          max-height: calc(100vh - 48px);
          overflow-y: auto;
        }

        @media (max-width: 900px) {
          .preview { position: static; max-height: none; }
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          margin-top: 28px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--border);
        }

        .section-header:first-child { margin-top: 0; }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .field { margin-bottom: 16px; }

        .field.checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .field.checkbox input { width: auto; }
        .field.checkbox label { margin-bottom: 0; }

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .hint {
          font-size: 11px;
          color: var(--muted);
          margin-top: 6px;
          letter-spacing: 0.02em;
        }

        .chip-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .chip {
          padding: 8px 6px;
          font-size: 10px;
          background: var(--panel);
          border: 2px solid var(--border);
          box-shadow: none;
        }

        .chip:hover:not(:disabled) {
          background: var(--bg);
          transform: none;
          box-shadow: none;
        }

        .chip.active {
          background: var(--fg);
          color: var(--bg);
        }

        .file-button {
          background: var(--accent-2);
          color: var(--fg);
        }

        .logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .logo-preview {
          width: 40px;
          height: 40px;
          border: 2px solid var(--border);
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .logo-preview img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .qr-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 20px 0;
        }

        .qr-frame {
          border: 2px solid var(--border);
          box-shadow: var(--shadow);
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: background 0.15s ease;
        }

        .qr-canvas { display: flex; }

        .qr-canvas :global(svg),
        .qr-canvas :global(canvas) {
          display: block;
          max-width: 100%;
          height: auto;
        }

        .loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--muted);
        }

        .qr-meta {
          display: flex;
          gap: 8px;
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .export {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 2px dashed var(--border);
        }

        .format-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 14px;
        }

        .download-btn {
          width: 100%;
          padding: 16px;
          font-size: 14px;
        }

        input[type="range"] {
          padding: 0;
          height: 6px;
          background: var(--fg);
          border: 2px solid var(--border);
          appearance: none;
          -webkit-appearance: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: var(--accent);
          border: 2px solid var(--border);
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: var(--accent);
          border: 2px solid var(--border);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="color-picker">
      <div className="color-row">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-swatch"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-text"
          maxLength={7}
        />
      </div>
      <div className="presets">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className="preset"
            style={{ background: c }}
            onClick={() => onChange(c)}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>
      <style jsx>{`
        .color-row {
          display: flex;
          gap: 6px;
          margin-bottom: 6px;
        }
        .color-swatch {
          width: 44px;
          height: 44px;
          padding: 0;
          border: 2px solid var(--border);
          cursor: pointer;
          background: transparent;
          flex-shrink: 0;
        }
        .color-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          text-transform: uppercase;
          flex: 1;
        }
        .presets {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
        }
        .preset {
          aspect-ratio: 1;
          padding: 0;
          border: 2px solid var(--border);
          box-shadow: none;
          cursor: pointer;
        }
        .preset:hover {
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0 0 var(--border);
        }
      `}</style>
    </div>
  );
}
