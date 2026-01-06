document.addEventListener("DOMContentLoaded", async () => {

  let workSpaceAPI;
  // ---------------- Trimble Init ----------------
  async function initTrimble() {
    workSpaceAPI = await TrimbleConnectWorkspace.connect(
      window.parent,
      () => {},
      3000
    );
    console.log("Trimble API connected", workSpaceAPI);
  }

  await initTrimble();

  async function getTrimbleHostUrl() {
    if (!workSpaceAPI) return null;
    console.log("Document",document);
    return window.location.href;
  }
 
function toAuthCheckUrl(url) {
  return url.includes("/authorization.html")
    ? url.replace("/authorization.html", "/authcheck.html")
    : url;
}
window.addEventListener("message", (event) => {
  console.log("📩 Raw message event:", event);
  if (event.data?.type === "KC_LOGIN_SUCCESS") {
    console.log("✅ Login received via postMessage");

    keycloak.init({ onLoad: "check-sso" }).then(auth => {
      if (auth) onLoginSuccess(keycloak.tokenParsed);
    });
  }
});

  // ---------------- Keycloak Init ----------------
console.log("Keycloak typeof:", typeof Keycloak);

if (typeof Keycloak !== "function") {
  console.error("❌ Keycloak adapter not loaded");
  throw new Error("Keycloak adapter missing");
}

const AUTH_CHANNEL = "kc-auth";
const bc = new BroadcastChannel(AUTH_CHANNEL);

let keycloakReady = false;

const keycloak = new Keycloak({
  url: "https://securedev.virtuele.us",
  realm: "virtuele-dev",
  clientId: "web"
});

// assign to window
window.keycloak = keycloak;

(async function initKeycloak() {
  try {
    const authenticated = await keycloak.init({
      onLoad: "check-sso",
      pkceMethod: "S256",
      silentCheckSsoRedirectUri:
        location.origin + "/trimbleExtensionnagedra/silent-check-sso.html"
    });

    keycloakReady = true;
    console.log("✅ Keycloak ready");

    if (authenticated) {
      onLoginSuccess(keycloak.tokenParsed);
    } else {
      onNotAuthenticated();
    }
  } catch (err) {
    console.error("Keycloak init failed", err);
  }
})();

bc.onmessage = async (event) => {
  if (event.data === "login-success") {
    console.log("📢 Login broadcast received");

    if (!keycloakReady) {
      console.warn("Keycloak not ready yet");
      return;
    }

    // 🔑 IMPORTANT: re-check session, not init again
    const authenticated = await keycloak.updateToken(0);

    if (authenticated) {
      onLoginSuccess(keycloak.tokenParsed);
    }
  }
};



  // ---------------- Login Button ----------------
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      console.log("Login button clicked");
      const redirUrl = window.location.href;
      const authUrl = toAuthCheckUrl(redirUrl);
      console.log("redirect Url ",authUrl);
      const loginUrl = window.keycloak.createLoginUrl({
      redirectUri: authUrl
      });
    
      window.open(loginUrl, "_blank", "noopener,noreferrer");
    });
  } else {
    console.error("loginBtn not found in DOM");
  }

});

// Called ONLY when authenticated === true
function onLoginSuccess(tokenParsed) {
  document.getElementById("loginBtn").hidden = true;
  document.getElementById("userActions").hidden = false;

  document.getElementById("username").innerText =
    tokenParsed.preferred_username;
}

// Optional: when not authenticated
function onNotAuthenticated() {
  document.getElementById("loginBtn").hidden = false;
  document.getElementById("userActions").hidden = true;
}
function logout() {
    if (!window.keycloak) {
        console.error("Keycloak not initialized");
        return;
    }
    window.keycloak.logout({
        redirectUri: window.location.origin
    });
}

