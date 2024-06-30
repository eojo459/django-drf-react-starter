import { Container, Stack, Text } from "@mantine/core";
import { ContactUsForm } from "../../components/ContactUsForm";

export function ContactUs() {
    return (
        <>
            <Container size="xl" mt="xl">
                <Stack>
                    <ContactUsForm/>
                </Stack>
            </Container>
        </>
    );
}