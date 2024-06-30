import { Container, Stack, Title, Text, Box, Group, Switch, Grid, Button, rem, useMantineTheme, Select, Space } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { ChangeEvent, useEffect, useState } from "react";
import classes from "../../../../css/TextInput.module.css";
import { reportingFrequencyData } from "../../../../helpers/SelectData";
import { UseFormReturnType, useForm } from "@mantine/form";
import { PatchBusinessById } from "../../../../helpers/Api";
import { useAuth } from "../../../../authentication/SupabaseAuthContext";
import { BusinessProfile } from "./CentreInformation";
import { useMediaQuery } from "@mantine/hooks";
import { HoursMinutesCombobox } from "../../../../components/HoursMinutesCombobox";
import { convertMinutesToHoursAndMinutes } from "../../../../helpers/Helpers";

interface CentreSettings {
    businessData: BusinessProfile;
    handleOnChange: (formData: any) => void;
}

export default function CentreSettings(props: CentreSettings) {
    const { user, session } = useAuth();
    const [strictMode, setStrictMode] = useState(false);
    const [strictModeLocation, setStrictModeLocation] = useState(props.businessData.gps_geolocation);
    const [reviewChanges, setReviewChanges] = useState(props.businessData.review_approve_edits);
    const [submittedTimesheetEmail, setSubmittedTimesheetEmail] = useState(props.businessData.submitted_timesheet_email);
    const [autoClockedOutEmail, setAutoClockedOutEmail] = useState(props.businessData.auto_clocked_out_email);
    const [autoClockOutHours, setAutoClockOutHours] = useState(convertMinutesToHoursAndMinutes(props.businessData.auto_clock_out_max_duration).hours.toString());
    const [autoClockOutMinutes, setAutoClockOutMinutes] = useState(convertMinutesToHoursAndMinutes(props.businessData.auto_clock_out_max_duration).minutes.toString());
    const theme = useMantineTheme();
    const isMobile = useMediaQuery('(max-width: 50em)');

    // setup props
    const businessDataProp = props.businessData;
    const handleOnChangeProp = props.handleOnChange;

    // form fields for mantine components
    const formData = useForm({
        initialValues: {
            review_approve_edits: businessDataProp.review_approve_edits,
            gps_geolocation: businessDataProp.gps_geolocation,
            report_frequency: businessDataProp.report_frequency,
            auto_clocked_out_email: businessDataProp.auto_clocked_out_email,
            auto_clock_out_max_duration: businessDataProp.auto_clock_out_max_duration,
            submitted_timesheet_email: businessDataProp.submitted_timesheet_email,
            section: 'business_settings',
        },
        onValuesChange: (values) => {
            handleOnChangeProp(values);
        },
    });

    // update form when review/approve timesheet changes, has changed
    function handleReviewApproveChange(checked: boolean) {
        setReviewChanges(checked);
        formData.setFieldValue('review_approve_edits', checked);
    }

    // update form when gps geolocation changes
    function handleGpsGeolocationChange(checked: boolean) {
        setStrictModeLocation(checked);
        formData.setFieldValue('gps_geolocation', checked);
    }

    // update form when auto clock out email changes
    function handleAutoClockOutEmailChange(checked: boolean) {
        setAutoClockedOutEmail(checked);
        formData.setFieldValue('auto_clocked_out_email', checked);
    }

    // update form when submitted timesheet email changes
    function handleSubmittedTimesheetEmailChange(checked: boolean) {
        setSubmittedTimesheetEmail(checked);
        formData.setFieldValue('submitted_timesheet_email', checked);
    }

    // update form when auto clock out timer changes
    function handleAutoClockOutTimerChange(hours: number, minutes: number) {
        // convert hours and minutes to minutes
        var hoursToMinutes = hours * 60;
        formData.setFieldValue('auto_clock_out_max_duration', hoursToMinutes + minutes);
    }

    // run on component load
    useEffect(() => {
        setReviewChanges(businessDataProp.review_approve_edits);
        setStrictModeLocation(businessDataProp.gps_geolocation);
        setAutoClockedOutEmail(businessDataProp.auto_clocked_out_email);
    }, []);

    // run when auto clock out max duration changes
    // useEffect(() => {
    //     if (formData.values.auto_clock_out_max_duration === undefined) return;
    //     setAutoClockOutHours(convertMinutesToHoursAndMinutes(formData.values.auto_clock_out_max_duration).hours.toString());
    //     setAutoClockOutMinutes(convertMinutesToHoursAndMinutes(formData.values.auto_clock_out_max_duration).minutes.toString());
    // }, [formData.values.auto_clock_out_max_duration]);


    // useEffect(() => {
    //     setAutoClockOutEmail(businessDataProp.auto_clock_out_email);
    // }, [formData.values.auto_clock_out_email]);

    return (
        <>
            <Grid>
            
                {/* review changes */}
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Group justify="space-between" wrap="nowrap" gap="xl">
                        <div>
                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Review and approve timesheet changes</Text>
                            <Text size="md" c="dimmed" mt="sm">
                                All timesheet changes must be approved by managers and above.
                            </Text>
                        </div>
                        <Switch
                            checked={reviewChanges}
                            onChange={(event) => {
                                handleReviewApproveChange(event.currentTarget.checked);
                            }}
                            offLabel="OFF"
                            onLabel="ON"
                            color="#4a8a2a"
                            size="xl"
                            //label={<Text size="xl" fw={700}>Holiday</Text>}
                            thumbIcon={
                                reviewChanges ? (
                                    <IconCheck
                                        style={{ width: rem(12), height: rem(12) }}
                                        color={theme.colors.teal[6]}
                                        stroke={3}
                                    />
                                ) : (
                                    <IconX
                                        style={{ width: rem(12), height: rem(12) }}
                                        color={theme.colors.red[6]}
                                        stroke={3}
                                    />
                                )
                            }
                        />
                    </Group>
                </Grid.Col>
            
                {/* strict mode */}
                {/* <Group justify="space-between" wrap="nowrap" gap="xl">
                    <div>
                        <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Strict mode</Text>
                        <Text size="lg" c="dimmed">
                            Restrict timesheet entries to follow the current local time. Users can't select times in the past.
                        </Text>
                    </div>
                    <Switch
                        checked={strictMode}
                        onChange={(event) => setStrictMode(event.currentTarget.checked)}
                        offLabel="OFF"
                        onLabel="ON"
                        color="#4a8a2a"
                        size="xl"
                        thumbIcon={
                            strictMode ? (
                                <IconCheck
                                    style={{ width: rem(12), height: rem(12) }}
                                    color={theme.colors.teal[6]}
                                    stroke={3}
                                />
                            ) : (
                                <IconX
                                    style={{ width: rem(12), height: rem(12) }}
                                    color={theme.colors.red[6]}
                                    stroke={3}
                                />
                            )
                        }
                    />
                </Group> */}

                {/* GPS strict mode */}
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Group justify="space-between" wrap="nowrap" gap="xl">
                        <div>
                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>GPS Geolocation</Text>
                            <Text size="md" c="dimmed" mt="sm">
                                Only allow editing of time entries (check in/check out) onsite and in person.
                            </Text>
                        </div>
                        <Switch
                            checked={strictModeLocation}
                            onChange={(event) => {
                                handleGpsGeolocationChange(event.currentTarget.checked);
                            }}
                            offLabel="OFF"
                            onLabel="ON"
                            color="#4a8a2a"
                            size="xl"
                            //label={<Text size="xl" fw={700}>Holiday</Text>}
                            thumbIcon={
                                strictModeLocation ? (
                                    <IconCheck
                                        style={{ width: rem(12), height: rem(12) }}
                                        color={theme.colors.teal[6]}
                                        stroke={3}
                                    />
                                ) : (
                                    <IconX
                                        style={{ width: rem(12), height: rem(12) }}
                                        color={theme.colors.red[6]}
                                        stroke={3}
                                    />
                                )
                            }
                        />
                    </Group>
                </Grid.Col>

                {/* reporting frequency */}
                {/* <Group justify="space-between" wrap="nowrap" gap="xl">
                    <div>
                        <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Automatic report scheduled frequency</Text>
                        <Text size="lg" c="dimmed">
                            All timesheet changes must be approved by managers and above.
                        </Text>
                    </div>
                    <Select
                        required
                        id="industry"
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        allowDeselect={false}
                        placeholder="Select a frequency"
                        //label="Industry"
                        name="industry"
                        size="lg"
                        classNames={classes}
                        data={reportingFrequencyData}
                        {...formData.getInputProps('report_frequency')}
                    >
                    </Select>
                </Group> */}

                {/* new submitted timesheet email */}
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Group justify="space-between" wrap="nowrap" gap="xl">
                        <div>
                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>New submitted timesheet email notification</Text>
                            <Text size="md" c="dimmed" mt="sm">
                                Send an email notification every time a new timesheet is submitted.
                            </Text>
                        </div>
                        <Switch
                            checked={submittedTimesheetEmail}
                            onChange={(event) => {
                                handleSubmittedTimesheetEmailChange(event.currentTarget.checked);
                            }}
                            offLabel="OFF"
                            onLabel="ON"
                            color="#4a8a2a"
                            size="xl"
                            //label={<Text size="xl" fw={700}>Holiday</Text>}
                            thumbIcon={
                                submittedTimesheetEmail ? (
                                    <IconCheck
                                        style={{ width: rem(12), height: rem(12) }}
                                        color={theme.colors.teal[6]}
                                        stroke={3}
                                    />
                                ) : (
                                    <IconX
                                        style={{ width: rem(12), height: rem(12) }}
                                        color={theme.colors.red[6]}
                                        stroke={3}
                                    />
                                )
                            }
                        />
                    </Group>
                </Grid.Col>

                {/* auto clock out email */}
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Group justify="space-between" wrap="nowrap" gap="xl">
                        <div>
                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Auto clock out email notification</Text>
                            <Text size="md" c="dimmed" mt="sm">
                                Send an email notification every time the auto clock out system is triggered.
                            </Text>
                        </div>
                        <Switch
                            checked={autoClockedOutEmail}
                            onChange={(event) => {
                                handleAutoClockOutEmailChange(event.currentTarget.checked);
                            }}
                            offLabel="OFF"
                            onLabel="ON"
                            color="#4a8a2a"
                            size="xl"
                            //label={<Text size="xl" fw={700}>Holiday</Text>}
                            thumbIcon={
                                autoClockedOutEmail ? (
                                    <IconCheck
                                        style={{ width: rem(12), height: rem(12) }}
                                        color={theme.colors.teal[6]}
                                        stroke={3}
                                    />
                                ) : (
                                    <IconX
                                        style={{ width: rem(12), height: rem(12) }}
                                        color={theme.colors.red[6]}
                                        stroke={3}
                                    />
                                )
                            }
                        />
                    </Group>
                </Grid.Col>

                {/* auto clock out timer */}
                <Grid.Col span={{ base: 12 }}>
                    <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Auto clock out timer</Text>
                    <Text size="md" c="dimmed" mt="sm">
                        Set the time limit after which the auto clock-out will activate if employees forget to clock out.
                    </Text>
                    <Space h="lg" />
                    <HoursMinutesCombobox
                        hoursData={autoClockOutHours}
                        minutesData={autoClockOutMinutes}
                        handleTimeChange={handleAutoClockOutTimerChange}
                    />
                    <Space h="lg" />
                </Grid.Col>
            </Grid>
        </>
    );
}