import * as batch from '../pages/batches.pages'
import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../../e2e/pages/owners.pages.js'

const currentNonce = 3
const funds_first_tx = '0.001'
const funds_second_tx = '0.002'

describe('[SMOKE] Batch transaction tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.BALANCE_URL + constants.SEPOLIA_TEST_SAFE_5)
    owner.waitForConnectionStatus()
    main.acceptCookies()
  })

  it('[SMOKE] Verify empty batch list can be opened', () => {
    batch.openBatchtransactionsModal()
    batch.openNewTransactionModal()
  })

  it('[SMOKE] Verify a transaction can be added to the batch', () => {
    batch.addNewTransactionToBatch(constants.EOA, currentNonce, funds_first_tx)
    cy.contains(batch.transactionAddedToBatchStr).should('be.visible')
    //The batch button in the header shows the transaction count
    batch.verifyBatchIconCount(1)
    batch.clickOnBatchCounter()
    batch.verifyAmountTransactionsInBatch(1)
  })

  it('[SMOKE] Verify the batch can be confirmed and related transactions exist in the form', () => {
    batch.addNewTransactionToBatch(constants.EOA, currentNonce, funds_first_tx)
    cy.wait(1000)
    batch.addNewTransactionToBatch(constants.EOA, currentNonce, funds_first_tx)
    batch.clickOnBatchCounter()
    batch.clickOnConfirmBatchBtn()
    batch.clickOnBatchCounter()
    batch.clickOnConfirmBatchBtn()
    batch.verifyBatchTransactionsCount(2)
    batch.clickOnBatchCounter()
    cy.contains(funds_first_tx).parents('ul').as('TransactionList')
    cy.get('@TransactionList').find('li').eq(0).find('span').eq(0).contains(funds_first_tx)
    cy.get('@TransactionList').find('li').eq(1).find('span').eq(0).contains(funds_first_tx)
  })

  it('[SMOKE] Verify a transaction can be removed from the batch', () => {
    batch.addNewTransactionToBatch(constants.EOA, currentNonce, funds_first_tx)
    cy.wait(1000)
    batch.addNewTransactionToBatch(constants.EOA, currentNonce, funds_first_tx)
    batch.clickOnBatchCounter()
    cy.contains(batch.batchedTransactionsStr).should('be.visible').parents('aside').find('ul > li').as('BatchList')
    cy.get('@BatchList').find(batch.deleteTransactionbtn).eq(0).click()
    cy.get('@BatchList').should('have.length', 1)
    cy.get('@BatchList').contains(funds_second_tx).should('not.exist')
  })
})
