import 'cypress-file-upload'
const path = require('path')
import { format } from 'date-fns'

describe('Import Export Data', () => {
  before(() => {
    cy.visit(`/welcome`)
    cy.contains('Accept selection').click()
    // Waits for the Import button to be visible
    cy.contains('button', 'Import').should('be.visible')
  })

  it('Uploads test file and access safe', () => {
    cy.contains('button', 'Import').click()
    //Uploads the file
    cy.get('[type="file"]').attachFile('../fixtures/data_import.json')
    //verifies that the modal says the amount of chains/addressbook values it uploaded
    cy.contains('Added Safe Accounts on 3 chains').should('be.visible')
    cy.contains('Address book for 3 chains').should('be.visible')
    cy.contains('Settings').should('be.visible')
    cy.contains('Bookmarked Safe Apps').should('be.visible')
    cy.contains('Data import').parent().contains('button', 'Import').click()
    //Click in one of the imported safes
    cy.contains('safe 1 goerli').click()
  })

  it("Verify safe's address book imported data", () => {
    //Verifies imported owners in the Address book
    cy.contains('Address book').click()
    cy.get('tbody tr:nth-child(1) td:nth-child(1)').contains('test1')
    cy.get('tbody tr:nth-child(1) td:nth-child(2)').contains('0x61a0c717d18232711bC788F19C9Cd56a43cc8872')
    cy.get('tbody tr:nth-child(2) td:nth-child(1)').contains('test2')
    cy.get('tbody tr:nth-child(2) td:nth-child(2)').contains('0x7724b234c9099C205F03b458944942bcEBA13408')
  })

  it('Verify pinned apps', () => {
    cy.get('aside').contains('li', 'Apps').click()
    cy.contains('Bookmarked apps').click()
    //Takes a some time to load the apps page, It waits for bookmark to be lighted up
    cy.waitForSelector(() => {
      return cy
        .get('[aria-selected="true"] p')
        .invoke('html')
        .then((text) => text === 'Bookmarked apps')
    })
    cy.contains('Drain Account').should('be.visible')
    cy.contains('Transaction Builder').should('be.visible')
  })

  it('Verify imported data in settings', () => {
    //In the settings checks the checkboxes and darkmode enabled
    cy.contains('Settings').click()
    cy.contains('Appearance').click()
    cy.contains('label', 'Prepend chain prefix to addresses').find('input[type="checkbox"]').should('not.be.checked')
    cy.contains('label', 'Copy addresses with chain prefix').find('input[type="checkbox"]').should('not.be.checked')
    cy.get('main').contains('label', 'Dark mode').find('input[type="checkbox"]').should('be.checked')
  })

  it('Verifies data for export in Data tab', () => {
    cy.contains('div[role="tablist"] a', 'Data').click()
    cy.contains('Added Safe Accounts on 3 chains').should('be.visible')
    cy.contains('Address book for 3 chains').should('be.visible')
    cy.contains('Bookmarked Safe Apps').should('be.visible')
    const date = format(new Date(), 'yyyy-MM-dd', { timeZone: 'UTC' })
    const fileName = `safe-${date}.json`
    cy.contains('div', fileName).next().click()
    const downloadsFolder = Cypress.config('downloadsFolder')
    //File reading is failing in the CI. Can be tested locally
    cy.readFile(path.join(downloadsFolder, fileName)).should('exist')
  })
})
