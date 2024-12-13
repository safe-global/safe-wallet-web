import type { ContractNetworksConfig } from "@safe-global/protocol-kit";
import * as chains from "viem/chains";

const defaultL2Addresses = {
  multiSendAddress: "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761",
  safeMasterCopyAddress: "0x3E5c63644E683549055b9Be8653de26E0B4CD36E",
  safeProxyFactoryAddress: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
  multiSendCallOnlyAddress: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
  fallbackHandlerAddress: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
  createCallAddress: "0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4",
  signMessageLibAddress: "0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2",
  safeSingletonAddress: "0x3E5c63644E683549055b9Be8653de26E0B4CD36E",
  simulateTxAccessorAddress: "0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da",
};


const Bitlayer = {
  id: 200810 as const,
  name: "Bitlayer",
  network: "Bitlayer",
  nativeCurrency: {
    decimals: 18,
    name: "Bitcoin",
    symbol: "BTC",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.bitlayer.org"],
    },
    public: {
      http: ["https://testnet-rpc.bitlayer.org"],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "Explorer",
      url: "https://api-testnet.btrscan.com",
    },
    default: { name: "Explorer", url: "https://api-testnet.btrscan.com" },
  },
};

export const contractNetworks: ContractNetworksConfig = {
  [`${Bitlayer.id}`]: defaultL2Addresses,
};

export const allowedNetworks: { [chainId: number]: chains.Chain } = {
  [Bitlayer.id]: Bitlayer,
};

Object.keys(contractNetworks).map((network) => {
  if (allowedNetworks[+network]) {
    return;
  }
  const viemChain = Object.values(chains).find(
    (chain) => chain.id.toString() === network
  );

  if (!viemChain) {
    return;
  }
  allowedNetworks[+network] = viemChain;
});
