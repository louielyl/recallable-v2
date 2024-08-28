import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { CollectionHome } from "./CollectionScreen"
import { CollectionWordDetail } from "./CollectionWordDetail"
import { Platform } from "react-native"

export type CollectionParamList = {
  CollectionHome: undefined
  WordDetail: { headWord: string; isEdit: boolean }
  WordDetailEdit: { headWord: string; isEdit: boolean }
}

const Stack = createNativeStackNavigator<CollectionParamList>()

export function CollectionStack() {
  return (
    <Stack.Navigator
      id="CollectionStack"
      initialRouteName="CollectionHome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Group>
        <Stack.Screen
          name="CollectionHome"
          component={CollectionHome}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen name="WordDetail" component={CollectionWordDetail} />
      </Stack.Group>
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
