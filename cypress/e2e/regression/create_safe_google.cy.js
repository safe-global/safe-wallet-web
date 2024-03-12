import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createwallet from '../pages/create_wallet.pages'
import * as owner from '../pages/owners.pages'
import * as navigation from '../pages/navigation.page'

describe('Safe creation Google tests', () => {
  beforeEach(() => {
    cy.visit(constants.welcomeUrl + '?chain=sep')
    cy.clearLocalStorage()
    main.acceptCookies()
    // TODO: Need credentials to finish API Google login
    // createwallet.loginGoogleAPI()
  })

  // TODO: Clarify requirements
  it.skip('Verify that "Connect with Google" option is disabled for the networks without Relay on the Welcome page', () => {
    owner.clickOnWalletExpandMoreIcon()
    owner.clickOnDisconnectBtn()
    createwallet.selectNetwork(constants.networks.polygon)
    createwallet.verifyGoogleConnectBtnIsDisabled()
  })

  it.skip('Verify a successful connection with google', () => {
    createwallet.verifyGoogleSignin()
  })

  it.skip('Verify Google account info in the header after account connection', () => {
    createwallet.verifyGoogleAccountInfoInHeader()
  })

  it.skip('Verify a successful safe creation with a Google account', { defaultCommandTimeout: 90000 }, () => {
    createwallet.verifyGoogleSignin().click()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.verifyOwnerInfoIsPresent()
    createwallet.clickOnReviewStepNextBtn()
    createwallet.verifySafeIsBeingCreated()
    createwallet.verifySafeCreationIsComplete()
  })

  it.skip('Verify a successful transaction creation with Google account', { defaultCommandTimeout: 90000 }, () => {
    createwallet.verifyGoogleSignin().click()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnReviewStepNextBtn()
    createwallet.verifySafeCreationIsComplete()
    navigation.clickOnSideNavigation(navigation.sideNavSettingsIcon)
    owner.openAddOwnerWindow()
    owner.typeOwnerAddress(constants.SEPOLIA_OWNER_2)
    owner.clickOnNextBtn()
    main.clickOnExecuteBtn()
    owner.verifyOwnerTransactionComplted()
  })
})
