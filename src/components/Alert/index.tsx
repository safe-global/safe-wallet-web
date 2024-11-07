import { View, Text, Theme } from 'tamagui'
import React, { type ReactElement } from 'react'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import { IconName } from '@/src/types/iconTypes'
import { TouchableOpacity } from 'react-native-gesture-handler'

type AlertType = 'error' | 'warning' | 'info'

interface AlertProps {
  type: AlertType
  message: string
  iconName?: IconName
  displayIcon?: boolean
  fullWidth?: boolean
  endIcon?: React.ReactNode
  startIcon?: React.ReactNode
  onPress?: () => void
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

export const Alert = ({
  type,
  fullWidth = true,
  message,
  iconName,
  startIcon,
  endIcon,
  displayIcon = true,
  onPress,
}: AlertProps) => {
  const Icon = getAlertIcon(type, iconName, displayIcon)

  return (
    <Theme name={type}>
      <TouchableOpacity disabled={!onPress} onPress={onPress}>
        <View flexDirection="row" width="100%" justifyContent="center">
          <View
            alignItems="center"
            gap={'$3'}
            width={fullWidth ? '100%' : 'auto'}
            flexDirection="row"
            justifyContent="center"
            backgroundColor="$background"
            padding="$2"
            borderRadius={'$2'}
          >
            {startIcon ? <View>{startIcon}</View> : Icon}

            <Text fontSize={'$4'} fontWeight={'600'} fontFamily={'$body'}>
              {message}
            </Text>

            {endIcon && <View>{endIcon}</View>}
          </View>
        </View>
      </TouchableOpacity>
    </Theme>
  )
}
