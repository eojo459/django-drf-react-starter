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

// staff types 
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
    uid: string;
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
    regular_hours: number;
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

// user types
export type ChildProfile = {
    uid: string;
    business_id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
    date_of_birth: string;
    allergies: string;
    medical_info: string;
    notes: string;
    date_joined: string;
    cell_number: string;
    work_number: string;
    home_number: string;
    emergency_contact_id: string;
};

export type ChildAttendanceRecord = {
    id: string;
    business_id: string;
    child_uid: string;
    attendance_date: string;
    is_holiday: boolean;
    check_in_time: string | null;
    check_out_time: string | null;
    check_in_time_2: string | null;
    check_out_time_2: string | null;
    check_in_time_3: string | null;
    check_out_time_3: string | null;
    signed_by: string;
    total_time: number;
    day_index?: number;
}

export type ChildAttendanceData = {
    child_uid: string;
    business_id: string;
    first_name: string;
    last_name: string;
    attendance: {
        id: string;
        business_id: string;
        child_uid: string;
        attendance_date: string;
        is_holiday: boolean;
        check_in_time: string | null;
        check_out_time: string | null;
        check_in_time_2: string | null;
        check_out_time_2: string | null;
        check_in_time_3: string | null;
        check_out_time_3: string | null;
        signed_by: string;
        total_time: number;
        day_index?: number;
    }[];
};

