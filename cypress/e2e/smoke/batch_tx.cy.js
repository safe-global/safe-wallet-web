import * as batch from '../pages/batches.pages'
import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'

const currentNonce = 3
const funds_first_tx = '0.001'
const funds_second_tx = '0.002'

describe('Create batch transaction', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.homeUrl + constants.TEST_SAFE)
    main.acceptCookies()
    cy.contains(constants.goerlyE2EWallet, { timeout: 10000 })
  })

  it('Should open an empty batch list', () => {
    batch.openBatchtransactionsModal()
    batch.openNewTransactionModal()
  })

  it('Should see the add batch button in a transaction form', () => {
    //The "true" is to validate that the add to batch button is not visible if "Yes, execute" is selected
    batch.addToBatch(constants.EOA, currentNonce, funds_first_tx, true)
  })

  it('Should see the transaction being added to the batch', () => {
    cy.contains(batch.transactionAddedToBatchStr).should('be.visible')
    //The batch button in the header shows the transaction count
    batch.verifyBatchIconCount(1)
    batch.clickOnBatchCounter()
    batch.verifyAmountTransactionsInBatch(1)
  })

  it('Should add a second transaction to the batch', () => {
    batch.openNewTransactionModal()
    batch.addToBatch(constants.EOA, currentNonce, funds_second_tx)
    batch.verifyBatchIconCount(2)
    batch.clickOnBatchCounter()
    batch.verifyAmountTransactionsInBatch(2)
  })

  it.skip('Should swap transactions order', () => {
    //TODO
  })

  it('Should confirm the batch and see 2 transactions in the form', () => {
    batch.clickOnConfirmBatchBtn()
    batch.verifyBatchTransactionsCount(2)
    cy.contains(funds_first_tx).parents('ul').as('TransactionList')
    cy.get('@TransactionList').find('li').eq(0).find('span').eq(0).contains(funds_first_tx)
    cy.get('@TransactionList').find('li').eq(1).find('span').eq(0).contains(funds_second_tx)
  })

  it('Should remove a transaction from the batch', () => {
    batch.clickOnBatchCounter()
    cy.contains(batch.batchedTransactionsStr).should('be.visible').parents('aside').find('ul > li').as('BatchList')
    cy.get('@BatchList').find(batch.deleteTransactionbtn).eq(0).click()
    cy.get('@BatchList').should('have.length', 1)
    cy.get('@BatchList').contains(funds_first_tx).should('not.exist')
  })
})
