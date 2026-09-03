import type { MaterialIconsIconName } from "@react-native-vector-icons/material-icons";
import type { SFSymbol } from "sf-symbols-typescript";

export const ICON_MAPPING = {
    "house.fill": "home",
    magnifyingglass: "search",
    safari: "explore",
    photo: "insert-photo",
    "clock.arrow.circlepath": "restore",
    gearshape: "settings",
    "list.bullet": "format-list-bulleted",
    bookmark: "bookmark-border",
    "chevron.left": "arrow-back",
} satisfies Partial<Record<SFSymbol, MaterialIconsIconName>>;

export type IconSymbolName = keyof typeof ICON_MAPPING;
