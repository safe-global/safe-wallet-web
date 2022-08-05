const PaddedMain: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <main style={{ padding: 'var(--space-3)' }}>{children}</main>
}

export { PaddedMain }
