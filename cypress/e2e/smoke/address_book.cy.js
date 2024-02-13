import 'cypress-file-upload'
import * as constants from '../../support/constants'
import * as addressBook from '../../e2e/pages/address_book.page'
import * as main from '../../e2e/pages/main.page'
import * as ls from '../../support/localstorage_data.js'

const NAME = 'Owner1'
const NAME_2 = 'Owner2'
const EDITED_NAME = 'Edited Owner1'
const duplicateEntry = 'test-sepolia-90'
const owner1 = 'Automation owner'

const recipientData = [owner1, constants.DEFAULT_OWNER_ADDRESS]

describe('[SMOKE] Address book tests', () => {
  beforeEach(() => {
    cy.visit(constants.addressBookUrl + constants.SEPOLIA_TEST_SAFE_1)
    cy.clearLocalStorage()
    main.waitForHistoryCallToComplete()
    main.acceptCookies()
  })

  it('[SMOKE] Verify entry can be added', () => {
    addressBook.clickOnCreateEntryBtn()
    addressBook.addEntry(NAME, constants.RECIPIENT_ADDRESS)
  })

  it('[SMOKE] Verify entry can be deleted', () => {
    main
      .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress1)
      .then(() => {
        main
          .isItemInLocalstorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress1)
          .then(() => {
            cy.reload()
            addressBook.clickDeleteEntryButton()
            addressBook.clickDeleteEntryModalDeleteButton()
            addressBook.verifyEditedNameNotExists(EDITED_NAME)
          })
      })
  })

  it('[SMOKE] Verify csv file can be imported', () => {
    addressBook.clickOnImportFileBtn()
    addressBook.importCSVFile(addressBook.validCSVFile)
    addressBook.verifyImportBtnStatus(constants.enabledStates.enabled)
    addressBook.clickOnImportBtn()
    addressBook.verifyDataImported(addressBook.entries)
    addressBook.verifyNumberOfRows(4)
  })

  it('[SMOKE] Import a csv file with an empty address/name/network in one row', () => {
    addressBook.clickOnImportFileBtn()
    addressBook.importCSVFile(addressBook.emptyCSVFile)
    addressBook.verifyImportBtnStatus(constants.enabledStates.disabled)
    addressBook.verifyUploadExportMessage([addressBook.uploadErrorMessages.emptyFile])
  })

  it('[SMOKE] Import a non-csv file', () => {
    addressBook.clickOnImportFileBtn()
    addressBook.importCSVFile(addressBook.nonCSVFile)
    addressBook.verifyImportBtnStatus(constants.enabledStates.disabled)
    addressBook.verifyUploadExportMessage([addressBook.uploadErrorMessages.fileType])
  })

  it('[SMOKE] Import a csv file with a repeated address and same network', () => {
    addressBook.clickOnImportFileBtn()
    addressBook.importCSVFile(addressBook.duplicatedCSVFile)
    addressBook.verifyImportBtnStatus(constants.enabledStates.enabled)
    addressBook.clickOnImportBtn()
    addressBook.verifyDataImported([duplicateEntry])
    addressBook.verifyNumberOfRows(1)
  })

  it('[SMOKE] Verify modal shows the amount of entries and networks detected', () => {
    addressBook.clickOnImportFileBtn()
    addressBook.importCSVFile(addressBook.networksCSVFile)
    addressBook.verifyImportBtnStatus(constants.enabledStates.enabled)
    addressBook.verifyModalSummaryMessage(4, 3)
  })

  it('[SMOKE] Verify an entry can be added by ENS name', () => {
    addressBook.clickOnCreateEntryBtn()
    addressBook.addEntryByENS(NAME_2, constants.ENS_TEST_SEPOLIA)
  })

  it('[SMOKE] Verify empty name is not allowed when editing', () => {
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress1)
    cy.wait(1000)
    cy.reload()
    addressBook.clickOnEditEntryBtn()
    addressBook.verifyEmptyOwnerNameNotAllowed()
  })

  it('[SMOKE] Verify clicking on Send button autofills the recipient filed with correct value', () => {
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress2)
    cy.wait(1000)
    cy.reload()
    addressBook.clickOnSendBtn()
    addressBook.verifyRecipientData(recipientData)
  })
})
