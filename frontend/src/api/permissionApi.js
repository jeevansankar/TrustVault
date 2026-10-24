
import { apiRequest } from "./apiClient";

const DOCUMENTS_ENDPOINT = "/api/v1/documents";

// Get the users who currently have permission to access a document.
export function getDocumentPermissions(documentId) {
  return apiRequest(
    `${DOCUMENTS_ENDPOINT}/${encodeURIComponent(documentId)}/permissions`
  );
}

// Share a document with a recipient.
export function shareDocument(documentId, request) {
  return apiRequest(
    `${DOCUMENTS_ENDPOINT}/${encodeURIComponent(documentId)}/permissions`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}

// Remove a recipient's permission.
export function revokeDocumentPermission(documentId, permissionId) {
  return apiRequest(
    `${DOCUMENTS_ENDPOINT}/${encodeURIComponent(documentId)}/permissions/${encodeURIComponent(permissionId)}`,
    {
      method: "DELETE",
    }
  );
}
