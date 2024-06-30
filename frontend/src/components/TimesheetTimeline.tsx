import { Timeline, Text, ThemeIcon, Paper, Title, Group, Badge, Stack, Grid, Space, Popover, Button, ActionIcon, rem, Menu, ScrollArea } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconBeach, IconCheck, IconClockPause, IconClockPlay, IconCalendarEvent, IconGitBranch, IconGitCommit, IconGitPullRequest, IconLogout, IconMessageDots, IconOutbound, IconPennant, IconPlaneArrival, IconPlaneDeparture, IconReportMedical, IconVideo, IconDoorExit, IconQuestionMark, IconArrowBarRight, IconArrowRight, IconArrowLeft, IconCoffee, IconClock, IconLocationCheck, IconMapPin, IconMapPinCheck, IconFlagFilled, IconEdit, IconSettings, IconDots, IconDotsVertical, IconMenu, IconArrowsLeftRight, IconTrash, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { GenerateUUID, TimeIndexDepth, TimeStatus, formatPopoverTime, formatTime, formatTimestamp12Hours, getActivityColor, getStatusDescriptionPersonal, getStatusName, getStatusNameLong, getTimelineColor, splitTime, splitTimeAmPm } from "../helpers/Helpers";
import { StaffAttendanceRecord } from "../pages/owner-dashboard/child/Attendance";
import classes from '../css/AttendanceTimePicker.module.scss';
import { SelectAsync } from "./TimeInputSelect";
import DeleteTimeConfirmModal from "./DeleteTimeConfirmModal";
import AddNewTimeModal from "./AddNewTimeModal";

interface ITimesheetTimeline {
    attendanceRecordData: StaffAttendanceRecord;
    handleAttendanceRecordChange: (updatedAttendanceRecord: StaffAttendanceRecord) => void;
    handleDelete: (statusType: number, timeIndex: number, attendanceRecord: StaffAttendanceRecord) => void;
}

//TODO: switch to data from database
export const activityData = [
    { activity: 'In', time: '7:00 AM', description: 'Clocked in at 7:00 AM at Krusty Krab.', time_ago: '10 hours ago' },
    { activity: 'Break', time: '8:30 AM', description: 'Went on break at 8:30 AM.', time_ago: '9 hours ago' },
    { activity: 'Out', time: '10:00 AM', description: 'Clocked out at 7:00 AM at Krusty Krab.', time_ago: '10 hours ago' },
    { activity: 'In', time: '11:30 AM', description: 'Clocked in at 11:30 AM at Krusty Krab.', time_ago: '10 hours ago' },
    { activity: 'Break', time: '12:00 PM', description: 'Went on break at 12:00 PM.', time_ago: '10 hours ago' },
    { activity: 'Out', time: '1:00 PM', description: 'Clocked out at 1:00 PM at Krusty Krab.', time_ago: '10 hours ago' },
    { activity: 'In', time: '2:00 PM', description: 'Clocked in at 2:00 PM at Krusty Krab.', time_ago: '10 hours ago' },
    { activity: 'Break', time: '3:30 PM', description: 'Went on break at 3:30 PM at Krusty Krab.', time_ago: '10 hours ago' },
    { activity: 'Out', time: '5:00 PM', description: 'Clocked out at 5:00 PM at Krusty Krab.', time_ago: '10 hours ago' },
    { activity: 'End', time: '5:00 PM', description: 'Ended shift at 5:00 PM at Krusty Krab.', time_ago: '10 hours ago' },
];

