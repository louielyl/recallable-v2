import React, { useEffect, useState } from "react"
import { TextStyle, TouchableOpacity, ViewStyle } from "react-native"
import { Button, Screen, Text, TextField } from "../../components"
import { useSQLiteContext } from "expo-sqlite"
import { DBAPI } from "app/data/crud/base"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createHeadWord, findHeadWords } from "app/data/crud/headWords"
import { createCard, deleteCard } from "app/data/crud/cards"
import { useRefetchOnScreenFocus } from "app/hooks/useRefetchOnScreenFocus"
import { colors, spacing } from "app/theme"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { cloneDeep } from "lodash"
import { CommonActions, CompositeScreenProps } from "@react-navigation/native"
import { CollectionParamList } from "./CollectionStack"
import { AppTabParamList } from "app/navigators/DemoNavigator"

export function CollectionHome({
  navigation,
}: CompositeScreenProps<
  NativeStackScreenProps<CollectionParamList, "CollectionHome">,
  NativeStackScreenProps<AppTabParamList>
>) {
  const db = new DBAPI(useSQLiteContext())
  const queryClient = useQueryClient()
  const [text, setText] = useState("")
  const { data: headWords, refetch } = useQuery({
    queryKey: ["find", "headword"],
    queryFn: () => findHeadWords(db),
  })
  const { mutate: createCardWithExistingHeadWord } = useMutation({
    mutationFn: ({ head_word_id }: { head_word_id: string }) => createCard(db, { head_word_id }),
    onSettled: () => {
      refetch()
      invalidateReviewStack()
    },
  })
  const { mutate: createCardWithText } = useMutation({
    mutationFn: () => {
      if (!text) throw new Error("empty text")
      return createHeadWord(db, { content: text })
        .then(({ id }) => createCard(db, { head_word_id: id }))
        .then(invalidateReviewStack)
    },
    onSettled: () => {
      refetch()
      setText("")
    },
  })
  const { mutate: deleteExistingCard } = useMutation({
    mutationFn: ({ head_word_id }: { head_word_id: string }) => deleteCard(db, { head_word_id }),
    onSettled: () => {
      refetch()
      invalidateReviewStack()
    },
  })

  useRefetchOnScreenFocus(refetch)

  useEffect(() => {
    // FIX: Correct type for getParent
    navigation.getParent()?.setOptions({ title: undefined, headerLeft: undefined })
  })

  const invalidateReviewStack = () => {
    queryClient.invalidateQueries({ queryKey: ["find", "card"] })
    navigation.getParent()?.dispatch((state) => {
      // NOTE: Follow the React Navigation's design and do not modify the state directly
      const clonedRoutes = cloneDeep(state.routes)
      // NOTE: Need to preserve current screen, so we will only update the ReviewStack
      // TODO: Fix route.name type
      const reviewRoutes = clonedRoutes.find((route) => route.name === "Review")
      if (reviewRoutes?.state) {
        reviewRoutes.state = {
          ...reviewRoutes.state,
          index: 0,
        }
      }
      // NOTE: Return to first screen (Front)
      reviewRoutes?.state?.routes.splice(1)

      return CommonActions.reset({
        ...state,
        routes: clonedRoutes,
      })
    })
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$screenContainer}>
      {headWords?.map((headWord) => (
        <TouchableOpacity
          onPress={() => {
            headWord.content &&
              navigation.navigate("WordDetail", { headWord: headWord.content, isEdit: false })
          }}
          key={headWord.id}
          style={$headWordContainer}
        >
          <Text style={$headWord} text={headWord.content ?? ""} />
          {!headWord.is_learning ? (
            <Button
              onPress={() => createCardWithExistingHeadWord({ head_word_id: headWord.id })}
              style={$button}
              disabled={headWord.is_learning}
              text="add"
            />
          ) : (
            <Button
              onPress={() => deleteExistingCard({ head_word_id: headWord.id })}
              style={$button}
              disabled={!headWord.is_learning}
              text="remove"
            />
          )}
        </TouchableOpacity>
      ))}
      <TextField
        autoCapitalize="none"
        autoCorrect={false}
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
  backgroundColor: colors.palette.neutral100,
}

const $headWordContainer: TextStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginHorizontal: spacing.xs,
}

const $headWord: TextStyle = {
  flex: 1,
}

const $button: TextStyle = {
  minHeight: 0,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.xxs,
  minWidth: spacing.xxl * 2,
}
