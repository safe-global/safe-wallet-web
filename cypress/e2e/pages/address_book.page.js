import * as main from '../pages/main.page'

export const addressBookRecipient = '[data-testid="address-book-recipient"]'
const beameriFrameContainer = '#beamerOverlay .iframeCointaner'
const beamerInput = 'input[id="beamer"]'
const nameInput = 'input[name="name"]'
const addressInput = 'input[name="address"]'
const exportModalBtn = '[data-testid="export-modal-btn"]'
export const editEntryBtn = 'button[aria-label="Edit entry"]'
export const deleteEntryBtn = 'button[aria-label="Delete entry"]'
export const deleteEntryModalBtnSection = '.MuiDialogActions-root'
const tableContainer = '[data-testid="table-container"]'
const tableRow = '[data-testid="table-row"]'

export const acceptSelection = 'Save settings'
export const addressBook = 'Address book'
const createEntryBtn = 'Create entry'
export const delteEntryModaldeleteBtn = 'Delete'
const importBtn = 'Import'
const exportBtn = 'Export'
const saveBtn = 'Save'
const whatsNewBtnStr = "What's new"
const beamrCookiesStr = 'accept the "Beamer" cookies'

const testFilePath = '../fixtures/address_book_test.csv'

export const entries = [
  '0x6E834E9D04ad6b26e1525dE1a37BFd9b215f40B7',
  'test-sepolia-3',
  '0xf405BC611F4a4c89CCB3E4d083099f9C36D966f8',
  'sepolia-test-4',
  '0x03042B890b99552b60A073F808100517fb148F60',
  'sepolia-test-5',
  '0xBd69b0a9DC90eB6F9bAc3E4a5875f437348b6415',
  'assets-test-sepolia',
]

export function verifyNumberOfRows(number) {
  main.verifyElementsCount(tableRow, number)
}

export function clickOnImportFileBtn() {
  cy.contains(importBtn).click()
}

export function importFile() {
  cy.get('[type="file"]').attachFile(testFilePath)
  // Import button should be enabled
  cy.get('.MuiDialogActions-root').contains('Import').should('not.be.disabled')
  cy.get('.MuiDialogActions-root').contains('Import').click()
}

export function verifyImportModalIsClosed() {
  cy.get('Import address book').should('not.exist')
}

export function verifyDataImported(data) {
  main.verifyValuesExist(tableContainer, data)
}

export function clickOnExportFileBtn() {
  cy.contains(exportBtn).should('be.enabled').click()
}

export function confirmExport() {
  cy.get(exportModalBtn).click()
}

export function clickOnCreateEntryBtn() {
  cy.contains(createEntryBtn).click()
}

export function typeInName(name) {
  cy.get(nameInput).type(name)
}

export function typeInAddress(address) {
  cy.get(addressInput).type(address)
}

export function clickOnSaveEntryBtn() {
  cy.contains('button', saveBtn).click()
}

export function verifyNewEntryAdded(name, address) {
  cy.contains(name).should('exist')
  cy.contains(address).should('exist')
}

export function addEntry(name, address) {
  typeInName(name)
  typeInAddress(address)
  clickOnSaveEntryBtn()
  verifyNewEntryAdded(name, address)
}

export function clickOnEditEntryBtn() {
  cy.get(editEntryBtn).click({ force: true })
}

export function typeInNameInput(name) {
  cy.get(nameInput).clear().type(name).should('have.value', name)
}

export function clickOnSaveButton() {
  cy.contains('button', saveBtn).click()
}

export function verifyNameWasChanged(name, editedName) {
  cy.get(name).should('not.exist')
  cy.contains(editedName).should('exist')
}

export function clickDeleteEntryButton() {
  cy.get(deleteEntryBtn).click({ force: true })
}

export function clickDeleteEntryModalDeleteButton() {
  cy.get(deleteEntryModalBtnSection).contains(delteEntryModaldeleteBtn).click()
}

export function verifyEditedNameNotExists(name) {
  cy.get(name).should('not.exist')
}

export function clickOnWhatsNewBtn(force = false) {
  cy.contains(whatsNewBtnStr).click({ force: force })
}

export function acceptBeamerCookies() {
  cy.contains(beamrCookiesStr)
}

export function verifyBeamerIsChecked() {
  cy.get(beamerInput).should('be.checked')
}

export function verifyBeameriFrameExists() {
  cy.wait(1000)
  cy.get(beameriFrameContainer).should('exist')
}
