import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useAuth, AuthProvider } from "@/context/auth";
import { setMobileUserId } from "@/api/client";

const INDIGO = "#4f46e5";

function RootLayoutNav() {
  const { user } = useAuth();

  // Keep the API client in sync with auth state
  useEffect(() => {
    setMobileUserId(user ? user.userId : null);
  }, [user]);

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: INDIGO },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: "#f1f0ff" },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{ title: "SplitEase", headerRight: undefined }}
        />
        <Stack.Screen
          name="new-group"
          options={{ title: "New Group", presentation: "modal" }}
        />
        <Stack.Screen name="profile" options={{ title: "My Profile" }} />
        <Stack.Screen name="[id]/index" options={{ title: "Group" }} />
        <Stack.Screen
          name="[id]/add-expense"
          options={{ title: "Add Expense", presentation: "modal" }}
        />
        <Stack.Screen
          name="[id]/edit-expense"
          options={{ title: "Edit Expense", presentation: "modal" }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
