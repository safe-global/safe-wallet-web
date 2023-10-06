import 'cypress-file-upload'
const path = require('path')
import { format } from 'date-fns'
import * as constants from '../../support/constants'
import * as addressBook from '../../e2e/pages/address_book.page'
import * as main from '../../e2e/pages/main.page'

const NAME = 'Owner1'
const EDITED_NAME = 'Edited Owner1'

describe('Address book tests', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.addressBookUrl + constants.GOERLI_TEST_SAFE)
    main.acceptCookies()
  })

  describe('should add remove and edit entries in the address book', () => {
    it('should add an entry', () => {
      addressBook.clickOnCreateEntryBtn()
      addressBook.typeInName(NAME)
      addressBook.typeInAddress(constants.RECIPIENT_ADDRESS)
      addressBook.clickOnSaveEntryBtn()
      addressBook.verifyNewEntryAdded(NAME, constants.RECIPIENT_ADDRESS)
    })

    it('should save an edited entry name', () => {
      addressBook.clickOnEditEntryBtn()
      addressBook.typeInNameInput(EDITED_NAME)
      addressBook.clickOnSaveButton()
      addressBook.verifyNameWasChanged(NAME, EDITED_NAME)
    })

    it('should delete an entry', () => {
      // Click the delete button in the first entry
      addressBook.clickDeleteEntryButton()
      addressBook.clickDeleteEntryModalDeleteButton()
      addressBook.verifyEditedNameNotExists(EDITED_NAME)
    })
  })

  describe('should import and export address book files', () => {
    it('should import an address book csv file', () => {
      addressBook.clickOnImportFileBtn()
      addressBook.importFile()
      addressBook.verifyImportModalIsClosed()
      addressBook.verifyDataImported(constants.GOERLI_CSV_ENTRY.name, constants.GOERLI_CSV_ENTRY.address)
    })

    it.skip('should find Gnosis Chain imported address', () => {
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

    it('should download correctly the address book file', () => {
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
})
