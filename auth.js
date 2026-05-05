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
      startLoginPolling();
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


  function startLoginPolling() {
  const interval = setInterval(() => {
    if (!keycloak.authenticated) {
      console.log("🔄 Poll detected possible login → reload");

      clearInterval(interval);
      window.location.reload();
    }
  }, 2000);
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
async function checkAuthOnReturn(trigger) {
  console.log(`🔄 Checking auth via: ${trigger}`);

  try {
    if (keycloak.authenticated) {
      console.log("✅ Already authenticated → refreshing token");

      await keycloak.updateToken(0); // refresh if needed

      return; // 🚫 DO NOT reload
    }

    console.log("⚠️ Not authenticated → reload to re-init");

    window.location.reload(); // ✅ will trigger initAuth again

  } catch (e) {
    console.warn("Auth check failed", e);
  }
}

// 🔥 Most reliable
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    checkAuthOnReturn("visibilitychange");
  }
});

// fallback
window.addEventListener("focus", () => {
  checkAuthOnReturn("focus");
});

});
