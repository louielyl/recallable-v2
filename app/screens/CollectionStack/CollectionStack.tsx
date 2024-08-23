import React from "react"
import {  createNativeStackNavigator } from "@react-navigation/native-stack"
import { CollectionHome } from "./CollectionScreen"
import CollectionWordDetail from "./WordDetail"

export type CollectionParamList = {
  CollectionHome: undefined
  WordDetail: { headWord: string }
}

const Stack = createNativeStackNavigator<CollectionParamList>()

export function CollectionStack() {
  return (
    <Stack.Navigator
      id="ReviewStack"
      initialRouteName="CollectionHome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CollectionHome" component={CollectionHome} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="WordDetail" component={CollectionWordDetail} />
    </Stack.Navigator>
  )
}
