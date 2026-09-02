import type { MaterialIconsIconName } from "@react-native-vector-icons/material-icons";
import type { SFSymbol } from "sf-symbols-typescript";

export const ICON_MAPPING = {
    "house.fill": "home",
    magnifyingglass: "search",
} satisfies Partial<Record<SFSymbol, MaterialIconsIconName>>;

export type IconSymbolName = keyof typeof ICON_MAPPING;
