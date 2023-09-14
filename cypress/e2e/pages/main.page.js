import * as constants from '../../support/constants'

const acceptSelection = 'Accept selection'
const gotItBtn = 'Got it'

export function acceptCookies() {
  cy.contains(acceptSelection).click()
  cy.contains(acceptSelection).should('not.exist')
}

export function verifyGoerliWalletHeader() {
  cy.contains(constants.goerlyE2EWallet)
}
