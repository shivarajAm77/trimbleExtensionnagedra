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
 

  

  // ---------------- Keycloak Init ----------------
  console.log("Keycloak typeof:", typeof Keycloak);

  if (typeof Keycloak !== "function") {
    console.error("❌ Keycloak adapter not loaded");
    return;
  }

  window.keycloak = new Keycloak({
    url: "https://securedev.virtuele.us",
    realm: "virtuele-dev",
    clientId: "web"
  });

  await window.keycloak.init({
    onLoad: "check-sso",
    pkceMethod: "S256",
    silentCheckSsoRedirectUri:
      window.location.origin + "/trimbleExtensionnagedra/silent-check-sso.html"
  }).then(authenticated => {
     if (!authenticated) {
    onNotAuthenticated();
    return;
  }
    console.log("✅ User authenticated", window.keycloak.tokenParsed);
    document.getElementById("authStatus").innerHTML = `
      ✅ Logged in as: ${window.keycloak.tokenParsed.preferred_username}
    `;
     onLoginSuccess(window.keycloak.tokenParsed);
    document.getElementById("logoutBtn").style.display = "inline-block";
    
 if (window.self === window.top) {
      console.log("Closing standalone tab");
      window.close();
    }
bc.postMessage("login-success");

// Optional: close popup
if (window.close) window.close();
  }).catch(err => console.error("Keycloak init error:", err));

  // ---------------- Login Button ----------------
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      console.log("Login button clicked");

      const trimbleUrl = await getTrimbleHostUrl();
      console.log("✅ Trimble host URL:", trimbleUrl);

      const loginUrl = window.keycloak.createLoginUrl({
      redirectUri: trimbleUrl
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


