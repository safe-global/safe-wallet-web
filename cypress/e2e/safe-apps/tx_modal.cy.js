const appUrl = 'https://safe-test-app.com'

describe('The transaction modal', () => {
  beforeEach(() => {
    cy.fixture('safe-app').then((html) => {
      cy.intercept('GET', `${appUrl}/*`, html)
      cy.intercept('GET', `*/manifest.json`, {
        name: 'Cypress Test App',
        description: 'Cypress Test App Description',
        icons: [{ src: 'logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      })
    })
  })

  describe('When sending a transaction from an app', () => {
    it('should show the transaction popup', { defaultCommandTimeout: 12000 }, () => {
      cy.visitSafeApp(`${appUrl}/dummy`)

      cy.findByText(/accept selection/i).click()
      cy.findByRole('dialog').within(() => {
        cy.findByText(/Cypress Test App/i)
      })
    })
  })
})
