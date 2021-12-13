import { fireEvent, screen } from "@testing-library/dom"
//import firestore from "../app/Firestore.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes"

import {sessionStorageMock} from "../__mocks__/sessionStorage.js"
import {routerMock} from "../__mocks__/router.js"
import "@testing-library/jest-dom"

describe("Given I am connected as an employee", () => {
    sessionStorageMock('Employee')
    const html = NewBillUI()
    document.body.innerHTML = html
    routerMock('NewBill')
    const snapshotMock = { 
        ref: { 
            getDownloadURL: jest.fn().mockResolvedValue('oui'), 
        } 
    } 
    const putMock = { 
        put: jest.fn().mockResolvedValue(snapshotMock) 
    } 
    const addMock = {
        add : jest.fn().mockResolvedValue('oui')
    }
    const bills = jest.fn(() => addMock)
    const refMock = jest.fn().mockReturnValue(putMock) 
    const firestore = { storage: { ref: refMock, }, bills}
    const onNavigate = jest.fn()
    new NewBill({document, onNavigate, firestore})
    
    describe("When I am on NewBill Page", () => {
        test("Then it calls the new bill view", ()=>{
            expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
        })
        test('Then mail icon in vertical layout should be highlighted',()=>{
            expect(screen.getByTestId('icon-window')).not.toHaveClass('active-icon')
            expect(screen.getByTestId('icon-mail')).toHaveClass('active-icon')
        })
        test('it should launch handleChangeFile method',()=>{
            const file = new File(["filename"], "filename.jpeg", {type: "image/jpeg"})
            const fileInput = screen.getByTestId('file')
            const handleChangeFile = jest.fn(()=>NewBill.handleChangeFile)
            fileInput.addEventListener('change', handleChangeFile)
            fireEvent.change(fileInput, {target: {files:[file]}})
            expect(handleChangeFile).toHaveBeenCalled()
        })

        test('it should launch handleChangeFile method',()=>{
            const file = new File(["filename"], "filename.pdf", {type: "application/pdf"})
            const fileInput = screen.getByTestId('file')
            const handleChangeFile = jest.fn(()=>NewBill.handleChangeFile)
            fileInput.addEventListener('change', handleChangeFile)
            jest.spyOn(window, 'alert').mockImplementation(() => {})
            fireEvent.change(fileInput, {target: {files:[file]}})
            expect(handleChangeFile).toHaveBeenCalled()
            expect(window.alert).toBeCalledWith("Format de fichier incorrect. Formats acceptés .png / .jpg, .jpeg")
        })
        
        test('it should launch handleSubmit method',()=>{
            const bill = {
                email: 'romain.charlot@test.fr',
                type: 'Transports',
                name:  'Limousine',
                amount: 20,
                date:  "2021-12-11",
                vat: "70",
                pct: 20,
                commentary: '',
                fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.appspot.com/o/justificatifs%2F1630071872647.jpg?alt=media&token=0b1420f5-8ae6-4fd8-a5a0-e6a5d87bf931",
                fileName: "test.jpg",
                status: 'pending'
            }

            const form = screen.getByTestId('form-new-bill')
            const handleSubmit = jest.fn(()=>NewBill.handleSubmit)
            form.addEventListener('submit', handleSubmit)
            fireEvent.submit(form, { currentTarget: form })
            routerMock('Bills')
            expect(handleSubmit).toHaveBeenCalled()        
        }) 
    })
})