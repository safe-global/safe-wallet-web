import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createTx from '../pages/create_tx.pages'

const OUTGOING = 'Sent'

const str1 = 'Received'
const str2 = 'Executed'
const str3 = 'Transaction hash'

describe('Transaction history tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    // Go to the test Safe transaction history
    cy.visit(constants.transactionsHistoryUrl + constants.SEPOLIA_TEST_SAFE_5)

    // So that tests that rely on this feature don't randomly fail
    cy.window().then((win) => win.localStorage.setItem('SAFE_v2__AB_human-readable', true))

    main.acceptCookies(1)
  })

  it('Verify October 29th transactions are displayed', () => {
    const DATE = 'Oct 29, 2023'
    const NEXT_DATE_LABEL = 'Oct 20, 2023'
    const amount = '0.00001 ETH'
    const success = 'Success'

    createTx.verifyDateExists(DATE)
    createTx.verifyDateExists(NEXT_DATE_LABEL)

    const rows = cy.contains('div', DATE).nextUntil(`div:contains(${NEXT_DATE_LABEL})`)

    rows.should('have.length', 10)

    rows.eq(0).within(() => {
      // Type
      createTx.verifyImageAltTxt(0, OUTGOING)
      createTx.verifyStatus(constants.transactionStatus.sent)

      // Info
      createTx.verifyImageAltTxt(1, constants.tokenAbbreviation.sep)
      createTx.verifyTransactionStrExists(amount)
      createTx.verifyTransactionStrExists(success)
    })
  })

  it('Verify transaction can be expanded/collapsed', () => {
    createTx.clickOnTransactionExpandableItem('Oct 20, 2023', () => {
      createTx.verifyTransactionStrExists(str1)
      createTx.verifyTransactionStrExists(str2)
      createTx.verifyTransactionStrExists(str3)
      createTx.clickOnExpandIcon()
    })
  })
})
