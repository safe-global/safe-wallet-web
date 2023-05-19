const DEFAULT_OWNER_ADDRESS = '0xC16Db0251654C0a72E91B190d81eAD367d2C6fED'
const OWNER_ADDRESS = '0xE297437d6b53890cbf004e401F3acc67c8b39665'

describe('Create Safe form', () => {
  it('should navigate to the form', () => {
    cy.connectE2EWallet()

    cy.visit('/welcome')

    // Close cookie banner
    cy.contains('button', 'Accept selection').click()

    // Ensure wallet is connected to correct chain via header
    cy.contains('E2E Wallet @ Görli')

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
    cy.contains('li span', 'Görli').click()

    cy.contains('button', 'Next').click()
  })

  it('should display a default owner and threshold', () => {
    // Default owner
    cy.get('input[name="owners.0.address"]').should('have.value', DEFAULT_OWNER_ADDRESS)

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
    cy.get('input[name="owners.1.address"]').type(OWNER_ADDRESS)

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
    cy.contains(DEFAULT_OWNER_ADDRESS)
    cy.contains('1 out of 1')
  })
})
