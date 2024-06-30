import { ActionIcon, Badge, Box, Button, Container, Grid, Group, Modal, Paper, Space, Stack, Table, Text, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import TimesheetTable from "./components/TimesheetTable";
import TimesheetTimeline from "../../components/TimesheetTimeline";
import "../../css/AttendanceTable.scss";
import ChangeReasonModal from "./components/ChangeReasonModal";
import { useNavigate } from "react-router-dom";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useNavigationContext } from "../../context/NavigationContext";
import SubmitTimesheetConfirmModal from "../../components/SubmitTimesheetConfirmModal";
import { MonthPickerInput } from "@mantine/dates";
import classes from "../../css/TextInput.module.css";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import { GetArchivedStaffTimesheetData } from "../../helpers/Api";
import { ArchivedStaffTimesheetData } from "./timesheet";
import ArchivedTimesheets from "../owner-dashboard/components/ArchivedTimesheets";

export interface TimesheetDataReview {
    type: string;
    value: string;
    description: string;
}

export const timesheetData = [
    { type: 'Total hours', value: '8h 0m', description: 'Total time was 8h 0m' },
    { type: 'Pay rate', value: '$20.00', description: 'Pay rate is $20.00 per hour' },
    { type: 'Total pay', value: '$160.00', description: 'Total pay was $160.00' },
    { type: 'Overtime', value: '--', description: 'Overtime was --' },
    { type: 'Sick', value: '--', description: 'Sick leave time was --' },
    { type: 'Holiday', value: '--', description: 'Holiday time was --' },
    { type: 'Vacation', value: '--', description: 'Vacation time was --' },
    { type: 'Unpaid', value: '--', description: 'Unpaid time was --' },
    { type: 'Other', value: '--', description: 'Other paid time was --' },
];

export const timesheetDataReview = [
    { type: 'Total hours', value: '40h 0m', description: 'Total hours worked was 40h 0m' },
    { type: 'Pay rate', value: '$20.00', description: 'Current rate is $20.00 per hour' },
    { type: 'Total pay', value: '$800.00', description: 'Total pay was $800.00' },
    // { type: 'Overtime', value: '--', description: 'Overtime was --' },
    // { type: 'Sick', value: '--', description: 'Sick leave time was --' },
    // { type: 'Holiday', value: '--', description: 'Holiday time was --' },
    // { type: 'Vacation', value: '--', description: 'Vacation time was --' },
    // { type: 'Unpaid', value: '--', description: 'Unpaid time was --' },
    // { type: 'Other', value: '--', description: 'Other paid time was --' },
];

