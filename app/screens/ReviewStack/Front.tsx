import { Screen, Text } from "app/components"
import { TextStyle, View, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { ReviewParamList } from "./ReviewStack"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useQuery } from "@tanstack/react-query"
import { findScheduledCards } from "app/data/crud/cards"
import { useSQLiteContext } from "expo-sqlite"
import { DBAPI } from "app/data/crud/base"

export function Front({ navigation }: NativeStackScreenProps<ReviewParamList, "Front">) {
  const db = new DBAPI(useSQLiteContext())
  const { data } = useQuery({
    queryKey: ["find", "card"],
    queryFn: () => findScheduledCards(db, {}),
  })
  const headWord = data?.[0]?.headWord

  if (!headWord)
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={{ textAlign: "center" }} text="Congratulations!" />
          <Text style={{ textAlign: "center" }} text="You have finished the review today!" />
        </View>
      </Screen>
    )
  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      <TouchableOpacity
        style={$onPressContainer}
        onPress={() => navigation.navigate("Back", { headWord: headWord.content! })}
      >
        <Text style={$textStyle} text={headWord.content!} />
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
