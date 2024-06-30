import { Avatar, Button, Container, Grid, Paper, PinInput, Space, Stack, TextInput, Title, Text, Group, ActionIcon, rem } from "@mantine/core";
import classes from '../css/TextInput.module.css';
import { useEffect, useState } from "react";
import { IconBackspace } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "../authentication/SupabaseContext";

export default function PinLogin() {
    const { signInUser } = useSupabase();
    const [step1Active, setStep1Active] = useState(true);
    const [step2Active, setStep2Active] = useState(false);
    const [pinValue, setPinValue] = useState('');
    const navigate = useNavigate();

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            username: '',
            password: '',
            type: 'pin', // username || email || pin
            pin_code: '',
        },
        validate: (value) => {
            return {
                username: value.username.trim().length <= 0 ? 'Username or Email is required' : null,
                pin_code: value.pin_code.trim().length <= 0 ? 'Pin code is required' : null,
            }
        }
    });

    // update form when pin value changes
    useEffect(() => {
        form.values.pin_code = pinValue;
        console.log(form.values.pin_code);
        if (pinValue.length == 5) {
            // auto login
            signInUser(form.values, navigate);
        }
    },[pinValue]);


    function handleStep1Click() {
        if (step1Active) {
            setStep1Active(false);
            setStep2Active(true);
        }
    }

    function handlePinButtonClick(number: number) {
        // only allow 5 digits for pin code
        if(pinValue.length < 5) {
            setPinValue(pinValue + number.toString());
        }
    }

    function handleDeletePinButtonClick() {
        if (pinValue.length > 0) {
            setPinValue(pinValue.substring(0, pinValue.length - 1));
        } 
    }

    return (
        <Container size="xs">
            <Stack align="center" mt="10px">
                {step1Active && (
                    <>
                        <Title order={3}>Enter your username to continue</Title>
                        <TextInput
                            required
                            id="business-name"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            name="name"
                            placeholder="Enter a username"
                            size="lg"
                            style={{width: "100%"}}
                            classNames={classes}
                            {...form.getInputProps('username')}
                        />
                        <Button
                            variant="light"
                            radius="md"
                            size="md"
                            fullWidth
                            onClick={handleStep1Click}
                        >
                            <Title order={4}>Continue</Title>
                        </Button>
                    </>
                )}

                {step2Active && (
                    <>
                        <Avatar size="xl" style={{ background: "#323c43db" }}>T</Avatar>
                        <Title order={1}>Welcome back, Tom</Title>
                        <Space h="lg"/>
                        <Title ta="center" order={3}>Enter your 5 digit pin code</Title>
                        <PinInput size="xl" length={5} mask type="number" {...form.getInputProps('pin_code')}/>
                        <Space h="sm"/>
                        <Grid>
                            <Grid.Col span={{ base: 4 }}>
                                <Group justify="center">
                                    <ActionIcon size="70px" radius="50px" color="#161b26" onClick={() => handlePinButtonClick(1)}>
                                        <Text size="xl" fw={600}>1</Text>
                                    </ActionIcon>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 4 }}>
                                <Group justify="center">
                                    <ActionIcon size="70px" radius="50px" color="#161b26" onClick={() => handlePinButtonClick(2)}>
                                        <Text size="xl" fw={600}>2</Text>
                                    </ActionIcon>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 4 }}>
                                <Group justify="center">
                                    <ActionIcon size="70px" radius="50px" color="#161b26"onClick={() => handlePinButtonClick(3)}>
                                        <Text size="xl" fw={600}>3</Text>
                                    </ActionIcon>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 4 }}>
                                <Group justify="center">
                                    <ActionIcon size="70px" radius="50px" color="#161b26"onClick={() => handlePinButtonClick(4)}>
                                        <Text size="xl" fw={600}>4</Text>
                                    </ActionIcon>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 4 }}>
                                <Group justify="center">
                                    <ActionIcon size="70px" radius="50px" color="#161b26"onClick={() => handlePinButtonClick(5)}>
                                        <Text size="xl" fw={600}>5</Text>
                                    </ActionIcon>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 4 }}>
                                <Group justify="center">
                                    <ActionIcon size="70px" radius="50px" color="#161b26"onClick={() => handlePinButtonClick(6)}>
                                        <Text size="xl" fw={600}>6</Text>
                                    </ActionIcon>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 4 }}>
                                <Group justify="center">
                                    <ActionIcon size="70px" radius="50px" color="#161b26"onClick={() => handlePinButtonClick(7)}>
                                        <Text size="xl" fw={600}>7</Text>
                                    </ActionIcon>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 4 }}>
                                <Group justify="center">
                                    <ActionIcon size="70px" radius="50px" color="#161b26"onClick={() => handlePinButtonClick(8)}>
                                        <Text size="xl" fw={600}>8</Text>
                                    </ActionIcon>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 4 }}>
                                <Group justify="center">
                                    <ActionIcon size="70px" radius="50px" color="#161b26"onClick={() => handlePinButtonClick(9)}>
                                        <Text size="xl" fw={600}>9</Text>
                                    </ActionIcon>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 4 }}></Grid.Col>
                            <Grid.Col span={{ base: 4 }}>
                                <Group justify="center">
                                    <ActionIcon size="70px" radius="50px" color="#161b26"onClick={() => handlePinButtonClick(0)}>
                                        <Text size="xl" fw={600}>0</Text>
                                    </ActionIcon>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 4 }}>
                                <Group justify="center" mt="lg">
                                    <ActionIcon size="70px" radius="50px" color="transparent" onClick={handleDeletePinButtonClick}>
                                        <IconBackspace style={{ width: rem(40), height: rem(40) }}/>
                                    </ActionIcon>
                                </Group>
                            </Grid.Col>
                        </Grid>
                        <Space h="lg"/>
                        <Button
                            variant="subtle"
                            color="gray"
                            radius="md"
                            size="md"
                            mb="lg"
                            fullWidth
                        >
                            <Title order={4}>Login</Title>
                        </Button>
                    </>
                )}
                
            </Stack>
        </Container>
    );
}