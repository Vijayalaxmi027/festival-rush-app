
async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Make sure the server is running on port 5000."
    );
  }

  const responseText = await response.text();
  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(
      `The server returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}.`
    );
  }

  return data;
}

export function getHealth() {
  return request("/api/health");
}

export function getDashboard() {
  return request("/api/dashboard");
}

export function investigateProduct(sku = "TV-5501") {
  return request(
    `/api/investigate/${encodeURIComponent(sku)}`
  );
}

export function getDecisions() {
  return request("/api/decisions");
}

export function submitDecision({ sku, action, quantity }) {
  return request("/api/decisions", {
    method: "POST",
    body: JSON.stringify({
      sku,
      action,
      quantity,
    }),
  });
}
