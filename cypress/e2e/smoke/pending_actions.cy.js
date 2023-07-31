const SAFE = 'gor:0xCD4FddB8FfA90012DFE11eD4bf258861204FeEAE'

describe('Pending actions', () => {
  before(() => {
    cy.connectE2EWallet()
    cy.useProdCGW()

    cy.visit(`/welcome`)
    cy.contains('button', 'Accept selection').click()
  })

  beforeEach(() => {
    // Uses the previously saved local storage
    // to preserve the wallet connection between tests
    cy.restoreLocalStorageCache()
  })

  afterEach(() => {
    cy.saveLocalStorageCache()
  })

  it('should add the Safe with the pending actions', () => {
    // Enters Loading Safe form
    cy.contains('button', 'Add').click()
    cy.contains('Connect wallet & select network')

    // Inputs the Safe address
    cy.get('input[name="address"]').type(SAFE)
    cy.contains('Next').click()

    cy.contains('Owners and confirmations')
    cy.contains('Next').click()

    cy.contains('Add').click()
  })

  it('should display the pending actions in the Safe list sidebar', () => {
    cy.get('aside').within(() => {
      cy.get('[data-testid=ChevronRightIcon]').click({ force: true })
    })

    cy.get('li').within(() => {
      cy.contains('0xCD4F...eEAE').should('exist')

      cy.get('img[alt="E2E Wallet logo"]').next().contains('2').should('exist')
      cy.get('[data-testid=CheckIcon]').next().contains('2').should('exist')

      // click on the pending actions
      cy.get('[data-testid=CheckIcon]').next().click()
    })
  })

  it('should have the right number of queued and signable transactions', () => {
    // Navigates to the tx queue
    cy.contains('h3', 'Transactions').should('be.visible')

    // contains 3 queued transactions
    cy.get('span:contains("1 out of 2")').should('have.length', 2)

    // Ensure wallet is connected
    cy.contains('E2E Wallet @ Goerli')

    // contains 3 signable transactions
    cy.get('span:contains("Needs your confirmation")').should('have.length', 2)
  })
})
