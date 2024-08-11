import React, { FC, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Button, Screen, Text } from "../components"
import { AppTabScreenProps } from "../navigators/DemoNavigator"
import { useSQLiteContext } from "expo-sqlite"
import { DBAPI } from "app/data/crud/base"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createHeadWord, findHeadWords } from "app/data/crud/headWords"
import { createCard, deleteCard } from "app/data/crud/cards"
import { useRefetchOnScreenFocus } from "app/hooks/useRefetchOnScreenFocus"
import { spacing } from "app/theme"
import { TextInput } from "react-native-gesture-handler"

export const CollectionScreen: FC<AppTabScreenProps<"Collection">> = function CollectionScreen(
  _props,
) {
  const db = new DBAPI(useSQLiteContext())
  const [text, setText] = useState("")
  const { data: headWords, refetch } = useQuery({
    queryKey: ["find", "headword"],
    queryFn: () => findHeadWords(db),
  })
  const { mutate: createCardWithExistingHeadWord } = useMutation({
    mutationFn: ({ head_word_id }: { head_word_id: string }) => createCard(db, { head_word_id }),
    onSettled: () => refetch(),
  })
  const { mutate: createCardWithText } = useMutation({
    mutationFn: () =>
      createHeadWord(db, { content: text }).then(({ id }) => createCard(db, { head_word_id: id })),
    onSettled: () => {
      refetch()
      setText("")
    },
  })
  const { mutate: deleteExistingCard } = useMutation({
    mutationFn: ({ head_word_id }: { head_word_id: string }) => deleteCard(db, { head_word_id }),
    onSettled: () => refetch(),
  })

  useRefetchOnScreenFocus(refetch)

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      {headWords?.map((headWord) => (
        <View key={headWord.id} style={$headWordContainer}>
          <Text style={$headWord} text={headWord.content ?? ""} />
          <Button
            onPress={() => createCardWithExistingHeadWord({ head_word_id: headWord.id })}
            style={$button}
            disabled={headWord.is_learning}
            children={<Text text={headWord.is_learning ? "added" : "add"} />}
          />
          {headWord.is_learning ? (
            <Button
              onPress={() => deleteExistingCard({ head_word_id: headWord.id })}
              style={$button}
              disabled={!headWord.is_learning}
              children={<Text text="X" />}
            />
          ) : (
            <></>
          )}
        </View>
      ))}
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        style={$textInput}
        value={text}
        onChangeText={setText}
        onSubmitEditing={() => createCardWithText()}
        placeholder="Place your text here"
      />
      <Button onPress={() => createCardWithText()} text={"add new word"} />
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

const $headWord: TextStyle = {
  flex: 1,
}

const $textInput: TextStyle = {
  paddingVertical: 16,
}

const $button: TextStyle = {
  minHeight: 0,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.xxs,
  width: spacing.xxl * 2,
}
