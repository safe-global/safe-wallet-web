import 'cypress-file-upload'
const path = require('path')

const SAFE_ENS_NAME = 'safe.test'
const SAFE_ENS_NAME_TRANSLATED = '0x83eC7B0506556a7749306D69681aDbDbd08f0769'
const SAFE_QR_CODE_ADDRESS = '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808'
const NON_CONTRACT_ADDRESS = '0x61a0c717d18232711bC788F19C9Cd56a43cc8872'
const INVALID_INPUT_ERROR_MSG = 'Invalid address format'
const INVALID_ADDRESS_ERROR_MSG = 'Address given is not a valid Safe address'
const OWNER_ENS_DEFAULT_NAME = 'francoledger.eth'
const OWNER_ADDRESS = '0x6f965E48347AF3Df65c14CCc176A9CbeCEa0eDb5'

describe('Load Safe', () => {
  it('Should enter Add safe form', () => {
    cy.visit('/', { failOnStatusCode: false })
    cy.findByText('Accept selection').click()

    cy.get('[data-track="load-safe: Open stepper"]').click()
    cy.findByText('Add existing Safe').should('exist')
    cy.wait(1000) // Have to wait because clicking the switch network fails sometimes if not
  })

  it('Should change network and back', () => {
    // Network selection
    cy.contains('main span', 'Rinkeby').click()
    cy.contains('ul li', 'Ethereum').should('exist').click()
    cy.contains('header', 'Ethereum').should('exist')
    cy.contains('main span', 'Ethereum').should('exist').click()
    cy.contains('ul li', 'Rinkeby').should('exist').click()
    cy.findByText('Continue').click()
  })

  it('Should name the safe', () => {
    // Name
    cy.get('[id=":r0:"]').should('have.attr', 'placeholder').should('contain', 'rinkeby-safe')
    cy.get('[id=":r0:"]').type('Test safe name').should('have.value', 'Test safe name')
  })

  it('Should validate the address input', () => {
    cy.get('[id=":r1:"]').type('RandomText')
    cy.get('[id=":r1:-label"]').contains(INVALID_INPUT_ERROR_MSG)
    cy.get('[id=":r1:"]').clear().type(NON_CONTRACT_ADDRESS)
    cy.get('[id=":r1:-label"]').contains(INVALID_ADDRESS_ERROR_MSG)
    cy.get('[id=":r1:"]').clear().type(SAFE_ENS_NAME).should('have.value', SAFE_ENS_NAME_TRANSLATED)
  })

  it('Should enter a valid QRCode', () => {
    cy.findByTestId('QrCodeIcon').click()
    cy.findByText('Upload an image').click()
    cy.get('[type="file"]').attachFile('../fixtures/rinkeby_safe_QR.png')
    cy.get('[id=":r1:"]').should('have.value', SAFE_QR_CODE_ADDRESS)
    cy.findByText('Continue').click()
  })

  it('Should name the 1st owner', () => {
    // Owners
    // Checks existing default ENS Owner name in this safe
    cy.findByPlaceholderText(OWNER_ENS_DEFAULT_NAME, { timeout: 10000 })
      .parents('.MuiGrid-spacing-xs-3')
      .contains(OWNER_ADDRESS)

    cy.get('[name="owners.0.name"]').type('Test Owner Name').should('have.value', 'Test Owner Name')
    cy.findByText('Continue').click()
  })

  it('Reviews safe and owner names', () => {
    // Review Step
    cy.findByText('Test safe name').should('exist')
    cy.findByText('Test Owner Name').should('exist')
    cy.contains('button', 'Add').click()
  })

  it('Validates safe and owner names', () => {
    // Safe loaded
    cy.get('aside').findByText('Test safe name')
    cy.get('aside').find('ul').findByText('Settings').click()
    cy.findByText('Test Owner Name', { timeout: 10000 })
  })
})
