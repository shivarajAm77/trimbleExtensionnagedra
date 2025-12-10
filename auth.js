document.addEventListener("DOMContentLoaded", async () => {
  // Create Keycloak instance
  window.keycloak = new Keycloak({
    url: "https://securedev.virtuele.us",
    realm: "virtuele-dev",
    clientId: "web"
  });

  // Initialize Keycloak (PKCE)
  await window.keycloak.init({
    onLoad: "check-sso",
    pkceMethod: "S256",
    silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html"
  }).then(authenticated => {
    if (authenticated) {
      console.log("User authenticated", window.keycloak.tokenParsed);
      document.getElementById("authStatus").innerHTML = `
        ✅ Logged in as: ${window.keycloak.tokenParsed.preferred_username}
      `;
    }
  }).catch(err => console.error("Keycloak init error:", err));

  // Attach login button
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      console.log("Login button clicked");
      // Open Keycloak login in a NEW TAB
      const loginUrl = window.keycloak.createLoginUrl({
        redirectUri: window.location.href
      });
      window.open(loginUrl, "_blank", "noopener,noreferrer");
    });
  } else {
    console.error("loginBtn not found in DOM");
  }
});
