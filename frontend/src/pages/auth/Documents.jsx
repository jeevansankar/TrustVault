
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from "../../api/documentApi";

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

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [busyDocumentId, setBusyDocumentId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  // useCallback keeps the same loader function between renders unless
  // its dependencies change. We can reuse it after uploads and deletions.
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getMyDocuments();

      // The controller returns List<DocumentResponse>, which is a JSON array.
      setDocuments(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message || "Unable to load your documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch the document list when the page first opens.
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  function handleFileChange(event) {
    setSelectedFile(event.target.files?.[0] || null);
    setError("");
    setMessage("");
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please choose a file to upload.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const result = await uploadDocument(selectedFile);

      setSelectedFile(null);

      // Clear the actual browser file input as well as React state.
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage(result?.message || "Document uploaded successfully.");

      // Refresh the list so the new document appears.
      await loadDocuments();
    } catch (err) {
      setError(err.message || "Document upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(document) {
    setBusyDocumentId(document.id);
    setError("");
    setMessage("");

    try {
      const blob = await downloadDocument(document.id);
      const fileUrl = URL.createObjectURL(blob);

      // Create a temporary link to let the browser save the file.
      const link = window.document.createElement("a");
      link.href = fileUrl;
      link.download = document.originalFilename || `document-${document.id}`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      // Revoke the temporary URL after the browser has started the download.
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);

      setMessage(`Download started: ${document.originalFilename}`);
    } catch (err) {
      setError(err.message || "Unable to download this document.");
    } finally {
      setBusyDocumentId(null);
    }
  }

  async function handleDelete(document) {
    const confirmed = window.confirm(
      `Delete "${document.originalFilename}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setBusyDocumentId(document.id);
    setError("");
    setMessage("");

    try {
      await deleteDocument(document.id);

      // Remove the deleted item from the current screen immediately.
      setDocuments((current) =>
        current.filter((item) => item.id !== document.id)
      );

      setMessage(`Deleted: ${document.originalFilename}`);
    } catch (err) {
      setError(err.message || "Unable to delete this document.");
    } finally {
      setBusyDocumentId(null);
    }
  }

  return (
    <main className="doc-page">
      <header className="doc-header">
        <div className="doc-brand">
          <Link to="/dashboard" className="doc-brand-mark" aria-label="TrustVault home">
            T
          </Link>

          <div>
            <strong>TrustVault</strong>
            <span>Secure document workspace</span>
          </div>
        </div>

        <Link to="/dashboard" className="doc-back-link">
          ← Back to dashboard
        </Link>
      </header>

      <div className="doc-content">
        <section className="doc-heading">
          <div>
            <p className="doc-eyebrow">PRIVATE WORKSPACE</p>
            <h1>My Documents</h1>
            <p>
              Upload, organize, download and manage your private files.
            </p>
          </div>

          <div className="doc-count">
            <strong>{documents.length}</strong>
            <span>{documents.length === 1 ? "document" : "documents"}</span>
          </div>
        </section>

        {error && (
          <div className="doc-alert doc-alert-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
              ×
            </button>
          </div>
        )}

        {message && (
          <div className="doc-alert doc-alert-success" role="status">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")} aria-label="Dismiss message">
              ×
            </button>
          </div>
        )}

        <section className="doc-upload-card">
          <div className="doc-upload-icon" aria-hidden="true">↑</div>

          <div className="doc-upload-copy">
            <h2>Upload a document</h2>
            <p>Select a file from your device to store it in your workspace.</p>
          </div>

          <form className="doc-upload-form" onSubmit={handleUpload}>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              aria-label="Choose a document to upload"
              disabled={uploading}
            />

            <button
              type="submit"
              className="doc-primary-button"
              disabled={uploading || !selectedFile}
            >
              {uploading ? "Uploading..." : "Upload file"}
            </button>
          </form>

          {selectedFile && (
            <p className="doc-selected-file">
              Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </p>
          )}
        </section>

        <section className="doc-list-section">
          <div className="doc-list-heading">
            <div>
              <h2>Your files</h2>
              <p>Documents returned by your authenticated account.</p>
            </div>

            <button
              type="button"
              className="doc-refresh-button"
              onClick={loadDocuments}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="doc-state-panel">
              <div className="doc-spinner" />
              <p>Loading your documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="doc-state-panel">
              <div className="doc-empty-icon" aria-hidden="true">▤</div>
              <h3>No documents yet</h3>
              <p>Upload your first file to see it listed here.</p>
            </div>
          ) : (
            <div className="doc-table-wrapper">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td>
                        <div className="doc-file-name">
                          <span className="doc-file-icon" aria-hidden="true">
                            ▤
                          </span>
                          <div>
                            <strong>{document.originalFilename}</strong>
                            <small>ID: {document.id}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="doc-type-badge">
                          {getFileType(
                            document.contentType,
                            document.originalFilename
                          )}
                        </span>
                      </td>

                      <td>{formatFileSize(document.fileSize)}</td>

                      <td>{formatDate(document.createdAt)}</td>

                      <td>
                        <div className="doc-row-actions">
                          <button
                            type="button"
                            className="doc-download-button"
                            onClick={() => handleDownload(document)}
                            disabled={busyDocumentId !== null}
                          >
                            {busyDocumentId === document.id
                              ? "Working..."
                              : "Download"}
                          </button>

                          <button
                            type="button"
                            className="doc-delete-button"
                            onClick={() => handleDelete(document)}
                            disabled={busyDocumentId !== null}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="doc-footer">
          <span>TrustVault</span>
          <span>Your files stay under backend access controls.</span>
        </footer>
      </div>
    </main>
  );
}

export default Documents;
