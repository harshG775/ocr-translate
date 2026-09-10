/**
 * Jetpack-Compose-flavored DSL for React Native — experimental MVP
 * -----------------------------------------------------------------
 * Goal: replace JSX + hooks + StyleSheet with a Compose-like call syntax:
 *
 *   Column({ modifier }, () => {
 *     Text({ text: "hi" });
 *   });
 *
 * instead of:
 *
 *   <View style={...}>
 *     <Text>hi</Text>
 *   </View>
 *
 * HOW IT WORKS
 * ------------
 * There's no "return JSX, diff a virtual DOM" step. Every composable
 * (Column, Row, Text, Button, ...) is a plain function that, when called,
 * registers a node onto whichever "parent" is currently open, using a
 * module-level stack. Container composables (Column/Row/Box/Scaffold/Theme)
 * push themselves onto the stack, run their content callback — so any
 * composable called inside that callback attaches to *them* — then pop.
 *
 * The whole tree is rebuilt from scratch on every render of the single real
 * React component created by `activityComponent(...)`. The resulting
 * plain-object tree is converted into real RN elements once, at the end,
 * by `renderNode`.
 *
 * STATE: `remember(initial)`
 * ---------------------------
 * There is only ONE real React component underneath (the activity root).
 * Every `remember()` call claims the next "slot" in a flat array, in call
 * order — the same mechanism, and the same constraint, as React's own
 * Hooks (and conceptually similar to Compose's slot table).
 *
 * RULE OF COMPOSITION — read this before using conditionals/loops:
 * `remember()` calls must happen in the same order on every recomposition.
 * Don't call a composable that uses `remember()` inside an `if` that
 * sometimes skips it, or inside a loop with a variable length — slot
 * indices will drift and state will get mixed up between components. (A
 * more robust version would key slots by call-site instead of order — not
 * done here, to keep this MVP small.)
 *
 * `remember(x)` returns `{ value }` with a real getter/setter (Vue-ref
 * style), because plain JS can't intercept `count - 1` and turn it into a
 * mutation the way Kotlin's `count--` (a compiler-rewritten delegated
 * property) can. Mutate state with `count.value++` / `count.value = ...`,
 * never bare arithmetic — see the two bugs fixed in the demo at the bottom.
 */

import React, { useReducer, useRef } from "react";
import { View, Text as RNText, Pressable, TextInput, StyleSheet, ViewStyle, TextStyle } from "react-native";

// ---------------------------------------------------------------------------
// 1. Composition engine: the implicit-parent stack
// ---------------------------------------------------------------------------

interface ComposeNode {
    type: string;
    props: Record<string, any>;
    children: ComposeNode[];
}

let stack: ComposeNode[] = [];

function currentParent(): ComposeNode | undefined {
    return stack[stack.length - 1];
}

function emit(node: ComposeNode): ComposeNode {
    const parent = currentParent();
    if (!parent) {
        throw new Error(
            `${node.type}(...) was called outside of a composition. ` +
                `Composables can only be called inside setContent(...) or another composable's content block.`,
        );
    }
    parent.children.push(node);
    return node;
}

/** A composable that has children (Column, Row, Box, Scaffold, theme wrappers...). */
function container(type: string, props: any, content?: (...args: any[]) => void, args: any[] = []): void {
    const node = emit({ type, props: props ?? {}, children: [] });
    if (content) {
        stack.push(node);
        try {
            content(...args);
        } finally {
            stack.pop();
        }
    }
}

/** A composable with no children (Text, Button, Spacer...). */
function leaf(type: string, props: any): void {
    emit({ type, props: props ?? {}, children: [] });
}

// ---------------------------------------------------------------------------
// 2. Modifier — an immutable, chainable style builder (like Compose's Modifier)
// ---------------------------------------------------------------------------

export type PaddingValues = number | { top?: number; bottom?: number; left?: number; right?: number };

type ModOp = { kind: string; args: any[] };

class ModifierBuilder {
    private constructor(private readonly ops: ReadonlyArray<ModOp> = []) {}

    static readonly empty = new ModifierBuilder();

