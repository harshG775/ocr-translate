import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { type OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";
import { ICON_MAPPING, type IconSymbolName } from "./icon-symbol-mapping";

type IconSymbolProps = {
    name: IconSymbolName;
    size?: number;
    color: string | OpaqueColorValue;
    style?: StyleProp<TextStyle>;
};

export function IconSymbol({ name, size = 24, color, style }: IconSymbolProps) {
    return <MaterialIcons name={ICON_MAPPING[name]} size={size} color={color} style={style} />;
}
