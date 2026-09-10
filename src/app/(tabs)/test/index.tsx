// src/app/(tabs)/test/index.tsx
import React from "react";
import { Pressable, Text as RNText, TextInput, View, ViewStyle, TextStyle } from "react-native";

// ---------- Composer (implicit child-collection stack) ----------

interface ComposeNode {
    type: string;
    // Opaque payload — each composable's own prop type is the real contract;
    // renderNode below casts it back per node.type.
    props: unknown;
    children: ComposeNode[];
}

type Frame = ComposeNode[];
const frameStack: Frame[] = [];

function collectChildren(content?: () => void): ComposeNode[] {
    const frame: Frame = [];
    frameStack.push(frame);
    try {
        content?.();
    } finally {
        frameStack.pop();
    }
    return frame;
}

function emit(node: ComposeNode): void {
    const frame = frameStack[frameStack.length - 1];
    if (!frame) {
        throw new Error(
            `"${node.type}" was called outside of a composition. Composable calls ` +
                "(Column, Row, Box, Text, Button, TextField, Spacer, ...) are only " +
                "valid inside a ComponentActivity's setContent(() => { ... }).",
        );
    }
    frame.push(node);
}

function normalizeArgs<P extends object>(
    a: P | (() => void) | undefined,
    b?: () => void,
): [P, (() => void) | undefined] {
    if (typeof a === "function") return [{} as P, a];
    return [(a ?? {}) as P, b];
}

// ---------- Modifier ----------

type Style = ViewStyle & TextStyle;

interface Modifier {
    readonly style: Style;
    padding(n: number): Modifier;
    paddingHorizontal(n: number): Modifier;
    paddingVertical(n: number): Modifier;
    gap(n: number): Modifier;
    fillMaxWidth(): Modifier;
    fillMaxSize(): Modifier;
    size(n: number): Modifier;
    width(n: number): Modifier;
    height(n: number): Modifier;
    background(value: string): Modifier;
    color(value: string): Modifier;
    fontSize(n: number): Modifier;
    cornerRadius(radius: number): Modifier;
    border(width: number, value: string): Modifier;
    center(): Modifier;
    row(): Modifier;
}

function createModifier(style: Style): Modifier {
    const extend = (patch: Style) => createModifier({ ...style, ...patch });
    return {
        style,
        padding: (n) => extend({ padding: n }),
        paddingHorizontal: (n) => extend({ paddingHorizontal: n }),
        paddingVertical: (n) => extend({ paddingVertical: n }),
        gap: (n) => extend({ gap: n }),
        fillMaxWidth: () => extend({ width: "100%" }),
        fillMaxSize: () => extend({ flex: 1 }),
        size: (n) => extend({ width: n, height: n }),
        width: (n) => extend({ width: n }),
        height: (n) => extend({ height: n }),
        background: (value) => extend({ backgroundColor: value }),
        color: (value) => extend({ color: value }),
        fontSize: (n) => extend({ fontSize: n }),
        cornerRadius: (radius) => extend({ borderRadius: radius }),
        border: (width, value) => extend({ borderWidth: width, borderColor: value }),
        center: () => extend({ alignItems: "center", justifyContent: "center" }),
        row: () => extend({ flexDirection: "row" }),
    };
}

const Modifier: Modifier = createModifier({});

// ---------- Composables (void-returning, emit into the current frame) ----------

interface ContainerProps {
    modifier?: Modifier;
}

function Column(content: () => void): void;
function Column(props: ContainerProps, content?: () => void): void;
function Column(a: ContainerProps | (() => void), b?: () => void): void {
    const [props, content] = normalizeArgs<ContainerProps>(a, b);
    emit({ type: "Column", props, children: collectChildren(content) });
}

function Row(content: () => void): void;
function Row(props: ContainerProps, content?: () => void): void;
function Row(a: ContainerProps | (() => void), b?: () => void): void {
    const [props, content] = normalizeArgs<ContainerProps>(a, b);
    emit({ type: "Row", props, children: collectChildren(content) });
}

function Box(content: () => void): void;
function Box(props: ContainerProps, content?: () => void): void;
function Box(a: ContainerProps | (() => void), b?: () => void): void {
    const [props, content] = normalizeArgs<ContainerProps>(a, b);
    emit({ type: "Box", props, children: collectChildren(content) });
}

function Text(value: string, modifier: Modifier = Modifier): void {
    emit({ type: "Text", props: { value, modifier }, children: [] });
}

interface ButtonProps {
    onClick: () => void;
    modifier?: Modifier;
}

function Button(props: ButtonProps, content: () => void): void {
    emit({ type: "Button", props, children: collectChildren(content) });
}