    private next(kind: string, args: any[]) {
        return new ModifierBuilder([...this.ops, { kind, args }]);
    }

    fillMaxSize() {
        return this.next("fillMaxSize", []);
    }
    fillMaxWidth() {
        return this.next("fillMaxWidth", []);
    }
    fillMaxHeight() {
        return this.next("fillMaxHeight", []);
    }
    padding(value: PaddingValues = 16) {
        return this.next("padding", [value]);
    }
    height(value: number = 16) {
        return this.next("height", [value]);
    }
    width(value: number = 16) {
        return this.next("width", [value]);
    }
    background(color: string) {
        return this.next("background", [color]);
    }
    alignCenter() {
        return this.next("alignCenter", []);
    }
    border(width: number, color: string, radius = 0) {
        return this.next("border", [width, color, radius]);
    }
    weight(value: number = 1) {
        return this.next("weight", [value]);
    }

    /** Combine with another modifier (or array of them) — same effect as chaining. */
    then(other: ModifierLike) {
        return new ModifierBuilder([...this.ops, ...flattenModifier(other).ops]);
    }

    toStyle(): ViewStyle {
        let style: ViewStyle = {};
        for (const { kind, args } of this.ops) {
            switch (kind) {
                case "fillMaxSize":
                    style = { ...style, flex: 1, width: "100%", height: "100%" };
                    break;
                case "fillMaxWidth":
                    style = { ...style, width: "100%" };
                    break;
                case "fillMaxHeight":
                    style = { ...style, height: "100%" };
                    break;
                case "padding": {
                    const v: PaddingValues = args[0];
                    style =
                        typeof v === "number"
                            ? { ...style, padding: v }
                            : {
                                  ...style,
                                  paddingTop: v.top,
                                  paddingBottom: v.bottom,
                                  paddingLeft: v.left,
                                  paddingRight: v.right,
                              };
                    break;
                }
                case "height":
                    style = { ...style, height: args[0] };
                    break;
                case "width":
                    style = { ...style, width: args[0] };
                    break;
                case "background":
                    style = { ...style, backgroundColor: args[0] };
                    break;
                case "alignCenter":
                    style = { ...style, alignItems: "center", justifyContent: "center" };
                    break;
                case "border":
                    style = { ...style, borderWidth: args[0], borderColor: args[1], borderRadius: args[2] };
                    break;
                case "weight":
                    style = { ...style, flex: args[0] };
                    break;
            }
        }
        return style;
    }
}

export type ModifierLike = ModifierBuilder | readonly ModifierLike[] | undefined;

/** Composables accept a single Modifier OR an array of them (as in the original draft). */
function flattenModifier(modifier: ModifierLike): ModifierBuilder {
    if (!modifier) return ModifierBuilder.empty;
    if (Array.isArray(modifier)) {
        return modifier.reduce((acc: ModifierBuilder, m) => acc.then(m), ModifierBuilder.empty);
    }
    return modifier as ModifierBuilder;
}

function resolveStyle(modifier: ModifierLike): ViewStyle {
    return flattenModifier(modifier).toStyle();
}

export const Modifier = ModifierBuilder.empty;

// ---------------------------------------------------------------------------
// 3. State: remember()
// ---------------------------------------------------------------------------

interface CompositionContext {
    slots: any[];
    slotIndex: number;
    requestUpdate: () => void;
}

let activeContext: CompositionContext | null = null;

export interface RememberedState<T> {
    value: T;
}

export function remember<T>(initial: T): RememberedState<T> {
    const ctx = activeContext;
    if (!ctx) {
        throw new Error("remember(...) was called outside of a composition (inside setContent).");
    }
    const idx = ctx.slotIndex++;
    if (idx >= ctx.slots.length) ctx.slots[idx] = initial;
    return {
        get value(): T {
            return ctx.slots[idx];
        },
        set value(next: T) {
            if (!Object.is(next, ctx.slots[idx])) {
                ctx.slots[idx] = next;
                ctx.requestUpdate();
            }
        },
    };
}

// ---------------------------------------------------------------------------
// 4. Layout primitives
// ---------------------------------------------------------------------------

