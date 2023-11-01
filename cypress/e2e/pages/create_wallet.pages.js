import * as constants from '../../support/constants'

const nameInput = 'input[name="name"]'
const selectNetworkBtn = '[data-cy="create-safe-select-network"]'
const ownerInput = 'input[name^="owners"][name$="name"]'
const ownerAddress = 'input[name^="owners"][name$="address"]'
const thresholdInput = 'input[name="threshold"]'
export const removeOwnerBtn = 'button[aria-label="Remove owner"]'
const connectingContainer = 'div[class*="connecting-container"]'
const createNewSafeBtn = 'span[data-track="create-safe: Continue to creation"]'
const connectWalletBtn = 'Connect wallet'

const changeNetworkWarningStr = 'Change your wallet network'
const safeAccountSetupStr = 'Safe Account setup'
const policy1_2 = '1/2 policy'
export const walletName = 'test1-sepolia-safe'
export const defaltSepoliaPlaceholder = 'sepolia-safe'

export function verifyPolicy1_2() {
  cy.contains(policy1_2).should('exist')
  // TOD: Need data-cy for containers
}

export function verifyDefaultWalletName(name) {
  cy.get(nameInput).invoke('attr', 'placeholder').should('include', name)
}

export function verifyNextBtnIsDisabled() {
  cy.get('button').contains('Next').should('be.disabled')
}

export function verifyNextBtnIsEnabled() {
  cy.get('button').contains('Next').should('not.be.disabled')
}

export function checkNetworkChangeWarningMsg() {
  cy.get('div').contains(changeNetworkWarningStr).should('exist')
}

export function connectWallet() {
  cy.get('onboard-v2')
    .shadow()
    .within(($modal) => {
      cy.wrap($modal).contains('div', constants.connectWalletNames.e2e).click()
      cy.wrap($modal).get(connectingContainer).should('exist')
    })
}

export function clickOnCreateNewSafeBtn() {
  cy.get(createNewSafeBtn).click().wait(1000)
}

export function clickOnConnectWalletAndCreateBtn() {
  cy.contains('[data-testid="welcome-login"]', connectWalletBtn).click().wait(1000)
}

export function typeWalletName(name) {
  cy.get(nameInput).type(name).should('have.value', name)
}

export function clearWalletName() {
  cy.get(nameInput).clear()
}

export function selectNetwork(network, regex = false) {
  cy.wait(1000)
  cy.get(selectNetworkBtn).should('be.visible').click()
  cy.wait(1000)
  cy.get('li').contains(network).click()
  cy.get('body').click()
}

export function clickOnNextBtn() {
  cy.contains('button', 'Next').click()
}

export function verifyOwnerName(name, index) {
  cy.get(ownerInput).eq(index).should('have.value', name)
}

export function verifyOwnerAddress(address, index) {
  cy.get(ownerAddress).eq(index).should('have.value', address)
}

export function verifyThreshold(number) {
  cy.get(thresholdInput).should('have.value', number)
}

export function typeOwnerName(name, index) {
  cy.get(getOwnerNameInput(index)).type(name).should('have.value', name)
}

export function typeOwnerAddress(address, index, clearOnly = false) {
  if (clearOnly) {
    cy.get(getOwnerAddressInput(index)).clear()
    cy.get('body').click()
    return
  }
  cy.get(getOwnerAddressInput(index)).clear().type(address).should('have.value', address)
}

export function clickOnAddNewOwnerBtn() {
  cy.contains('button', 'Add new owner').click()
}

export function addNewOwner(name, address, index) {
  clickOnAddNewOwnerBtn()
  typeOwnerName(name, index)
  typeOwnerAddress(address, index)
}

export function updateThreshold(number) {
  cy.get(thresholdInput).parent().click()
  cy.contains('li', number).click()
}

export function removeOwner(index) {
  // Index for remove owner btn which does not equal to number of owners
  cy.get(removeOwnerBtn).eq(index).click()
}

export function verifySafeNameInSummaryStep(name) {
  cy.contains(name)
}

export function verifyOwnerNameInSummaryStep(name) {
  cy.contains(name)
}

export function verifyOwnerAddressInSummaryStep(address) {
  cy.contains(address)
}

export function verifyThresholdStringInSummaryStep(startThreshold, endThreshold) {
  cy.contains(`${startThreshold} out of ${endThreshold}`)
}

export function verifyNetworkInSummaryStep(network) {
  cy.get('div').contains('Name').parent().parent().contains(network)
}

export function verifyEstimatedFeeInSummaryStep() {
  cy.get('b')
    .contains('ETH')
    .parent()
    .should(($element) => {
      const text = 'a' + $element.text()
      const pattern = /\d/
      expect(/\d/.test(text)).to.equal(true)
    })
}

function getOwnerNameInput(index) {
  return `input[name="owners.${index}.name"]`
}

function getOwnerAddressInput(index) {
  return `input[name="owners.${index}.address"]`
}
