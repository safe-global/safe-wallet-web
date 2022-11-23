const SAFE = 'gor:0x9Fe2725B42a17395f257A0fc0Bf3Ddb703B4c786'
const EOA = '0x0Ee26C4481485AC64BfFf2bdCaA21EdAeCEcdCa9'

// generate number between 0.00001 and 0.00020
const sendValue = Math.floor(Math.random() * 20 + 1) / 100000
let recommendedNonce

describe('Queue a transaction on 1/N', () => {
  before(() => {
    cy.connectE2EWallet()

    cy.visit(`/${SAFE}/home`, { failOnStatusCode: false })

    cy.contains('Accept selection').click()
  })

  it('should create and queue a transaction', () => {
    // Assert that "New transaction" button is visible
    cy.contains('New transaction', {
      timeout: 60_000, // `lastWallet` takes a while initialize in CI
    }).should('be.visible')

    // Open the new transaction modal
    cy.contains('New transaction').click()

    // Modal is open
    cy.contains('h2', 'New transaction').should('be.visible')
    cy.contains('Send tokens').click()

    // Fill transaction data
    cy.get('input[name="recipient"]').type(EOA)
    // Click on the Token selector
    cy.get('input[name="tokenAddress"]').prev().click()
    cy.get('ul[role="listbox"]').contains('Görli Ether').click()

    // Insert amount
    cy.get('input[name="amount"]').type(`${sendValue}`)
  })

  it('should create a queued transaction', () => {
    // Wait for /estimations response
    cy.intercept('POST', '/**/multisig-transactions/estimations').as('EstimationRequest')

    cy.contains('Next').click()

    cy.wait('@EstimationRequest', {
      timeout: 30_000, // EstimationRequest takes a while in CI
    })

    // Alias for New transaction modal
    cy.contains('h2', 'Review transaction').parents('div').as('modal')

    // Estimation is loaded
    cy.get('button[type="submit"]').should('not.be.disabled')

    // Gets the recommended nonce
    cy.contains('Signing the transaction with nonce').should(($div) => {
      // get the number in the string
      recommendedNonce = $div.text().match(/\d+$/)[0]
    })

    // Changes nonce to next one
    cy.contains('Signing the transaction with nonce').click()
    cy.contains('button', 'Edit').click()
    cy.get('label').contains('Safe transaction nonce').next().clear().type('4')
    cy.contains('Confirm').click()

    // Asserts the execute checkbox exists
    cy.get('@modal').within(() => {
      cy.get('input[type="checkbox"]')
        .parent('span')
        .should(($div) => {
          // Turn the classList into a string
          const classListString = Array.from($div[0].classList).join()
          // Check if it contains the error class
          expect(classListString).to.include('checked')
        })
    })
    cy.contains('Estimated fee').should('exist')

    // Asserts the execute checkbox is uncheckable
    cy.contains('Execute transaction').click()
    cy.get('@modal').within(() => {
      cy.get('input[type="checkbox"]')
        .parent('span')
        .should(($div) => {
          // Turn the classList into a string
          const classListString = Array.from($div[0].classList).join()
          // Check if it contains the error class
          expect(classListString).not.to.include('checked')
        })
    })
    cy.contains('Signing the transaction with nonce').should('exist')

    // Changes back to recommended nonce
    cy.contains('Signing the transaction with nonce').click()
    cy.contains('Edit').click()
    cy.get('button[aria-label="Reset to recommended nonce"]').click()

    // Accepts the values
    cy.contains('Confirm').click()

    cy.get('@modal').within(() => {
      cy.get('input[type="checkbox"]').should('not.exist')
    })
  })

  it('should click the notification and see the transaction queued', () => {
    cy.contains('Submit').click()

    // Wait for the /propose request
    cy.intercept('POST', '/**/propose').as('ProposeTx')
    cy.wait('@ProposeTx', {
      timeout: 30_000, // ProposeTx takes a while in CI
    })

    // Click on the notification
    cy.contains('View transaction').click()

    // Single Tx page
    cy.contains('h3', 'Transaction details').should('be.visible')

    // Queue label
    cy.contains('Queued - transaction with nonce 4 needs to be executed first').should('be.visible')

    // Transaction summary
    cy.contains(`${recommendedNonce}` + 'Send' + '-' + `${sendValue} GOR`).should('exist')
  })
})