export const Arrangement = {
    Start: "flex-start",
    End: "flex-end",
    Center: "center",
    SpaceBetween: "space-between",
    SpaceAround: "space-around",
    SpaceEvenly: "space-evenly",
} as const;

export const Alignment = {
    Start: "flex-start",
    End: "flex-end",
    CenterVertically: "center",
    CenterHorizontally: "center",
} as const;

interface AxisProps {
    modifier?: ModifierLike;
    horizontalArrangement?: string;
    verticalArrangement?: string;
    horizontalAlignment?: string;
    verticalAlignment?: string;
}

export function Column(props: AxisProps, content: () => void) {
    container("Column", props, content);
}

export function Row(props: AxisProps, content: () => void) {
    container("Row", props, content);
}

export function Box(props: { modifier?: ModifierLike; contentAlignment?: "center" }, content: () => void) {
    container("Box", props, content);
}

export function Spacer(props: { modifier?: ModifierLike }) {
    leaf("Spacer", props);
}

// ---------------------------------------------------------------------------
// 5. Content primitives
// ---------------------------------------------------------------------------

export function Text(props: { text: string; modifier?: ModifierLike; style?: TextStyle }) {
    leaf("Text", props);
}

export function Button(props: { text: string; onClick: () => void; modifier?: ModifierLike }) {
    leaf("Button", props);
}

export function TextField(props: {
    value: string;
    onChangeText: (next: string) => void;
    placeholder?: string;
    modifier?: ModifierLike;
}) {
    leaf("TextField", props);
}

// ---------------------------------------------------------------------------
// 6. Scaffold + Theme
// ---------------------------------------------------------------------------

export function Scaffold(props: { modifier?: ModifierLike }, content: (innerPadding: PaddingValues) => void) {
    // Real Compose derives this from the system bars/insets. Wire this up to
    // react-native-safe-area-context later; zero is a safe MVP default.
    const innerPadding: PaddingValues = { top: 0, bottom: 0, left: 0, right: 0 };
    container("Scaffold", props, content, [innerPadding]);
}

export function MyApplicationTheme(props: {}, content: () => void) {
    container("Theme", props, content);
}

export const MaterialTheme = {
    typography: {
        displayLarge: { fontSize: 45, fontWeight: "400" } as TextStyle,
        titleLarge: { fontSize: 22, fontWeight: "500" } as TextStyle,
        bodyLarge: { fontSize: 16, fontWeight: "400" } as TextStyle,
    },
    colorScheme: {
        primary: "#6750A4",
        onPrimary: "#FFFFFF",
        background: "#FFFBFE",
        onBackground: "#1C1B1F",
    },
};

// ---------------------------------------------------------------------------
// 7. Activity shims — just enough to keep the ComponentActivity flavor
// ---------------------------------------------------------------------------

export class ComponentActivity {
    onCreate(_savedInstanceState: unknown): void {}
}

let capturedContent: (() => void) | null = null;

export function setContent(_props: {}, content: () => void) {
    capturedContent = content;
}

function takeCapturedContent(): (() => void) | null {
    const content = capturedContent;
    capturedContent = null;
    return content;
}

export function enableEdgeToEdge() {
    // No RN equivalent needed today; hook up react-native-edge-to-edge here
    // if/when you want the Android-parity status/nav bar behavior.
}

// ---------------------------------------------------------------------------
// 8. Renderer: ComposeNode tree -> real RN elements
// ---------------------------------------------------------------------------

function axisStyle(type: "Column" | "Row", props: AxisProps): ViewStyle {
    const mainAxis = type === "Column" ? props.verticalArrangement : props.horizontalArrangement;
    const crossAxis = type === "Column" ? props.horizontalAlignment : props.verticalAlignment;
    return {
        flexDirection: type === "Column" ? "column" : "row",
        ...(mainAxis ? { justifyContent: mainAxis as ViewStyle["justifyContent"] } : null),
        ...(crossAxis ? { alignItems: crossAxis as ViewStyle["alignItems"] } : null),
    };
}

