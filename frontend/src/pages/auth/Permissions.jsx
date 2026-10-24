
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDocuments } from "../../api/documentApi";
import {
  getDocumentPermissions,
  shareDocument,
  revokeDocumentPermission,
} from "../../api/permissionApi";
import "./Permissions.css";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function getErrorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

function Permissions() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [permissions, setPermissions] = useState([]);

  const [recipientEmail, setRecipientEmail] = useState("");
  const [permissionLevel, setPermissionLevel] = useState("VIEW");

  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load the documents owned by the signed-in user.
  useEffect(() => {
    let active = true;

    async function loadDocuments() {
      setLoadingDocuments(true);
      setError("");

      try {
        const result = await getMyDocuments();

        if (!active) return;

        const list = Array.isArray(result) ? result : [];
        setDocuments(list);

        if (list.length > 0) {
          setSelectedDocumentId(String(list[0].id));
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) setLoadingDocuments(false);
      }
    }

    loadDocuments();

    return () => {
      active = false;
    };
  }, []);

  // Reload permissions whenever the selected document changes.
  useEffect(() => {
    let active = true;

    async function loadPermissions() {
      if (!selectedDocumentId) {
        setPermissions([]);
        return;
      }

      setLoadingPermissions(true);
      setError("");
      setSuccess("");

      try {
        const result = await getDocumentPermissions(selectedDocumentId);

        if (active) {
          setPermissions(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (active) {
          setPermissions([]);
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) setLoadingPermissions(false);
      }
    }

    loadPermissions();

    return () => {
      active = false;
    };
  }, [selectedDocumentId]);

  const selectedDocument = documents.find(
    (document) => String(document.id) === selectedDocumentId
  );

  async function handleShare(event) {
    event.preventDefault();

    if (!selectedDocumentId) {
      setError("Please select a document first.");
      return;
    }

    const email = recipientEmail.trim();

    if (!email) {
      setError("Enter the recipient's email address.");
      return;
    }

    setSharing(true);
    setError("");
    setSuccess("");

    try {
      const createdPermission = await shareDocument(selectedDocumentId, {
        recipientEmail: email,
        permissionLevel,
      });

      setPermissions((current) => {
        // Avoid showing a duplicate if the API returns an existing permission.
        const exists = current.some(
          (item) => String(item.id) === String(createdPermission?.id)
        );

        if (exists) return current;

        return createdPermission
          ? [...current, createdPermission]
          : current;
      });

      setRecipientEmail("");
      setSuccess(`Document shared with ${email}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSharing(false);
    }
  }

  async function handleRevoke(permission) {
    const recipient =
      permission.recipientEmail || "this recipient";

    const confirmed = window.confirm(
      `Revoke ${recipient}'s access to this document?`
    );

    if (!confirmed) return;

    setRevokingId(permission.id);
    setError("");
    setSuccess("");

    try {
      await revokeDocumentPermission(
        selectedDocumentId,
        permission.id
      );

      setPermissions((current) =>
        current.filter(
          (item) => String(item.id) !== String(permission.id)
        )
      );

      setSuccess(`Access revoked for ${recipient}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <main className="permissions-page">
      <header className="permissions-topbar">
        <Link to="/dashboard" className="permissions-brand">
          <span className="permissions-brand-icon">T</span>
          <span>TrustVault</span>
        </Link>

        <nav className="permissions-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/documents">My Documents</Link>
          <span className="permissions-nav-active">Sharing & Access</span>
        </nav>
      </header>

      <section className="permissions-content">
        <div className="permissions-heading">
          <div>
            <p className="permissions-eyebrow">DOCUMENT SECURITY</p>
            <h1>Sharing & Access</h1>
            <p className="permissions-subtitle">
              Manage who can view your documents.
              You remain in control of access.
            </p>
          </div>

          <div className="permissions-secure-badge">
            <span aria-hidden="true">●</span>
            Access management
          </div>
        </div>

        {error && (
          <div className="permissions-alert permissions-alert-error" role="alert">
            <strong>Something went wrong</strong>
            <span>{error}</span>
            <button
              type="button"
              className="permissions-alert-close"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            className="permissions-alert permissions-alert-success"
            role="status"
          >
            <span>{success}</span>
            <button
              type="button"
              className="permissions-alert-close"
              onClick={() => setSuccess("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {loadingDocuments ? (
          <section className="permissions-state-card">
            <div className="permissions-spinner" />
            <p>Loading your documents…</p>
          </section>
        ) : documents.length === 0 ? (
          <section className="permissions-state-card">
            <div className="permissions-empty-icon">▤</div>
            <h2>No documents yet</h2>
            <p>
              Upload a document before managing its sharing permissions.
            </p>
            <Link to="/documents" className="permissions-primary-link">
              Go to My Documents
            </Link>
          </section>
        ) : (
          <div className="permissions-layout">
            <section className="permissions-panel permissions-share-panel">
              <div className="permissions-panel-heading">
                <div className="permissions-step-icon">01</div>
                <div>
                  <h2>Share a document</h2>
                  <p>Give another registered user viewing access.</p>
                </div>
              </div>

              <form onSubmit={handleShare} className="permissions-form">
                <label htmlFor="permission-document">
                  Select document
                </label>

                <select
                  id="permission-document"
                  value={selectedDocumentId}
                  onChange={(event) =>
                    setSelectedDocumentId(event.target.value)
                  }
                  required
                >
                  {documents.map((document) => (
                    <option key={document.id} value={String(document.id)}>
                      {document.originalFilename || `Document ${document.id}`}
                    </option>
                  ))}
                </select>

                <label htmlFor="recipient-email">
                  Recipient email
                </label>

                <input
                  id="recipient-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  maxLength={254}
                  autoComplete="email"
                  required
                />

                <label htmlFor="permission-level">
                  Access level
                </label>

                <select
                  id="permission-level"
                  value={permissionLevel}
                  onChange={(event) => setPermissionLevel(event.target.value)}
                  required
                >
                  <option value="VIEW">View only</option>
                </select>

                <div className="permissions-access-note">
                  <span aria-hidden="true">ⓘ</span>
                  <p>
                    View-only access does not grant editing permission.
                    Your backend remains responsible for enforcing access.
                  </p>
                </div>

                <button
                  type="submit"
                  className="permissions-primary-button"
                  disabled={sharing || !selectedDocumentId}
                >
                  {sharing ? "Sharing document…" : "Share document"}
                </button>
              </form>
            </section>

            <section className="permissions-panel permissions-list-panel">
              <div className="permissions-panel-heading">
                <div className="permissions-step-icon">02</div>
                <div>
                  <h2>People with access</h2>
                  <p>
                    {selectedDocument?.originalFilename ||
                      "Selected document"}
                  </p>
                </div>
              </div>

              <div className="permissions-document-summary">
                <div className="permissions-file-icon">▤</div>
                <div className="permissions-file-details">
                  <strong>
                    {selectedDocument?.originalFilename ||
                      `Document ${selectedDocumentId}`}
                  </strong>
                  <span>
                    {permissions.length}{" "}
                    {permissions.length === 1 ? "permission" : "permissions"}
                  </span>
                </div>
              </div>

              {loadingPermissions ? (
                <div className="permissions-inline-state">
                  <div className="permissions-spinner" />
                  <span>Loading access list…</span>
                </div>
              ) : permissions.length === 0 ? (
                <div className="permissions-empty-list">
                  <div className="permissions-empty-icon">♙</div>
                  <h3>No shared access</h3>
                  <p>
                    This document has no listed recipients yet. Share it using
                    the form.
                  </p>
                </div>
              ) : (
                <div className="permissions-table-wrap">
                  <table className="permissions-table">
                    <thead>
                      <tr>
                        <th>Recipient</th>
                        <th>Access</th>
                        <th>Shared on</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((permission) => (
                        <tr key={permission.id}>
                          <td>
                            <div className="permissions-recipient">
                              <span className="permissions-avatar">
                                {(permission.recipientEmail || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                              <span className="permissions-email">
                                {permission.recipientEmail || "Unknown recipient"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="permissions-level-badge">
                              {permission.permissionLevel || "VIEW"}
                            </span>
                          </td>
                          <td className="permissions-date">
                            {formatDate(permission.createdAt)}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="permissions-revoke-button"
                              onClick={() => handleRevoke(permission)}
                              disabled={revokingId === permission.id}
                            >
                              {revokingId === permission.id
                                ? "Revoking…"
                                : "Revoke"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="permissions-security-footer">
                <span aria-hidden="true">✓</span>
                <p>
                  Only share documents with people you trust. Revoking access
                  removes the permission recorded by TrustVault.
                </p>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

export default Permissions;
