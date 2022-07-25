import WALLET_ICONS, { ALL_WALLET_KEYS } from '@/components/common/WalletIcon/icons'

const WalletIcon = ({ provider }: { provider: string }) => {
  const icon = WALLET_ICONS[provider.toUpperCase() as keyof ALL_WALLET_KEYS]
  return <img src={icon.src} alt={`${provider} wallet icon`} width={24} />
}

export default WalletIcon
