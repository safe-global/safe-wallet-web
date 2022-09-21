import 'cypress-file-upload'
const path = require('path')
import { format } from 'date-fns'

const NAME = 'Owner1'
const EDITED_NAME = 'Edited Owner1'
const ADDRESS = '0x61a0c717d18232711bC788F19C9Cd56a43cc8872'
const ENS_NAME = 'francotest.eth'
const RINKEBY_TEST_SAFE = 'rin:0xB5ef359e8eBDAd1cd7695FFEF3f6F6D7d5e79B08'
const GNO_TEST_SAFE = 'gno:0xB8d760a90a5ed54D3c2b3EFC231277e99188642A'
const RINKEBY_CSV_ENTRY = {
  name: 'rinkeby user 1',
  address: '0x730F87dA2A3C6721e2196DFB990759e9bdfc5083',
}
const GNO_CSV_ENTRY = {
  name: 'gno user 1',
  address: '0x61a0c717d18232711bC788F19C9Cd56a43cc8872',
}

describe('Address book', () => {
  before(() => {
    cy.visit(`/${RINKEBY_TEST_SAFE}/address-book`, { failOnStatusCode: false })
    cy.contains('Accept selection').click()
    // Waits for the Address Book table to be in the page
    cy.contains('p', 'Address book').should('be.visible')
  })

  describe('should add remove and edit entries in the address book', () => {
    it('should add an entry', () => {
      // Add a new entry manually
      cy.contains('Create entry').click()
      cy.get('input[name="name"]').type(NAME)
      cy.get('input[name="address"]').type(ENS_NAME)
      // cy.wait(5000)
      cy.contains('Save').click()

      cy.contains(NAME).should('exist')
      cy.contains(ADDRESS).should('exist')
    })

    it('should save an edited entry name', () => {
      // Click the edit button in the first entry
      cy.get('button[aria-label="Edit entry"]').click({ force: true })

      // Give the entry a new name
      cy.get('input[name="name"]').clear().type(EDITED_NAME)
      cy.contains('Save').click()

      // Previous name should have been replaced by the edited one
      cy.get(NAME).should('not.exist')
      cy.contains(EDITED_NAME).should('exist')
    })

    it('should delete an entry', () => {
      // Click the delete button in the first entry
      cy.get('button[aria-label="Delete entry"]').click({ force: true })

      cy.get('.MuiDialogActions-root').contains('Delete').click()
      cy.get(EDITED_NAME).should('not.exist')
    })
  })

  describe('should import and export address book files', () => {
    it('should import an address book csv file', () => {
      cy.contains('Import').click()
      cy.get('[type="file"]').attachFile('../fixtures/address_book_test.csv')

      // Import button should be enabled
      cy.get('.MuiDialogActions-root').contains('Import').should('not.be.disabled')
      cy.get('.MuiDialogActions-root').contains('Import').click()

      // The import modal should be closed
      cy.get('Import address book').should('not.exist')
      cy.contains(RINKEBY_CSV_ENTRY.name).should('exist')
      cy.contains(RINKEBY_CSV_ENTRY.address).should('exist')
    })

    it('should find Gnosis Chain imported address', () => {
      // Go to a Safe on Gnosis Chain
      cy.get('header')
        .contains(/^Rinkeby$/)
        .click()
      cy.contains('Gnosis Chain').click()

      // Navigate to the Address Book page
      cy.visit(`/${GNO_TEST_SAFE}/address-book`, { failOnStatusCode: false })

      // Waits for the Address Book table to be in the page
      cy.contains('p', 'Address book').should('be.visible')

      // Finds the imported Gnosis Chain address
      cy.contains(GNO_CSV_ENTRY.name).should('exist')
      cy.contains(GNO_CSV_ENTRY.address).should('exist')
    })

    it('should download correctly the address book file', () => {
      // Download the export file
      const date = format(new Date(), 'yyyy-MM-dd')
      const fileName = `safe-address-book-${date}.csv` //name that is given to the file automatically

      // safe-address-book-2022-09-21

      cy.contains('Export').click()
      //This is the submit button for the Export modal. It requires an actuall class or testId to differentiate
      //from the Export button at the top of the AB table
      cy.get('.MuiDialogActions-root').contains('Export').click()

      const downloadsFolder = Cypress.config('downloadsFolder')
      //File reading is failing in the CI. Can be tested locally
      cy.readFile(path.join(downloadsFolder, fileName)).should('exist')
    })
  })
})
