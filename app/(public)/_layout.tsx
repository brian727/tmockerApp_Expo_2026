import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack initialRouteName="welcome">
      <Stack.Screen
        name="welcome"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: "Sign up",
          headerTransparent: true,
          headerLargeTitle: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="sign-in"
        options={{
          title: "Sign In",
          headerTransparent: true,
          headerLargeTitle: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      />
    </Stack>
  );
}