export default function TimesheetTimeline(props: ITimesheetTimeline) {
    const [checkIn2Visible, setCheckIn2Visible] = useState(true);
    const [checkOut2Visible, setCheckOut2Visible] = useState(true);
    const [checkIn3Visible, setCheckIn3Visible] = useState(true);
    const [checkOut3Visible, setCheckOut3Visible] = useState(true);
    const [breakVisible, setBreakVisible] = useState(true);
    const [break2Visible, setBreak2Visible] = useState(false);
    const [break3Visible, setBreak3Visible] = useState(false);
    const [overtimeVisible, setOvertimeVisible] = useState(false);
    const [sickVisible, setSickVisible] = useState(false);
    const [vacationVisible, setVacationVisible] = useState(false);
    const [holidayVisible, setHolidayVisible] = useState(false);
    const [unpaidVisible, setUnpaidVisible] = useState(false);
    const [otherVisible, setOtherVisible] = useState(false);
    const [gpsLocationModeVisible, setGpsLocationModeVisible] = useState(false);
    const isMobile = useMediaQuery('(max-width: 28em)');
    const [isHovered, setIsHovered] = useState(false);
    const [isHovered2, setIsHovered2] = useState(false);
    const [isHovered3, setIsHovered3] = useState(false);
    const [isHovered4, setIsHovered4] = useState(false);
    const [isHovered5, setIsHovered5] = useState(false);
    const [isHovered6, setIsHovered6] = useState(false);
    const [isHovered7, setIsHovered7] = useState(false);
    const [isHovered8, setIsHovered8] = useState(false);
    const [isHovered9, setIsHovered9] = useState(false);
    const [isHovered10, setIsHovered10] = useState(false);
    const [isHovered11, setIsHovered11] = useState(false);
    const [isHovered12, setIsHovered12] = useState(false);
    const [displayTimePicker, setDisplayTimePicker] = useState(true);
    const [popoverOpenD1In, setPopoverOpenD1In] = useState(false);
    const [popoverOpenD1Out, setPopoverOpenD1Out] = useState(false);
    const [popoverOpenD2In, setPopoverOpenD2In] = useState(false);
    const [popoverOpenD2Out, setPopoverOpenD2Out] = useState(false);
    const [popoverOpenD3In, setPopoverOpenD3In] = useState(false);
    const [popoverOpenD3Out, setPopoverOpenD3Out] = useState(false);
    const [addTimeModalOpened, { open: openAddTimeModal, close: closeAddTimeModal }] = useDisclosure(false);
    const [deleteTimeModalOpened, { open: openDeleteTimeModal, close: closeDeleteTimeModal }] = useDisclosure(false);
    const [selectedTimeType, setSelectedTimeType] = useState(0);
    const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
    const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState<StaffAttendanceRecord>();
    const [timeData, setTimeData] = useState<string | null>('');
    const [statusType, setStatusType] = useState(0);

    // props
    const attendanceRecordDataProp = props.attendanceRecordData;
    const handleAttendanceRecordChangeProp = props.handleAttendanceRecordChange;
    const handleDeleteProp = props.handleDelete;


    // handle the changes in the popover
    function handlePopoverChange(statusType: number, timeIndex: number, value: string) {
        var newTime = formatPopoverTime(value);
        console.log("New time= " + newTime);
        //handleTimeChanges(personId, date, timeIndex, timeType, undefined, newTime);

        // modify the proper attendance record
        var updatedAttendanceRecord = attendanceRecordDataProp;
        if (statusType == 2) {
            switch (timeIndex) {
                case 1:
                    updatedAttendanceRecord.check_in_time = newTime;
                    break;
                case 2:
                    updatedAttendanceRecord.check_in_time_2 = newTime;
                    break;
                case 3:
                    updatedAttendanceRecord.check_in_time_3 = newTime;
                    break;
            }
        }
        else if (statusType == 1) {
            switch (timeIndex) {
                case 1:
                    updatedAttendanceRecord.check_out_time = newTime;
                    break;
                case 2:
                    updatedAttendanceRecord.check_out_time_2 = newTime;
                    break;
                case 3:
                    updatedAttendanceRecord.check_out_time_3 = newTime;
                    break;
            }
        }
        handleAttendanceRecordChangeProp(updatedAttendanceRecord);
        //return newTime;
    }

    // handle the visibility of the popover 
    function handlePopoverOpen(opened: boolean, timeType: number, timeIndex: number) {
        if (timeType === 2) {
            switch (timeIndex) {
                case 1:
                    setPopoverOpenD1In(opened);
                    break;
                case 2:
                    setPopoverOpenD2In(opened);
                    break;
                case 3:
                    setPopoverOpenD3In(opened);
                    break;
            }
        }
        else if (timeType === 1) {
            switch (timeIndex) {
                case 1:
                    setPopoverOpenD1Out(opened);
                    break;
                case 2:
                    setPopoverOpenD2Out(opened);
                    break;
                case 3:
                    setPopoverOpenD3Out(opened);
                    break;
            }
        }
    }

    const handleMouseEnter = (depth: number) => {
        // Set a timeout to delay calling setIsHovered3(true) by 500 milliseconds (adjust as needed)
        setTimeout(() => {
            switch (depth) {
                case 1:
                    setIsHovered(true);
                    return;
                case 2:
                    setIsHovered2(true);
                    return;
                case 3:
                    setIsHovered3(true);
                    return;
                case 4:
                    setIsHovered4(true);
                    return;
                case 5:
                    setIsHovered5(true);
                    return;
                case 6:
                    setIsHovered6(true);
                    return;
                case 7:
                    setIsHovered7(true);
                    return;
                case 8:
                    setIsHovered8(true);
                    return;
                case 9:
                    setIsHovered9(true);
                    return;
                case 10:
                    setIsHovered10(true);
                    return;
                case 11:
                    setIsHovered11(true);
                    return;
                case 12:
                    setIsHovered12(true);
                    return;
                default:
                    return;
            }
        }, 100);
    };

    const handleMouseLeave = (depth: number) => {
        // Set a timeout to delay calling setIsHovered3(false) by 500 milliseconds (adjust as needed)
        setTimeout(() => {
            switch (depth) {
                case 1:
                    setIsHovered(false);
                    return;
                case 2:
                    setIsHovered2(false);
                    return;
                case 3:
                    setIsHovered3(false);
                    return;
                case 4:
                    setIsHovered4(false);
                    return;
                case 5:
                    setIsHovered5(false);
                    return;
                case 6:
                    setIsHovered6(false);
                    return;
                case 7:
                    setIsHovered7(false);
                    return;
                case 8:
                    setIsHovered8(false);
                    return;
                case 9:
                    setIsHovered9(false);
                    return;
                case 10:
                    setIsHovered10(false);
                    return;
                case 11:
                    setIsHovered11(false);
                    return;
                case 12:
                    setIsHovered12(false);
                    return;
                default:
                    return;
            }
        }, 100);
    };

    function handlePopoverChanges() {
        console.log("Popover changed");
    }

    // open delete modal when button is clicked
    function handleDeleteTimeClick() {
        openDeleteTimeModal();
    }

    // handle actual delete of attendance record time
    function handleDeleteAttendanceRecordTime(timeType: number, timeIndex: number, attendanceRecord: StaffAttendanceRecord) {
        handleDeleteProp(timeType, timeIndex, attendanceRecord);
    }

    function handleEditTime() {
        switch (selectedTimeType) {
            case 1:
                // check out
                switch (selectedTimeIndex) {
                    case 1:
                        setTimeData(attendanceRecordDataProp?.check_out_time);
                        break;
                    case 2: setTimeData(attendanceRecordDataProp?.check_out_time_2);
                        break;
                    case 3: setTimeData(attendanceRecordDataProp?.check_out_time_3);
                        break;
                }
                setStatusType(1);
                break;
            case 2:
                // check in
                switch (selectedTimeIndex) {
                    case 1:
                        setTimeData(attendanceRecordDataProp?.check_in_time);
                        break;
                    case 2: setTimeData(attendanceRecordDataProp?.check_in_time_2);
                        break;
                    case 3: setTimeData(attendanceRecordDataProp?.check_in_time_3);
                        break;
                }
                setStatusType(2);
                break;
            case 3:
                // break start
                break;
            case 4:
                // break end
                break;
        }
        //openAddTimeModal();
    }

    // TODO: FINISH ADD TIME
    function handleAddTimeClick() {
        // find the actual field we want to update from timeType and timeIndex
        if (selectedTimeType == 0) {
            // check in
            switch (selectedTimeIndex) {
                case 1:
                    setTimeData(attendanceRecordDataProp?.check_in_time);
                    break;
                case 2: setTimeData(attendanceRecordDataProp?.check_in_time_2);
                    break;
                case 3: setTimeData(attendanceRecordDataProp?.check_in_time_3);
                    break;
            }
        }
        else {
            // check out
            switch (selectedTimeIndex) {
                case 1:
                    setTimeData(attendanceRecordDataProp?.check_out_time);
                    break;
                case 2: setTimeData(attendanceRecordDataProp?.check_out_time_2);
                    break;
                case 3: setTimeData(attendanceRecordDataProp?.check_out_time_3);
                    break;
            }
        }
        openAddTimeModal();
    }

    useEffect(() => {
        if (attendanceRecordDataProp) {
            console.log(attendanceRecordDataProp);
        }
    }, [attendanceRecordDataProp]);

    useEffect(() => {
        if (timeData) {
            console.log(timeData);
        }
    }, [timeData]);

    return (
        <>
            {addTimeModalOpened && timeData && attendanceRecordDataProp && (
                <AddNewTimeModal
                    modalOpened={addTimeModalOpened}
                    isMobile={isMobile != undefined ? isMobile : false}
                    timeData={timeData}
                    statusType={statusType}
                    timeIndex={selectedTimeIndex}
                    attendanceRecord={attendanceRecordDataProp}
                    addOrEdit="edit"
                    closeModal={closeAddTimeModal}
                    submitClicked={handleAddTimeClick}
                    handleAttendanceRecordChange={handleAttendanceRecordChangeProp}
                //handleReasonChange={handleReasonChanges}
                />
            )}
            {deleteTimeModalOpened && selectedAttendanceRecord && (
                <DeleteTimeConfirmModal
                    modalOpened={deleteTimeModalOpened}
                    isMobile={isMobile != undefined ? isMobile : false}
                    //businessId={businessData?.id != undefined ? businessData?.id : ""}
                    closeModal={closeDeleteTimeModal}
                    handleDeleteClick={() => handleDeleteAttendanceRecordTime(statusType, selectedTimeIndex, selectedAttendanceRecord)}
                />
            )}
            <Timeline active={25} bulletSize={42} lineWidth={14} mt="lg">

                {/* check_in_time */}
                {attendanceRecordDataProp?.check_in_time && (
                    <Timeline.Item
                        key={GenerateUUID()}
                        color={getActivityColor(TimeStatus.CLOCKED_IN)[0]}
                        bullet={
                            <ThemeIcon
                                size={42}
                                //variant="gradient"
                                color={getActivityColor(TimeStatus.CLOCKED_IN)[1]}
                                //gradient={{ from: 'lime', to: 'cyan' }}
                                radius="xl"
                            >
                            </ThemeIcon>
                        }
                    >

                        <Paper
                            shadow="md"
                            p="md"
                            radius="lg"
                            style={{ background: "#324d3e", color: "#dcdcdc", border: isHovered ? '6px solid #639383' : "" }}
                            onMouseEnter={() => handleMouseEnter(1)}
                            onMouseLeave={() => handleMouseLeave(1)}
                        >

                            {/* MOBILE */}
                            {isMobile && (
                                <Grid align="start">

                                    {/* time status name */}
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.CLOCKED_IN)}</Text>
                                    </Grid.Col>

                                    {/* time */}
                                    <Grid.Col span={{ base: 7 }}>
                                        <Group justify="end">
                                            <Badge
                                                size="lg"
                                                mb="md"
                                                radius="lg"
                                                color={getTimelineColor(TimeStatus.CLOCKED_IN)}
                                                p="md"
                                                style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                            >
                                                <Text
                                                    size="sm"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.check_in_time)}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>

                                    {/* time status description */}
                                    <Grid.Col span={{ base: 12 }}>
                                        <Text
                                            c="#c1c0c0"
                                            size="lg"
                                            fw={600}
                                        >
                                            {getStatusDescriptionPersonal(TimeStatus.CLOCKED_IN)} {formatTime(attendanceRecordDataProp.check_in_time)}. {/* [TIMESTATUS] AT [TIME] */}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Group justify="space-between">

                                        {/* status name */}
                                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.CLOCKED_IN)}</Text>

                                        {/* time badge */}
                                        <Badge
                                            size="lg"
                                            mb="md"
                                            radius="lg"
                                            color={getActivityColor(TimeStatus.CLOCKED_IN)[0]}
                                            p="md"
                                            style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {/* time */}
                                            {/* {!isHovered && ( */}
                                                <Text
                                                    size="lg"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.check_in_time)}
                                                </Text>
                                            {/* )} */}

                                            {/* time w/ menu */}
                                            {false && (
                                                <>
                                                    <Group justify="end">
                                                        {/* time */}
                                                        <Text
                                                            size="lg"
                                                            c="#dcdcdc"
                                                            fw={600}
                                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                        >
                                                            {formatTime(attendanceRecordDataProp?.check_in_time)}
                                                        </Text>

                                                        {/* menu with option to edit/delete */}
                                                        <Menu shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    size="lg"
                                                                    variant="transparent"
                                                                    radius="sm"
                                                                    color="#dcdcdc"
                                                                >
                                                                    <IconDots style={{ width: rem(18) }} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {/* edit */}
                                                                <Menu.Item
                                                                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled
                                                                // TODO FINISH/FIX EDITING TIMESHEET FEATURE
                                                                // MODAL CHANGES REFLECT ON PARENT WHEN THEY SHOULDNT 
                                                                //onClick={() => setPopoverOpenD1In(true)}
                                                                // onClick={() => {
                                                                //     setStatusType(2);
                                                                //     setSelectedTimeIndex(1);
                                                                //     setTimeData(attendanceRecordDataProp?.check_in_time);
                                                                //     setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                //     console.log("attendance record before modal:");
                                                                //     console.log(attendanceRecordDataProp);
                                                                //     openAddTimeModal();
                                                                // }}
                                                                >
                                                                    Edit
                                                                </Menu.Item>

                                                                {/* delete */}
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled // temp
                                                                    onClick={() => {
                                                                        setStatusType(TimeStatus.CLOCKED_IN);
                                                                        setSelectedTimeIndex(TimeIndexDepth.Depth_1);
                                                                        setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                        //openDeleteTimeModal();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </>
                                            )}
                                        </Badge>
                                    </Group>

                                    {/* time status description */}
                                    <Text
                                        c="#c1c0c0"
                                        size="lg"
                                        fw={600}
                                    >
                                        {getStatusDescriptionPersonal(TimeStatus.CLOCKED_IN)} {formatTime(attendanceRecordDataProp?.check_in_time)}. {/* [TIMESTATUS] AT [TIME] */}
                                    </Text>
                                </>
                            )}
                        </Paper>
                    </Timeline.Item>
                )}

                {/* break_in_time */}
                {attendanceRecordDataProp?.break_in_time && (
                    <Timeline.Item
                        key={GenerateUUID()}
                        color={getActivityColor(TimeStatus.BREAK_START)[0]}
                        bullet={
                            <ThemeIcon
                                size={42}
                                //variant="gradient"
                                color={getActivityColor(TimeStatus.BREAK_START)[1]}
                                //gradient={{ from: 'lime', to: 'cyan' }}
                                radius="xl"
                            >
                            </ThemeIcon>
                        }
                    >

                        <Paper
                            shadow="md"
                            p="md"
                            radius="lg"
                            style={{ background: "#324d3e", color: "#dcdcdc", border: isHovered2 ? '6px solid #639383' : "" }}
                            onMouseEnter={() => handleMouseEnter(2)}
                            onMouseLeave={() => handleMouseLeave(2)}
                        >

                            {/* MOBILE */}
                            {isMobile && (
                                <Grid align="start">

                                    {/* time status name */}
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.BREAK_START)}</Text>
                                    </Grid.Col>

                                    {/* time */}
                                    <Grid.Col span={{ base: 7 }}>
                                        <Group justify="end">
                                            <Badge
                                                size="lg"
                                                mb="md"
                                                radius="lg"
                                                color={getTimelineColor(TimeStatus.BREAK_START)}
                                                p="md"
                                                style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                            >
                                                <Text
                                                    size="sm"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.break_in_time)}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>

                                    {/* time status description */}
                                    <Grid.Col span={{ base: 12 }}>
                                        <Text
                                            c="#c1c0c0"
                                            size="lg"
                                            fw={600}
                                        >
                                            {getStatusDescriptionPersonal(TimeStatus.BREAK_START)} {formatTime(attendanceRecordDataProp.break_in_time)}. {/* [TIMESTATUS] AT [TIME] */}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Group justify="space-between">

                                        {/* status name */}
                                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.BREAK_START)}</Text>

                                        {/* time badge */}
                                        <Badge
                                            size="lg"
                                            mb="md"
                                            radius="lg"
                                            color={getActivityColor(TimeStatus.BREAK_START)[0]}
                                            p="md"
                                            style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {/* time */}
                                            {/* {!isHovered2 && ( */}
                                                <Text
                                                    size="md"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.break_in_time)}
                                                </Text>
                                            {/* )} */}

                                            {/* time w/ menu */}
                                            {false && (
                                                <>
                                                    <Group justify="end">
                                                        {/* time */}
                                                        <Text
                                                            size="md"
                                                            c="#dcdcdc"
                                                            fw={600}
                                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                        >
                                                            {formatTime(attendanceRecordDataProp?.break_in_time)}
                                                        </Text>

                                                        {/* menu with option to edit/delete */}
                                                        <Menu shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    size="lg"
                                                                    variant="transparent"
                                                                    radius="sm"
                                                                    color="#dcdcdc"
                                                                >
                                                                    <IconDots style={{ width: rem(18) }} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {/* edit */}
                                                                <Menu.Item
                                                                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled
                                                                >
                                                                    Edit
                                                                </Menu.Item>

                                                                {/* delete */}
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled // temp
                                                                    onClick={() => {
                                                                        setStatusType(TimeStatus.BREAK_START);
                                                                        setSelectedTimeIndex(TimeIndexDepth.Depth_1);
                                                                        setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                        //openDeleteTimeModal();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </>
                                            )}
                                        </Badge>
                                    </Group>

                                    {/* time status description */}
                                    <Text
                                        c="#c1c0c0"
                                        size="lg"
                                        fw={600}
                                    >
                                        {getStatusDescriptionPersonal(TimeStatus.BREAK_START)} {formatTime(attendanceRecordDataProp?.break_in_time)}. {/* [TIMESTATUS] AT [TIME] */}
                                    </Text>
                                </>
                            )}
                        </Paper>
                    </Timeline.Item>
                )}


                {/* break_out_time */}
                {attendanceRecordDataProp?.break_out_time && (
                    <Timeline.Item
                        key={GenerateUUID()}
                        color={getActivityColor(TimeStatus.CLOCKED_IN)[0]}
                        bullet={
                            <ThemeIcon
                                size={42}
                                //variant="gradient"
                                color={getActivityColor(TimeStatus.CLOCKED_IN)[1]}
                                //gradient={{ from: 'lime', to: 'cyan' }}
                                radius="xl"
                            >
                            </ThemeIcon>
                        }
                    >

                        <Paper
                            shadow="md"
                            p="md"
                            radius="lg"
                            style={{ background: "#324d3e", color: "#dcdcdc", border: isHovered3 ? '6px solid #639383' : "" }}
                            onMouseEnter={() => handleMouseEnter(3)}
                            onMouseLeave={() => handleMouseLeave(3)}
                        >

                            {/* MOBILE */}
                            {isMobile && (
                                <Grid align="start">

                                    {/* time status name */}
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.BREAK_END)}</Text>
                                    </Grid.Col>

                                    {/* time */}
                                    <Grid.Col span={{ base: 7 }}>
                                        <Group justify="end">
                                            <Badge
                                                size="lg"
                                                mb="md"
                                                radius="lg"
                                                color={getTimelineColor(TimeStatus.BREAK_END)}
                                                p="md"
                                                style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                            >
                                                <Text
                                                    size="sm"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.break_out_time)}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>

                                    {/* time status description */}
                                    <Grid.Col span={{ base: 12 }}>
                                        <Text
                                            c="#c1c0c0"
                                            size="lg"
                                            fw={600}
                                        >
                                            {getStatusDescriptionPersonal(TimeStatus.BREAK_END)} {formatTime(attendanceRecordDataProp.break_out_time)}. {/* [TIMESTATUS] AT [TIME] */}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Group justify="space-between">

                                        {/* status name */}
                                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.BREAK_END)}</Text>

                                        {/* time badge */}
                                        <Badge
                                            size="lg"
                                            mb="md"
                                            radius="lg"
                                            color={getActivityColor(TimeStatus.CLOCKED_IN)[0]}
                                            p="md"
                                            style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {/* time */}
                                            {/* {!isHovered3 && ( */}
                                                <Text
                                                    size="md"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.break_out_time)}
                                                </Text>
                                            {/* )} */}

                                            {/* time w/ menu */}
                                            {false && (
                                                <>
                                                    <Group justify="end">
                                                        {/* time */}
                                                        <Text
                                                            size="md"
                                                            c="#dcdcdc"
                                                            fw={600}
                                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                        >
                                                            {formatTime(attendanceRecordDataProp?.break_out_time)}
                                                        </Text>

                                                        {/* menu with option to edit/delete */}
                                                        <Menu shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    size="lg"
                                                                    variant="transparent"
                                                                    radius="sm"
                                                                    color="#dcdcdc"
                                                                >
                                                                    <IconDots style={{ width: rem(18) }} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {/* edit */}
                                                                <Menu.Item
                                                                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled
                                                                >
                                                                    Edit
                                                                </Menu.Item>

                                                                {/* delete */}
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled // temp
                                                                    onClick={() => {
                                                                        setStatusType(TimeStatus.BREAK_END);
                                                                        setSelectedTimeIndex(TimeIndexDepth.Depth_1);
                                                                        setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                        //openDeleteTimeModal();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </>
                                            )}
                                        </Badge>
                                    </Group>

                                    {/* time status description */}
                                    <Text
                                        c="#c1c0c0"
                                        size="lg"
                                        fw={600}
                                    >
                                        {getStatusDescriptionPersonal(TimeStatus.BREAK_END)} {formatTime(attendanceRecordDataProp?.break_out_time)}. {/* [TIMESTATUS] AT [TIME] */}
                                    </Text>
                                </>
                            )}
                        </Paper>
                    </Timeline.Item>
                )}

                {/* check_out_time */}
                {attendanceRecordDataProp?.check_out_time && (
                    <Timeline.Item
                        key={GenerateUUID()}
                        color={getActivityColor(TimeStatus.CLOCKED_OUT)[0]}
                        bullet={
                            <ThemeIcon
                                size={42}
                                //variant="gradient"
                                color={getActivityColor(TimeStatus.CLOCKED_OUT)[1]}
                                //gradient={{ from: 'lime', to: 'cyan' }}
                                radius="xl"
                            >
                            </ThemeIcon>
                        }
                    >

                        <Paper
                            shadow="md"
                            p="md"
                            radius="lg"
                            style={{ background: "#324d3e", color: "#dcdcdc", border: isHovered4 ? '6px solid #639383' : "" }}
                            onMouseEnter={() => handleMouseEnter(4)}
                            onMouseLeave={() => handleMouseLeave(4)}
                        >

                            {/* MOBILE */}
                            {isMobile && (
                                <Grid align="start">

                                    {/* time status name */}
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.CLOCKED_OUT)}</Text>
                                    </Grid.Col>

                                    {/* time */}
                                    <Grid.Col span={{ base: 7 }}>
                                        <Group justify="end">
                                            <Badge
                                                size="lg"
                                                mb="md"
                                                radius="lg"
                                                color={getTimelineColor(TimeStatus.CLOCKED_OUT)}
                                                p="md"
                                                style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                            >
                                                <Text
                                                    size="sm"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.check_out_time)}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>

                                    {/* time status description */}
                                    <Grid.Col span={{ base: 12 }}>
                                        <Text
                                            c="#c1c0c0"
                                            size="lg"
                                            fw={600}
                                        >
                                            {getStatusDescriptionPersonal(TimeStatus.CLOCKED_OUT)} {formatTime(attendanceRecordDataProp.check_out_time)}. {/* [TIMESTATUS] AT [TIME] */}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Group justify="space-between">

                                        {/* status name */}
                                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.CLOCKED_OUT)}</Text>

                                        {/* time badge */}
                                        <Badge
                                            size="lg"
                                            mb="md"
                                            radius="lg"
                                            color={getActivityColor(TimeStatus.CLOCKED_OUT)[0]}
                                            p="md"
                                            style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {/* time */}
                                            {/* {!isHovered4 && ( */}
                                                <Text
                                                    size="md"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.check_out_time)}
                                                </Text>
                                            {/* )} */}

                                            {/* time w/ menu */}
                                            {false && (
                                                <>
                                                    <Group justify="end">
                                                        {/* time */}
                                                        <Text
                                                            size="md"
                                                            c="#dcdcdc"
                                                            fw={600}
                                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                        >
                                                            {formatTime(attendanceRecordDataProp?.check_out_time)}
                                                        </Text>

                                                        {/* menu with option to edit/delete */}
                                                        <Menu shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    size="lg"
                                                                    variant="transparent"
                                                                    radius="sm"
                                                                    color="#dcdcdc"
                                                                >
                                                                    <IconDots style={{ width: rem(18) }} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {/* edit */}
                                                                <Menu.Item
                                                                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled
                                                                >
                                                                    Edit
                                                                </Menu.Item>

                                                                {/* delete */}
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled // temp
                                                                    onClick={() => {
                                                                        setStatusType(TimeStatus.CLOCKED_OUT);
                                                                        setSelectedTimeIndex(TimeIndexDepth.Depth_1);
                                                                        setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                        //openDeleteTimeModal();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </>
                                            )}
                                        </Badge>
                                    </Group>

                                    {/* time status description */}
                                    <Text
                                        c="#c1c0c0"
                                        size="lg"
                                        fw={600}
                                    >
                                        {getStatusDescriptionPersonal(TimeStatus.CLOCKED_OUT)} {formatTime(attendanceRecordDataProp?.check_out_time)}. {/* [TIMESTATUS] AT [TIME] */}
                                    </Text>
                                </>
                            )}
                        </Paper>
                    </Timeline.Item>
                )}


                {/* check_in_time_2 */}
                {attendanceRecordDataProp?.check_in_time_2 && (
                    <Timeline.Item
                        key={GenerateUUID()}
                        color={getActivityColor(TimeStatus.CLOCKED_IN)[0]}
                        bullet={
                            <ThemeIcon
                                size={42}
                                //variant="gradient"
                                color={getActivityColor(TimeStatus.CLOCKED_IN)[1]}
                                //gradient={{ from: 'lime', to: 'cyan' }}
                                radius="xl"
                            >
                            </ThemeIcon>
                        }
                    >

                        <Paper
                            shadow="md"
                            p="md"
                            radius="lg"
                            style={{ background: "#324d3e", color: "#dcdcdc", border: isHovered5 ? '6px solid #639383' : "" }}
                            onMouseEnter={() => handleMouseEnter(5)}
                            onMouseLeave={() => handleMouseLeave(5)}
                        >

                            {/* MOBILE */}
                            {isMobile && (
                                <Grid align="start">

                                    {/* time status name */}
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.CLOCKED_IN)}</Text>
                                    </Grid.Col>

                                    {/* time */}
                                    <Grid.Col span={{ base: 7 }}>
                                        <Group justify="end">
                                            <Badge
                                                size="lg"
                                                mb="md"
                                                radius="lg"
                                                color={getTimelineColor(TimeStatus.CLOCKED_IN)}
                                                p="md"
                                                style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                            >
                                                <Text
                                                    size="sm"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.check_in_time_2)}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>

                                    {/* time status description */}
                                    <Grid.Col span={{ base: 12 }}>
                                        <Text
                                            c="#c1c0c0"
                                            size="lg"
                                            fw={600}
                                        >
                                            {getStatusDescriptionPersonal(TimeStatus.CLOCKED_IN)} {formatTime(attendanceRecordDataProp.check_in_time_2)}. {/* [TIMESTATUS] AT [TIME] */}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Group justify="space-between">

                                        {/* status name */}
                                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.CLOCKED_IN)}</Text>

                                        {/* time badge */}
                                        <Badge
                                            size="lg"
                                            mb="md"
                                            radius="lg"
                                            color={getActivityColor(TimeStatus.CLOCKED_IN)[0]}
                                            p="md"
                                            style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {/* time */}
                                            {/* {!isHovered5 && ( */}
                                                <Text
                                                    size="md"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    • {formatTime(attendanceRecordDataProp?.check_in_time_2)}
                                                </Text>
                                            {/* )} */}

                                            {/* time w/ menu */}
                                            {false && (
                                                <>
                                                    <Group justify="end">
                                                        {/* time */}
                                                        <Text
                                                            size="md"
                                                            c="#dcdcdc"
                                                            fw={600}
                                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                        >
                                                            • {formatTime(attendanceRecordDataProp?.check_in_time_2)}
                                                        </Text>

                                                        {/* menu with option to edit/delete */}
                                                        <Menu shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    size="lg"
                                                                    variant="transparent"
                                                                    radius="sm"
                                                                    color="#dcdcdc"
                                                                >
                                                                    <IconDots style={{ width: rem(18) }} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {/* edit */}
                                                                <Menu.Item
                                                                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled
                                                                >
                                                                    Edit
                                                                </Menu.Item>

                                                                {/* delete */}
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled // temp
                                                                    onClick={() => {
                                                                        setStatusType(TimeStatus.CLOCKED_IN);
                                                                        setSelectedTimeIndex(TimeIndexDepth.Depth_2);
                                                                        setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                        //openDeleteTimeModal();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </>
                                            )}
                                        </Badge>
                                    </Group>

                                    {/* time status description */}
                                    <Text
                                        c="#c1c0c0"
                                        size="lg"
                                        fw={600}
                                    >
                                        {getStatusDescriptionPersonal(TimeStatus.CLOCKED_IN)} {formatTime(attendanceRecordDataProp?.check_in_time_2)}. {/* [TIMESTATUS] AT [TIME] */}
                                    </Text>
                                </>
                            )}
                        </Paper>
                    </Timeline.Item>
                )}

                {/* break_in_time_2 */}
                {attendanceRecordDataProp?.break_in_time_2 && (
                    <Timeline.Item
                        key={GenerateUUID()}
                        color={getActivityColor(TimeStatus.BREAK_START)[0]}
                        bullet={
                            <ThemeIcon
                                size={42}
                                //variant="gradient"
                                color={getActivityColor(TimeStatus.BREAK_START)[1]}
                                //gradient={{ from: 'lime', to: 'cyan' }}
                                radius="xl"
                            >
                            </ThemeIcon>
                        }
                    >

                        <Paper
                            shadow="md"
                            p="md"
                            radius="lg"
                            style={{ background: "#324d3e", color: "#dcdcdc", border: isHovered6 ? '6px solid #639383' : "" }}
                            onMouseEnter={() => handleMouseEnter(6)}
                            onMouseLeave={() => handleMouseLeave(6)}
                        >

                            {/* MOBILE */}
                            {isMobile && (
                                <Grid align="start">

                                    {/* time status name */}
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.BREAK_START)}</Text>
                                    </Grid.Col>

                                    {/* time */}
                                    <Grid.Col span={{ base: 7 }}>
                                        <Group justify="end">
                                            <Badge
                                                size="lg"
                                                mb="md"
                                                radius="lg"
                                                color={getTimelineColor(TimeStatus.BREAK_START)}
                                                p="md"
                                                style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                            >
                                                <Text
                                                    size="sm"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.break_in_time_2)}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>

                                    {/* time status description */}
                                    <Grid.Col span={{ base: 12 }}>
                                        <Text
                                            c="#c1c0c0"
                                            size="lg"
                                            fw={600}
                                        >
                                            {getStatusDescriptionPersonal(TimeStatus.BREAK_START)} {formatTime(attendanceRecordDataProp.break_in_time_2)}. {/* [TIMESTATUS] AT [TIME] */}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Group justify="space-between">

                                        {/* status name */}
                                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.BREAK_START)}</Text>

                                        {/* time badge */}
                                        <Badge
                                            size="lg"
                                            mb="md"
                                            radius="lg"
                                            color={getActivityColor(TimeStatus.BREAK_START)[0]}
                                            p="md"
                                            style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {/* time */}
                                            {/* {!isHovered6 && ( */}
                                                <Text
                                                    size="md"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.break_in_time_2)}
                                                </Text>
                                            {/* )} */}

                                            {/* time w/ menu */}
                                            {false && (
                                                <>
                                                    <Group justify="end">
                                                        {/* time */}
                                                        <Text
                                                            size="md"
                                                            c="#dcdcdc"
                                                            fw={600}
                                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                        >
                                                            {formatTime(attendanceRecordDataProp?.break_in_time_2)}
                                                        </Text>

                                                        {/* menu with option to edit/delete */}
                                                        <Menu shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    size="lg"
                                                                    variant="transparent"
                                                                    radius="sm"
                                                                    color="#dcdcdc"
                                                                >
                                                                    <IconDots style={{ width: rem(18) }} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {/* edit */}
                                                                <Menu.Item
                                                                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled
                                                                >
                                                                    Edit
                                                                </Menu.Item>

                                                                {/* delete */}
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled // temp
                                                                    onClick={() => {
                                                                        setStatusType(TimeStatus.BREAK_START);
                                                                        setSelectedTimeIndex(TimeIndexDepth.Depth_2);
                                                                        setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                        //openDeleteTimeModal();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </>
                                            )}
                                        </Badge>
                                    </Group>

                                    {/* time status description */}
                                    <Text
                                        c="#c1c0c0"
                                        size="lg"
                                        fw={600}
                                    >
                                        {getStatusDescriptionPersonal(TimeStatus.BREAK_START)} {formatTime(attendanceRecordDataProp?.break_in_time_2)}. {/* [TIMESTATUS] AT [TIME] */}
                                    </Text>
                                </>
                            )}
                        </Paper>
                    </Timeline.Item>
                )}


                {/* break_out_time_2 */}
                {attendanceRecordDataProp?.break_out_time_2 && (
                    <Timeline.Item
                        key={GenerateUUID()}
                        color={getActivityColor(TimeStatus.CLOCKED_IN)[0]}
                        bullet={
                            <ThemeIcon
                                size={42}
                                //variant="gradient"
                                color={getActivityColor(TimeStatus.CLOCKED_IN)[1]}
                                //gradient={{ from: 'lime', to: 'cyan' }}
                                radius="xl"
                            >
                            </ThemeIcon>
                        }
                    >

                        <Paper
                            shadow="md"
                            p="md"
                            radius="lg"
                            style={{ background: "#324d3e", color: "#dcdcdc", border: isHovered7 ? '6px solid #639383' : "" }}
                            onMouseEnter={() => handleMouseEnter(7)}
                            onMouseLeave={() => handleMouseLeave(7)}
                        >

                            {/* MOBILE */}
                            {isMobile && (
                                <Grid align="start">

                                    {/* time status name */}
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.BREAK_END)}</Text>
                                    </Grid.Col>

                                    {/* time */}
                                    <Grid.Col span={{ base: 7 }}>
                                        <Group justify="end">
                                            <Badge
                                                size="lg"
                                                mb="md"
                                                radius="lg"
                                                color={getTimelineColor(TimeStatus.BREAK_END)}
                                                p="md"
                                                style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                            >
                                                <Text
                                                    size="sm"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.break_out_time_2)}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>

                                    {/* time status description */}
                                    <Grid.Col span={{ base: 12 }}>
                                        <Text
                                            c="#c1c0c0"
                                            size="lg"
                                            fw={600}
                                        >
                                            {getStatusDescriptionPersonal(TimeStatus.BREAK_END)} {formatTime(attendanceRecordDataProp.break_out_time_2)}. {/* [TIMESTATUS] AT [TIME] */}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Group justify="space-between">

                                        {/* status name */}
                                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.BREAK_END)}</Text>

                                        {/* time badge */}
                                        <Badge
                                            size="lg"
                                            mb="md"
                                            radius="lg"
                                            color={getActivityColor(TimeStatus.CLOCKED_IN)[0]}
                                            p="md"
                                            style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {/* time */}
                                            {/* {!isHovered7 && ( */}
                                                <Text
                                                    size="md"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.break_out_time_2)}
                                                </Text>
                                            {/* )} */}

                                            {/* time w/ menu */}
                                            {false && (
                                                <>
                                                    <Group justify="end">
                                                        {/* time */}
                                                        <Text
                                                            size="md"
                                                            c="#dcdcdc"
                                                            fw={600}
                                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                        >
                                                            {formatTime(attendanceRecordDataProp?.break_out_time_2)}
                                                        </Text>

                                                        {/* menu with option to edit/delete */}
                                                        <Menu shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    size="lg"
                                                                    variant="transparent"
                                                                    radius="sm"
                                                                    color="#dcdcdc"
                                                                >
                                                                    <IconDots style={{ width: rem(18) }} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {/* edit */}
                                                                <Menu.Item
                                                                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled
                                                                >
                                                                    Edit
                                                                </Menu.Item>

                                                                {/* delete */}
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled // temp
                                                                    onClick={() => {
                                                                        setStatusType(TimeStatus.BREAK_END);
                                                                        setSelectedTimeIndex(TimeIndexDepth.Depth_2);
                                                                        setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                        //openDeleteTimeModal();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </>
                                            )}
                                        </Badge>
                                    </Group>

                                    {/* time status description */}
                                    <Text
                                        c="#c1c0c0"
                                        size="lg"
                                        fw={600}
                                    >
                                        {getStatusDescriptionPersonal(TimeStatus.BREAK_END)} {formatTime(attendanceRecordDataProp?.break_out_time_2)}. {/* [TIMESTATUS] AT [TIME] */}
                                    </Text>
                                </>
                            )}
                        </Paper>
                    </Timeline.Item>
                )}

                {/* check_out_time_2 */}
                {attendanceRecordDataProp?.check_out_time_2 && (
                    <Timeline.Item
                        key={GenerateUUID()}
                        color={getActivityColor(TimeStatus.CLOCKED_OUT)[0]}
                        bullet={
                            <ThemeIcon
                                size={42}
                                //variant="gradient"
                                color={getActivityColor(TimeStatus.CLOCKED_OUT)[1]}
                                //gradient={{ from: 'lime', to: 'cyan' }}
                                radius="xl"
                            >
                            </ThemeIcon>
                        }
                    >

                        <Paper
                            shadow="md"
                            p="md"
                            radius="lg"
                            style={{ background: "#324d3e", color: "#dcdcdc", border: isHovered8 ? '6px solid #639383' : "" }}
                            onMouseEnter={() => handleMouseEnter(8)}
                            onMouseLeave={() => handleMouseLeave(8)}
                        >

                            {/* MOBILE */}
                            {isMobile && (
                                <Grid align="start">

                                    {/* time status name */}
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.CLOCKED_OUT)}</Text>
                                    </Grid.Col>

                                    {/* time */}
                                    <Grid.Col span={{ base: 7 }}>
                                        <Group justify="end">
                                            <Badge
                                                size="lg"
                                                mb="md"
                                                radius="lg"
                                                color={getTimelineColor(TimeStatus.CLOCKED_OUT)}
                                                p="md"
                                                style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                            >
                                                <Text
                                                    size="sm"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.check_out_time_2)}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>

                                    {/* time status description */}
                                    <Grid.Col span={{ base: 12 }}>
                                        <Text
                                            c="#c1c0c0"
                                            size="lg"
                                            fw={600}
                                        >
                                            {getStatusDescriptionPersonal(TimeStatus.CLOCKED_OUT)} {formatTime(attendanceRecordDataProp.check_out_time_2)}. {/* [TIMESTATUS] AT [TIME] */}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Group justify="space-between">

                                        {/* status name */}
                                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.CLOCKED_OUT)}</Text>

                                        {/* time badge */}
                                        <Badge
                                            size="lg"
                                            mb="md"
                                            radius="lg"
                                            color={getActivityColor(TimeStatus.CLOCKED_OUT)[0]}
                                            p="md"
                                            style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {/* time */}
                                            {/* {!isHovered8 && ( */}
                                                <Text
                                                    size="md"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.check_out_time_2)}
                                                </Text>
                                            {/* )} */}

                                            {/* time w/ menu */}
                                            {false && (
                                                <>
                                                    <Group justify="end">
                                                        {/* time */}
                                                        <Text
                                                            size="md"
                                                            c="#dcdcdc"
                                                            fw={600}
                                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                        >
                                                            {formatTime(attendanceRecordDataProp?.check_out_time_2)}
                                                        </Text>

                                                        {/* menu with option to edit/delete */}
                                                        <Menu shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    size="lg"
                                                                    variant="transparent"
                                                                    radius="sm"
                                                                    color="#dcdcdc"
                                                                >
                                                                    <IconDots style={{ width: rem(18) }} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {/* edit */}
                                                                <Menu.Item
                                                                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled
                                                                >
                                                                    Edit
                                                                </Menu.Item>

                                                                {/* delete */}
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled // temp
                                                                    onClick={() => {
                                                                        setStatusType(TimeStatus.CLOCKED_OUT);
                                                                        setSelectedTimeIndex(TimeIndexDepth.Depth_2);
                                                                        setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                        //openDeleteTimeModal();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </>
                                            )}
                                        </Badge>
                                    </Group>

                                    {/* time status description */}
                                    <Text
                                        c="#c1c0c0"
                                        size="lg"
                                        fw={600}
                                    >
                                        {getStatusDescriptionPersonal(TimeStatus.CLOCKED_OUT)} {formatTime(attendanceRecordDataProp?.check_out_time_2)}. {/* [TIMESTATUS] AT [TIME] */}
                                    </Text>
                                </>
                            )}
                        </Paper>
                    </Timeline.Item>
                )}

                {/* check_in_time_3 */}
                {attendanceRecordDataProp?.check_in_time_3 && (
                    <Timeline.Item
                        key={GenerateUUID()}
                        color={getActivityColor(TimeStatus.CLOCKED_IN)[0]}
                        bullet={
                            <ThemeIcon
                                size={42}
                                //variant="gradient"
                                color={getActivityColor(TimeStatus.CLOCKED_IN)[1]}
                                //gradient={{ from: 'lime', to: 'cyan' }}
                                radius="xl"
                            >
                            </ThemeIcon>
                        }
                    >

                        <Paper
                            shadow="md"
                            p="md"
                            radius="lg"
                            style={{ background: "#324d3e", color: "#dcdcdc", border: isHovered9 ? '6px solid #639383' : "" }}
                            onMouseEnter={() => handleMouseEnter(9)}
                            onMouseLeave={() => handleMouseLeave(9)}
                        >

                            {/* MOBILE */}
                            {isMobile && (
                                <Grid align="start">

                                    {/* time status name */}
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.CLOCKED_IN)}</Text>
                                    </Grid.Col>

                                    {/* time */}
                                    <Grid.Col span={{ base: 7 }}>
                                        <Group justify="end">
                                            <Badge
                                                size="lg"
                                                mb="md"
                                                radius="lg"
                                                color={getTimelineColor(TimeStatus.CLOCKED_IN)}
                                                p="md"
                                                style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                            >
                                                <Text
                                                    size="sm"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.check_in_time_3)}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>

                                    {/* time status description */}
                                    <Grid.Col span={{ base: 12 }}>
                                        <Text
                                            c="#c1c0c0"
                                            size="lg"
                                            fw={600}
                                        >
                                            {getStatusDescriptionPersonal(TimeStatus.CLOCKED_IN)} {formatTime(attendanceRecordDataProp.check_in_time_3)}. {/* [TIMESTATUS] AT [TIME] */}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Group justify="space-between">

                                        {/* status name */}
                                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.CLOCKED_IN)}</Text>

                                        {/* time badge */}
                                        <Badge
                                            size="lg"
                                            mb="md"
                                            radius="lg"
                                            color={getActivityColor(TimeStatus.CLOCKED_IN)[0]}
                                            p="md"
                                            style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {/* time */}
                                            {/* {!isHovered9 && ( */}
                                                <Text
                                                    size="md"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.check_in_time_3)}
                                                </Text>
                                            {/* )} */}

                                            {/* time w/ menu */}
                                            {false && (
                                                <>
                                                    <Group justify="end">
                                                        {/* time */}
                                                        <Text
                                                            size="md"
                                                            c="#dcdcdc"
                                                            fw={600}
                                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                        >
                                                            {formatTime(attendanceRecordDataProp?.check_in_time_3)}
                                                        </Text>

                                                        {/* menu with option to edit/delete */}
                                                        <Menu shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    size="lg"
                                                                    variant="transparent"
                                                                    radius="sm"
                                                                    color="#dcdcdc"
                                                                >
                                                                    <IconDots style={{ width: rem(18) }} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {/* edit */}
                                                                <Menu.Item
                                                                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled
                                                                >
                                                                    Edit
                                                                </Menu.Item>

                                                                {/* delete */}
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled // temp
                                                                    onClick={() => {
                                                                        setStatusType(TimeStatus.CLOCKED_IN);
                                                                        setSelectedTimeIndex(TimeIndexDepth.Depth_3);
                                                                        setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                        //openDeleteTimeModal();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </>
                                            )}
                                        </Badge>
                                    </Group>

                                    {/* time status description */}
                                    <Text
                                        c="#c1c0c0"
                                        size="lg"
                                        fw={600}
                                    >
                                        {getStatusDescriptionPersonal(TimeStatus.CLOCKED_IN)} {formatTime(attendanceRecordDataProp?.check_in_time_3)}. {/* [TIMESTATUS] AT [TIME] */}
                                    </Text>
                                </>
                            )}
                        </Paper>
                    </Timeline.Item>
                )}

                {/* break_in_time_3 */}
                {attendanceRecordDataProp?.break_in_time_3 && (
                    <Timeline.Item
                        key={GenerateUUID()}
                        color={getActivityColor(TimeStatus.BREAK_START)[0]}
                        bullet={
                            <ThemeIcon
                                size={42}
                                //variant="gradient"
                                color={getActivityColor(TimeStatus.BREAK_START)[1]}
                                //gradient={{ from: 'lime', to: 'cyan' }}
                                radius="xl"
                            >
                            </ThemeIcon>
                        }
                    >

                        <Paper
                            shadow="md"
                            p="md"
                            radius="lg"
                            style={{ background: "#324d3e", color: "#dcdcdc", border: isHovered10 ? '6px solid #639383' : "" }}
                            onMouseEnter={() => handleMouseEnter(10)}
                            onMouseLeave={() => handleMouseLeave(10)}
                        >

                            {/* MOBILE */}
                            {isMobile && (
                                <Grid align="start">

                                    {/* time status name */}
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.BREAK_START)}</Text>
                                    </Grid.Col>

                                    {/* time */}
                                    <Grid.Col span={{ base: 7 }}>
                                        <Group justify="end">
                                            <Badge
                                                size="lg"
                                                mb="md"
                                                radius="lg"
                                                color={getTimelineColor(TimeStatus.BREAK_START)}
                                                p="md"
                                                style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                            >
                                                <Text
                                                    size="sm"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.break_in_time_3)}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>

                                    {/* time status description */}
                                    <Grid.Col span={{ base: 12 }}>
                                        <Text
                                            c="#c1c0c0"
                                            size="lg"
                                            fw={600}
                                        >
                                            {getStatusDescriptionPersonal(TimeStatus.BREAK_START)} {formatTime(attendanceRecordDataProp.break_in_time_3)}. {/* [TIMESTATUS] AT [TIME] */}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Group justify="space-between">

                                        {/* status name */}
                                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.BREAK_START)}</Text>

                                        {/* time badge */}
                                        <Badge
                                            size="lg"
                                            mb="md"
                                            radius="lg"
                                            color={getActivityColor(TimeStatus.BREAK_START)[0]}
                                            p="md"
                                            style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {/* time */}
                                            {/* {!isHovered10 && ( */}
                                                <Text
                                                    size="md"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.break_in_time_3)}
                                                </Text>
                                            {/* )} */}

                                            {/* time w/ menu */}
                                            {false && (
                                                <>
                                                    <Group justify="end">
                                                        {/* time */}
                                                        <Text
                                                            size="md"
                                                            c="#dcdcdc"
                                                            fw={600}
                                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                        >
                                                            {formatTime(attendanceRecordDataProp?.break_in_time_3)}
                                                        </Text>

                                                        {/* menu with option to edit/delete */}
                                                        <Menu shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    size="lg"
                                                                    variant="transparent"
                                                                    radius="sm"
                                                                    color="#dcdcdc"
                                                                >
                                                                    <IconDots style={{ width: rem(18) }} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {/* edit */}
                                                                <Menu.Item
                                                                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled
                                                                >
                                                                    Edit
                                                                </Menu.Item>

                                                                {/* delete */}
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled // temp
                                                                    onClick={() => {
                                                                        setStatusType(TimeStatus.BREAK_START);
                                                                        setSelectedTimeIndex(TimeIndexDepth.Depth_3);
                                                                        setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                        //openDeleteTimeModal();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </>
                                            )}
                                        </Badge>
                                    </Group>

                                    {/* time status description */}
                                    <Text
                                        c="#c1c0c0"
                                        size="lg"
                                        fw={600}
                                    >
                                        {getStatusDescriptionPersonal(TimeStatus.BREAK_START)} {formatTime(attendanceRecordDataProp?.break_in_time_3)}. {/* [TIMESTATUS] AT [TIME] */}
                                    </Text>
                                </>
                            )}
                        </Paper>
                    </Timeline.Item>
                )}


                {/* break_out_time_3 */}
                {attendanceRecordDataProp?.break_out_time_3 && (
                    <Timeline.Item
                        key={GenerateUUID()}
                        color={getActivityColor(TimeStatus.CLOCKED_IN)[0]}
                        bullet={
                            <ThemeIcon
                                size={42}
                                //variant="gradient"
                                color={getActivityColor(TimeStatus.CLOCKED_IN)[1]}
                                //gradient={{ from: 'lime', to: 'cyan' }}
                                radius="xl"
                            >
                            </ThemeIcon>
                        }
                    >

                        <Paper
                            shadow="md"
                            p="md"
                            radius="lg"
                            style={{ background: "#324d3e", color: "#dcdcdc", border: isHovered11 ? '6px solid #639383' : "" }}
                            onMouseEnter={() => handleMouseEnter(11)}
                            onMouseLeave={() => handleMouseLeave(11)}
                        >

                            {/* MOBILE */}
                            {isMobile && (
                                <Grid align="start">

                                    {/* time status name */}
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.BREAK_END)}</Text>
                                    </Grid.Col>

                                    {/* time */}
                                    <Grid.Col span={{ base: 7 }}>
                                        <Group justify="end">
                                            <Badge
                                                size="lg"
                                                mb="md"
                                                radius="lg"
                                                color={getTimelineColor(TimeStatus.BREAK_END)}
                                                p="md"
                                                style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                            >
                                                <Text
                                                    size="sm"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.break_out_time_3)}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>

                                    {/* time status description */}
                                    <Grid.Col span={{ base: 12 }}>
                                        <Text
                                            c="#c1c0c0"
                                            size="lg"
                                            fw={600}
                                        >
                                            {getStatusDescriptionPersonal(TimeStatus.BREAK_END)} {formatTime(attendanceRecordDataProp.break_out_time_3)}. {/* [TIMESTATUS] AT [TIME] */}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Group justify="space-between">

                                        {/* status name */}
                                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.BREAK_END)}</Text>

                                        {/* time badge */}
                                        <Badge
                                            size="lg"
                                            mb="md"
                                            radius="lg"
                                            color={getActivityColor(TimeStatus.CLOCKED_IN)[0]}
                                            p="md"
                                            style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {/* time */}
                                            {/* {!isHovered11 && ( */}
                                                <Text
                                                    size="md"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.break_out_time_3)}
                                                </Text>
                                            {/* )} */}

                                            {/* time w/ menu */}
                                            {false && (
                                                <>
                                                    <Group justify="end">
                                                        {/* time */}
                                                        <Text
                                                            size="md"
                                                            c="#dcdcdc"
                                                            fw={600}
                                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                        >
                                                            {formatTime(attendanceRecordDataProp?.break_out_time_3)}
                                                        </Text>

                                                        {/* menu with option to edit/delete */}
                                                        <Menu shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    size="lg"
                                                                    variant="transparent"
                                                                    radius="sm"
                                                                    color="#dcdcdc"
                                                                >
                                                                    <IconDots style={{ width: rem(18) }} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {/* edit */}
                                                                <Menu.Item
                                                                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled
                                                                >
                                                                    Edit
                                                                </Menu.Item>

                                                                {/* delete */}
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled // temp
                                                                    onClick={() => {
                                                                        setStatusType(TimeStatus.BREAK_END);
                                                                        setSelectedTimeIndex(TimeIndexDepth.Depth_3);
                                                                        setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                        //openDeleteTimeModal();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </>
                                            )}
                                        </Badge>
                                    </Group>

                                    {/* time status description */}
                                    <Text
                                        c="#c1c0c0"
                                        size="lg"
                                        fw={600}
                                    >
                                        {getStatusDescriptionPersonal(TimeStatus.BREAK_END)} {formatTime(attendanceRecordDataProp?.break_out_time_3)}. {/* [TIMESTATUS] AT [TIME] */}
                                    </Text>
                                </>
                            )}
                        </Paper>
                    </Timeline.Item>
                )}

                {/* check_out_time_3 */}
                {attendanceRecordDataProp?.check_out_time_3 && (
                    <Timeline.Item
                        key={GenerateUUID()}
                        color={getActivityColor(TimeStatus.CLOCKED_OUT)[0]}
                        bullet={
                            <ThemeIcon
                                size={42}
                                //variant="gradient"
                                color={getActivityColor(TimeStatus.CLOCKED_OUT)[1]}
                                //gradient={{ from: 'lime', to: 'cyan' }}
                                radius="xl"
                            >
                            </ThemeIcon>
                        }
                    >

                        <Paper
                            shadow="md"
                            p="md"
                            radius="lg"
                            style={{ background: "#324d3e", color: "#dcdcdc", border: isHovered12 ? '6px solid #639383' : "" }}
                            onMouseEnter={() => handleMouseEnter(12)}
                            onMouseLeave={() => handleMouseLeave(12)}
                        >

                            {/* MOBILE */}
                            {isMobile && (
                                <Grid align="start">

                                    {/* time status name */}
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.CLOCKED_OUT)}</Text>
                                    </Grid.Col>

                                    {/* time */}
                                    <Grid.Col span={{ base: 7 }}>
                                        <Group justify="end">
                                            <Badge
                                                size="lg"
                                                mb="md"
                                                radius="lg"
                                                color={getTimelineColor(TimeStatus.CLOCKED_OUT)}
                                                p="md"
                                                style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                            >
                                                <Text
                                                    size="sm"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.check_out_time_3)}
                                                </Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>

                                    {/* time status description */}
                                    <Grid.Col span={{ base: 12 }}>
                                        <Text
                                            c="#c1c0c0"
                                            size="lg"
                                            fw={600}
                                        >
                                            {getStatusDescriptionPersonal(TimeStatus.CLOCKED_OUT)} {formatTime(attendanceRecordDataProp.check_out_time_3)}. {/* [TIMESTATUS] AT [TIME] */}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* DESKTOP */}
                            {!isMobile && (
                                <>
                                    <Group justify="space-between">

                                        {/* status name */}
                                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getStatusNameLong(TimeStatus.CLOCKED_OUT)}</Text>

                                        {/* time badge */}
                                        <Badge
                                            size="lg"
                                            mb="md"
                                            radius="lg"
                                            color={getActivityColor(TimeStatus.CLOCKED_OUT)[0]}
                                            p="md"
                                            style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                        >
                                            {/* time */}
                                            {/* {!isHovered12 && ( */}
                                                <Text
                                                    size="md"
                                                    c="#dcdcdc"
                                                    fw={600}
                                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                >
                                                    {formatTime(attendanceRecordDataProp?.check_out_time_3)}
                                                </Text>
                                            {/* )} */}

                                            {/* time w/ menu */}
                                            {false && (
                                                <>
                                                    <Group justify="end">
                                                        {/* time */}
                                                        <Text
                                                            size="md"
                                                            c="#dcdcdc"
                                                            fw={600}
                                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                                        >
                                                            {formatTime(attendanceRecordDataProp?.check_out_time_3)}
                                                        </Text>

                                                        {/* menu with option to edit/delete */}
                                                        <Menu shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    size="lg"
                                                                    variant="transparent"
                                                                    radius="sm"
                                                                    color="#dcdcdc"
                                                                >
                                                                    <IconDots style={{ width: rem(18) }} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {/* edit */}
                                                                <Menu.Item
                                                                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled
                                                                >
                                                                    Edit
                                                                </Menu.Item>

                                                                {/* delete */}
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                                                    disabled // temp
                                                                    onClick={() => {
                                                                        setStatusType(TimeStatus.CLOCKED_OUT);
                                                                        setSelectedTimeIndex(TimeIndexDepth.Depth_3);
                                                                        setSelectedAttendanceRecord(attendanceRecordDataProp);
                                                                        //openDeleteTimeModal();
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </>
                                            )}
                                        </Badge>
                                    </Group>

                                    {/* time status description */}
                                    <Text
                                        c="#c1c0c0"
                                        size="lg"
                                        fw={600}
                                    >
                                        {getStatusDescriptionPersonal(TimeStatus.CLOCKED_OUT)} {formatTime(attendanceRecordDataProp?.check_out_time_3)}. {/* [TIMESTATUS] AT [TIME] */}
                                    </Text>
                                </>
                            )}
                        </Paper>
                    </Timeline.Item>
                )}
            </Timeline>

            {/* TODO add new time to timesheet */}
            {/* <Group justify="center" mt="lg">
                <Button
                    size="lg"
                    variant="subtle"
                    radius="sm"
                    color="#dcdcdc"
                    onClick={handleAddTimeClick}
                >
                    <IconPlus style={{ width: rem(18), marginRight:"5px"}} />
                    <Text size="lg" c="#dcdcdc" style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}> Add</Text>
                </Button>
            </Group> */}
        </>
    );
}