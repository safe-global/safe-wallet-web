import * as constants from '../../support/constants'

const newAccountBtnStr = 'Create new Account'

const nameInput = 'input[name="name"]'
const selectNetworkBtn = '[data-cy="create-safe-select-network"]'
const ownerInput = 'input[name^="owners"][name$="name"]'
const ownerAddress = 'input[name^="owners"][name$="address"]'
const thresholdInput = 'input[name="threshold"]'
const removeOwnerBtn = 'button[aria-label="Remove owner"]'

export function clickOnCreateNewAccuntBtn() {
  cy.contains(newAccountBtnStr).click()
}

export function typeWalletName(name) {
  cy.get(nameInput).should('have.attr', 'placeholder').should('match', constants.goerlySafeName)
  cy.get(nameInput).type(name).should('have.value', name)
}

export function selectNetwork(network, regex = false) {
  cy.wait(1000)
  cy.get(selectNetworkBtn).should('exist').click()
  cy.get('li').contains(network).click()

  if (regex) {
    regex = constants.networks.goerli
    cy.get(selectNetworkBtn).click().invoke('text').should('match', regex)
  } else {
    cy.get(selectNetworkBtn).click().should('have.text', network)
  }
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

function typeOwnerAddress(address, index) {
  cy.get(getOwnerAddressInput(index)).type(address).should('have.value', address)
}

function clickOnAddNewOwnerBtn() {
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
  cy.get(removeOwnerBtn).eq(index).click()
}

export function verifySummaryData(safeName, ownerAddress, startThreshold, endThreshold) {
  cy.contains(safeName)
  cy.contains(ownerAddress)
  cy.contains(`${startThreshold} out of ${endThreshold}`)
}

function getOwnerNameInput(index) {
  return `input[name="owners.${index}.name"]`
}

function getOwnerAddressInput(index) {
  return `input[name="owners.${index}.address"]`
}
