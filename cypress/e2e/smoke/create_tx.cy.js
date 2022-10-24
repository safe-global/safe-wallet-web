const SAFE = 'gor:0x04f8b1EA3cBB315b87ced0E32deb5a43cC151a91'
const EOA = '0xE297437d6b53890cbf004e401F3acc67c8b39665'

describe('Queue a transaction on N/1', () => {
  before(() => {
    cy.connectE2EWallet()

    cy.visit(`/${SAFE}/home`, { failOnStatusCode: false })

    cy.contains('Accept selection').click()
  })

  it('should create and queue a transaction', () => {
    // Open the new transaction modal
    cy.contains('New transaction', { timeout: 10000 }).click()

    // Modal is open
    cy.contains('h2', 'New transaction').should('be.visible')
    cy.contains('Send tokens').click()

    // Fill transaction data
    cy.get('input[name="recipient"]').type(EOA)
    // Click on the Token selector
    cy.get('input[name="tokenAddress"]').prev().click()
    cy.get('ul[role="listbox"]').contains('Görli Ether').click()

    // Insert amount
    cy.get('input[name="amount"]').type('0.00003')

    cy.contains('Next').click()
  })

  it('should create a queued transaction', () => {
    // Alias for New transaction modal
    cy.contains('h2', 'Review transaction').parents('div').as('modal')

    cy.contains('Signing the transaction with nonce 4').click()
    cy.contains('button', 'Edit').click()

    cy.get('label').contains('Safe transaction nonce').next().clear().type('3')

    // Accepts the values
    cy.contains('Confirm').click()

    // Asserts the execute checkbox is checked
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

    // Open the new transaction modal
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

    cy.contains('Submit').click()
  })

  it('should display the queued tx on Dashboard', () => {
    cy.contains('h2', 'Transaction queue').parents('section').as('txQueueSection')

    cy.get('@txQueueSection').within(() => {
      // There should be queued transactions
      cy.contains('This Safe has no queued transactions').should('not.exist')

      // Created transaction should be queued
      cy.contains(`a[href="/transactions/queue?safe=${SAFE}"]`, '3' + 'Send' + '-' + '0.00003 GOR' + '1/1').should(
        'exist',
      )
    })
  })
})
