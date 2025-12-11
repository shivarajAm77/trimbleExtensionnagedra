document.addEventListener("DOMContentLoaded", async () => {

  let workSpaceAPI;
  
 window.addEventListener("message", (event) => {
  if (event.data?.login === "success") {
    console.log("🔄 Login completed, reload triggered");
    window.location.reload();
  }
});

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
    return document.referrer || window.location.origin;
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
    if (!authenticated) return;

    console.log("✅ User authenticated", window.keycloak.tokenParsed);

    document.getElementById("authStatus").innerHTML = `
      ✅ Logged in as: ${window.keycloak.tokenParsed.preferred_username}
    `;
    window.opener.postMessage({ login: "success" }, "*");
    window.close();
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
