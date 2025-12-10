document.addEventListener("DOMContentLoaded", async () => {
  console.log("auth.js loaded");

  // ------------------- Helpers for PKCE -------------------
  function generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function base64UrlEncode(arrayBuffer) {
    let str = '';
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(digest);
  }

  // ------------------- Keycloak Initialization -------------------
  window.keycloak = new Keycloak({
    url: "https://securedev.virtuele.us",
    realm: "virtuele-dev",
    clientId: "web"
  });

  console.log("Keycloak object created:", window.keycloak);

  await window.keycloak.init({
    onLoad: "check-sso",
    pkceMethod: "S256",
    silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html"
  }).then(authenticated => {
    if (authenticated) {
      console.log("User is already authenticated", window.keycloak.tokenParsed);
      document.getElementById("authStatus").innerHTML = `
        ✅ Logged in as: ${window.keycloak.tokenParsed.preferred_username}
      `;
    } else {
      console.log("User not authenticated yet");
    }
  }).catch(err => console.error("Keycloak init error:", err));

  // ------------------- Login Button -------------------
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      console.log("Login button clicked");

      // Generate PKCE code verifier & challenge manually
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString(16);
      const nonce = generateRandomString(16);

      // Save code_verifier and state for token exchange after login
      sessionStorage.setItem("pkce_code_verifier", codeVerifier);
      sessionStorage.setItem("oauth_state", state);

      // Redirect to Keycloak login page with PKCE
      const authUrl = `${window.keycloak.authServerUrl}/realms/${window.keycloak.realm}/protocol/openid-connect/auth?` +
        `client_id=${encodeURIComponent(window.keycloak.clientId)}` +
        `&redirect_uri=${encodeURIComponent(window.location.href)}` +
        `&response_type=code` +
        `&scope=openid` +
        `&code_challenge=${encodeURIComponent(codeChallenge)}` +
        `&code_challenge_method=S256` +
        `&state=${encodeURIComponent(state)}` +
        `&nonce=${encodeURIComponent(nonce)}`;

      window.location.href = authUrl;
    });
  } else {
    console.error("loginBtn not found in DOM");
  }
});
