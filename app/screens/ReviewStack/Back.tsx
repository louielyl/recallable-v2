import { Button, Screen, Text } from "app/components"
import { ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { FSRS, Grade, Rating, RecordLog } from "ts-fsrs"
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
import { TouchableOpacity } from "react-native-gesture-handler"
import { getParameters } from "app/data/crud/parameters"
import { format } from "date-fns"

export function Back({
  navigation,
  route: {
    params: { headWord },
  },
}: NativeStackScreenProps<ReviewParamList, "Back">) {
  const db = new DBAPI(useSQLiteContext())
  const queryClient = useQueryClient()
  const { data: parameters } = useQuery({
    queryKey: ["fsrs", "parameters"],
    queryFn: () => getParameters(db, {}),
  })
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
  const schedules = parameters && card && new FSRS(parameters).repeat(card, new Date())

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
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={$button}
            onPress={() => mutate({ card: card!, rating: Rating.Good })}
          >
            <Text text="Good" style={$buttonMainText} weight="semiBold" />
            <NextDue schedules={schedules} rating={Rating.Good} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={$button}
            onPress={() => mutate({ card: card!, rating: Rating.Hard })}
          >
            <Text text="Hard" style={$buttonMainText} weight="semiBold" />
            <NextDue schedules={schedules} rating={Rating.Hard} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={$button}
            onPress={() => mutate({ card: card!, rating: Rating.Again })}
          >
            <Text text="Again" style={$buttonMainText} weight="semiBold" />
            <NextDue schedules={schedules} rating={Rating.Again} />
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  )
}

const NextDue = ({ schedules, rating }: { schedules?: RecordLog; rating: Grade }) => {
    return schedules ? (
    <Text size="sm" text={format(schedules[rating].card.due, "yyyy-MM-dd")} style={$buttonText} />
  ) : (
    <></>
  )
}

const $screenContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.palette.neutral100,
}

const $buttonContainer: ViewStyle = {
  flexDirection: "row",
  gap: spacing.xxs,
  marginHorizontal: spacing.xxs,
  marginBottom: spacing.xxs,
}

const $button: ViewStyle = {
  borderColor: colors.tint,
  borderWidth: 1,
  borderRadius: 4,
  justifyContent: "center",
  minHeight: spacing.xxl,
}

const $buttonText: TextStyle = {
  textAlign: "center",
  color: colors.palette.primary400,
}

const $buttonMainText: TextStyle = {
  ...$buttonText,
  color: colors.tint,
}
