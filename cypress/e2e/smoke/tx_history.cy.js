import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createTx from '../pages/create_tx.pages'
import * as data from '../../fixtures/txhistory_data_data.json'

const OUTGOING = 'Sent'

const str1 = 'Received'
const str2 = 'Executed'
const str3 = 'Transaction hash'

const typeCreateAccount = data.type.accountCreation
const typeReceive = data.type.receive
const typeGeneral = data.type.general

describe('[SMOKE] Transaction history tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.transactionsHistoryUrl + constants.SEPOLIA_TEST_SAFE_8)
    main.acceptCookies()
  })

  it('[SMOKE] Verify summary for account creation', () => {
    createTx.verifySummary(
      typeCreateAccount.title,
      [typeCreateAccount.actionsSummary, typeGeneral.statusOk],
      typeCreateAccount.altTmage,
    )
  })

  it('[SMOKE] Verify exapnded details for account creation', () => {
    createTx.clickOnTransactionItemByName(typeCreateAccount.title)
    createTx.verifyExpandedDetails([
      typeCreateAccount.creator.actionTitle,
      typeCreateAccount.creator.address,
      typeCreateAccount.factory.actionTitle,
      typeCreateAccount.factory.name,
      typeCreateAccount.factory.address,
      typeCreateAccount.masterCopy.actionTitle,
      typeCreateAccount.masterCopy.name,
      typeCreateAccount.masterCopy.address,
      typeCreateAccount.transactionHash,
    ])
  })

  it('[SMOKE] Verify copy bottons work as expected for account creation', () => {
    createTx.clickOnTransactionItemByName(typeCreateAccount.title)
    createTx.verifyNumberOfCopyIcons(4)
    createTx.verifyCopyIconsWork(3)
  })

  it('[SMOKE] Verify external links exist for account creation', () => {
    createTx.clickOnTransactionItemByName(typeCreateAccount.title)
    createTx.verifyNumberOfExternalLinks(4)
  })

  it.only('[SMOKE] Verify summary for token receipt', () => {
    createTx.verifySummary(typeReceive.title, [typeGeneral.statusOk], typeReceive.altTmage)
  })
})

// it('[SMOKE] Verify October 29th transactions are displayed', () => {
//   const DATE = 'Oct 29, 2023'
//   const NEXT_DATE_LABEL = 'Oct 20, 2023'
//   const amount = '0.00001 ETH'
//   const success = 'Success'

//   createTx.verifyDateExists(DATE)
//   createTx.verifyDateExists(NEXT_DATE_LABEL)

//   const rows = cy.contains('div', DATE).nextUntil(`div:contains(${NEXT_DATE_LABEL})`)

//   rows.should('have.length', 10)

//   rows.eq(0).within(() => {
//     // Type
//     createTx.verifyImageAltTxt(0, OUTGOING)
//     createTx.verifyStatus(constants.transactionStatus.sent)

//     // Info
//     createTx.verifyImageAltTxt(1, constants.tokenAbbreviation.sep)
//     createTx.verifyTransactionStrExists(amount)
//     createTx.verifyTransactionStrExists(success)
//   })
// })
