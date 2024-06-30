import { Grid, Paper, Select, Space, Table, TextInput, Text, Switch, useMantineTheme, rem, Group, Stack, Divider, Title, ScrollArea, Button, ActionIcon, NumberInput } from "@mantine/core";
import DayCheckboxes from "../DayCheckboxes";
import { IndustryData, countryData, employeeCountData, canadaProvinceData, timezoneData } from "../../helpers/SelectData";
import classes from '../../css/TextInput.module.css';
import { useEffect, useState } from "react";
import { TimeInputSelectBase } from "../TimeInputSelectBase";
import { IconCheck, IconDots, IconX } from "@tabler/icons-react";
import { randomId, useDisclosure, useMediaQuery } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import { BusinessManagementFormData, BusinessSettings, Holiday, PayrollInformation, PayrollInformationForm } from "../../pages/owner-dashboard/business/Business-Management";
import { GenerateNullUUID, GenerateUUID, convertMinutesToHoursAndMinutes } from "../../helpers/Helpers";
import DeleteHolidayConfirmModal from "../DeleteHolidayConfirmModal";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../../css/Notifications.module.css";
import { DeleteHolidayById } from "../../helpers/Api";
import { HoursMinutesCombobox } from "../HoursMinutesCombobox";

interface BusinessPayrollForm {
    handleFormChanges: (form: any) => void; // send back form data to parent
    handleGenerateHoliday: () => void; // send signal to update payrollData with generated holidays
    payrollData: PayrollInformation | undefined;
}

