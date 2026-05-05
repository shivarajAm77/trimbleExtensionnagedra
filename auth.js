document.addEventListener("DOMContentLoaded", async () => {
  let workSpaceAPI;
// Trimble connect
async function initTrimble() {
  workSpaceAPI = await TrimbleConnectWorkspace.connect(
    window.parent,
    (event, arg) => {
      console.log("✅ connect() event:", event, arg.data);
    },
    3000
  );
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

  // ---------------- Keycloak Init ----------------
console.log("Keycloak typeof:", typeof Keycloak);

if (typeof Keycloak !== "function") {
  console.error("❌ Keycloak adapter not loaded");
  throw new Error("Keycloak adapter missing");
}

const AUTH_CHANNEL = "auth-channel";
const bc = new BroadcastChannel(AUTH_CHANNEL);

let keycloakReady = false;

const keycloak = new Keycloak({
  url: "https://securedev.virtuele.us",
  realm: "virtuele-dev",
  clientId: "web"
});

  const storedToken = sessionStorage.getItem("token");

if (storedToken) {
  try {
    console.log("🔁 Restoring session from storage");

    const parsed = JSON.parse(atob(storedToken.split('.')[1]));
    onLoginSuccess(parsed);
  } catch (e) {
    console.error("❌ Failed to restore token:", e);
  }
}
  
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


bc.onmessage = (event) => {
  console.log("📡 Message from popup:", event.data);

  if (event.data.type === "AUTH_SUCCESS") {
    const token = event.data.token;

    if (!token) {
      console.warn("⚠️ Empty token");
      return;
    }

    console.log("✅ Login received in iframe");

    // store token
    sessionStorage.setItem("token", token);

    // parse token
    const parsed = JSON.parse(atob(token.split('.')[1]));

    // update UI
    onLoginSuccess(parsed);
  }
};


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

     window.open(
      loginUrl,
      "_blank",
      "noopener,noreferrer"
    );

  });
} else {
  console.error("loginBtn not found in DOM");
}
// Called ONLY when authenticated === true
function onLoginSuccess(tokenParsed) {
  console.log("🎉 Updating UI after login");

  const loginBtn = document.getElementById("loginBtn");
  const userActions = document.getElementById("userActions");

  if (loginBtn) loginBtn.hidden = true;
  if (userActions) userActions.hidden = false;

  // Optional username display
  const usernameEl = document.getElementById("username");
  if (usernameEl) {
    usernameEl.innerText = tokenParsed.preferred_username;
  }

  // Ensure reload button visible
  const reloadBtn = document.getElementById("reloadBtn");
  if (reloadBtn) reloadBtn.hidden = false;
}

  const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
     bc.postMessage({ type: "LOGOUT" }); // 🔥 add this
    keycloak.logout({
      redirectUri: "https://shivarajam77.github.io/trimbleExtensionnagedra/authorization.html"
    });
  });
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

});
