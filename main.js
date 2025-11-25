async function initializeTrimbleConnect(){
    let workSpaceAPI = await TrimbleConnectWorkspace.connect(window.parent,
        (event, args) => {
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
            title: "Sub menu 1",
            icon: "https://shivarajam77.github.io/trimble-extension/V.png",
            command: "submenu_1_clicked",
            },
            {
            title: "Sub menu 2",
            icon: "https://shivarajam77.github.io/trimble-extension/V.png",
            command: "submenu_2_clicked",
            },
        ],
    };

    // Updating the menu object.
    workSpaceAPI.ui.setMenu(mainMenuObject);
}

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('redirectButton');

    button.addEventListener('click', () => {
        // Open external link in a new tab
        window.open('https://dev.virtuele.us', '_blank');        
    });

    // Optional: If you want to integrate with Trimble Connect UI API
    if (window.TC && TC.UI) {
        TC.UI.addCustomButton({
            id: 'redirectButton',
            label: 'Go to Virtuele Development',
            onClick: () => {
                window.open('https://dev.virtuele.us', '_blank');
            }
        });
    }
});

initializeTrimbleConnect();