const SAFE = 'gor:0x04f8b1EA3cBB315b87ced0E32deb5a43cC151a91'
const EOA = '0xE297437d6b53890cbf004e401F3acc67c8b39665'

// generate number between 0.00001 and 0.00020
let recommendedNonce
const sendValue = Math.floor(Math.random() * 20 + 1) / 100000
const currentNonce = 3

describe('Queue a transaction on 1/N', () => {
  before(() => {
    cy.connectE2EWallet()

    cy.visit(`/home?safe=${SAFE}`)

    cy.contains('Accept selection').click()
  })

  it('should create and queue a transaction', () => {
    // Assert that "New transaction" button is visible
    cy.contains('New transaction', {
      timeout: 60_000, // `lastWallet` takes a while initialize in CI
    })
      .should('be.visible')
      .and('not.be.disabled')

    // Open the new transaction modal
    cy.contains('New transaction').click()

    // Modal is open
    cy.contains('h2', 'New transaction').should('be.visible')
    cy.contains('Send tokens').click()

    // Fill transaction data
    cy.get('input[name="recipient"]').type(EOA)
    // Click on the Token selector
    cy.get('input[name="tokenAddress"]').prev().click()
    cy.get('ul[role="listbox"]')
      .contains(/G(ö|oe)rli Ether/)
      .click()

    // Insert max amount
    cy.contains('Max').click()

    // Validates the "Max" button action, then clears and sets the actual sendValue
    cy.get('input[name="tokenAddress"]')
      .prev()
      .find('p')
      .contains(/G(ö|oe)rli Ether/)
      .next()
      .then((element) => {
        const maxBalance = element.text().replace(' GOR', '').trim()
        cy.wrap(element)
          .parents('form')
          .find('label')
          .contains('Amount')
          .next()
          .find('input')
          .should('have.value', maxBalance)
          .clear()
          .type(sendValue)
      })

    cy.contains('Next').click()
  })

  it('should create a queued transaction', () => {
    // Wait for /estimations response
    cy.intercept('POST', '/**/multisig-transactions/estimations').as('EstimationRequest')

    cy.wait('@EstimationRequest')

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
    cy.get('label').contains('Safe Account transaction nonce').next().clear().type(currentNonce)
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

    // Asserting the sponsored info is present
    cy.contains('Sponsored by').should('be.visible')

    cy.get('span').contains('Estimated fee').next().should('have.css', 'text-decoration-line', 'line-through')
    cy.contains('Transactions per hour')
    cy.contains('5 of 5')

    cy.contains('Estimated fee').click()
    cy.contains('Edit').click()
    cy.contains('Owner transaction (Execution)').parents('form').as('Paramsform')

    // Only gaslimit should be editable when the relayer is selected
    const arrayNames = ['Wallet nonce', 'Max priority fee (Gwei)', 'Max fee (Gwei)']
    arrayNames.forEach((element) => {
      cy.get('@Paramsform').find('label').contains(`${element}`).next().find('input').should('be.disabled')
    })

    cy.get('@Paramsform')
      .find('[name="gasLimit"]')
      .clear()
      .type('300000')
      .invoke('prop', 'value')
      .should('equal', '300000')
    cy.get('@Paramsform').find('[name="gasLimit"]').parent('div').find('[data-testid="RotateLeftIcon"]').click()
    cy.contains('Confirm').click()

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

    // If the checkbox is unchecked the relayer is not present
    cy.get('@modal').should('not.contain', 'Sponsored by').and('not.contain', 'Transactions per hour')

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

    cy.contains('Submit').click()
  })

  it('should click the notification and see the transaction queued', () => {
    // Wait for the /propose request
    cy.intercept('POST', '/**/propose').as('ProposeTx')
    cy.wait('@ProposeTx')

    // Click on the notification
    cy.contains('View transaction').click()

    cy.contains('Queue').click()

    // Single Tx page
    cy.contains('h3', 'Transaction details').should('be.visible')

    // Queue label
    cy.contains(`Queued - transaction with nonce ${currentNonce} needs to be executed first`).should('be.visible')

    // Transaction summary
    cy.contains(`${recommendedNonce}` + 'Send' + '-' + `${sendValue} GOR`).should('exist')
  })
})
