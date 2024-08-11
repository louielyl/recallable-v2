import React, { FC } from "react"
import { ViewStyle } from "react-native"
import { Screen, Text } from "../../components"
import { AppTabScreenProps } from "../../navigators/DemoNavigator"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useSQLiteContext } from "expo-sqlite"
import { DBAPI } from "app/data/crud/base"
import { findScheduledCards, scheduleCard } from "app/data/crud/cards"
import { useRefetchOnScreenFocus } from "app/hooks/useRefetchOnScreenFocus"
import { Front } from "./Front"
import { CardSchedule } from "app/data/entities/cards"

export const ReviewScreen: FC<AppTabScreenProps<"Review">> = function ReviewScreen(_props) {
  const db = new DBAPI(useSQLiteContext())
  const {
    data: cards,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["find", "card"],
    queryFn: () => findScheduledCards(db, {}),
  })
  const { mutate } = useMutation({
    mutationFn: ({ card, rating }: CardSchedule) => scheduleCard(db, { card, rating }),
    onSettled: () => refetch(),
  })

  useRefetchOnScreenFocus(refetch)

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      {isLoading || !cards || (cards && cards.length === 0) ? (
        <Text text="You have finished every word today!" />
      ) : (
        <Front
          content={cards[0].headWord.content!}
          buttonOnPress={(rating) => mutate({ card: cards[0], rating })}
        />
      )}
    </Screen>
  )
}

const $screenContainer: ViewStyle = {
  flex: 1,
}
