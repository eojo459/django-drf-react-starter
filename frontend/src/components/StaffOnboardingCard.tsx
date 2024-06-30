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
import SelectedWorkingHours from "./SelectedWorkingHours";
import { randomId } from "@mantine/hooks";
import { getCurrentTimezoneOffset } from "../helpers/Helpers";

export default function StaffOnboardingCard() {
    const { user, business, session } = useAuth();
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
    const [selectedWeekdays, setSelectedWeekdays] = useState<any[]>([]);
    const [selectedWeekends, setSelectedWeekends] = useState<any[]>([]);
    const [hoursOfOperation, setHoursOfOperation] = useState<any[]>([]);

    // form fields for mantine components
    const staffSelectedWorkForm = useForm({
        initialValues: {
            id: '',
            staff_uid: user?.uid,
            business_id: '',
            monday_start: '',
            monday_end: '',
            tuesday_start: '',
            tuesday_end: '',
            wednesday_start: '',
            wednesday_end: '',
            thursday_start: '',
            thursday_end: '',
            friday_start: '',
            friday_end: '',
            saturday_start: '',
            saturday_end: '',
            sunday_start: '',
            sunday_end: '',
            timezone: getCurrentTimezoneOffset(),
        },
        // validate: (value) => {
        //     return {
        //         hours_of_operation: value.hours_of_operation.length <= 0 ? 'Selected working hours is required' : null,
        //     }
        // }
    });

    const staffForm = useForm({
        initialValues: {
            street: '',
            street_2: '',
            city: '',
            province: '',
            country: '',
            postal_code: '',
            cell_number: '',
            home_number: '',
            work_number: '',
            role: 'STAFF',
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

    // run on component load
    useEffect(() => {
        setupHoursOfOperation();
    },[]);

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

    // check if we can proceed based on if staff form is filled out
    useEffect(() => {
        var canProceedCheck = true;

        if (staffForm.values.street?.length <= 0) {
            canProceedCheck = false;
        }

        if (staffForm.values.country?.length <= 0) {
            canProceedCheck = false;
        }

        if (staffForm.values.city?.length <= 0) {
            canProceedCheck = false;
        }

        if (staffForm.values.province?.length <= 0) {
            canProceedCheck = false;
        }

        if (staffForm.values.postal_code?.length <= 0) {
            canProceedCheck = false;
        }

        if (staffForm.values.cell_number?.length <= 0) {
            canProceedCheck = false;
        }
        setCanProceed(canProceedCheck);

    }, [staffForm]);

    // check if we can finish and submit based on if staff working hours form is filled out
    // useEffect(() => {
    //     var canFinishCheck = true;
    //     if (staffSelectedWorkForm.values.selected_weekdays?.length <= 0 && staffSelectedWorkForm.values.selected_weekends?.length <= 0) {
    //         canFinishCheck = false;
    //     }
    //     setCanFinish(canFinishCheck);
    // }, [staffSelectedWorkForm]);

    // handle when working hours is submitted
    async function handleStaffWorkingHours() {
        var staffValidate = staffSelectedWorkForm.validate();
        if (!staffValidate.hasErrors) {
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

                // update staff info
                var staffInfoResponse = await PatchUserById(user?.uid, staffForm.values, session?.access_token);
                if (staffInfoResponse !== 201) {
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
                    }, 10000);
                }

                // post data to staff selected hours
                var workingHoursResponse = await PostStaffWorkingHours(staffSelectedWorkForm.values, session?.access_token);
                if (workingHoursResponse === 201) {
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
                    
                    // TODO show homebase
                    setTimeout(() => {
                        window.location.reload();
                        //navigate("/dashboard");
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
                    }, 10000);
                }

                setTimeout(() => {
                    setLoading(false);
                }, 2000);
            }
            //console.log(staffSelectedWorkForm.values);
            //console.log(staffForm.values);
        }
        else {
            notifications.show({
                color: '#ca4628',
                title: 'Error!',
                message: 'Please fill in all required fields',
                classNames: notiicationClasses,
            });
            console.log(staffValidate.errors);
        }
    }

    // handle when contact info is validated
    async function handleStaffContactInformation() {  
        var staffValidate = staffForm.validate();
        if (!staffValidate.hasErrors) {
            // increment step count, proceed
            setStepCount(stepCount + 1);
        }
        else {
            notifications.show({
                color: '#ca4628',
                title: 'Error!',
                message: 'Please fill in all required fields',
                classNames: notiicationClasses,
            });
            console.log(staffValidate.errors);
        }
    }

    function handleFormChanges(form: any) {
        switch(form.section) {
            case "contact_info":
                staffForm.setValues(form);
                break;
            case "working_hours":
                // update staff working hours form
                staffSelectedWorkForm.setValues(form);
                break;
        }
    }

    function setupHoursOfOperation() {
        if (!user) {
            return;
        }

        const weekdayValues = [
            { label: "Monday", checked: false, key: randomId() },
            { label: "Tuesday", checked: false, key: randomId() },
            { label: "Wednesday", checked: false, key: randomId() },
            { label: "Thursday", checked: false, key: randomId() },
            { label: "Friday", checked: false, key: randomId() },
        ];
        
        const weekendValues = [
            { label: "Saturday", checked: false, key: randomId() },
            { label: "Sunday", checked: false, key: randomId() },
        ];

        setSelectedWeekdays(weekdayValues);
        setSelectedWeekends(weekendValues);

        setHoursOfOperation([
            {
                'uid': randomId(),
                'day': 'Monday',
                'day_id': 0,
                'start': '',
                'end': '',
                'business_id': '',
            },
            {
                'uid': randomId(),
                'day': 'Tuesday',
                'day_id': 1,
                'start': '',
                'end': '',
                'business_id': '',
            },
            {
                'uid': randomId(),
                'day': 'Wednesday',
                'day_id': 2,
                'start': '',
                'end': '',
                'business_id': '',
            },
            {
                'uid': randomId(),
                'day': 'Thursday',
                'day_id': 3,
                'start': '',
                'end': '',
                'business_id': '',
            },
            {
                'uid': randomId(),
                'day': 'Friday',
                'day_id': 4,
                'start': '',
                'end': '',
                'business_id': '',
            },
            {
                'uid': randomId(),
                'day': 'Saturday',
                'day_id': 5,
                'start': '',
                'end': '',
                'business_id': '',
            },
            {
                'uid': randomId(),
                'day': 'Sunday',
                'day_id': 6,
                'start': '',
                'end': '',
                'business_id': '',
            }
        ])       
    }

    return (
        <Container size="md">
            {/* finish setting up staff contact information */}
            {stepCount === 0 && (
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
                            disabled={canProceed ? false : true}
                            onClick={handleStaffContactInformation}
                        >
                            <Title order={4}>Next</Title>
                        </Button>
                    </Group>
                </Paper>
            )}

            {/* setup staff working hours and schedule */}
            {stepCount === 1 && (
                <Paper shadow="md" p="lg" mt="50px" radius="lg" style={{ background: "#0f1714", color: "white" }}>
                    <Text size="30px" fw={900} mb="sm" ta="center" style={{ letterSpacing: "1px" }}>Almost done! Last step</Text>
                    <Text ta="center">Please enter in this information to setup your account.</Text>
                    <SelectedWorkingHours 
                        selectedWeekdays={selectedWeekdays}
                        selectedWeekends={selectedWeekends}
                        hoursOfOperation={hoursOfOperation}
                        handleFormChanges={handleFormChanges}
                    />
                    <Group justify="space-between" mt="xl">
                         <Button
                            size="lg"
                            radius="md"
                            variant="light"
                            color="gray"
                            onClick={() => setStepCount(stepCount - 1)}
                        >
                            Back
                        </Button>
                        <Button
                            //color="#3c5b4c"
                            color="#4a8a2a"
                            radius="md"
                            size="lg"
                            loading={loading}
                            //disabled={canFinish ? false : true}
                            //fullWidth
                            onClick={handleStaffWorkingHours}
                        >
                            <Title order={4}>Finish</Title>
                        </Button>
                    </Group>
                </Paper>
            )}
        </Container>
    );
}