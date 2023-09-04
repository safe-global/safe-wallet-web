const appUrl = 'https://safe-custom-app.com'

describe('When visiting a custom Safe App', () => {
  before(() => {
    cy.fixture('safe-app').then((html) => {
      cy.intercept('GET', `${appUrl}`, html)
      cy.intercept('GET', `${appUrl}/manifest.json`, {
        name: 'Cypress Test App',
        description: 'Cypress Test App Description',
        icons: [{ src: 'logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      })
    })

    cy.visitSafeApp(`${appUrl}`)
    cy.wait(1000)
    cy.contains('button', 'Accept all').click()
  })

  it('should show the custom app warning', () => {
    cy.findByRole('heading', { content: /warning/i })
    cy.findByText('https://safe-custom-app.com')
    cy.findByText('Check the link you are using')

    cy.findByRole('checkbox').should('exist').click()
    cy.findByRole('button', { name: /continue/i }).click()
    cy.reload()
    cy.findByRole('heading', { content: /warning/i }).should('not.exist')
  })
})