export type TimePickerDayDepth = {
    uid: string;
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

export function Attendance() {
    const { user, business, session } = useAuth(); // logged in user
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
    const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
    const [businessId, setBusinessId] = useState<string>(business?.id ?? "");
    const [selectedWeekStartDate, setSelectedWeekStartDate] = React.useState<Dayjs | null>(null);
    const [timePickerDayDepth, setTimePickerDayDepth] = useState<TimePickerDayDepth[]>([]);
    const [businessesSelectData, setBusinessesSelectData] = useState<any[]>([]);
    const [copyMode, setCopyMode] = useState(false);
    const [copiedAttendanceTimes, setCopiedAttendanceTimes] = useState<CopiedAttendanceData | null>(null);
    const [geolocationMatch, setGeolocationMatch] = useState(false);
    const [strictMode, setStrictMode] = useState(false);
    const [geolocationMode, setGeolocationMode] = useState(false);
    const [tableHeadersWeekDay, setTableHeadersWeekDay] = useState<string[]>([]);
    const [tableHeadersDay, setTableHeadersDay] = useState<string[]>([]);
    const [dateList, setDateList] = useState<string[]>([]);
    //const containerBackground = ['#2e2f36', '#e8e9ed'];
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [newChanges, setNewChanges] = useState(false);
    const [mulitpleLocations, setMultipleLocations] = useState(false);
    const [userType, setUserType] = useState('STAFF');

    // run when component loads
    useEffect(() => {
        renderTableHeaders(); // Calculate the table headers
        //computedColorScheme == 'light' ? setStyleColor("#e8e9ed") : setStyleColor("#2e2f36");
    }, []);

    // fetch child or staff profiles, attendance & staff when user type select changes
    useEffect(() => {
        if (userType != null && userType !== "") {
            fetchUserProfilesData();
        }
    }, [userType, business]);

    // when the week or user type or business changes re-render the table headers
    useEffect(() => {
        renderTableHeaders();
        fetchAttendanceData();
    }, [selectedWeekStartDate, userType, business]);

    useEffect(() => {
        // console.log("new attendance data:");
        // console.log(attendanceData);

        // recalculate the total times for the attendance record as a whole
        updateTotalTime();
    },[attendanceData]);

    // TODO: do something with strictMode & strictModeLocation from database
    useEffect(() => {
        console.log("strict mode=" + strictMode);
        console.log("strict mode location=" + geolocationMode);
    }, [strictMode, geolocationMode]);

    // run when business changes
    useEffect(() => {
        renderTableHeaders();
    }, [business]);

    async function fetchAttendanceData() {
        if (selectedWeekStartDate != null && business?.id != null && userType != '') {
            var orderedAttendanceRecords;
            var attendanceData = null;

            // fetch attendance records
            if (userType === "STAFF") {
                orderedAttendanceRecords = await FetchStaffAttendanceRecordsForWeek(selectedWeekStartDate, business?.id, session?.access_token);
            }
            else {
                orderedAttendanceRecords = await FetchChildAttendanceRecordsForWeek(selectedWeekStartDate, business?.id, session?.access_token);
            }
            if (orderedAttendanceRecords !== undefined && orderedAttendanceRecords != null && orderedAttendanceRecords.length > 0) {
                setAttendanceRecords(orderedAttendanceRecords);
            }
            
            // combine records to create attendance data per person
            if (userType === "STAFF") {
                attendanceData = await combineData(orderedAttendanceRecords, selectedWeekStartDate, staffProfiles, userType, session?.access_token);
            }
            else {
                attendanceData = await combineData(orderedAttendanceRecords, selectedWeekStartDate, childProfiles, userType, session?.access_token);
            }

            if (attendanceData != undefined && attendanceData != null && attendanceData.length > 0) {
                //attendanceData[0].type = userType == "USER" ? "USER" : "STAFF";
                setAttendanceData(attendanceData);
                setTimePickerDayDepth(initializeShowDefaultTimePickers(attendanceData));
            }
        }
    };
    
    async function fetchUserProfilesData() {
        if (!business) return;

        switch(userType) {
            case "STAFF":
                var staffProfilesLocal = await getStaffInBusinessId(business?.id, session?.access_token);
                setStaffProfiles(staffProfilesLocal);
                break;
            case "USER":
                var childProfilesLocal = await getChildInBusinessId(business?.id, session?.access_token);
                setChildProfiles(childProfilesLocal);
                break;
            default:
                break;
        }
    };

    async function fetchData() {
        // find logged in users id (staff_id or owner_id)
        if (user) {
            var role = user.role;
            switch(role) {
                case "OWNER":
                    // find the businesses they own
                    var businessesLocal = await getBusinessByOwnerId(user?.uid, session?.access_token);
                    setBusinesses(businessesLocal);
                    if (businessesLocal?.length === 1) {
                        var businessId = businessesLocal[0].id;
                        setBusinessId(businessId);
                        handleBusinessIdChange(businessId);
                    }
                    else if (businessesLocal?.length > 1) {
                        // TODO: display business dropdown & allow switching between multiple businesses
                        setMultipleLocations(true);
                    }
                    break;
                case "STAFF":
                    // find business they are linked to
                    var businessId = await getStaffBusinessId(user?.uid, session?.access_token);
                    if (businessId.length <= 0) {
                        return;
                    }
                    setBusinessId(businessId);
                    handleBusinessIdChange(businessId);
                    
                    // TODO: display business dropdown & allow switching between multiple businesses
                    break;
                default:
                    return;
            }
        }
    };

    // update the attendance total time when attendance changes
    function updateTotalTime() {
        const updatedData = attendanceData.map(record => {
            const totalTime = record.attendance.reduce((sum, attendanceRecord) => sum + attendanceRecord.total_time, 0);
            return { ...record, total_time: totalTime };
        });
        setAttendanceData(updatedData);
    };

    function handleSelectedUserChange(selectedUser: string) {
        if (selectedUser != null && selectedUser !== '') {
            setUserType(selectedUser);
        }
    }

    function getTimeDepth(attendanceId: string) {
        if (attendanceId != '-1') {
            return 1;
        }
        else {
            return 0;
        }
    }

    function initializeShowDefaultTimePickers(attendanceData: AttendanceData[]) {
        let initialShowDefaultTimePicker: TimePickerDayDepth;
        let timeDepthArr: number[] = [];
        let showDefaultTimePickerArray: TimePickerDayDepth[] = [];
    
        // for each person
        for (const person of attendanceData) {
            const attendanceRecord = person.attendance;

            let timeDepth = 0;
            for (const record of attendanceRecord) {
                timeDepthArr[timeDepth] = getTimeDepth(record.id);
                timeDepth++;
            }

            initialShowDefaultTimePicker = {
                uid: person.uid,
                business_id: person.business_id,
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
        //console.log("Time picker array:");
        //console.log(showDefaultTimePickerArray);
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
        //let currentDay = selectedWeekStartDate.clone().startOf('week'); // start on sunday
        
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
    const handleAttendanceRecordChange = (updatedRecord: AttendanceRecord) => {
        //console.log("Attendance data before update:");
        //console.log(attendanceData);
        setAttendanceData(prevAttendanceData => {
            return prevAttendanceData.map(data => {
                if (data.uid == updatedRecord.uid) {
                    // calculate total_time for all records
                    let total_time_calc = data.attendance.reduce((accumulator, record) => {
                        return accumulator + parseFloat(record.total_time.toString());
                    }, 0);

                    return {
                        ...data,
                        attendance: data.attendance.map(record => {
                            if (record.attendance_date === updatedRecord.attendance_date) {
                                return {
                                    ...record,
                                    ...updatedRecord // Update the record with new data
                                };
                            }
                            return record;
                        }),
                        total_time: Math.round(total_time_calc * 4) / 4
                    };
                }
                return data;
            });
        });
    };
    
    

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
            {business && (
                <AtendanceTableHeaderControl
                    newChanges={newChanges}
                    personAttendanceData={attendanceData}
                    businessId={business?.id}
                    multipleLocations={mulitpleLocations}
                    handleBusinessIdChange={handleBusinessIdChange}
                    handleWeekChange={handleWeekChange}
                    handleSelectedUserChange={handleSelectedUserChange}
                />
            )}
            
            {/* <div style={{ margin: '10px 0' }}></div> */}
            {/* spacing */}
            <Space h="md" />
            {/* Attendance table */}
            <AttendanceTable
                personProfiles={userType == "USER" ? childProfiles : staffProfiles}
                personType={userType}
                personAttendanceData={attendanceData}
                tableHeadersWeekDay={tableHeadersWeekDay}
                tableHeadersDay={tableHeadersDay}
                dateList={dateList}
                copyMode={copyMode}
                copiedAttendanceTimes={copiedAttendanceTimes}
                isUserAtLocation={geolocationMatch}
                strictMode={strictMode}
                strictModeLocation={geolocationMode}
                handleAttendanceRecordChange={handleAttendanceRecordChange}
                handleCopyModeChange={handleCopyModeChange}
                handleCopiedTimeChange={handleCopiedTimeChange}
                handleNewChanges={handleNewChanges}
            />
        </>
    );

}