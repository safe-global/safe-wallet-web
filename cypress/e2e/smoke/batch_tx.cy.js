import * as batch from '../pages/batches.pages'
import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../../e2e/pages/owners.pages.js'
import * as ls from '../../support/localstorage_data.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let staticSafes = []

const currentNonce = 3
const funds_first_tx = '0.001'
const funds_second_tx = '0.002'

describe('[SMOKE] Batch transaction tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.BALANCE_URL + staticSafes.SEP_STATIC_SAFE_2)
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
    batch.verifyBatchIconCount(1)
    batch.clickOnBatchCounter()
    batch.verifyAmountTransactionsInBatch(1)
  })

  it('[SMOKE] Verify the batch can be confirmed and related transactions exist in the form', () => {
    cy.wrap(null)
      .then(() => main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__batch, ls.batchData.entry0))
      .then(() => main.isItemInLocalstorage(constants.localStorageKeys.SAFE_v2__batch, ls.batchData.entry0))
      .then(() => {
        cy.reload()
        batch.clickOnBatchCounter()
        batch.clickOnConfirmBatchBtn()
        batch.verifyBatchTransactionsCount(2)
        batch.clickOnBatchCounter()
        cy.contains(funds_first_tx).parents('ul').as('TransactionList')
        cy.get('@TransactionList').find('li').eq(0).contains(funds_first_tx)
        cy.get('@TransactionList').find('li').eq(1).contains(funds_first_tx)
      })
  })

  it('[SMOKE] Verify a transaction can be removed from the batch', () => {
    cy.wrap(null)
      .then(() => main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__batch, ls.batchData.entry0))
      .then(() => main.isItemInLocalstorage(constants.localStorageKeys.SAFE_v2__batch, ls.batchData.entry0))
      .then(() => {
        cy.reload()
        batch.clickOnBatchCounter()
        cy.contains(batch.batchedTransactionsStr).should('be.visible').parents('aside').find('ul > li').as('BatchList')
        cy.get('@BatchList').find(batch.deleteTransactionbtn).eq(0).click()
        cy.get('@BatchList').should('have.length', 1)
        cy.get('@BatchList').contains(funds_second_tx).should('not.exist')
      })
  })
})
