import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const ICONS = {
  lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z",
  share: "M16 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.6 13.5l4.8 2.6M13.4 7.9 8.6 10.5",
  hash: "M5 9h14M5 15h14M10 4 8 20M16 4l-2 16",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  key: "M15 8a4 4 0 1 1-3.5 6L4 21v-3H2v-2l3-3 4.5-4.5A4 4 0 0 1 15 8Z",
  check: "m5 12.5 4.5 4.5L19 7.5",
  file: "M7 3h7l5 5v13H7zM14 3v5h5",
  x: "M6 6l12 12M18 6 6 18",
};

function Icon({ name, size = 22 }) {
  return (
    <svg className="tvx-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

const compare = [
  { q: "Who can open it?", folder: "Depends on folder settings, and hard to review.", vault: "Only people you share it with, checked on every request." },
  { q: "Has it changed?", folder: "No reliable way to tell.", vault: "Compared against the SHA-256 fingerprint saved at upload." },
  { q: "What happened to it?", folder: "Nothing is recorded.", vault: "Uploads, shares and verifications go into an audit log." },
  { q: "Taking access back", folder: "Move or re-upload the file.", vault: "Revoke a person's access from the sharing settings." },
];

const features = [
  { icon: "lock", wide: true, title: "Private document storage", text: "Files are kept in private storage and open only through authenticated application endpoints, never through a public link." },
  { icon: "share", title: "Controlled sharing", text: "Give specific people view access, then take it back when it is no longer needed." },
  { icon: "hash", title: "SHA-256 integrity checks", text: "Compare a file's current fingerprint with the one saved at upload." },
  { icon: "list", wide: true, title: "Security audit log", text: "Security-relevant actions are recorded, so you can review who did what, and when." },
  { icon: "user", title: "Verified sign-in", text: "Email OTP verification, JWT sessions and password recovery." },
  { icon: "key", title: "Permission checks", text: "Every document action checks that you are signed in and allowed to do it." },
];

const steps = [
  { title: "Register and verify", text: "Create an account and confirm your email with a one-time code." },
  { title: "Upload a document", text: "The file goes to private storage and its SHA-256 baseline is saved." },
  { title: "Share or revoke access", text: "Choose who can view it, and remove access whenever you need to." },
  { title: "Verify and review", text: "Check the file against its baseline and read the recorded activity." },
];

const layers = [
  { tag: "Client", name: "React + Vite", items: ["Responsive interface", "Protected routes"] },
  { tag: "API", name: "Spring Boot", items: ["Spring Security + JWT", "Document, sharing, integrity and audit services"] },
  { tag: "Data", name: "MySQL + private storage", items: ["Users, metadata, permissions, audit records", "Files stored privately on the server"] },
];

const notes = [
  { title: "Backend enforces access", text: "Frontend route checks improve the experience, but every request is authorised by the API." },
  { title: "A hash proves sameness, not origin", text: "A match shows the bytes equal the saved baseline. It does not show who uploaded the file." },
  { title: "The baseline must be protected", text: "A fingerprint is only as trustworthy as the place it is stored." },
];

const initialDocs = [
  { id: 1, name: "Vendor-agreement.pdf", meta: "2.4 MB", shared: "3 people", changed: false },
  { id: 2, name: "Q3-financials.xlsx", meta: "860 KB", shared: "Only you", changed: false },
  { id: 3, name: "Board-minutes.docx", meta: "310 KB", shared: "1 person", changed: true },
];

const STATUS = {
  idle: { label: "Not checked", cls: "" },
  checking: { label: "Checking…", cls: "is-busy" },
  ok: { label: "Verified", cls: "is-ok" },
  bad: { label: "Content changed", cls: "is-bad" },
};

function DocumentTable() {
  const [status, setStatus] = useState({ 1: "idle", 2: "idle", 3: "idle" });
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function verify(doc) {
    setStatus((s) => ({ ...s, [doc.id]: "checking" }));
    timers.current.push(
      setTimeout(() => setStatus((s) => ({ ...s, [doc.id]: doc.changed ? "bad" : "ok" })), 900)
    );
  }

  return (
    <div className="tvx-window">
      <div className="tvx-window-bar"><span /><span /><span /><em>My documents</em></div>
      <div className="tvx-window-body">
        <div className="tvx-table" role="table" aria-label="Sample documents">
          <div className="tvx-row tvx-row-head" role="row">
            <span>Name</span><span>Shared with</span><span>Integrity</span><span />
          </div>
          {initialDocs.map((d) => {
            const st = STATUS[status[d.id]];
            return (
              <div className="tvx-row" role="row" key={d.id}>
                <span className="tvx-doc-name">
                  <span className="tvx-doc-icon"><Icon name="file" size={18} /></span>
                  <span><strong>{d.name}</strong><small>{d.meta}</small></span>
                </span>
                <span className="tvx-muted">{d.shared}</span>
                <span><b className={`tvx-status ${st.cls}`}>{st.label}</b></span>
                <span className="tvx-row-action">
                  <button type="button" onClick={() => verify(d)} disabled={status[d.id] === "checking"}>Verify</button>
                </span>
              </div>
            );
          })}
        </div>
        <p className="tvx-window-hint">Interactive preview. Press Verify on each document.</p>
      </div>
    </div>
  );
}

const HASH_OK = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
const HASH_BAD = "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae";

function IntegrityCheck() {
  const [state, setState] = useState("idle");
  const [edited, setEdited] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  function run() {
    clearTimeout(timer.current);
    setState("checking");
    timer.current = setTimeout(() => setState(edited ? "bad" : "ok"), 1000);
  }
  function toggle() {
    clearTimeout(timer.current);
    setEdited((e) => !e);
    setState("idle");
  }
  const st = STATUS[state];
  const label = state === "ok" ? "Fingerprints match" : state === "bad" ? "Fingerprints differ" : st.label;

  return (
    <div className="tvx-check" aria-live="polite">
      <div className="tvx-check-head">
        <strong>Vendor-agreement.pdf</strong>
        <b className={`tvx-status ${st.cls}`}>{label}</b>
      </div>
      <p className="tvx-check-label">Saved at upload</p>
      <code>{HASH_OK}</code>
      <p className="tvx-check-label">Current file</p>
      <code className={state === "bad" ? "is-bad" : ""}>{state === "idle" ? "Press Verify integrity to calculate" : edited ? HASH_BAD : HASH_OK}</code>
      <div className="tvx-check-actions">
        <button type="button" className="tvx-btn tvx-btn-teal" onClick={run} disabled={state === "checking"}>Verify integrity</button>
        <label className="tvx-switch">
          <input type="checkbox" checked={edited} onChange={toggle} />
          <span />
          Simulate an edited file
        </label>
      </div>
    </div>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const Logo = (
    <>
      <svg viewBox="0 0 32 36" aria-hidden="true">
        <path d="M16 2 28 6.5V17c0 8-5 14.5-12 17C9 31.5 4 25 4 17V6.5Z" fill="currentColor" />
        <path d="m10.5 17.5 4 4 7-8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      TrustVault
    </>
  );

  return (
    <main className="tvx-home">
      <header className={`tvx-nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="tvx-nav-inner">
          <a className="tvx-brand" href="#top" aria-label="TrustVault home">{Logo}</a>

          <nav className={`tvx-nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Primary">
            <a href="#why" onClick={closeMenu}>Why TrustVault</a>
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#workflow" onClick={closeMenu}>How it works</a>
            <a href="#integrity" onClick={closeMenu}>Integrity</a>
            <a href="#architecture" onClick={closeMenu}>Architecture</a>
            <div className="tvx-nav-mobile">
              <Link to="/login" onClick={closeMenu}>Sign in</Link>
              <Link to="/register" className="tvx-btn tvx-btn-teal" onClick={closeMenu}>Get started</Link>
            </div>
          </nav>

          <div className="tvx-nav-actions">
            <Link className="tvx-signin" to="/login">Sign in</Link>
            <Link className="tvx-btn tvx-btn-teal tvx-btn-sm" to="/register">Get started</Link>
          </div>

          <button className="tvx-menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
            <span /><span />
          </button>
        </div>
      </header>

      <section className="tvx-hero" id="top">
        <video className="tvx-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
          <source src="/videos/trustvault-hero.mp4" type="video/mp4" />
        </video>
        <div className="tvx-veil" aria-hidden="true" />
        <div className="tvx-wrap tvx-hero-copy">
          <p className="tvx-badge"><span className="tvx-live-dot" /> Secure document management</p>
          <h1>Your documents, protected and provable.</h1>
          <p className="tvx-lead">
            Store files privately, share them with control, and verify that nothing changed, with every important action recorded.
          </p>
          <div className="tvx-actions">
            <Link to="/register" className="tvx-btn tvx-btn-teal tvx-btn-lg">Create free account</Link>
            <a href="#integrity" className="tvx-btn tvx-btn-outline tvx-btn-lg">Try a live check</a>
          </div>
        </div>
        <div className="tvx-wrap tvx-hero-demo">
          <DocumentTable />
        </div>
      </section>

      <section className="tvx-section tvx-light" id="why">
        <div className="tvx-wrap">
          <div className="tvx-head">
            <p className="tvx-eyebrow">Why TrustVault</p>
            <h2>Important documents deserve more than a folder</h2>
            <p>A folder stores a file. TrustVault also answers who can open it, whether it changed, and what happened to it.</p>
          </div>
          <div className="tvx-compare" role="table" aria-label="Folder compared with TrustVault">
            <div className="tvx-compare-row tvx-compare-head" role="row">
              <span />
              <span>A shared folder</span>
              <span>TrustVault</span>
            </div>
            {compare.map((c) => (
              <div className="tvx-compare-row" role="row" key={c.q}>
                <strong>{c.q}</strong>
                <span className="tvx-no"><Icon name="x" size={16} />{c.folder}</span>
                <span className="tvx-yes"><Icon name="check" size={16} />{c.vault}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tvx-section tvx-light tvx-soft" id="features">
        <div className="tvx-wrap">
          <div className="tvx-head">
            <p className="tvx-eyebrow">Features</p>
            <h2>Everything a document needs to stay trustworthy</h2>
          </div>
          <div className="tvx-bento">
            {features.map((f) => (
              <article className={`tvx-tile ${f.wide ? "is-wide" : ""}`} key={f.title}>
                <span className="tvx-tile-icon"><Icon name={f.icon} /></span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="tvx-section tvx-light" id="workflow">
        <div className="tvx-wrap">
          <div className="tvx-head">
            <p className="tvx-eyebrow">How it works</p>
            <h2>From upload to verified in four steps</h2>
          </div>
          <ol className="tvx-steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="tvx-step-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tvx-section tvx-light" id="integrity">
        <div className="tvx-wrap tvx-split">
          <div>
            <p className="tvx-eyebrow">Integrity</p>
            <h2>A fingerprint for every file</h2>
            <p className="tvx-body">
              At upload, TrustVault saves the file's SHA-256 fingerprint as a baseline. Verify later and the current file is compared against it.
            </p>
            <ul className="tvx-checklist">
              <li><span className="tvx-dot is-ok" /><span><strong>Match.</strong> The file bytes equal the saved baseline.</span></li>
              <li><span className="tvx-dot is-bad" /><span><strong>Mismatch.</strong> The content changed. Check the audit log.</span></li>
            </ul>
          </div>
          <IntegrityCheck />
        </div>
      </section>

      <section className="tvx-section tvx-light" id="architecture">
        <div className="tvx-wrap">
          <div className="tvx-head">
            <p className="tvx-eyebrow">Architecture</p>
            <h2>A clear three-layer design</h2>
            <p>The interface talks to a secured API, and the API owns the data and the files.</p>
          </div>
          <div className="tvx-layers">
            {layers.map((l) => (
              <article className="tvx-layer" key={l.name}>
                <span className="tvx-layer-tag">{l.tag}</span>
                <h3>{l.name}</h3>
                <ul>{l.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className="tvx-notes">
            <h3>Security approach and limits</h3>
            <div className="tvx-notes-grid">
              {notes.map((n) => (
                <div key={n.title}><strong>{n.title}</strong><p>{n.text}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="tvx-section tvx-light tvx-cta-wrap">
        <div className="tvx-wrap">
          <div className="tvx-cta">
          <h2>See the full workflow in a few minutes</h2>
          <p>Create an account, upload a document, share it, verify it and open the audit log.</p>
          <div className="tvx-actions tvx-center">
            <Link to="/register" className="tvx-btn tvx-btn-white tvx-btn-lg">Create free account</Link>
            <Link to="/login" className="tvx-btn tvx-btn-line tvx-btn-lg">Sign in</Link>
          </div>
          </div>
        </div>
      </section>

      <footer className="tvx-footer">
        <div className="tvx-wrap tvx-footer-row">
          <a className="tvx-brand" href="#top">{Logo}</a>
          <nav aria-label="Footer">
            <a href="#why">Why TrustVault</a>
            <a href="#features">Features</a>
            <a href="#integrity">Integrity</a>
            <a href="#architecture">Architecture</a>
            <Link to="/login">Sign in</Link>
          </nav>
        </div>
        <div className="tvx-wrap tvx-footer-bottom">
          <span>© {new Date().getFullYear()} TrustVault. Hackathon project.</span>
          <span>React · Spring Boot · Spring Security · JWT · MySQL</span>
        </div>
      </footer>
    </main>
  );
}

export default Home;