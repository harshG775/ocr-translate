import { ExternalLink } from "@/components/ui/external-link";
import { ThemedText } from "@/components/ui/themed-text";
import { View } from "react-native";

export default function Index() {
    return (
        <View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <ThemedText>Edit src/app/index.tsx to edit this screen.</ThemedText>
            <ExternalLink href="https://docs.expo.dev/versions/v57.0.0/">
                <ThemedText>Open Expo docs</ThemedText>
            </ExternalLink>
        </View>
    );
}
