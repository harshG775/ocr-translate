import { ThemeModeProvider, useThemeModeContext } from "@/components/contexts/theme-mode-provider";
import { ThemeProvider } from "@/components/contexts/theme-provider";
import TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <TanstackQueryProvider>
                    <ThemeModeProvider>
                        <ThemeProvider>
                            <BottomSheetModalProvider>
                                <Stack
                                    screenOptions={{
                                        animation: "fade_from_bottom",
                                    }}
                                >
                                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                </Stack>
                                <StatusBar_ />
                            </BottomSheetModalProvider>
                        </ThemeProvider>
                    </ThemeModeProvider>
                </TanstackQueryProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
function StatusBar_() {
    const { mode } = useThemeModeContext();

    return <StatusBar style={mode === "dark" ? "light" : "dark"} />;
}
