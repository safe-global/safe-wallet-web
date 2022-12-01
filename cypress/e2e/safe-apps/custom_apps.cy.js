const appUrl = 'https://safe-custom-app.com'

describe('When visiting a custom Safe App', () => {
  beforeEach(() => {
    cy.fixture('safe-app').then((html) => {
      cy.intercept('GET', `${appUrl}`, html)
      cy.intercept('GET', `${appUrl}/manifest.json`, {
        name: 'Cypress Test App',
        description: 'Cypress Test App Description',
        icons: [{ src: 'logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      })
    })
  })

  it('should show the custom app warning', () => {
    cy.visitSafeApp(`${appUrl}`)

    cy.findByText(/accept selection/i).click()
    cy.findByRole('heading', { content: /warning/i })
    cy.findByText('https://safe-custom-app.com')
    cy.reload()
    cy.findByRole('heading', { content: /warning/i })
    cy.findByText('https://safe-custom-app.com')
  })

  it('should stop showing the warning when the check is marked', () => {
    cy.findByRole('checkbox').should('exist').click()
    cy.findByRole('button', { name: /continue/i }).click()
    cy.reload()
    cy.findByRole('heading', { content: /warning/i }).should('not.exist')
  })
})
