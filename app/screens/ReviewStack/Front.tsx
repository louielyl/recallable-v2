import { Screen, Text } from "app/components"
import { TextStyle, View, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { ReviewParamList } from "./ReviewStack"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { findScheduledCards } from "app/data/crud/cards"
import { useSQLiteContext } from "expo-sqlite"
import { DBAPI } from "app/data/crud/base"
import { colors } from "app/theme"
import { useEffect } from "react"
import { useRefetchOnScreenFocus } from "app/hooks/useRefetchOnScreenFocus"
import { cardQueryKey } from "app/queries/keys"

export function Front({ navigation }: NativeStackScreenProps<ReviewParamList, "Front">) {
  const db = new DBAPI(useSQLiteContext())
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: cardQueryKey.items(),
    queryFn: () => findScheduledCards(db, {}),
  })

  useRefetchOnScreenFocus(() => {
    queryClient.invalidateQueries({ queryKey: cardQueryKey.items() })
    return new Promise(() => { })
  })

  const headWord = data?.[0]?.headWord

  useEffect(() => {
    navigation
      .getParent()
      ?.setOptions({ title: headWord?.content || undefined, headerLeft: undefined })
  })

  if (!headWord)
    return (
      <Screen preset="fixed" contentContainerStyle={$screenContainer}>
        <View
          style={{ flex: 1, justifyContent: "center", backgroundColor: colors.palette.neutral100 }}
        >
          <Text style={{ textAlign: "center" }} text="Congratulations!" size="lg" />
          <Text style={{ textAlign: "center" }} text="You have finished the review today!" />
        </View>
      </Screen>
    )

  return (
    <Screen preset="fixed" contentContainerStyle={$screenContainer}>
      <TouchableOpacity
        style={$onPressContainer}
        onPress={() => navigation.navigate("Back", { headWord: headWord.content! })}
      >
        <View style={$viewStyle}>
          <Text size="md" style={$textStyle} text={"Recall its pronunciation & meaning"} />
          <Text size="sm" style={$textStyle} text={"Then tap to show the answer"} />
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
  backgroundColor: colors.palette.neutral100,
}

const $textStyle: TextStyle = {
  textAlign: "center",
}
