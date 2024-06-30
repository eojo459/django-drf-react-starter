import React, { useContext, useEffect, useState } from 'react';
import { API_ROUTES } from '../../../apiRoutes';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { AttendanceData, AttendanceRecord, AttendanceTable } from '../../../components/AttendanceTable';
import { Text, Button, Paper, Grid, TextInput, Textarea, Select, Avatar, Container, Table, ActionIcon, useComputedColorScheme, Space } from '@mantine/core';
import { IconBuildingStore, IconChevronLeft, IconChevronRight, IconTrash, IconUser, IconUserCircle, IconUserSquareRounded } from '@tabler/icons-react';
import { Calendar, DatePicker, DatePickerInput, DatesRangeValue, getStartOfWeek } from '@mantine/dates';
//import "../../css/AttendanceTable.scss";
import { calculateTotalDurationInHours } from '../../../helpers/TotalTimeCalculation';
import { combineData, orderChildAttendance } from '../../../helpers/Helpers';
import { AtendanceTableHeaderControl } from '../../../components/AttendanceTableHeader';
import { FetchChildAttendanceRecordsForWeek, FetchStaffAttendanceRecordsForWeek, getBusinessByOwnerId, getChildInBusinessId, getStaffInBusinessId, getStaffBusinessId, getUserById } from '../../../helpers/Api';
import { AuthContext } from '../../../authentication/AuthContext';
import { useAuth } from '../../../authentication/SupabaseAuthContext';
import { ChildAttendanceData } from '../child/Attendance';

export type StaffProfile = {
    business_id: string;
    uid: string;
    username: string;
    first_name: string;
    last_name: string;
    position: string;
    level: number;
    cell_number: string;
    work_number: string;
    home_number: string;
    email: string;
    emergency_contact_id: string;
    notes: string;
};


export type StaffAttendanceRecord = {
    id: string;
    business_id: string;
    staff_uid: string;
    attendance_date: string;
    is_holiday: boolean;
    check_in_time: string | null;
    check_out_time: string | null;
    check_in_time_2: string | null;
    check_out_time_2: string | null;
    check_in_time_3: string | null;
    check_out_time_3: string | null;
    break_in_time: string | null;
    break_out_time: string | null;
    break_in_time_2: string | null;
    break_out_time_2: string | null;
    break_in_time_3: string | null;
    break_out_time_3: string | null;
    overtime_hours: number;
    vacation_hours: number;
    holiday_hours: number;
    unpaid_hours: number;
    other_paid_hours: number;
    signed_by: string;
    total_time: number;
    day_index?: number;
}

export type StaffAttendanceData = {
    staff_uid: string;
    business_id: string;
    first_name: string;
    last_name: string;
    attendance: StaffAttendanceRecord[];
};

export type TimePickerDayDepth = {
    staff_uid: string;
    business_id: string;
    day_indexs: boolean[];
    time_depths: number[];
};

export type CopiedAttendanceData = {
    checkInTime: string;
    checkOutTime: string;
};

// check if we have childAttendanceData[] or staffAttendanceData[]
function isStaffAttendanceArray(attendanceData: ChildAttendanceData[] | StaffAttendanceData[]): attendanceData is StaffAttendanceData[] {
    return (attendanceData as StaffAttendanceData[])[0]?.staff_uid !== undefined;
}