export default function ViewTimesheet() {
    const { user, business, session } = useAuth();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobile = useMediaQuery('(max-width: 25em)');
    const [selectedDay, setSelectedDay] = useState(0); // 0 (Monday) - 6 (Sunday)
    const [timesheetChanges, setTimesheetChanges] = useState(true);
    const [changeReasonModalOpened, { open: openChangeReasonModal, close: closeChangeReasonModal }] = useDisclosure(false);
    const [profileModalOpened, { open: openProfileModal, close: closeProfileModal }] = useDisclosure(false);
    const [submitTimesheetModalOpened, { open: openSubmitTimesheetModal, close: closeSubmitTimesheetModal }] = useDisclosure(false);
    const [submitButtonClicked, setSubmitButtonClicked] = useState(true);
    const { timesheetsPanelActive, timesheetListPanelActive, setTimesheetsPanelActive, setTimesheetListPanelActive } = useNavigationContext();
    const [changeReason, setChangeReason] = useState('');
    const navigate = useNavigate();
    const [datePickerWidth, setDatePickerWidth] = useState('');
    const [monthValue, setMonthValue] = useState<Date | null>(null);
    const [archivedTimesheetData, setArchivedTimesheetData] = useState<ArchivedStaffTimesheetData[]>([]);

    // get window size on component load
    useEffect(() => {
        // Update windowWidth when the window is resized
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // fetch data on component load
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        console.log("Timesheet data:")
        console.log(archivedTimesheetData);
    }, [archivedTimesheetData]);

    function handleChanges() {
        setTimesheetChanges(true);
    }

    function handleOpenModal() {
        openChangeReasonModal();
    }

    function handleOpenSubmitModal() {
        openSubmitTimesheetModal();
    }

    function handleReasonChanges(changeReason: string) {
        if (changeReason != '') {
            console.log(changeReason);
            setChangeReason(changeReason);
        }
    }

    function handleSubmit(submitFlag: boolean) {
        if (submitFlag) {
            // send POST to create new request to edit timesheet
            console.log("yippee");
        }
    }

    function handleSubmitTimesheet() {
        // send POST to create new timesheet submission
        console.log("yippee submit timesheet if all good");
        closeSubmitTimesheetModal();
    }

    async function fetchData() {
        if (user && business) {
            // get archived timesheet data
            var archivedTimesheetData = await GetArchivedStaffTimesheetData(business?.id, session?.access_token, user?.uid);
            setArchivedTimesheetData(archivedTimesheetData.archived_staff_list);
        }
    }

    const timesheetDataItem = timesheetData.map((item) => (
        <Paper shadow="md" p="lg" pr="xl" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="lg">
            <Grid align="center">
                <Grid.Col span={{ base: 6 }}>
                    <Stack gap="xs">
                        <Group>
                            <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{item.type}</Text>
                        </Group>
                        <Text c="#c1c0c0" size="lg" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>{item.description}</Text>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 6 }}>
                    {isMobile && (
                        <Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{item.value}</Text>
                        </Badge>
                    )}
                    {!isMobile && (
                        <Group justify="end">
                            < Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{item.value}</Text>
                            </Badge>
                        </Group>
                    )}

                </Grid.Col>
            </Grid>
        </Paper>
    ));

    const timesheetReviewItem = timesheetDataReview.map((item) => (
        <Paper shadow="md" p="lg" pr="xl" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="sm">
            <Grid align="center">
                <Grid.Col span={{ base: 7 }}>
                    <Stack gap="xs">
                        <Group>
                            <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{item.type}</Text>
                        </Group>
                        <Text c="#c1c0c0" size="lg" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>{item.description}</Text>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 5 }}>
                    {isMobile && (
                        <Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{item.value}</Text>
                        </Badge>
                    )}
                    {!isMobile && (
                        <Group justify="end">
                            < Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                <Text c="#dcdcdc" size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{item.value}</Text>
                            </Badge>
                        </Group>
                    )}

                </Grid.Col>
            </Grid>
        </Paper>
    ));

    // return mobile friendly layout
    if (windowWidth < 800) {
        return (
            <Box>
                {timesheetChanges && (
                    <ChangeReasonModal
                        modalOpened={changeReasonModalOpened}
                        isMobile={isMobile ? true : false}
                        closeModal={closeChangeReasonModal}
                        submitClicked={handleSubmit}
                        handleReasonChange={handleReasonChanges}
                    />
                )}
                {/* {submitTimesheetModalOpened && (
                    <SubmitTimesheetConfirmModal
                        modalOpened={submitTimesheetModalOpened}
                        isMobile={true}
                        timesheetReviewData={timesheetReviewItem}
                        closeModal={closeSubmitTimesheetModal}
                        submitClicked={handleSubmitTimesheet}
                    //handleReasonChange={handleReasonChanges}
                    />
                )} */}
                {/* <Paper shadow="md" p="sm" style={{ background: "#24352f", color: "white", borderRadius: "20px", boxShadow: "0px 5px 10px 10px rgba(0, 0, 0, 0.20)" }} className="sticky" >
                    <Group grow>
                        <Stack align="center" style={{ background: "rgba(24,28,38,0.3)", borderRadius: "10px", paddingTop: "20px", paddingBottom: "20px" }}>
                            <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Jan</Text>
                            <Text size="15px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>29-2</Text>
                        </Stack>
                        <Stack align="center">
                            <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Feb</Text>
                            <Text size="15px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>5-9</Text>
                        </Stack>
                        <Stack align="center">
                            <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Feb</Text>
                            <Text size="15px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>12-16</Text>
                        </Stack>
                        <Stack align="center">
                            <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Feb</Text>
                            <Text size="15px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>19-23</Text>
                        </Stack>
                        <Stack align="center">
                            <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Feb</Text>
                            <Text size="15px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>26-29</Text>
                        </Stack>
                    </Group>
                </Paper> */}
                <Stack>
                    <Grid align="flex-end" mb="20px">
                        <Grid.Col span={{ base: 12 }}>
                            <Group>
                                <Button
                                    type="submit"
                                    size="lg"
                                    radius="md"
                                    variant="subtle"
                                    fullWidth
                                    color="gray"
                                    onClick={() => {
                                        setTimesheetsPanelActive(true);
                                        setTimesheetListPanelActive(false);
                                    }}
                                >
                                    <IconChevronLeft /> Back
                                </Button>
                            </Group>
                        </Grid.Col>

                        {/* TODO: FINISH FILTERING */}
                        {/* previous week button */}
                        {/* <Grid.Col span={{ base: 2 }}>
                            <ActionIcon
                                size="xl"
                                style={{ marginBottom: "3px", width: "100%" }}
                                radius="md"
                                color="#324d3e"
                                onClick={() => {
                                    if (unsavedChanges) {
                                        setPrevWeekChange(true);
                                    }
                                    else {
                                        if (weekValue) {
                                            var tempValue = dayjs(getStartOfWeek(weekValue)).subtract(1, 'week').toDate();
                                            setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                                            handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                                        }
                                    }
                                }}
                            >
                                <IconChevronLeft />
                            </ActionIcon>
                        </Grid.Col> */}
                        {/* Week picker */}
                        {/* <Grid.Col span={{ base: 8 }}>
                            <MonthPickerInput
                                withCellSpacing={false}
                                maxDate={new Date()}
                                size="lg"
                                id="week-picker"
                                //label="Week of"
                                placeholder="Please select a month"
                                value={monthValue}
                                onChange={setMonthValue}
                                classNames={classes}
                                radius="md"
                                style={{ marginTop: "10px" }}
                                getDayProps={(date) => {
                                    const isHovered = isInWeekRange(date, hovered);
                                    const isSelected = isInWeekRange(date, monthValue);
                                    const isInRange = isHovered || isSelected;
                                    return {
                                        onMouseEnter: () => setHovered(date),
                                        onMouseLeave: () => setHovered(null),
                                        inRange: isInRange,
                                        firstInRange: isInRange && date.getDay() === 1,
                                        lastInRange: isInRange && date.getDay() === 0,
                                        selected: isSelected,
                                        onClick: () => {
                                            setMonthValue(getStartOfWeek(date));
                                            handleWeekChange(dayjs(getStartOfWeek(date)));
                                            if (unsavedChanges) {
                                                setWeekValueTemp(getStartOfWeek(date));
                                                setWeekChange(true);
                                            }
                                            else {
                                                setWeekValue(getStartOfWeek(date));
                                                handleWeekChange(dayjs(getStartOfWeek(date)));
                                            }
                                            console.log(formatDateWeek(date));
                                        },
                                    };
                                }}
                            />
                        </Grid.Col> */}
                        {/* next week button */}
                        {/* <Grid.Col span={{ base: 2 }}>
                            <ActionIcon
                                size="xl"
                                radius="md"
                                color="#324d3e"
                                style={{ marginBottom: "3px", width: "100%" }}
                                onClick={() => {
                                    if (unsavedChanges) {
                                        setNextWeekChange(true);
                                    }
                                    else {
                                        if (weekValue) {
                                            // Check if tempValue is not in the future
                                            var today = dayjs();
                                            var tempValue = dayjs(getStartOfWeek(weekValue)).add(1, 'week').toDate();
                                            if (dayjs(tempValue).isBefore(dayjs(today))) {
                                                setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                                                handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                                            }
                                        }
                                    }
                                }}
                            >
                                <IconChevronRight />
                            </ActionIcon>
                        </Grid.Col> */}
                    </Grid>
                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                        <Stack>
                            <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Archived timesheets</Text>
                            {/* <TimesheetTimeline /> */}
                            <ArchivedTimesheets archivedStaffTimesheetData={archivedTimesheetData} />
                        </Stack>
                    </Paper>
                </Stack>
                <Space h="lg" />
            </Box>
        );
    }
    else {
        // regular fullscreen table
        return (
            <Box>
                {timesheetChanges && (
                    <ChangeReasonModal
                        modalOpened={changeReasonModalOpened}
                        isMobile={isMobile ? true : false}
                        closeModal={closeChangeReasonModal}
                        submitClicked={handleSubmit}
                        handleReasonChange={handleReasonChanges}
                    />
                )}
                {/* {submitTimesheetModalOpened && (
                    <SubmitTimesheetConfirmModal
                        modalOpened={submitTimesheetModalOpened}
                        isMobile={isMobile ? true : false}
                        timesheetDataReview={timesheetReviewItem}
                        closeModal={closeSubmitTimesheetModal}
                        submitClicked={handleSubmitTimesheet}
                    //handleReasonChange={handleReasonChanges}
                    />
                )} */}

                <Group align="flex-end" ml="md" mb="lg">

                    <Button
                        type="submit"
                        size="lg"
                        radius="md"
                        variant="subtle"
                        color="gray"
                        mr="lg"
                        onClick={() => {
                            setTimesheetsPanelActive(true);
                            setTimesheetListPanelActive(false);
                        }}
                    >
                        <IconChevronLeft /> Back
                    </Button>

                    {/* TODO: FINISH FILTERING */}
                    {/* <Group align="flex-end">
                        <ActionIcon
                            size="xl"
                            style={{ marginBottom: "3px" }}
                            radius="md"
                            color="#324D3E"
                            onClick={() => {
                                if (unsavedChanges) {
                                    setPrevWeekChange(true);
                                }
                                else {
                                    if (weekValue) {
                                        var tempValue = dayjs(getStartOfWeek(weekValue)).subtract(1, 'week').toDate();
                                        setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                                        handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                                    }
                                }
                            }}
                        >
                            <IconChevronLeft />
                        </ActionIcon>
                        <MonthPickerInput
                            withCellSpacing={false}
                            maxDate={new Date()}
                            size="lg"
                            id="month-picker"
                            //label="Week of"
                            placeholder="Please select a month"
                            value={monthValue}
                            onChange={setMonthValue}
                            classNames={classes}
                            radius="md"
                            style={{ maxWidth: datePickerWidth, marginTop: "10px" }}
                            getDayProps={(date) => {
                                const isHovered = isInWeekRange(date, hovered);
                                const isSelected = isInWeekRange(date, weekValue);
                                const isInRange = isHovered || isSelected;
                                return {
                                    onMouseEnter: () => setHovered(date),
                                    onMouseLeave: () => setHovered(null),
                                    inRange: isInRange,
                                    firstInRange: isInRange && date.getDay() === 1,
                                    lastInRange: isInRange && date.getDay() === 0,
                                    selected: isSelected,
                                    onClick: () => {
                                        setWeekValue(getStartOfWeek(date));
                                        handleWeekChange(dayjs(getStartOfWeek(date)));
                                        // if (unsavedChanges) {
                                        //     setWeekValueTemp(getStartOfWeek(date));
                                        //     setWeekChange(true);
                                        // }
                                        // else {
                                        //     setWeekValue(getStartOfWeek(date));
                                        //     handleWeekChange(dayjs(getStartOfWeek(date)));
                                        // }
                                        //console.log(formatDateWeek(date));
                                    },
                                };
                            }}
                        />
                        <ActionIcon
                            size="xl"
                            radius="md"
                            style={{ marginBottom: "3px" }}
                            color="#324D3E"
                            onClick={() => {
                                if (unsavedChanges) {
                                    setNextWeekChange(true);
                                }
                                else {
                                    if (weekValue) {
                                        // Check if tempValue is not in the future
                                        var today = dayjs();
                                        var tempValue = dayjs(getStartOfWeek(weekValue)).add(1, 'week').toDate();
                                        if (dayjs(tempValue).isBefore(dayjs(today))) {
                                            setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                                            handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                                        }
                                    }
                                }
                            }}
                        >
                            <IconChevronRight />
                        </ActionIcon>
                    </Group> */}

                </Group>
                <ArchivedTimesheets archivedStaffTimesheetData={archivedTimesheetData} />
            </Box>
        );


    }

}