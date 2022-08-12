describe('Create Safe', () => {
  it('should create a new safe', () => {
    cy.connectE2EWallet()

    cy.visit('/')

    cy.contains('a', 'Accept all').click()
    cy.get('p').contains('Rinkeby').click()
    cy.get('[data-testid=connected-wallet]').should('contain', 'E2E Wallet')
    cy.contains('Create new Safe').click()
    cy.contains('Continue').click()
    cy.get('[data-testid=create-safe-name-field]').type('Test Safe')
    cy.contains('button', 'Continue').click({ force: true })
    cy.contains('button', 'Continue').click({ force: true })

    cy.wait(500) // Not sure why without this ends with "Transaction underpriced"
    cy.contains('button', 'Create').click()
    cy.contains('Your Safe was created successfully', { timeout: 60000 })
  })
})
