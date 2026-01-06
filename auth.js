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
      startAuthPolling();
    }
  } catch (err) {
    console.error("Keycloak init failed", err);
  }
})();




  // ---------------- Login Button ----------------

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    console.log("Login button clicked");

    const redirUrl = window.location.href;
    const authUrl = toAuthCheckUrl(redirUrl);

    const loginUrl = window.keycloak.createLoginUrl({
      redirectUri: authUrl
    });

    const loginWindow = window.open(
      loginUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (!loginWindow) {
      console.warn("Popup blocked");
      return;
    }

    // ✅ Detect popup close
    const timer = setInterval(() => {
      if (loginWindow.closed) {
        clearInterval(timer);
        console.log("✅ Login popup closed");

        // 🔁 Reload iframe OR re-check SSO
        window.location.reload();
      }
    }, 500); // check every 500ms
  });
} else {
  console.error("loginBtn not found in DOM");
}
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
let authPoller = null;

function startAuthPolling() {
  if (authPoller) return;

  authPoller = setInterval(() => {
    // This checks if session now exists
    keycloak.updateToken(0)
      .then(() => {
        if (!isAuthenticated && keycloak.authenticated) {
          isAuthenticated = true;
          clearInterval(authPoller);
          authPoller = null;
          onLoginSuccess(keycloak.tokenParsed);
        }
      })
      .catch(() => {
        // still not logged in → ignore
      });
  }, 2000);
});
