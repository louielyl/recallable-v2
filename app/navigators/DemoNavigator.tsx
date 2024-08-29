import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigatorScreenParams } from "@react-navigation/native"
import React from "react"
import { TextStyle, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { translate } from "../i18n"
import { colors, spacing, typography } from "../theme"
import { CollectionParamList, CollectionStack } from "app/screens/CollectionStack/CollectionStack"
import { ReviewParamList, ReviewStack } from "app/screens/ReviewStack/ReviewStack"
import { Feather } from "@expo/vector-icons"

export type AppTabParamList = {
  Review: NavigatorScreenParams<ReviewParamList>
  Collection: NavigatorScreenParams<CollectionParamList>
}

const Tab = createBottomTabNavigator<AppTabParamList>()

export function BottomTabNavigator() {
  const { bottom } = useSafeAreaInsets()

  return (
    <Tab.Navigator
      id="BottomTab"
      initialRouteName="Review"
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerTitleStyle: { fontSize: 24 },
        headerTintColor: colors.tint,
        headerStyle: { backgroundColor: colors.background },
        tabBarHideOnKeyboard: true,
        tabBarStyle: [$tabBar, { height: bottom + 70 }],
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: $tabBarLabel,
        tabBarItemStyle: $tabBarItem,
      }}
    >
      <Tab.Screen
        name="Review"
        component={ReviewStack}
        options={{
          tabBarLabel: translate("appNavigator.review"),
          tabBarIcon: ({ focused }) => (
            <Feather name="book-open" color={focused ? colors.tint : undefined} size={spacing.xl} />
          ),
        }}
      />
      <Tab.Screen
        name="Collection"
        component={CollectionStack}
        options={{
          tabBarLabel: translate("appNavigator.collection"),
          tabBarIcon: ({ focused }) => (
            <Feather name="book" color={focused ? colors.tint : undefined} size={spacing.xl} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

const $tabBar: ViewStyle = {
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
}

const $tabBarItem: ViewStyle = {
  paddingTop: spacing.md,
}

const $tabBarLabel: TextStyle = {
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
}
