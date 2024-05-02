import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createTx from '../pages/create_tx.pages'
import * as data from '../../fixtures/txhistory_data_data.json'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let staticSafes = []

const typeOnchainRejection = data.type.onchainRejection
const typeBatch = data.type.batchNativeTransfer
const typeAddOwner = data.type.addOwner
const typeChangeOwner = data.type.swapOwner
const typeRemoveOwner = data.type.removeOwner
const typeDisableOwner = data.type.disableModule
const typeChangeThreshold = data.type.changeThreshold
const typeSideActions = data.type.sideActions
const typeGeneral = data.type.general
const typeUntrustedToken = data.type.untrustedReceivedToken

describe('Tx history tests 2', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.transactionsHistoryUrl + staticSafes.SEP_STATIC_SAFE_7)
    main.acceptCookies()
  })

  it('Verify number of transactions is correct', () => {
    createTx.verifyNumberOfTransactions(20)
  })

  // On-chain rejection
  it('Verify exapanded details for on-chain rejection', () => {
    createTx.clickOnTransactionItemByName(typeOnchainRejection.title)
    createTx.verifyExpandedDetails([
      typeOnchainRejection.description,
      typeOnchainRejection.transactionHash,
      typeOnchainRejection.safeTxHash,
    ])
    createTx.verifyActionListExists([
      typeSideActions.rejectionCreated,
      typeSideActions.confirmations,
      typeSideActions.executedBy,
    ])
  })

  // Batch transaction
  it('Verify exapanded details for batch', () => {
    createTx.clickOnTransactionItemByName(typeBatch.title, typeBatch.summaryTxInfo)
    createTx.verifyExpandedDetails(
      [
        typeBatch.description,
        typeBatch.contractTitle,
        typeBatch.contractAddress,
        typeBatch.transactionHash,
        typeBatch.safeTxHash,
      ],
      createTx.delegateCallWarning,
    )
    createTx.verifyActions([typeBatch.nativeTransfer.title])
  })

  // Add owner
  it('Verify summary for adding owner', () => {
    createTx.verifySummaryByName(typeAddOwner.title, [typeGeneral.statusOk], typeAddOwner.altImage)
  })

  it('Verify exapanded details for adding owner', () => {
    createTx.clickOnTransactionItemByName(typeAddOwner.title)
    createTx.verifyExpandedDetails(
      [
        typeAddOwner.description,
        typeAddOwner.requiredConfirmationsTitle,
        typeAddOwner.ownerAddress,
        typeAddOwner.transactionHash,
        typeAddOwner.safeTxHash,
      ],
      createTx.policyChangeWarning,
    )
  })

  // Change owner
  it('Verify summary for changing owner', () => {
    createTx.verifySummaryByName(typeChangeOwner.title, [typeGeneral.statusOk], typeChangeOwner.altImage)
  })

  it('Verify exapanded details for changing owner', () => {
    createTx.clickOnTransactionItemByName(typeChangeOwner.title)
    createTx.verifyExpandedDetails([
      typeChangeOwner.description,
      typeChangeOwner.newOwner.actionTitile,
      typeChangeOwner.newOwner.ownerAddress,
      typeChangeOwner.oldOwner.actionTitile,
      typeChangeOwner.oldOwner.ownerAddress,

      typeChangeOwner.transactionHash,
      typeChangeOwner.safeTxHash,
    ])
  })

  // Remove owner
  it('Verify summary for removing owner', () => {
    createTx.verifySummaryByName(typeRemoveOwner.title, [typeGeneral.statusOk], typeRemoveOwner.altImage)
  })

  it('Verify exapanded details for removing owner', () => {
    createTx.clickOnTransactionItemByName(typeRemoveOwner.title)
    createTx.verifyExpandedDetails(
      [
        typeRemoveOwner.description,
        typeRemoveOwner.requiredConfirmationsTitle,
        typeRemoveOwner.ownerAddress,
        typeRemoveOwner.transactionHash,
        typeRemoveOwner.safeTxHash,
      ],
      createTx.policyChangeWarning,
    )
    createTx.checkRequiredThreshold(1)
  })

  // Disbale module
  it('Verify summary for disable module', () => {
    createTx.verifySummaryByName(typeDisableOwner.title, [typeGeneral.statusOk], typeDisableOwner.altImage)
  })

  it('Verify exapanded details for disable module', () => {
    createTx.clickOnTransactionItemByName(typeDisableOwner.title)
    createTx.verifyExpandedDetails([
      typeDisableOwner.description,
      typeDisableOwner.address,
      typeDisableOwner.transactionHash,
      typeDisableOwner.safeTxHash,
    ])
  })

  // Change threshold
  it('Verify summary for changing threshold', () => {
    createTx.verifySummaryByName(
      typeChangeThreshold.title,
      [typeChangeThreshold.summaryTxInfo, typeGeneral.statusOk],
      typeChangeThreshold.altImage,
    )
  })

  it('Verify exapanded details for changing threshold', () => {
    createTx.clickOnTransactionItemByName(typeChangeThreshold.title)
    createTx.verifyExpandedDetails(
      [
        typeChangeThreshold.requiredConfirmationsTitle,
        typeChangeThreshold.transactionHash,
        typeChangeThreshold.safeTxHash,
      ],
      createTx.policyChangeWarning,
    )
    createTx.checkRequiredThreshold(2)
  })

  it('Verify that sender address of untrusted token will not be copied until agreed in warning popup', () => {
    createTx.clickOnTransactionItemByName(typeUntrustedToken.summaryTitle, typeUntrustedToken.summaryTxInfo)
    createTx.verifyAddressNotCopied(0, typeUntrustedToken.senderAddress)
  })
})
