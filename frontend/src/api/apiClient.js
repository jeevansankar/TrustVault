
const API_BASE_URL = "https://trustvault-api.duckdns.org";

// Reusable function for calling the Spring Boot backend.
export async function apiRequest(endpoint, options = {}) {
  // Read the saved JWT for authenticated requests.
  const token = localStorage.getItem("trustvault_token");

  // Copy any headers supplied by the caller.
  const headers = {
    ...options.headers,
  };

  // Attach the JWT when the user is logged in.
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Set JSON headers for normal request bodies.
  // FormData must set its own multipart boundary.
  if (
    !(options.body instanceof FormData) &&
    options.body !== undefined
  ) {
    headers["Content-Type"] = "application/json";
  }

  // Send the request to the HTTPS Spring Boot backend.
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // HTTP 204 means success with no response body.
  if (response.status === 204) {
    return null;
  }

  // Read the response according to its content type.
  const contentType = response.headers.get("content-type") || "";
  let result = null;

  if (contentType.includes("application/json")) {
    result = await response.json();
  } else {
    const responseText = await response.text();
    result = responseText || null;
  }

  // Handle unsuccessful HTTP responses.
  if (!response.ok) {
    const message =
      typeof result === "string"
        ? result
        : result?.message || `Request failed (${response.status})`;

    throw new Error(message);
  }

  // Return parsed JSON or a plain-text response.
  return result;
}