function renderNode(node: ComposeNode, key: React.Key): React.ReactNode {
    const style = resolveStyle(node.props.modifier);

    switch (node.type) {
        case "Theme":
        case "Scaffold":
            return React.createElement(
                View,
                { key, style: [node.type === "Scaffold" ? styles.scaffold : undefined, style] },
                node.children.map((c, i) => renderNode(c, i)),
            );
        case "Column":
        case "Row":
            return React.createElement(
                View,
                { key, style: [axisStyle(node.type, node.props), style] },
                node.children.map((c, i) => renderNode(c, i)),
            );
        case "Box": {
            const align: ViewStyle | undefined =
                node.props.contentAlignment === "center"
                    ? { alignItems: "center", justifyContent: "center" }
                    : undefined;
            return React.createElement(
                View,
                { key, style: [align, style] },
                node.children.map((c, i) => renderNode(c, i)),
            );
        }
        case "Spacer":
            return React.createElement(View, {
                key,
                style: style.height || style.width ? style : { height: 16 },
            });
        case "Text":
            return React.createElement(RNText, { key, style: [node.props.style, style] }, node.props.text);
        case "TextField":
            return React.createElement(TextInput, {
                key,
                value: node.props.value,
                onChangeText: node.props.onChangeText,
                placeholder: node.props.placeholder,
                style: [styles.textField, style as TextStyle],
            });
        case "Button":
            return React.createElement(
                Pressable,
                {
                    key,
                    onPress: node.props.onClick,
                    style: ({ pressed }: { pressed: boolean }) => [styles.button, pressed && styles.buttonPressed, style],
                },
                React.createElement(RNText, { style: styles.buttonText }, node.props.text),
            );
        default:
            return null;
    }
}

