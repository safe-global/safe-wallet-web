import React from 'react'
import { Menu, type MenuProps } from '@mui/material'

import css from './styles.module.css'

const ContextMenu = (props: MenuProps) => <Menu className={css.menu} {...props} />

export default ContextMenu
