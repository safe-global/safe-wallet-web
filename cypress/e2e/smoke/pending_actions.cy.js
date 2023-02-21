const SAFE = 'gor:0xCD4FddB8FfA90012DFE11eD4bf258861204FeEAE'

describe('Pending actions', () => {
  it('should navigate to the form', () => {
    cy.connectE2EWallet()

    cy.visit('/welcome')

    // Close cookie banner
    cy.contains('button', 'Accept all').click()

    // Ensure wallet is connected to correct chain via header
    cy.contains('E2E Wallet @ Görli')
  })

  it('should add the Safe with the pending actions', () => {
    // Enters Loading Safe form
    cy.contains('button', 'Add existing Safe').click()
    cy.contains('Connect wallet & select network')

    // Inputs the Safe address
    cy.get('input[name="address"]').type(SAFE)
    cy.contains('Next').click()

    cy.contains('Owners and confirmations')
    cy.contains('Next').click()

    cy.contains('Add').click()
  })

  it('should display the queued transactions', () => {
    cy.get('aside').within(() => {
      cy.get('[data-testid=ChevronRightIcon]').click({ force: true })
    })

    cy.get('li').within(() => {
      cy.contains('0xCD4F...eEAE').should('exist')

      // get img with alt "Metamask logo"
      cy.get('img[alt="Metamask logo"]').should('exist')

      cy.get('img[alt="Metamask logo"]').next().contains('2')
      cy.get('[data-testid=CheckIcon]').next().contains('2')
    })
  })
})

// 0xcd4fddb8ffa90012dfe11ed4bf258861204feeae

// ChevronRightIcon
