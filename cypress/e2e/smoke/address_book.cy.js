import 'cypress-file-upload'
import * as constants from '../../support/constants'
import * as addressBook from '../../e2e/pages/address_book.page'
import * as main from '../../e2e/pages/main.page'

const NAME = 'Owner1'
const EDITED_NAME = 'Edited Owner1'

describe('[SMOKE] Address book tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.addressBookUrl + constants.SEPOLIA_TEST_SAFE_1)
    main.acceptCookies()
  })

  it('[SMOKE] Verify entry can be added', () => {
    addressBook.clickOnCreateEntryBtn()
    addressBook.addEntry(NAME, constants.RECIPIENT_ADDRESS)
  })

  //TODO: Use localstorage for setting up/deleting entries
  it('[SMOKE] Verify entry can be deleted', () => {
    addressBook.clickOnCreateEntryBtn()
    addressBook.addEntry(NAME, constants.RECIPIENT_ADDRESS)
    // Click the delete button in the first entry
    addressBook.clickDeleteEntryButton()
    addressBook.clickDeleteEntryModalDeleteButton()
    addressBook.verifyEditedNameNotExists(EDITED_NAME)
  })

  // TODO: Update Goerli title in TestRail
  it('[SMOKE] Verify csv file can be imported', () => {
    addressBook.clickOnImportFileBtn()
    addressBook.importFile()
    addressBook.verifyImportModalIsClosed()
    addressBook.verifyDataImported(constants.SEPOLIA_CSV_ENTRY.name, constants.SEPOLIA_CSV_ENTRY.address)
  })
})
