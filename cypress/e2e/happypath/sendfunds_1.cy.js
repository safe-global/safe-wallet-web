import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as assets from '../pages/assets.pages'
import * as loadsafe from '../pages/load_safe.pages'
import * as navigation from '../pages/navigation.page'
import * as tx from '../pages/transactions.page'
import * as nfts from '../pages/nfts.pages'

const safe1Balance_2 = 100000000000000000000n
const safeBalanceEth = 5000000000000000n
const testToken = 'DoritoNfts'
const tokenAmount = 0.005

function visit(url) {
  cy.visit(url)
  cy.clearLocalStorage()
  main.acceptCookies()
}

describe('Send funds happy path tests 1', () => {
  it('Verify tx creation and execution of non-native token with connected signer', () => {
    function executeTransactionFlow(fromSafe, toSafe) {
      visit(constants.BALANCE_URL + fromSafe)
      assets.selectTokenList(assets.tokenListOptions.allTokens)
      assets.clickOnSendBtn(1)
      loadsafe.inputOwnerAddress(0, toSafe)
      assets.checkSelectedToken(constants.tokenAbbreviation.ttone)
      assets.enterAmount(10)
      navigation.clickOnNewTxBtnS()
      tx.executeFlow_1()
      cy.wait(5000)
    }
    executeTransactionFlow(constants.SEPOLIA_TEST_SAFE_28_SEND_FUNDS_HP1, constants.SEPOLIA_TEST_SAFE_29_SEND_FUNDS_HP2)
    executeTransactionFlow(constants.SEPOLIA_TEST_SAFE_29_SEND_FUNDS_HP2, constants.SEPOLIA_TEST_SAFE_28_SEND_FUNDS_HP1)
    cy.wait(5000)
    main.checkTokenBalanceIsNull(constants.SEPOLIA_TEST_SAFE_29_SEND_FUNDS_HP2, constants.tokenAbbreviation.ttone)
    main.checkTokenBalance(
      constants.SEPOLIA_TEST_SAFE_28_SEND_FUNDS_HP1,
      constants.tokenAbbreviation.ttone,
      safe1Balance_2,
    )
  })

  it('Verify tx creation and execution of NFT with connected signer', () => {
    function executeTransactionFlow(fromSafe, toSafe) {
      visit(constants.balanceNftsUrl + fromSafe)
      nfts.selectNFTs(1)
      nfts.sendNFT()
      nfts.typeRecipientAddress(toSafe)
      nfts.clikOnNextBtn()
      tx.executeFlow_1()
      cy.wait(5000)
    }
    executeTransactionFlow(constants.SEPOLIA_TEST_SAFE_30_SEND_NFT_HP1, constants.SEPOLIA_TEST_SAFE_31_SEND_NFT_HP2)
    executeTransactionFlow(constants.SEPOLIA_TEST_SAFE_31_SEND_NFT_HP2, constants.SEPOLIA_TEST_SAFE_30_SEND_NFT_HP1)
    cy.wait(5000)
    main.checkNFTBalance(constants.SEPOLIA_TEST_SAFE_30_SEND_NFT_HP1, constants.tokenAbbreviation.dor, testToken)
    main.checkTokenBalanceIsNull(constants.SEPOLIA_TEST_SAFE_31_SEND_NFT_HP2, constants.tokenAbbreviation.dor)
  })

  it('Verify tx creation and execution of native token with connected signer', () => {
    function executeTransactionFlow(fromSafe, toSafe, tokenAmount) {
      visit(constants.BALANCE_URL + fromSafe)
      assets.clickOnSendBtn(0)
      loadsafe.inputOwnerAddress(0, toSafe)
      assets.checkSelectedToken(constants.tokenAbbreviation.sep)
      assets.enterAmount(tokenAmount)
      navigation.clickOnNewTxBtnS()
      tx.executeFlow_1()
      cy.wait(5000)
    }
    main.fetchCurrentNonce(constants.SEPOLIA_TEST_SAFE_32_SEND_NATIVE_HP1).then((currentNonceSafe1) => {
      main.fetchCurrentNonce(constants.SEPOLIA_TEST_SAFE_33_SEND_NATIVE_HP2).then((currentNonceSafe2) => {
        executeTransactionFlow(
          constants.SEPOLIA_TEST_SAFE_32_SEND_NATIVE_HP1,
          constants.SEPOLIA_TEST_SAFE_33_SEND_NATIVE_HP2,
          tokenAmount,
        )
        executeTransactionFlow(
          constants.SEPOLIA_TEST_SAFE_33_SEND_NATIVE_HP2,
          constants.SEPOLIA_TEST_SAFE_32_SEND_NATIVE_HP1,
          tokenAmount,
        )
        cy.wait(5000)
        main.verifyNonceChange(constants.SEPOLIA_TEST_SAFE_33_SEND_NATIVE_HP2, currentNonceSafe2 + 1)
        main.verifyNonceChange(constants.SEPOLIA_TEST_SAFE_32_SEND_NATIVE_HP1, currentNonceSafe1 + 1)

        main.checkTokenBalance(constants.SEPOLIA_TEST_SAFE_33_SEND_NATIVE_HP2, constants.tokenAbbreviation.eth, '0')
        main.checkTokenBalance(
          constants.SEPOLIA_TEST_SAFE_32_SEND_NATIVE_HP1,
          constants.tokenAbbreviation.eth,
          safeBalanceEth,
        )
      })
    })
  })
})
