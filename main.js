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


