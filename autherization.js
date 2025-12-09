document.getElementById("loginBtn").onclick = () => {
  loginWithKeycloak();
};

if (window.keycloak?.authenticated) {
  document.getElementById("authStatus").innerHTML = `
    <p>✅ Logged in</p>
    <p>User: ${keycloak.tokenParsed.preferred_username}</p>
  `;
}
