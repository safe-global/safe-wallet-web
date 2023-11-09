import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as createtx from '../../e2e/pages/create_tx.pages'

const sendValue = 0.00002
const currentNonce = 11

describe('Create transactions tests', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.BALANCE_URL + constants.SEPOLIA_TEST_SAFE_5)
    main.acceptCookies()
  })

  it('Verify a new send token transaction can be created [C56104]', () => {
    createtx.clickOnNewtransactionBtn()
    createtx.clickOnSendTokensBtn()
    createtx.typeRecipientAddress(constants.EOA)
    createtx.clickOnTokenselectorAndSelectSepolia()
    createtx.setMaxAmount()
    createtx.verifyMaxAmount(constants.tokenNames.sepoliaEther, constants.tokenAbbreviation.sep)
    createtx.setSendValue(sendValue)
    createtx.clickOnNextBtn()
  })

  it('Verify a transaction can be reviewed, edited and submitted [C56105]', () => {
    createtx.verifySubmitBtnIsEnabled()
    cy.wait(1000)
    createtx.verifyNativeTokenTransfer()
    createtx.changeNonce(currentNonce)
    createtx.verifyConfirmTransactionData()
    createtx.openExecutionParamsModal()
    createtx.verifyAndSubmitExecutionParams()
    createtx.clickOnNoLaterOption()
    createtx.changeNonce(13)
    createtx.clickOnSignTransactionBtn()
  })

  it('Verify that clicking on notification shows the transaction in queue [C56106]', () => {
    createtx.waitForProposeRequest()
    createtx.clickViewTransaction()
    createtx.verifySingleTxPage()
    createtx.verifyQueueLabel()
    createtx.verifyTransactionSummary(sendValue)
  })
})
