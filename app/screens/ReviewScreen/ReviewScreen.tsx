import React, { FC } from "react"
import { ViewStyle } from "react-native"
import { Screen, Text } from "../../components"
import { AppTabScreenProps } from "../../navigators/DemoNavigator"
import { useQuery } from "@tanstack/react-query"
import { useSQLiteContext } from "expo-sqlite"
import { DBAPI } from "app/data/crud/base"
import { findScheduledCards } from "app/data/crud/cards"
import { useRefetchOnScreenFocus } from "app/hooks/useRefetchOnScreenFocus"
import { Front } from "./Front"

export const ReviewScreen: FC<AppTabScreenProps<"Review">> = function ReviewScreen(_props) {
  const db = new DBAPI(useSQLiteContext())
  const { data: cards, refetch } = useQuery({
    queryKey: ["find", "card"],
    queryFn: () => findScheduledCards(db, {}),
  })
  useRefetchOnScreenFocus(refetch)

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      {cards ? (
        cards.map((card) => <Text text={card.headWord.content ?? ""} key={card.id} />)
      ) : (
        <></>
      )}
      <Front content={"hello"} />
    </Screen>
  )
}

const $screenContainer: ViewStyle = {
  flex: 1,
}
