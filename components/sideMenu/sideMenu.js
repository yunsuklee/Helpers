// Funcion para dar funcionalidad a menu lateral
export const setupSideMenu = (sideMenuId, sideMenuToggleId, toggleOpenId, toggleCloseId, menulatStateCookie) => {
    const sideMenu = document.getElementById(sideMenuId);
    const sideMenuToggle = document.getElementById(sideMenuToggleId);
    const toggleOpenIcon = document.getElementById(toggleOpenId);
    const toggleCloseIcon = document.getElementById(toggleCloseId);

    if (sideMenu && sideMenuToggle && toggleOpenIcon && toggleCloseIcon) {
        sideMenuToggle.onclick = () => {
            sideMenu.classList.toggle('collapsed')
            toggleOpenIcon.classList.toggle('d-none')
            toggleCloseIcon.classList.toggle('d-none')
            setCookie(menulatStateCookie, sideMenu.classList.contains('collapsed') ? "false" : "true");
        }
    }
};