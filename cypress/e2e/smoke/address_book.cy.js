import 'cypress-file-upload'
const path = require('path')
import { format } from 'date-fns'
import * as constants from '../../support/constants'
import * as addressBook from '../../e2e/pages/address_book.page'
import * as main from '../../e2e/pages/main.page'

const NAME = 'Owner1'
const EDITED_NAME = 'Edited Owner1'

describe('Address book tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.addressBookUrl + constants.SEPOLIA_TEST_SAFE_1)
    main.acceptCookies(1)
  })

  it('Verify entry can be added', () => {
    addressBook.clickOnCreateEntryBtn()
    addressBook.addEntry(NAME, constants.RECIPIENT_ADDRESS)
  })

  it('Verify entered entry in Name input can be saved', () => {
    addressBook.clickOnCreateEntryBtn()
    addressBook.addEntry(NAME, constants.RECIPIENT_ADDRESS)
    addressBook.clickOnEditEntryBtn()
    addressBook.typeInNameInput(EDITED_NAME)
    addressBook.clickOnSaveButton()
    addressBook.verifyNameWasChanged(NAME, EDITED_NAME)
  })

  it('Verify entry can be deleted', () => {
    addressBook.clickOnCreateEntryBtn()
    addressBook.addEntry(NAME, constants.RECIPIENT_ADDRESS)
    // Click the delete button in the first entry
    addressBook.clickDeleteEntryButton()
    addressBook.clickDeleteEntryModalDeleteButton()
    addressBook.verifyEditedNameNotExists(EDITED_NAME)
  })

  it('Verify csv file can be imported (Goerli)', () => {
    addressBook.clickOnImportFileBtn()
    addressBook.importFile()
    addressBook.verifyImportModalIsClosed()
    addressBook.verifyDataImported(constants.SEPOLIA_CSV_ENTRY.name, constants.SEPOLIA_CSV_ENTRY.address)
  })

  it.skip('Verify Gnosis Chain imported address can be found', () => {
    // Go to a Safe on Gnosis Chain
    cy.get('header')
      .contains(/^G(ö|oe)rli$/)
      .click()
    cy.contains('Gnosis Chain').click()

    // Navigate to the Address Book page
    cy.visit(`/address-book?safe=${constants.GNO_TEST_SAFE}`)

    // Waits for the Address Book table to be in the page
    cy.contains('p', 'Address book').should('be.visible')

    // Finds the imported Gnosis Chain address
    cy.contains(constants.GNO_CSV_ENTRY.name).should('exist')
    cy.contains(constants.GNO_CSV_ENTRY.address).should('exist')
  })

  it('Verify the address book file can be downloaded', () => {
    addressBook.clickOnImportFileBtn()
    addressBook.importFile()
    // Download the export file
    const date = format(new Date(), 'yyyy-MM-dd', { timeZone: 'UTC' })
    const fileName = `safe-address-book-${date}.csv` //name that is given to the file automatically

    addressBook.clickOnExportFileBtn()
    //This is the submit button for the Export modal. It requires an actuall class or testId to differentiate
    //from the Export button at the top of the AB table
    addressBook.confirmExport()

    const downloadsFolder = Cypress.config('downloadsFolder')
    //File reading is failing in the CI. Can be tested locally
    cy.readFile(path.join(downloadsFolder, fileName)).should('exist')
  })
})
