import React, { useState } from "react"
import { TextStyle, TouchableOpacity, ViewStyle } from "react-native"
import { Screen, Text, TextField } from "../../components"
import { useSQLiteContext } from "expo-sqlite"
import { DBAPI } from "app/data/crud/base"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createHeadWord, findHeadWords } from "app/data/crud/headWords"
import { createCard } from "app/data/crud/cards"
import { useRefetchOnScreenFocus } from "app/hooks/useRefetchOnScreenFocus"
import { colors, spacing } from "app/theme"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { CollectionParamList } from "./CollectionStack"
import { AppTabParamList } from "app/navigators/DemoNavigator"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { cardQueryKey, headWordQueryKey } from "app/queries/keys"
import { CompositeScreenProps } from "@react-navigation/native"

export function CollectionHome({
  navigation,
}: CompositeScreenProps<
  NativeStackScreenProps<CollectionParamList, "CollectionHome">,
  NativeStackScreenProps<AppTabParamList>
>) {
  const db = new DBAPI(useSQLiteContext())
  const queryClient = useQueryClient()
  const [text, setText] = useState("")
  const { data: headWords } = useQuery({
    queryKey: headWordQueryKey.items(),
    queryFn: () => findHeadWords(db),
  })
  const { mutate: createCardWithText } = useMutation({
    mutationFn: () => {
      if (!text) throw new Error("empty text")
      return createHeadWord(db, { content: text }).then(({ id }) =>
        createCard(db, { head_word_id: id }),
      )
    },
    onSettled: () => {
      text && navigation.navigate("WordDetail", { headWord: text, isEdit: false })
      queryClient.invalidateQueries({ queryKey: cardQueryKey.items() })
      queryClient.invalidateQueries({ queryKey: headWordQueryKey.items() })
      setText("")
    },
  })

  useRefetchOnScreenFocus(() => {
    navigation.getParent()?.setOptions({ title: undefined, headerLeft: undefined })
    return new Promise(() => { })
  })

  return (
    <Screen preset="fixed" contentContainerStyle={$screenContainer}>
      <TextField
        autoCapitalize="none"
        autoCorrect={false}
        value={text}
        onChangeText={setText}
        onSubmitEditing={() => createCardWithText()}
        placeholder="Place your text here"
        RightAccessory={() => (
          <TouchableOpacity
            onPress={() => createCardWithText()}
            style={{ marginVertical: "auto", marginRight: spacing.xs }}
          >
            <MaterialCommunityIcons name="plus" size={spacing.xl} color={colors.tint} />
          </TouchableOpacity>
        )}
      />
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
        </TouchableOpacity>
      ))}
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
