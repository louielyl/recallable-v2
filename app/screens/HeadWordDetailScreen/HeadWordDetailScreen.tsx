import { Text } from "app/components"
import { Definition, partOfSpeechToAbbreviation } from "app/data/entities/definitions"
import { HeadWord } from "app/data/entities/headWords"
import { colors, spacing } from "app/theme"
import React, { Fragment } from "react"
import { ScrollView, ScrollViewProps, View, ViewProps } from "react-native"

// import { Container } from './styles';
export type HeadWordDetailScreenProps = {
  headerProps?: ViewProps
  contentProps?: ScrollViewProps
  headWord: HeadWord["content"]
  definitions: Definition[] | undefined
}
export default function HeadWordDetail({
  headWord,
  definitions,
  headerProps,
  contentProps,
}: HeadWordDetailScreenProps) {
  return (
    <>
      <ScrollView {...contentProps}>
        <View style={{ gap: spacing.xxs }}>
          {definitions?.map((definition, index, array) => (
            <View
              key={definition.id}
              style={{ backgroundColor: colors.palette.neutral100, marginHorizontal: spacing.xxs }}
            >
              {Object.entries(partOfSpeechToAbbreviation).map(([key, value]) =>
                definition[key as keyof Definition] ? (
                  <Text key={key} text={value} />
                ) : (
                  <Fragment key={key} />
                ),
              )}
              <Text text={definition.content} />
              {index !== array.length - 1 ? <Text text="__" /> : <></>}
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  )
}
