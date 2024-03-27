import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as assets from '../pages/assets.pages'
import * as loadsafe from '../pages/load_safe.pages'
import * as navigation from '../pages/navigation.page'
import * as tx from '../pages/transactions.page'
import * as nfts from '../pages/nfts.pages'

const safe1Balance_2 = 100000000000000000000n
const safeBalanceEth = 5000000000000000n
const testToken = 'GasTestingToken'
const tokenAmount = 0.005

function visit(url) {
  cy.visit(url)
  cy.clearLocalStorage()
  main.acceptCookies()
}

describe('Send funds happy path tests 2', () => {
  it('Verify tx creation and execution of non-native token with relay', () => {
    function executeTransactionFlow(fromSafe, toSafe) {
      visit(constants.BALANCE_URL + fromSafe)
      assets.selectTokenList(assets.tokenListOptions.allTokens)
      assets.clickOnSendBtn(1)

      loadsafe.inputOwnerAddress(0, toSafe)
      assets.checkSelectedToken(constants.tokenAbbreviation.ttone)
      assets.enterAmount(10)
      navigation.clickOnNewTxBtnS()
      tx.executeFlow_2()
      cy.wait(5000)
    }
    executeTransactionFlow(constants.SEPOLIA_TEST_SAFE_36_SEND_FUNDS_HP5, constants.SEPOLIA_TEST_SAFE_37_SEND_FUNDS_HP6)
    executeTransactionFlow(constants.SEPOLIA_TEST_SAFE_37_SEND_FUNDS_HP6, constants.SEPOLIA_TEST_SAFE_36_SEND_FUNDS_HP5)
    cy.wait(5000)
    main.checkTokenBalanceIsNull(constants.SEPOLIA_TEST_SAFE_37_SEND_FUNDS_HP6, constants.tokenAbbreviation.ttone)
    main.checkTokenBalance(
      constants.SEPOLIA_TEST_SAFE_36_SEND_FUNDS_HP5,
      constants.tokenAbbreviation.ttone,
      safe1Balance_2,
    )
  })

  it('Verify tx creation and execution of NFT with relay', () => {
    function executeTransactionFlow(fromSafe, toSafe) {
      visit(constants.balanceNftsUrl + fromSafe)
      nfts.selectNFTs(1)
      nfts.sendNFT()
      nfts.typeRecipientAddress(toSafe)
      nfts.clikOnNextBtn()
      tx.executeFlow_2()
      cy.wait(5000)
    }
    executeTransactionFlow(constants.SEPOLIA_TEST_SAFE_38_SEND_FUNDS_HP7, constants.SEPOLIA_TEST_SAFE_39_SEND_FUNDS_HP8)
    executeTransactionFlow(constants.SEPOLIA_TEST_SAFE_39_SEND_FUNDS_HP8, constants.SEPOLIA_TEST_SAFE_38_SEND_FUNDS_HP7)
    cy.wait(5000)
    main.checkNFTBalance(constants.SEPOLIA_TEST_SAFE_38_SEND_FUNDS_HP7, constants.tokenAbbreviation.gtt, testToken)
    main.checkTokenBalanceIsNull(constants.SEPOLIA_TEST_SAFE_39_SEND_FUNDS_HP8, constants.tokenAbbreviation.gtt)
  })

  it('Verify tx creation and execution of native token with relay', () => {
    function executeTransactionFlow(fromSafe, toSafe, tokenAmount) {
      visit(constants.BALANCE_URL + fromSafe)
      assets.clickOnSendBtn(0)
      loadsafe.inputOwnerAddress(0, toSafe)
      assets.checkSelectedToken(constants.tokenAbbreviation.sep)
      assets.enterAmount(tokenAmount)
      navigation.clickOnNewTxBtnS()
      tx.executeFlow_2()
      cy.wait(5000)
    }
    main.fetchCurrentNonce(constants.SEPOLIA_TEST_SAFE_34_SEND_FUNDS_HP3).then((currentNonceSafe1) => {
      main.fetchCurrentNonce(constants.SEPOLIA_TEST_SAFE_35_SEND_FUNDS_HP4).then((currentNonceSafe2) => {
        executeTransactionFlow(
          constants.SEPOLIA_TEST_SAFE_34_SEND_FUNDS_HP3,
          constants.SEPOLIA_TEST_SAFE_35_SEND_FUNDS_HP4,
          tokenAmount,
        )
        executeTransactionFlow(
          constants.SEPOLIA_TEST_SAFE_35_SEND_FUNDS_HP4,
          constants.SEPOLIA_TEST_SAFE_34_SEND_FUNDS_HP3,
          tokenAmount,
        )
        cy.wait(5000)
        main.verifyNonceChange(constants.SEPOLIA_TEST_SAFE_35_SEND_FUNDS_HP4, currentNonceSafe2 + 1)
        main.verifyNonceChange(constants.SEPOLIA_TEST_SAFE_34_SEND_FUNDS_HP3, currentNonceSafe1 + 1)

        main.checkTokenBalance(constants.SEPOLIA_TEST_SAFE_35_SEND_FUNDS_HP4, constants.tokenAbbreviation.eth, '0')
        main.checkTokenBalance(
          constants.SEPOLIA_TEST_SAFE_34_SEND_FUNDS_HP3,
          constants.tokenAbbreviation.eth,
          safeBalanceEth,
        )
      })
    })
  })
})
