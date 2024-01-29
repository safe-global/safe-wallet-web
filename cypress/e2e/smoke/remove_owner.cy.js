import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../pages/owners.pages'
import * as createwallet from '../pages/create_wallet.pages'
import * as createTx from '../pages/create_tx.pages.js'

describe('[SMOKE] Remove Owners tests', () => {
  beforeEach(() => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_11)
    cy.clearLocalStorage()
    main.acceptCookies()
    cy.contains(owner.safeAccountNonceStr, { timeout: 10000 })
  })

  it('[SMOKE] Verify owner deletion transaction has been created', () => {
    owner.waitForConnectionStatus()
    owner.openRemoveOwnerWindow(1)
    cy.wait(3000)
    createwallet.clickOnNextBtn()
    //This method creates the @removedAddress alias
    owner.getAddressToBeRemoved()
    owner.verifyOwnerDeletionWindowDisplayed()
    createTx.clickOnSignTransactionBtn()
    createTx.waitForProposeRequest()
    createTx.clickViewTransaction()
    createTx.clickOnTransactionItemByName('removeOwner')
    createTx.verifyTxDestinationAddress('@removedAddress')
  })
})
