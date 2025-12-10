document.addEventListener("DOMContentLoaded", async () => {

  let workSpaceAPI;

async function initTrimble() {
  workSpaceAPI = await TrimbleConnectWorkspace.connect(
    window.parent,
    () => {},
    3000
  );
  async function getTrimbleHostUrl() {
  if (!workSpaceAPI) return null;

  const context = await workSpaceAPI.extension.getContext();
  console.log("Trimble context:", context);

  return context?.hostUrl || null;
}

  console.log("Trimble API connected", workSpaceAPI);
}
  console.log("Keycloak typeof:", typeof Keycloak);

  if (typeof Keycloak !== "function") {
    console.error("❌ Keycloak adapter not loaded");
    return;
  }
  // Create Keycloak instance
  window.keycloak = new Keycloak({
    url: "https://securedev.virtuele.us",
    realm: "virtuele-dev",
    clientId: "web"
  });

  // Initialize Keycloak (PKCE)
  await window.keycloak.init({
    onLoad: "check-sso",
    pkceMethod: "S256",
    silentCheckSsoRedirectUri: window.location.origin + "/trimbleExtensionnagedra/silent-check-sso.html"
  }).then(authenticated => {
  if (!authenticated) return;

  const authData = {
    authenticated: true,
    accessToken: window.keycloak.token,
    expiresAt: Date.now() + window.keycloak.tokenParsed.exp * 1000,
    user: {
      username: window.keycloak.tokenParsed.preferred_username,
      email: window.keycloak.tokenParsed.email,
      name: window.keycloak.tokenParsed.name
    }
  };

  // ✅ SET GLOBAL OBJECT
  window.globalAuth = authData;

  // ✅ PERSIST FOR OTHER TABS / PAGES
  localStorage.setItem("globalAuth", JSON.stringify(authData));

  console.log("✅ GlobalAuth set:", window.globalAuth);

  document.getElementById("authStatus").innerHTML = `
    ✅ Logged in as: ${authData.user.username}
  `;
}).catch(err => console.error("Keycloak init error:", err));

  // Attach login button
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      console.log("Login button clicked");
      console.log(getTrimbleHostUrl())
      // Open Keycloak login in a NEW TAB
      const loginUrl = window.keycloak.createLoginUrl({
        redirectUri: window.location.href
      });
      window.open(loginUrl, "_blank", "noopener,noreferrer");
    });
  } else {
    console.error("loginBtn not found in DOM");
  }
});
