import { Paper, Stack, Title, Text, TextInput, Button, Space, SimpleGrid, Alert, Image, Group, Grid, rem, Container } from "@mantine/core";
import classes from '../css/TextInput.module.css';
import { useForm } from "@mantine/form";
import { hashPin, useSupabase } from "../authentication/SupabaseContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { IconBuilding, IconCheck, IconUser, IconX } from "@tabler/icons-react";
import { PatchUserById, PostStaffWorkingHours, PostWaitlist, ValidateCode } from "../helpers/Api";
import { notifications } from "@mantine/notifications";
import vsLogo from '../assets/VerifiedHoursLogo2.png';
import { useAuth } from "../authentication/SupabaseAuthContext";
import notiicationClasses from "../css/Notifications.module.css";
import ContactInformationForm from "./forms/ContactInformationForm";

export default function OwnerOnboardingCard() {
    const { user, session } = useAuth();
    const { signUpNewUser, setIsNewUser } = useSupabase();
    const navigate = useNavigate();
    const [isOwner, setIsOwner] = useState(false);
    const [isEmployee, setIsEmployee] = useState(false);
    const [stepCount, setStepCount] = useState(0);
    const location = useLocation();
    const [queryParams, setQueryParams] = useState<Record<string, string>>({});
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [canProceed, setCanProceed] = useState(false);
    const [canFinish, setCanFinish] = useState(false);

    // form fields for mantine components
    const ownerForm = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            username: '',
            password: '',
            cell_number: '',
            home_number: '',
            work_number: '',
            street: '',
            street_2: '',
            city: '',
            province: '',
            country: '',
            postal_code: '',
            country_code: '',
            gender: '',
            pin_code: '',
            role: 'OWNER',
        },
        validate: (value) => {
            return {
                street: value.street.trim().length <= 0 ? 'Street address is required' : null,
                city: value.city.trim().length <= 0 ? 'City is required' : null,
                province: value.province.trim().length <= 0 ? 'Province is required' : null,
                country: value.country.trim().length <= 0 ? 'Country is required' : null,
                postal_code: value.postal_code.length <= 0 ? 'Postal code is required' : null,
                cell_number: value.cell_number.length <= 0 ? 'Cell number is required' : null,
            }
        }
    });

    // get query parameters from url
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const params: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        setInviteCode(params['code']); // set the invite code to the code from the param
        setQueryParams(params);
    }, [location.search]);

    // check if we can finish based on if staff form is filled out
    useEffect(() => {
        var canFinishCheck = true;

        if (ownerForm.values.street?.length <= 0) {
            canFinishCheck = false;
        }

        if (ownerForm.values.country?.length <= 0) {
            canFinishCheck = false;
        }

        if (ownerForm.values.city?.length <= 0) {
            canFinishCheck = false;
        }

        if (ownerForm.values.province?.length <= 0) {
            canFinishCheck = false;
        }

        if (ownerForm.values.postal_code?.length <= 0) {
            canFinishCheck = false;
        }

        if (ownerForm.values.cell_number?.length <= 0) {
            canFinishCheck = false;
        }
        setCanFinish(canFinishCheck);

    }, [ownerForm]);

    // handle when working hours is submitted
    async function handleFinishProfileSetup() {
        var ownerValidate = ownerForm.validate();
        if (!ownerValidate.hasErrors) {
            if (user) {
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

                // update owner info
                var ownerInfoResponse = await PatchUserById(user?.uid, ownerForm.values, session?.access_token);
                if (ownerInfoResponse === 201) {
                    // success
                    setTimeout(() => {
                        notifications.update({
                            id,
                            color: 'teal',
                            title: 'Success',
                            message: 'Account was successfully setup.',
                            icon: <IconCheck size="lg" style={{ width: rem(18), height: rem(18) }} />,
                            loading: false,
                            autoClose: 1000,
                            classNames: notiicationClasses,
                        });
                    }, 1000);
                    
                    // show homebase
                    setTimeout(() => {
                        navigate("/dashboard");
                    }, 2000);
                }
                else {
                    // error
                    setTimeout(() => {
                        notifications.update({
                            id,
                            color: 'red',
                            title: 'Error',
                            message: 'There was an error setting up your account. Please try again.',
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
        }
        else {
            notifications.show({
                color: '#ca4628',
                title: 'Error!',
                message: 'Please fill in all required fields',
                classNames: notiicationClasses,
            });
            console.log(ownerValidate.errors);
        }
    }

    // handle when the form changes
    function handleFormChanges(form: any) {
        var section = form.values.section;
        switch(section) {
            case "contact_info":
                // update owner contact info form
                ownerForm.setValues({
                    ...ownerForm.values,
                    street: form.values.contact_info.street,
                    street_2: form.values.contact_info.street_2,
                    country: form.values.contact_info.country,
                    city: form.values.contact_info.city,
                    province: form.values.contact_info.province,
                    postal_code: form.values.contact_info.postal_code,
                    cell_number: form.values.contact_info.cell_number,
                    work_number: form.values.contact_info.work_number,
                    home_number: form.values.contact_info.home_number,
                });
                break;
        }
    }

    return (
        <Container size="md">
            {/* finish setting up staff contact information */}
            <Paper shadow="md" p="lg" mt="50px" radius="lg" style={{ background: "#0f1714", color: "white" }}>
                    <Text size="30px" fw={900} mb="sm" ta="center" style={{ letterSpacing: "1px" }}>Finish setting up your profile</Text>
                    <Text ta="center">Please enter in this information to setup your account.</Text>
                    <ContactInformationForm 
                        showEmail={false}
                        handleFormChanges={handleFormChanges} 
                    />
                    <Group justify="center" mt="lg">
                        <Button
                            //color="#3c5b4c"
                            color="#4a8a2a"
                            radius="md"
                            size="lg" 
                            //fullWidth
                            disabled={canFinish ? false : true}
                            onClick={handleFinishProfileSetup} 
                        >
                            <Title order={4}>Finish</Title>
                        </Button>
                    </Group>
                </Paper>
        </Container>
    );
}