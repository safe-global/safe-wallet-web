import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as spendinglimit from '../pages/spending_limits.pages'
import * as owner from '../pages/owners.pages'
import * as navigation from '../pages/navigation.page'
import * as tx from '../pages/create_tx.pages'

const tokenAmount = 0.1
const newTokenAmount = 0.001
const spendingLimitBalance = '(0.17 ETH)'

describe('Spending limits tests', () => {
  beforeEach(() => {
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

  it('Verify "Max" button value set to be no more than the allowed amount', () => {
    navigation.clickOnNewTxBtn()
    tx.clickOnSendTokensBtn()
    spendinglimit.clickOnMaxBtn()
    spendinglimit.checkMaxValue()
  })

  it('In new tx, verify selecting a native token from the dropdown', () => {
    navigation.clickOnNewTxBtn()
    tx.clickOnSendTokensBtn()
    spendinglimit.selectToken(constants.tokenNames.sepoliaEther)
  })

  it('Verify that when replacing spending limit for the same owner, previous values are displayed in red', () => {
    spendinglimit.clickOnNewSpendingLimitBtn()
    spendinglimit.enterBeneficiaryAddress(constants.DEFAULT_OWNER_ADDRESS)
    spendinglimit.enterSpendingLimitAmount(newTokenAmount)
    spendinglimit.clickOnTimePeriodDropdown()
    spendinglimit.selectTimePeriod(spendinglimit.timePeriodOptions.fiveMin)
    tx.clickOnNextBtn()
    spendinglimit.verifyOldValuesAreDisplayed()
  })
})
