import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { DefaultTheme, ThemeProvider as ExpoThemeProvider } from "expo-router";
import { createContext, useContext, useMemo } from "react";
import { ThemeMode, useThemeModeContext } from "./theme-mode-provider";

type ThemeContextType = {
    colors: (typeof COLORS)[ThemeMode];
    radius: typeof RADIUS;
    spacing: typeof SPACING;
};

type ThemeProviderProps = {
    children: React.ReactNode;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
    const { mode } = useThemeModeContext();
    const _theme = useMemo(
        () => ({
            ...DefaultTheme,
            dark: mode === "dark",
            colors: {
                ...DefaultTheme.colors,
                primary: COLORS[mode].primary,
                text: COLORS[mode].foreground,
                background: COLORS[mode].background,
                card: COLORS[mode].card,
                border: COLORS[mode].border,
                notification: COLORS[mode].destructive,
            },
        }),
        [mode],
    );

    const value = useMemo(
        () => ({
            colors: COLORS[mode],
            radius: RADIUS,
            spacing: SPACING,
        }),
        [mode],
    );
    return (
        <ThemeContext.Provider value={value}>
            <ExpoThemeProvider value={_theme}>{children}</ExpoThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useThemeContext must be used inside ThemeProvider");
    }
    return ctx;
}
