import { Paper, Stack, Title, Text, TextInput, Button, Container, Badge } from "@mantine/core";
import classes from '../css/TextInput.module.scss';

export default function VerifyEmail() {
    return (
        <Container size="xs">
            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#161b26", color: "white" }}>
                <Stack>
                    <Title order={2}>Verify your email ✉️</Title>
                    <Text>An account activation link will be sent to your email address:</Text>
                    <Badge color="gray" radius="md" size="xl"><Text fw={700}>tom.dev@example.com</Text></Badge>
                    
                    <Button
                        variant="light"
                        radius="md"
                        size="md"
                        fullWidth
                    >
                        <Title order={4}>Skip</Title>
                    </Button>
                    <Button
                        variant="light"
                        radius="md"
                        size="md"
                        fullWidth
                    >
                        <Title order={4}>Verify</Title>
                    </Button>
                    <Button
                        variant="transparent"
                        color="gray"
                        radius="md"
                        size="md"
                        fullWidth
                    >
                        <Title order={4}>Didn't get the e-mail? Resend</Title>
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}