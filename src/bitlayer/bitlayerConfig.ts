export const bitlayerConfig = {
    "chainId": "200810",
    "chainName": "Bitlayer",
    "description": "",
    "chainLogoUri": "https://safe-transaction-assets.staging.5afe.dev/chains/1/chain_logo.png",
    "l2": true,
    "isTestnet": true,
    "nativeCurrency": {
        "name": "Bitcoin",
        "symbol": "BTC",
        "decimals": 18,
        "logoUri": "https://safe-transaction-assets.staging.5afe.dev/chains/1/currency_logo.png"
    },
    "transactionService": "https://safe-transaction-mainnet.staging.5afe.dev/",
    "blockExplorerUriTemplate": {
        "address": "https://testnet-scan.bitlayer.org/en-us/address/{{address}}",
        "txHash": "https://testnet-scan.bitlayer.org/en-us/tx/{{txHash}}",
        "api": "https://api-sepolia.etherscan.io/api?module={{module}}&action={{action}}&address={{address}}&apiKey={{apiKey}}"
    },
    "disabledWallets": [
        "socialSigner"
    ],
    "ensRegistryAddress": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    "features": [
        "CONTRACT_INTERACTION",
        "DEFAULT_TOKENLIST",
        "DOMAIN_LOOKUP",
        "EIP1271",
        "EIP1559",
        "ERC721",
        "NATIVE_WALLETCONNECT",
        "PUSH_NOTIFICATIONS",
        "RECOVERY",
        "RISK_MITIGATION",
        "SAFE_APPS",
        "SAFE_TX_GAS_OPTIONAL",
        "SPENDING_LIMIT",
        "TX_SIMULATION"
    ],
    "gasPrice": [],
    "publicRpcUri": {
        "authentication": "NO_AUTHENTICATION",
        "value": "https://testnet-rpc.bitlayer.org"
    },
    "rpcUri": {
        "authentication": "NO_AUTHENTICATION",
        "value": "https://testnet-rpc.bitlayer.org"
    },
    "shortName": "Bitlayer",
    "theme": {
        "textColor": "#001428",
        "backgroundColor": "#DDDDDD"
    }
}