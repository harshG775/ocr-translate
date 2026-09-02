/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const BASE_RADIUS = 16;
//
export const SPACING = {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
} as const;

export const RADIUS = {
    sm: BASE_RADIUS - 4,
    md: BASE_RADIUS - 2,
    lg: BASE_RADIUS,
    xl: BASE_RADIUS + 4,
} as const;

export const COLORS = {
    light: {
        // Softened the lime to be more readable on light backgrounds
        primary: "hsl(76 75% 40%)",
        primaryForeground: "hsl(0 0% 100%)",

        // Off-white background reduces eye fatigue
        background: "hsl(0 0% 99%)",
        foreground: "hsl(240 10% 4%)",

        // Subtle grey for cards to make them "pop" from the background
        card: "hsl(0 0% 100%)",
        cardForeground: "hsl(240 10% 4%)",

        secondary: "hsl(187 80% 35%)", // Deepened Cyan
        secondaryForeground: "hsl(0 0% 100%)",

        muted: "hsl(240 5% 96%)",
        mutedForeground: "hsl(240 4% 45%)",

        destructive: "hsl(0, 100%, 50%)",
        destructiveForeground: "hsl(0 0% 98%)",

        warning: "hsl(38, 92%, 50%)",
        warningForeground: "hsl(0 0% 0%)",

        success: "hsl(142 71% 35%)",
        successForeground: "hsl(0 0% 100%)",

        border: "hsl(240 6% 90%)",
    },

    dark: {
        // Neon Lime optimized for dark mode (slight glow effect)
        primary: "hsl(75, 100%, 55%)",
        primaryForeground: "hsl(0 0% 0%)",

        // Not pure black, but a deep charcoal for better depth/shadows
        background: "hsl(240 10% 4%)",
        foreground: "hsl(0 0% 98%)",

        // Cards are slightly lighter than background to show elevation
        card: "hsl(240 10% 8%)",
        cardForeground: "hsl(0 0% 98%)",

        secondary: "hsl(185 100% 45%)", // Vibrant Cyan
        secondaryForeground: "hsl(0 0% 0%)",

        muted: "hsl(240 5% 15%)",
        mutedForeground: "hsl(240 5% 65%)",

        destructive: "hsl(0, 100%, 50%)",
        destructiveForeground: "hsl(0 0% 98%)",

        warning: "hsl(48 96% 53%)",
        warningForeground: "hsl(0 0% 0%)",

        success: "hsl(142 71% 45%)",
        successForeground: "hsl(0 0% 100%)",

        border: "hsl(240 5% 18%)",
    },
} as const;

export const FONTS = Platform.select({
    ios: {
        /** iOS `UIFontDescriptorSystemDesignDefault` */
        sans: "system-ui",
        /** iOS `UIFontDescriptorSystemDesignSerif` */
        serif: "ui-serif",
        /** iOS `UIFontDescriptorSystemDesignRounded` */
        rounded: "ui-rounded",
        /** iOS `UIFontDescriptorSystemDesignMonospaced` */
        mono: "ui-monospace",
    },
    default: {
        sans: "normal",
        serif: "serif",
        rounded: "normal",
        mono: "monospace",
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
} as const);
