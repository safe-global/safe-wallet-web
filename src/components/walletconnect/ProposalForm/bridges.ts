const DangerousBridges = [
  'bridge.arbitrum.io',
  'bridge.base.org',
  'cbridge.celer.network',
  'www.orbiter.finance',
  'zksync-era.l2scan.co',
  'app.optimism.io',
  'www.portalbridge.com',
  'wallet.polygon.technology',
  'app.rhino.fi',
]

const RiskyBridges = [
  'across.to',
  'app.allbridge.io',
  'core.allbridge.io',
  'bungee.exchange',
  'www.carrier.so',
  'app.chainport.io',
  'bridge.gnosischain.com',
  'app.hop.exchange',
  'app.interport.fi',
  'jumper.exchange',
  'www.layerswap.io',
  'meson.fi',
  'satellite.money',
  'stargate.finance',
  'app.squidrouter.com',
  'app.symbiosis.finance',
  'www.synapseprotocol.com',
  'app.thevoyager.io',
  'portal.txsync.io',
  'bridge.wanchain.org',
  'app.xy.finance',
]

export const isDangerousBridge = (origin: string) => {
  return DangerousBridges.some((bridge) => origin.includes(bridge))
}

export const isRiskyBridge = (origin: string) => {
  return RiskyBridges.some((bridge) => origin.includes(bridge))
}
