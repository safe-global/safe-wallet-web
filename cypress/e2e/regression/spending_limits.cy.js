import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as spendinglimit from '../pages/spending_limits.pages'
import * as owner from '../pages/owners.pages'
import * as navigation from '../pages/navigation.page'
import * as tx from '../pages/create_tx.pages'

const tokenAmount = 0.1
const spendingLimitBalance = '(0.17 ETH)'

describe('Spending limits tests', () => {
  before(() => {
    cy.visit(constants.securityUrl + constants.SEPOLIA_TEST_SAFE_12)
    cy.clearLocalStorage()
    main.acceptCookies()
    owner.waitForConnectionStatus()
    cy.get(spendinglimit.spendingLimitsSection).should('be.visible')
  })

  it('Verify that the Review step shows beneficiary, amount allowed, reset time', () => {
    //Assume that default reset time is set to One time
    spendinglimit.clickOnNewSpendingLimitBtn()
    spendinglimit.enterBeneficiaryAddress(constants.SEPOLIA_TEST_SAFE_7)
    spendinglimit.enterSpendingLimitAmount(0.1)
    spendinglimit.clickOnNextBtn()
    spendinglimit.checkReviewData(
      tokenAmount,
      constants.SEPOLIA_TEST_SAFE_7,
      spendinglimit.timePeriodOptions.oneTime.split(' ').join('-'),
    )
  })

  it('Verify values and trash icons are displayed in Beneficiary table', () => {
    spendinglimit.verifyBeneficiaryTable()
  })

  it('Verify Spending limit option is available when selecting the corresponding token', () => {
    navigation.clickOnNewTxBtn()
    tx.clickOnSendTokensBtn()
    spendinglimit.verifySpendingOptionExists()
  })

  it('Verify spending limit option shows available amount', () => {
    navigation.clickOnNewTxBtn()
    tx.clickOnSendTokensBtn()
    spendinglimit.verifySpendingOptionShowsBalance([spendingLimitBalance])
  })

  it('Verify when spending limit is selected the nonce field is removed', () => {
    navigation.clickOnNewTxBtn()
    tx.clickOnSendTokensBtn()
    spendinglimit.selectSpendingLimitOption()
    spendinglimit.verifyNonceState(constants.elementExistanceStates.not_exist)
  })
})
