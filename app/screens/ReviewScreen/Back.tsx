import { FC } from "react"
import { Button, Screen, Text } from "app/components"
import { View, ViewStyle } from "react-native"
import { Rating } from "ts-fsrs"
import { Definition } from "app/data/entities/definitions"

type BackProps = {
  headWord: string
  definitions: Definition[]
  buttonOnPress: (input: Rating) => void
}
export const Back: FC<BackProps> = function ReviewScreen({ headWord, definitions, buttonOnPress }) {
  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      <Text text={headWord} />
      {definitions.map((definition) => (
        <Text text={definition.content} />
      ))}
      <View style={$buttonContainer}>
        <Button onPress={() => buttonOnPress(Rating.Good)} style={$button} text={"good"} />
        <Button onPress={() => buttonOnPress(Rating.Hard)} style={$button} text={"hard"} />
        <Button onPress={() => buttonOnPress(Rating.Again)} style={$button} text={"again"} />
      </View>
    </Screen>
  )
}

const $screenContainer: ViewStyle = {
  flex: 1,
}

const $buttonContainer: ViewStyle = {
  flexDirection: "row",
}

const $button: ViewStyle = {
  flex: 1,
}
