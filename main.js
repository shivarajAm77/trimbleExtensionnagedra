let workSpaceAPI = null;

window.addEventListener("load", async () => {
  await initKeycloak();
  initializeTrimble();
});

async function initializeTrimbleConnect(){
    workSpaceAPI = await TrimbleConnectWorkspace.connect(window.parent,
        (event, args) => {
            console.log(event);
            console.log(args);
            switch (event) {
                case "extension.command":
                    //"Command executed by the user: args.data"
                    if(args.data === "submenu_1_clicked"){
                        console.log("Authorization menu clicked");
                        loadPage('authorization.html');
                    }
                    else if(args.data === "submenu_2_clicked"){
                        console.log("Sync Project menu clicked");
                        loadPage('sync-project.html');
                    }
                    else if(args.data === "submenu_3_clicked"){
                        console.log("Sync Models menu clicked");
                        loadPage('sync-models.html');
                    }
                    else if(args.data === "submenu_4_clicked"){
                        console.log("RFI Manager menu clicked");
                        loadPage('rfi-manager.html');
                    }
                    break;
                case "extension.accessToken":
                //"Accestoken or status: args.data"
                    break;
                case "extension.userSettingsChanged":
                //"User settings changed!"
                    break;
                default:
            }
        },
        3000 // connection timeout in milliseconds.
        );
    console.log(workSpaceAPI);

    const mainMenuObject = {
        title: "Virtuele app",
        icon: "https://shivarajam77.github.io/trimble-extension/V.png",
        command: "main_nav_menu_cliked",
        subMenus: [
            {
            title: "Authorization",
            icon: "https://shivarajam77.github.io/trimbleTestong/key-icon.svg",
            command: "submenu_1_clicked",
            },
            {
            title: "Sync Project",
            icon: "https://dvlc9qcftewvt.cloudfront.net/virtuele/images/directory/projectspecification.svg",
            command: "submenu_2_clicked",
            },
            {
            title: "Sync Models",
            icon: "https://dvlc9qcftewvt.cloudfront.net/virtuele/images/directory/modelcheck.svg",
            command: "submenu_3_clicked",
            },
            {
            title: "RFI Manager",
            icon: "https://dvlc9qcftewvt.cloudfront.net/virtuele/images/directory/rfimanagement.svg",
            command: "submenu_4_clicked",
            },
        ],
    };
    console.log(mainMenuObject);
    // Updating the menu object.
    if (workSpaceAPI && workSpaceAPI.ui && workSpaceAPI.ui.setMenu) {
        workSpaceAPI.ui.setMenu(mainMenuObject);
    }    
}

// Function to load different pages
function loadPage(pageName) {
    console.log(`Loading page: ${pageName}`);
    
    // Option 1: Load content dynamically via fetch
    // fetch(pageName)
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         return response.text();
    //     })
    //     .then(html => {
    //         // Replace the main content area with the new page content
    //         const contentContainer = document.getElementById('main-content') || document.body;
    //         contentContainer.innerHTML = html;
            
    //         // Initialize any JavaScript for the loaded page
    //         initializePageScripts(pageName);
    //     })
    //     .catch(error => {
    //         console.error('Error loading page:', error);
    //         showErrorPage(`Failed to load ${pageName}`);
    //     });
    
    // Option 2: Alternative - redirect to a new page (uncomment if preferred)
    window.location.href = pageName;
    
    // Option 3: Use iframe (uncomment if preferred)
    // loadPageInIframe(pageName);
}

// Function to initialize scripts for specific pages
function initializePageScripts(pageName) {
    switch(pageName) {
        case 'authorization.html':
            initializeAuthorizationPage();
            break;
        case 'sync-project.html':
            initializeSyncProjectPage();
            break;
        case 'sync-models.html':
            initializeSyncModelsPage();
            break;
        case 'rfi-manager.html':
            initializeRFIManagerPage();
            break;
        default:
            console.log('No specific initialization for', pageName);
    }
}

// Page-specific initialization functions
function initializeAuthorizationPage() {
    console.log('Initializing Authorization page');
    // Add authorization-specific logic here
}

function initializeSyncProjectPage() {
    console.log('Initializing Sync Project page');
    // Add sync project-specific logic here
}

function initializeSyncModelsPage() {
    console.log('Initializing Sync Models page');
    // Add sync models-specific logic here
}

function initializeRFIManagerPage() {
    console.log('Initializing RFI Manager page');
    // Add RFI manager-specific logic here
}

// Function to show error page
function showErrorPage(errorMessage) {
    const contentContainer = document.getElementById('main-content') || document.body;
    contentContainer.innerHTML = `
        <div class="error-page">
            <h2>Error</h2>
            <p>${errorMessage}</p>
            <button onclick="loadPage('index.html')">Back to Home</button>
        </div>
    `;
}

// Alternative: Load page in iframe
function loadPageInIframe(pageName) {
    const contentContainer = document.getElementById('main-content') || document.body;
    contentContainer.innerHTML = `
        <iframe src="${pageName}" 
                width="100%" 
                height="100%" 
                frameborder="0">
        </iframe>
    `;
}
<script src="https://cdn.jsdelivr.net/npm/keycloak-js@26.2.1/lib/keycloak.min.js"></script>

initializeTrimbleConnect();
