import { Paper, Stack, Title, Text, TextInput, Button, Container } from "@mantine/core";
import classes from '../css/TextInput.module.css';

export default function ForgotPassword() {
    return (
        <Container size="xs">
            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#161b26", color: "white" }}>
                <Stack>
                    <Title order={2}>Forgot password? 🔒</Title>
                    <Text>Enter your email and we'll send you instructions to reset your password.</Text>
                    <TextInput
                        required
                        id="email"
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        label="Email"
                        name="email"
                        placeholder="Enter an email"
                        size="lg"
                        classNames={classes}
                        //{...form.getInputProps('business_info.business_name')}
                    />
                    <Button
                        variant="light"
                        radius="md"
                        size="md"
                        fullWidth
                    >
                        <Title order={4}>Send reset link</Title>
                    </Button>
                    <Button
                        variant="transparent"
                        color="gray"
                        radius="md"
                        size="md"
                        fullWidth
                    >
                        <Title order={4}>Back to login</Title>
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}