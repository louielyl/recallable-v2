import React, { FC } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Button, Screen, Text } from "../components"
import { AppTabScreenProps } from "../navigators/DemoNavigator"
import { useSQLiteContext } from "expo-sqlite"
import { DBAPI } from "app/data/crud/base"
import { useMutation, useQuery } from "@tanstack/react-query"
import { findHeadWords } from "app/data/crud/headWords"
import { createCard } from "app/data/crud/cards"
import { useRefetchOnScreenFocus } from "app/hooks/useRefetchOnScreenFocus"
import { spacing } from "app/theme"

export const CollectionScreen: FC<AppTabScreenProps<"Collection">> = function CollectionScreen(
  _props,
) {
  const db = new DBAPI(useSQLiteContext())
  const { data: headWords, refetch } = useQuery({
    queryKey: ["find", "headword"],
    queryFn: () => findHeadWords(db),
  })
  const { mutate } = useMutation({
    mutationKey: ["create", "card"],
    mutationFn: ({ head_word_id }: { head_word_id: string }) => createCard(db, { head_word_id }),
    onSettled(data, error) {
      console.log("data", data)
      console.log("error", error)
      refetch()
    },
  })
  useRefetchOnScreenFocus(refetch)

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      {headWords?.map((headWord) => (
        <View key={headWord.id} style={$headWordContainer}>
          <Text text={headWord.content ?? ""} />
          <Button
            onPress={() => mutate({ head_word_id: headWord.id })}
            style={$button}
            disabled={headWord.is_learning}
            children={<Text text={headWord.is_learning ? "added" : "add"} />}
          />
        </View>
      ))}
    </Screen>
  )
}

const $screenContainer: ViewStyle = {
  flex: 1,
}

const $headWordContainer: TextStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $button: TextStyle = {
  minHeight: 0,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.xxs,
  width: spacing.xxl * 2,
}
