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
  return url.includes("/authentication.html")
    ? url.replace("/authentication.html", "/authcheck.html")
    : url;
}
  

  // ---------------- Keycloak Init ----------------
  console.log("Keycloak typeof:", typeof Keycloak);
const AUTH_CHANNEL = "kc-auth";
const bc = new BroadcastChannel(AUTH_CHANNEL);
  if (typeof Keycloak !== "function") {
    console.error("❌ Keycloak adapter not loaded");
    return;
  }

  window.keycloak = new Keycloak({
    url: "https://securedev.virtuele.us",
    realm: "virtuele-dev",
    clientId: "web"
  });

bc.onmessage = async (event) => {
  if (event.data === "login-success") {
    console.log("✅ Login broadcast received in iframe");

    const authenticated = await keycloak.init({
      onLoad: "check-sso",
      pkceMethod: "S256",
      silentCheckSsoRedirectUri:
        location.origin + "/trimbleExtensionnagedra/silent-check-sso.html"
    });

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

      const loginUrl = window.keycloak.createLoginUrl({
      redirectUri: toAuthCheckUrl(await getTrimbleHostUrl())
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

