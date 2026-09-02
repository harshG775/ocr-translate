import { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";
import { createMMKV } from "react-native-mmkv";

export type ThemeMode = "light" | "dark";

type ThemeContextType = {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
};

type ThemeProviderProps = {
    children: React.ReactNode;
};

const ThemeModeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_MODE_KEY = "theme-mode";

const storage = createMMKV();

export function ThemeModeProvider({ children }: ThemeProviderProps) {
    const systemMode: ThemeMode = useColorScheme() === "dark" ? "dark" : "light";
    const [mode, setModeState] = useState<ThemeMode>(() => {
        const stored = storage.getString(THEME_MODE_KEY);
        return stored === "light" || stored === "dark" ? stored : systemMode;
    });

    const setMode = (next: ThemeMode) => {
        setModeState(next);
        storage.set(THEME_MODE_KEY, next);
    };

    return <ThemeModeContext.Provider value={{ mode, setMode }}>{children}</ThemeModeContext.Provider>;
}

export function useThemeModeContext() {
    const ctx = useContext(ThemeModeContext);
    if (!ctx) {
        throw new Error("useThemeModeContext must be used inside ThemeModeProvider");
    }
    return ctx;
}
