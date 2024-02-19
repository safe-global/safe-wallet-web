import 'cypress-file-upload'
const path = require('path')
import { format } from 'date-fns'
import * as constants from '../../support/constants'
import * as addressBook from '../../e2e/pages/address_book.page'
import * as main from '../../e2e/pages/main.page'
import * as ls from '../../support/localstorage_data.js'
import * as sidebar from '../pages/sidebar.pages.js'

const NAME = 'Owner1'
const EDITED_NAME = 'Edited Owner1'
const importedSafe = 'imported-safe'

describe('Address book tests', () => {
  beforeEach(() => {
    cy.visit(constants.addressBookUrl + constants.SEPOLIA_TEST_SAFE_1)
    cy.clearLocalStorage()
    main.acceptCookies()
  })

  it('Verify owners name can be edited', () => {
    main
      .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress1)
      .then(() => {
        main
          .isItemInLocalstorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress1)
          .then(() => {
            cy.reload()
            addressBook.clickOnEditEntryBtn()
            addressBook.typeInNameInput(EDITED_NAME)
            addressBook.clickOnSaveEntryBtn()
            addressBook.verifyNameWasChanged(NAME, EDITED_NAME)
          })
      })
  })

  //TODO: Rework to use Polygon. Replace Verify csv file can be imported (Goerli) with this test
  it.skip('Verify that Sepolia and Polygon addresses can be imported', () => {
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

  it('Verify the address book file can be exported', () => {
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.dataSet).then(() => {
      main
        .isItemInLocalstorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.dataSet)
        .then(() => {
          cy.reload()
          cy.contains(ls.addressBookData.dataSet[11155111]['0xf405BC611F4a4c89CCB3E4d083099f9C36D966f8'])

          const date = format(new Date(), 'yyyy-MM-dd', { timeZone: 'UTC' })
          const fileName = `safe-address-book-${date}.csv`

          addressBook.clickOnExportFileBtn()
          addressBook.verifyExportMessage(12)
          addressBook.confirmExport()

          const downloadsFolder = Cypress.config('downloadsFolder')
          //File reading is failing in the CI. Can be tested locally
          cy.readFile(path.join(downloadsFolder, fileName)).should('exist')
        })
    })
  })

  it('Verify that importing a csv file does not alter addresses in the Address book not present in the file', () => {
    main
      .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress1)
      .then(() => {
        main
          .isItemInLocalstorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress1)
          .then(() => {
            cy.wait(1000)
            cy.reload()
            addressBook.clickOnImportFileBtn()
            addressBook.importCSVFile(addressBook.validCSVFile)
            addressBook.clickOnImportBtn()
            addressBook.verifyDataImported([constants.RECIPIENT_ADDRESS])
          })
      })
  })

  it('Verify Safe name changes after uploading a csv file', () => {
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addedSafes, ls.addedSafes.set4).then(() => {
      main
        .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.addedSafesImport)
        .then(() => {
          cy.wait(1000)
          cy.reload()
          addressBook.clickOnImportFileBtn()
          addressBook.importCSVFile(addressBook.addedSafesCSVFile)
          addressBook.clickOnImportBtn()
          sidebar.openSidebar()
          sidebar.verifyAddedSafesExist([importedSafe])
        })
    })
  })
})
