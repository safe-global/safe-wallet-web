const SAFE = 'gor:0x04f8b1EA3cBB315b87ced0E32deb5a43cC151a91'
const EOA = '0xE297437d6b53890cbf004e401F3acc67c8b39665'

const currentNonce = 3
const BATCH_TX_TOPBAR = '[data-track="batching: Batch sidebar open"]'
const BATCH_TX_COUNTER = '[data-track="batching: Batch sidebar open"] span > span'
const ADD_NEW_TX_BATCH = '[data-track="batching: Add new tx to batch"]'
const funds_first_tx = '0.001'
const funds_second_tx = '0.002'
var transactionsInBatchList = 0

describe('Create batch transaction', () => {
  before(() => {
    cy.visit(`/home?safe=${SAFE}`)
    cy.contains('Accept selection').click()

    cy.contains(/E2E Wallet @ G(ö|oe)rli/, { timeout: 10000 })
  })

  it('Should open an empty batch list', () => {
    cy.get(BATCH_TX_TOPBAR).should('be.visible').click()
    cy.contains('Batched transactions').should('be.visible')
    cy.contains('Add an initial transaction to the batch')
    cy.get(ADD_NEW_TX_BATCH).click()
  })

  it('Should see the add batch button in a transaction form', () => {
    //The "true" is to validate that the add to batch button is not visible if "Yes, execute" is selected
    addToBatch(EOA, currentNonce, funds_first_tx, true)
  })

  it('Should see the transaction being added to the batch', () => {
    cy.contains('Transaction is added to batch').should('be.visible')
    //The batch button in the header shows the transaction count
    cy.get(BATCH_TX_COUNTER).contains('1').click()
    amountTransactionsInBatch(1)
  })

  it('Should add a second transaction to the batch', () => {
    cy.contains('Add new transaction').click()
    addToBatch(EOA, currentNonce, funds_second_tx)
    cy.get(BATCH_TX_COUNTER).contains('2').click()
    amountTransactionsInBatch(2)
  })

  it.skip('Should swap transactions order', () => {
    //TODO
  })

  it('Should confirm the batch and see 2 transactions in the form', () => {
    cy.contains('Confirm batch').click()
    cy.contains(`This batch contains ${transactionsInBatchList} transactions`).should('be.visible')
    cy.contains(funds_first_tx).parents('ul').as('TransactionList')
    cy.get('@TransactionList').find('li').eq(0).find('span').eq(0).contains(funds_first_tx)
    cy.get('@TransactionList').find('li').eq(1).find('span').eq(0).contains(funds_second_tx)
  })

  it('Should remove a transaction from the batch', () => {
    cy.get(BATCH_TX_COUNTER).click()
    cy.contains('Batched transactions').should('be.visible').parents('aside').find('ul > li').as('BatchList')
    cy.get('@BatchList').find('[title="Delete transaction"]').eq(0).click()
    cy.get('@BatchList').should('have.length', 1)
    cy.get('@BatchList').contains(funds_first_tx).should('not.exist')
  })
})

const amountTransactionsInBatch = (count) => {
  cy.contains('Batched transactions', { timeout: 7000 })
    .should('be.visible')
    .parents('aside')
    .find('ul > li')
    .should('have.length', count)
  transactionsInBatchList = count
}

const addToBatch = (EOA, currentNonce, amount, verify = false) => {
  // Modal is open
  cy.contains('h1', 'New transaction').should('be.visible')
  cy.contains('Send tokens').click()

  // Fill transaction data
  cy.get('input[name="recipient"]').type(EOA, { delay: 1 })
  // Click on the Token selector
  cy.get('input[name="tokenAddress"]').prev().click()
  cy.get('ul[role="listbox"]')

    .contains(/G(ö|oe)rli Ether/)
    .click()
  cy.get('[name="amount"]').type(amount)
  cy.contains('Next').click()
  cy.get('input[name="nonce"]').clear().type(currentNonce, { force: true }).type('{enter}', { force: true })
  cy.contains('Execute').scrollIntoView()
  //Only validates the button not showing once in the entire run
  if (verify) {
    cy.contains('Yes, execute', { timeout: 4000 }).click()
    cy.contains('Add to batch').should('not.exist')
  }
  cy.contains('No, later', { timeout: 4000 }).click()
  cy.contains('Add to batch').should('be.visible').and('not.be.disabled').click()
}
