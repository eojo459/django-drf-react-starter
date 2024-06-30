import { Button, Paper, Stack, TextInput, Title, Text, Space, Image, rem } from "@mantine/core";
import classes from '../css/TextInput.module.css';
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import vsLogo from '../assets/VerifiedHoursLogo2.png';
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../css/Notifications.module.css";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useSupabase } from "../authentication/SupabaseContext";

interface LoginCard {
    handleFormChanges: (form: any) => void; // send back form data to parent
    handleLogin: (value: boolean) => void; // try to login
}

export default function LoginCard(props: LoginCard) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { signInUser } = useSupabase();
    
    // setup props
    const handleFormChangesProp = props.handleFormChanges;
    const handleLoginProp = props.handleLogin;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            username: '',
            password: '',
            type: '', // username || email || pin
            pin_code: '',
        },
        validate: (value) => {
            return {
                username: value.username.trim().length <= 0 ? 'Username or Email is required' : null,
                password: value.password.trim().length <= 0 ? 'Password is required' : null,
            }
        }
    });

    // detect form updates and send back form data to parent
    useEffect(() => {
        handleFormChangesProp(form);
    },[form]);

    function handleLogin(value: boolean) {
        handleFormChangesProp(form);
        handleLoginProp(value);
    }

    // handle login
    async function handleSupabaseLogin() {
        // show notification
        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });
        setLoading(true);

        if (form.values.username.includes('@')) {
            // sign in with email
            form.values.type = "email";
        }
        else {
            // sign in with username
            form.values.type = "username";
        }

        setTimeout(() => {
            notifications.update({
                id,
                title: 'Signing in...',
                message: 'Attemping to sign in.',
                loading: true,
                autoClose: false,
                classNames: notiicationClasses,
            });
        }, 1000);

        var response = await signInUser(form.values, navigate);
        if (response === true) {
            // success
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'Successfully signed in.',
                    icon: <IconCheck size="lg" style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1000,
                    classNames: notiicationClasses,
                });
                setLoading(false);
            }, 2000);
        }
        else if (response['error'] === 'Disabled') {
            // account disabled error
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error signing in. Your account was disabled by your employer. Please contact your manager.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 5000,
                    classNames: notiicationClasses,
                });
                setLoading(false);
            }, 1000);
        }
        else {
            // error
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error signing in. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
                setLoading(false);
            }, 1000);
            
        }
    }

    return (
        <>
            <Paper shadow="md" p="lg" mt="50px" radius="lg" style={{ background: "#0f1714", color: "white" }}>
                <Stack>
                    {/* <Text size="30px" fw={900} style={{letterSpacing:"1px"}}>Welcome to VerifiedShift! 👋</Text> */}
                    <Image
                        radius="md"
                        src={vsLogo}
                        //h={30}
                    />
                    <Text size="24px" fw={900} ta="center" mb="lg">Please sign-in to start the adventure 🚀</Text>
                    <Space/>
                    <TextInput
                        required
                        id="username"
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        label="Username or Email"
                        name="username"
                        placeholder="Enter a username or email address"
                        size="lg"
                        classNames={classes}
                        {...form.getInputProps('username')}
                    />
                    <TextInput
                        required
                        id="password"
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        label="Password"
                        name="password"
                        placeholder="Enter a password"
                        type="password"
                        size="lg"
                        classNames={classes}
                        {...form.getInputProps('password')}
                    />
                    <Button
                        //variant="light"
                        //color="#3c5b4c"
                        color="#4a8a2a"
                        radius="md"
                        size="md"
                        fullWidth
                        loading={loading}
                        onClick={() => {handleSupabaseLogin()}}
                    >
                        <Text size="lg">Login</Text>
                    </Button>
                    <Text>Don't have an account? <a style={{textDecoration: "underline", cursor: "pointer"}} onClick={() => navigate("/register")}>Register</a></Text>
                    {/* <Text>Forgot your password? <a style={{textDecoration: "underline", cursor: "pointer"}} onClick={() => navigate("/register")}>Reset password</a></Text> */}
                </Stack>
            </Paper>
        </>
    );
}