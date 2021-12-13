export const routerMock = (route) => {
    const divIcon1 = document.getElementById('layout-icon1')
    const divIcon2 = document.getElementById('layout-icon2')
    if(route == 'Bills'){
        divIcon1.classList.add('active-icon')
        divIcon2.classList.remove('active-icon')
    }else if(route == 'NewBill'){
        divIcon1.classList.remove('active-icon')
        divIcon2.classList.add('active-icon')
    }
}