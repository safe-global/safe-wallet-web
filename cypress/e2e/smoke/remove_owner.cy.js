import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../pages/owners.pages'
import * as createwallet from '../pages/create_wallet.pages'

describe('[SMOKE] Remove Owners tests', () => {
  beforeEach(() => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_1)
    cy.clearLocalStorage()
    main.acceptCookies()
    cy.contains(owner.safeAccountNonceStr, { timeout: 10000 })
  })

  // TODO: Add Sign action. Check there is no error before sign action on UI when nonce not loaded
  it('[SMOKE] Verify owner deletion confirmation is displayed', () => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_3)
    owner.waitForConnectionStatus()
    owner.openRemoveOwnerWindow(1)
    createwallet.clickOnNextBtn()
    owner.verifyOwnerDeletionWindowDisplayed()
  })
})
