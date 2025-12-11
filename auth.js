document.addEventListener("DOMContentLoaded", async () => {

  let workSpaceAPI;
  
   if (typeof chrome !== 'undefined' && chrome.runtime) {
       chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'injectTopUrlScript') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',  // Runs in page's main world, not isolated
      func: () => {
        return window.top.location.href;
      }
    }, (results) => {
      if (results && results[0]) {
        console.log('Top URL via injection:', results[0].result);
        // Optionally send back to content script
        chrome.tabs.sendMessage(sender.tab.id, { topUrl: results[0].result });
          }
        });
      }
    })
       });
     } else {
       console.error('Chrome extension APIs not available in Brave. Check extension loading or Shields.');
     }
     

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
    if (!authenticated) return;

    console.log("✅ User authenticated", window.keycloak.tokenParsed);

    document.getElementById("authStatus").innerHTML = `
      ✅ Logged in as: ${window.keycloak.tokenParsed.preferred_username}
    `;
chrome.runtime.sendMessage({ action: 'injectTopUrlScript' });
bc.postMessage("login-success");

async function getTrimbleHostUrl1() {
  return new Promise((resolve, reject) => {
    // Send message to background script to get the top URL
    chrome.runtime.sendMessage({ action: 'getTopUrl' }, (response) => {
      if (response && response.topUrl) {
        resolve(response.topUrl);
      } else {
        reject(new Error('Failed to get top URL'));
      }
    });
  });
}    

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
     const trimbleUrl1 = await getTrimbleHostUrl1();
      console.log("✅ Trimble 1 host URL:", trimbleUrl1);
      window.open(loginUrl, "_blank", "noopener,noreferrer");
    });
  } else {
    console.error("loginBtn not found in DOM");
  }

});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTopUrl') {
    // Inject script into the top window to get location.href
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',  // Runs in the page's main world, bypassing isolation
      func: () => {
        return window.top.location.href;  // Gets the top-level URL
      }
    }, (results) => {
      if (results && results[0] && results[0].result) {
        sendResponse({ topUrl: results[0].result });
      } else {
        sendResponse({ error: 'Could not retrieve top URL' });
      }
    });
    return true;  // Keep the message channel open for async response
  }
});

