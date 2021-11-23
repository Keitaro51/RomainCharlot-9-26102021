import { fireEvent, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"

import firebaseMock from "../__mocks__/firebase"
import {localStorageMock} from "../__mocks__/localStorage.js"

import billsContainer from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import {routerMock} from "../__mocks__/router.js"
import {sessionStorageMock} from "../__mocks__/sessionStorage.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      sessionStorageMock('Employee')
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      routerMock('Bills')
      expect(screen.getByTestId('icon-window')).toHaveClass('active-icon')
      expect(screen.getByTestId('icon-mail')).not.toHaveClass('active-icon')
    })

    
    test("Then bills should be ordered from earliest to latest", () => {
      bills.sort((a, b) => ((a.date < b.date) ? 1 : -1))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    
    })

    test("Then handleClickNewBill() is called when new bill button is clicked", ()=>{
      document.body.innerHTML = '<button type="button" data-testid="btn-new-bill" class="btn btn-primary">Nouvelle note de frais</button>'
      const onNavigate = jest.fn()
      new billsContainer({ document , onNavigate})
      const buttonNewBill = screen.getByTestId(`btn-new-bill`)
      userEvent.click(buttonNewBill)
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
    })
    
    test("When I click on an eye icon, a modal should open", ()=>{      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const html = BillsUI({ data: bills })  
      document.body.innerHTML = html    

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null

      const billContainer = new billsContainer({ document, onNavigate, firestore, localStorage: window.localStorage})
      
      const firstIcon = screen.getAllByTestId(`icon-eye`)[0]
      const handleClickIconEye = jest.fn(()=> billContainer.handleClickIconEye(firstIcon))

      firstIcon.addEventListener('click', handleClickIconEye)
      
      window.$ = jest.fn().mockImplementation(() => {
        return {
          width: jest.fn(),
          find: jest.fn(()=>  $('.modal-body')),
          html: jest.fn(),
          modal: jest.fn(()=> document.getElementById('modaleFile').classList.add('show'))
        }
      });
      expect(screen.getByRole('dialog', { hidden: true })).not.toHaveClass('show') 
      userEvent.click(firstIcon)
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(screen.getByRole('dialog', { hidden: true })).toHaveClass('show')
      expect(screen.getByRole('dialog', { hidden: true })).toMatchSnapshot()
    })
    
    test("fetches bills from mock API GET", async ()=>{
      const getSpy = jest.spyOn(firebaseMock, "get")
      const bills = await firebaseMock.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
      
    test("fetches bills from an API and fails with 404 message error", async ()=>{
      firebaseMock.get.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 404"))
    )
    const html = BillsUI({error: "Erreur 404"})
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
    })
    
    test("fetches bills from an API and fails with 500 message error", async () => {
      firebaseMock.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  describe("When I enter on Bills Page with parameter", () => {
    test("Then it calls the LoadingPage function", ()=>{
      const html = BillsUI({loading:true})
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
    test("Then it calls the ErrorPage function", ()=>{
      const html = BillsUI({error:"Ceci est une erreur"})
      document.body.innerHTML = html
      expect(screen.getAllByText("Ceci est une erreur")).toBeTruthy()
    })
  })
})