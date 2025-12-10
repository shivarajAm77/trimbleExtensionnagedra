document.addEventListener("DOMContentLoaded", () => {
  const savedAuth = localStorage.getItem("globalAuth");

  if (!savedAuth) {
    console.log("ℹ️ GlobalAuth not found");
    return;
  }

  try {
    const auth = JSON.parse(savedAuth);

    // ✅ Re-attach to window
    window.globalAuth = auth;

    console.log("✅ GlobalAuth loaded:", window.globalAuth);
    console.log("User:", auth.user.username);
    console.log("Token expires at:", new Date(auth.expiresAt));

  } catch (e) {
    console.error("❌ Invalid globalAuth data");
    localStorage.removeItem("globalAuth");
  }
});
