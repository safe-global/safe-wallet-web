import { INFO_MODAL_KEY } from '../e2e/safe-apps/constants'
import * as constants from '../support/constants'

const allowedApps = ['https://safe-test-app.com']
const TEST_SAFE = constants.SEPOLIA_TEST_SAFE_5

Cypress.Commands.add('visitSafeApp', (appUrl) => {
  cy.on('window:before:load', (window) => {
    window.localStorage.setItem(
      INFO_MODAL_KEY,
      JSON.stringify({
        5: { consentsAccepted: true, warningCheckedCustomApps: allowedApps },
      }),
    )
  })

  cy.visit(`/apps/open?safe=${TEST_SAFE}&appUrl=${encodeURIComponent(appUrl)}`, {
    failOnStatusCode: false,
    onBeforeLoad: (win) => {
      win.addEventListener('message', cy.stub().as('safeAppsMessage'))
    },
  })
})
