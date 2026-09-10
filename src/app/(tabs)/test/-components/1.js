class MainActivity extends ComponentActivity {
    onCreate(savedInstanceState) {
        super.onCreate(savedInstanceState);

        enableEdgeToEdge();

        setContent({}, () => {
            MyApplicationTheme({}, () => {
                Scaffold({ modifier: Modifier.fillMaxSize() }, (innerPadding) => {
                    Counter({
                        name: "Android",
                        modifier: Modifier.padding(innerPadding),
                    });
                });
            });
        });
    }
}

/**
 * @Composable
 */
function Counter({ name, modifier = Modifier }) {
    const count = remember(0);

    return Column(
        {
            modifier: [modifier, Modifier.alignCenter()],
        },
        () => {
            Text({
                text: `Hello ${name}!`,
            });
            Text({
                text: String(count),
            });
            Spacer((modifier = Modifier.height()));
            Row(
                {
                    horizontalArrangement: Arrangement.Center,
                    verticalAlignment: Alignment.CenterVertically,
                },
                () => {
                    Button({
                        text: "-",
                        onClick: () => count - 1,
                    });
                    Button({
                        text: "+",
                        onClick: () => count + 1,
                    });
                },
            );
        },
    );
}
