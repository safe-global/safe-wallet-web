import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../pages/owners.pages'
import * as createwallet from '../pages/create_wallet.pages'
import * as createTx from '../pages/create_tx.pages.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let staticSafes = []

describe('Remove Owners tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.visit(constants.setupUrl + staticSafes.SEP_STATIC_SAFE_13)
    main.waitForHistoryCallToComplete()
    cy.clearLocalStorage()
    main.acceptCookies()
    owner.waitForConnectionStatus()
    cy.contains(owner.safeAccountNonceStr, { timeout: 10000 })
  })

  it('Verify that "Remove" icon is visible', () => {
    owner.verifyRemoveBtnIsEnabled().should('have.length', 2)
  })

  it('Verify Tooltip displays correct message for Non-Owner', () => {
    cy.visit(constants.setupUrl + staticSafes.SEP_STATIC_SAFE_1)
    main.waitForHistoryCallToComplete()
    owner.waitForConnectionStatus()
    owner.verifyRemoveBtnIsDisabled()
  })

  it('Verify Tooltip displays correct message for disconnected user', () => {
    owner.clickOnWalletExpandMoreIcon()
    owner.clickOnDisconnectBtn()
    owner.verifyRemoveBtnIsDisabled()
  })

  it('Verify owner removal form can be opened', () => {
    owner.openRemoveOwnerWindow(1)
  })

  it('Verify threshold input displays the upper limit as the current safe number of owners minus one', () => {
    owner.openRemoveOwnerWindow(1)
    owner.verifyThresholdLimit(1, 1)
    owner.getThresholdOptions().should('have.length', 1)
  })

  it('Verify owner deletion transaction has been created', () => {
    owner.waitForConnectionStatus()
    owner.openRemoveOwnerWindow(1)
    cy.wait(3000)
    createwallet.clickOnNextBtn()
    //This method creates the @removedAddress alias
    owner.getAddressToBeRemoved()
    owner.verifyOwnerDeletionWindowDisplayed()
    createTx.changeNonce(10)
    createTx.clickOnSignTransactionBtn()
    createTx.waitForProposeRequest()
    createTx.clickViewTransaction()
    createTx.clickOnTransactionItemByName('removeOwner')
    createTx.verifyTxDestinationAddress('@removedAddress')
  })
})
