import { useThemeContext } from "@/components/contexts/theme-provider";
import { Text, View } from "react-native";

export default function Index() {
    const { colors } = useThemeContext();
    return (
        <View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Text style={{ color: colors.text }}>Edit src/app/index.tsx to edit this screen.</Text>
        </View>
    );
}