function StaffAttendance() {
    //let {authTokens, user}: any = useContext(AuthContext);
    const { user, session } = useAuth();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);
    const [staffAttendanceRecords, setStaffAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [staffAttendanceData, setStaffAttendanceData] = useState<AttendanceData[]>([]);
    const [businessId, setBusinessId] = useState<string>('');
    const [selectedWeekStartDate, setSelectedWeekStartDate] = React.useState<Dayjs | null>(null);
    const [timePickerDayDepth, setTimePickerDayDepth] = useState<TimePickerDayDepth[]>([]);
    const [businessesSelectData, setBusinessesSelectData] = useState<any[]>([]);
    const [staffSelectData, setStaffSelectData] = useState<any[]>([]);
    const [weekValue, setWeekValue] = useState<Date | null>(null);
    const [hovered, setHovered] = useState<Date | null>(null);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [copyMode, setCopyMode] = useState(false);
    const [copiedAttendanceTimes, setCopiedAttendanceTimes] = useState<CopiedAttendanceData | null>(null);
    const [geolocationMatch, setGeolocationMatch] = useState(false);
    const [strictMode, setStrictMode] = useState(false);
    const [strictModeLocation, setStrictModeLocation] = useState(false);
    const [tableHeadersWeekDay, setTableHeadersWeekDay] = useState<string[]>([]);
    const [tableHeadersDay, setTableHeadersDay] = useState<string[]>([]);
    const [dateList, setDateList] = useState<string[]>([]);
    //const containerBackground = ['#2e2f36', '#e8e9ed'];
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [selectedBusinessModel, setSelectedBusinessModel] = useState({
        business_id: '',
        business_name: ''
    });
    const [staffs, setStaffs] = useState<StaffProfile[]>([]);
    const [selectedStaffModel, setSelectedStaffModel] = useState({
        staff_id: '',
        first_name: '',
        last_name: ''
    });
    const [styleColor, setStyleColor] = useState('');
    const [newChanges, setNewChanges] = useState(false);
    const [mulitpleLocations, setMultipleLocations] = useState(false);

    // run when component loads
    useEffect(() => {
        const fetchData = async () => {
            // find user id (staff_id or owner_id)
            if (user) {
                var role = user.role;
                switch(role) {
                    case "OWNER":
                        // find the businesses they own
                        var businessesLocal = await getBusinessByOwnerId(user?.uid, session?.access_token);
                        setBusinesses(businessesLocal);
                        if (businessesLocal?.length == 1) {
                            var businessId = businessesLocal[0].id;
                            setBusinessId(businessId);
                            handleBusinessIdChange(businessId);
                        }
                        else if (businessesLocal?.length > 1) {
                            // display business dropdown
                            setMultipleLocations(true);
                        }
                        break;
                    case "STAFF":
                        // find business they are linked to
                        var businessId = await getStaffBusinessId(user?.uid, session?.access_token);
                        setBusinessId(businessId);
                        handleBusinessIdChange(businessId);
                        break;
                    default:
                        return;
                }
            }
        };
        fetchData();
        renderTableHeaders(); // Calculate the table headers
        //computedColorScheme == 'light' ? setStyleColor("#e8e9ed") : setStyleColor("#2e2f36");
    }, []);

    // fetch staff profiles, attendance & staff when businessId changes
    useEffect(() => {
        if (businessId != null && businessId != "") {
            const fetchData = async () => {
                var staffProfilesLocal = await getStaffInBusinessId(businessId, session?.access_token);
                setStaffProfiles(staffProfilesLocal);
            };
            fetchData();
        }
    }, [businessId]);

    // when the week changes re-render the table headers
    useEffect(() => {
        const fetchData = async () => {
            if (selectedWeekStartDate != null && businessId != null) {
                const orderedAttendanceRecords = await FetchStaffAttendanceRecordsForWeek(selectedWeekStartDate, businessId, session?.access_token);
                setStaffAttendanceRecords(orderedAttendanceRecords);
                // var attendanceData = await combineData(orderedAttendanceRecords, selectedWeekStartDate, session?.access_token);
                // if (attendanceData != undefined && attendanceData != null) {
                //     attendanceData[0].type = "STAFF";
                //     setStaffAttendanceData(attendanceData);
                //     setTimePickerDayDepth(initializeShowDefaultTimePickers(attendanceData));
                // }
            }
        };
        renderTableHeaders();
        fetchData();
    }, [selectedWeekStartDate]);

    // TODO: do something with strictMode & strictModeLocation from database
    useEffect(() => {
        console.log("strict mode=" + strictMode);
        console.log("strict mode location=" + strictModeLocation);
    }, [strictMode, strictModeLocation]);

    function getTimeDepth(attendanceId: string) {
        if (attendanceId != '-1') {
            return 1;
        }
        else {
            return 0;
        }
    }

    function initializeShowDefaultTimePickers(staffAttendanceData: AttendanceData[]) {
        let initialShowDefaultTimePicker: TimePickerDayDepth;
        let timeDepthArr: number[] = [];
        let showDefaultTimePickerArray: TimePickerDayDepth[] = [];
        
        // for each child
        for (const staff of staffAttendanceData) {
            const attendanceRecord = staff.attendance;

            let timeDepth = 0;
            for (const record of attendanceRecord) {
                timeDepthArr[timeDepth] = getTimeDepth(record.id);
                timeDepth++;
            }

            initialShowDefaultTimePicker = {
                staff_uid: staff.uid,
                business_id: staff.business_id,
                day_indexs: [
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                ],
                time_depths: [
                    timeDepthArr[0],
                    timeDepthArr[1],
                    timeDepthArr[2],
                    timeDepthArr[3],
                    timeDepthArr[4],
                    timeDepthArr[5],
                    timeDepthArr[6],
                ],
            };
            showDefaultTimePickerArray.push(initialShowDefaultTimePicker);
        }
        return showDefaultTimePickerArray;
    }
      
    // Render table headers with days of the week (monday - sunday)
    
    const renderTableHeaders = () => {
        if (!selectedWeekStartDate) {
            return [];
        }
        const dateList: string[] = [];
        const headersWeekDay: string[] = [];
        const headersDay: string[] = [];
        let currentDay = selectedWeekStartDate.clone().startOf('week').add(1, 'day'); // start on monday
        for (let i = 0; i < 7; i++) {
            //console.log("current day=" + currentDay.format('YYYY-MM-DD'));
            dateList.push(currentDay.format('YYYY-MM-DD'));
            headersWeekDay.push(currentDay.format('ddd, MMM'));
            headersDay.push(currentDay.format('D'));
            currentDay = currentDay.add(1, 'day');
        }
        setTableHeadersWeekDay(headersWeekDay);
        setTableHeadersDay(headersDay);
        setDateList(dateList);
        return;
    };

    // get any attendance changes from the DayTimePicker
    function handleAttendanceDataChange(updatedData: AttendanceData[]) {
        console.log("Parent received updated data for data records:", updatedData);
        setStaffAttendanceData(updatedData);
    }

    // get the copy mode changes from the DayTimePicker
    function handleCopyModeChange(copyMode: boolean) {
        console.log("Parent received updated copy mode:", copyMode);
        setCopyMode(copyMode);
    }

    // get the copied attendance changes from the DayTimePicker
    function handleCopiedTimeChange(copiedTime: CopiedAttendanceData) {
        console.log("Parent received updated copied times:", copiedTime);
        setCopiedAttendanceTimes(copiedTime);
    }

    // get the copy mode changes from the DayTimePicker
    function handleWeekChange(startDate: Dayjs) {
        console.log("Parent received updated start date:", startDate);
        setNewChanges(false);
        setSelectedWeekStartDate(startDate);
    }

    // get the business id changes from the DayTimePicker
    function handleBusinessIdChange(businessUid: string) {
        console.log("Parent received updated business id:", businessUid);
        setBusinessId(businessUid);
    }

    // get the new changes from the DayTimePicker
    function handleNewChanges(changes: boolean) {
        console.log("Parent received updated copy mode:", changes);
        setNewChanges(changes);
    }

    // const tableHeaders = renderTableHeaders(); // Calculate the table headers
    // const containerBackground = ['#2e2f36', '#e8e9ed'];
    // let styleColor = "";
    //computedColorScheme == 'light' ? styleColor = "#e8e9ed" : styleColor = "#2e2f36";

    return (
        <>
            {/* <AtendanceTableHeaderControl
                handleWeekChange={handleWeekChange}
                newChanges={newChanges}
                handleBusinessIdChange={handleBusinessIdChange}
                personAttendanceData={staffAttendanceData}
                businessId={businessId}
                multipleLocations={mulitpleLocations}
            /> */}
            {/* <div style={{ margin: '10px 0' }}></div> */}
            {/* spacing */}
            <Space h="md" />
            {/* Attendance table */}
            {/* <AttendanceTable
                personProfiles={staffProfiles}
                personType='Staff'
                personAttendanceData={staffAttendanceData}
                tableHeadersWeekDay={tableHeadersWeekDay}
                tableHeadersDay={tableHeadersDay}
                dateList={dateList}
                copyMode={copyMode}
                copiedAttendanceTimes={copiedAttendanceTimes}
                isUserAtLocation={geolocationMatch}
                strictMode={strictMode}
                strictModeLocation={strictModeLocation}
                handleAttendanceRecordChange={handleAttendanceDataChange}
                handleCopyModeChange={handleCopyModeChange}
                handleCopiedTimeChange={handleCopiedTimeChange}
                handleNewChanges={handleNewChanges}
            //handleWeekChange={handleWeekChange}
            //handleBusinessIdChange={handleBusinessIdChange}
            /> */}
        </>
    );

}

export {StaffAttendance, isStaffAttendanceArray};