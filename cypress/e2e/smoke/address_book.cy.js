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
    cy.contains('button', 'Accept selection').click()
    // Waits for the Address Book table to be in the page
    cy.contains('p', 'Address book').should('be.visible')
  })

  describe('should add remove and edit entries in the address book', () => {
    it('should add an entry', () => {
      // Add a new entry manually
      cy.findByText('Create entry').click()
      cy.get('[name="name"]').type(NAME)
      //cy.get('[name="address"]').type(ENS_NAME) ENS names are not being translated in the simulation (sausage fork)
      cy.get('[name="address"]').type(ADDRESS)
      cy.get('[type="submit"]').click()

      cy.findByText(NAME).should('exist')
      cy.findByText(ADDRESS).should('exist')
    })

    it('should edit an entry', () => {
      // Click the edit button in the first entry
      cy.findByTestId('EditIcon')
        // <div> is not visible because its parent has CSS property: visibility: hidden
        // so we have to use {force: true}
        .click({ force: true })

      cy.get('[name="name"]').clear().type(EDITED_NAME)
      cy.get('[type="submit"]').click()
      cy.findByText(NAME).should('not.exist')
      cy.findByText(EDITED_NAME).should('exist')
    })

    it('should delete an entry', () => {
      // Click the delete button in the first entry
      cy.findByTestId('DeleteOutlineIcon').click({ force: true })
      cy.findByText('Delete').should('exist').click()
      cy.findByText(EDITED_NAME).should('not.exist')
    })
  })

  describe('should import and export address book files', () => {
    it('should import an address book csv file', () => {
      // Import CSV
      cy.findByText('Import').click()
      cy.get('[type="file"]').attachFile('../fixtures/address_book_test.csv')
      //This is the submit button for the Import modal. It requires an actuall class or testId to differentiate
      //from the Import button at the top of the AB table
      cy.contains('button.MuiButton-sizeMedium', 'Import').click()
      cy.findByText(RINKEBY_CSV_ENTRY.name).should('exist')
      cy.findByText(RINKEBY_CSV_ENTRY.address).should('exist')
    })

    it.skip('should find Gnosis Chain imported address', () => {
      //Test skipped because it causes an error in the simulation
      //"Unhandled Runtime Error
      //Error: Hydration failed because the initial UI does not match what was rendered on the server."

      // Go to a Safe on Gnosis Chain
      cy.get('[aria-haspopup="listbox"]').findByText('Rinkeby').click()
      cy.findByText('Gnosis Chain').click()

      // Navigate to the Address Book page
      cy.visit(`/${GNO_TEST_SAFE}/address-book`)

      // Close cookies banner
      cy.contains('button', 'Accept selection').click()
      // Waits for the Address Book table to be in the page
      cy.contains('p', 'Address book').should('be.visible')

      // Finds the imported Gnosis Chain address
      cy.findByText(GNO_CSV_ENTRY.name).should('exist')
      cy.findByText(GNO_CSV_ENTRY.address).should('exist')
    })

    it('should download correctly the address book file', () => {
      // Download the export file
      const date = format(new Date(), 'yyyy-MM-dd')
      const fileName = `safe-address-book-${date}.csv` //name that is given to the file automatically

      cy.contains('button', 'Export').click()
      //This is the submit button for the Export modal. It requires an actuall class or testId to differentiate
      //from the Export button at the top of the AB table
      cy.contains('button.MuiButton-sizeMedium', 'Export').click()
      const downloadsFolder = Cypress.config('downloadsFolder')
      //File reading is failing in the CI. Can be tested locally
      //cy.readFile(path.join(downloadsFolder, fileName).replace('/', '\\')).should('exist')
    })
  })
})
