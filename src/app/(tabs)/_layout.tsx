import { IconSymbol } from "@/components/ui/icon-symbol";
import { Tabs } from "expo-router";

export default function Layout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "Home",
                    tabBarIcon: ({ color, size }) => <IconSymbol name="house.fill" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    headerShown: false,
                    title: "Explore",
                    tabBarIcon: ({ color, size }) => <IconSymbol name="magnifyingglass" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
