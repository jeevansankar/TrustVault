
import { apiRequest } from "./apiClient";

const DOCUMENTS_ENDPOINT = "/api/v1/documents";

// Load documents belonging to the currently authenticated user.
export function getMyDocuments() {
  return apiRequest(DOCUMENTS_ENDPOINT);
}

// Load documents shared with the currently authenticated user.
export function getSharedWithMeDocuments() {
  return apiRequest(`${DOCUMENTS_ENDPOINT}/shared-with-me`);
}

// Upload a file using the multipart field name expected by Spring Boot.
export function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(DOCUMENTS_ENDPOINT, {
    method: "POST",
    body: formData,
  });
}

// Delete a document owned by the current user.
export function deleteDocument(documentId) {
  return apiRequest(
    `${DOCUMENTS_ENDPOINT}/${encodeURIComponent(documentId)}`,
    { method: "DELETE" }
  );
}

// Download a document as a Blob.
// The backend verifies that the current user is authorized.
export async function downloadDocument(documentId) {
  const token = localStorage.getItem("trustvault_token");

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || ""}${DOCUMENTS_ENDPOINT}/${encodeURIComponent(documentId)}/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    let message = `Download failed (${response.status})`;

    try {
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const body = await response.json();
        message = body.message || message;
      } else {
        const body = await response.text();
        if (body) message = body;
      }
    } catch {
      // Keep the fallback message if the server returned no readable error.
    }

    throw new Error(message);
  }

  return response.blob();
}
