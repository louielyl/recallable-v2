import { FC } from "react"
import { Screen, Text } from "app/components"
import { ViewStyle } from "react-native"

type FrontProps = {
  content: string
}
export const Front: FC<FrontProps> = function ReviewScreen({ content }) {
  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      <Text text={content} />
    </Screen>
  )
}

const $screenContainer: ViewStyle = {
  flex: 1,
}
