import { useThemeContext } from "@/components/contexts/theme-provider";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { IconSymbolName } from "@/components/ui/icon-symbol-mapping";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { NavigationBar } from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PAGES = Array.from({ length: 10 }, (_, index) => `https://placehold.co/720x1080?text=Page+${index + 1}`);

export default function Reader() {
    const [isImmersive, setImmersive] = useState(false);
    const { colors, radius, spacing } = useThemeContext();
    const liveInsets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const styles = createStyles({ radius, spacing, insets: { bottom: liveInsets.bottom } });

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: !isImmersive }} />
            <StatusBar hidden={isImmersive} />
            <NavigationBar hidden={isImmersive} />

            <FlashList
                data={PAGES}
                keyExtractor={(uri) => uri}
                drawDistance={1500}
                renderItem={({ item }) => (
                    <Pressable onPress={() => setImmersive((prev) => !prev)}>
                        <Image source={{ uri: item }} style={styles.page} contentFit="contain" />
                    </Pressable>
                )}
                contentContainerStyle={styles.pages}
                showsVerticalScrollIndicator={false}
            />

            {!isImmersive && (
                <ThemedView style={styles.bottomBar}>
                    <BarButton icon="list.bullet" color={colors.text} onPress={() => {}} />
                    <BarButton icon="bookmark" color={colors.text} onPress={() => {}} />
                    <BarButton icon="gearshape" color={colors.text} onPress={() => bottomSheetRef.current?.expand()} />
                </ThemedView>
            )}

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={["40%"]}
                enablePanDownToClose
                backgroundStyle={{ backgroundColor: colors.card }}
                handleIndicatorStyle={{ backgroundColor: colors.border }}
            >
                <BottomSheetView style={styles.sheetContent}>
                    <ThemedText style={styles.sheetTitle}>Read mode</ThemedText>
                </BottomSheetView>
            </BottomSheet>
        </View>
    );
}

type BarButtonProps = {
    icon: IconSymbolName;
    color: string;
    onPress: () => void;
};

function BarButton({ icon, color, onPress }: BarButtonProps) {
    return (
        <Pressable onPress={onPress} hitSlop={8}>
            <IconSymbol name={icon} size={22} color={color} />
        </Pressable>
    );
}

type StyleTheme = Pick<ReturnType<typeof useThemeContext>, "radius" | "spacing"> & {
    insets: { bottom: number };
};

function createStyles({ radius, spacing, insets }: StyleTheme) {
    return StyleSheet.create({
        pages: {
            gap: 2,
        },
        page: {
            width: "100%",
            aspectRatio: 2 / 3,
        },
        bottomBar: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm + insets.bottom,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
        },
        sheetContent: {
            padding: spacing.md,
            paddingBottom: spacing.md + insets.bottom,
            gap: spacing.sm,
        },
        sheetTitle: {
            fontSize: 16,
            fontWeight: "600",
        },
    });
}
