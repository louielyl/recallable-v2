import { Button, Screen } from "app/components"
import { ScrollView, View, ViewStyle } from "react-native"
import { Rating } from "ts-fsrs"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ReviewParamList } from "./ReviewStack"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSQLiteContext } from "expo-sqlite"
import { DBAPI } from "app/data/crud/base"
import { CardSchedule } from "app/data/entities/cards"
import { getCardByHeadWord, scheduleCard } from "app/data/crud/cards"
import { colors, spacing } from "app/theme"
import { useEffect } from "react"
import { HeaderBackButton } from "@react-navigation/elements"
import HeadWordDefinitions from "../HeadWordDetailScreen/HeadWordDefinitions"
import { findHeadWordDefinitionMappingsByHeadWord } from "app/data/crud/headWordDefinitionMappings"

export function Back({
  navigation,
  route: {
    params: { headWord },
  },
}: NativeStackScreenProps<ReviewParamList, "Back">) {
  const db = new DBAPI(useSQLiteContext())
  const queryClient = useQueryClient()
  const invalidateReviewCards = () => queryClient.invalidateQueries({ queryKey: ["find", "card"] })
  const { data: mappings } = useQuery({
    queryKey: ["find", "definition", "mappings", headWord],
    queryFn: () => findHeadWordDefinitionMappingsByHeadWord(db, { content: headWord }),
  })
  const { data: card } = useQuery({
    queryKey: ["get", "card", "by", "headWord", headWord],
    queryFn: () => getCardByHeadWord(db, { content: headWord }),
  })
  const { mutate } = useMutation({
    mutationFn: ({ card, rating }: CardSchedule) => scheduleCard(db, { card, rating }),
    onSuccess: () => {
      invalidateReviewCards()
      navigation.navigate("Front")
    },
  })

  useEffect(() => {
    navigation.getParent()?.setOptions({
      title: headWord,
      headerLeft: () => (
        <HeaderBackButton
          onPress={() => navigation.goBack()}
          tintColor={colors.tint}
          labelVisible={false}
        />
      ),
    })
  })

  return (
    <Screen preset="fixed" contentContainerStyle={$screenContainer}>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: colors.palette.neutral100,
          gap: spacing.xl,
        }}
      >
        <HeadWordDefinitions
          isEdit={false}
          headerProps={{ style: { paddingBottom: spacing.sm } }}
          contentProps={{ style: { flex: 1, backgroundColor: colors.palette.neutral100 } }}
          headWord={headWord}
          mappings={mappings}
        />
      </ScrollView>
      <View style={$buttonContainer}>
        <Button
          onPress={() => mutate({ card: card!, rating: Rating.Good })}
          style={$button}
          text={"good"}
        />
        <Button
          onPress={() => mutate({ card: card!, rating: Rating.Hard })}
          style={$button}
          text={"hard"}
        />
        <Button
          onPress={() => mutate({ card: card!, rating: Rating.Again })}
          style={$button}
          text={"again"}
        />
      </View>
    </Screen>
  )
}

const $screenContainer: ViewStyle = {
  flex: 1,
}

const $buttonContainer: ViewStyle = {
  alignSelf: "flex-end",
  flexDirection: "row",
}

const $button: ViewStyle = {
  flex: 1,
}
