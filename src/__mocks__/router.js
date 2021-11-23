export const routerMock = (route) => {
    if(route == 'Bills'){
        const divIcon1 = document.getElementById('layout-icon1')
        const divIcon2 = document.getElementById('layout-icon2')
        divIcon1.classList.add('active-icon')
        divIcon2.classList.remove('active-icon')
    }
}