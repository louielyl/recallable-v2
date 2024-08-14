import { FC } from "react"
import { Screen, Text } from "app/components"
import { TextStyle, View, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"

type FrontProps = {
  content: string
  screenOnPress: () => void
}
export const Front: FC<FrontProps> = function ReviewScreen({ content, screenOnPress }) {
  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      <TouchableOpacity style={$onPressContainer} onPress={screenOnPress}>
        <Text style={$textStyle} text={content} />
        <View style={$viewStyle}>
          <Text style={$textStyle} text={"recall its pronunciation & meaning"} />
        </View>
      </TouchableOpacity>
    </Screen>
  )
}

const $screenContainer: ViewStyle = {
  flex: 1,
}

const $viewStyle: ViewStyle = {
  flex: 1,
  justifyContent: "center",
}

const $onPressContainer: ViewStyle = {
  height: "100%",
}

const $textStyle: TextStyle = {
  textAlign: "center",
}
