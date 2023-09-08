import * as constants from '../../support/constants'

describe('Create Safe form', () => {
  it('should navigate to the form', () => {
    cy.visit('/welcome')

    // Close cookie banner
    cy.contains('button', 'Accept selection').click()

    // Ensure wallet is connected to correct chain via header
    cy.contains(/E2E Wallet @ G(ö|oe)rli/)

    cy.contains('Create new Account').click()
  })

  it('should allow setting a name', () => {
    // Name input should have a placeholder ending in 'goerli-safe'
    cy.get('input[name="name"]')
      .should('have.attr', 'placeholder')
      .should('match', /g(ö|oe)rli-safe/)

    // Input a custom name
    cy.get('input[name="name"]').type('Test safe name').should('have.value', 'Test safe name')
  })

  it('should allow changing the network', () => {
    // Switch to a different network
    cy.get('[data-cy="create-safe-select-network"]').click()
    cy.contains('Ethereum').click()

    // Switch back to Görli
    cy.get('[data-cy="create-safe-select-network"]').click()

    // Prevent Base Mainnet Goerli from being selected
    cy.contains('li span', /^G(ö|oe)rli$/).click()

    cy.contains('button', 'Next').click()
  })

  it('should display a default owner and threshold', () => {
    // Default owner
    cy.get('input[name="owners.0.address"]').should('have.value', constants.DEFAULT_OWNER_ADDRESS)

    // Default threshold
    cy.get('input[name="threshold"]').should('have.value', 1)
  })

  it('should allow changing the owner name', () => {
    cy.get('input[name="owners.0.name"]').type('Test Owner Name')
    cy.contains('button', 'Back').click()
    cy.contains('button', 'Next').click()
    cy.get('input[name="owners.0.name"]').should('have.value', 'Test Owner Name')
  })

  it('should add a new owner and update threshold', () => {
    // Add new owner
    cy.contains('button', 'Add new owner').click()
    cy.get('input[name="owners.1.address"]').should('exist')
    cy.get('input[name="owners.1.address"]').type(constants.EOA)

    // Update threshold
    cy.get('input[name="threshold"]').parent().click()
    cy.contains('li', '2').click()
  })

  it('should remove an owner and update threshold', () => {
    // Remove owner
    cy.get('button[aria-label="Remove owner"]').click()

    // Threshold should change back to 1
    cy.get('input[name="threshold"]').should('have.value', 1)

    cy.contains('button', 'Next').click()
  })

  it('should display summary on review page', () => {
    cy.contains('Test safe name')
    cy.contains(constants.DEFAULT_OWNER_ADDRESS)
    cy.contains('1 out of 1')
  })
})
