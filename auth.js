document.addEventListener("DOMContentLoaded", async () => {

  console.log("🚀 authorization.html loaded");

  // ---------------- Keycloak Setup ----------------
  const keycloak = new Keycloak({
    url: "https://securedev.virtuele.us",
    realm: "virtuele-dev",
    clientId: "web"
  });

  window.keycloak = keycloak;

  let initialized = false;

  // ---------------- Init ----------------
  async function initAuth() {
    try {
      const authenticated = await keycloak.init({
        onLoad: "check-sso",
        pkceMethod: "S256"
      });

      initialized = true;

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
    loginBtn.addEventListener("click", () => {
      console.log("🔐 Opening login in new tab");

      const loginUrl = keycloak.createLoginUrl({
        redirectUri: window.location.href
      });

      window.open(loginUrl, "_blank"); // ✅ REQUIRED
    });
  }

  // ---------------- Logout ----------------
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      console.log("🚪 Logging out");

      keycloak.logout({
        redirectUri: window.location.href
      });
    });
  }

  // ---------------- UI ----------------
  function onLoginSuccess(tokenParsed) {
    console.log("🎉 User authenticated:", tokenParsed);

    const loginBtn = document.getElementById("loginBtn");
    const userActions = document.getElementById("userActions");
    const reloadBtn = document.getElementById("reloadBtn");

    if (loginBtn) loginBtn.hidden = true;
    if (userActions) userActions.hidden = false;
    if (reloadBtn) reloadBtn.hidden = false;
  }

  function onNotAuthenticated() {
    console.log("⚠️ User not authenticated");

    const loginBtn = document.getElementById("loginBtn");
    const userActions = document.getElementById("userActions");

    if (loginBtn) loginBtn.hidden = false;
    if (userActions) userActions.hidden = true;
  }

  // ---------------- Detect login when user returns ----------------
  window.addEventListener("focus", async () => {
    console.log("🔄 Tab focused → checking auth");

    try {
      const authenticated = await keycloak.init({
        onLoad: "check-sso"
      });

      console.log("🔍 Auth status after focus:", authenticated);

      if (authenticated) {
        onLoginSuccess(keycloak.tokenParsed);
      }
    } catch (e) {
      console.warn("Recheck failed", e);
    }
  });

});
