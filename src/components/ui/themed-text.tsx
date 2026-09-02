import { useThemeContext } from "@/components/contexts/theme-provider";
import { Text, type TextProps } from "react-native";

type ThemedTextProps = TextProps & {
    color?: string;
};

export function ThemedText({ style, color, ...rest }: ThemedTextProps) {
    const { colors } = useThemeContext();

    return <Text style={[{ color: color ?? colors.text }, style]} {...rest} />;
}
