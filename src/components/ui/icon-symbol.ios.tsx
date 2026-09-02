import { SymbolView } from "expo-symbols";
import { type OpaqueColorValue, type StyleProp, type ViewStyle } from "react-native";
import { type IconSymbolName } from "./icon-symbol-mapping";

type IconSymbolProps = {
    name: IconSymbolName;
    size?: number;
    color: string | OpaqueColorValue;
    style?: StyleProp<ViewStyle>;
};

export function IconSymbol({ name, size = 24, color, style }: IconSymbolProps) {
    return <SymbolView name={name} size={size} tintColor={color} style={[{ width: size, height: size }, style]} />;
}
