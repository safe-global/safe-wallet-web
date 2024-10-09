import { View, Text, Theme } from 'tamagui'
import React, { type ReactElement } from 'react'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import { IconName } from '@/src/types/iconTypes'

type AlertType = 'error' | 'warning' | 'info'

interface AlertProps {
  type: AlertType
  message: string
  iconName?: IconName
  displayIcon?: boolean
}

const icons = {
  error: <SafeFontIcon name={'alert'} />,
  warning: <SafeFontIcon name={'alert'} />,
  info: <SafeFontIcon name={'info'} />,
}

const getAlertIcon = (type: AlertType, iconName?: IconName, displayIcon?: boolean): ReactElement | null => {
  if (!displayIcon) return null

  return iconName ? <SafeFontIcon name={iconName} /> : icons[type]
}

export const Alert = ({ type, message, iconName, displayIcon = true }: AlertProps) => {
  const Icon = getAlertIcon(type, iconName, displayIcon)

  return (
    <Theme name={type}>
      <View
        backgroundColor={'$background'}
        padding={'$2'}
        justifyContent={'center'}
        alignItems={'center'}
        borderRadius={'$2'}
      >
        <View justifyContent={'center'} alignItems={'center'} flexDirection={'row'}>
          {Icon}
          <Text paddingLeft={'$2'} fontSize={'$3'} fontWeight={'600'} fontFamily={'$body'}>
            {message}
          </Text>
        </View>
      </View>
    </Theme>
  )
}
