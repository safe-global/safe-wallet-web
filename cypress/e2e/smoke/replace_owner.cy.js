import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../pages/owners.pages'

describe('Replace an owner tests', () => {
  beforeEach(() => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_1)
    cy.clearLocalStorage()
    main.acceptCookies()
    cy.contains(owner.safeAccountNonceStr, { timeout: 10000 })
  })

  it('Verify that "Replace" icon is visible', () => {
    owner.verifyReplaceBtnIsEnabled()
  })

  it('Verify Tooltip displays correct message for Non-Owner', () => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_2)
    owner.waitForConnectionStatus()
    owner.hoverOverReplaceOwnerBtn()
    owner.verifyTooltipLabel(owner.nonOwnerErrorMsg)
  })

  it('Verify Tooltip displays correct message for disconnected user', () => {
    owner.waitForConnectionStatus()
    owner.clickOnWalletExpandMoreIcon()
    owner.clickOnDisconnectBtn()
    owner.hoverOverReplaceOwnerBtn()
    owner.verifyTooltipLabel(owner.disconnectedUserErrorMsg)
  })

  it.only('Verify that the owner replacement form is opened d', () => {
    owner.waitForConnectionStatus()
    owner.openReplaceOwnerWindow()
  })
})
