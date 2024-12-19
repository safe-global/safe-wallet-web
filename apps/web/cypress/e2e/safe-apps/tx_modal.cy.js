import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as ls from '../../support/localstorage_data.js'

const testAppName = 'Cypress Test App'
const testAppDescr = 'Cypress Test App Description'
const unknownApp = 'unknown'
const confirmTx = 'Confirm transaction'

describe('Transaction modal tests', () => {
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

  it(
    'Verify that the transaction popup is displayed when sending a transaction from an app',
    { defaultCommandTimeout: 12000 },
    () => {
      cy.visitSafeApp(`${constants.testAppUrl}/dummy`)
      cy.findByRole('dialog').within(() => {
        cy.findByText(confirmTx)
        cy.findByText(unknownApp)
      })
    },
  )
})
