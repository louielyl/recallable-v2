import React from "react"
import { Front } from "./Front"
import { Back } from "./Back"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Platform } from "react-native"
import { CollectionWordDetail } from "../CollectionStack/CollectionWordDetail"

export type ReviewParamList = {
  Front: undefined
  Back: { headWord: string }
  WordDetailEdit: { headWord: string; isEdit: boolean }
}

const Stack = createNativeStackNavigator<ReviewParamList>()

export function ReviewStack() {
  return (
    <Stack.Navigator
      id="ReviewStack"
      initialRouteName="Front"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Front" component={Front} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="Back" component={Back} />
      {/* TODO: Remove the code duplication in CollectionStack */}
      <Stack.Group
        screenOptions={{
          presentation: Platform.select({
            ios: "modal",
            android: "containedTransparentModal",
          }),
          animation: "slide_from_bottom",
          animationDuration: 100,
        }}
      >
        <Stack.Screen name="WordDetailEdit" component={CollectionWordDetail} />
      </Stack.Group>
    </Stack.Navigator>
  )
}
