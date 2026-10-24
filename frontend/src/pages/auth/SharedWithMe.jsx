
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  downloadDocument,
  getSharedWithMeDocuments,
} from "../../api/documentApi";
import "./SharedWithMe.css";

function formatFileSize(bytes) {
  if (bytes == null || bytes < 0) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getFileType(contentType, filename) {
  const extension = filename?.split(".").pop()?.toLowerCase();

  if (contentType === "application/pdf" || extension === "pdf") {
    return "PDF";
  }

  if (contentType?.startsWith("image/")) return "IMAGE";
  if (contentType?.startsWith("text/")) return "TEXT";

  return extension && extension !== filename?.toLowerCase()
    ? extension.toUpperCase()
    : "FILE";
}

function SharedWithMe() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyDocumentId, setBusyDocumentId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getSharedWithMeDocuments();
      setDocuments(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message || "Unable to load shared documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleDownload(document) {
    setBusyDocumentId(document.id);
    setError("");
    setMessage("");

    try {
      const blob = await downloadDocument(document.id);
      const fileUrl = URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      link.href = fileUrl;
      link.download =
        document.originalFilename || `document-${document.id}`;

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);

      setMessage(
        `Download started: ${document.originalFilename || "document"}`
      );
    } catch (err) {
      setError(err.message || "Unable to download this document.");
    } finally {
      setBusyDocumentId(null);
    }
  }

  return (
    <main className="shared-page">
      <header className="shared-header">
        <Link
          to="/dashboard"
          className="shared-brand"
          aria-label="TrustVault dashboard"
        >
          <span className="shared-brand-mark">T</span>
          <span>
            <strong>TrustVault</strong>
            <small>Secure document workspace</small>
          </span>
        </Link>

        <nav className="shared-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/documents">My Documents</Link>
          <Link to="/permissions">Sharing &amp; Access</Link>
        </nav>
      </header>

      <div className="shared-content">
        <section className="shared-heading">
          <div>
            <p className="shared-eyebrow">SECURE ACCESS</p>
            <h1>Shared with Me</h1>
            <p>
              Documents other TrustVault users have shared with your account.
            </p>
          </div>

          <div className="shared-count">
            <strong>{documents.length}</strong>
            <span>
              {documents.length === 1 ? "document" : "documents"}
            </span>
          </div>
        </section>

        {error && (
          <div className="shared-alert shared-alert-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
              Dismiss
            </button>
          </div>
        )}

        {message && (
          <div className="shared-alert shared-alert-success" role="status">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")}>
              Dismiss
            </button>
          </div>
        )}

        <section className="shared-card">
          <div className="shared-list-heading">
            <div>
              <h2>Available to you</h2>
              <p>
                Only documents returned by your authenticated account appear
                here.
              </p>
            </div>

            <button
              type="button"
              className="shared-refresh"
              onClick={loadDocuments}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="shared-state">
              <div className="shared-spinner" />
              <p>Loading shared documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="shared-state">
              <div className="shared-empty-icon">▤</div>
              <h3>No shared documents yet</h3>
              <p>
                When someone shares a document with your account, it will
                appear here.
              </p>
            </div>
          ) : (
            <div className="shared-table-wrap">
              <table className="shared-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Added</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td>
                        <div className="shared-file-name">
                          <span className="shared-file-icon">▤</span>
                          <div>
                            <strong>
                              {document.originalFilename || "Untitled document"}
                            </strong>
                            <small>Shared document</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="shared-type">
                          {getFileType(
                            document.contentType,
                            document.originalFilename
                          )}
                        </span>
                      </td>

                      <td>{formatFileSize(document.fileSize)}</td>
                      <td>{formatDate(document.createdAt)}</td>

                      <td>
                        <button
                          type="button"
                          className="shared-download"
                          onClick={() => handleDownload(document)}
                          disabled={busyDocumentId !== null}
                        >
                          {busyDocumentId === document.id
                            ? "Downloading..."
                            : "Download"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="shared-security-note">
          <span aria-hidden="true">✓</span>
          <p>
            Access is checked by the TrustVault backend. If the owner revokes
            your permission, future download requests should be denied.
          </p>
        </div>
      </div>
    </main>
  );
}

export default SharedWithMe;
