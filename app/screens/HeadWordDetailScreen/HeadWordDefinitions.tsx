import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Text, TextField } from "app/components"
import { Definition, partOfSpeechToAbbreviation } from "app/data/entities/definitions"
import { HeadWord } from "app/data/entities/headWords"
import { colors, spacing } from "app/theme"
import React, { Fragment, useEffect, useLayoutEffect, useMemo } from "react"
import {
  View,
  ViewProps,
  Platform,
  TextStyle,
  Alert,
  TouchableOpacity,
  ViewStyle,
} from "react-native"
import { CollectionParamList } from "../CollectionStack/CollectionStack"
import { DBHeadWordDefinitionMapping } from "app/data/entities/headWordDefinitionMappings"
import { useFieldArray, useForm, Controller } from "react-hook-form"
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated"
import { Entypo, Feather, FontAwesome } from "@expo/vector-icons"
import { Card } from "app/data/entities/cards"
import { ScrollView } from "react-native-gesture-handler"

// import { Container } from './styles';
export type HeadWordDefinitionsProps = {
  addCard?: () => void
  card?: Card | null
  deleteCard?: () => void
  deleteHeadWord?: () => void
  headWord: HeadWord["content"]
  headerProps?: ViewProps
  isCollectionMode: boolean
  isEdit: boolean
  mappings: (DBHeadWordDefinitionMapping & { definition: Definition })[] | undefined
  updateDefinitions?: (data: any) => void
}

