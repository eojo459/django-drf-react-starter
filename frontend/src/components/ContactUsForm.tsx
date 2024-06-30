import { TextInput, Textarea, SimpleGrid, Group, Title, Button, Paper, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import classes from '../css/TextInput.module.css';
import { PostContactMessage } from '../helpers/Api';
import { notifications } from '@mantine/notifications';

export function ContactUsForm() {
    const form = useForm({
        initialValues: {
            name: '',
            company: '',
            email: '',
            subject: '',
            message: '',
            request_type: 'no-auth',
        },
        validate: {
            name: (value) => value.trim().length < 2 ? 'Name is required' : null,
            email: (value) => !/^\S+@\S+$/.test(value) ? 'Valid email is required' : null,
            subject: (value) => value.trim().length === 0 ? 'Subject is required' : null,
            message: (value) => value.trim().length === 0 ? 'Message is required' : null,
        },
    });

    async function handleContactUsForm() {
        if (form.validate() && form.values.message.length > 0) {
            // post new message if valid
            var response = await PostContactMessage(form.values);
            if (response == 201) {
                notifications.show({
                    color: '#4a8a2a',
                    title: 'Success!',
                    message: 'Your message has been sent!',
                });
                form.reset(); // clear form
            }
            else {
                notifications.show({
                    color: '#ca4628',
                    title: 'Error!',
                    message: 'There was a problem trying to submit your request. Please try again!',
                });
            }
        }
        else {
            notifications.show({
                color: '#ca4628',
                title: 'Error!',
                message: 'The form is not filled out properly. Correct the errors and submit again!',
            });
        }
    }

    return (
        <>
            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#0f1714", color: "white" }}>
                <Text
                    size="40px"
                    fw={900}
                    ta="center"
                    c="#dcdcdc"
                >
                    Contact us
                </Text>
                <Text
                    size="22px"
                    mt="lg"
                    //fw={600}
                    ta="center"
                    c="#dcdcdc"
                >
                    Do you have any questions? Send us a message and we will respond!
                </Text>

                <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl">
                    <TextInput
                        label="Name"
                        placeholder="Your name"
                        name="name"
                        variant="filled"
                        size="lg"
                        radius="md"
                        classNames={classes}
                        {...form.getInputProps('name')}
                    />
                    <TextInput
                        label="Email"
                        placeholder="Your email"
                        name="email"
                        variant="filled"
                        size="lg"
                        radius="md"
                        classNames={classes}
                        {...form.getInputProps('email')}
                    />
                </SimpleGrid>

                <TextInput
                    label="Company name"
                    placeholder="Your company name"
                    mt="md"
                    name="company"
                    variant="filled"
                    size="lg"
                    radius="md"
                    classNames={classes}
                    {...form.getInputProps('company')}
                />

                <TextInput
                    label="Subject"
                    placeholder="Subject"
                    mt="md"
                    name="subject"
                    variant="filled"
                    size="lg"
                    radius="md"
                    classNames={classes}
                    {...form.getInputProps('subject')}
                />
                <Textarea
                    mt="md"
                    label="Message"
                    placeholder="Your message"
                    maxRows={10}
                    minRows={5}
                    autosize
                    name="message"
                    variant="filled"
                    size="lg"
                    radius="md"
                    classNames={classes}
                    {...form.getInputProps('message')}
                />

                <Group justify="center" mt="xl">
                    <Button 
                        type="submit" 
                        size="md" 
                        //variant="light"
                        color="#4a8a2a"
                        onClick={handleContactUsForm}
                    >
                        Send message
                    </Button>
                </Group>
            </Paper>
        </>

    );
}