import * as batch from '../pages/batches.pages'
import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../../e2e/pages/owners.pages.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

const currentNonce = 3
const funds_first_tx = '0.001'
const funds_second_tx = '0.002'

let staticSafes = []

describe('Batch transaction tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.BALANCE_URL + staticSafes.SEP_STATIC_SAFE_2)
    owner.waitForConnectionStatus()
    main.acceptCookies()
  })

  // TODO: Check if localstorage can be used to add batches
  // Rework test
  it('Verify the Add batch button is present in a transaction form', () => {
    //The "true" is to validate that the add to batch button is not visible if "Yes, execute" is selected
    batch.addNewTransactionToBatch(constants.EOA, currentNonce, funds_first_tx)
  })

  it('Verify a second transaction can be added to the batch', () => {
    batch.addNewTransactionToBatch(constants.EOA, currentNonce, funds_first_tx)
    cy.wait(1000)
    batch.addNewTransactionToBatch(constants.EOA, currentNonce, funds_first_tx)
    batch.verifyBatchIconCount(2)
    batch.clickOnBatchCounter()
    batch.verifyAmountTransactionsInBatch(2)
  })
})
