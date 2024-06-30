import { Alert, Badge, Box, Button, Container, Grid, Group, HoverCard, Modal, Paper, Space, Stack, Table, Text, Title, Tooltip, rem } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import TimesheetTable from "./components/TimesheetTable";
import TimesheetTimeline from "../../components/TimesheetTimeline";
import "../../css/AttendanceTable.scss";
import ChangeReasonModal from "./components/ChangeReasonModal";
import { useNavigate } from "react-router-dom";
import { IconCheck, IconChevronLeft, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useNavigationContext } from "../../context/NavigationContext";
import SubmitTimesheetConfirmModal from "../../components/SubmitTimesheetConfirmModal";
import { GetArchivedStaffTimesheetData, GetStaffAttendanceByStaffUid, GetStaffNotificationMessages, GetTimesheetDataByStaffUid, PostSubmitStaffTimesheet } from "../../helpers/Api";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import { TimeStatus, TimesheetStatus, calculateDuration, getDayOfWeek, getFormattedDate, validateTime } from "../../helpers/Helpers";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../../css/Notifications.module.css";
import TimesheetTableMobile from "./components/TimesheetTableMobile";
import { CarouselDayOfWeek } from "../../components/CarouselDayOfWeek";
import { StaffAttendanceRecord } from "../owner-dashboard/child/Attendance";

interface Timesheet {
    handleSubmittedTimesheets: () => void;
}

export interface TimesheetDataReview {
    type: string;
    value: string;
    description: string;
}

export interface TimesheetReviewInformation {
    totalHours: number;
    payRate: number;
    totalPay: number;
    startDate: string;
    endDate: string;
}

export interface TimesheetAttendanceInfo {
    uid: string;
    businessId: string;
    attendanceRecords: StaffAttendanceRecord[];
}

export interface TimesheetData {
    id: string;
    start_date: string;
    end_date: string;
    notes: string;
    status: number;
    pending_changes: number;
    regular_hours: number;
    total_hours: number;
    overtime_hours: number;
    vacation_hours: number;
    holiday_hurs: number;
    unpaid_hours: number;
    other_paid_hours: number;
    pay_rate: number;
    days_worked: number;
    regular_pay: number;
    overtime_pay: number;
    vacation_pay: number;
    holiday_pay: number;
    total_gross_pay: number;
    total_net_pay: number;
    total_fees: number;
    total_net_fees: number;
    deductions: number;
    date_approved: number;
    date_submitted: number;
    attendance_record_ids: string[];
    date_modified: string;
    business_id: string;
    user_uid: string;
    approved_by: string;

}

export interface ArchivedStaffTimesheetData {
    timesheet_id: string;
    uid: string;
    start_date: string;
    end_date: string;
    first_name: string;
    last_name: string;
    manager_uid: string;
    manager_name: string;
    total: number;
    pay: number;
    pdf_file: string;
}

export interface NotificationMessage {
    id: string;
    to_uid: string;
    from_uid: string;
    message: string;
    message_type: number;
}

