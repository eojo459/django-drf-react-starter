import { Paper, Stack, Title, Text, TextInput, Button, Space, SimpleGrid, Alert, Image, Group, Grid, rem } from "@mantine/core";
import classes from '../css/TextInput.module.css';
import { matchesField, useForm } from "@mantine/form";
import { hashPin, useSupabase } from "../authentication/SupabaseContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { IconBuilding, IconCheck, IconUser, IconX } from "@tabler/icons-react";
import { PostWaitlist, ValidateCode } from "../helpers/Api";
import { notifications } from "@mantine/notifications";
import vsLogo from '../assets/VerifiedHoursLogo2.png';
import { useAuth } from "../authentication/SupabaseAuthContext";
import notiicationClasses from "../css/Notifications.module.css";

export interface RegisterCard {
    initalState?: number
}

export default function RegisterCard(props: RegisterCard) {
    const { user, session } = useAuth();
    const { signUpNewUser } = useSupabase();
    const navigate = useNavigate();
    const [isOwner, setIsOwner] = useState(false);
    const [isEmployee, setIsEmployee] = useState(false);
    const [stepCount, setStepCount] = useState(0);
    const location = useLocation();
    const [queryParams, setQueryParams] = useState<Record<string, string>>({});
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);

    // props
    const initialStateProp = props.initalState;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            username: '',
            password: '',
            confirm_password: '',
            phone: '',
            pin_code: '',
        },
        validate: (value) => {
            return {
                first_name: value.first_name?.trim().length <= 0 ? 'First name is required' : null,
                last_name: value.last_name?.trim().length <= 0 ? 'Last name is required' : null,
                email: value.email?.trim().length <= 0 ? 'Email is required' : null,
                username: value.username?.trim().length <= 0 ? 'Username is required' : null,
                password: value.password?.trim().length <= 0 ? 'Password is required' : null,
                confirm_password: value.confirm_password?.trim() !== value.password?.trim() ? 'Passwords do not match' : null,
            }
        },
        validateInputOnChange: true,
    });

    const staffForm = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            username: '',
            password: '',
            confirm_password:'',
            cell_number: '',
            pin_code: '',
            owner_uid: '',
            business_id: '',
            invite_code: '',
            request_type: 'no-auth',
            role: 'STAFF',
        },
        validate: (value) => {
            return {
                first_name: value.first_name.trim().length <= 0 ? 'First name is required' : null,
                last_name: value.last_name.trim().length <= 0 ? 'Last name is required' : null,
                email: value.email.trim().length <= 0 ? 'Email is required' : null,
                username: value.username.trim().length <= 0 ? 'Username is required' : null,
                password: value.password.trim().length <= 0 ? 'Password is required' : null,
                confirm_password: value.confirm_password.trim() !== value.password.trim() ? 'The passwords do not match' : null,
            }
        },
        validateInputOnChange: true,
    });

    const waitlistForm = useForm({
        initialValues: {
            owner_info: {
                email: '',
            },
            request_type: 'no-auth',
        },
        validate: (value) => {
            return {
                email: value.owner_info.email.trim().length <= 0 ? 'Email is required' : null,
            }
        }
    });

    // run when initial state prop changes
    useEffect(() => {
        if (initialStateProp == 1) {
            // set employee state
            setIsEmployee(true);
        }
    }, [initialStateProp]);

    // get any query parameters from the url on the /register page
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const params: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        // set the invite code to the code from the param ?code=
        setInviteCode(params['code']);

        // set owner flag &isOwner=
        setIsOwner(params['isOwner'] === "true" ? true : false);
        setQueryParams(params);
    }, [location.search]);

    // register new owner account
    async function handleRegister() {
        // TODO hash pin
        // var hashedPincode = await hashPin(form.values.pin_code, form.values.username);
        // form.values.pin_code = hashedPincode;
        
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

        setTimeout(() => {
            notifications.update({
                id,
                title: 'Signing up...',
                message: 'Registering your account..',
                loading: true,
                autoClose: false,
                classNames: notiicationClasses,
            });
        }, 1000);

        var response = await signUpNewUser(form.values, "OWNER", navigate);
        if (response) {
            // success
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'Successfully registered and signed in.',
                    icon: <IconCheck size="lg" style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1000,
                    classNames: notiicationClasses,
                });
                setLoading(false);
            }, 2000);
        }
        else {
            // error
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error registering your account. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
                setLoading(false);
            }, 1000);
            
        }
    }

    // register new staff account
    async function handleRegisterStaff() {
        // TODO hash pin

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

        setTimeout(() => {
            notifications.update({
                id,
                title: 'Signing up...',
                message: 'Registering your account..',
                loading: true,
                autoClose: false,
                classNames: notiicationClasses,
            });
        }, 1000);

        // register new staff and link them to the business owner as unassigned  
        var response = await signUpNewUser(staffForm.values, "STAFF_INVITE", navigate);
        if (response) {
            // success
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'Successfully registered and signed in.',
                    icon: <IconCheck size="lg" style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1000,
                    classNames: notiicationClasses,
                });
                setLoading(false);
            }, 2000);
        }
        else {
            // error
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error registering your account. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
                setLoading(false);
            }, 1000);
            
        }
    }

    async function handleWaitlistJoin() {
        if (waitlistForm.values.owner_info.email.trim().length > 0) {
            var response = await PostWaitlist(waitlistForm.values);
            if (response == 201) {
                // show success message
                notifications.show({
                    color: '#4a8a2a',
                    title: 'Success!',
                    message: 'You have been added to our waitlist!',
                })
                navigate("/"); // redirect to main page
            }
            else {
                // show error message
                notifications.show({
                    color: '#ca4628',
                    title: 'Error!',
                    message: 'There was a problem trying to submit your request. Please try again!',
                })
            }
        }
    }

    async function handleValidateInviteCode() {
        if (inviteCode?.length != 6) {
            notifications.show({
                color: 'red',
                title: 'Error!',
                message: 'The invite code is invalid',
                icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                classNames: notiicationClasses,
            });
            return;
        }

        // show notification
        setLoading(true);
        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });

        var data = {
            'code': inviteCode,
            'request_type': 'no-auth',
        }

        // check if code exists and verify code with server
        var response = await ValidateCode(data);
        if (response?.status === 200) {
            // success, proceed
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'Code was successfully validated.',
                    icon: <IconCheck size="lg" style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1000,
                    classNames: notiicationClasses,
                });
            }, 1000);

            // set values in staff form
            staffForm.values.owner_uid = response.data['owner_uid'];
            staffForm.values.business_id = response.data['business_id'];
            staffForm.values.invite_code = inviteCode;

            setTimeout(() => {
                setStepCount(stepCount + 1);
            },1000);
        }
        else {
            // error
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error validating the code. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
            }, 500);
        }

        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }

    // handle form invalid errors
    const handleError = (errors: any) => {
        var message = "";
        var color = "red";
        if (errors.first_name) {
            message = 'Please fill in first name field';
        }
        else if (errors.last_name) {
            message = 'Please fill in last name field';
        }
        else if (errors.username) {
            message = 'Please fill in username field';
        }
        else if (errors.email) {
            message = 'Please fill in email field';
        }
        else if (errors.password) {
            message = 'Please fill in password field';
        }
        else if (errors.confirm_password) {
            message = 'Your passwords do not match';
        }
        showNotification(message, color);
    };

    // show the notifications with a message and color
    function showNotification(message: string, color: string) {
        notifications.show({
            message: message,
            color: color,
            classNames: notiicationClasses,
        });
    }

    return (
        <>
            {isOwner === false && isEmployee === false && (
                <Paper shadow="md" p="lg" mt="50px" radius="lg" style={{ background: "#0f1714", color: "white" }}>
                    <Image
                        radius="md"
                        src={vsLogo}
                    //h={30}
                    />
                    <Text
                        fw={600}
                        size="40px"
                        ta="center"
                        mb="50px"
                        mt="50px"
                    >
                        Please select one
                    </Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <Paper
                            shadow="md"
                            p="lg"
                            radius="lg"
                            style={{ background: "#24352f", color: "white", cursor: "pointer" }}
                            onClick={() => setIsOwner(true)}
                        >
                            <Stack align="center">
                                <IconBuilding />
                                <Text ta="center" size="lg" fw={700}>I am a business owner/employer</Text>
                            </Stack>
                        </Paper>
                        <Paper
                            shadow="md"
                            p="lg"
                            radius="lg"
                            style={{ background: "#24352f", color: "white", cursor: "pointer" }}
                            onClick={() => setIsEmployee(true)}
                        >
                            <Stack align="center">
                                <IconUser />
                                <Text ta="center" size="lg" fw={700}>I am an employee</Text>
                            </Stack>
                        </Paper>
                    </SimpleGrid>
                </Paper>
            )}

            {/* {isOwner && (
                <Paper shadow="md" p="lg" mt="50px" radius="lg" style={{ background: "#0f1714", color: "white" }}>
                    <Stack>
                        <Image
                            radius="md"
                            src={vsLogo}
                            //h={30}
                        />
                        <Text 
                            size="24px" 
                            fw={900} 
                            ta="center" 
                            style={{ letterSpacing: "1.2px" }}
                        >
                            Efficient time tracking starts here 🕓
                        </Text>
                        <Text ta="center">Join our waitlist to be notified when we launch!</Text>
                        <Space />
                        <TextInput
                            required
                            id="email"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Email"
                            name="email"
                            placeholder="Enter an email"
                            size="lg"
                            classNames={classes}
                            {...waitlistForm.getInputProps('owner_info.email')}
                        />
                    </Stack>
                    <Group mt="lg" justify="space-between">
                        <Button 
                            type="submit" 
                            size="md" 
                            radius="md"
                            variant="light"
                            color="gray"
                            //mt="lg"
                            mr="lg"
                            onClick={() => setIsOwner(false)}
                        >
                            Back
                        </Button>
                        <Button
                            //color="#3c5b4c"
                            color="#4a8a2a"
                            radius="md"
                            size="md"
                            //fullWidth
                            //onClick={handleRegister}
                            onClick={handleWaitlistJoin}
                        >
                            <Title order={4}>Join waitlist</Title>
                        </Button>
                    </Group>
                </Paper>
            )} */}

            {isOwner && isEmployee === false && (
                <Paper shadow="md" p="lg" mt="50px" radius="lg" style={{ background: "#0f1714", color: "white" }}>
                    <Grid align="end">
                        <Grid.Col span={{ base: 12 }}>
                            <Image
                                radius="md"
                                src={vsLogo}
                                //h={30}
                                mb="lg"
                            />
                            <Text size="24px" fw={900} mb="sm">Efficient time tracking starts here 🕓</Text>
                            <Text>Sign up for a free account in less than 60 seconds!</Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                required
                                id="first-name"
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="First name"
                                name="first_name"
                                placeholder="First name"
                                size="lg"
                                classNames={classes}
                                {...form.getInputProps('first_name')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                required
                                id="last-name"
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Last name"
                                name="last_name"
                                placeholder="Last name"
                                size="lg"
                                classNames={classes}
                                {...form.getInputProps('last_name')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12 }}>
                            <TextInput
                                required
                                id="email"
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Email"
                                name="email"
                                placeholder="Email address"
                                size="lg"
                                classNames={classes}
                                {...form.getInputProps('email')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12 }}>
                            <TextInput
                                required
                                id="username"
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Username"
                                name="username"
                                placeholder="Username"
                                size="lg"
                                classNames={classes}
                                {...form.getInputProps('username')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <TextInput
                                required
                                id="password"
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Password"
                                name="password"
                                placeholder="Password"
                                type="password"
                                size="lg"
                                classNames={classes}
                                {...form.getInputProps('password')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <TextInput
                                required
                                id="confirm-password"
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Confirm password"
                                name="confirm_password"
                                placeholder="Password"
                                type="password"
                                size="lg"
                                classNames={classes}
                                {...form.getInputProps('confirm_password')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12 }}>

                        <form onSubmit={form.onSubmit(handleRegister, handleError)}>
                            <Button
                                //color="#3c5b4c"
                                color="#4a8a2a"
                                radius="md"
                                size="md"
                                mb="sm"
                                fullWidth
                                type="submit"
                            >
                                <Title order={4}>Sign up</Title>
                            </Button>
                        </form>
                            
                            
                            <Text>Already have an account? <a style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/login")}>Login</a></Text>
                        </Grid.Col>
                    </Grid>
                    {/* <Stack>
                        <Image
                            radius="md"
                            src={vsLogo}
                            //h={30}
                            mb="lg"
                        />
                        <Text size="24px" fw={900}>Efficient time tracking starts here 🕓</Text>
                        <Text>Sign up for a free account in less than 60 seconds!</Text>
                        <Space />
                        <TextInput
                            required
                            id="username"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Username"
                            name="username"
                            placeholder="Enter a username"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('owner_info.username')}
                        />
                        <TextInput
                            required
                            id="username"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Username"
                            name="username"
                            placeholder="Enter a username"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('owner_info.username')}
                        />
                        <TextInput
                            required
                            id="username"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Username"
                            name="username"
                            placeholder="Enter a username"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('owner_info.username')}
                        />
                        <TextInput
                            required
                            id="email"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Email"
                            name="email"
                            placeholder="Enter an email"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('owner_info.email')}
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
                            {...form.getInputProps('owner_info.password')}
                        /> */}
                    {/* <TextInput
                            required
                            id="confirm-password"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Confirm password"
                            name="confirm_password"
                            placeholder="Confirm your password"
                            type="password"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('owner_info.confirm_password')}
                        />
                        <TextInput
                            required
                            id="pin_code"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Pin code"
                            name="pin_code"
                            placeholder="Enter a 5 digit pin code"
                            type="password"
                            size="lg"
                            maxLength={5}
                            classNames={classes}
                            {...form.getInputProps('owner_info.pin_code')}
                        /> */}
                    {/* <Button
                            //color="#3c5b4c"
                            color="#4a8a2a"
                            radius="md"
                            size="md"
                            fullWidth
                            onClick={handleRegister}
                        >
                            <Title order={4}>Sign up (Free)</Title>
                        </Button>
                        <Text>Already have an account? <a style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/login")}>Login</a></Text>
                    </Stack> */}
                    <Button
                        type="submit"
                        size="md"
                        radius="md"
                        variant="light"
                        color="gray"
                        mt="lg"
                        mr="lg"
                        onClick={() => setIsOwner(false)}
                    >
                        Back
                    </Button>
                </Paper>
            )}

            {isEmployee && stepCount === 0 && (
                <Paper shadow="md" p="lg" mt="50px" radius="lg" style={{ background: "#0f1714", color: "white" }}>
                    <Image
                        radius="md"
                        src={vsLogo}
                        //h={30}
                        mb="lg"
                    />
                    <Text size="24px" fw={900} ta="center" mb="lg">Enter your invite code 🔒</Text>
                    <TextInput
                        required
                        id="code"
                        value={inviteCode}
                        onChange={(event) => setInviteCode(event.currentTarget.value)}
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        //label="Invite code"
                        name="code"
                        placeholder="Enter your invite code to register"
                        size="lg"
                        mb="lg"
                        classNames={classes}
                    //{...form.getInputProps('owner_info.email')}
                    />
                    <Text ta="center">Don't have an invite code?</Text>
                    <Text ta="center">Reach out to your employer and they will give you one.</Text>
                    <Space h="lg" />
                    <Text ta="center">Other issues contact support at support@verifiedhours.com</Text>
                    <Group justify="space-between">
                        <Button
                            type="submit"
                            size="md"
                            radius="md"
                            variant="light"
                            color="gray"
                            mt="lg"
                            mr="lg"
                            onClick={() => setIsEmployee(false)}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            size="md"
                            radius="md"
                            //variant="light"
                            color="#4a8a2a"
                            mt="lg"
                            onClick={handleValidateInviteCode}
                            loading={loading}
                        >
                            Validate code
                        </Button>
                    </Group>

                </Paper>
            )}

            {/* staff registration */}
            {isEmployee && stepCount === 1 && (
                <Paper shadow="md" p="lg" mt="50px" radius="lg" style={{ background: "#0f1714", color: "white" }}>
                    <Grid align="end">
                        <Grid.Col span={{ base: 12 }}>
                            <Image
                                radius="md"
                                src={vsLogo}
                                //h={30}
                                mb="lg"
                            />
                            <Text size="24px" fw={900} mb="sm">Efficient time tracking starts here 🕓</Text>
                            <Text>Sign up for a free account in less than 60 seconds!</Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                required
                                id="first-name"
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="First name"
                                name="first_name"
                                placeholder="First name"
                                size="lg"
                                classNames={classes}
                                {...staffForm.getInputProps('first_name')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                required
                                id="last-name"
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Last name"
                                name="last_name"
                                placeholder="Last name"
                                size="lg"
                                classNames={classes}
                                {...staffForm.getInputProps('last_name')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12 }}>
                            <TextInput
                                required
                                id="email"
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Email"
                                name="email"
                                placeholder="Email address"
                                size="lg"
                                classNames={classes}
                                {...staffForm.getInputProps('email')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12 }}>
                            <TextInput
                                required
                                id="username"
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Username"
                                name="username"
                                placeholder="Username"
                                size="lg"
                                classNames={classes}
                                {...staffForm.getInputProps('username')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <TextInput
                                required
                                id="password"
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Password"
                                name="password"
                                placeholder="Password"
                                type="password"
                                size="lg"
                                classNames={classes}
                                {...staffForm.getInputProps('password')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <TextInput
                                required
                                id="confirm-password"
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Confirm password"
                                name="confirm_password"
                                placeholder="Password"
                                type="password"
                                size="lg"
                                classNames={classes}
                                {...staffForm.getInputProps('confirm_password')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12 }}>
                            <form onSubmit={staffForm.onSubmit(handleRegisterStaff, handleError)}>
                                <Button
                                    //color="#3c5b4c"
                                    color="#4a8a2a"
                                    radius="md"
                                    size="md"
                                    mb="sm"
                                    fullWidth
                                    type="submit"
                                >
                                    <Title order={4}>Sign up</Title>
                                </Button>
                            </form>
                            
                            <Text>Already have an account? <a style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/login")}>Login</a></Text>
                        </Grid.Col>
                    </Grid>
                </Paper>
            )}


        </>
    );
}