const TEST_SAFE = 'rin:0x11Df0fa87b30080d59eba632570f620e37f2a8f7'
const RECIPIENT_ADDRESS = '0x6a5602335a878ADDCa4BF63a050E34946B56B5bC'

describe('Tx Simulation', () => {
  before(() => {
    cy.connectE2EWallet()

    // Open the Safe used for testing
    cy.visit(`/${TEST_SAFE}/home`, { failOnStatusCode: false })
    cy.contains('button', 'Accept selection').click()

    // Open Send Funds Modal
    cy.contains('New transaction').click()
    cy.contains('Send tokens').click()

    // Choose recipient
    cy.get('input[name="recipient"]').should('be.visible')
    cy.get('input[name="recipient"]').type(RECIPIENT_ADDRESS, { force: true })

    // Select asset and amount
    cy.get('input[name="tokenAddress"]').parent().click()
    cy.get('ul[role="listbox"]').contains('Gnosis').click()
    cy.contains('Max').click()

    // go to review step
    cy.contains('Next').click()
  })
  it('should initially have a successful simulation', () => {
    // Simulate
    cy.contains('Simulate').click()

    // result exists after max 10 seconds
    cy.contains('The transaction was successfully simulated', { timeout: 10000 })
  })

  it('should show unexpected error for a very low gas limit', () => {
    // Set Gas Limit to too low
    cy.contains('Estimated fee').click()
    cy.contains('Edit').click()
    cy.get('input[name="gasLimit"]').clear().type('21000')
    cy.contains('Confirm').click()

    // Simulate
    cy.contains('Simulate').click()

    // error exists after max 10 seconds
    cy.contains('An unexpected error occurred during simulation:', { timeout: 10000 })
  })

  it('should simulate with failed transaction for a slightly too low gas limit', () => {
    // Set Gas Limit to too low
    cy.contains('Estimated fee').click()
    cy.contains('Edit').click()
    cy.get('input[name="gasLimit"]').clear().type('75000')
    cy.contains('Confirm').click()

    // Simulate
    cy.contains('Simulate').click()

    // failed tx exists after max 10 seconds
    cy.contains('out of gas', { timeout: 10000 })
  })
})
