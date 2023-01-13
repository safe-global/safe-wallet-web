import { TEST_SAFE } from './constants'

const appUrl = 'https://safe-test-app.com'

describe('The transaction modal', () => {
  before(() => {
    cy.fixture('safe-app').then((html) => {
      cy.intercept('GET', `${appUrl}/*`, html)
      cy.intercept('GET', `*/manifest.json`, {
        name: 'Cypress Test App',
        description: 'Cypress Test App Description',
        icons: [{ src: 'logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      })
    })

    cy.visitSafeApp(`${appUrl}/dummy`)

    cy.findByText(/accept selection/i).click()
  })

  describe('When sending a transaction from an app', () => {
    it('should show the transaction popup', { defaultCommandTimeout: 12000 }, () => {
      cy.findByRole('dialog').within(() => {
        cy.findByText(/sending from/i)

        const testSafeParts = TEST_SAFE.split(':')

        cy.findByText(`${testSafeParts[0]}:`)
        cy.findByText(testSafeParts[1])
      })
    })
  })
})
