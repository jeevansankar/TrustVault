
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../api/authApi";

const features = [
  {
    icon: "▤",
    title: "My Documents",
    description: "View, download and delete documents in your workspace.",
    category: "DOCUMENT MANAGEMENT",
    status: "Available",
    color: "purple",
    path: "/documents",
  },
  {
    icon: "↥",
    title: "Upload Documents",
    description: "Securely upload a document to your private workspace.",
    category: "FILE STORAGE",
    status: "Available",
    color: "blue",
    path: "/documents",
  },
  {
    icon: "↗",
    title: "Shared With Me",
    description:
      "View and download documents other users have shared with you.",
    category: "COLLABORATION",
    status: "Available",
    color: "green",
    path: "/shared-with-me",
  },
  {
    icon: "♧",
    title: "Access Permissions",
    description:
      "Share your documents, manage viewing access and revoke permissions.",
    category: "ACCESS CONTROL",
    status: "Available",
    color: "orange",
    path: "/permissions",
  },
  {
    icon: "≡",
    title: "Audit Logs",
    description:
      "Review security events, account activity and audit chain integrity.",
    category: "MONITORING",
    status: "Available",
    color: "blue",
    path: "/audit-logs",
  },
  {
    icon: "◇",
    title: "Integrity Verification",
    description:
      "Verify stored documents against their trusted SHA-256 fingerprints.",
    category: "DOCUMENT SECURITY",
    status: "Available",
    color: "green",
    path: "/integrity-verification",
  },
];

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      try {
        const account = await getCurrentUser();

        if (!cancelled) {
          setUser(account);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "We could not load your account. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogout() {
    setSigningOut(true);
    localStorage.removeItem("trustvault_token");
    navigate("/login", { replace: true });
  }

  const username = user?.username || "TrustVault User";
  const initial = username.charAt(0).toUpperCase();

  function renderFeature(feature) {
    const card = (
      <article className="tv-feature-card">
        <div className="tv-feature-top">
          <div className={`tv-feature-icon ${feature.color}`}>
            {feature.icon}
          </div>

          <span
            className={`tv-feature-status ${
              feature.path ? "tv-status-available" : ""
            }`}
          >
            {feature.status}
          </span>
        </div>

        <p className="tv-feature-category">{feature.category}</p>

        <h3>{feature.title}</h3>

        <p className="tv-feature-description">
          {feature.description}
        </p>

        <div className="tv-feature-footer">
          <span>
            {feature.path ? "Open module" : "Coming soon"}
          </span>

          <span aria-hidden="true">
            {feature.path ? "→" : "•"}
          </span>
        </div>
      </article>
    );

    if (feature.path) {
      return (
        <Link
          to={feature.path}
          className="tv-feature-link"
          key={feature.title}
          aria-label={`Open ${feature.title}`}
        >
          {card}
        </Link>
      );
    }

    return (
      <div
        key={feature.title}
        className="tv-feature-disabled"
      >
        {card}
      </div>
    );
  }

  return (
    <div className="tv-dashboard">
      <aside className="tv-sidebar">
        <div className="tv-brand">
          <span className="tv-brand-mark">T</span>
          <span>TrustVault</span>
        </div>

        <p className="tv-nav-label">WORKSPACE</p>

        <nav className="tv-nav" aria-label="Main navigation">
          <a href="#overview" className="tv-nav-item active">
            <span>⌂</span> Overview
          </a>

          <Link to="/documents" className="tv-nav-item">
            <span>▤</span> Documents
          </Link>

          <Link to="/permissions" className="tv-nav-item">
            <span>♧</span> Sharing &amp; Access
          </Link>

          <Link to="/audit-logs" className="tv-nav-item">
            <span>≡</span> Security &amp; Audit
          </Link>
        </nav>

        <div className="tv-sidebar-bottom">
          <div className="tv-sidebar-security">
            <span className="tv-security-symbol">✓</span>

            <div>
              <strong>Security first</strong>
              <p>Your workspace uses authenticated access.</p>
            </div>
          </div>

          <button
            type="button"
            className="tv-logout-button"
            onClick={handleLogout}
            disabled={signingOut}
          >
            <span>↪</span>
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      <main className="tv-main">
        <header className="tv-topbar">
          <div className="tv-breadcrumb">
            Workspace <span>/</span> Overview
          </div>

          <div className="tv-user-chip">
            <div className="tv-avatar">{initial}</div>

            <div className="tv-user-chip-text">
              <strong>{username}</strong>
              <span>TrustVault account</span>
            </div>
          </div>
        </header>

        <div className="tv-content">
          <section className="tv-welcome" id="overview">
            <div>
              <p className="tv-eyebrow">
                YOUR SECURE WORKSPACE
              </p>

              <h1>
                Welcome back, {loading ? "..." : username}
                <span className="tv-welcome-period">.</span>
              </h1>

              <p className="tv-welcome-description">
                Your important documents deserve a safer place.
                Manage your files, access and security from one workspace.
              </p>
            </div>

            <div className="tv-session-badge">
              <span className="tv-session-dot" />

              {loading
                ? "Checking session"
                : error
                  ? "Connection issue"
                  : "Authenticated session"}
            </div>
          </section>

          {error && (
            <section className="tv-alert" role="alert">
              <div>
                <strong>Unable to load account details</strong>
                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </section>
          )}

          <section className="tv-summary-grid">
            <Link
              to="/documents"
              className="tv-summary-link"
            >
              <article className="tv-summary-card">
                <div className="tv-summary-icon purple">
                  ▤
                </div>

                <div>
                  <p>Document workspace</p>
                  <h2>My Documents</h2>
                  <span>Open private file management</span>
                </div>
              </article>
            </Link>

            <article className="tv-summary-card">
              <div className="tv-summary-icon green">✓</div>

              <div>
                <p>Authentication</p>

                <h2>
                  {error
                    ? "Check connection"
                    : loading
                      ? "Checking..."
                      : "Connected"}
                </h2>

                <span>Live account verification</span>
              </div>
            </article>

            <Link
              to="/permissions"
              className="tv-summary-link"
            >
              <article className="tv-summary-card">
                <div className="tv-summary-icon blue">
                  ♧
                </div>

                <div>
                  <p>Access control</p>
                  <h2>Sharing &amp; Access</h2>
                  <span>Manage document permissions</span>
                </div>
              </article>
            </Link>
          </section>

          <section
            className="tv-features-section"
            id="features"
          >
            <div className="tv-section-heading">
              <div>
                <p className="tv-eyebrow">
                  TRUSTVAULT TOOLS
                </p>

                <h2>Your workspace features</h2>

                <p>
                  Your document, sharing and security tools in one place.
                </p>
              </div>

              <span className="tv-feature-count">
                {
                  features.filter((feature) => feature.path)
                    .length
                }{" "}
                available
                {" / "}
                {features.length} modules
              </span>
            </div>

            <div className="tv-feature-grid">
              {features.map(renderFeature)}
            </div>
          </section>

          <section
            className="tv-account-section"
            id="security"
          >
            <div className="tv-account-panel">
              <div className="tv-account-panel-icon">
                ♙
              </div>

              <div className="tv-account-details">
                <p className="tv-eyebrow">
                  ACCOUNT DETAILS
                </p>

                <h2>
                  {loading ? "Loading account..." : username}
                </h2>

                <p>
                  {user?.message ||
                    "Your account details are retrieved from the authenticated backend."}
                </p>
              </div>

              <span className="tv-account-status">
                {loading
                  ? "Loading"
                  : error
                    ? "Unavailable"
                    : "Verified session"}
              </span>
            </div>
          </section>

          <footer className="tv-footer">
            <span>TrustVault</span>
            <span>Secure document management</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