export interface DayVisible {
    day: number;
    visible: boolean;
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

const emptyTimesheetData: TimesheetData = {
    id: "",
    start_date: "",
    end_date: "",
    notes: "",
    status: 0,
    pending_changes: 0,
    regular_hours: 0,
    total_hours: 0,
    overtime_hours: 0,
    vacation_hours: 0,
    holiday_hurs: 0,
    unpaid_hours: 0,
    other_paid_hours: 0,
    pay_rate: 0,
    days_worked: 0,
    regular_pay: 0,
    overtime_pay: 0,
    vacation_pay: 0,
    holiday_pay: 0,
    total_gross_pay: 0,
    total_net_pay: 0,
    total_fees: 0,
    total_net_fees: 0,
    deductions: 0,
    date_approved: 0,
    date_submitted: 0,
    attendance_record_ids: [],
    date_modified: "",
    business_id: "",
    user_uid: "",
    approved_by: ""
};

export default function Timesheet(props: Timesheet) {
    const { user, business, session } = useAuth();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobile = useMediaQuery('(max-width: 25em)');
    const [selectedDay, setSelectedDay] = useState(0); // 0 (Monday) - 6 (Sunday)
    const [timesheetChanges, setTimesheetChanges] = useState(true);
    const [changeReasonModalOpened, { open: openChangeReasonModal, close: closeChangeReasonModal }] = useDisclosure(false);
    const [profileModalOpened, { open: openProfileModal, close: closeProfileModal }] = useDisclosure(false);
    const [submitTimesheetModalOpened, { open: openSubmitTimesheetModal, close: closeSubmitTimesheetModal }] = useDisclosure(false);
    const [submitButtonClicked, setSubmitButtonClicked] = useState(true);
    const [changeReason, setChangeReason] = useState('');
    const navigate = useNavigate();
    const [attendanceRecordData, setAttendanceRecordData] = useState<StaffAttendanceRecord[]>([]);
    const [timesheetReviewInfo, setTimesheetReviewInfo] = useState<TimesheetReviewInformation>();
    const [timesheetData, setTimesheetData] = useState<TimesheetData>(emptyTimesheetData);
    const [timesheetStatus, setTimesheetStatus] = useState(1);
    const [notificationMessage, setNotificationMessage] = useState<NotificationMessage>();
    const [archivedTimesheetData, setArchivedTimesheetData] = useState<ArchivedStaffTimesheetData[]>([]);
    const [mondayPanelActive, setMondayPanelActive] = useState(true);
    const [tuesdayPanelActive, setTuesdayPanelActive] = useState(false);
    const [wednesdayPanelActive, setWednesdayPanelActive] = useState(false);
    const [thursdayPanelActive, setThursdayPanelActive] = useState(false);
    const [fridayPanelActive, setFridayPanelActive] = useState(false);
    const [saturdayPanelActive, setSaturdayPanelActive] = useState(false);
    const [sundayPanelActive, setSundayPanelActive] = useState(false);
    const [currentActivePanel, setCurrentActivePanel] = useState('');
    const [saturdayVisible, setSaturdayVisible] = useState(false);
    const [sundayVisible, setSundayVisible] = useState(false);
    const [mondayHovered, setMondayHovered] = useState(false);
    const [tuesdayHovered, setTuesdayHovered] = useState(false);
    const [wednesdayHovered, setWednesdayHovered] = useState(false);
    const [thursdayHovered, setThursdayHovered] = useState(false);
    const [fridayHovered, setFridayHovered] = useState(false);
    const [saturdayHovered, setSaturdayHovered] = useState(false);
    const [sundayHovered, setSundayHovered] = useState(false);
    const [weekendVisible, setWeekendVisible] = useState<DayVisible[]>([]);


    // props
    const handleSubmittedTimeSheets = props.handleSubmittedTimesheets;

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
        if (timesheetData) {
            console.log(timesheetData);
            setTimesheetStatus(timesheetData?.status);
        }
    }, [timesheetData]);

    useEffect(() => {
        if (timesheetStatus) {
            console.log("timesheet status=" + timesheetStatus);
            if (timesheetStatus == 3) {
                console.log("IT IS 3 button should be disabled");
            }
            else {
                console.log("Not 3, enabled");
            }
        }
    }, [timesheetStatus]);

    async function fetchData() {
        if (user && business?.id !== undefined) {
            // fetch attendance records for the week
            var attendanceRecords = await GetStaffAttendanceByStaffUid(user?.uid, session?.access_token);
            setAttendanceRecordData(attendanceRecords);

            if (attendanceRecords.length > 0) {
                if (attendanceRecords[6]?.check_in_time?.length > 0) {
                    setSundayVisible(true);
                }

                if (attendanceRecords[5]?.check_in_time?.length > 0) {
                    setSaturdayVisible(true);
                }
            }

            // get timesheet data
            var timesheetData = await GetTimesheetDataByStaffUid(business?.id, user?.uid, session?.access_token);
            if (timesheetData.length > 0) {
                setTimesheetData(timesheetData[0]);
                setTimesheetStatus(timesheetData[0]?.status);
            }

            // get notification message data
            var notificationMessageData = await GetStaffNotificationMessages(user?.uid, session?.access_token);
            setNotificationMessage(notificationMessageData[0]);

            // // get archived timesheet data
            // var archivedTimesheetData = await GetArchivedStaffTimesheetData(user?.business_info[0]?.id, user?.uid, session?.access_token);
            // setArchivedTimesheetData(archivedTimesheetData);
        }
    }

    function handleChanges() {
        setTimesheetChanges(true);
    }

    function handleOpenModal() {
        openChangeReasonModal();
    }

    // calculate timesheet from attendance records and validate on submit
    function handleOpenSubmitModal() {
        var totalHours = 0;
        var invalidRecord = false;

        attendanceRecordData.forEach(record => {
            var duration1 = 0, duration2 = 0, duration3 = 0;
            var breakDuration1 = 0, breakDuration2 = 0, breakDuration3 = 0;

            // calculate duration
            if (record.check_in_time !== "" && record.check_out_time !== "") {
                duration1 = calculateDuration(record.check_in_time, record.check_out_time);
            }
            else {
                invalidRecord = true; // check in and check out should exist on timesheet submit
            }
            if (record.check_in_time_2 !== "" && record.check_out_time_2 !== "") {
                duration2 = calculateDuration(record.check_in_time_2, record.check_out_time_2);
            }
            if (record.check_in_time_3 !== "" && record.check_out_time_3 !== "") {
                duration3 = calculateDuration(record.check_in_time_3, record.check_out_time_3);
            }

            // calculate break duration (if any)
            if (record.break_in_time !== "" && record.break_out_time !== "") {
                breakDuration1 = calculateDuration(record.break_in_time, record.break_out_time);
            }
            if (record.break_in_time_2 !== "" && record.break_out_time_2 !== "") {
                breakDuration2 = calculateDuration(record.break_in_time_2, record.break_out_time_2);
            }
            if (record.break_in_time_3 !== "" && record.break_out_time_3 !== "") {
                breakDuration3 = calculateDuration(record.break_in_time_3, record.break_out_time_3);
            }

            // sum up total hours and deduct break hours
            totalHours += (duration1 + duration2 + duration3);
            totalHours -= (breakDuration1 + breakDuration2 + breakDuration3);
        });

        if (invalidRecord) {
            // show message to fix errors
            console.log("Timesheet invalid");
            return;
        }

        var payRate = 0;
        var totalPay = totalHours * payRate;
        const newTimesheetReviewInfo: TimesheetReviewInformation = {
            totalHours: totalHours,
            payRate: payRate,
            totalPay: totalPay,
            startDate: attendanceRecordData[0].attendance_date,
            endDate: attendanceRecordData[5].attendance_date,
        };
        setTimesheetReviewInfo(newTimesheetReviewInfo);
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

    function handlePanelStateChanges() {
        var panelStates: any[] = [];

    }

    // handle when timesheet is submitted
    async function handleSubmitTimesheet() {
        if (user) {
            const id = notifications.show({
                loading: true,
                title: 'Validating timesheet',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            // remove records with -1 // empty or null
            var valid = true;
            var updatedAttendanceRecordData = attendanceRecordData;
            updatedAttendanceRecordData = attendanceRecordData.filter(record => {
                if ((record.check_in_time && record.check_in_time?.length > 0) && (record.check_out_time && record.check_out_time?.length > 0)) {
                    // check check_in_time
                    if (record.check_in_time === "") {
                        record.check_in_time = null;
                        record.check_out_time = null;
                    }

                    // check break_in_time
                    if (record.break_in_time === "") {
                        record.break_in_time = null;
                        record.break_out_time = null;
                    }

                    // check check_in_time_2
                    if (record.check_in_time_2 === "") {
                        record.check_in_time_2 = null;
                        record.check_out_time_2 = null;
                    }

                    // check break_in_time_2
                    if (record.break_in_time_2 === "") {
                        record.break_in_time_2 = null;
                        record.break_out_time_2 = null;
                    }

                    // check check_in_time_3
                    if (record.check_in_time_3 === "") {
                        record.check_in_time_3 = null;
                        record.check_out_time_3 = null;
                    }

                    // check break_in_time_3
                    if (record.break_in_time_3 === "") {
                        record.break_in_time_3 = null;
                        record.break_out_time_3 = null;
                    }

                    if (!validateTime(record)) {
                        // display error alert to check time entries to fix errors
                        // setTimeout(() => {
                        //     notifications.update({
                        //         id,
                        //         color: 'red',
                        //         title: 'Error',
                        //         message: 'Please fix the errors first and then try again.',
                        //         icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        //         loading: false,
                        //         autoClose: 3000,
                        //         classNames: notiicationClasses,
                        //     });
                        // }, 500);
                        valid = false;
                        return false;
                    }
                    // valid record, keep it
                    return true;
                }
                else {
                    // remove empty records
                    return false;
                }

            });

            if (!valid) {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error submitting your timesheet. Some fields are invalid, please fix them and try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 2000,
                    classNames: notiicationClasses,
                });
                return;
            }

            // format data to send to server
            var timesheetAttendanceInfo = {
                'uid': user?.uid,
                'business_id': user?.business_info[0].id,
                'attendance_records': updatedAttendanceRecordData,
            }

            // send POST to create new timesheet submission
            var response = await PostSubmitStaffTimesheet(user?.business_info[0].id, timesheetAttendanceInfo, session?.access_token);
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Submitting timesheet',
                    message: 'Please wait.',
                    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                    loading: true,
                    autoClose: 3000,
                    classNames: notiicationClasses,
                });
            }, 500);

            if (response === 201) {
                // success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Timesheet was submitted',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                closeSubmitTimesheetModal();
            }
            else {
                // error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error submitting your timesheet. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 5000);
            }
            fetchData();
        }
    }

    // update the attendance record in the root data
    function handleUpdateAttendanceRecord(updatedAttendanceRecord: StaffAttendanceRecord) {
        const recordToUpdateIndex = attendanceRecordData.findIndex(record => record.id === updatedAttendanceRecord.id);
        if (recordToUpdateIndex !== -1) {
            // create a new array with the updated record
            const updatedAttendanceRecordData = [...attendanceRecordData];
            updatedAttendanceRecordData[recordToUpdateIndex] = updatedAttendanceRecord;

            // update the state with the new array
            setAttendanceRecordData(updatedAttendanceRecordData);
        } else {
            // record not found
            console.log("Record not found in the state.");
        }
    }

    function handleDeleteAttendanceRecordTime(timeType: number, timeIndex: number, attendanceRecord: StaffAttendanceRecord) {
        var updatedAttendanceRecord = attendanceRecord;
        switch (timeType) {
            case 1:
                // out
                switch (timeIndex) {
                    case 1:
                        // clear check_out_time and move everything up
                        updatedAttendanceRecord.check_out_time = attendanceRecord.check_in_time_2;
                        updatedAttendanceRecord.check_in_time_2 = attendanceRecord.check_out_time_2;
                        updatedAttendanceRecord.check_out_time_2 = attendanceRecord.check_in_time_3;
                        updatedAttendanceRecord.check_in_time_3 = attendanceRecord.check_out_time_3;
                        updatedAttendanceRecord.check_out_time_3 = null;
                        break;
                    case 2:
                        // clear check_out_time_2 and move everything up
                        updatedAttendanceRecord.check_out_time_2 = attendanceRecord.check_in_time_3;
                        updatedAttendanceRecord.check_in_time_3 = attendanceRecord.check_out_time_3;
                        updatedAttendanceRecord.check_out_time_3 = null;
                        break;
                    case 3:
                        // clear check_out_time_3 and move everything up
                        updatedAttendanceRecord.check_out_time_3 = attendanceRecord.check_in_time_3;
                        updatedAttendanceRecord.check_out_time_3 = null;
                        break;
                }
                break;
            case 2:
                // in
                switch (timeIndex) {
                    case 1:
                        // clear check_in_time and move everything up
                        updatedAttendanceRecord.check_in_time = attendanceRecord.check_out_time;
                        updatedAttendanceRecord.check_out_time = attendanceRecord.check_in_time_2;
                        updatedAttendanceRecord.check_in_time_2 = attendanceRecord.check_out_time_2;
                        updatedAttendanceRecord.check_out_time_2 = attendanceRecord.check_in_time_3;
                        updatedAttendanceRecord.check_in_time_3 = attendanceRecord.check_out_time_3;
                        updatedAttendanceRecord.check_out_time_3 = null;
                        break;
                    case 2:
                        // clear check_in_time_2 and move everything up
                        updatedAttendanceRecord.check_in_time_2 = attendanceRecord.check_out_time_2;
                        updatedAttendanceRecord.check_out_time_2 = attendanceRecord.check_in_time_3;
                        updatedAttendanceRecord.check_in_time_3 = attendanceRecord.check_out_time_3;
                        updatedAttendanceRecord.check_out_time_3 = null;
                        break;
                    case 3:
                        // clear check_in_time_3 and move everything up
                        updatedAttendanceRecord.check_in_time_3 = attendanceRecord.check_out_time_3;
                        updatedAttendanceRecord.check_out_time_3 = null;
                        break;
                }
                break;
            case 3:
                // break start
                switch (timeIndex) {
                    case 1:
                        // clear break_in_time and move everything up
                        updatedAttendanceRecord.break_in_time = attendanceRecord.break_out_time;
                        updatedAttendanceRecord.break_out_time = attendanceRecord.break_in_time_2;
                        updatedAttendanceRecord.break_in_time_2 = attendanceRecord.break_out_time_2;
                        updatedAttendanceRecord.break_out_time_2 = attendanceRecord.break_in_time_3;
                        updatedAttendanceRecord.break_in_time_3 = attendanceRecord.break_out_time_3;
                        updatedAttendanceRecord.break_out_time_3 = null;
                        break;
                    case 2:
                        // clear break_in_time_2 and move everything up
                        updatedAttendanceRecord.break_in_time_2 = attendanceRecord.break_out_time_2;
                        updatedAttendanceRecord.break_out_time_2 = attendanceRecord.break_in_time_3;
                        updatedAttendanceRecord.break_out_time_3 = attendanceRecord.break_out_time_3;
                        updatedAttendanceRecord.break_out_time_3 = null;
                        break;
                    case 3:
                        // clear break_in_time_3 and move everything up
                        updatedAttendanceRecord.break_in_time_3 = attendanceRecord.break_out_time_3;
                        updatedAttendanceRecord.break_out_time_3 = null;
                        break;
                }
                break;
            case 4:
                // break end
                switch (timeIndex) {
                    case 1:
                        // clear break_out_time and move everything up
                        updatedAttendanceRecord.break_out_time = attendanceRecord.break_in_time_2;
                        updatedAttendanceRecord.break_in_time_2 = attendanceRecord.break_out_time_2;
                        updatedAttendanceRecord.break_out_time_2 = attendanceRecord.break_in_time_3;
                        updatedAttendanceRecord.break_in_time_3 = attendanceRecord.break_out_time_3;
                        updatedAttendanceRecord.break_out_time_3 = null;
                        break;
                    case 2:
                        // clear break_out_time_2 and move everything up
                        updatedAttendanceRecord.break_out_time_2 = attendanceRecord.break_in_time_3;
                        updatedAttendanceRecord.break_in_time_3 = attendanceRecord.break_out_time_3;
                        updatedAttendanceRecord.break_out_time_3 = null;
                        break;
                    case 3:
                        // clear break_out_time_3 and move everything up
                        updatedAttendanceRecord.break_in_time_3 = attendanceRecord.break_out_time_3;
                        updatedAttendanceRecord.break_out_time_3 = null;
                        break;
                }
                break;
        }

        handleUpdateAttendanceRecord(updatedAttendanceRecord);
    }

    // handle when mobile tabs are clicked show which panel
    function handlePanelChanges(panel: string) {
        switch (panel) {
            case "monday":
                setMondayPanelActive(true);
                setTuesdayPanelActive(false);
                setWednesdayPanelActive(false);
                setThursdayPanelActive(false);
                setFridayPanelActive(false);
                setSaturdayPanelActive(false);
                setSundayPanelActive(false);
                break;
            case "tuesday":
                setMondayPanelActive(false);
                setTuesdayPanelActive(true);
                setWednesdayPanelActive(false);
                setThursdayPanelActive(false);
                setFridayPanelActive(false);
                setSaturdayPanelActive(false);
                setSundayPanelActive(false);
                break;
            case "wednesday":
                setMondayPanelActive(false);
                setTuesdayPanelActive(false);
                setWednesdayPanelActive(true);
                setThursdayPanelActive(false);
                setFridayPanelActive(false);
                setSaturdayPanelActive(false);
                setSundayPanelActive(false);
                break;
            case "thursday":
                setMondayPanelActive(false);
                setTuesdayPanelActive(false);
                setWednesdayPanelActive(false);
                setThursdayPanelActive(true);
                setFridayPanelActive(false);
                setSaturdayPanelActive(false);
                setSundayPanelActive(false);
                break;
            case "friday":
                setMondayPanelActive(false);
                setTuesdayPanelActive(false);
                setWednesdayPanelActive(false);
                setThursdayPanelActive(false);
                setFridayPanelActive(true);
                setSaturdayPanelActive(false);
                setSundayPanelActive(false);
                break;
            case "saturday":
                setMondayPanelActive(false);
                setTuesdayPanelActive(false);
                setWednesdayPanelActive(false);
                setThursdayPanelActive(false);
                setFridayPanelActive(false);
                setSaturdayPanelActive(true);
                setSundayPanelActive(false);
                break;
            case "sunday":
                setMondayPanelActive(false);
                setTuesdayPanelActive(false);
                setWednesdayPanelActive(false);
                setThursdayPanelActive(false);
                setFridayPanelActive(false);
                setSaturdayPanelActive(false);
                setSundayPanelActive(true);
                break;
        }
        setCurrentActivePanel(panel);
    }

    // show cards for timesheet information
    const timesheetInformationItem = attendanceRecordData?.map((item) => (
        <Paper shadow="md" p="lg" pr="xl" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="lg">
            {item.id != "-1" && item.total_time != 0 && (
                // attendance is not null
                <Grid align="center">
                    <Grid.Col span={{ base: 6 }}>
                        <Stack gap="xs">
                            <Group>
                                <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Total time</Text>
                            </Group>
                            <Text c="#c1c0c0" size="lg" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>Total time was {item.total_time}</Text>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }}>
                        {isMobile && (
                            <Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{item.total_time}</Text>
                            </Badge>
                        )}
                        {!isMobile && (
                            <Group justify="end">
                                < Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                    <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{item.total_time}</Text>
                                </Badge>
                            </Group>
                        )}
                    </Grid.Col>
                </Grid>
            )}
            {item.id === "-1" || item.total_time === 0 && (
                // attendance is null
                <>
                    <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                    <Text c="#c1c0c0" size="lg" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>Nothing found</Text>
                </>
            )}

        </Paper>
    ));

    // show timesheet denied alerts
    const deniedNotificationAlerts = (
        <Alert
            variant="light"
            color="red"
            radius="md"
            title="Note"
            icon={<IconInfoCircle />}
            mb="lg"
        >
            <Text
                c="#dcdcdc"
                size="lg"
                style={{ fontFamily: "AK-Medium" }}
            >
                Your timesheet was denied because:
            </Text>
            <Text
                c="#dcdcdc"
                size="lg"
            >
                {notificationMessage?.message}
            </Text>
            <Text
                mt="lg"
                c="#dcdcdc"
                size="lg"
                style={{ fontFamily: "AK-Medium" }}
            >
                Please make the necessary changes and submit your timesheet again for approval.
            </Text>

        </Alert>
    );

    // show timesheet submitted alert
    const submittedNotificationAlert = (
        <Alert
            variant="light"
            color="yellow"
            radius="md"
            title="Note"
            icon={<IconInfoCircle />}
            mb="lg"
        >
            <Text
                c="#dcdcdc"
                size="lg"
                style={{ fontFamily: "AK-Medium" }}
            >
                Your timesheet has been submitted and it is currently being reviewed.
            </Text>
            <Text
                c="#dcdcdc"
                size="lg"
                style={{ fontFamily: "AK-Medium" }}
            >
                You will be notified when the status changes.
            </Text>
        </Alert>
    );

    // show timesheet approved alert
    const approvedNotificationAlert = (
        <Alert
            variant="light"
            color="green"
            radius="md"
            title="Note"
            icon={<IconInfoCircle />}
            mb="lg"
        >
            <Text
                c="#dcdcdc"
                size="lg"
                style={{ fontFamily: "AK-Medium" }}
            >
                Your timesheet was approved.
            </Text>
        </Alert>
    );

    // return mobile friendly layout
    if (windowWidth < 800) {
        return (
            <Box>
                {/* alerts */}
                {timesheetStatus === TimesheetStatus.SUBMITTED && submittedNotificationAlert}
                {timesheetStatus === TimesheetStatus.APPROVED && approvedNotificationAlert}
                {timesheetStatus === TimesheetStatus.DENIED && deniedNotificationAlerts}

                {/* modals */}
                {timesheetChanges && (
                    <ChangeReasonModal
                        modalOpened={changeReasonModalOpened}
                        isMobile={isMobile ? true : false}
                        closeModal={closeChangeReasonModal}
                        submitClicked={handleSubmit}
                        handleReasonChange={handleReasonChanges}
                    />
                )}
                {submitTimesheetModalOpened && (
                    <SubmitTimesheetConfirmModal
                        modalOpened={submitTimesheetModalOpened}
                        isMobile={true}
                        timesheetReviewData={timesheetReviewInfo}
                        closeModal={closeSubmitTimesheetModal}
                        submitClicked={handleSubmitTimesheet}
                    //handleReasonChange={handleReasonChanges}
                    />
                )}

                {/* buttons */}
                {!user?.working_hours?.is_new_user && (
                    <Paper shadow="md" p="lg" radius="lg" mt="lg" mb="lg" style={{ background: "#24352f" }}>
                        {timesheetData && (
                            <Grid>
                                <Grid.Col span={{ base: 7 }}>
                                    <Button
                                        size="lg"
                                        radius="md"
                                        color="#324d3e"
                                        //variant="light"
                                        disabled={user?.working_hours?.is_new_user}
                                        fullWidth
                                        onClick={handleSubmittedTimeSheets}
                                    >
                                        <Text size="md" fw={600}>View timesheets</Text>
                                    </Button>
                                </Grid.Col>
                                <Grid.Col span={{ base: 5 }}>
                                    <Button
                                        size="lg"
                                        radius="md"
                                        color="#336E1E"
                                        disabled={(timesheetStatus === TimesheetStatus.APPROVED || timesheetStatus === TimesheetStatus.SUBMITTED) || timesheetData?.total_hours <= 0.01}
                                        //disabled={true}
                                        onClick={() => {
                                            handleOpenSubmitModal();
                                            //openSubmitTimesheetModal();
                                        }}
                                        //variant="light"
                                        fullWidth
                                    >
                                        <Text size="md" fw={600}>Submit</Text>
                                    </Button>
                                </Grid.Col>
                            </Grid>
                        )}

                        {!timesheetData && (
                            <Button
                                size="lg"
                                radius="md"
                                color="#324d3e"
                                //variant="light"
                                disabled={user?.working_hours?.is_new_user}
                                fullWidth
                                onClick={handleSubmittedTimeSheets}
                            >
                                <Text size="md" fw={600}>View timesheets</Text>
                            </Button>
                        )}
                        
                    </Paper>
                )}

               {/* day of week carousel */}
                {!user?.working_hours?.is_new_user && (
                    <Paper 
                        shadow="md" 
                        p="sm" 
                        style={{ background: "#24352f", color: "white", borderRadius: "20px", boxShadow: "0px 5px 10px 10px rgba(0, 0, 0, 0.20)" }} 
                        className="sticky"
                    >
                        <CarouselDayOfWeek 
                            sundayVisible={sundayVisible} 
                            saturdayVisible={saturdayVisible} 
                            activePanel={currentActivePanel} 
                            attendanceRecordData={attendanceRecordData} 
                            handlePanelChanges={handlePanelChanges}
                        />
                    </Paper>  
                )}

                <Space h="lg" />

                {/* timesheet */}
                {!user?.working_hours?.is_new_user && (
                    <TimesheetTableMobile
                        modalOpened={false}
                        isMobile={false}
                        attendanceRecordData={attendanceRecordData}
                        activePanel={currentActivePanel}
                        closeModal={closeChangeReasonModal}
                        handleOpenModal={handleOpenModal}
                        handleUpdateAttendanceRecord={handleUpdateAttendanceRecord}
                        handleDelete={handleDeleteAttendanceRecordTime}
                        handlePanelChange={handlePanelChanges}
                    />
                )}
            </Box>
        );
    }
    else {
        // regular fullscreen table
        return (
            <Box>
                {/* alerts */}
                {timesheetStatus === TimesheetStatus.SUBMITTED && submittedNotificationAlert}
                {timesheetStatus === TimesheetStatus.APPROVED && approvedNotificationAlert}
                {timesheetStatus === TimesheetStatus.DENIED && deniedNotificationAlerts}

                {/* modals */}
                {timesheetChanges && (
                    <ChangeReasonModal
                        modalOpened={changeReasonModalOpened}
                        isMobile={isMobile ? true : false}
                        closeModal={closeChangeReasonModal}
                        submitClicked={handleSubmit}
                        handleReasonChange={handleReasonChanges}
                    />
                )}
                {submitTimesheetModalOpened && (
                    <SubmitTimesheetConfirmModal
                        modalOpened={submitTimesheetModalOpened}
                        isMobile={isMobile ? true : false}
                        timesheetReviewData={timesheetReviewInfo}
                        closeModal={closeSubmitTimesheetModal}
                        submitClicked={handleSubmitTimesheet}
                    //handleReasonChange={handleReasonChanges}
                    />
                )}

                {!user?.working_hours?.is_new_user && (
                    <>
                        {/* timesheet */}
                        <TimesheetTable
                            modalOpened={false}
                            isMobile={false}
                            attendanceRecordData={attendanceRecordData}
                            timesheetStatus={timesheetStatus}
                            timesheetData={timesheetData}
                            weekendVisible={[sundayVisible, saturdayVisible]}
                            closeModal={closeChangeReasonModal}
                            handleOpenModal={handleOpenModal}
                            handleUpdateAttendanceRecord={handleUpdateAttendanceRecord}
                            handleDelete={handleDeleteAttendanceRecordTime}
                            handleSubmitButtonClicked={handleOpenSubmitModal}
                            handleViewTimesheetButtonClicked={handleSubmittedTimeSheets}
                        />
                    </>
                )}

            </Box>
        );


    }

}