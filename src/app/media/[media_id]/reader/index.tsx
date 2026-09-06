import { useThemeContext } from "@/components/contexts/theme-provider";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { IconSymbolName } from "@/components/ui/icon-symbol-mapping";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useChapterPages, type Page } from "@/hooks/use-chapter-pages";
import BottomSheet, { BottomSheetBackdrop, type BottomSheetBackdropProps, BottomSheetView } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { NavigationBar } from "expo-navigation-bar";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const chapterUrl = "https://asurascans.com/comics/the-regressed-mercenarys-machinations-08677664/chapter/4";
const SHEET_SNAP_POINTS = ["40%", "90%"];

function ReaderPage({
    page,
    referer,
    screenWidth,
    onPress,
}: {
    page: Page;
    referer: string;
    screenWidth: number;
    onPress: () => void;
}) {
    const height = screenWidth * (page.height / page.width);
    const [loading, setLoading] = useState(true);

    return (
        <Pressable onPress={onPress}>
            <View style={{ width: screenWidth, height }}>
                <Image
                    source={{ uri: page.uri, headers: { Referer: referer } }}
                    style={{ width: screenWidth, height }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    recyclingKey={page.uri}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                />
                {loading && (
                    <ActivityIndicator style={{ position: "absolute", top: 24, left: 0, right: 0 }} size="large" />
                )}
            </View>
        </Pressable>
    );
}

export default function Reader() {
    const [isImmersive, setImmersive] = useState(false);
    const [sheetIndex, setSheetIndex] = useState(-1);
    const { colors, radius, spacing } = useThemeContext();
    const liveInsets = useSafeAreaInsets();
    const [insets] = useState(liveInsets);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { width: screenWidth } = useWindowDimensions();
    const { pages, referer, isLoading, error } = useChapterPages(chapterUrl);

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

            {isLoading ? (
                <ThemedView style={styles.centered}>
                    <ThemedText>Loading chapter…</ThemedText>
                </ThemedView>
            ) : error || !pages?.length ? (
                <ThemedView style={styles.centered}>
                    <ThemedText>Couldn't load this chapter.</ThemedText>
                </ThemedView>
            ) : (
                <FlashList
                    data={pages}
                    keyExtractor={(page) => page.uri}
                    drawDistance={1500}
                    renderItem={({ item }) => (
                        <ReaderPage
                            page={item}
                            referer={referer}
                            screenWidth={screenWidth}
                            onPress={() => setImmersive((prev) => !prev)}
                        />
                    )}
                    contentContainerStyle={styles.pages}
                    showsVerticalScrollIndicator={false}
                />
            )}

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
        centered: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
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
