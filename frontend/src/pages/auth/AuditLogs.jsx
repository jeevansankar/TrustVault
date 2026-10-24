
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/apiClient";
import "./AuditLogs.css";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOutcomeClass(outcome) {
  const value = String(outcome || "").toLowerCase();

  if (value.includes("success") || value === "allowed") {
    return "audit-outcome-success";
  }

  if (
    value.includes("fail") ||
    value.includes("denied") ||
    value.includes("error")
  ) {
    return "audit-outcome-failed";
  }

  return "audit-outcome-neutral";
}

function AuditLogs() {
  const [events, setEvents] = useState([]);
  const [integrity, setIntegrity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIntegrity, setCheckingIntegrity] = useState(false);
  const [error, setError] = useState("");
  const [integrityError, setIntegrityError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAuditData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/v1/audit/my-events");

      if (!Array.isArray(result)) {
        throw new Error("Unexpected audit events response from the server.");
      }

      setEvents(result);
    } catch (err) {
      setError(err.message || "Unable to load audit events.");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkIntegrity = useCallback(async () => {
    setCheckingIntegrity(true);
    setIntegrityError("");

    try {
      const result = await apiRequest("/api/v1/audit/integrity");
      setIntegrity(result);
    } catch (err) {
      setIntegrityError(
        err.message || "Unable to verify audit chain integrity."
      );
    } finally {
      setCheckingIntegrity(false);
    }
  }, []);

  useEffect(() => {
    loadAuditData();
    checkIntegrity();
  }, [loadAuditData, checkIntegrity, refreshKey]);

  const refreshData = () => {
    setRefreshKey((current) => current + 1);
  };

  const successfulEvents = events.filter((event) => {
    const outcome = String(event.outcome || "").toLowerCase();

    return (
      outcome.includes("success") ||
      outcome === "allowed"
    );
  }).length;

  const failedEvents = events.filter((event) => {
    const outcome = String(event.outcome || "").toLowerCase();

    return (
      outcome.includes("fail") ||
      outcome.includes("denied") ||
      outcome.includes("error")
    );
  }).length;

  return (
    <div className="audit-page">
      <header className="audit-topbar">
        <Link to="/dashboard" className="audit-brand">
          <span className="audit-brand-mark">T</span>
          <span>TrustVault</span>
        </Link>

        <nav className="audit-breadcrumb" aria-label="Breadcrumb">
          <Link to="/dashboard">Workspace</Link>
          <span>/</span>
          <span>Audit Logs</span>
        </nav>

        <Link to="/dashboard" className="audit-back-link">
          ← Dashboard
        </Link>
      </header>

      <main className="audit-content">
        <section className="audit-heading">
          <div>
            <p className="audit-eyebrow">SECURITY CENTER</p>
            <h1>Audit Logs</h1>
            <p className="audit-subtitle">
              Review activity recorded for your TrustVault account
              and check the integrity of the audit chain.
            </p>
          </div>

          <button
            type="button"
            className="audit-refresh-button"
            onClick={refreshData}
            disabled={loading || checkingIntegrity}
          >
            ↻ {loading || checkingIntegrity ? "Refreshing..." : "Refresh"}
          </button>
        </section>

        <section className="audit-summary-grid">
          <article className="audit-summary-card">
            <span className="audit-summary-icon purple">≡</span>
            <div>
              <p>Total events</p>
              <h2>{loading ? "—" : events.length}</h2>
              <span>Events returned by the backend</span>
            </div>
          </article>

          <article className="audit-summary-card">
            <span className="audit-summary-icon green">✓</span>
            <div>
              <p>Successful events</p>
              <h2>{loading ? "—" : successfulEvents}</h2>
              <span>Based on recorded outcome values</span>
            </div>
          </article>

          <article className="audit-summary-card">
            <span className="audit-summary-icon orange">!</span>
            <div>
              <p>Failed or denied</p>
              <h2>{loading ? "—" : failedEvents}</h2>
              <span>Based on recorded outcome values</span>
            </div>
          </article>
        </section>

        <section className="audit-integrity-panel">
          <div className="audit-integrity-symbol">◇</div>

          <div className="audit-integrity-copy">
            <p className="audit-eyebrow">CHAIN VERIFICATION</p>
            <h2>Audit integrity</h2>

            {checkingIntegrity && (
              <p>Checking the audit chain...</p>
            )}

            {!checkingIntegrity && integrity && (
              <p
                className={
                  integrity.valid
                    ? "audit-integrity-valid"
                    : "audit-integrity-invalid"
                }
                role="status"
              >
                <span aria-hidden="true">
                  {integrity.valid ? "✓ " : "! "}
                </span>
                {integrity.message ||
                  (integrity.valid
                    ? "Audit chain is valid"
                    : "Audit chain integrity check failed")}
              </p>
            )}

            {!checkingIntegrity && integrityError && (
              <p className="audit-integrity-invalid" role="alert">
                {integrityError}
              </p>
            )}
          </div>

          <button
            type="button"
            className="audit-verify-button"
            onClick={checkIntegrity}
            disabled={checkingIntegrity}
          >
            {checkingIntegrity ? "Verifying..." : "Verify again"}
          </button>
        </section>

        {error && (
          <div className="audit-error" role="alert">
            <div>
              <strong>Unable to load audit events</strong>
              <p>{error}</p>
            </div>

            <button type="button" onClick={loadAuditData}>
              Try again
            </button>
          </div>
        )}

        <section className="audit-events-panel">
          <div className="audit-events-heading">
            <div>
              <p className="audit-eyebrow">ACTIVITY HISTORY</p>
              <h2>Your recent events</h2>
            </div>

            <span className="audit-event-count">
              {loading ? "Loading..." : `${events.length} events`}
            </span>
          </div>

          {loading ? (
            <div className="audit-state">
              <div className="audit-spinner" />
              <p>Loading your audit history...</p>
            </div>
          ) : error ? (
            <div className="audit-state">
              <span className="audit-state-icon">!</span>
              <p>Audit events could not be loaded.</p>
            </div>
          ) : events.length === 0 ? (
            <div className="audit-state">
              <span className="audit-state-icon">≡</span>
              <h3>No audit events yet</h3>
              <p>
                Activity will appear here when your account performs
                actions that are recorded by the backend.
              </p>
            </div>
          ) : (
            <div className="audit-table-wrapper">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Outcome</th>
                    <th>Date and time</th>
                    <th>Event hash</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <strong>{event.action || "—"}</strong>
                        {event.details && (
                          <p className="audit-event-details">
                            {event.details}
                          </p>
                        )}
                      </td>

                      <td>
                        <span className="audit-resource-type">
                          {event.resourceType || "—"}
                        </span>
                        {event.resourceId != null && (
                          <p className="audit-resource-id">
                            ID: {event.resourceId}
                          </p>
                        )}
                      </td>

                      <td>
                        <span
                          className={`audit-outcome ${getOutcomeClass(
                            event.outcome
                          )}`}
                        >
                          {event.outcome || "Unknown"}
                        </span>
                      </td>

                      <td className="audit-date">
                        {formatDate(event.createdAt)}
                      </td>

                      <td>
                        <code
                          className="audit-hash"
                          title={event.eventHash || ""}
                        >
                          {event.eventHash
                            ? `${event.eventHash.slice(0, 12)}...`
                            : "—"}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="audit-footer">
          <span>TrustVault Security</span>
          <span>Authenticated audit history</span>
        </footer>
      </main>
    </div>
  );
}

export default AuditLogs;
