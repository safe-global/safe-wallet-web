const HW_WALLET = '0xff6E053fBf4E5895eDec09146Bc10f705E8c4b3D'
const SPENDING_LIMIT_SAFE = 'gor:0x28F95E682D1dd632b54Dc61740575f49DB39Eb7F'

describe('Check spending limit modal', () => {
  before(() => {
    cy.connectE2EWallet()

    cy.visit(`/${SPENDING_LIMIT_SAFE}/home`, { failOnStatusCode: false })

    cy.contains('Accept selection').click()
  })

  it('should open the spending limit modal', () => {
    // Assert that "New transaction" button is visible
    cy.contains('New transaction', {
      timeout: 60_000, // `lastWallet` takes a while initialize in CI
    }).should('be.visible')

    // Open the new transaction modal
    cy.contains('New transaction').click()
  })

  it('should draft a spending limit transaction', () => {
    // Modal is open
    cy.contains('h2', 'New transaction').should('be.visible')

    cy.contains('Send tokens').click()

    // Fill transaction data
    cy.get('input[name="recipient"]').type(SPENDING_LIMIT_SAFE)

    // Click on the Token selector
    cy.get('input[name="tokenAddress"]').prev().click()
    cy.get('ul[role="listbox"]').contains('Görli Ether').click()

    // Insert max amount
    cy.contains('Spending Limit Transaction (0.1 GOR)').click()

    // Insert max amount
    cy.contains('Max').click()

    cy.contains('Next').click()
  })

  it('should review the spending limit transaction', () => {
    cy.contains(
      'Spending limit transactions only appear in the interface once they are successfully processed and indexed. Pending transactions can only be viewed in your signer wallet application or under your wallet address on a Blockchain Explorer.',
    )

    // Alias for New transaction modal
    cy.contains('h2', 'Review transaction').parents('div').as('modal')

    // Estimation is loaded
    cy.get('button[type="submit"]').should('not.be.disabled')
  })
})
