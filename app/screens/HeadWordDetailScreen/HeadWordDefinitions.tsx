import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Icon, Text, TextField } from "app/components"
import { Definition, partOfSpeechToAbbreviation } from "app/data/entities/definitions"
import { HeadWord } from "app/data/entities/headWords"
import { colors, spacing } from "app/theme"
import React, { Fragment, useMemo } from "react"
import {
  ScrollViewProps,
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

// import { Container } from './styles';
export type HeadWordDefinitionsProps = {
  isEdit: boolean
  headerProps?: ViewProps
  contentProps?: ScrollViewProps
  headWord: HeadWord["content"]
  mappings: (DBHeadWordDefinitionMapping & { definition: Definition })[] | undefined
  updateDefinitions?: (data: any) => void
}

export default function HeadWordDefinitions({
  mappings,
  isEdit,
  headWord,
  updateDefinitions,
}: HeadWordDefinitionsProps) {
  const navigation = useNavigation<NativeStackNavigationProp<CollectionParamList>>()
  const definitions = useMemo(
    () => mappings?.map((mapping) => ({ ...mapping.definition, mappingId: mapping.id })),
    [mappings],
  )
  const { control, handleSubmit, reset, setValue } = useForm<{
    definitions: Partial<Definition & { mappingId: string }>[]
  }>({
    defaultValues: { definitions: [] },
  })
  const { fields, append, remove } = useFieldArray<{
    definitions: Partial<Definition & { mappingId: string }>[]
  }>({ control, name: "definitions" })
  const onSubmit = (data: any) => updateDefinitions && updateDefinitions(data)

  React.useEffect(() => {
    definitions && reset({ definitions })
  }, [definitions])

  React.useLayoutEffect(() => {
    return () => {
      isEdit && handleSubmit(onSubmit)()
    }
  }, [])

  const deleteAlert = (index: number) =>
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

  return (
    <View
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
            <Icon
              icon="more"
              onPress={() =>
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
              }
              color={colors.tint}
              size={spacing.md}
            />
          </>
        ) : (
          <Icon
            onPress={() =>
              navigation.navigate("WordDetailEdit", { headWord: headWord!, isEdit: true })
            }
            icon="settings"
            color={colors.tint}
            size={spacing.md}
          />
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
              <View style={{ flexDirection: "row" }}>
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
                              setValue(`definitions.${index}.${key as keyof Definition}`, !value)
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
                <Icon onPress={() => deleteAlert(index)} icon="x" size={16} />
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
      </View>
    </View>
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
