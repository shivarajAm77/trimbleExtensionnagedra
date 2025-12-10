document.addEventListener("DOMContentLoaded", async () => {
  console.log("auth.js loaded");

  // Create Keycloak instance
  window.keycloak = new Keycloak({
    url: "https://securedev.virtuele.us",
    realm: "virtuele-dev",
    clientId: "web"
  });

  console.log("Keycloak object created:", window.keycloak);

  // Initialize Keycloak
  await window.keycloak.init({
    onLoad: "check-sso",
    pkceMethod: "S256", // PKCE enabled
    silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html"
  }).then(authenticated => {
    if (authenticated) {
      console.log("User authenticated", window.keycloak.tokenParsed);
      document.getElementById("authStatus").innerHTML = `
        ✅ Logged in as: ${window.keycloak.tokenParsed.preferred_username}
      `;
    } else {
      console.log("User not authenticated yet");
    }
  }).catch(err => console.error("Keycloak init error:", err));

  // Attach login button
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      console.log("Login button clicked");
      // Keycloak handles PKCE automatically
      window.keycloak.login({
        redirectUri: window.location.href
      });
    });
  } else {
    console.error("loginBtn not found in DOM");
  }
});
