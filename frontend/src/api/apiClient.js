
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Reusable function for calling the Spring Boot backend.
// React pages can use this function for all API requests.
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

  // Send JSON headers for normal request bodies.
  // Do not set Content-Type for FormData because the browser
  // must add the multipart boundary for file uploads.
  if (
    !(options.body instanceof FormData) &&
    options.body !== undefined
  ) {
    headers["Content-Type"] = "application/json";
  }

  // fetch() returns a Promise, so await waits for the response.
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // HTTP 204 means success with no response body.
  if (response.status === 204) {
    return null;
  }

  // Check the response format returned by Spring Boot.
  const contentType = response.headers.get("content-type") || "";

  let result = null;

  if (contentType.includes("application/json")) {
    // Parse JSON responses into JavaScript objects.
    result = await response.json();
  } else {
    // Read plain-text responses, including OTP success messages.
    // Also read text error responses so we can show their message.
    const responseText = await response.text();
    result = responseText || null;
  }

  // fetch() does not throw automatically for HTTP 400 or 500.
  // Check the status and throw an error for unsuccessful responses.
  if (!response.ok) {
    const message =
      typeof result === "string"
        ? result
        : result?.message || `Request failed (${response.status})`;

    throw new Error(message);
  }

  // Return the parsed JSON object or plain-text message.
  return result;
}
