import * as constants from '../../support/constants'

export const sideNavSettingsIcon = '[data-testid="settings-nav-icon"]'

export function clickOnSideNavigation(option) {
  cy.get(option).should('exist').click()
}
