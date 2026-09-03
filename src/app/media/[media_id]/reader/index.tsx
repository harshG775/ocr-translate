import { ThemedText } from "@/components/ui/themed-text";
import { Stack } from "expo-router";
import { NavigationBar } from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable } from "react-native";

export default function Reader() {
    const [isImmersive, setImmersive] = useState(false);

    return (
        <Pressable style={{ flex: 1 }} onPress={() => setImmersive((prev) => !prev)}>
            <Stack.Screen options={{ headerShown: !isImmersive }} />
            <StatusBar hidden={isImmersive} />
            <NavigationBar hidden={isImmersive} />
            <ThemedText>src/app/media/[media_id]/reader/index.tsx</ThemedText>
        </Pressable>
    );
}
