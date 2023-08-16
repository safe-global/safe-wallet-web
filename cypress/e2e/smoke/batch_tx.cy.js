const SAFE = 'gor:0x04f8b1EA3cBB315b87ced0E32deb5a43cC151a91'
const EOA = '0xE297437d6b53890cbf004e401F3acc67c8b39665'

const currentNonce = 3
const BATCH_TX_TOPBAR = '[data-track="batching: Batch sidebar open"]'
const BATCH_TX_COUNTER = '[data-track="batching: Batch sidebar open"] span > span'
const ADD_NEW_TX_BATCH = '[data-track="batching: Add new tx to batch"]'
const funds_first_tx = '0.001'
const funds_second_tx = '0.002'

describe('Create batch transaction', () => {
  before(() => {
    cy.visit(`/home?safe=${SAFE}`)
    cy.contains('Accept selection').click()
  })

  it('Should open an empty batch list', () => {
    cy.get(BATCH_TX_TOPBAR).should('be.visible').click()
    cy.contains('Batched transactions').should('be.visible')
    cy.contains('Add an initial transaction to the batch')
    cy.get(ADD_NEW_TX_BATCH).click()
  })
  it('Should see the add batch button in a tx form', () => {
    addToBatch(EOA, currentNonce, funds_first_tx, true)
  })
  it('Should see the tx being added to the batch', () => {
    cy.contains('Transaction is added to batch').should('be.visible')
    //Counter The batch button in the header
    cy.get(BATCH_TX_COUNTER).contains('1').click()
    batchCounterShouldBe(1)
  })
  it('Should add a second tx to the batch', () => {
    cy.contains('Add new transaction').click()
    addToBatch(EOA, currentNonce, funds_second_tx)
    cy.get(BATCH_TX_COUNTER).contains('2').click()
    batchCounterShouldBe(2)
  })
  it.skip('Should swap tx orders', () => {
    //Not able to trigger a drag and drop as I found on guides so this doesn't work. I'll keep trying
    cy.wait(3000)
    const dataTransfer = new DataTransfer()
    cy.contains(funds_second_tx).invoke('attr', 'draggable', 'true').trigger('dragstart', { dataTransfer })
    cy.contains('Add new transaction').trigger('drop', { dataTransfer })
  })
  it.skip('Should confirm the batch and see 2 tx in the form', () => {
    cy.contains('Confirm batch').click()
    //This one is hard since the list of tx to execute are divs on divs, and not an ul that I can count or compare with anything
    //and there are no ids or classes to use
  }) //TODO'
  it.skip('Should remove a tx from the batch', () => {
    //The find() is fiding buttons in both li's instead of just the 1st one for some reason so this test doesn't work yet.
    cy.contains('Batched transactions').should('be.visible')
    cy.contains(funds_first_tx).parents('ul li:nth-child(1)').find('button').click()
    cy.contains(funds_first_tx).should('not.exist')
  }) //TODO
})

const batchCounterShouldBe = (count) => {
  cy.contains('Batched transactions').should('be.visible').parents('aside').find('ul li').should('have.length', count)
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
  //Only validates the button not showing once
  if (verify) {
    cy.contains('Yes, execute', { timeout: 4000 }).click()
    cy.contains('Add to batch').should('not.exist')
  }
  cy.contains('No, later', { timeout: 4000 }).click()
  cy.contains('Add to batch').should('be.visible').and('not.be.disabled').click()
}
