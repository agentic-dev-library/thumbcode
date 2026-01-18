import { Stack } from 'expo-router';

/**
 * App root layout that provides the navigation stack.
 *
 * Renders a Stack with a single Screen named "index" and sets its title to "ThumbCode".
 *
 * @returns The root JSX element containing the navigation Stack.
 */
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'ThumbCode' }} />
    </Stack>
  );
}