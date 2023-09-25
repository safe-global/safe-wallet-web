import * as constants from '../../support/constants'

const acceptSelection = 'Accept selection'

export function acceptCookies() {
  cy.contains(acceptSelection).click()
  cy.contains(acceptSelection).should('not.exist')
  cy.wait(500)
}

export function verifyGoerliWalletHeader() {
  cy.contains(constants.goerlyE2EWallet)
}

export function verifyHomeSafeUrl(safe) {
  cy.location('href', { timeout: 10000 }).should('include', constants.homeUrl + safe)
}

export function checkTextsExistWithinElement(element, texts) {
  texts.forEach((text) => {
    cy.wrap(element).findByText(text).should('exist')
  })
}

export function verifyCheckboxeState(element, index, state) {
  cy.get(element).eq(index).should(state)
}
