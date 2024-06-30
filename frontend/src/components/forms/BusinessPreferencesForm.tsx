import { Grid, Paper, Select, Space, Table, TextInput, Text, Switch, useMantineTheme, rem, Group, Stack, Divider, Title, ScrollArea, Button, ActionIcon, NumberInput } from "@mantine/core";
import DayCheckboxes from "../DayCheckboxes";
import { IndustryData, countryData, employeeCountData, canadaProvinceData, timezoneData } from "../../helpers/SelectData";
import classes from '../../css/TextInput.module.css';
import { useEffect, useState } from "react";
import { TimeInputSelectBase } from "../TimeInputSelectBase";
import { IconCheck, IconDots, IconX } from "@tabler/icons-react";
import { randomId } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import { BusinessPlanType } from "../../helpers/Helpers";

interface BusinessPreferencesForm {
    handleFormChanges: (form: any) => void; // send back form data to parent
}

export default function BusinessPreferencesForm(props: BusinessPreferencesForm) {
    const { business } = useAuth();
    const [selectedWeekdays, setSelectedWeekdays] = useState<string>('');
    const theme = useMantineTheme();
    const [gpsStrictModeChecked, setGpsStrictModeChecked] = useState(false);
    const [reviewApproveChecked, setReviewApprovedChecked] = useState(true);
    const [vacationChecked, setVacationChecked] = useState(false);
    const [sickLeaveChecked, setSickLeaveChecked] = useState(false);
    const [holidayDateValue, setHolidayDateValue] = useState<Date | null>(null);
    const [holidayName, setHolidayName] = useState('');
    //const [holidayDateValue, setHolidayDateValue] = useState('');
    const [holidays, setHolidays] = useState([
        { uid: randomId(), holiday_name: "New Year's Day", date: "2024-01-01" },
        { uid: randomId(), holiday_name: "Good Friday", date: "2024-03-29" },
        { uid: randomId(), holiday_name: "Easter Monday", date: "2024-04-01" },
        { uid: randomId(), holiday_name: "Victoria Day", date: "2024-05-20" },
        { uid: randomId(), holiday_name: "Canada Day", date: "2024-07-01" },
        { uid: randomId(), holiday_name: "Labour Day", date: "2024-09-02" },
        { uid: randomId(), holiday_name: "Thanksgiving Day", date: "2024-10-28" },
        { uid: randomId(), holiday_name: "Remembrance Day", date: "2024-11-11" },
        { uid: randomId(), holiday_name: "Christmas Day", date: "2024-12-25" },
        { uid: randomId(), holiday_name: "Boxing Day", date: "2024-12-26" },
    ]); // holidays name and MM-DD-XXXX
    const [holidayTableRows, setHolidayTableRows] = useState<JSX.Element[]>([]);

    //setup props
    const handleFormChangesProp = props.handleFormChanges;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            gps_geolocation: false,
            review_approve_edits: false,
            report_submit_day: '',
            report_frequency: '',
            section: 'business_preferences',
        },
        onValuesChange: (values) => {
            handleFormChangesProp(values);
        },
    });


    return (
        <>
            {/* <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background: "#25352F", color: "#dcdcdc" }}> */}
            <Grid>
                {/* review changes */}
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Group justify="space-between" wrap="nowrap" gap="xl">
                        <div>
                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Review and approve timesheet changes and edits</Text>
                            <Text size="md" c="dimmed" mt="sm">
                                All timesheet changes must be approved by managers and above.
                            </Text>
                        </div>
                        <Switch
                            checked={reviewApproveChecked}
                            onChange={(event) => {
                                setReviewApprovedChecked(event.currentTarget.checked);
                                form.setFieldValue('review_approve_edits', event.currentTarget.checked);
                            }}
                            offLabel="OFF"
                            onLabel="ON"
                            color="#4a8a2a"
                            size="xl"
                            //label={<Text size="xl" fw={700}>Holiday</Text>}
                            thumbIcon={
                                reviewApproveChecked ? (
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

                {/* gps geolocation */}
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Group justify="space-between" wrap="nowrap" gap="xl">
                        <div>
                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>GPS geolocation enforcement</Text>
                            <Text size="md" c="dimmed" mt="sm">
                                Employees must enable their GPS location and be physically present at the work location in order to clock in, clock out, and go on break.
                            </Text>
                        </div>
                        <Switch
                            checked={gpsStrictModeChecked}
                            onChange={(event) => {
                                setGpsStrictModeChecked(event.currentTarget.checked);
                                form.setFieldValue('gps_geolocation', event.currentTarget.checked);
                            }}
                            offLabel="OFF"
                            onLabel="ON"
                            color="#4a8a2a"
                            disabled={business?.plan !== BusinessPlanType.FREE ? false : true}
                            size="xl"
                            //label={<Text size="xl" fw={700}>Holiday</Text>}
                            thumbIcon={
                                gpsStrictModeChecked ? (
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
                
                {/* report submit frequency */}
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Group justify="space-between" wrap="nowrap" gap="xl">
                        <div>
                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Automatic report submission scheduled frequency</Text>
                            <Text size="md" c="dimmed" mt="sm">
                                The system will automatically submit all unsubmitted timesheet reports on this schedule.
                            </Text>
                        </div>
                        <Select
                            required
                            allowDeselect={false}
                            id="frequency"
                            label="Scheduled frequency"
                            name="frequency"
                            placeholder="Select one"
                            size="lg"
                            classNames={classes}
                            data={['Weekly','Bi-weekly','Monthly']}
                            {...form.getInputProps('report_frequency')}
                        />
                    </Group>
                </Grid.Col>

                {/* report submit day */}
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Group justify="space-between" wrap="nowrap" gap="xl">
                        <div>
                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Automatic report submission day</Text>
                            <Text size="md" c="dimmed" mt="sm">
                                The system will automatically submit all unsubmitted timesheet reports on this day.
                            </Text>
                        </div>
                        <Select
                            required
                            allowDeselect={false}
                            id="day"
                            label="Day of week"
                            name="day"
                            placeholder="Select a day"
                            size="lg"
                            classNames={classes}
                            data={['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']}
                            {...form.getInputProps('report_submit_day')}
                        />
                    </Group>
                </Grid.Col>
            </Grid>

            {/* </Paper> */}
        </>
    );
}