export default function HeadWordDefinitions({
  addCard,
  card,
  deleteHeadWord,
  deleteCard,
  headWord,
  isCollectionMode,
  isEdit,
  mappings,
  updateDefinitions,
}: HeadWordDefinitionsProps) {
  const navigation = useNavigation<NativeStackNavigationProp<CollectionParamList>>()
  const definitions = useMemo(
    () => mappings?.map((mapping) => ({ ...mapping.definition, mappingId: mapping.id })),
    [mappings],
  )
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<{
    definitions: Partial<Definition & { mappingId: string }>[]
  }>({
    defaultValues: { definitions: [] },
  })
  const { fields, append, remove } = useFieldArray<{
    definitions: Partial<Definition & { mappingId: string }>[]
  }>({ control, name: "definitions" })

  useEffect(() => {
    definitions && reset({ definitions })
  }, [definitions])

  useLayoutEffect(() => {
    return () => {
      isEdit && handleSubmit(onSubmit)()
    }
  }, [])

  const onSubmit = (data: any) => updateDefinitions && updateDefinitions(data)

  const deleteCardAlert = () =>
    Alert.alert(
      "Remove from Collection?",
      "The study record will be permanetly deleted from the app.",
      [
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteCard,
        },
        { text: "Cancel", style: "cancel" },
      ],
    )

  const deleteDefinitionAlert = (index: number) =>
    Alert.alert("Delete Definition?", "This definition will be permanetly deleted from the app.", [
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          remove(index)
        },
      },
      { text: "Cancel", style: "cancel" },
    ])

  const discardAlert = () =>
    Alert.alert("Undo Changes?", "This will undo the changes you just did.", [
      {
        text: "Undo",
        style: "destructive",
        onPress: () => {
          reset({ definitions })
        },
      },
      { text: "Cancel", style: "cancel" },
    ])

  const addNewDefinition = () =>
    append({
      content: "",
      created_at: undefined,
      deleted_at: null,
      id: undefined,
      is_adjective: undefined,
      is_adverb: undefined,
      is_comparative_adjective: undefined,
      is_conjunction: undefined,
      is_countable_noun: undefined,
      is_determiner: undefined,
      is_exclamation: undefined,
      is_interjection: undefined,
      is_intransitive_verb: undefined,
      is_noun: undefined,
      is_plural_noun: undefined,
      is_predeterminer: undefined,
      is_prefix: undefined,
      is_preposition: undefined,
      is_pronoun: undefined,
      is_singular_noun: undefined,
      is_sufffix: undefined,
      is_superlative_adjective: undefined,
      is_transitive_verb: undefined,
      is_uncountable_noun: undefined,
      is_verb: undefined,
      // TODO: Make default values dynamic
      language: "english",
      source: "user",
      updated_at: undefined,
      mappingId: undefined,
    })

  const navigateToEdit = () =>
    navigation.navigate("WordDetailEdit", { headWord: headWord!, isEdit: true })

  return (
    <>
      <ScrollView
        style={{
          gap: spacing.xxs,
          paddingHorizontal: spacing.xs,
          paddingVertical: spacing.sm,
          backgroundColor: colors.palette.neutral100,
        }}
      >
        <View style={{ flexDirection: "row", gap: spacing.xxs, marginBottom: spacing.sm }}>
          <Text
            text={isEdit ? "Edit Definitions" : "Definitions"}
            style={{ textDecorationLine: "underline", flex: 1, color: colors.tint }}
            preset="formLabel"
          />
          {isEdit ? (
            <>
              <TouchableOpacity style={{ alignSelf: "center" }} onPress={discardAlert}>
                <FontAwesome
                  name="undo"
                  size={spacing.md}
                  color={isDirty ? colors.tint : colors.palette.primary100}
                />
              </TouchableOpacity>
              <TouchableOpacity style={{ alignSelf: "center" }} onPress={addNewDefinition}>
                <Entypo name="plus" size={spacing.lg} color={colors.tint} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={navigateToEdit}>
              <Feather name="edit-3" color={colors.tint} size={spacing.lg} />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ gap: spacing.sm, paddingBottom: spacing.md }}>
          {isEdit ? (
            fields.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeIn}
                exiting={FadeOut}
                layout={LinearTransition}
              >
                <View style={{ flexDirection: "row", marginBottom: spacing.xxs }}>
                  <View style={$abbreviationContainer}>
                    {Object.entries(partOfSpeechToAbbreviation).map(([key, abbreviation]) => (
                      <Controller
                        key={`${item.id}.${key}`}
                        control={control}
                        name={`definitions.${index}.${key as keyof Definition}`}
                        render={({ field }) => {
                          const { value } = field
                          return (
                            <TouchableOpacity
                              onPress={() =>
                                setValue(
                                  `definitions.${index}.${key as keyof Definition}`,
                                  !value,
                                  {
                                    shouldDirty: true,
                                  },
                                )
                              }
                            >
                              <Text
                                text={abbreviation}
                                style={value ? $partOfSpeechLabelSelected : $partOfSpeechLabel}
                              />
                            </TouchableOpacity>
                          )
                        }}
                      />
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => deleteDefinitionAlert(index)}>
                    <Entypo name="cross" size={spacing.md} color={colors.textDim} />
                  </TouchableOpacity>
                </View>
                <Controller
                  control={control}
                  name={`definitions.${index}.content`}
                  render={({ field }) => (
                    <TextField multiline onChangeText={field.onChange} {...field} />
                  )}
                />
              </Animated.View>
            ))
          ) : definitions && definitions?.length > 0 ? (
            definitions.map((definition) => (
              <Animated.View
                key={definition.id}
                style={{ flexDirection: "row" }}
                entering={FadeIn}
                exiting={FadeOut}
                layout={LinearTransition}
              >
                <View style={{ marginHorizontal: spacing.xxs, flex: 1 }}>
                  <View style={$abbreviationContainer}>
                    {Object.entries(partOfSpeechToAbbreviation).map(([key, value]) =>
                      definition[key as keyof Definition] ? (
                        <TouchableOpacity key={key} disabled={!isEdit}>
                          <Text text={value} style={$partOfSpeechLabelSelected} />
                        </TouchableOpacity>
                      ) : isEdit ? (
                        <TouchableOpacity key={key} disabled={!isEdit}>
                          <Text text={value} style={$partOfSpeechLabel} />
                        </TouchableOpacity>
                      ) : (
                        <Fragment key={key} />
                      ),
                    )}
                  </View>
                  <Text text={definition.content} />
                </View>
              </Animated.View>
            ))
          ) : (
            <></>
          )}
          {isCollectionMode && card ? (
            <TouchableOpacity
              style={{
                alignSelf: "center",
                flexDirection: "row",
                gap: spacing.xs,
                borderWidth: 1,
                borderRadius: spacing.xxs,
                borderColor: colors.palette.angry400,
                paddingVertical: spacing.xxs,
                paddingHorizontal: spacing.xs,
                marginTop: spacing.sm,
              }}
              onPress={deleteCardAlert}
            >
              <Text
                text={"Remove from collection"}
                size="xs"
                style={{
                  color: colors.palette.angry400,
                }}
              />
              <Feather
                name="trash-2"
                size={spacing.md}
                color={colors.palette.angry400}
                style={{ marginVertical: "auto" }}
              />
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
      </ScrollView>
      {isCollectionMode && !card ? (
        <TouchableOpacity
          style={{
            alignSelf: "center",
            flexDirection: "row",
            gap: spacing.xs,
            borderWidth: 2,
            borderRadius: spacing.xxs,
            borderColor: colors.palette.safe400,
            paddingVertical: spacing.xxs,
            paddingHorizontal: spacing.xs,
          }}
          onPress={addCard}
        >
          <Text
            text={"Add to collection"}
            size="xs"
            style={{
              color: colors.palette.safe400,
            }}
          />
          <Entypo name="plus" size={spacing.lg} color={colors.palette.safe400} />
        </TouchableOpacity>
      ) : (
        <></>
      )}
    </>
  )
}

const $partOfSpeechLabel: TextStyle = {
  borderColor: colors.palette.primary200,
  color: colors.palette.primary200,
  borderWidth: 1,
  borderRadius: spacing.xxs,
  alignSelf: "flex-start",
  padding: spacing.xxxs,
  paddingLeft: Platform.OS === "android" ? spacing.xxs : spacing.xxxs,
  fontSize: 16,
  lineHeight: Platform.OS === "android" ? 12 : 16,
  paddingTop: Platform.OS === "android" ? 8 : 2,
  textAlignVertical: "center",
  includeFontPadding: false,
}

const $partOfSpeechLabelSelected: TextStyle = {
  ...$partOfSpeechLabel,
  color: colors.palette.primary400,
  borderColor: colors.palette.primary400,
}

const $abbreviationContainer: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xxs,
  marginBottom: spacing.xxs,
}
