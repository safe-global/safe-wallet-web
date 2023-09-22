import * as constants from '../../support/constants'
import * as main from '../pages/main.page'

const testAppName = 'Cypress Test App'
const testAppDescr = 'Cypress Test App Description'

describe('The transaction modal', () => {
  before(() => {
    cy.clearLocalStorage()
  })
  beforeEach(() => {
    cy.fixture('safe-app').then((html) => {
      cy.intercept('GET', `${constants.testAppUrl}/*`, html)
      cy.intercept('GET', `*/manifest.json`, {
        name: testAppName,
        description: testAppDescr,
        icons: [{ src: 'logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      })
    })
  })

  describe('When sending a transaction from an app', () => {
    it('should show the transaction popup', { defaultCommandTimeout: 12000 }, () => {
      cy.visitSafeApp(`${constants.testAppUrl}/dummy`)

      main.acceptCookies()
      cy.findByRole('dialog').within(() => {
        cy.findByText(testAppName)
      })
    })
  })
})
