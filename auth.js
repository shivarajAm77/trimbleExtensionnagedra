const keycloak = new Keycloak({
  url: "https://securedev.virtuele.us",
  realm: "virtuele-dev",
  clientId: "web"
});

function loginWithKeycloak() {
  // ✅ Save current SPA page
  const currentPage = window.location.hash || "authorization";
  sessionStorage.setItem("post_login_page", currentPage);

  keycloak.login({
    redirectUri: window.location.origin + window.location.pathname
  });
}
debugger;
function initKeycloak() {
  return keycloak.init({
    onLoad: "check-sso",
    pkceMethod: "S256",
    silentCheckSsoRedirectUri:
      window.location.origin + "/silent-check-sso.html"
  }).then(authenticated => {
    if (authenticated) {
      window.keycloak = keycloak;
      restorePageAfterLogin();
    }
  });
}

function restorePageAfterLogin() {
  const page = sessionStorage.getItem("post_login_page");
  if (page) {
    window.location.hash = page;
    sessionStorage.removeItem("post_login_page");
  }
}
