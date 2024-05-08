import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as createtx from '../../e2e/pages/create_tx.pages'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let staticSafes = []

const sendValue = 0.00002
const currentNonce = 5

function happyPathToStepTwo() {
  createtx.typeRecipientAddress(constants.EOA)
  createtx.clickOnTokenselectorAndSelectSepoliaEth()
  createtx.setSendValue(sendValue)
  createtx.clickOnNextBtn()
}

describe('[SMOKE] Create transactions tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.BALANCE_URL + staticSafes.SEP_STATIC_SAFE_10)
    main.acceptCookies()
    createtx.clickOnNewtransactionBtn()
    createtx.clickOnSendTokensBtn()
  })

  it('[SMOKE] Verify error messages for invalid address input', () => {
    createtx.verifyRandomStringAddress('Lorem Ipsum')
    createtx.verifyWrongChecksum(constants.WRONGLY_CHECKSUMMED_ADDRESS)
  })

  it('[SMOKE] Verify address input resolves a valid ENS name', () => {
    createtx.typeRecipientAddress(constants.ENS_TEST_SEPOLIA)
    createtx.verifyENSResolves(staticSafes.SEP_STATIC_SAFE_6)
  })

  it('[SMOKE] Verify error message for invalid amount input', () => {
    createtx.clickOnTokenselectorAndSelectSepoliaEth()
    createtx.verifyAmountLargerThanCurrentBalance()
  })

  it('[SMOKE] Verify MaxAmount button', () => {
    createtx.setMaxAmount()
    createtx.verifyMaxAmount(constants.tokenNames.sepoliaEther, constants.tokenAbbreviation.sep)
  })

  it('[SMOKE] Verify nonce tooltip warning messages', () => {
    createtx.changeNonce(0)
    createtx.verifyTooltipMessage(constants.nonceTooltipMsg.lowerThanCurrent + currentNonce.toString())
    createtx.changeNonce(currentNonce + 53)
    createtx.verifyTooltipMessage(constants.nonceTooltipMsg.higherThanRecommended)
    createtx.changeNonce(currentNonce + 150)
    createtx.verifyTooltipMessage(constants.nonceTooltipMsg.muchHigherThanRecommended)
  })

  it.skip('[SMOKE] Verify advance parameters gas limit input', () => {
    happyPathToStepTwo()
    createtx.changeNonce(currentNonce)
    createtx.selectCurrentWallet()
    createtx.openExecutionParamsModal()
    createtx.verifyAndSubmitExecutionParams()
  })

  it.skip('[SMOKE] Verify a transaction shows relayer and addToBatch button', () => {
    happyPathToStepTwo()
    createtx.verifySubmitBtnIsEnabled()
    createtx.verifyNativeTokenTransfer()
    createtx.changeNonce(currentNonce)
    createtx.verifyConfirmTransactionData()
    createtx.verifyRelayerAttemptsAvailable()
    createtx.selectCurrentWallet()
    createtx.clickOnNoLaterOption()
    createtx.verifyAddToBatchBtnIsEnabled()
  })
})
