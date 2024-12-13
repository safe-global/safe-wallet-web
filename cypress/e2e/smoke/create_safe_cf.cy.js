import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createwallet from '../pages/create_wallet.pages'
import * as owner from '../pages/owners.pages'

describe('[SMOKE] CF Safe creation tests', () => {
  beforeEach(() => {
    cy.visit(constants.welcomeUrl + '?chain=sep')
    cy.clearLocalStorage()
    main.acceptCookies()
  })
  it('[SMOKE] CF creation happy path', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.clickOnNextBtn()
    createwallet.clickOnNextBtn()
    createwallet.selectPayLaterOption()
    createwallet.clickOnReviewStepNextBtn()
    createwallet.verifyNewSafeDialogModal()
    createwallet.clickOnGotitBtn()
    createwallet.verifyCFSafeCreated()
  })
})
