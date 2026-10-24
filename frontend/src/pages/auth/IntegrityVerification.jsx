
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/apiClient";
import "./IntegrityVerification.css";

function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return "Size unavailable";

  const size = Number(bytes);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString();
}

function getFilename(document) {
  return (
    document.originalFilename ||
    document.filename ||
    `Document ${document.id}`
  );
}

function getStatusInfo(result) {
  switch (result?.status) {
    case "VERIFIED":
      return {
        label: "Verified",
        className: "iv-status-verified",
        icon: "✓",
      };

    case "INTEGRITY_MISMATCH":
      return {
        label: "Integrity mismatch",
        className: "iv-status-mismatch",
        icon: "!",
      };

    case "FILE_MISSING":
      return {
        label: "File missing",
        className: "iv-status-missing",
        icon: "×",
      };

    case "BASELINE_MISSING":
      return {
        label: "Baseline missing",
        className: "iv-status-baseline",
        icon: "?",
      };

    default:
      return {
        label: result?.status || "Unknown",
        className: "iv-status-unknown",
        icon: "i",
      };
  }
}

function IntegrityVerification() {
  const [documents, setDocuments] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState(null);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const loadDocuments = useCallback(async () => {
    setLoadingDocuments(true);
    setError("");

    try {
      const response = await apiRequest("/api/v1/documents");

      if (!Array.isArray(response)) {
        throw new Error("The server returned an unexpected document list.");
      }

      setDocuments(response);

      setSelectedId((currentId) => {
        const stillExists = response.some(
          (document) => String(document.id) === String(currentId)
        );

        return stillExists
          ? currentId
          : response.length > 0
            ? String(response[0].id)
            : "";
      });
    } catch (err) {
      setError(err.message || "Unable to load your documents.");
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const selectedDocument = documents.find(
    (document) => String(document.id) === String(selectedId)
  );

  async function handleVerify(event) {
    event.preventDefault();

    if (!selectedId) {
      setError("Select a document before running verification.");
      return;
    }

    setVerifying(true);
    setError("");
    setResult(null);

    try {
      const response = await apiRequest(
        `/api/v1/documents/${encodeURIComponent(selectedId)}/integrity`
      );

      setResult(response);
    } catch (err) {
      setError(err.message || "Document verification failed.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleRefresh() {
    setResult(null);
    await loadDocuments();
  }

  const statusInfo = result ? getStatusInfo(result) : null;

  return (
    <div className="iv-page">
      <header className="iv-topbar">
        <Link to="/dashboard" className="iv-brand">
          <span className="iv-brand-mark">T</span>
          <span>TrustVault</span>
        </Link>

        <nav className="iv-breadcrumb" aria-label="Breadcrumb">
          <Link to="/dashboard">Workspace</Link>
          <span>/</span>
          <span>Integrity Verification</span>
        </nav>

        <Link to="/dashboard" className="iv-back-link">
          ← Dashboard
        </Link>
      </header>

      <main className="iv-content">
        <section className="iv-heading">
          <div>
            <p className="iv-eyebrow">DOCUMENT SECURITY</p>
            <h1>Integrity Verification</h1>
            <p className="iv-subtitle">
              Check whether a stored document still matches its trusted
              SHA-256 fingerprint.
            </p>
          </div>

          <button
            type="button"
            className="iv-secondary-button"
            onClick={handleRefresh}
            disabled={loadingDocuments || verifying}
          >
            ↻ Refresh documents
          </button>
        </section>

        <section className="iv-info-banner">
          <div className="iv-info-icon">◇</div>
          <div>
            <h2>How verification works</h2>
            <p>
              TrustVault calculates a SHA-256 hash from the stored file and
              compares it with the hash saved when the document was uploaded.
              A match confirms that the bytes match that saved baseline.
            </p>
          </div>
        </section>

        {error && (
          <div className="iv-error" role="alert">
            <div>
              <strong>Unable to complete the operation</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <section className="iv-main-grid">
          <div className="iv-panel iv-select-panel">
            <div className="iv-panel-heading">
              <div>
                <p className="iv-eyebrow">STEP 01</p>
                <h2>Select a document</h2>
              </div>

              <span className="iv-count">
                {documents.length}{" "}
                {documents.length === 1 ? "document" : "documents"}
              </span>
            </div>

            {loadingDocuments ? (
              <div className="iv-state">
                <span className="iv-spinner" />
                <p>Loading your documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="iv-state">
                <div className="iv-empty-icon">▤</div>
                <h3>No documents found</h3>
                <p>
                  Upload a document first to run an integrity check.
                </p>
                <Link to="/documents" className="iv-primary-link">
                  Go to Documents →
                </Link>
              </div>
            ) : (
              <form onSubmit={handleVerify}>
                <label htmlFor="iv-document-select" className="iv-label">
                  Your documents
                </label>

                <select
                  id="iv-document-select"
                  className="iv-select"
                  value={selectedId}
                  onChange={(event) => {
                    setSelectedId(event.target.value);
                    setResult(null);
                    setError("");
                  }}
                  disabled={verifying}
                  required
                >
                  {documents.map((document) => (
                    <option key={document.id} value={String(document.id)}>
                      {getFilename(document)}
                    </option>
                  ))}
                </select>

                {selectedDocument && (
                  <div className="iv-document-card">
                    <div className="iv-file-icon">▤</div>

                    <div className="iv-document-details">
                      <strong>{getFilename(selectedDocument)}</strong>
                      <span>
                        {formatBytes(selectedDocument.fileSize)}
                        {" · "}
                        {selectedDocument.contentType || "Unknown file type"}
                      </span>
                      <span>
                        Uploaded{" "}
                        {formatDate(
                          selectedDocument.createdAt ||
                            selectedDocument.uploadedAt
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="iv-primary-button"
                  disabled={!selectedId || verifying}
                >
                  {verifying ? (
                    <>
                      <span className="iv-button-spinner" />
                      Verifying document...
                    </>
                  ) : (
                    <>
                      <span>◇</span>
                      Verify document integrity
                    </>
                  )}
                </button>

                <p className="iv-help-text">
                  Verification reads the stored file. It does not modify the
                  document or create a new trusted baseline.
                </p>
              </form>
            )}
          </div>

          <div className="iv-panel iv-result-panel">
            <div className="iv-panel-heading">
              <div>
                <p className="iv-eyebrow">STEP 02</p>
                <h2>Verification result</h2>
              </div>
            </div>

            {!result ? (
              <div className="iv-state iv-result-empty">
                <div className="iv-shield-placeholder">⌑</div>
                <h3>Ready to verify</h3>
                <p>
                  Select a document and run the integrity check. The result
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="iv-result-content">
                <div className={`iv-result-status ${statusInfo.className}`}>
                  <span className="iv-result-status-icon">
                    {statusInfo.icon}
                  </span>

                  <div>
                    <span>VERIFICATION STATUS</span>
                    <h3>{statusInfo.label}</h3>
                  </div>
                </div>

                <p className="iv-result-message">{result.message}</p>

                <div className="iv-hash-group">
                  <label>Expected SHA-256</label>
                  <div className="iv-hash-value">
                    <code>{result.expectedHash || "Not available"}</code>
                    {result.expectedHash && (
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(result.expectedHash)
                        }
                        title="Copy expected hash"
                        aria-label="Copy expected hash"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>

                <div className="iv-hash-group">
                  <label>Actual SHA-256</label>
                  <div className="iv-hash-value">
                    <code>{result.actualHash || "Not available"}</code>
                    {result.actualHash && (
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(result.actualHash)
                        }
                        title="Copy actual hash"
                        aria-label="Copy actual hash"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>

                <div className="iv-result-meta">
                  <span>Document ID</span>
                  <strong>{result.documentId ?? selectedId}</strong>
                </div>

                <div className="iv-result-meta">
                  <span>Document</span>
                  <strong>{result.filename || "Selected document"}</strong>
                </div>

                <div className="iv-result-note">
                  {result.verified
                    ? "The current file bytes match the saved SHA-256 baseline."
                    : "This document could not be confirmed as matching its trusted baseline."}
                </div>

                <button
                  type="button"
                  className="iv-secondary-button iv-verify-again"
                  onClick={handleVerify}
                  disabled={verifying || !selectedId}
                >
                  Verify again
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="iv-security-note">
          <span>ⓘ</span>
          <p>
            <strong>Security note:</strong> verification checks the file
            against its saved hash. If an attacker can modify both the stored
            file and the database hash, this check alone cannot prove the
            baseline is authentic.
          </p>
        </section>

        <footer className="iv-footer">
          <span>TrustVault Security</span>
          <Link to="/audit-logs">View audit logs →</Link>
        </footer>
      </main>
    </div>
  );
}

export default IntegrityVerification;
