describe('Create Safe', () => {
  it('should create a new safe', () => {
    cy.connectE2EWallet()

    cy.visit('/welcome')

    // Close cookie banner
    cy.contains('button', 'Accept all').click()

    // Ensure wallet is connected to correct chain via header
    cy.contains('E2E Wallet @ Rinkeby')

    cy.contains('Create new Safe').click()

    // Connect wallet & select network
    cy.contains('Continue').click()

    // Name
    cy.wait(1000) // Wait for form default values to populate
    cy.contains('button', 'Continue').click({ force: true })

    // Owners and confirmations
    cy.wait(1000)
    cy.contains('button', 'Continue').click()

    // Review
    cy.wait(1000) // Not sure why without this ends with "Transaction underpriced"
    cy.contains('button', 'Create').click()

    cy.contains('Your Safe was successfully created!', { timeout: 60000 })
  })
})
