import 'cypress-file-upload'

const SAFE_ENS_NAME = 'safe.test'
const SAFE_ENS_NAME_TRANSLATED = '0x83eC7B0506556a7749306D69681aDbDbd08f0769'
const SAFE_QR_CODE_ADDRESS = '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808'
const EOA_ADDRESS = '0x61a0c717d18232711bC788F19C9Cd56a43cc8872'

const INVALID_INPUT_ERROR_MSG = 'Invalid address format'
const INVALID_ADDRESS_ERROR_MSG = 'Address given is not a valid Safe address'

const OWNER_ENS_DEFAULT_NAME = 'francoledger.eth'
const OWNER_ADDRESS = '0x6f965E48347AF3Df65c14CCc176A9CbeCEa0eDb5'

describe('Load existing Safe', () => {
  before(() => {
    cy.visit('/welcome')
    cy.contains('Accept selection').click()

    // Enters Loading Safe form
    cy.contains('Add existing Safe').click()
    cy.contains('Connect wallet & select network')
  })

  it('should allow choosing the network where the Safe exists', () => {
    // Click the network selector inside the Stepper content
    cy.contains('Select network on which the Safe was created:').contains('span', 'Rinkeby').click()

    // Selects Ethereum
    cy.get('ul li').contains('Ethereum').click()
    cy.contains('Select network on which the Safe was created:').contains('span', 'Ethereum')

    // Selects Rinkeby
    cy.contains('Select network on which the Safe was created:').contains('span', 'Ethereum').click()
    cy.get('ul li').contains('Rinkeby').click()
    cy.contains('Select network on which the Safe was created:').contains('span', 'Rinkeby')

    cy.contains('Continue').click()
  })

  it('should accept name the safe', () => {
    // alias the address input label
    cy.get('input[name="address"]').parent().prev('label').as('addressLabel')

    // Name input should have a placeholder ending in 'rinkeby-safe'
    cy.get('input[name="name"]').should('have.attr', 'placeholder').should('contain', 'rinkeby-safe')
    // Input a custom name
    cy.get('input[name="name"]').type('Test safe name').should('have.value', 'Test safe name')

    // Input incorrect Safe address
    cy.get('input[name="address"]').type('RandomText')
    cy.get('@addressLabel').contains(INVALID_INPUT_ERROR_MSG)

    // Type an invalid address
    cy.get('input[name="address"]').clear().type(EOA_ADDRESS)
    cy.get('@addressLabel').contains(INVALID_ADDRESS_ERROR_MSG)

    // Type a ENS name
    cy.get('input[name="address"]').clear().type(SAFE_ENS_NAME)
    // giving time to the ENS name to be translated
    cy.get('input[name="address"]', { timeout: 10000 }).should('have.value', SAFE_ENS_NAME_TRANSLATED)

    // Uploading a QR code
    cy.findByTestId('QrCodeIcon').click()
    cy.contains('Upload an image').click()
    cy.get('[type="file"]').attachFile('../fixtures/rinkeby_safe_QR.png')

    // The address field should be filled with the QR code's address
    cy.get('input[name="address"]').should('have.value', SAFE_QR_CODE_ADDRESS)
    cy.contains('Continue').click()
  })

  it('should resolve ENS names for Safe owners', () => {
    // Finds ENS name as one of the owners (give some time to the resolver)
    cy.findByPlaceholderText(OWNER_ENS_DEFAULT_NAME, { timeout: 20000 })
      .parents('.MuiGrid-container')
      // Name is matched by the correct address
      .contains(OWNER_ADDRESS)
  })

  it('should set custom name in the first owner', () => {
    // Sets a custom name for the first owner
    cy.get('input[name="owners.0.name"]').type('Test Owner Name').should('have.value', 'Test Owner Name')
    cy.contains('Continue').click()
  })

  it('should have safe and owner names in the Review step', () => {
    // Finds Safe name
    cy.findByText('Test safe name').should('exist')
    // Finds custom owner name
    cy.findByText('Test Owner Name').should('exist')

    cy.contains('button', 'Add').click()
  })

  it('should load successfully the custom Safe name', () => {
    // Safe loaded
    cy.location('pathname', { timeout: 10000 }).should('include', `/rin:${SAFE_QR_CODE_ADDRESS}/home`)

    // Finds Safe name in the sidebar
    cy.get('aside').contains('Test safe name')

    // Safe name is present in Settings
    cy.get('aside ul').contains('Settings').click()
    cy.contains('Test Owner Name')
  })
})
