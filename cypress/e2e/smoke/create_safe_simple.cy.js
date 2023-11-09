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

  it('Verify a Wallet can be connected [C56101]', () => {
    createwallet.clickOnCreateNewSafeBtn()
    owner.clickOnWalletExpandMoreIcon()
    owner.clickOnDisconnectBtn()
    createwallet.clickOnConnectWalletBtn()
    createwallet.connectWallet()
  })

  it('Verify Next button is disabled until switching to network is done [C56102]', () => {
    owner.waitForConnectionStatus()
    createwallet.selectNetwork(constants.networks.ethereum)
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.checkNetworkChangeWarningMsg()
    createwallet.verifyNextBtnIsDisabled()
    createwallet.selectNetwork(constants.networks.sepolia)
    createwallet.verifyNextBtnIsEnabled()
  })

  it('Verify that a new Wallet has default name related to the selected network [C56099]', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.verifyDefaultWalletName(createwallet.defaltSepoliaPlaceholder)
  })

  it('Verify error message is displayed if wallet name input exceeds 50 characters [C56098]', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.typeWalletName(main.generateRandomString(51))
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.exceedChars)
    createwallet.clearWalletName()
  })

  it('Verify there is no error message is displayed if wallet name input contains less than 50 characters [C56100]', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.typeWalletName(main.generateRandomString(50))
    owner.verifyValidWalletName(constants.addressBookErrrMsg.exceedChars)
  })

  it('Verify current connected account is shown as default owner [C56091]', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnCreateNewSafeBtn()
    owner.clickOnNextBtn()
    owner.verifyExistingOwnerAddress(0, constants.DEFAULT_OWNER_ADDRESS)
  })

  it('Verify error message is displayed if owner name input exceeds 50 characters [C56092]', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnCreateNewSafeBtn()
    owner.typeExistingOwnerName(main.generateRandomString(51))
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.exceedChars)
  })

  it('Verify there is no error message is displayed if owner name input contains less than 50 characters [C56093]', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnCreateNewSafeBtn()
    owner.typeExistingOwnerName(main.generateRandomString(50))
    owner.verifyValidWalletName(constants.addressBookErrrMsg.exceedChars)
  })

  it('Verify Add and Remove Owner Row works as expected [C56094]', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnCreateNewSafeBtn()
    owner.clickOnNextBtn()
    createwallet.clickOnAddNewOwnerBtn()
    owner.verifyNumberOfOwners(2)
    owner.verifyExistingOwnerAddress(1, '')
    owner.verifyExistingOwnerName(1, '')
    createwallet.removeOwner(0)
    main.verifyElementsCount(createwallet.removeOwnerBtn, 0)
    createwallet.clickOnAddNewOwnerBtn()
    owner.verifyNumberOfOwners(2)
  })

  it('Verify Threshold Setup [C56096]', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnCreateNewSafeBtn()
    owner.clickOnNextBtn()
    createwallet.clickOnAddNewOwnerBtn()
    createwallet.clickOnAddNewOwnerBtn()
    owner.verifyNumberOfOwners(3)
    createwallet.clickOnAddNewOwnerBtn()
    owner.verifyNumberOfOwners(4)
    owner.verifyThresholdLimit(1, 4)
    createwallet.updateThreshold(3)
    createwallet.removeOwner(1)
    owner.verifyThresholdLimit(1, 3)
    createwallet.removeOwner(1)
    owner.verifyThresholdLimit(1, 2)
    createwallet.updateThreshold(1)
  })

  it('Verify data persistence [C56103]', () => {
    const ownerName = 'David'
    owner.waitForConnectionStatus()
    createwallet.clickOnCreateNewSafeBtn()
    owner.clickOnNextBtn()
    createwallet.clickOnAddNewOwnerBtn()
    createwallet.typeOwnerName(ownerName, 1)
    createwallet.typeOwnerAddress(constants.SEPOLIA_OWNER_2, 1)
    owner.clickOnBackBtn()
    createwallet.clearWalletName()
    createwallet.typeWalletName(createwallet.walletName)
    owner.clickOnNextBtn()
    owner.clickOnNextBtn()
    createwallet.verifySafeNameInSummaryStep(createwallet.walletName)
    createwallet.verifyOwnerNameInSummaryStep(ownerName)
    createwallet.verifyOwnerAddressInSummaryStep(constants.DEFAULT_OWNER_ADDRESS)
    createwallet.verifyOwnerAddressInSummaryStep(constants.DEFAULT_OWNER_ADDRESS)
    createwallet.verifyThresholdStringInSummaryStep(1, 2)
    createwallet.verifyNetworkInSummaryStep(constants.networks.sepolia)
    owner.clickOnBackBtn()
    owner.clickOnBackBtn()
    cy.wait(1000)
    owner.clickOnNextBtn()
    owner.clickOnNextBtn()
    createwallet.verifySafeNameInSummaryStep(createwallet.walletName)
    createwallet.verifyOwnerNameInSummaryStep(ownerName)
    createwallet.verifyOwnerAddressInSummaryStep(constants.DEFAULT_OWNER_ADDRESS)
    createwallet.verifyOwnerAddressInSummaryStep(constants.DEFAULT_OWNER_ADDRESS)
    createwallet.verifyThresholdStringInSummaryStep(1, 2)
    createwallet.verifyNetworkInSummaryStep(constants.networks.sepolia)
    createwallet.verifyEstimatedFeeInSummaryStep()
  })

  it('Verify tip is displayed on right side for threshold 1/1 [C56097]', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnCreateNewSafeBtn()
    owner.clickOnNextBtn()
    createwallet.verifyPolicy1_1()
  })

  it('Verify address input validation rules [C56095]', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnCreateNewSafeBtn()
    owner.clickOnNextBtn()
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
