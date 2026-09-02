import { useThemeContext } from "@/components/contexts/theme-provider";
import { View, type ViewProps } from "react-native";

type ThemedViewProps = ViewProps & {
    backgroundColor?: string;
};

export function ThemedView({ style, backgroundColor, ...rest }: ThemedViewProps) {
    const { colors } = useThemeContext();

    return <View style={[{ backgroundColor: backgroundColor ?? colors.background }, style]} {...rest} />;
}
