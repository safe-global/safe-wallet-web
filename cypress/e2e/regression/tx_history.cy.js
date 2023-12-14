import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createTx from '../pages/create_tx.pages'
import * as data from '../../fixtures/txhistory_data_data.json'

const txItemIndex = 22
const initialSpendingLimitsTx = 20
const spendingLimitTx = 15

const typeCreateAccount = data.type.accountCreation
const typeReceive = data.type.receive
const typeSend = data.type.send
const typeSpendingLimits = data.type.spendingLimits
const typeDeleteAllowance = data.type.deleteSpendingLimit
const typeSideActions = data.type.sideActions
const typeGeneral = data.type.general

describe('Tx history tests 1', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.transactionsHistoryUrl + constants.SEPOLIA_TEST_SAFE_8)
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

  it('Verify copy bottons work as expected for account creation', () => {
    createTx.clickOnTransactionItemByName(typeCreateAccount.title)
    createTx.verifyNumberOfCopyIcons(4)
    createTx.verifyCopyIconWorks(0, typeCreateAccount.creator.address)
  })

  it('Verify external links exist for account creation', () => {
    createTx.clickOnTransactionItemByName(typeCreateAccount.title)
    createTx.verifyNumberOfExternalLinks(4)
  })

  // Token receipt
  it('Verify summary for token receipt', () => {
    createTx.verifySummaryByIndex(
      txItemIndex,
      [typeReceive.title, typeReceive.summaryTxInfo, typeGeneral.statusOk],
      typeReceive.altImage,
      typeReceive.altToken,
    )
  })

  it('Verify exapanded details for token receipt', () => {
    createTx.clickOnTransactionItemByIndex(txItemIndex)
    createTx.verifyExpandedDetails([
      typeReceive.title,
      typeReceive.receivedFrom,
      typeReceive.senderAddress,
      typeReceive.transactionHash,
    ])
  })

  it('Verify copy button copies tx hash', () => {
    createTx.clickOnTransactionItemByIndex(txItemIndex)
    createTx.verifyNumberOfCopyIcons(2)
    createTx.verifyCopyIconWorks(1, typeReceive.transactionHashCopied)
  })

  // Token send
  it('Verify summary for token send', () => {
    createTx.verifySummaryByName(
      typeSend.title,
      [typeSend.summaryTxInfo, typeGeneral.statusOk],
      typeSend.altImage,
      typeSend.altToken,
    )
  })

  it('Verify exapanded details for token send', () => {
    createTx.clickOnTransactionItemByName(typeSend.title)
    createTx.verifyExpandedDetails([typeSend.sentTo, typeSend.recipientAddress, typeSend.transactionHash])
    createTx.verifyActionListExists([
      typeSideActions.created,
      typeSideActions.confirmations,
      typeSideActions.executedBy,
    ])
  })

  // Spending limits
  it('Verify summary for setting spend limits', () => {
    createTx.verifySummaryByIndex(
      initialSpendingLimitsTx,
      [typeSpendingLimits.title, typeSpendingLimits.summaryTxInfo, typeGeneral.statusOk],
      typeSpendingLimits.altImage,
    )
  })

  it('Verify exapanded details for initial spending limits setup', () => {
    createTx.clickOnTransactionItemByIndex(initialSpendingLimitsTx)
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
    createTx.clickOnTransactionItemByIndex(initialSpendingLimitsTx)
    createTx.verifyActions([
      typeSpendingLimits.enableModule.title,
      typeSpendingLimits.addDelegate.title,
      typeSpendingLimits.setAllowance.title,
    ])
  })

  it('Verify that all 3 actions can be expanded and collapsed in initial spending limits setup', () => {
    createTx.clickOnTransactionItemByIndex(initialSpendingLimitsTx)
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
    createTx.clickOnTransactionItemByIndex(spendingLimitTx)
    createTx.clickOnExpandableAction(typeSpendingLimits.addDelegate.title)
    createTx.verifyActions([typeSpendingLimits.addDelegate.delegateAddressTitle])
    createTx.collapseAllActions([typeSpendingLimits.addDelegate.delegateAddressTitle])
  })

  // Spending limit deletion
  it('Verify summary for allowance deletion', () => {
    createTx.verifySummaryByName(
      typeDeleteAllowance.title,
      [typeDeleteAllowance.summaryTxInfo, typeGeneral.statusOk],
      typeDeleteAllowance.altImage,
    )
  })

  it('Verify exapanded details for allowance deletion', () => {
    createTx.clickOnTransactionItemByName(typeDeleteAllowance.title)
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
    createTx.clickOnTransactionItemByName(typeDeleteAllowance.title)
    createTx.expandAdvancedDetails([typeDeleteAllowance.baseGas])
    createTx.collapseAdvancedDetails([typeDeleteAllowance.baseGas])
  })
})
