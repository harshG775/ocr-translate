import { ThemeModeProvider, useThemeModeContext } from "@/components/contexts/theme-mode-provider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ThemeModeProvider>
                <Stack />
                <StatusBar_ />
            </ThemeModeProvider>
        </SafeAreaProvider>
    );
}
function StatusBar_() {
    const { mode } = useThemeModeContext();

    return <StatusBar style={mode === "dark" ? "light" : "dark"} />;
}
