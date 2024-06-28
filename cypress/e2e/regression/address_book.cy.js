import 'cypress-file-upload'
const path = require('path')
import { format } from 'date-fns'
import * as constants from '../../support/constants'
import * as addressBook from '../../e2e/pages/address_book.page'
import * as main from '../../e2e/pages/main.page'
import * as ls from '../../support/localstorage_data.js'
import * as sidebar from '../pages/sidebar.pages.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'
import * as wallet from '../../support/utils/wallet.js'

let staticSafes = []
const walletCredentials = JSON.parse(Cypress.env('CYPRESS_WALLET_CREDENTIALS'))
const signer = walletCredentials.OWNER_4_PRIVATE_KEY

const NAME = 'Owner1'
const EDITED_NAME = 'Edited Owner1'
const importedSafe = 'imported-safe'

describe('Address book tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.visit(constants.addressBookUrl + staticSafes.SEP_STATIC_SAFE_4)
    cy.clearLocalStorage()
    main.acceptCookies()
  })

  it('Verify owners name can be edited', () => {
    cy.wrap(null)
      .then(() =>
        main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress1),
      )
      .then(() =>
        main.isItemInLocalstorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress1),
      )
      .then(() => {
        cy.reload()
        addressBook.clickOnEditEntryBtn()
        addressBook.typeInNameInput(EDITED_NAME)
        addressBook.clickOnSaveEntryBtn()
        addressBook.verifyNameWasChanged(NAME, EDITED_NAME)
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
    cy.wrap(null)
      .then(() => main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.dataSet))
      .then(() =>
        main.isItemInLocalstorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.dataSet),
      )
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

  it('Verify that importing a csv file does not alter addresses in the Address book not present in the file', () => {
    cy.wrap(null)
      .then(() =>
        main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress1),
      )
      .then(() =>
        main.isItemInLocalstorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress1),
      )
      .then(() => {
        cy.wait(1000)
        cy.reload()
        addressBook.clickOnImportFileBtn()
        addressBook.importCSVFile(addressBook.validCSVFile)
        addressBook.clickOnImportBtn()
        addressBook.verifyDataImported([constants.RECIPIENT_ADDRESS])
      })
  })

  it('Verify Safe name changes after uploading a csv file', () => {
    cy.wrap(null)
      .then(() => main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addedSafes, ls.addedSafes.set4))
      .then(() =>
        main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.addedSafesImport),
      )
      .then(() => {
        cy.wait(1000)
        cy.reload()
        addressBook.clickOnImportFileBtn()
        addressBook.importCSVFile(addressBook.addedSafesCSVFile)
        addressBook.clickOnImportBtn()
        wallet.connectSigner(signer)
        sidebar.openSidebar()
        sidebar.verifyAddedSafesExist([importedSafe])
      })
  })
})
