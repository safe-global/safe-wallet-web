import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createtx from '../pages/create_tx.pages'

const INCOMING = 'Received'
const OUTGOING = 'Sent'
const CONTRACT_INTERACTION = 'Contract interaction'

const str1 = 'True'
const str2 = '1337'
const str3 = '5688'

describe('Transaction history', () => {
  before(() => {
    // Go to the test Safe transaction history
    cy.visit(constants.transactionsHistoryUrl + constants.GOERLI_TEST_SAFE)
    main.acceptCookies()
  })

  it('should display October 9th transactions', () => {
    const DATE = 'Oct 9, 2022'
    const NEXT_DATE_LABEL = 'Feb 8, 2022'
    const amount = '0.25 GOR'
    const amount2 = '-0.11 WETH'
    const amount3 = '120,497.61 DAI'
    const time = '4:56 PM'
    const time2 = '4:59 PM'
    const time3 = '5:00 PM'
    const time4 = '5:01 PM'
    const success = 'Success'

    createtx.verifyDateExists(DATE)
    createtx.verifyDateExists(NEXT_DATE_LABEL)

    // Transaction summaries from October 9th
    const rows = cy.contains('div', DATE).nextUntil(`div:contains(${NEXT_DATE_LABEL})`)

    rows.should('have.length', 19)

    rows
      // Receive 0.25 GOR
      .last()
      .within(() => {
        // Type
        createtx.verifyImageAlttxt(0, INCOMING)
        createtx.verifyStatus(constants.transactionStatus.received)

        // Info
        createtx.verifyImageAlttxt(1, constants.tokenAbbreviation.gor)
        createtx.verifyTransactionStrExists(amount)
        createtx.verifyTransactionStrExists(time)
        createtx.verifyTransactionStrExists(success)
      })
      // CowSwap deposit of Wrapped Ether
      .prev()
      .within(() => {
        createtx.verifyTransactionStrExists('0')
        // TODO: update next line after fixing the logo
        // cy.find('img').should('have.attr', 'src').should('include', WRAPPED_ETH)
        createtx.verifyTransactionStrExists(constants.tokenNames.wrapped_ether)
        createtx.verifyTransactionStrExists(constants.transactionStatus.deposit)
        createtx.verifyTransactionStrExists(time2)
        createtx.verifyTransactionStrExists(constants.transactionStatus.success)
      })
      // CowSwap approval of Wrapped Ether
      .prev()
      .within(() => {
        createtx.verifyTransactionStrExists('1')
        // Type
        // TODO: update next line after fixing the logo
        // cy.find('img').should('have.attr', 'src').should('include', WRAPPED_ETH)
        createtx.verifyTransactionStrExists(constants.tokenNames.wrapped_ether)
        createtx.verifyTransactionStrExists(constants.transactionStatus.approve)
        createtx.verifyTransactionStrExists(time3)
        createtx.verifyTransactionStrExists(constants.transactionStatus.success)
      })
      // Contract interaction
      .prev()
      .within(() => {
        createtx.verifyTransactionStrExists('2')
        createtx.verifyTransactionStrExists(constants.transactionStatus.interaction)
        createtx.verifyTransactionStrExists(time4)
        createtx.verifyTransactionStrExists(constants.transactionStatus.success)
      })
      // Send 0.11 WETH
      .prev()
      .within(() => {
        createtx.verifyImageAlttxt(0, OUTGOING)
        createtx.verifyTransactionStrExists(constants.transactionStatus.sent)
        createtx.verifyTransactionStrExists(amount2)
        createtx.verifyTransactionStrExists(time4)
        createtx.verifyTransactionStrExists(constants.transactionStatus.success)
      })
      // Receive 120 DAI
      .prev()
      .within(() => {
        createtx.verifyTransactionStrExists(constants.transactionStatus.received)
        createtx.verifyTransactionStrExists(amount3)
        createtx.verifyTransactionStrExists(time4)
        createtx.verifyTransactionStrExists(constants.transactionStatus.success)
      })
  })

  it('should expand/collapse all actions', () => {
    createtx.clickOnTransactionExpandableItem('Mar 24, 2023', () => {
      createtx.verifyTransactionStrNotVible(str1)
      createtx.verifyTransactionStrNotVible(str2)
      createtx.verifyTransactionStrNotVible(str3)
      createtx.lickOnExpandAllBtn()
      createtx.verifyTransactionStrExists(str1)
      createtx.verifyTransactionStrExists(str2)
      createtx.verifyTransactionStrExists(str3)
      createtx.lickOnCollapseAllBtn()
      createtx.verifyTransactionStrNotVible(str1)
      createtx.verifyTransactionStrNotVible(str2)
      createtx.verifyTransactionStrNotVible(str3)
    })
  })
})
