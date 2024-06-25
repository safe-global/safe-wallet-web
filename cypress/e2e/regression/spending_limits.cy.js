import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as spendinglimit from '../pages/spending_limits.pages'
import * as navigation from '../pages/navigation.page'
import * as tx from '../pages/create_tx.pages'
import * as ls from '../../support/localstorage_data.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'
import * as wallet from '../../support/utils/wallet.js'

let staticSafes = []
const walletCredentials = JSON.parse(Cypress.env('CYPRESS_WALLET_CREDENTIALS'))
const signer = walletCredentials.OWNER_4_PRIVATE_KEY

const tokenAmount = 0.1
const newTokenAmount = 0.001
const spendingLimitBalance = '(0.17 ETH)'

describe('Spending limits tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.visit(constants.setupUrl + staticSafes.SEP_STATIC_SAFE_8)
    cy.clearLocalStorage()
    main.acceptCookies()
    cy.get(spendinglimit.spendingLimitsSection).should('be.visible')
  })

  it('Verify that the Review step shows beneficiary, amount allowed, reset time', () => {
    //Assume that default reset time is set to One time
    wallet.connectSigner(signer)
    spendinglimit.clickOnNewSpendingLimitBtn()
    spendinglimit.enterBeneficiaryAddress(staticSafes.SEP_STATIC_SAFE_6)
    spendinglimit.enterSpendingLimitAmount(0.1)
    spendinglimit.clickOnNextBtn()
    spendinglimit.checkReviewData(
      tokenAmount,
      staticSafes.SEP_STATIC_SAFE_6,
      spendinglimit.timePeriodOptions.oneTime.split(' ').join('-'),
    )
  })

  it('Verify values and trash icons are displayed in Beneficiary table', () => {
    spendinglimit.verifyBeneficiaryTable()
  })

  it('Verify Spending limit option is available when selecting the corresponding token', () => {
    wallet.connectSigner(signer)
    navigation.clickOnNewTxBtn()
    tx.clickOnSendTokensBtn()
    spendinglimit.verifyTxOptionExist([spendinglimit.spendingLimitTxOption])
  })

  it('Verify spending limit option shows available amount', () => {
    wallet.connectSigner(signer)
    navigation.clickOnNewTxBtn()
    tx.clickOnSendTokensBtn()
    spendinglimit.verifySpendingOptionShowsBalance([spendingLimitBalance])
  })

  it('Verify when owner is a delegate, standard tx and spending limit tx are present', () => {
    wallet.connectSigner(signer)
    navigation.clickOnNewTxBtn()
    tx.clickOnSendTokensBtn()
    spendinglimit.verifyTxOptionExist([spendinglimit.spendingLimitTxOption, spendinglimit.standardTx])
  })

  it('Verify when spending limit is selected the nonce field is removed', () => {
    wallet.connectSigner(signer)
    navigation.clickOnNewTxBtn()
    tx.clickOnSendTokensBtn()
    spendinglimit.selectSpendingLimitOption()
    spendinglimit.verifyNonceState(constants.elementExistanceStates.not_exist)
  })

  it('Verify "Max" button value set to be no more than the allowed amount', () => {
    wallet.connectSigner(signer)
    navigation.clickOnNewTxBtn()
    tx.clickOnSendTokensBtn()
    spendinglimit.clickOnMaxBtn()
    spendinglimit.checkMaxValue()
  })

  it('Verify selecting a native token from the dropdown in new tx', () => {
    wallet.connectSigner(signer)
    navigation.clickOnNewTxBtn()
    tx.clickOnSendTokensBtn()
    spendinglimit.selectToken(constants.tokenNames.sepoliaEther)
  })

  it('Verify that when replacing spending limit for the same owner, previous values are displayed in red', () => {
    wallet.connectSigner(signer)
    spendinglimit.clickOnNewSpendingLimitBtn()
    spendinglimit.enterBeneficiaryAddress(constants.DEFAULT_OWNER_ADDRESS)
    spendinglimit.enterSpendingLimitAmount(newTokenAmount)
    spendinglimit.clickOnTimePeriodDropdown()
    spendinglimit.selectTimePeriod(spendinglimit.timePeriodOptions.fiveMin)
    tx.clickOnNextBtn()
    spendinglimit.verifyOldValuesAreDisplayed()
  })

  it('Verify that when editing spending limit for owner who used some of it, relevant actions are displayed', () => {
    wallet.connectSigner(signer)
    spendinglimit.clickOnNewSpendingLimitBtn()
    spendinglimit.enterBeneficiaryAddress(constants.SPENDING_LIMIT_ADDRESS_2)
    spendinglimit.enterSpendingLimitAmount(newTokenAmount)
    spendinglimit.clickOnTimePeriodDropdown()
    spendinglimit.selectTimePeriod(spendinglimit.timePeriodOptions.oneTime)
    tx.clickOnNextBtn()
    spendinglimit.verifyActionNamesAreDisplayed([
      constants.TXActionNames.resetAllowance,
      constants.TXActionNames.setAllowance,
    ])
  })

  it('Verify that when multiple assets are available, they are displayed in token dropdown', () => {
    cy.wrap(null)
      .then(() => main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__settings, ls.safeSettings.slimitSettings))
      .then(() =>
        main.isItemInLocalstorage(constants.localStorageKeys.SAFE_v2__settings, ls.safeSettings.slimitSettings),
      )
      .then(() => {
        cy.reload()
        wallet.connectSigner(signer)
        navigation.clickOnNewTxBtn()
        tx.clickOnSendTokensBtn()
        spendinglimit.clickOnTokenDropdown()
        spendinglimit.verifyMandatoryTokensExist()
      })
  })

  it('Verify that beneficiary can be retried from address book', () => {
    cy.wrap(null)
      .then(() =>
        main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress2),
      )
      .then(() =>
        main.isItemInLocalstorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress2),
      )
      .then(() => {
        cy.reload()
        wallet.connectSigner(signer)
        spendinglimit.clickOnNewSpendingLimitBtn()
        spendinglimit.enterBeneficiaryAddress(constants.DEFAULT_OWNER_ADDRESS.substring(30))
        spendinglimit.selectRecipient(constants.DEFAULT_OWNER_ADDRESS)
      })
  })

  it.skip('Verify that clicking on copy icon of a beneficiary works', () => {
    tx.verifyNumberOfCopyIcons(3)
    tx.verifyCopyIconWorks(0, constants.DEFAULT_OWNER_ADDRESS)
  })

  it('Verify explorer links contain Sepolia link', () => {
    tx.verifyNumberOfExternalLinks(3)
  })
})
