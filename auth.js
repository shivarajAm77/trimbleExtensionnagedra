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
    loginBtn.addEventListener("click", () => {
      console.log("🔐 Redirecting to login...");

      keycloak.login({
        redirectUri: window.location.href
      });
    });
  }

  // ---------------- Logout ----------------
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      console.log("🚪 Logging out...");

      keycloak.logout({
        redirectUri: window.location.href
      });
    });
  }

  // ---------------- UI Handlers ----------------
  function onLoginSuccess(tokenParsed) {
    console.log("🎉 User authenticated:", tokenParsed);

    const loginBtn = document.getElementById("loginBtn");
    const userActions = document.getElementById("userActions");
    const usernameEl = document.getElementById("username");
    const reloadBtn = document.getElementById("reloadBtn");

    if (loginBtn) loginBtn.hidden = true;
    if (userActions) userActions.hidden = false;
    if (reloadBtn) reloadBtn.hidden = false;

    if (usernameEl) {
      usernameEl.innerText = tokenParsed.preferred_username;
    }
  }

  function onNotAuthenticated() {
    console.log("⚠️ User not authenticated");

    const loginBtn = document.getElementById("loginBtn");
    const userActions = document.getElementById("userActions");

    if (loginBtn) loginBtn.hidden = false;
    if (userActions) userActions.hidden = true;
  }

  // ---------------- Auto check on tab focus ----------------
  window.addEventListener("focus", async () => {
    console.log("🔄 Tab focused → rechecking auth");

    try {
      const authenticated = await keycloak.init({
        onLoad: "check-sso"
      });

      if (authenticated) {
        onLoginSuccess(keycloak.tokenParsed);
      }
    } catch (e) {
      console.warn("Recheck failed", e);
    }
  });

});
