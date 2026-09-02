import { ThemeModeProvider, useThemeModeContext } from "@/components/contexts/theme-mode-provider";
import { ThemeProvider } from "@/components/contexts/theme-provider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ThemeModeProvider>
                <ThemeProvider>
                    <Stack />
                    <StatusBar_ />
                </ThemeProvider>
            </ThemeModeProvider>
        </SafeAreaProvider>
    );
}
function StatusBar_() {
    const { mode } = useThemeModeContext();

    return <StatusBar style={mode === "dark" ? "light" : "dark"} />;
}
