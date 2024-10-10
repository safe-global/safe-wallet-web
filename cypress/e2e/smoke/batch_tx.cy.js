import * as batch from '../pages/batches.pages'
import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as ls from '../../support/localstorage_data.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'
import * as wallet from '../../support/utils/wallet.js'

let staticSafes = []

const currentNonce = 3
const funds_first_tx = '0.001'
const funds_second_tx = '0.002'

const walletCredentials = JSON.parse(Cypress.env('CYPRESS_WALLET_CREDENTIALS'))
const signer = walletCredentials.OWNER_4_PRIVATE_KEY

describe('[SMOKE] Batch transaction tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.visit(constants.BALANCE_URL + staticSafes.SEP_STATIC_SAFE_2)
  })

  it('[SMOKE] Verify empty batch list can be opened', () => {
    wallet.connectSigner(signer)
    batch.openBatchtransactionsModal()
    batch.openNewTransactionModal()
  })

  it('[SMOKE] Verify a transaction can be added to the batch', () => {
    wallet.connectSigner(signer)
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
        wallet.connectSigner(signer)
        batch.clickOnBatchCounter()

        batch.clickOnConfirmBatchBtn()
        batch.verifyBatchTransactionsCount(2)
        batch.clickOnBatchCounter()
        cy.contains(funds_first_tx).parents('ul').as('TransactionList')
        cy.get('@TransactionList').find('li').eq(0).contains(funds_first_tx)
        cy.get('@TransactionList').find('li').eq(1).contains(funds_second_tx)
      })
  })

  it('[SMOKE] Verify a transaction can be removed from the batch', () => {
    cy.wrap(null)
      .then(() => main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__batch, ls.batchData.entry0))
      .then(() => main.isItemInLocalstorage(constants.localStorageKeys.SAFE_v2__batch, ls.batchData.entry0))
      .then(() => {
        cy.reload()
        wallet.connectSigner(signer)
        batch.clickOnBatchCounter()
        cy.contains(batch.batchedTransactionsStr).should('be.visible').parents('aside').find('ul > li').as('BatchList')
        cy.get('@BatchList').find(batch.deleteTransactionbtn).eq(0).click()
        cy.get('@BatchList').should('have.length', 1)
        cy.get('@BatchList').contains(funds_first_tx).should('not.exist')
      })
  })
})
