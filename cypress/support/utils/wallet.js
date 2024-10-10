const onboardv2 = 'onboard-v2'
const pkInput = '[data-testid="private-key-input"]'
const pkConnectBtn = '[data-testid="pk-connect-btn"]'
const connectWalletBtn = '[data-testid="connect-wallet-btn"]'

const privateKeyStr = 'Private key'

export function connectSigner(signer) {
  const actions = {
    privateKey: () => {
      cy.get(onboardv2)
        .shadow()
        .find('button')
        .contains(privateKeyStr)
        .click()
        .then(() => handlePkConnect())
    },
    retry: () => {
      cy.wait(1000).then(enterPrivateKey)
    },
  }

  function handlePkConnect() {
    cy.get('body').then(($body) => {
      if ($body.find(pkConnectBtn).length > 0) {
        cy.get(pkInput).find('input').clear().type(signer, { log: false, force: true })
        cy.get(pkConnectBtn).click()
      }
    })
  }

  function enterPrivateKey() {
    cy.wait(1000)
    cy.get(connectWalletBtn)
      .eq(0)
      .should('be.enabled')
      .and('be.visible')
      .click()
      .then(() => {
        cy.get('body').then(($body) => {
          const actionKey = $body.find(onboardv2).length > 0 ? 'privateKey' : 'retry'
          actions[actionKey]()
        })
      })
  }

  enterPrivateKey()
}
