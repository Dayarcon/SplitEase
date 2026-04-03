import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useAuth, AuthProvider } from "@/context/auth";
import { setMobileUserId } from "@/api/client";

const PURPLE = "#7C3AED";

function RootLayoutNav() {
  const { user } = useAuth();

  useEffect(() => {
    setMobileUserId(user ? user.userId : null);
  }, [user]);

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#F8F5FF" },
          headerTintColor: PURPLE,
          headerTitleStyle: { fontWeight: "bold", color: "#0f172a" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "#F8F5FF" },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="new-group"
          options={{ title: "New Group", presentation: "modal" }}
        />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="expenses" options={{ headerShown: false }} />
        <Stack.Screen name="activity" options={{ headerShown: false }} />
        <Stack.Screen name="friends" options={{ headerShown: false }} />
        <Stack.Screen name="[id]/index" options={{ headerShown: false }} />
        <Stack.Screen
          name="[id]/add-expense"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="[id]/edit-expense"
          options={{ title: "Edit Expense", presentation: "modal" }}
        />
      </Stack>
      <StatusBar style="dark" />
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
