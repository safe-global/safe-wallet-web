import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as createtx from '../../e2e/pages/create_tx.pages'

const sendValue = 0.00002
const currentNonce = 0

function happyPathToStepTwo() {
  createtx.typeRecipientAddress(constants.EOA)
  createtx.clickOnTokenselectorAndSelectSepoliaEth()
  createtx.setSendValue(sendValue)
  createtx.clickOnNextBtn()
}

describe('[SMOKE] Create transactions tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.BALANCE_URL + constants.SEPOLIA_TEST_SAFE_7)
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
    // createtx.verifyENSResolves(constants.SEPOLIA_TEST_SAFE_7)
  })

  it('[SMOKE] Verify error message for invalid amount input', () => {
    createtx.clickOnTokenselectorAndSelectSepoliaEth()
    createtx.verifyAmountNegativeNumber()
    createtx.verifyAmountLargerThanCurrentBalance()
    createtx.verifyAmountMustBeNumber()
  })

  it('[SMOKE] Verify MaxAmount button', () => {
    createtx.setMaxAmount()
    createtx.verifyMaxAmount(constants.tokenNames.sepoliaEther, constants.tokenAbbreviation.sep)
  })

  it('[SMOKE] Verify nonce tooltip warning messages', () => {
    createtx.changeNonce(-1)
    createtx.verifyTooltipMessage(constants.nonceTooltipMsg.lowerThanCurrent + currentNonce.toString())
    createtx.changeNonce(currentNonce + 50)
    createtx.verifyTooltipMessage(constants.nonceTooltipMsg.higherThanRecommended)
    createtx.changeNonce(currentNonce + 150)
    createtx.verifyTooltipMessage(constants.nonceTooltipMsg.muchHigherThanRecommended)
    createtx.changeNonce('abc')
    createtx.verifyTooltipMessage(constants.nonceTooltipMsg.mustBeNumber)
  })

  it('[SMOKE] Verify advance parameters gas limit input', () => {
    happyPathToStepTwo()
    createtx.changeNonce(currentNonce)
    createtx.selectCurrentWallet()
    createtx.openExecutionParamsModal()
    createtx.verifyAndSubmitExecutionParams()
  })

  it('[SMOKE] Verify a transaction shows relayer and addToBatch button', () => {
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

  it('[SMOKE] Verify submitting a tx and that clicking on notification shows the transaction in queue', () => {
    happyPathToStepTwo()
    createtx.verifySubmitBtnIsEnabled()
    createtx.changeNonce(14)
    createtx.clickOnSignTransactionBtn()
    createtx.waitForProposeRequest()
    createtx.clickViewTransaction()
    createtx.verifySingleTxPage()
    createtx.verifyQueueLabel()
    createtx.verifyTransactionSummary(sendValue)
  })
})
