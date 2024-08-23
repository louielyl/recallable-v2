import React from "react"
import { Front } from "./Front"
import { Back } from "./Back"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

export type ReviewParamList = {
  Front: undefined
  Back: { headWord: string }
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
      <Stack.Screen name="Front" component={Front} />
      <Stack.Screen name="Back" component={Back} />
    </Stack.Navigator>
  )
}
