import { Platform } from "react-native";

const BASE_RADIUS = 16;

export const THEME = {
    colors: {
        light: {
            primary: "hsl(76 75% 40%)",
            text: "hsl(240 10% 4%)",
            background: "hsl(0 0% 99%)",
            card: "hsl(0 0% 100%)",
            border: "hsl(240 6% 90%)",
            notification: "hsl(256 75% 40%)",
        },
        dark: {
            primary: "hsl(75, 100%, 55%)",
            text: "hsl(0 0% 98%)",
            background: "hsl(240 10% 4%)",
            card: "hsl(240 10% 8%)",
            border: "hsl(240 5% 18%)",
            notification: "hsl(255, 100%, 55%)",
        },
    },
    fonts: Platform.select({
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
    }),
    radius: {
        sm: BASE_RADIUS - 4,
        md: BASE_RADIUS - 2,
        lg: BASE_RADIUS,
        xl: BASE_RADIUS + 4,
    },
    spacing: {
        xxs: 2,
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 64,
    },
    maxContentWidth: 800,
    bottomTabInset: Platform.select({ ios: 50, android: 80 }) ?? 0,
} as const;