export default function BusinessPayrollForm(props: BusinessPayrollForm) {
    const { user, business, session } = useAuth();
    const [selectedWeekdays, setSelectedWeekdays] = useState<string>('');
    const theme = useMantineTheme();
    const [overtimeChecked, setOvertimeChecked] = useState(false);
    const [holidayPayChecked, setHolidayPayChecked] = useState(true);
    const [vacationChecked, setVacationChecked] = useState(false);
    const [sickLeaveChecked, setSickLeaveChecked] = useState(false);
    const [holidayDateValue, setHolidayDateValue] = useState<Date | null>(null);
    const [holidayName, setHolidayName] = useState('');
    //const [holidayDateValue, setHolidayDateValue] = useState('');
    const [holidays, setHolidays] = useState<any[]>([]); // holidays name and MM-DD-XXXX
    const [payrollData, setPayrollData] = useState<PayrollInformation>();
    const [holidayTableRows, setHolidayTableRows] = useState<JSX.Element[]>([]);
    const classes2 = "mantine-Popover-dropdown";
    const [holidayApiData, setHolidayApiData] = useState<any[]>([]);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [deleteHolidayModalOpened, { open: openDeleteHolidayModal, close: closeDeleteHolidayModal }] = useDisclosure(false);
    const [selectedHolidayIdToDelete, setSelectedHolidayIdToDelete] = useState(''); // id of the holiday we want to delete if we click delete in the modal
    const [selectedHolidayToDelete, setSelectedHolidayToDelete] = useState({});
    const [overtimeHours, setOvertimeHours] = useState(convertMinutesToHoursAndMinutes(props.payrollData?.overtime_max_duration ?? 0).hours.toString());
    const [overtimeMinutes, setOvertimeMinutes] = useState(convertMinutesToHoursAndMinutes(props.payrollData?.overtime_max_duration ?? 0).minutes.toString());

    //setup props
    const handleFormChangesProp = props.handleFormChanges;
    const handleGenerateHolidayProp = props.handleGenerateHoliday;
    const payrollDataProp = props.payrollData;

    // form fields for mantine components
    //const payrollForm = useForm<PayrollInformationForm>();
    const form = useForm({
        initialValues: {
            id: payrollDataProp?.id ?? '',
            business_id: payrollDataProp?.business_id ?? '',
            overtime: payrollDataProp?.overtime ?? false,
            overtime_rate: payrollDataProp?.overtime_rate ?? '',
            overtime_max_duration: payrollDataProp?.overtime_max_duration ?? '',
            holiday: payrollDataProp?.holiday ?? true,
            holiday_rate: payrollDataProp?.holiday_rate ?? '',
            holidays: payrollDataProp?.holidays ?? '',
            vacation: payrollDataProp?.vacation ?? false,
            vacation_rate: payrollDataProp?.vacation_rate ?? 1.0,
            vacation_days_accrual_period: payrollDataProp?.vacation_days_accrual_period ?? 0,
            vacation_days_gained_per_accrual: payrollDataProp?.vacation_days_gained_per_accrual ?? 0,
            sick_leave: payrollDataProp?.sick_leave ?? false,
            sick_leave_rate: payrollDataProp?.sick_leave_rate ?? 1,
            sick_leave_days_accrual_period: payrollDataProp?.sick_leave_days_accrual_period ?? 0,
            sick_leave_gained_per_accrual: payrollDataProp?.sick_leave_gained_per_accrual ?? 0,
            federal_tax: payrollDataProp?.federal_tax ?? 0,
            province_tax: payrollDataProp?.province_tax ?? 0,
            employment_insurance: payrollDataProp?.employment_insurance ?? 0,
            canada_pension_plan: payrollDataProp?.canada_pension_plan ?? 0,
            rrsp_contribution: payrollDataProp?.rrsp_contribution ?? 0,
            tfsa_contribution: payrollDataProp?.tfsa_contribution ?? 0,
            country_code: payrollDataProp?.country_code ?? '',
            section: 'business_payroll_info',
        },
        onValuesChange: (values) => {
            handleFormChangesProp(values);
        },
    });

    // run on component load
    useEffect(() => {
        //if (payrollDataProp === undefined) return;
        initializeStates();
    }, []);

    // useEffect(() => {
    //     handleFormChangesProp(payrollForm);
    // }, [payrollForm]);

    // run when holidays changes
    useEffect(() => {
        setHolidayTableRows(updateTableRows());
        if (holidays?.length > 0) {
            form.setFieldValue('holidays', holidays as never[]);
        }
    }, [holidays]);

    useEffect(() => {
        console.log(holidayName);
    }, [holidayName]);

    useEffect(() => {
        console.log(holidayDateValue);
    }, [holidayDateValue]);

    // run when payrollData changes
    useEffect(() => {
        if (payrollDataProp === undefined) return;
        initializeStates();
    }, [payrollDataProp]);

    function initializeStates() {
        if (payrollDataProp === undefined) return;

        setPayrollData(payrollDataProp);
        setHolidays(payrollDataProp?.holidays);
        setHolidayPayChecked(payrollDataProp?.holiday);
        setOvertimeChecked(payrollDataProp?.overtime);
        setVacationChecked(payrollDataProp?.vacation);
        setSickLeaveChecked(payrollDataProp?.sick_leave);

        form.setValues(payrollDataProp);
    }

    function handleFormChanges(form: any) {
        handleFormChangesProp(form);
    }

    function handleOvertimeDurationChange(hours: number, minutes: number) {
        // convert hours and minutes to minutes
        var hoursToMinutes = hours * 60;
        form.setFieldValue('overtime_max_duration', hoursToMinutes + minutes);
        setOvertimeHours(hours.toString());
        setOvertimeMinutes(minutes.toString());
        //handleFormChanges(form);
    }

    const handleAddHoliday = () => {
        // Check if both name and date are provided
        if (holidayName.trim() === '' || holidayDateValue == null) {
            // Handle error, e.g., show a message to the user
            return;
        }

        const formattedDate = new Date(holidayDateValue).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

        // Create a new holiday object
        const newHoliday = {
            id: GenerateNullUUID(),
            name: holidayName,
            date: formattedDate,
            country_code: payrollData?.country_code,
            global_holiday: false,
        };

        // Update the holidays list
        setHolidays([...holidays, newHoliday]);

        // Clear input values
        setHolidayName('');
        setHolidayDateValue(null);
    };

    // api call to DELETE the holiday by id
    async function handleDeleteHoliday(positionId: string) {
        if (user && business) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });
            var response = await DeleteHolidayById(business?.id, positionId, session?.access_token);
            if (response == 200) {
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Holiday was deleted.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 250);

                // reset states
                setSelectedHolidayIdToDelete('');
                setSelectedHolidayToDelete({});
            }
            else {
                // show error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error deleting the holiday. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 250);
            }
        }
    }

    const handleRemoveHoliday = (holidayToRemove: any) => {
        // Filter out the holiday to remove
        const updatedHolidays = holidays.filter((holiday) => holiday.name !== holidayToRemove.name);
        setHolidays(updatedHolidays);
    };

    function handleActionIconXClick(holiday: any) {
        // save the id of the position we want to delete
        if (holiday?.id[0] != "#") {
            setSelectedHolidayIdToDelete(holiday?.id);
            setSelectedHolidayToDelete(holiday);
            openDeleteHolidayModal();
        }
        else {
            handleRemoveHoliday(holiday);
        }
    }

    function handleModalDeleteHolidayClick() {
        // if we selected an actual holiday to delete and not a default one
        if (selectedHolidayIdToDelete[0] != "#") {
            handleDeleteHoliday(selectedHolidayIdToDelete);
            handleRemoveHoliday(selectedHolidayToDelete);
        }
    }


    // render table rows
    const updateTableRows = () => {
        return holidays?.map((holiday) => (
            <Table.Tr key={GenerateUUID()}>
                <Table.Td><Text size="lg">{holiday.name}</Text></Table.Td>
                <Table.Td><Text size="lg">{holiday.date}</Text></Table.Td>
                <Table.Td>
                    <ActionIcon variant="subtle" color="gray">
                        <IconX onClick={() => handleActionIconXClick(holiday)} />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>
        ));
    };

    //const rows = updateTableRows(); // Initial rendering

    return (
        <>
            {deleteHolidayModalOpened && (
                <DeleteHolidayConfirmModal
                    modalOpened={deleteHolidayModalOpened}
                    isMobile={isMobile != undefined ? isMobile : false}
                    closeModal={closeDeleteHolidayModal}
                    handleDeleteClick={handleModalDeleteHolidayClick}
                />
            )}
            {/* <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background: "#25352F", color: "#dcdcdc" }}> */}
            <Grid>
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Text size="xl" mb="md" fw={600}>Providing this information is essential for maintaining payroll accuracy and compliance.</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Group justify="space-between" wrap="nowrap" gap="xl">
                        <div>
                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Holiday pay</Text>
                            <Text size="md" c="dimmed" mt="sm">
                                Employees will be paid a holiday rate if they work during holidays.
                            </Text>
                        </div>
                        <Switch
                            checked={holidayPayChecked}
                            onChange={(event) => {
                                setHolidayPayChecked(event.currentTarget.checked);
                                form.setFieldValue('holiday', event.currentTarget.checked);
                            }}
                            offLabel="OFF"
                            onLabel="ON"
                            color="#4a8a2a"
                            size="xl"
                            //label={<Text size="xl" fw={700}>Holiday</Text>}
                            thumbIcon={
                                holidayPayChecked ? (
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
                {holidayPayChecked && (
                    <>
                        <Grid.Col span={{ base: 12 }}>
                            <Group justify="start">
                                <NumberInput
                                    id="holiday-rate"
                                    required
                                    //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Holiday pay rate"
                                    name="holiday_rate"
                                    placeholder="Holiday rate"
                                    size="lg"
                                    suffix="x"
                                    min={1}
                                    max={10}
                                    mb="md"
                                    style={{ width: '200px' }}
                                    decimalScale={2}
                                    fixedDecimalScale
                                    defaultValue={1.5}
                                    classNames={classes}
                                    {...form.getInputProps('holiday_rate')}
                                />
                            </Group>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12 }} mb="lg">
                            <Stack>
                                <Group align="flex-end">
                                    <Stack>
                                        <Text size="xl" fw={700}>Add a new holiday</Text>
                                        <TextInput
                                            id="new-holiday"
                                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                            value={holidayName}
                                            onChange={(event) => setHolidayName(event.target.value)}
                                            label="Name"
                                            name="new_holiday"
                                            placeholder="Holiday name"
                                            size="lg"
                                            classNames={classes}
                                        />
                                    </Stack>
                                    <DateInput
                                        value={holidayDateValue}
                                        onChange={setHolidayDateValue}
                                        label="Date"
                                        placeholder="Date"
                                        size="lg"
                                        radius="md"
                                        classNames={classes}
                                    />
                                    <Button
                                        //fullWidth 
                                        size="lg"
                                        radius="md"
                                        onClick={() => {
                                            handleAddHoliday();
                                        }}
                                        color="#4a8a2a"
                                    //variant="light"
                                    >
                                        <Title order={4}>Add</Title>
                                    </Button>
                                    <Button
                                        //fullWidth 
                                        size="lg"
                                        radius="md"
                                        onClick={() => {
                                            handleGenerateHolidayProp();
                                        }}
                                        color="#43554E"
                                    //variant="light"
                                    >
                                        <Title order={4}>Generate holidays</Title>
                                    </Button>
                                </Group>
                                <Table.ScrollContainer minWidth={500}>
                                    <Table verticalSpacing="md">
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th><Text size="lg" fw={700}>Holiday name</Text></Table.Th>
                                                <Table.Th><Text size="lg" fw={700}>Date</Text></Table.Th>
                                                <Table.Th></Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>

                                        <Table.Tbody>
                                            {holidayTableRows}
                                        </Table.Tbody>
                                    </Table>
                                </Table.ScrollContainer>
                            </Stack>
                        </Grid.Col>
                    </>

                )}

                {/* overtime */}
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Group justify="space-between" wrap="nowrap" gap="xl">
                        <div>
                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Overtime pay</Text>
                            <Text size="md" c="dimmed" mt="sm">
                                Employees will be paid an overtime rate if they exceed their maximum work hours and work overtime.
                            </Text>
                        </div>
                        <Switch
                            checked={overtimeChecked}
                            onChange={(event) => {
                                setOvertimeChecked(event.currentTarget.checked);
                                form.setFieldValue('overtime', event.currentTarget.checked);
                            }}
                            offLabel="OFF"
                            onLabel="ON"
                            color="#4a8a2a"
                            size="xl"
                            //label={<Text size="xl" fw={700}>Holiday</Text>}
                            thumbIcon={
                                overtimeChecked ? (
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

                {overtimeChecked && (
                    <>
                        <Grid.Col span={{ base: 12 }}>
                            <Group justify="start">
                                <NumberInput
                                    id="overtime-rate"
                                    required
                                    //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Overtime pay rate"
                                    name="overtime_rate"
                                    placeholder="Overtime rate"
                                    size="lg"
                                    suffix="x"
                                    min={1.5}
                                    max={10}
                                    style={{ width: '200px' }}
                                    decimalScale={2}
                                    fixedDecimalScale
                                    defaultValue={1.5}
                                    classNames={classes}
                                    {...form.getInputProps('overtime_rate')}
                                />
                            </Group>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12 }}>
                            <Text mt="lg" size="xl" fw={700}>Overtime maximum shift duration</Text>
                            <Text>Please provide the maximum amount of time that an overtime shift can last.</Text>
                            <Space h="lg" />
                            <HoursMinutesCombobox
                                hoursData={overtimeHours}
                                minutesData={overtimeMinutes}
                                handleTimeChange={handleOvertimeDurationChange}
                            />
                        </Grid.Col>

                    </>
                )}


                {/* vacation */}
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Group justify="space-between" wrap="nowrap" gap="xl">
                        <div>
                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Vacation pay</Text>
                            <Text size="md" c="dimmed" mt="sm">
                                Employees will be paid a vacation rate when they take any vacation leave.
                            </Text>
                        </div>
                        <Switch
                            checked={vacationChecked}
                            onChange={(event) => {
                                setVacationChecked(event.currentTarget.checked);
                                form.setFieldValue('vacation', event.currentTarget.checked);
                            }}
                            offLabel="OFF"
                            onLabel="ON"
                            color="#4a8a2a"
                            size="xl"
                            //label={<Text size="xl" fw={700}>Holiday</Text>}
                            thumbIcon={
                                vacationChecked ? (
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

                {vacationChecked && (
                    <Grid.Col span={{ base: 12 }}>
                        <Group justify="start">
                            <NumberInput
                                id="vacation-rate"
                                required
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Vacation pay rate"
                                name="vacation_rate"
                                placeholder="Vacation rate"
                                size="lg"
                                suffix="x"
                                min={1}
                                max={10}
                                style={{ width: '200px' }}
                                decimalScale={2}
                                fixedDecimalScale
                                defaultValue={1}
                                classNames={classes}
                                {...form.getInputProps('vacation_rate')}
                            />
                        </Group>
                    </Grid.Col>
                )}

                {/* sick */}
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Group justify="space-between" wrap="nowrap" gap="xl">
                        <div>
                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Sick leave pay</Text>
                            <Text size="md" c="dimmed" mt="sm">
                                Employees will be paid a sick leave rate when they take any sick leave.
                            </Text>
                        </div>
                        <Switch
                            checked={sickLeaveChecked}
                            onChange={(event) => {
                                setSickLeaveChecked(event.currentTarget.checked);
                                form.setFieldValue('sick_leave', event.currentTarget.checked);
                            }}
                            offLabel="OFF"
                            onLabel="ON"
                            color="#4a8a2a"
                            size="xl"
                            //label={<Text size="xl" fw={700}>Holiday</Text>}
                            thumbIcon={
                                sickLeaveChecked ? (
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
                {sickLeaveChecked && (
                    <Grid.Col span={{ base: 12 }}>
                        <Group justify="start">
                            <NumberInput
                                id="sick-rate"
                                required
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Sick leave pay rate"
                                name="sick_rate"
                                placeholder="Sick rate"
                                size="lg"
                                suffix="x"
                                min={1}
                                max={10}
                                style={{ width: '200px' }}
                                decimalScale={2}
                                fixedDecimalScale
                                defaultValue={1}
                                classNames={classes}
                                {...form.getInputProps('sick_leave_rate')}
                            />
                        </Group>
                    </Grid.Col>
                )}

                {/* {sickLeaveChecked && (
                    <>
                        <Grid mt="lg">
                            <Grid.Col span={{ base: 12 }}>
                                <Group>
                                    <Text size="lg" fw={500}>Work</Text>
                                    <TextInput
                                        id="business-days-sick"
                                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                        //label="B 2"
                                        name="business_days_sick"
                                        placeholder="x"
                                        size="lg"
                                        classNames={classes}
                                        style={{ width: "70px" }}
                                        {...form.getInputProps('business_payroll_info.sick_leave_days_accrual_period')}
                                    />
                                    <Text size="lg" fw={500}>business days</Text>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12 }}>
                                <Group>
                                    <Text size="lg" fw={500}>Get</Text>
                                    <TextInput
                                        id="sick-days"
                                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                        //label="B 2"
                                        name="sick_days"
                                        placeholder="y"
                                        size="lg"
                                        classNames={classes}
                                        style={{ width: "70px" }}
                                        {...form.getInputProps('business_payroll_info.sick_leave_gained_per_accrual')}
                                    />
                                    <Text size="lg" fw={500}>sick days</Text>
                                </Group>
                            </Grid.Col>
                        </Grid>
                    </>

                )} */}
                <Grid.Col span={{ base: 12, md: 6 }} mt="lg">
                    <NumberInput
                        id="province-tax"
                        required
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        label="Province/Territory tax"
                        name="province_tax"
                        placeholder="Province/Territory/State tax"
                        size="lg"
                        suffix="%"
                        min={0}
                        max={99}
                        decimalScale={2}
                        fixedDecimalScale
                        defaultValue={1.5}
                        classNames={classes}
                        {...form.getInputProps('province_tax')}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }} mt="lg">
                    <NumberInput
                        id="federal-tax"
                        required
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        label="Federal tax"
                        name="federal_tax"
                        placeholder="Federal tax"
                        size="lg"
                        suffix="%"
                        min={0}
                        max={99}
                        decimalScale={2}
                        fixedDecimalScale
                        defaultValue={1.5}
                        classNames={classes}
                        {...form.getInputProps('federal_tax')}
                    />
                </Grid.Col>
            </Grid>

            {/* </Paper> */}
        </>
    );
}