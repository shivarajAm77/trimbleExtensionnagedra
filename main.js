async function initializeTrimbleConnect(){
    let workSpaceAPI = await TrimbleConnectWorkspace.connect(window.parent,
        (event, args) => {
            console.log(event);
            console.log(args);
            switch (event) {
                case "extension.command":
                //"Command executed by the user: args.data"
                
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
    workSpaceAPI.ui.setMenu(mainMenuObject);    
}

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('redirectButton');

    button.addEventListener('click', () => {        
        // Updating the active submenu.
        workSpaceAPI.ui.setActiveMenuItem("submenu_1_clicked");
        // // Open external link in a new tab
        // window.open('https://dev.virtuele.us', '_blank');
    });

    // Optional: If you want to integrate with Trimble Connect UI API
    // if (window.TC && TC.UI) {
    //     TC.UI.addCustomButton({
    //         id: 'redirectButton',
    //         label: 'Go to Virtuele Development',
    //         onClick: () => {
    //             window.open('https://dev.virtuele.us', '_blank');
    //         }
    //     });
    // }
});

initializeTrimbleConnect();