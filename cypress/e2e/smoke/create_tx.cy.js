import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as createtx from '../../e2e/pages/create_tx.pages'

const sendValue = 0.00002
const currentNonce = 0

function reachStepTwo() {
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

  it('[SMOKE] Verify address input error values', () => {
    createtx.verifyRandomStringAddress('Lorem Ipsum')
    createtx.verifyWrongChecksum(constants.WRONGLY_CHECKSUMMED_ADDRESS)
  })

  it('[SMOKE] Verify address input validates a valid ENS name', () => {
    createtx.typeENSName()
  })

  it('[SMOKE] Verify amount input validates negative numbers', () => {
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
    createtx.changeNonce(999)
    createtx.verifyTooltipMessage(constants.nonceTooltipMsg.higherThanRecommended)
    createtx.changeNonce('abc')
    createtx.verifyTooltipMessage(constants.nonceTooltipMsg.mustBeNumber)
  })

  it.only('[SMOKE] Verify advance parameters gas limit input', () => {
    reachStepTwo()
    createtx.changeNonce(currentNonce)
    createtx.selectCurrentWallet()
    createtx.openExecutionParamsModal()
    createtx.verifyAndSubmitExecutionParams()
  })

  it.only('[SMOKE] Verify a transaction shows relayer and addToBatch button', () => {
    reachStepTwo()
    createtx.verifySubmitBtnIsEnabled()
    createtx.verifyNativeTokenTransfer()
    createtx.changeNonce(currentNonce)
    createtx.verifyConfirmTransactionData()
    createtx.verifyRelayerAttemptsAvailable()
    createtx.selectCurrentWallet()
    createtx.clickOnNoLaterOption()
    createtx.verifyAddToBatchBtnIsEnabled()
  })

  it.only('[SMOKE] Verify submitting a tx and that clicking on notification shows the transaction in queue', () => {
    reachStepTwo()
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
