import 'cypress-file-upload'
const path = require('path')

const SAFE_ENS_NAME = 'safe.test'
const SAFE_ENS_NAME_TRANSLATED = '0x83eC7B0506556a7749306D69681aDbDbd08f0769'
const SAFE_QR_CODE_ADDRESS = '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808'
const NON_CONTRACT_ADDRESS = '0x61a0c717d18232711bC788F19C9Cd56a43cc8872'
const INVALID_INPUT_ERROR_MSG = 'Must be a valid address, ENS or Unstoppable domain'
const INVALID_ADDRESS_ERROR_MSG = 'Address given is not a valid Safe address'
const OWNER_ENS_DEFAULT_NAME = 'francoledger.eth'
const OWNER_ADDRESS = '0x6f965E48347AF3Df65c14CCc176A9CbeCEa0eDb5'

describe('Load Safe', () => {
  it('Should load an existing Safe', () => {
    cy.visit('/')
    cy.findByText('Accept selection').click()

    cy.get('[data-track="load-safe: Open stepper"]').click()
    cy.findByText('Add existing Safe').should('exist')
    cy.wait(1000) // Have to wait because clicking the switch network fails sometimes if not

    // Network selection
    cy.findByTestId('select-network-step').find('button').click()
    cy.get('[aria-labelledby="select-network"]').should('exist')
    cy.get('[aria-labelledby="select-network"]').findByText('Ethereum').click()
    cy.get('nav').findByText('Ethereum').should('exist')
    cy.findByTestId('select-network-step').findByText('Ethereum').should('exist')
    cy.findByTestId('select-network-step').find('button').click()
    cy.findByText('Rinkeby').click()
    cy.get('[data-track="load-safe: Continue"]').click()

    // Name
    cy.findByTestId('load-safe-name-field').should('have.attr', 'placeholder').should('contain', 'rinkeby-safe')
    cy.findByTestId('load-safe-name-field').type('Test safe name').should('have.value', 'Test safe name')

    cy.findByTestId('load-safe-address-field').type('RandomText')
    cy.findByText(INVALID_INPUT_ERROR_MSG).should('exist')
    cy.findByTestId('load-safe-address-field').clear().type(NON_CONTRACT_ADDRESS)
    cy.findByText(INVALID_ADDRESS_ERROR_MSG).should('exist')
    cy.findByTestId('load-safe-address-field')
      .clear()
      .type(SAFE_ENS_NAME)
      .should('have.value', SAFE_ENS_NAME_TRANSLATED)
    cy.findByTestId('qr-icon').click()
    cy.get('[class="paper"]').find('button').contains('Upload an image').click()
    cy.get('[type="file"]').attachFile('../fixtures/rinkeby_safe_QR.png')
    cy.findByTestId('load-safe-address-field').should('have.value', SAFE_QR_CODE_ADDRESS)
    cy.findByTestId('safeAddress-valid-address-adornment').should('exist')
    cy.wait(3000) //have to wait or after clicking next what loads is the owners of the previous valids safe, not the one from the QR code
    cy.get('[type="submit"]').click()

    // Owners
    cy.findByPlaceholderText(OWNER_ENS_DEFAULT_NAME).parents('div[data-testid="owner-row"]').findByText(OWNER_ADDRESS)
    cy.findByPlaceholderText(OWNER_ENS_DEFAULT_NAME).type('Test Owner Name').should('have.value', 'Test Owner Name')
    cy.get('[data-track="load-safe: Continue"]').click()

    // Review Step
    cy.findByText('Test safe name').should('exist')
    cy.findByText('Test Owner Name').should('exist')
    cy.get('[data-track="load-safe: Add"]').click()

    // Safe loaded
    cy.findByTestId('sidebar').findByText('Test safe name')
    cy.findByTestId('sidebar').find('nav').findByText('Settings').click()
    cy.findByTestId('sidebar').find('nav').findByText('Owners').click()
    cy.findByText('Test Owner Name')
  })
})
