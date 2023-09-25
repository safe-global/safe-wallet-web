import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createTx from '../pages/create_tx.pages'

const INCOMING = 'Received'
const OUTGOING = 'Sent'
const CONTRACT_INTERACTION = 'Contract interaction'

const str1 = 'True'
const str2 = '1337'
const str3 = '5688'

describe('Transaction history', () => {
  before(() => {
    cy.clearLocalStorage()
    // Go to the test Safe transaction history
    cy.visit(constants.transactionsHistoryUrl + constants.GOERLI_TEST_SAFE)
    main.acceptCookies()
  })

  it('should display October 9th transactions', () => {
    const DATE = 'Oct 9, 2022'
    const NEXT_DATE_LABEL = 'Feb 8, 2022'
    const amount = '0.25 GOR'
    const amount2 = '0.11 WETH'
    const amount3 = '120,497.61 DAI'
    const time = '4:56 PM'
    const time2 = '4:59 PM'
    const time3 = '5:00 PM'
    const time4 = '5:01 PM'
    const success = 'Success'

    createTx.verifyDateExists(DATE)
    createTx.verifyDateExists(NEXT_DATE_LABEL)

    // Transaction summaries from October 9th
    const rows = cy.contains('div', DATE).nextUntil(`div:contains(${NEXT_DATE_LABEL})`)

    rows.should('have.length', 19)

    rows
      // Receive 0.25 GOR
      .last()
      .within(() => {
        // Type
        createTx.verifyImageAltTxt(0, INCOMING)
        createTx.verifyStatus(constants.transactionStatus.received)

        // Info
        createTx.verifyImageAltTxt(1, constants.tokenAbbreviation.gor)
        createTx.verifyTransactionStrExists(amount)
        createTx.verifyTransactionStrExists(time)
        createTx.verifyTransactionStrExists(success)
      })
      // CowSwap deposit of Wrapped Ether
      .prev()
      .within(() => {
        createTx.verifyTransactionStrExists('0')
        // TODO: update next line after fixing the logo
        // cy.find('img').should('have.attr', 'src').should('include', WRAPPED_ETH)
        createTx.verifyTransactionStrExists(constants.tokenNames.wrappedEther)
        createTx.verifyTransactionStrExists(constants.transactionStatus.deposit)
        createTx.verifyTransactionStrExists(time2)
        createTx.verifyTransactionStrExists(constants.transactionStatus.success)
      })
      // CowSwap approval of Wrapped Ether
      .prev()
      .within(() => {
        createTx.verifyTransactionStrExists('1')
        // Type
        // TODO: update next line after fixing the logo
        // cy.find('img').should('have.attr', 'src').should('include', WRAPPED_ETH)
        createTx.verifyTransactionStrExists(constants.transactionStatus.approve)
        createTx.verifyTransactionStrExists(time3)
        createTx.verifyTransactionStrExists(constants.transactionStatus.success)
      })
      // Contract interaction
      .prev()
      .within(() => {
        createTx.verifyTransactionStrExists('2')
        createTx.verifyTransactionStrExists(constants.transactionStatus.interaction)
        createTx.verifyTransactionStrExists(time4)
        createTx.verifyTransactionStrExists(constants.transactionStatus.success)
      })
      // Send 0.11 WETH
      .prev()
      .within(() => {
        createTx.verifyImageAltTxt(0, OUTGOING)
        createTx.verifyTransactionStrExists(constants.transactionStatus.sent)
        createTx.verifyTransactionStrExists(amount2)
        createTx.verifyTransactionStrExists(time4)
        createTx.verifyTransactionStrExists(constants.transactionStatus.success)
      })
      // Receive 120 DAI
      .prev()
      .within(() => {
        createTx.verifyTransactionStrExists(constants.transactionStatus.received)
        createTx.verifyTransactionStrExists(amount3)
        createTx.verifyTransactionStrExists(time4)
        createTx.verifyTransactionStrExists(constants.transactionStatus.success)
      })
  })

  it('should expand/collapse all actions', () => {
    createTx.clickOnTransactionExpandableItem('Mar 24, 2023', () => {
      createTx.verifyTransactionStrNotVible(str1)
      createTx.verifyTransactionStrNotVible(str2)
      createTx.verifyTransactionStrNotVible(str3)
      createTx.clickOnExpandAllBtn()
      createTx.verifyTransactionStrExists(str1)
      createTx.verifyTransactionStrExists(str2)
      createTx.verifyTransactionStrExists(str3)
      createTx.clickOnCollapseAllBtn()
      createTx.verifyTransactionStrNotVible(str1)
      createTx.verifyTransactionStrNotVible(str2)
      createTx.verifyTransactionStrNotVible(str3)
    })
  })
})
