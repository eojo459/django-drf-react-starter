import { Paper, Stack, Title, Text, TextInput, Button, Container } from "@mantine/core";
import classes from '../css/TextInput.module.css';

export default function ResetPassword() {
    return (
        <Container size="xs">
            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#161b26", color: "white" }}>
                <Stack>
                    <Title order={2}>Reset password 🔒</Title>
                    <Text>Enter your new password.</Text>
                    <TextInput
                        required
                        id="new-password"
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        label="New password"
                        name="new_password"
                        placeholder="Enter a new password"
                        size="lg"
                        classNames={classes}
                        //{...form.getInputProps('business_info.business_name')}
                    />
                    <TextInput
                        required
                        id="confirm-password"
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        label="Confirm password"
                        name="confirm_password"
                        placeholder="Confirm your new password"
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
                        <Title order={4}>Set new password</Title>
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