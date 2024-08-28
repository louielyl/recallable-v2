import React, { useEffect } from "react"
import { ScrollView } from "react-native"
import { CollectionParamList } from "./CollectionStack"
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack"
import { updateDefinitionsWithForm } from "app/data/crud/definitions"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useSQLiteContext } from "expo-sqlite"
import { DBAPI } from "app/data/crud/base"
import { HeaderBackButton } from "@react-navigation/elements"
import { colors, spacing } from "app/theme"
import HeadWordDefinitions from "../HeadWordDetailScreen/HeadWordDefinitions"
import { AppTabParamList } from "app/navigators/DemoNavigator"
import { findHeadWordDefinitionMappingsByHeadWord } from "app/data/crud/headWordDefinitionMappings"
import { Definition } from "app/data/entities/definitions"

export function CollectionWordDetail({
  navigation,
  route: {
    params: { headWord, isEdit },
  },
}: NativeStackScreenProps<CollectionParamList, "WordDetail" | "WordDetailEdit">) {
  const db = new DBAPI(useSQLiteContext())
  const { data: mappings, refetch } = useQuery({
    queryKey: ["find", "definition", "mappings", headWord],
    queryFn: () => findHeadWordDefinitionMappingsByHeadWord(db, { content: headWord }),
  })
  const { mutate } = useMutation({
    mutationFn: (data: { definitions: (Definition & { mappingId: string })[] }) =>
      updateDefinitionsWithForm(db, { ...data, headWord: headWord }),
    onSettled: () => refetch(),
  })

  useEffect(() => {
    ;(
      navigation.getParent() as NativeStackNavigationProp<AppTabParamList, "Collection">
    )?.setOptions({
      title: headWord,
      headerLeft: () => (
        <HeaderBackButton
          onPress={() => navigation.goBack()}
          tintColor={colors.tint}
          labelVisible={false}
        />
      ),
    })
  }, [headWord])

  return (
    <ScrollView
      style={{
        backgroundColor: colors.palette.neutral100,
        flex: 1,
        gap: spacing.xl,
      }}
    >
      <HeadWordDefinitions
        headWord={headWord}
        mappings={mappings}
        isEdit={isEdit}
        updateDefinitions={(data) => mutate(data)}
      />
    </ScrollView>
  )
}
