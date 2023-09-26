import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../pages/owners.pages'

describe('Adding an owner', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.setupUrl + constants.GOERLI_TEST_SAFE)
    main.acceptCookies()
    cy.contains(owner.safeAccountNonceStr, { timeout: 10000 })
  })

  describe('Add new owner tests', () => {
    it('Verify the presence of "Add Owner" button', () => {
      owner.verifyAddOwnerBtnIsEnabled()
    })

    it('Verify “Add new owner” button tooltip displays correct message for Non-Owner', () => {
      cy.visit(constants.setupUrl + constants.TEST_SAFE_2)
      owner.hoverOverAddOwnerbtn()
      owner.verifyTooltiptext(owner.nonOwnerErrorMsg)
    })

    it('Verify Tooltip displays correct message for disconnected user', () => {
      owner.waitForConnectionStatus()
      owner.clickOnWalletExpandMoreIcon()
      owner.clickOnDisconnectBtn()
      owner.hoverOverAddOwnerbtn()
      owner.verifyTooltiptext(owner.disconnectedUserErrorMsg)
    })
  })
})
