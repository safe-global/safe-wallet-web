const DEFAULT_OWNER_ADDRESS = '0xC16Db0251654C0a72E91B190d81eAD367d2C6fED'
const OWNER_ADDRESS = '0xE297437d6b53890cbf004e401F3acc67c8b39665'

describe('Create Safe form', () => {
  it('should navigate to the form', () => {
    cy.connectE2EWallet()

    cy.visit('/welcome')

    // Close cookie banner
    cy.contains('button', 'Accept all').click()

    // Ensure wallet is connected to correct chain via header
    cy.contains('E2E Wallet @ Görli')

    cy.contains('Create new Safe').click()
  })

  it('should allow setting a name', () => {
    // Name input should have a placeholder ending in 'goerli-safe'
    cy.get('input[name="name"]')
      .should('have.attr', 'placeholder')
      .should('match', /g(ö|oe)rli-safe/)

    // Input a custom name
    cy.get('input[name="name"]').type('Test safe name').should('have.value', 'Test safe name')

    cy.contains('button', 'Next').click()
  })

  it('should display a default owner and threshold', () => {
    // Default owner
    cy.get('input[name="owners.0.address"]').should('have.value', DEFAULT_OWNER_ADDRESS)
    cy.get('input[name="owners.0.name"]').type('Test Owner Name').should('have.value', 'Test Owner Name')

    // Default threshold
    cy.get('input[name="threshold"]').should('have.value', 1)

    // Add new owner
    cy.contains('button', 'Add new owner').click()
    cy.get('input[name="owners.1.address"]').should('exist')
    cy.get('input[name="owners.1.address"]').type(OWNER_ADDRESS)

    // Update threshold
    cy.get('input[name="threshold"]').parent().click()
    cy.contains('li', '2').click()

    cy.contains('button', 'Next').click()
  })

  it('should display summary on review page', () => {
    cy.contains('Test safe name')
    cy.contains(OWNER_ADDRESS)
    cy.contains(DEFAULT_OWNER_ADDRESS)
    cy.contains('2 out of 2')
  })
})
