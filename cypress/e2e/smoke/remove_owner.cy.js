import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../pages/owners.pages'

describe('Remove an owner tests', () => {
  beforeEach(() => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_1)
    cy.clearLocalStorage()
    main.acceptCookies()
    cy.contains(owner.safeAccountNonceStr, { timeout: 10000 })
  })

  it('Verify that "Remove" icon is visible', () => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_3)
    owner.verifyRemoveBtnIsEnabled().should('have.length', 2)
  })

  it('Verify Tooltip displays correct message for Non-Owner', () => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_4)
    owner.waitForConnectionStatus()
    owner.hoverOverDeleteOwnerBtn(0)
    owner.verifyTooltipLabel(owner.nonOwnerErrorMsg)
  })

  it('Verify Tooltip displays correct message for disconnected user', () => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_3)
    owner.waitForConnectionStatus()
    owner.clickOnWalletExpandMoreIcon()
    owner.clickOnDisconnectBtn()
    owner.hoverOverDeleteOwnerBtn(0)
    owner.verifyTooltipLabel(owner.disconnectedUserErrorMsg)
  })

  it('Verify owner removal form can be opened', () => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_3)
    owner.waitForConnectionStatus()
    owner.openRemoveOwnerWindow(1)
  })

  it('Verify threshold input displays the upper limit as the current safe number of owners minus one', () => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_3)
    owner.waitForConnectionStatus()
    owner.openRemoveOwnerWindow(1)
    owner.verifyThresholdLimit(1, 1)
  })

  it('Verify owner deletion confirmation is displayed ', () => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_3)
    owner.waitForConnectionStatus()
    owner.openRemoveOwnerWindow(1)
    owner.clickOnNextBtn()
    owner.verifyOwnerDeletionWindowDisplayed()
  })
})