const styles = StyleSheet.create({
    scaffold: { flex: 1 },
    button: {
        minWidth: 48,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: MaterialTheme.colorScheme.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonPressed: { opacity: 0.7 },
    buttonText: { color: MaterialTheme.colorScheme.onPrimary, fontSize: 16, fontWeight: "600" },
    textField: {
        borderWidth: 1,
        borderColor: "#CAC4D0",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 16,
    },
});

// ---------------------------------------------------------------------------
// 9. activityComponent — turns a ComponentActivity subclass into a real RN component
// ---------------------------------------------------------------------------

export function activityComponent<T extends ComponentActivity>(ActivityClass: new () => T) {
    return function ActivityRoot() {
        const [, forceUpdate] = useReducer((n: number) => n + 1, 0);
        const slotsRef = useRef<any[]>([]);
        const instanceRef = useRef<T | null>(null);
        if (!instanceRef.current) instanceRef.current = new ActivityClass();
        const instance = instanceRef.current;

        const root: ComposeNode = { type: "Root", props: {}, children: [] };

        activeContext = { slots: slotsRef.current, slotIndex: 0, requestUpdate: forceUpdate };
        stack = [root];
        capturedContent = null;
        try {
            instance.onCreate(null);
            takeCapturedContent()?.();
        } finally {
            stack = [];
            activeContext = null;
        }

        return React.createElement(View, { style: { flex: 1 } }, root.children.map((c, i) => renderNode(c, i)));
    };
}

// ---------------------------------------------------------------------------
// 10. Demo — the Counter screen from the original draft, with two bugs fixed:
//
//   (a) `onClick: () => count - 1` computed a new number and threw it away —
//       nothing was ever assigned. Now: `count.value--`.
//   (b) `Spacer((modifier = Modifier.height()))` is a JS assignment
//       expression: it silently overwrote Counter's own `modifier` param
//       and passed that as Spacer's single positional argument — not the
//       `{ modifier: ... }` props object Spacer expects. Now a normal
//       `Spacer({ modifier: Modifier.height(24) })` call.
// ---------------------------------------------------------------------------

class MainActivity extends ComponentActivity {
    onCreate(savedInstanceState: unknown) {
        super.onCreate(savedInstanceState);
        enableEdgeToEdge();

        setContent({}, () => {
            MyApplicationTheme({}, () => {
                Scaffold({ modifier: Modifier.fillMaxSize() }, (innerPadding) => {
                    Counter({ name: "Android", modifier: Modifier.padding(innerPadding) });
                });
            });
        });
    }
}

function Counter({ name, modifier = Modifier }: { name: string; modifier?: ModifierLike }) {
    const count = remember(0);

    Column({ modifier: [modifier, Modifier.fillMaxSize(), Modifier.alignCenter()] }, () => {
        Text({ text: `Hello ${name}!` });
        Text({ text: String(count.value), style: MaterialTheme.typography.displayLarge });
        Spacer({ modifier: Modifier.height(24) });
        Row({ horizontalArrangement: Arrangement.Center, verticalAlignment: Alignment.CenterVertically }, () => {
            Button({
                text: "-",
                onClick: () => {
                    count.value--;
                },
            });
            Spacer({ modifier: Modifier.width(16) });
            Button({
                text: "+",
                onClick: () => {
                    count.value++;
                },
            });
        });
    });
}

export default activityComponent(MainActivity);

// ---------------------------------------------------------------------------
// 11. Demo — a todo list, showing list state (`remember<Todo[]>([])`) and a
//     variable-length loop of composables. Per the rule of composition above,
//     that's safe here only because the per-item composables (Row/Text/
//     Button) don't call `remember()` themselves — the list's own identity
//     lives in the `todos` array, not in per-item slots.
// ---------------------------------------------------------------------------

interface Todo {
    id: number;
    text: string;
    done: boolean;
}

class TodoActivity extends ComponentActivity {
    onCreate(savedInstanceState: unknown) {
        super.onCreate(savedInstanceState);
        enableEdgeToEdge();

        setContent({}, () => {
            MyApplicationTheme({}, () => {
                Scaffold({ modifier: Modifier.fillMaxSize() }, (innerPadding) => {
                    TodoList({ modifier: Modifier.padding(innerPadding) });
                });
            });
        });
    }
}

function TodoList({ modifier = Modifier }: { modifier?: ModifierLike }) {
    const draft = remember("");
    const todos = remember<Todo[]>([]);
    const nextId = remember(1);

    function addTodo() {
        const text = draft.value.trim();
        if (!text) return;
        todos.value = [...todos.value, { id: nextId.value, text, done: false }];
        nextId.value++;
        draft.value = "";
    }

    function toggleTodo(id: number) {
        todos.value = todos.value.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
    }

    function removeTodo(id: number) {
        todos.value = todos.value.filter((todo) => todo.id !== id);
    }

    Column({ modifier: [modifier, Modifier.fillMaxSize(), Modifier.padding(16)] }, () => {
        Text({ text: "Todo", style: MaterialTheme.typography.titleLarge });
        Spacer({ modifier: Modifier.height(16) });

        Row({ verticalAlignment: Alignment.CenterVertically }, () => {
            TextField({
                value: draft.value,
                onChangeText: (next) => (draft.value = next),
                placeholder: "Add a todo…",
                modifier: Modifier.weight(1),
            });
            Spacer({ modifier: Modifier.width(8) });
            Button({ text: "Add", onClick: addTodo });
        });

        Spacer({ modifier: Modifier.height(16) });

        if (todos.value.length === 0) {
            Text({ text: "Nothing to do yet.", style: { color: "#79747E" } });
        }

        todos.value.forEach((todo) => {
            Row(
                { verticalAlignment: Alignment.CenterVertically, modifier: Modifier.padding({ top: 4, bottom: 4 }) },
                () => {
                    Button({ text: todo.done ? "☑" : "☐", onClick: () => toggleTodo(todo.id) });
                    Spacer({ modifier: Modifier.width(8) });
                    Text({
                        text: todo.text,
                        modifier: Modifier.weight(1),
                        style: todo.done ? { textDecorationLine: "line-through", color: "#79747E" } : undefined,
                    });
                    Spacer({ modifier: Modifier.width(8) });
                    Button({ text: "✕", onClick: () => removeTodo(todo.id) });
                },
            );
        });
    });
}

export const TodoScreen = activityComponent(TodoActivity);
