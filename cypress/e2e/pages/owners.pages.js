import * as constants from '../../support/constants'
import * as main from '../pages/main.page'

const copyToClipboardBtn = 'button[aria-label="Copy to clipboard"]'
const tooltipLabel = (label) => `span[aria-label="${label}"]`
const removeOwnerBtn = 'button[aria-label="Remove owner"]'
const replaceOwnerBtn = 'button[aria-label="Replace owner"]'
const addOwnerBtn = 'span[data-track="settings: Add owner"]'
const tooltip = 'div[role="tooltip"]'
const expandMoreIcon = 'svg[data-testid="ExpandMoreIcon"]'
const sentinelStart = 'div[data-testid="sentinelStart"]'
const newOwnerName = 'input[name="newOwner.name"]'
const newOwnerAddress = 'input[name="newOwner.address"]'
const newOwnerNonceInput = 'input[name="nonce"]'
const thresholdInput = 'input[name="threshold"]'
const thresHoldDropDownIcon = 'svg[data-testid="ArrowDropDownIcon"]'
const thresholdList = 'ul[role="listbox"]'
const thresholdDropdown = 'div[aria-haspopup="listbox"]'
const thresholdOption = 'li[role="option"]'

const disconnectBtnStr = 'Disconnect'
const notConnectedStatus = 'Connect'
const e2eWalletStr = 'E2E Wallet'
const max50charsLimitStr = 'Maximum 50 symbols'
const nextBtnStr = 'Next'
const executeBtnStr = 'Execute'
const backbtnStr = 'Back'
const removeOwnerStr = 'Remove owner'
const selectedOwnerStr = 'Selected owner'
const addNewOwnerStr = 'Add new owner'

export const safeAccountNonceStr = 'Safe Account nonce'
export const nonOwnerErrorMsg = 'Your connected wallet is not an owner of this Safe Account'
export const disconnectedUserErrorMsg = 'Please connect your wallet'

export function verifyOwnerDeletionWindowDisplayed() {
  cy.get('div').contains(constants.transactionStatus.confirm).should('exist')
  cy.get('button').contains(backbtnStr).should('exist')
  cy.get('p').contains(selectedOwnerStr)
}

function clickOnThresholdDropdown() {
  cy.get(thresholdDropdown).eq(1).click()
}

function getThresholdOptions() {
  return cy.get('ul').find(thresholdOption)
}

export function verifyThresholdLimit(startValue, endValue) {
  cy.get('p').contains(`out of ${endValue} owner(s)`)
  clickOnThresholdDropdown()
  getThresholdOptions().should('have.length', 1)
  getThresholdOptions().eq(0).should('have.text', startValue)
}

export function verifyRemoveBtnIsEnabled() {
  return cy.get(removeOwnerBtn).should('exist')
}

export function hoverOverDeleteOwnerBtn(index) {
  cy.get(removeOwnerBtn).eq(index).trigger('mouseover', { force: true })
}

export function openRemoveOwnerWindow(btn) {
  cy.get(removeOwnerBtn).eq(btn).click({ force: true })
  cy.get(copyToClipboardBtn).parent().eq(2).find('span').contains('0x').should('be.visible')
  cy.get('div').contains(removeOwnerStr).should('exist')
}

export function openReplaceOwnerWindow() {
  cy.get(replaceOwnerBtn).click({ force: true })
  cy.get(newOwnerName).should('be.visible')
  cy.get(newOwnerAddress).should('be.visible')
  cy.get(copyToClipboardBtn).parent().eq(2).find('span').contains('0x').should('be.visible')
}
export function verifyTooltipLabel(label) {
  cy.get(tooltipLabel(label)).should('be.visible')
}
export function verifyReplaceBtnIsEnabled() {
  cy.get(replaceOwnerBtn).should('exist').and('not.be.disabled')
}

export function hoverOverReplaceOwnerBtn() {
  cy.get(replaceOwnerBtn).trigger('mouseover', { force: true })
}

export function verifyAddOwnerBtnIsEnabled() {
  cy.get(addOwnerBtn).should('exist').and('not.be.disabled')
}

export function hoverOverAddOwnerBtn() {
  cy.get(addOwnerBtn).trigger('mouseover')
}

export function verifyTooltiptext(text) {
  cy.get(tooltip).should('have.text', text)
}

export function clickOnWalletExpandMoreIcon() {
  cy.get(expandMoreIcon).eq(0).click()
  cy.get(sentinelStart).next().should('be.visible')
}

export function clickOnDisconnectBtn() {
  cy.get('button').contains(disconnectBtnStr).click()
  cy.get('button').contains(notConnectedStatus)
}

export function waitForConnectionStatus() {
  cy.get('div').contains(e2eWalletStr)
}

export function openAddOwnerWindow() {
  cy.get('span').contains(addNewOwnerStr).click()
  cy.wait(1000)
  cy.get(newOwnerName).should('be.visible')
  cy.get(newOwnerAddress).should('be.visible')
}

export function verifyNonceInputValue(value) {
  cy.get(newOwnerNonceInput).should('not.be.disabled')
  main.verifyInputValue(newOwnerNonceInput, value)
}

export function verifyErrorMsgInvalidAddress(errorMsg) {
  cy.get('label').contains(errorMsg).should('be.visible')
}

export function typeOwnerAddress(address) {
  cy.get(newOwnerAddress).clear().type(address)
  main.verifyInputValue(newOwnerAddress, address)
  cy.wait(1000)
}

export function typeOwnerName(name) {
  cy.get(newOwnerName).clear().type(name)
  main.verifyInputValue(newOwnerName, name)
}

export function selectNewOwner(name) {
  cy.contains(name).click()
}

export function verifyNewOwnerName(name) {
  cy.get(newOwnerName).should('have.attr', 'placeholder', name)
}

export function clickOnNextBtn() {
  cy.get('button').contains(nextBtnStr).click()
}

export function verifyConfirmTransactionWindowDisplayed() {
  cy.get('div').contains(constants.transactionStatus.confirm).should('exist')
  cy.get('button').contains(executeBtnStr).should('exist')
  cy.get('button').contains(backbtnStr).should('exist')
}

export function verifyThreshold(startValue, endValue) {
  main.verifyInputValue(thresholdInput, startValue)
  cy.get('p').contains(`out of ${endValue} owner(s)`).should('be.visible')
  cy.get(thresholdInput).parent().click()
  cy.get(thresholdList).contains(endValue).should('be.visible')
}
