import {localStorageMock} from "../__mocks__/localStorage"

export const sessionStorageMock = (userType) => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    const user = JSON.stringify({
      type: userType
    })
    window.localStorage.setItem('user', user)
}