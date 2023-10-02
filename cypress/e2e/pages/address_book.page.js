export const acceptSelection = 'Accept selection'
export const addressBook = 'Address book'
const createEntryBtn = 'Create entry'

const beameriFrameContainer = '#beamerOverlay .iframeCointaner'
const beamerInput = 'input[id="beamer"]'
const nameInput = 'input[name="name"]'
const addressInput = 'input[name="address"]'
const saveBtn = 'Save'
export const editEntryBtn = 'button[aria-label="Edit entry"]'
export const deleteEntryBtn = 'button[aria-label="Delete entry"]'
export const deleteEntryModalBtnSection = '.MuiDialogActions-root'
export const delteEntryModaldeleteBtn = 'Delete'
const exportFileModalBtnSection = '.MuiDialogActions-root'
const exportFileModalExportBtn = 'Export'
const importBtn = 'Import'
const exportBtn = 'Export'
const whatsNewBtnStr = "What's new"
const beamrCookiesStr = 'accept the "Beamer" cookies'

export function clickOnImportFileBtn() {
  cy.contains(importBtn).click()
}

export function importFile() {
  cy.get('[type="file"]').attachFile('../fixtures/address_book_test.csv')
  // Import button should be enabled
  cy.get('.MuiDialogActions-root').contains('Import').should('not.be.disabled')
  cy.get('.MuiDialogActions-root').contains('Import').click()
}

export function verifyImportModalIsClosed() {
  cy.get('Import address book').should('not.exist')
}

export function verifyDataImported(name, address) {
  cy.contains(name).should('exist')
  cy.contains(address).should('exist')
}

export function clickOnExportFileBtn() {
  cy.contains(exportBtn).click()
}

export function confirmExport() {
  cy.get(exportFileModalBtnSection).contains(exportFileModalExportBtn).click()
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
