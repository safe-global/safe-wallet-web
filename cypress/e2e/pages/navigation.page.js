export const sideNavSettingsIcon = '[data-testid="settings-nav-icon"]'
export const setupSection = '[data-testid="setup-section"]'
export const modalBackBtn = '[data-testid="modal-back-btn"]'
const modalCloseIcon = '[data-testid="CloseIcon"]'
const newTxBtn = '[data-testid="new-tx-btn"]'

export function clickOnSideNavigation(option) {
  cy.get(option).should('exist').click()
}

export function clickOnModalCloseBtn() {
  cy.get(modalCloseIcon).eq(0).trigger('click')
}

export function clickOnNewTxBtn() {
  cy.get(newTxBtn).click()
}
