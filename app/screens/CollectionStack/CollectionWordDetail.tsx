import React, { useEffect } from "react"
import { ScrollView } from "react-native"
import { CollectionParamList } from "./CollectionStack"
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack"
import { updateDefinitionsWithForm } from "app/data/crud/definitions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSQLiteContext } from "expo-sqlite"
import { DBAPI } from "app/data/crud/base"
import { HeaderBackButton } from "@react-navigation/elements"
import { colors, spacing } from "app/theme"
import HeadWordDefinitions from "../HeadWordDetailScreen/HeadWordDefinitions"
import { AppTabParamList } from "app/navigators/DemoNavigator"
import { findHeadWordDefinitionMappingsByHeadWord } from "app/data/crud/headWordDefinitionMappings"
import { Definition } from "app/data/entities/definitions"
import * as cardCRUD from "app/data/crud/cards"
import * as headWordCRUD from "app/data/crud/headWords"
import { cardQueryKey, headWordDefinitionMappingQueryKey, headWordQueryKey } from "app/queries/keys"

export function CollectionWordDetail({
  navigation,
  route: {
    params: { headWord: headWordContent, isEdit },
  },
}: NativeStackScreenProps<CollectionParamList, "WordDetail" | "WordDetailEdit">) {
  const db = new DBAPI(useSQLiteContext())
  const queryClient = useQueryClient()
  const { data: headWord } = useQuery({
    queryKey: headWordQueryKey.itemByContent(headWordContent),
    queryFn: () => headWordCRUD.getHeadWord(db, { content: headWordContent }),
  })
  const { data: mappings } = useQuery({
    queryKey: headWordDefinitionMappingQueryKey.itemByContent(headWordContent),
    queryFn: () => findHeadWordDefinitionMappingsByHeadWord(db, { content: headWordContent }),
  })
  const { data: card } = useQuery({
    queryKey: cardQueryKey.itemByContent(headWordContent),
    queryFn: () => cardCRUD.getCardByHeadWord(db, { content: headWordContent }),
  })
  const { mutate: updateDefinition } = useMutation({
    mutationFn: (data: { definitions: (Definition & { mappingId: string })[] }) =>
      updateDefinitionsWithForm(db, { ...data, headWord: headWordContent }),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: headWordDefinitionMappingQueryKey.itemByContent(headWordContent),
      }),
  })
  const { mutate: addCard } = useMutation({
    mutationFn: ({ head_word_id }: { head_word_id: string }) =>
      cardCRUD.createCard(db, { head_word_id }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: cardQueryKey.itemByContent(headWordContent) }),
  })
  const { mutate: deleteCard } = useMutation({
    mutationFn: ({ head_word_id }: { head_word_id: string }) =>
      cardCRUD.deleteCard(db, { head_word_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardQueryKey.itemByContent(headWordContent) })
      navigation.goBack()
    },
  })
  const { mutate: deleteHeadWord } = useMutation({
    mutationFn: () => headWordCRUD.deleteHeadWord(db, { content: headWordContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: headWordQueryKey.items() })
      queryClient.invalidateQueries({ queryKey: cardQueryKey.items() })
      navigation.goBack()
    },
  })

  useEffect(() => {
    ; (
      navigation.getParent() as NativeStackNavigationProp<AppTabParamList, "Collection">
    )?.setOptions({
      title: headWordContent,
      headerLeft: () => (
        <HeaderBackButton
          onPress={() => navigation.goBack()}
          tintColor={colors.tint}
          labelVisible={false}
        />
      ),
    })
  }, [headWordContent])

  return (
    <ScrollView
      style={{
        backgroundColor: colors.palette.neutral100,
        flex: 1,
        gap: spacing.xl,
      }}
    >
      <HeadWordDefinitions
        headWord={headWordContent}
        card={card}
        mappings={mappings}
        isEdit={isEdit}
        isCollectionMode={true}
        updateDefinitions={updateDefinition}
        deleteHeadWord={() => {
          headWord && deleteHeadWord()
        }}
        deleteCard={() => {
          headWord && deleteCard({ head_word_id: headWord.id })
        }}
        addCard={() => {
          headWord && addCard({ head_word_id: headWord.id })
        }}
      />
    </ScrollView>
  )
}
