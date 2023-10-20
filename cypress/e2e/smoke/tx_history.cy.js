import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createTx from '../pages/create_tx.pages'

const INCOMING = 'Received'
const OUTGOING = 'Sent'
const CONTRACT_INTERACTION = 'Contract interaction'

const str1 = 'Received'
const str2 = 'Executed'
const str3 = 'Transaction hash'

describe('Transaction history tests', () => {
  before(() => {
    cy.clearLocalStorage()
    // Go to the test Safe transaction history
    cy.visit(constants.transactionsHistoryUrl + constants.SEPOLIA_TEST_SAFE_5)
    main.acceptCookies()
  })

  it('Verify October 9th transactions are displayed [C56128]', () => {
    const DATE = 'Oct 9, 2023'
    const NEXT_DATE_LABEL = 'Oct 11, 2023'
    const amount = '0.1 ETH'
    const amount2 = '15 TT_A'
    const amount3 = '21 TT_B'
    const amount4 = '82 DAI'
    const amount5 = '73 USDC'
    const amount6 = '27 AAVE'
    const amount7 = '35.94 LINK'
    const amount8 = '< 0.00001 ETH'
    const time = '2:56 AM'
    const time2 = '12:59 AM'
    const time3 = '1:00 AM'
    const time4 = '1:01 AM'
    const success = 'Success'

    createTx.verifyDateExists(DATE)
    createTx.verifyDateExists(NEXT_DATE_LABEL)

    // Transaction summaries from October 9th
    const rows = cy.contains('div', DATE).nextUntil(`div:contains(${NEXT_DATE_LABEL})`)

    rows.should('have.length', 9)

    rows
      .last()
      .prev()
      .within(() => {
        // Type
        createTx.verifyImageAltTxt(0, INCOMING)
        createTx.verifyStatus(constants.transactionStatus.received)

        // Info
        createTx.verifyImageAltTxt(1, constants.tokenAbbreviation.sep)
        createTx.verifyTransactionStrExists(amount)
        createTx.verifyTransactionStrExists(time)
        createTx.verifyTransactionStrExists(success)
      })
      .prev()
      .within(() => {
        createTx.verifyImageAltTxt(0, INCOMING)
        createTx.verifyStatus(constants.transactionStatus.received)
        createTx.verifyImageAltTxt(1, constants.tokenAbbreviation.tta)
        createTx.verifyTransactionStrExists(amount2)
        createTx.verifyTransactionStrExists(time2)
        createTx.verifyTransactionStrExists(success)
      })
      .prev()
      .within(() => {
        createTx.verifyImageAltTxt(0, INCOMING)
        createTx.verifyStatus(constants.transactionStatus.received)
        createTx.verifyImageAltTxt(1, constants.tokenAbbreviation.ttb)
        createTx.verifyTransactionStrExists(amount3)
        createTx.verifyTransactionStrExists(time2)
        createTx.verifyTransactionStrExists(success)
      })
      .prev()
      .within(() => {
        createTx.verifyImageAltTxt(0, INCOMING)
        createTx.verifyStatus(constants.transactionStatus.received)
        createTx.verifyImageAltTxt(1, constants.tokenAbbreviation.dai)
        createTx.verifyTransactionStrExists(amount4)
        createTx.verifyTransactionStrExists(time2)
        createTx.verifyTransactionStrExists(success)
      })
      .prev()
      .within(() => {
        createTx.verifyImageAltTxt(0, INCOMING)
        createTx.verifyStatus(constants.transactionStatus.received)
        createTx.verifyImageAltTxt(1, constants.tokenAbbreviation.usds)
        createTx.verifyTransactionStrExists(amount5)
        createTx.verifyTransactionStrExists(time3)
        createTx.verifyTransactionStrExists(success)
      })
      .prev()
      .within(() => {
        createTx.verifyImageAltTxt(0, INCOMING)
        createTx.verifyStatus(constants.transactionStatus.received)
        createTx.verifyImageAltTxt(1, constants.tokenAbbreviation.aave)
        createTx.verifyTransactionStrExists(amount6)
        createTx.verifyTransactionStrExists(time3)
        createTx.verifyTransactionStrExists(success)
      })
      .prev()
      .within(() => {
        createTx.verifyImageAltTxt(0, INCOMING)
        createTx.verifyStatus(constants.transactionStatus.received)
        createTx.verifyImageAltTxt(1, constants.tokenAbbreviation.link)
        createTx.verifyTransactionStrExists(amount7)
        createTx.verifyTransactionStrExists(time3)
        createTx.verifyTransactionStrExists(success)
      })
      .prev()
      .within(() => {
        createTx.verifyImageAltTxt(0, INCOMING)
        createTx.verifyStatus(constants.transactionStatus.received)
        createTx.verifyImageAltTxt(1, constants.tokenAbbreviation.sep)
        createTx.verifyTransactionStrExists(amount8)
        createTx.verifyTransactionStrExists(time4)
        createTx.verifyTransactionStrExists(success)
      })
  })

  it('Verify transaction can be expanded/collapsed [C56129]', () => {
    createTx.clickOnTransactionExpandableItem('Oct 9, 2023', () => {
      createTx.verifyTransactionStrExists(str1)
      createTx.verifyTransactionStrExists(str2)
      createTx.verifyTransactionStrExists(str3)
      createTx.clickOnExpandIcon()
    })
  })
})
