export const sideNavSettingsIcon = '[data-testid="settings-nav-icon"]'
export const setupSection = '[data-testid="setup-section"]'
export const modalBackBtn = '[data-testid="modal-back-btn"]'

export function clickOnSideNavigation(option) {
  cy.get(option).should('exist').click()
}
