document.addEventListener("DOMContentLoaded", () => {
  console.log("Handling Keycloak redirect...");

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  if (!code) {
    console.log("No authorization code found – normal page load");
    return;
  }

  console.log("✅ Authorization code received:", code);

  // ✅ Validate state
  const savedState = sessionStorage.getItem("oauth_state");
  if (!savedState || savedState !== state) {
    console.error("❌ Invalid OAuth state");
    document.body.innerHTML = "<h3>Security error. Invalid state.</h3>";
    return;
  }

  // ✅ Save code temporarily (send to backend later)
  sessionStorage.setItem("auth_code", code);

  // ✅ CLEAN URL (remove code from address bar)
  window.history.replaceState({}, document.title, window.location.pathname);

  document.body.innerHTML = `
    <h2>✅ Login successful</h2>
    <p>You can close this tab.</p>
  `;

  // ✅ OPTIONAL: Notify opener (Trimble tab)
  if (window.opener) {
    window.opener.postMessage(
      { type: "KEYCLOAK_LOGIN_SUCCESS", code },
      "*"
    );
  }

  // ✅ OPTIONAL: Auto-close tab
  setTimeout(() => window.close(), 1500);
});
