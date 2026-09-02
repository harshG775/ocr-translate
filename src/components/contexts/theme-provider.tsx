import { THEME } from "@/constants/theme";
import { DefaultTheme, ThemeProvider as ExpoThemeProvider } from "expo-router";
import { createContext, useContext, useMemo } from "react";
import { ThemeMode, useThemeModeContext } from "./theme-mode-provider";

type ThemeContextType = {
    colors: (typeof THEME.colors)[ThemeMode];
    fonts: typeof THEME.fonts;
    radius: typeof THEME.radius;
    spacing: typeof THEME.spacing;
    maxContentWidth: typeof THEME.maxContentWidth;
    bottomTabInset: typeof THEME.bottomTabInset;
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
                primary: THEME.colors[mode].primary,
                text: THEME.colors[mode].text,
                background: THEME.colors[mode].background,
                card: THEME.colors[mode].card,
                border: THEME.colors[mode].border,
                notification: THEME.colors[mode].notification,
            },
        }),
        [mode],
    );

    const value = useMemo(
        () => ({
            colors: THEME.colors[mode],
            fonts: THEME.fonts,
            radius: THEME.radius,
            spacing: THEME.spacing,
            maxContentWidth: THEME.maxContentWidth,
            bottomTabInset: THEME.bottomTabInset,
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
