import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps } from "@react-navigation/native"
import React from "react"
import { TextStyle, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Icon } from "../components"
import { translate } from "../i18n"
import { colors, spacing, typography } from "../theme"
import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"
import { ReviewScreen } from "app/screens/ReviewScreen/ReviewScreen"
import { CollectionScreen } from "app/screens/CollectionScreen"
import { DemoShowroomScreen } from "app/screens"

export type AppTabParamList = {
  Review: { queryIndex?: string; itemIndex?: string }
  Collection: { queryIndex?: string; itemIndex?: string }
  DemoCommunity: undefined
  DemoShowroom: { queryIndex?: string; itemIndex?: string }
  DemoDebug: undefined
  DemoPodcastList: undefined
}

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AppTabScreenProps<T extends keyof AppTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

const Tab = createBottomTabNavigator<AppTabParamList>()

/**
 * This is the main navigator for the demo screens with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `DemoNavigator`.
 */
export function DemoNavigator() {
  const { bottom } = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
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
        component={ReviewScreen}
        options={{
          tabBarLabel: translate("appNavigator.review"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="components" color={focused ? colors.tint : undefined} size={30} />
          ),
        }}
      />

      <Tab.Screen
        name="Collection"
        component={CollectionScreen}
        options={{
          tabBarLabel: translate("appNavigator.collection"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="components" color={focused ? colors.tint : undefined} size={30} />
          ),
        }}
      />

      <Tab.Screen
        name="DemoShowroom"
        component={DemoShowroomScreen}
        options={{
          tabBarLabel: translate("demoNavigator.componentsTab"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="components" color={focused ? colors.tint : undefined} size={30} />
          ),
        }}
      />

      {/* <Tab.Screen */}
      {/*   name="DemoCommunity" */}
      {/*   component={DemoCommunityScreen} */}
      {/*   options={{ */}
      {/*     tabBarLabel: translate("demoNavigator.communityTab"), */}
      {/*     tabBarIcon: ({ focused }) => ( */}
      {/*       <Icon icon="community" color={focused ? colors.tint : undefined} size={30} /> */}
      {/*     ), */}
      {/*   }} */}
      {/* /> */}

      {/* <Tab.Screen */}
      {/*   name="DemoPodcastList" */}
      {/*   component={DemoPodcastListScreen} */}
      {/*   options={{ */}
      {/*     tabBarAccessibilityLabel: translate("demoNavigator.podcastListTab"), */}
      {/*     tabBarLabel: translate("demoNavigator.podcastListTab"), */}
      {/*     tabBarIcon: ({ focused }) => ( */}
      {/*       <Icon icon="podcast" color={focused ? colors.tint : undefined} size={30} /> */}
      {/*     ), */}
      {/*   }} */}
      {/* /> */}

      {/* <Tab.Screen */}
      {/*   name="DemoDebug" */}
      {/*   component={DemoDebugScreen} */}
      {/*   options={{ */}
      {/*     tabBarLabel: translate("demoNavigator.debugTab"), */}
      {/*     tabBarIcon: ({ focused }) => ( */}
      {/*       <Icon icon="debug" color={focused ? colors.tint : undefined} size={30} /> */}
      {/*     ), */}
      {/*   }} */}
      {/* /> */}
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
