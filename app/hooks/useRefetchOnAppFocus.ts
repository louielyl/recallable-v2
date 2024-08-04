import { useEffect } from "react"
import { AppState, Platform } from "react-native"
import type { AppStateStatus } from "react-native"
import { focusManager } from "@tanstack/react-query"

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active")
  }
}

// NOTE: Official recommendation for refetch when app is focused
export function useRefetchOnAppFocus() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange)

    return () => subscription.remove()
  }, [])
}
