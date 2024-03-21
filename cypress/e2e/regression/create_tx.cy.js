import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as createtx from '../../e2e/pages/create_tx.pages'

const sendValue = 0.00002

function happyPathToStepTwo() {
  createtx.typeRecipientAddress(constants.EOA)
  createtx.clickOnTokenselectorAndSelectSepoliaEth()
  createtx.setSendValue(sendValue)
  createtx.clickOnNextBtn()
}

describe('Create transactions tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.BALANCE_URL + constants.SEPOLIA_TEST_SAFE_7)
    main.acceptCookies()
    createtx.clickOnNewtransactionBtn()
    createtx.clickOnSendTokensBtn()
  })

  it('Verify submitting a tx and that clicking on notification shows the transaction in queue', () => {
    happyPathToStepTwo()
    createtx.verifySubmitBtnIsEnabled()
    createtx.changeNonce(14)
    cy.wait(1000)
    createtx.clickOnSignTransactionBtn()
    createtx.waitForProposeRequest()
    createtx.clickViewTransaction()
    createtx.verifySingleTxPage()
    createtx.verifyQueueLabel()
    createtx.verifyTransactionSummary(sendValue)
  })
})
