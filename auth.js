const keycloak = new Keycloak({
  url: "https://auth.mycompany.com",
  realm: "virtuele",
  clientId: "virtuele-trimble-extension"
});

function loginWithKeycloak() {
  // ✅ Save current SPA page
  const currentPage = window.location.hash || "authorization";
  sessionStorage.setItem("post_login_page", currentPage);

  keycloak.login({
    redirectUri: window.location.origin + window.location.pathname
  });
}

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
