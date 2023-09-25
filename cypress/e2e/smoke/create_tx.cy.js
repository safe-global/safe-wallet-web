import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as createtx from '../../e2e/pages/create_tx.pages'

const sendValue = 0.00002
const currentNonce = 3

describe('Queue a transaction on 1/N', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.homeUrl + constants.TEST_SAFE)
    main.acceptCookies()
  })

  it('should create a new send token transaction', () => {
    createtx.clickOnNewtransactionBtn()
    createtx.clickOnSendTokensBtn()
    createtx.typeRecipientAddress(constants.EOA)
    createtx.clickOnTokenselectorAndSelectGoerli()
    createtx.setMaxAmount()
    createtx.verifyMaxAmount(constants.goerliToken, constants.tokenAbbreviation.gor)
    createtx.setSendValue(sendValue)
    createtx.clickOnNextBtn()
  })

  it('should review, edit and submit the tx', () => {
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

  it('should click on the notification and see the transaction queued', () => {
    createtx.waitForProposeRequest()
    createtx.clickViewTransaction()
    createtx.verifySingleTxPage()
    createtx.verifyQueueLabel()
    createtx.verifyTransactionSummary(sendValue)
  })
})
