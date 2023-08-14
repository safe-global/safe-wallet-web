const SAFE = 'gor:0x04f8b1EA3cBB315b87ced0E32deb5a43cC151a91'
const EOA = '0xE297437d6b53890cbf004e401F3acc67c8b39665'

const sendValue = 0.00002
const currentNonce = 3

describe('Queue a transaction on 1/N', () => {
  before(() => {
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
    cy.contains('h1', 'New transaction').should('be.visible')
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
        cy.get('input[name="amount"]').should('have.value', maxBalance)
      })

    cy.get('input[name="amount"]').clear().type(sendValue)

    cy.contains('Next').click()
  })

  it('should create a queued transaction', () => {
    cy.get('button[type="submit"]').should('not.be.disabled')

    cy.wait(1000)

    cy.contains('Native token transfer').should('be.visible')

    // Changes nonce to next one
    cy.get('input[name="nonce"]').clear().type(currentNonce, { force: true }).type('{enter}', { force: true })

    // Execution
    cy.contains('Yes, ').should('exist')
    cy.contains('Estimated fee').should('exist')

    // Asserting the sponsored info is present
    cy.contains('Execute').scrollIntoView().should('be.visible')

    cy.get('span').contains('Estimated fee').next().should('have.css', 'text-decoration-line', 'line-through')
    cy.contains('Transactions per hour')
    cy.contains('5 of 5')

    cy.contains('Estimated fee').click()
    cy.contains('Edit').click()
    cy.contains('Execution parameters').parents('form').as('Paramsform')

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

    cy.get('@Paramsform').submit()

    // Asserts the execute checkbox is uncheckable
    cy.contains('No, later').click()

    cy.get('input[name="nonce"]')
      .clear({ force: true })
      .type(currentNonce + 10, { force: true })
      .type('{enter}', { force: true })

    cy.contains('Sign').click()
  })

  it('should click the notification and see the transaction queued', () => {
    // Wait for the /propose request
    cy.intercept('POST', '/**/propose').as('ProposeTx')
    cy.wait('@ProposeTx')

    // Click on the notification
    cy.contains('View transaction').click()

    //cy.contains('Queue').click()

    // Single Tx page
    cy.contains('h3', 'Transaction details').should('be.visible')

    // Queue label
    cy.contains(`needs to be executed first`).should('be.visible')

    // Transaction summary
    cy.contains('Send' + '-' + `${sendValue} GOR`).should('exist')
  })
})
