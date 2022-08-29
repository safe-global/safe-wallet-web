type Props = {
  appUrl: string
  chainId: string
}

const SafeAppLanding = ({ appUrl, chainId }: Props) => {
  return (
    <h1>
      sup {appUrl} {chainId}
    </h1>
  )
}

export { SafeAppLanding }
