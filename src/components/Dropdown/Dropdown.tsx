import React, { useCallback, useRef } from 'react'
import { H5, ScrollView, Text, View } from 'tamagui'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { StyleSheet } from 'react-native'
import { BackdropComponent, BackgroundComponent } from './sheetComponents'

interface DropdownProps<T> {
  label: string
  leftNode?: React.ReactNode
  children?: React.ReactNode
  dropdownTitle?: string
  items?: T[]
  renderItem?: React.FC<{ item: T; onClose: () => void }>
  keyExtractor?: ({ item, index }: { item: T; index: number }) => string
}

export function Dropdown<T>({
  label,
  leftNode,
  children,
  dropdownTitle,
  items,
  keyExtractor,
  renderItem: Render,
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
      >
        {leftNode}

        <Text fontSize="$4" fontWeight={400}>
          {label}
        </Text>

        <SafeFontIcon testID="dropdown-arrow" name="arrow-down" />
      </View>

      <BottomSheetModal
        enableOverDrag={false}
        snapPoints={[400, '90%']}
        enableDynamicSizing={false}
        ref={bottomSheetModalRef}
        enablePanDownToClose
        overDragResistanceFactor={10}
        backgroundComponent={BackgroundComponent}
        backdropComponent={BackdropComponent}
      >
        <BottomSheetView style={styles.contentContainer}>
          <ScrollView>
            <View minHeight={200} alignItems="center" paddingVertical="$3">
              {dropdownTitle && (
                <H5 marginBottom="$4" fontWeight={600}>
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
    flex: 1,
  },
})
