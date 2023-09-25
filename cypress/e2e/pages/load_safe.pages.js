import * as constants from '../../support/constants'

const addExistingAccountBtnStr = 'Add existing Account'
const contactStr = 'Name, address & network'
const invalidAddressFormatErrorMsg = 'Invalid address format'

const safeDataForm = '[data-testid=load-safe-form]'
const nameInput = 'input[name="name"]'
const addressInput = 'input[name="address"]'
const sideBarIcon = '[data-testid=ChevronRightIcon]'
const sidebarCheckIcon = '[data-testid=CheckIcon]'
const nextBtnStr = 'Next'
const addBtnStr = 'Add'
const settingsBtnStr = 'Settings'
const ownersConfirmationsStr = 'Owners and confirmations'
const transactionStr = 'Transactions'

export function openLoadSafeForm() {
  cy.contains('button', addExistingAccountBtnStr).click()
  cy.contains(contactStr)
}

export function clickNetworkSelector(networkName) {
  cy.get(safeDataForm).contains(networkName).click()
}

export function selectGoerli() {
  cy.get('ul li').contains(constants.networks.goerli).click()
  cy.contains('span', constants.networks.goerli)
}

export function selectPolygon() {
  cy.get('ul li').contains(constants.networks.polygon).click()
  cy.contains('span', constants.networks.polygon)
}

export function verifyNameInputHasPlceholder() {
  cy.get(nameInput).should('have.attr', 'placeholder').should('match', constants.goerlySafeName)
}

export function inputName(name) {
  cy.get(nameInput).type(name).should('have.value', name)
}

export function verifyIncorrectAddressErrorMessage() {
  inputAddress('Random text')
  cy.get(addressInput).parent().prev('label').contains(invalidAddressFormatErrorMsg)
}

export function inputAddress(address) {
  cy.get(addressInput).clear().type(address)
}

export function verifyAddressInputValue() {
  // The address field should be filled with the "bare" QR code's address
  const [, address] = constants.GOERLI_TEST_SAFE.split(':')
  cy.get('input[name="address"]').should('have.value', address)
}

export function clickOnNextBtn() {
  cy.contains(nextBtnStr).click()
}

export function verifyDataInReviewSection(safeName, ownerName) {
  cy.findByText(safeName).should('be.visible')
  cy.findByText(ownerName).should('be.visible')
}

export function clickOnAddBtn() {
  cy.contains('button', addBtnStr).click()
}

export function veriySidebarSafeNameIsVisible(safeName) {
  cy.get('aside').contains(safeName).should('be.visible')
}

export function verifyOwnerNamePresentInSettings(ownername) {
  clickOnSettingsBtn()
  cy.contains(ownername).should('exist')
}

function clickOnSettingsBtn() {
  cy.get('aside ul').contains(settingsBtnStr).click()
}

export function verifyOwnersModalIsVisible() {
  cy.contains(ownersConfirmationsStr).should('be.visible')
}

export function openSidebar() {
  cy.get('aside').within(() => {
    cy.get(sideBarIcon).click({ force: true })
  })
}

export function verifyAddressInsidebar(address) {
  cy.get('li').within(() => {
    cy.contains(address).should('exist')
  })
}

export function verifySidebarIconNumber(number) {
  cy.get(sidebarCheckIcon).next().contains(number).should('exist')
}

export function clickOnPendingActions() {
  cy.get(sidebarCheckIcon).next().click()
}

export function verifyTransactionSectionIsVisible() {
  cy.contains('h3', transactionStr).should('be.visible')
}

export function verifyNumberOfTransactions(startNumber, endNumber) {
  cy.get(`span:contains("${startNumber} out of ${endNumber}")`).should('have.length', 1)
}
