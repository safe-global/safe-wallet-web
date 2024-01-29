import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as spendinglimit from '../pages/spending_limits.pages'
import * as owner from '../pages/owners.pages'

describe('[SMOKE] Spending limits tests', () => {
  beforeEach(() => {
    cy.visit(constants.securityUrl + constants.SEPOLIA_TEST_SAFE_12)
    cy.clearLocalStorage()
    main.acceptCookies()
    owner.waitForConnectionStatus()
    cy.get(spendinglimit.spendingLimitsSection).should('be.visible')
    spendinglimit.clickOnNewSpendingLimitBtn()
  })

  it('Verify A valid ENS name is resolved successfully', () => {
    spendinglimit.enterBeneficiaryAddress(constants.ENS_TEST_SEPOLIA)
    spendinglimit.checkBeneficiaryENS(constants.SEPOLIA_TEST_SAFE_7)
  })

  it('Verify writing a valid address shows no errors', () => {
    spendinglimit.enterBeneficiaryAddress(constants.SEPOLIA_TEST_SAFE_7)
    spendinglimit.verifyValidAddressShowsNoErrors()
  })

  it('Verify Amount input cannot be 0', () => {
    spendinglimit.enterSpendingLimitAmount('0')
    spendinglimit.verifyNumberErrorValidation()
  })

  it('Verify Amount input cannot be a negative number', () => {
    spendinglimit.enterSpendingLimitAmount('-1')
    spendinglimit.verifyNumberAmountEntered('1')
  })

  it('Verify Amount input cannot be characters', () => {
    spendinglimit.enterSpendingLimitAmount('abc')
    spendinglimit.verifyNumberAmountEntered('')
  })

  it('Verify any positive number can be set in the amount input', () => {
    spendinglimit.enterSpendingLimitAmount(1)
    spendinglimit.verifyValidAddressShowsNoErrors()
  })

  it('Verify the reset time is "One time" by default', () => {
    spendinglimit.verifyDefaultTimeIsSet()
  })

  it('Validate Reset values present in dropdown: One time, 5 minutes, 30 minutes, 1 hr', () => {
    spendinglimit.clickOnTimePeriodDropdown()
    spendinglimit.checkTimeDropdownOptions()
  })
})
