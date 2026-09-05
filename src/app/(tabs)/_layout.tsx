import { IconSymbol } from "@/components/ui/icon-symbol";
import { Tabs } from "expo-router";
import { Pressable } from "react-native";

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                tabBarButton: ({ ref, ...props }) => <Pressable {...props} android_ripple={null} />,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "History",
                    tabBarIcon: ({ color, size }) => (
                        <IconSymbol name="clock.arrow.circlepath" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="test"
                options={{
                    headerShown: false,
                    title: "Test",
                    tabBarIcon: ({ color, size }) => <IconSymbol name="gearshape" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
