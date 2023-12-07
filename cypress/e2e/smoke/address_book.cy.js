import 'cypress-file-upload'
import * as constants from '../../support/constants'
import * as addressBook from '../../e2e/pages/address_book.page'
import * as main from '../../e2e/pages/main.page'
import * as ls from '../../support/localstorage_data.js'

const NAME = 'Owner1'
const EDITED_NAME = 'Edited Owner1'

describe('[SMOKE] Address book tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.addressBookUrl + constants.SEPOLIA_TEST_SAFE_1)
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
    addressBook.importFile()
    addressBook.verifyImportModalIsClosed()
    addressBook.verifyDataImported(constants.SEPOLIA_CSV_ENTRY.name, constants.SEPOLIA_CSV_ENTRY.address)
  })
})
