import { useThemeContext } from "@/components/contexts/theme-provider";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { IconSymbolName } from "@/components/ui/icon-symbol-mapping";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import BottomSheet, { BottomSheetBackdrop, type BottomSheetBackdropProps, BottomSheetView } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { NavigationBar } from "expo-navigation-bar";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PAGES = Array.from({ length: 10 }, (_, index) => `https://placehold.co/720x1080?text=Page+${index + 1}`);
const SHEET_SNAP_POINTS = ["40%", "90%"];

export default function Reader() {
    const [isImmersive, setImmersive] = useState(false);
    const [sheetIndex, setSheetIndex] = useState(-1);
    const { colors, radius, spacing } = useThemeContext();
    const liveInsets = useSafeAreaInsets();
    const [insets] = useState(liveInsets);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const styles = createStyles({ radius, spacing, insets: { top: insets.top, bottom: insets.bottom } });

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
        ),
        [],
    );

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
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
                <>
                    <ThemedView style={styles.topBar}>
                        <BarButton icon="chevron.left" color={colors.text} onPress={() => router.back()} />
                    </ThemedView>

                    <ThemedView style={styles.bottomBar}>
                        <BarButton icon="list.bullet" color={colors.text} onPress={() => {}} />
                        <BarButton icon="bookmark" color={colors.text} onPress={() => {}} />
                        <BarButton icon="gearshape" color={colors.text} onPress={() => setSheetIndex(0)} />
                    </ThemedView>

                    <BottomSheet
                        ref={bottomSheetRef}
                        index={sheetIndex}
                        onChange={setSheetIndex}
                        snapPoints={SHEET_SNAP_POINTS}
                        enableDynamicSizing={false}
                        enablePanDownToClose
                        backdropComponent={renderBackdrop}
                        backgroundStyle={{ backgroundColor: colors.card }}
                        handleIndicatorStyle={{ backgroundColor: colors.border }}
                    >
                        <BottomSheetView style={styles.sheetContent}>
                            <ThemedText style={styles.sheetTitle}>Read mode</ThemedText>
                        </BottomSheetView>
                    </BottomSheet>
                </>
            )}
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
    insets: { top: number; bottom: number };
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
        topBar: {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            flexDirection: "row",
            alignItems: "center",
            paddingTop: spacing.md + insets.top,
            paddingBottom: spacing.md,
            paddingHorizontal: spacing.md,
        },
        bottomBar: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            paddingTop: spacing.md,
            paddingBottom: spacing.sm + insets.bottom,
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