interface TextFieldProps {
    value: string;
    onChange: (next: string) => void;
    placeholder?: string;
    modifier?: Modifier;
}

function TextField(props: TextFieldProps): void {
    emit({ type: "TextField", props, children: [] });
}

function Spacer(modifier: Modifier = Modifier): void {
    emit({ type: "Spacer", props: { modifier }, children: [] });
}

// ---------- Render (the one seam that touches React — no JSX) ----------

function renderChildren(nodes: ComposeNode[]): React.ReactElement[] {
    return nodes.map((node, key) => renderNode(node, key));
}

function renderNode(node: ComposeNode, key: number): React.ReactElement {
    switch (node.type) {
        case "Column": {
            const { modifier = Modifier } = node.props as ContainerProps;
            return React.createElement(
                View,
                { key, style: [{ flexDirection: "column" }, modifier.style] },
                renderChildren(node.children),
            );
        }
        case "Row": {
            const { modifier = Modifier } = node.props as ContainerProps;
            return React.createElement(
                View,
                { key, style: [{ flexDirection: "row" }, modifier.style] },
                renderChildren(node.children),
            );
        }
        case "Box": {
            const { modifier = Modifier } = node.props as ContainerProps;
            return React.createElement(View, { key, style: modifier.style }, renderChildren(node.children));
        }
        case "Text": {
            const { value, modifier } = node.props as { value: string; modifier: Modifier };
            return React.createElement(RNText, { key, style: modifier.style }, value);
        }
        case "Button": {
            const { onClick, modifier = Modifier } = node.props as ButtonProps;
            return React.createElement(
                Pressable,
                {
                    key,
                    onPress: onClick,
                    style: ({ pressed }: { pressed: boolean }) => [modifier.style, pressed && { opacity: 0.6 }],
                },
                renderChildren(node.children),
            );
        }
        case "TextField": {
            const { value, onChange, placeholder, modifier = Modifier } = node.props as TextFieldProps;
            return React.createElement(TextInput, {
                key,
                value,
                onChangeText: onChange,
                placeholder,
                style: modifier.style,
            });
        }
        case "Spacer": {
            const { modifier } = node.props as { modifier: Modifier };
            return React.createElement(View, { key, style: modifier.style });
        }
        default:
            throw new Error(`Unknown compose node type: "${node.type}"`);
    }
}

function ComposeRoot(content: () => void): React.ReactElement {
    return React.createElement(React.Fragment, null, ...renderChildren(collectChildren(content)));
}

// ---------- ComponentActivity ----------

// Mirrors Android's `class MainActivity : ComponentActivity()`:
// - `onCreate` runs once, seeds state, and calls `setContent` with the
//   composable body — same shape as `setContent { ... }` in `onCreate`.
// - every subsequent `setState` (triggered by a property setter below)
//   re-runs `render()`, which replays that body through the composer —
//   i.e. a recomposition.
abstract class ComponentActivity<S extends object = {}> extends React.Component<{}, S> {
    private content: (() => void) | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {} as S;
        this.onCreate();
    }

    protected abstract onCreate(): void;

    protected setContent(content: () => void): void {
        this.content = content;
    }

    render(): React.ReactNode {
        return this.content ? ComposeRoot(this.content) : null;
    }
}

// ---------- Screen ----------

interface MainActivityState {
    count: number;
    name: string;
}

class MainActivity extends ComponentActivity<MainActivityState> {
    get count(): number {
        return this.state.count;
    }

    set count(value: number) {
        this.setState({ count: value });
    }

    get name(): string {
        return this.state.name;
    }

    set name(value: string) {
        this.setState({ name: value });
    }

    protected onCreate(): void {
        this.state = { count: 0, name: "" };

        this.setContent(() => {
            Column({ modifier: Modifier.fillMaxSize().center().padding(24).gap(16) }, () => {
                Text(`Count: ${this.count}`, Modifier.fontSize(28));

                Row({ modifier: Modifier.gap(12) }, () => {
                    Button(
                        { onClick: () => (this.count -= 1), modifier: Modifier.padding(12).background("#eee").cornerRadius(8) },
                        () => Text("-"),
                    );
                    Button(
                        { onClick: () => (this.count += 1), modifier: Modifier.padding(12).background("#eee").cornerRadius(8) },
                        () => Text("+"),
                    );
                });

                TextField({
                    value: this.name,
                    onChange: (next) => (this.name = next),
                    placeholder: "Your name",
                    modifier: Modifier.fillMaxWidth().padding(12).border(1, "#ccc").cornerRadius(8),
                });

                Text(this.name ? `Hello, ${this.name}!` : "Say hello…", Modifier.color("#666"));
            });
        });
    }
}

export default function Test() {
    return React.createElement(MainActivity);
}
