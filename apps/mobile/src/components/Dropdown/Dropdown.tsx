import React, { useCallback, useRef } from 'react'
import { GetThemeValueForKey, H5, ScrollView, Text, View } from 'tamagui'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import { BottomSheetFooterProps, BottomSheetModal, BottomSheetModalProps, BottomSheetView } from '@gorhom/bottom-sheet'
import { StyleSheet } from 'react-native'
import { BackdropComponent, BackgroundComponent } from './sheetComponents'

interface DropdownProps<T> {
  label: string
  leftNode?: React.ReactNode
  children?: React.ReactNode
  dropdownTitle?: string
  items?: T[]
  snapPoints?: BottomSheetModalProps['snapPoints']
  labelProps?: {
    fontSize?: '$4' | '$5' | GetThemeValueForKey<'fontSize'>
    fontWeight: 400 | 500 | 600
  }
  footerComponent?: React.FC<BottomSheetFooterProps>
  renderItem?: React.FC<{ item: T; onClose: () => void }>
  keyExtractor?: ({ item, index }: { item: T; index: number }) => string
}

const defaultLabelProps = {
  fontSize: '$4',
  fontWeight: 400,
} as const

export function Dropdown<T>({
  label,
  leftNode,
  children,
  dropdownTitle,
  items,
  snapPoints = [600, '90%'],
  keyExtractor,
  renderItem: Render,
  labelProps = defaultLabelProps,
  footerComponent,
}: DropdownProps<T>) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handleModalClose = useCallback(() => {
    bottomSheetModalRef.current?.dismiss()
  }, [])

  const hasCustomItems = items && Render

  return (
    <>
      <View
        alignItems="center"
        testID="dropdown-label-view"
        onPress={handlePresentModalPress}
        flexDirection="row"
        marginBottom="$3"
        columnGap="$2"
      >
        {leftNode}

        <Text fontSize={labelProps.fontSize} fontWeight={labelProps.fontWeight}>
          {label}
        </Text>

        <SafeFontIcon testID="dropdown-arrow" name="arrow-down" />
      </View>

      <BottomSheetModal
        enableOverDrag={false}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        ref={bottomSheetModalRef}
        enablePanDownToClose
        overDragResistanceFactor={10}
        backgroundComponent={BackgroundComponent}
        backdropComponent={BackdropComponent}
        footerComponent={footerComponent}
      >
        <BottomSheetView style={styles.contentContainer}>
          <ScrollView>
            <View minHeight={200} alignItems="center" paddingVertical="$3">
              {dropdownTitle && (
                <H5 marginBottom="$6" fontWeight={600}>
                  {dropdownTitle}
                </H5>
              )}

              <View alignItems="flex-start" paddingBottom="$4" width="100%">
                {hasCustomItems
                  ? items.map((item, index) => (
                      <Render
                        key={keyExtractor ? keyExtractor({ item, index }) : index}
                        item={item}
                        onClose={handleModalClose}
                      />
                    ))
                  : children}
              </View>
            </View>
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
})
