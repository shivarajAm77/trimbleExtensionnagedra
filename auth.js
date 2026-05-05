document.addEventListener("DOMContentLoaded", async () => {

  console.log("🚀 authorization.html loaded");

  // ---------------- Keycloak Setup ----------------
  const keycloak = new Keycloak({
    url: "https://securedev.virtuele.us",
    realm: "virtuele-dev",
    clientId: "web"
  });

  window.keycloak = keycloak;

  // ---------------- Init ----------------
  async function initAuth() {
    try {
      const authenticated = await keycloak.init({
        onLoad: "check-sso",
        pkceMethod: "S256"
      });

      console.log("✅ Keycloak initialized:", authenticated);

      if (authenticated) {
        onLoginSuccess(keycloak.tokenParsed);
      } else {
        onNotAuthenticated();
      }
    } catch (err) {
      console.error("❌ Keycloak init error:", err);
    }
  }

  await initAuth();

  // ---------------- Login ----------------
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    login
