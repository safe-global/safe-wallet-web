#!/bin/bash

name=$1

mkdir -p "$name"

cat << EOF > "$name/styles.module.css"
.container {
}
EOF

cat << EOF > "$name/index.tsx"
import { ReactElement } from 'react'
import css from './styles.module.css'

const ${name} = (): ReactElement => {
  return (
    <div className={css.container}>
    </div>
  )
}

export default ${name}
EOF
