import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'
import * as spendinglimit from '../pages/spending_limits.pages.js'
import * as owner from '../pages/owners.pages.js'

describe('Spending limits non-owner tests', () => {
  beforeEach(() => {
    cy.visit(constants.securityUrl + constants.SEPOLIA_TEST_SAFE_2)
    cy.clearLocalStorage()
    main.acceptCookies()
    owner.waitForConnectionStatus()
    cy.get(spendinglimit.spendingLimitsSection).should('be.visible')
  })

  it('Verify that where there are no spending limits setup, information images are displayed', () => {
    spendinglimit.verifySpendingLimitsIcons
  })

  it('Verify "New spending limit" button only available for owners', () => {
    spendinglimit.verifySpendingLimitBtnIsDisabled()
  })
})
