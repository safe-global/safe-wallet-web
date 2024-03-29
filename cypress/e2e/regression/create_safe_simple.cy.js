import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as createwallet from '../pages/create_wallet.pages'
import * as owner from '../pages/owners.pages'

describe('Safe creation tests', () => {
  beforeEach(() => {
    cy.visit(constants.welcomeUrl + '?chain=sep')
    cy.clearLocalStorage()
    main.acceptCookies()
  })

  it('Verify Next button is disabled until switching to network is done', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.selectNetwork(constants.networks.ethereum)
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.checkNetworkChangeWarningMsg()
    createwallet.verifyNextBtnIsDisabled()
    createwallet.selectNetwork(constants.networks.sepolia)
    createwallet.verifyNextBtnIsEnabled()
  })

  // TODO: Check unit tests
  it('Verify error message is displayed if wallet name input exceeds 50 characters', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.typeWalletName(main.generateRandomString(51))
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.exceedChars)
    createwallet.clearWalletName()
  })

  // TODO: Replace wallet with Safe
  // TODO: Check unit tests
  it('Verify there is no error message is displayed if wallet name input contains less than 50 characters', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.typeWalletName(main.generateRandomString(50))
    owner.verifyValidWalletName(constants.addressBookErrrMsg.exceedChars)
  })

  it('Verify current connected account is shown as default owner', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.clickOnNextBtn()
    owner.verifyExistingOwnerAddress(0, constants.DEFAULT_OWNER_ADDRESS)
  })

  // TODO: Check unit tests
  it('Verify error message is displayed if owner name input exceeds 50 characters', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    owner.typeExistingOwnerName(main.generateRandomString(51))
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.exceedChars)
  })

  // TODO: Check unit tests
  it('Verify there is no error message is displayed if owner name input contains less than 50 characters', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    owner.typeExistingOwnerName(main.generateRandomString(50))
    owner.verifyValidWalletName(constants.addressBookErrrMsg.exceedChars)
  })

  it('Verify data persistence', () => {
    const ownerName = 'David'
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.clickOnNextBtn()
    createwallet.clickOnAddNewOwnerBtn()
    createwallet.typeOwnerName(ownerName, 1)
    createwallet.typeOwnerAddress(constants.SEPOLIA_OWNER_2, 1)
    createwallet.clickOnBackBtn()
    createwallet.clearWalletName()
    createwallet.typeWalletName(createwallet.walletName)
    createwallet.clickOnNextBtn()
    createwallet.clickOnNextBtn()
    createwallet.verifySafeNameInSummaryStep(createwallet.walletName)
    createwallet.verifyOwnerNameInSummaryStep(ownerName)
    createwallet.verifyOwnerAddressInSummaryStep(constants.DEFAULT_OWNER_ADDRESS)
    createwallet.verifyOwnerAddressInSummaryStep(constants.DEFAULT_OWNER_ADDRESS)
    createwallet.verifyThresholdStringInSummaryStep(1, 2)
    createwallet.verifyNetworkInSummaryStep(constants.networks.sepolia)
    createwallet.clickOnBackBtn()
    createwallet.clickOnBackBtn()
    cy.wait(1000)
    createwallet.clickOnNextBtn()
    createwallet.clickOnNextBtn()
    createwallet.verifySafeNameInSummaryStep(createwallet.walletName)
    createwallet.verifyOwnerNameInSummaryStep(ownerName)
    createwallet.verifyOwnerAddressInSummaryStep(constants.DEFAULT_OWNER_ADDRESS)
    createwallet.verifyOwnerAddressInSummaryStep(constants.DEFAULT_OWNER_ADDRESS)
    createwallet.verifyThresholdStringInSummaryStep(1, 2)
    createwallet.verifyNetworkInSummaryStep(constants.networks.sepolia)
    createwallet.verifyEstimatedFeeInSummaryStep()
  })

  it('Verify tip is displayed on right side for threshold 1/1', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.clickOnNextBtn()
    createwallet.verifyPolicy1_1()
  })

  // TODO: Check unit tests
  it('Verify address input validation rules', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.clickOnNextBtn()
    createwallet.clickOnAddNewOwnerBtn()
    createwallet.typeOwnerAddress(main.generateRandomString(10), 1)
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.invalidFormat)

    createwallet.typeOwnerAddress(constants.DEFAULT_OWNER_ADDRESS, 1)
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.ownerAdded)

    createwallet.typeOwnerAddress(constants.DEFAULT_OWNER_ADDRESS.toUpperCase(), 1)
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.invalidChecksum)

    createwallet.typeOwnerAddress(constants.ENS_TEST_SEPOLIA_INVALID, 1)
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.failedResolve)
  })
})
