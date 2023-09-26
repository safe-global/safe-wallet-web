import * as main from '../../support/constants'

const addOwnerBtn = 'span[data-track="settings: Add owner"]'
const tooltip = 'div[role="tooltip"]'
const expandMoreIcon = 'svg[data-testid="ExpandMoreIcon"]'
const sentinelStart = 'div[data-testid="sentinelStart"]'
const disconnectBtnStr = 'Disconnect'
const notConnectedStatus = 'Not connected'
const e2eWalletStr = 'E2E Wallet'

export const safeAccountNonceStr = 'Safe Account nonce'
export const nonOwnerErrorMsg = 'Your connected wallet is not an owner of this Safe Account'
export const disconnectedUserErrorMsg = 'Please connect your wallet'

export function verifyAddOwnerBtnIsEnabled() {
  cy.get(addOwnerBtn).should('exist').and('not.be.disabled')
}

export function hoverOverAddOwnerbtn() {
  return cy.get(addOwnerBtn).trigger('mouseover')
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
  cy.get('span').contains(notConnectedStatus)
}

export function waitForConnectionStatus() {
  cy.get('div').contains(e2eWalletStr)
}
