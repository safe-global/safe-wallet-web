import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createTx from '../pages/create_tx.pages'
import * as data from '../../fixtures/txhistory_data_data.json'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let staticSafes = []

const typeCreateAccount = data.type.accountCreation
const typeReceive = data.type.receive
const typeSend = data.type.send
const typeSpendingLimits = data.type.spendingLimits
const typeDeleteAllowance = data.type.deleteSpendingLimit
const typeSideActions = data.type.sideActions
const typeGeneral = data.type.general

describe('Tx history tests 1', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.transactionsHistoryUrl + staticSafes.SEP_STATIC_SAFE_7)
    main.acceptCookies()
  })

  // Account creation
  it('Verify summary for account creation', () => {
    createTx.verifySummaryByName(
      typeCreateAccount.title,
      [typeCreateAccount.actionsSummary, typeGeneral.statusOk],
      typeCreateAccount.altTmage,
    )
  })

  it('Verify exapanded details for account creation', () => {
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

  it.skip('Verify copy bottons work as expected for account creation', () => {
    createTx.clickOnTransactionItemByName(typeCreateAccount.title)
    createTx.verifyNumberOfCopyIcons(4)
    createTx.verifyCopyIconWorks(0, typeCreateAccount.creator.address)
  })

  it('Verify external links exist for account creation', () => {
    createTx.clickOnTransactionItemByName(typeCreateAccount.title)
    createTx.verifyNumberOfExternalLinks(4)
  })

  // Token receipt
  it.skip('Verify copy button copies tx hash', () => {
    createTx.clickOnTransactionItemByName(typeReceive.summaryTitle, typeReceive.summaryTxInfo)
    createTx.verifyNumberOfCopyIcons(2)
    createTx.verifyCopyIconWorks(1, typeReceive.transactionHashCopied)
  })

  // Token send
  it('Verify exapanded details for token send', () => {
    createTx.clickOnTransactionItemByName(typeSend.title, typeSend.summaryTxInfo)
    createTx.verifyExpandedDetails([typeSend.sentTo, typeSend.recipientAddress, typeSend.transactionHash])
    createTx.verifyActionListExists([
      typeSideActions.created,
      typeSideActions.confirmations,
      typeSideActions.executedBy,
    ])
  })

  // Spending limits
  it('Verify summary for setting spend limits', () => {
    createTx.verifySummaryByName(
      typeSpendingLimits.title,
      typeSpendingLimits.summaryTxInfo,
      [typeGeneral.statusOk],
      typeSpendingLimits.altTmage,
    )
  })

  it('Verify exapanded details for initial spending limits setup', () => {
    createTx.clickOnTransactionItemByName(typeSpendingLimits.title, typeSpendingLimits.summaryTxInfo)
    createTx.verifyExpandedDetails(
      [
        typeSpendingLimits.title,
        typeSpendingLimits.description,
        typeSpendingLimits.transactionHash,
        typeSpendingLimits.safeTxHash,
      ],
      createTx.delegateCallWarning,
    )
  })

  it('Verify that 3 actions exist in initial spending limits setup', () => {
    createTx.clickOnTransactionItemByName(typeSpendingLimits.title, typeSpendingLimits.summaryTxInfo)
    createTx.verifyActions([
      typeSpendingLimits.enableModule.title,
      typeSpendingLimits.addDelegate.title,
      typeSpendingLimits.setAllowance.title,
    ])
  })

  it('Verify that all 3 actions can be expanded and collapsed in initial spending limits setup', () => {
    createTx.clickOnTransactionItemByName(typeSpendingLimits.title, typeSpendingLimits.summaryTxInfo)
    createTx.expandAllActions([
      typeSpendingLimits.enableModule.title,
      typeSpendingLimits.addDelegate.title,
      typeSpendingLimits.setAllowance.title,
    ])
    createTx.collapseAllActions([
      typeSpendingLimits.enableModule.moduleAddressTitle,
      typeSpendingLimits.addDelegate.delegateAddressTitle,
      typeSpendingLimits.setAllowance.delegateAddressTitle,
    ])
  })

  it('Verify that addDelegate action can be expanded and collapsed in spending limits', () => {
    createTx.clickOnTransactionItemByName(typeSpendingLimits.title, typeSpendingLimits.summaryTxInfo)
    createTx.clickOnExpandableAction(typeSpendingLimits.addDelegate.title)
    createTx.verifyActions([typeSpendingLimits.addDelegate.delegateAddressTitle])
    createTx.collapseAllActions([typeSpendingLimits.addDelegate.delegateAddressTitle])
  })

  // Spending limit deletion
  it('Verify exapanded details for allowance deletion', () => {
    createTx.clickOnTransactionItemByName(typeDeleteAllowance.title, typeDeleteAllowance.summaryTxInfo)
    createTx.verifyExpandedDetails([
      typeDeleteAllowance.description,
      typeDeleteAllowance.beneficiary,
      typeDeleteAllowance.beneficiaryAddress,
      typeDeleteAllowance.transactionHash,
      typeDeleteAllowance.safeTxHash,
      typeDeleteAllowance.token,
      typeDeleteAllowance.tokenName,
    ])
  })

  it('Verify advanced details displayed in exapanded details for allowance deletion', () => {
    createTx.clickOnTransactionItemByName(typeDeleteAllowance.title, typeDeleteAllowance.summaryTxInfo)
    createTx.expandAdvancedDetails([typeDeleteAllowance.baseGas])
    createTx.collapseAdvancedDetails([typeDeleteAllowance.baseGas])
  })
})
