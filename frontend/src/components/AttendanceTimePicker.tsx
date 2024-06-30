import React, { ChangeEvent, RefObject, StrictMode, useContext, useEffect, useRef, useState } from 'react';
import { ChildAttendanceRecord, ChildAttendanceData, TimePickerDayDepth, CopiedAttendanceData } from '../pages/owner-dashboard/child/Attendance';
import 'rc-time-picker/assets/index.css';
import { Text, Button, Paper, Grid, TextInput, Textarea, Select, Avatar, Container, Table, ActionIcon, rem, Highlight, getBreakpointValue, Popover, Group, useComputedColorScheme, Tooltip, Stack, Space } from '@mantine/core';
import { IconSquareX, IconClock, IconTrash, IconCopy, IconClipboard, IconCircleXFilled, IconX, IconEdit } from '@tabler/icons-react';
import { ConfirmDeleteAttendanceModal } from './ConfirmModal';
import { SelectAsync } from './TimeInputSelect';
import { getValidCurrentTime, getValidTimePeriod } from '../helpers/TimeGenerator';
import "../css/AttendanceTimePicker.scss";
import { calculateTotalDurationInHours } from '../helpers/TotalTimeCalculation';
import classes from '../css/AttendanceTimePicker.module.scss';
import inputClasses from "../css/TextInput.module.css";
import { formatTime, splitTime } from '../helpers/Helpers';
import zIndex from '@mui/material/styles/zIndex';
import { useMediaQuery } from '@mantine/hooks';
import { StaffAttendanceData } from '../pages/owner-dashboard/staff/StaffAttendance';
import { AttendanceData, AttendanceRecord } from './AttendanceTable';

// data passed to this child component
interface TimePickerProps {
    personAttendanceRecord: AttendanceRecord;
    personId: string;
    date: string;
    copyMode: boolean;
    copiedAttendanceTimes: CopiedAttendanceData | null;
    isUserAtLocation: boolean;
    strictMode: boolean;
    strictModeLocation: boolean;
    handleAttendanceRecordChange: (updatedData: AttendanceRecord) => void; // handle attendance record changes
    handleCopyModeChange: (copyMode: boolean) => void; // handle copy mode changes
    handleCopiedTimeChange: (copiedData: CopiedAttendanceData) => void; // handle the copied values
    handleNewChanges: (changes: boolean) => void; // handle new changes
}

// handle changes for check in time
const handleChangeCheckInTime = (newCheckInTime: string | null, personId: string, date: string, timeIndex: number, attendanceRecord: AttendanceRecord) => {
    //let staffData = attendanceRecord.find(record => record.uid == personId);
    //attendanceRecord = staffData?.find((record: { uid: string; attendance_date: string; }) => record.uid == personId && record.attendance_date == date);
    
    if (attendanceRecord != null) {
        var checkOutTime;

        switch(timeIndex) {
            case 1:
                checkOutTime = attendanceRecord ? attendanceRecord.check_out_time : null;
                return updateAttendance(newCheckInTime, checkOutTime, timeIndex, attendanceRecord);
            case 2:
                checkOutTime = attendanceRecord ? attendanceRecord.check_out_time_2 : null;
                return updateAttendance(newCheckInTime, checkOutTime, timeIndex, attendanceRecord);;
            case 3:
                checkOutTime = attendanceRecord ? attendanceRecord.check_out_time_3 : null;
                return updateAttendance(newCheckInTime, checkOutTime, timeIndex, attendanceRecord);;
            default:
                return;
        }
    }
};

// handle changes for check out time
const handleChangeCheckOutTime = (newCheckOutTime: string | null, personId: string, date: string, timeIndex: number, attendanceRecord: AttendanceRecord) => {
    if (attendanceRecord != null) {
        var checkInTime;

        switch(timeIndex) {
            case 1:
                checkInTime = attendanceRecord ? attendanceRecord.check_in_time : null;
                return updateAttendance(checkInTime, newCheckOutTime, timeIndex, attendanceRecord);
            case 2:
                checkInTime = attendanceRecord ? attendanceRecord.check_in_time_2 : null;
                return updateAttendance(checkInTime, newCheckOutTime, timeIndex, attendanceRecord);
            case 3:
                checkInTime = attendanceRecord ? attendanceRecord.check_in_time_3 : null;
                return updateAttendance(checkInTime, newCheckOutTime, timeIndex, attendanceRecord);
            default:
                return;
        }
    }
};

// update the attendance records when changes are made
const updateAttendance = (newCheckInTime: string | null, newCheckOutTime: string | null, 
    timeIndex: number, attendanceRecord: AttendanceRecord) => {
    //const updatedAttendanceData = [...attendanceData]; // make a copy
    const updatedAttendanceRecord = attendanceRecord;
    
    if (updatedAttendanceRecord != undefined && updatedAttendanceRecord != null) {
        // record was found
        let checkIn: string | null, checkOut: string | null;
        let checkIn2: string | null, checkOut2: string | null;
        let checkIn3: string | null, checkOut3: string | null;
        switch(timeIndex) {
            case 1:
                if (newCheckInTime != null){
                    updatedAttendanceRecord.check_in_time = newCheckInTime;
                }
                if (newCheckOutTime != null) {
                    updatedAttendanceRecord.check_out_time = newCheckOutTime;
                }
                checkIn = updatedAttendanceRecord.check_in_time;
                checkOut = updatedAttendanceRecord.check_out_time;
                if (checkIn && checkOut) {
                    let recordEntry: string[] = [];
                    recordEntry.push(checkIn);
                    recordEntry.push(checkOut);
                    updatedAttendanceRecord.total_time = 0;
                    updatedAttendanceRecord.total_time = calculateTotalDurationInHours(recordEntry, 1);
                }
                else {
                    updatedAttendanceRecord.total_time = 0;
                }
                return updatedAttendanceRecord;
            case 2:
                if (newCheckInTime != null){
                    updatedAttendanceRecord.check_in_time_2 = newCheckInTime;
                }

                if (newCheckOutTime != null) {
                    updatedAttendanceRecord.check_out_time_2 = newCheckOutTime;
                }
                checkIn = updatedAttendanceRecord.check_in_time;
                checkOut = updatedAttendanceRecord.check_out_time;
                checkIn2 = updatedAttendanceRecord.check_in_time_2;
                checkOut2 = updatedAttendanceRecord.check_out_time_2;

                // update total time
                if ((checkIn && checkOut) && (checkIn2 && checkOut2)) {
                    let recordEntry: string[] = [];
                    recordEntry.push(checkIn);
                    recordEntry.push(checkOut);
                    recordEntry.push(checkIn2);
                    recordEntry.push(checkOut2);
                    updatedAttendanceRecord.total_time = 0;
                    updatedAttendanceRecord.total_time = calculateTotalDurationInHours(recordEntry, 2);
                }
                else if (checkIn && checkOut) {
                    let recordEntry: string[] = [];
                    recordEntry.push(checkIn);
                    recordEntry.push(checkOut);
                    updatedAttendanceRecord.total_time = 0;
                    updatedAttendanceRecord.total_time = calculateTotalDurationInHours(recordEntry, 1);
                }
                else {
                    updatedAttendanceRecord.total_time = 0;
                }
                return updatedAttendanceRecord;
            case 3:
                if (newCheckInTime != null){
                    updatedAttendanceRecord.check_in_time_3 = newCheckInTime;
                }

                if (newCheckOutTime != null) {
                    updatedAttendanceRecord.check_out_time_3 = newCheckOutTime;
                }
                checkIn = updatedAttendanceRecord.check_in_time;
                checkOut = updatedAttendanceRecord.check_out_time;
                checkIn2 = updatedAttendanceRecord.check_in_time_2;
                checkOut2 = updatedAttendanceRecord.check_out_time_2;
                checkIn3 = updatedAttendanceRecord.check_in_time_3;
                checkOut3 = updatedAttendanceRecord.check_out_time_3;

                // update total time
                if ((checkIn && checkOut) && (checkIn2 && checkOut2) && (checkIn3 && checkOut3)) {
                    let recordEntry: string[] = [];
                    recordEntry.push(checkIn);
                    recordEntry.push(checkOut);
                    recordEntry.push(checkIn2);
                    recordEntry.push(checkOut2);
                    recordEntry.push(checkIn3);
                    recordEntry.push(checkOut3);
                    updatedAttendanceRecord.total_time = 0;
                    updatedAttendanceRecord.total_time = calculateTotalDurationInHours(recordEntry, 3);
                }
                else if ((checkIn && checkOut) && (checkIn2 && checkOut2)) {
                    let recordEntry: string[] = [];
                    recordEntry.push(checkIn);
                    recordEntry.push(checkOut);
                    recordEntry.push(checkIn2);
                    recordEntry.push(checkOut2);
                    updatedAttendanceRecord.total_time = 0;
                    updatedAttendanceRecord.total_time = calculateTotalDurationInHours(recordEntry, 2);
                }
                else if (checkIn && checkOut) {
                    let recordEntry: string[] = [];
                    recordEntry.push(checkIn);
                    recordEntry.push(checkOut);
                    updatedAttendanceRecord.total_time = 0;
                    updatedAttendanceRecord.total_time = calculateTotalDurationInHours(recordEntry, 1);
                }
                else {
                    updatedAttendanceRecord.total_time = 0;
                }

                return updatedAttendanceRecord; 
            default:
                return;
        }
    }

    // return updated data to parent
    return updatedAttendanceRecord;
};

function DayTimePicker(props: TimePickerProps) {
    // states
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const [clickCount, setClickCount] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isHovered2, setIsHovered2] = useState(false);
    const [isHovered3, setIsHovered3] = useState(false);
    const [attendanceTimes, setAttendanceTimes] = useState({
        check_in_time: '',
        check_out_time: '',
        check_in_time_2: '',
        check_out_time_2: '',
        check_in_time_3: '',
        check_out_time_3: '',
        break_in_time: '',
        break_out_time: '',
        break_in_time_2: '',
        break_out_time_2: '',
        break_in_time_3: '',
        break_out_time_3: '',
    });
    const [depth, setDepth] = useState(0);
    const [confirmModalVisibleD1, setConfirmModalVisibleD1] = useState(false);
    const [confirmModalVisibleD2, setConfirmModalVisibleD2] = useState(false);
    const [confirmModalVisibleD3, setConfirmModalVisibleD3] = useState(false);
    const [popoverOpenD1In, setPopoverOpenD1In] = useState(false);
    const [popoverOpenD1Out, setPopoverOpenD1Out] = useState(false);
    const [popoverOpenD2In, setPopoverOpenD2In] = useState(false);
    const [popoverOpenD2Out, setPopoverOpenD2Out] = useState(false);
    const [popoverOpenD3In, setPopoverOpenD3In] = useState(false);
    const [popoverOpenD3Out, setPopoverOpenD3Out] = useState(false);
    const [popoverContent, setPopoverContent] = useState<React.ReactNode | null>(null);
    const [displayTimePicker, setDisplayTimePicker] = useState(false);
    const [timePickerError, setTimePickerError] = useState(false);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [isStaffAttendance, setIsStaffAttendance] = useState(false);

    // setup prop variables
    const personId = props.personId;
    const date = props.date;
    //const personAttendanceData = props.personAttendanceRecord;
    //let selectedAttendanceData;
    const personAttendanceRecordProp = props.personAttendanceRecord;
    let total_time = 0;
    //selectedAttendanceData = personAttendanceData.find(record => record.uid == personId);
    //selectedAttendanceRecord = selectedAttendanceData?.attendance.find((record: { uid: string; attendance_date: string; }) => record.uid == personId && record.attendance_date == date);
    if (personAttendanceRecordProp?.total_time) {
        total_time = personAttendanceRecordProp?.total_time;
    } 

    const copyMode = props.copyMode;
    const copiedAttendanceTimes = props.copiedAttendanceTimes;
    const isUserAtLocation = props.isUserAtLocation;
    const strictMode = props.strictMode;
    const strictModeLocation = props.strictModeLocation;
    const handleAttendanceRecordChange = props.handleAttendanceRecordChange;
    const handleCopyModeChange = props.handleCopyModeChange;
    const handleCopiedTimeChange = props.handleCopiedTimeChange;
    const handleNewChanges = props.handleNewChanges;

    // setup check in/out times
    let checkInTime = personAttendanceRecordProp?.check_in_time ? personAttendanceRecordProp?.check_in_time : null;
    let checkOutTime = personAttendanceRecordProp?.check_out_time ? personAttendanceRecordProp?.check_out_time : null;
    let checkInTime2 = personAttendanceRecordProp?.check_in_time_2 ? personAttendanceRecordProp?.check_in_time_2 : null;
    let checkOutTime2 = personAttendanceRecordProp?.check_out_time_2 ? personAttendanceRecordProp?.check_out_time_2 : null;
    let checkInTime3 = personAttendanceRecordProp?.check_in_time_3 ? personAttendanceRecordProp?.check_in_time_3 : null;
    let checkOutTime3 = personAttendanceRecordProp?.check_out_time_3 ? personAttendanceRecordProp?.check_out_time_3 : null;
    let breakInTime = personAttendanceRecordProp?.break_in_time ? personAttendanceRecordProp?.break_in_time : null;
    let breakOutTime = personAttendanceRecordProp?.break_out_time ? personAttendanceRecordProp?.break_out_time : null;
    let breakInTime2 = personAttendanceRecordProp?.break_in_time_2 ? personAttendanceRecordProp?.break_in_time_2 : null;
    let breakOutTime2 = personAttendanceRecordProp?.break_out_time_2 ? personAttendanceRecordProp?.break_out_time_2 : null;
    let breakInTime3 = personAttendanceRecordProp?.break_in_time_3 ? personAttendanceRecordProp?.break_in_time_3 : null;
    let breakOutTime3 = personAttendanceRecordProp?.break_out_time_3 ? personAttendanceRecordProp?.break_out_time_3 : null;

    // run on component load
    useEffect(() => {
        checkStrictMode();
        console.log(props);
    }, []);

    // Reset clickCount when the date prop changes
    useEffect(() => {
        setClickCount(0);
    }, [date]);

    // check strict mode when strict mode/location changes
    useEffect(() => {
        checkStrictMode();
    }, [strictMode, strictModeLocation]);

    // handle the showing of the time pickers when the date changes/data refreshes
    useEffect(() => {
        let initialClickCount = clickCount; // save old click count
        setClickCount(0);
    
        if (checkInTime !== null && checkInTime !== undefined) {
            if (initialClickCount < 2) {
                initialClickCount = 1;
            }
            if (checkInTime2 !== null && checkInTime2 !== undefined) {
                if (initialClickCount < 3) {
                    initialClickCount = 2;
                }
            }
            if (checkInTime3 !== null && checkInTime3 !== undefined) {
                initialClickCount = 3;
            }
            setClickCount(initialClickCount);
        }
    
        setAttendanceTimes({
            check_in_time: checkInTime !== null ? checkInTime : '',
            check_out_time: checkOutTime !== null ? checkOutTime : '',
            check_in_time_2: checkInTime2 !== null ? checkInTime2 : '',
            check_out_time_2: checkOutTime2 !== null ? checkOutTime2 : '',
            check_in_time_3: checkInTime3 !== null ? checkInTime3 : '',
            check_out_time_3: checkOutTime3 !== null ? checkOutTime3 : '',
            break_in_time: breakInTime !== null ? breakInTime : '',
            break_out_time: breakOutTime !== null ? breakOutTime : '',
            break_in_time_2: breakInTime2 !== null ? breakInTime2 : '',
            break_out_time_2: breakOutTime2 !== null ? breakOutTime2 : '',
            break_in_time_3: breakInTime3 !== null ? breakInTime3 : '',
            break_out_time_3: breakOutTime3 !== null ? breakOutTime3 : '',
        });
        
    }, [checkInTime, checkOutTime, checkInTime2, checkOutTime2, checkInTime3, checkOutTime3]);

    // update attendance times when depth changes
    useEffect(() => {
        updateAttendanceTimes(depth);
    }, [depth]);

    // handle 'add time' button click
    const handleButtonClick = () => {
        if (clickCount < 3) {
            setClickCount(clickCount + 1);
        }
    };

    // handle setting the attendance type
    function handleAttendanceType(value: boolean) {
        if (value) {
            setIsStaffAttendance(true);
        }
        else {
            setIsStaffAttendance(false);
        }
    }

    // handle changes when check in/check out changes
    function handleTimeChanges(personId : string, date: string, timeIndex: number, timeType: number, newCheckInOutTimeRawInput?: ChangeEvent<HTMLInputElement>, newCheckInOutTimeFormat?: string | null) {
        let newCheckInOutTimeStr;
        let value;
        if (newCheckInOutTimeFormat !== undefined) {
            newCheckInOutTimeStr = newCheckInOutTimeFormat;
        }
        else if (newCheckInOutTimeRawInput !== undefined) {
            value = newCheckInOutTimeRawInput.target.value;
            newCheckInOutTimeStr = value.toString();
        }

        if (personAttendanceRecordProp !== undefined && newCheckInOutTimeStr !== undefined) {
            //console.log(newCheckInOutTimeRawInput);
            let updatedChildAttendanceRecord: AttendanceRecord;
            let handleResult = null;

            if (timeType == 0) {
                // update check in
                handleResult = handleChangeCheckInTime(newCheckInOutTimeStr, personId, date, timeIndex, personAttendanceRecordProp);
                if (handleResult) {
                    updatedChildAttendanceRecord = handleResult;
                    // pass new attendance data back to parent
                    handleAttendanceRecordChange(updatedChildAttendanceRecord);

                    // signal there was a change
                    handleNewChanges(true);
                }
            }
            else {
                // update check out
                handleResult = handleChangeCheckOutTime(newCheckInOutTimeStr, personId, date, timeIndex, personAttendanceRecordProp);
                if (handleResult) {
                    updatedChildAttendanceRecord = handleResult;
                    // pass new attendance data back to parent
                    handleAttendanceRecordChange(updatedChildAttendanceRecord);

                    // signal there was a change
                    handleNewChanges(true);
                }
            }
        }
    }

    // handler for copy
    const handleCopyTimes = (attendanceTimes: {
        check_in_time: string, check_out_time: string, 
        check_in_time_2: string, check_out_time_2: string,
        check_in_time_3: string, check_out_time_3: string
    }, depth: number) => {
        if (attendanceTimes.check_in_time != null && attendanceTimes.check_out_time != null) {
            let checkInTime = "";
            let checkOutTime = "";

            switch(depth) {
                case 1:
                    checkInTime = attendanceTimes.check_in_time;
                    checkOutTime = attendanceTimes.check_out_time;
                    break;
                case 2:
                    checkInTime = attendanceTimes.check_in_time_2;
                    checkOutTime = attendanceTimes.check_out_time_2;
                    break;
                case 3:
                    checkInTime = attendanceTimes.check_in_time_3;
                    checkOutTime = attendanceTimes.check_out_time_3;
                    break;
                default:
                    break;
            }
            
            // allow copy if data is not null/empty
            if (checkInTime !== "" && checkOutTime !== "" && checkInTime !== null && checkOutTime !== null) {
                handleCopyModeChange(true);
                let copiedData: CopiedAttendanceData = {
                    checkInTime: checkInTime, 
                    checkOutTime: checkOutTime
                }
                handleCopiedTimeChange(copiedData);
            }
        }
    };

    // handler for paste
    const handlePasteTimes = (copiedData: CopiedAttendanceData | null, depth: number, date: string) => {
        if (copiedData != null) {
            switch(depth) {
                case 1:
                    setAttendanceTimes(prev => ({ 
                        ...prev, 
                        check_in_time: copiedData.checkInTime,
                        check_out_time: copiedData.checkOutTime
                    }));
                    handleTimeChanges(personId, date, 1, 0, undefined, copiedData.checkInTime);
                    handleTimeChanges(personId, date, 1, 1, undefined, copiedData.checkOutTime);
                    break;
                case 2:
                    setAttendanceTimes(prev => ({ 
                        ...prev, 
                        check_in_time_2: copiedData.checkInTime,
                        check_out_time_2: copiedData.checkOutTime
                    }));
                    handleTimeChanges(personId, date, 2, 0, undefined, copiedData.checkInTime);
                    handleTimeChanges(personId, date, 2, 1, undefined, copiedData.checkOutTime);
                    break;
                case 3:
                    setAttendanceTimes(prev => ({ 
                        ...prev, 
                        check_in_time_3: copiedData.checkInTime,
                        check_out_time_3: copiedData.checkOutTime
                    }));
                    handleTimeChanges(personId, date, 3, 0, undefined, copiedData.checkInTime);
                    handleTimeChanges(personId, date, 3, 1, undefined, copiedData.checkOutTime);
                    break;
            }
            handleCopyModeChange(false);
        }
    };

    // update the times when times get deleted
    const updateAttendanceTimes = (depth: number) => {
        setAttendanceTimes((prevAttendanceTimes) => {
            // Create a copy of the previous state to avoid modifying it directly
            const newAttendanceTimes = { ...prevAttendanceTimes };
    
            // Clear the data for the specified depth
            switch (depth) {
                case 1:
                    // move check_in_time_2 to check_in_time
                    newAttendanceTimes.check_in_time = prevAttendanceTimes.check_in_time_2;
                    newAttendanceTimes.check_out_time = prevAttendanceTimes.check_out_time_2;

                    // move check_in_time_3 to check_in_time_2
                    newAttendanceTimes.check_in_time_2 = prevAttendanceTimes.check_in_time_3;
                    newAttendanceTimes.check_out_time_2 = prevAttendanceTimes.check_out_time_3;
                    newAttendanceTimes.check_in_time_3 =  '';
                    newAttendanceTimes.check_out_time_3 = '';
                    break;
                case 2:
                    // move check_in_time_3 to check_in_time_2
                    newAttendanceTimes.check_in_time_2 = prevAttendanceTimes.check_in_time_3;
                    newAttendanceTimes.check_out_time_2 = prevAttendanceTimes.check_out_time_3;
                    newAttendanceTimes.check_in_time_3 = '';
                    newAttendanceTimes.check_out_time_3 = '';
                    break;
                case 3:
                    newAttendanceTimes.check_in_time_3 = '';
                    newAttendanceTimes.check_out_time_3 = '';
                    break;
                default:
                    break;
            }
            return newAttendanceTimes;
        });

        // update the time changes after delete
        switch(depth) {
            case 1:
                handleTimeChanges(personId, date, 1, 0, undefined, attendanceTimes.check_in_time_2);
                handleTimeChanges(personId, date, 1, 1, undefined, attendanceTimes.check_out_time_2);
                handleTimeChanges(personId, date, 2, 0, undefined, attendanceTimes.check_in_time_3);
                handleTimeChanges(personId, date, 2, 1, undefined, attendanceTimes.check_out_time_3);
                handleTimeChanges(personId, date, 3, 0, undefined, "");
                handleTimeChanges(personId, date, 3, 1, undefined, "");
                break;
            case 2:
                handleTimeChanges(personId, date, 2, 0, undefined, attendanceTimes.check_in_time_3);
                handleTimeChanges(personId, date, 2, 1, undefined, attendanceTimes.check_out_time_3);
                handleTimeChanges(personId, date, 3, 0, undefined, "");
                handleTimeChanges(personId, date, 3, 1, undefined, "");
                break;
            case 3:
                handleTimeChanges(personId, date, 3, 0, undefined, "");
                handleTimeChanges(personId, date, 3, 1, undefined, "");
                break;
            default:
                break;
        }
        
        setDepth(0);
    }
    
    // handler for delete button
    const handleDeleteButtonClick = (depth: number) => {
        setDepth(depth);
        setClickCount((prevClickCount) => prevClickCount - 1);
    };

    // handler for confirm modal
    const handleDeleteConfirm = (confirm: boolean, depth: number) => {
        switch(depth) {
            case 1:
                setConfirmModalVisibleD1(false);
                break;
            case 2:
                setConfirmModalVisibleD2(false);
                break;
            case 3:
                setConfirmModalVisibleD3(false);
                break;
            default:
                break;
        }
        if (confirm) {
            handleDeleteButtonClick(depth);
        }
    };

    // handle which buttons should be rendered based on copyMode state
    const copyPasteMode = (copyMode: boolean, depth: number) => {
        if (!copyMode) {
            // copy button
            if (displayTimePicker) {
                return (
                    <Button 
                        size="compact-md" 
                        variant="light"
                        //className="copy-responsive"
                        fullWidth
                        onClick={() => handleCopyTimes(attendanceTimes, depth)}
                    >
                        <IconCopy></IconCopy>
                    </Button>
                );
            }
            else {
                return (
                    <Button 
                        size="compact-md" 
                        variant="light"
                        //className="copy-responsive"
                        fullWidth
                        disabled
                    >
                        <IconCopy></IconCopy>
                    </Button>
                );
            }  
        }
        else {
            // paste and cancel button
            return (
                <>
                    <Button.Group>
                        <Button 
                            size="compact-md" 
                            variant="light"
                            className="copy-responsive"
                            //fullWidth
                            color="rgba(117, 115, 113, 1)"
                            onClick={() => handleCopyModeChange(false)}
                        >
                            <IconX></IconX>
                        </Button>
                        <Button 
                            size="compact-md" 
                            className="copy-responsive"
                            //fullWidth
                            color="rgba(57,192,104,255)"
                            onClick={() => handlePasteTimes(copiedAttendanceTimes, depth, date)}
                        >
                            <IconClipboard></IconClipboard>
                        </Button>
                    </Button.Group>      
                </>
            );
        }
    }

    // handle the changes in the popover
    function handlePopoverChange(timeType: number, timeIndex: number, value: string) {
        let [hourMinute, amPm] = value.split(" "); // HH:MM A
        var timeSplit = hourMinute.split(":"); // HH:MM
        let hoursInt = Number(timeSplit[0]);
        let minutes = timeSplit[1];
        let newTime = "";

        // rebuild the string combining all parts and convert into HH:MM:SS
        if (amPm == 'PM' && hoursInt < 12) {
            hoursInt = hoursInt + 12; // convert to 24 hours
        }

        // check if '12:-- AM' => convert to 00:MM:00 (12:-- AM) instead of 12:MM:00 (12:-- PM)
        if (amPm == 'AM' && hoursInt == 12) {
            newTime = "00:" + minutes + ":00"; // 00:MM:00
        }
        else {
            newTime = hoursInt + ":" + minutes + ":00"; // HH:MM:00
        }
        //console.log("NEw time= " + newTime);
        handleTimeChanges(personId, date, timeIndex, timeType, undefined, newTime);
    }

    // handle the visibility of the popover 
    function handlePopoverOpen(opened: boolean, timeType: number, timeIndex: number) {
        switch(timeIndex) {
            case 1:
                // depth 1
                switch(timeType) {
                    case 0:
                        // check in
                        setPopoverOpenD1In(opened);
                        break;
                    case 1:
                        // check out
                        setPopoverOpenD1Out(opened);
                        break;
                    default:
                        break;
                }
                break;
            case 2:
                // depth 2
                switch(timeType) {
                    case 0:
                        // check in
                        setPopoverOpenD2In(opened);
                        break;
                    case 1:
                        // check out
                        setPopoverOpenD2Out(opened);
                        break;
                    default:
                        break;
                }
                break;
            case 3:
                // depth 3
                switch(timeType) {
                    case 0:
                        // check in
                        setPopoverOpenD3In(opened);
                        break;
                    case 1:
                        // check out
                        setPopoverOpenD3Out(opened);
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

    // add delay to on hover
    const handleMouseEnter = (depth: number) => {
        // Set a timeout to delay calling setIsHovered3(true) by 500 milliseconds (adjust as needed)
        setTimeout(() => {
            switch(depth) {
                case 1:
                    setIsHovered(true);
                    return;
                case 2:
                    setIsHovered2(true);
                    return;
                case 3:
                    setIsHovered3(true);
                    return;
                default:
                    return;
            }
        }, 100);
    };

    const handleMouseLeave = (depth: number) => {
        // Set a timeout to delay calling setIsHovered3(false) by 500 milliseconds (adjust as needed)
        setTimeout(() => {
            switch(depth) {
                case 1:
                    setIsHovered(false);
                    //setPopoverOpenD1In(false); // hide poperver
                    //setPopoverOpenD1Out(false);
                    return;
                case 2:
                    setIsHovered2(false);
                    //setPopoverOpenD2In(false);
                    //setPopoverOpenD2Out(false);
                    return;
                case 3:
                    setIsHovered3(false);
                    //setPopoverOpenD3In(false);
                    //setPopoverOpenD3Out(false);
                    return;
                default:
                    return;
            }
        }, 100);
    };

    // determine popover content based on strictMode enabled or not
    function checkStrictMode(): void {
        if ((strictModeLocation && isUserAtLocation) || !strictModeLocation) {
            if (!strictModeLocation) {
                console.log("Show time picker -- default");
            }
            else {
                // owner enabled strict mode with location
                console.log("Show time picker -- at location");
            }
            setDisplayTimePicker(true);
            setTimePickerError(false);
        }
        else if (strictModeLocation && !isUserAtLocation){
            console.log("Hide time picker -- not at location");
            setDisplayTimePicker(false);
            setTimePickerError(false);
        }
        else {
            console.log("Show time picker -- error");
            setDisplayTimePicker(false);
            setTimePickerError(true);
        }
    }

    // display this if user is not at the location
    const notAtLocationPopover = (
        <Grid style={{ display:"flex", justifyContent:"center", alignItems:"center"}}>
            <Grid.Col span={12}>
                <Text>Your manager has enabled location strict mode.</Text>
                <Text>You must be onsite in order to modify the time entry.</Text>
            </Grid.Col>
        </Grid>
    );

    // display this if there was an error
    const timePickerErrorPopover = (
        <Grid style={{ display:"flex", justifyContent:"center", alignItems:"center"}}>
            <Grid.Col span={12}>
                <Text>There was an error. Please try again.</Text>
            </Grid.Col>
        </Grid>
    );

    // display time pickers & add time buttons
    return (
        <div>
            {/* check in/out depth 0 */}
            {clickCount == 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {isMobile && (
                        <Button 
                            variant="subtle"
                            color="#4a8a2a"
                            size="md"
                            radius="md"
                            fullWidth
                            onClick={() => handleButtonClick()}
                        >
                            + Add Time
                        </Button>
                    )}
                    {!isMobile && (
                        <Button 
                            variant="subtle"
                            color="#4a8a2a"
                            size="md"
                            radius="md"
                            style={{ maxWidth: "150px"}}
                            onClick={() => handleButtonClick()}
                        >
                            + Add Time
                        </Button>
                    )}
                </div>
            )}

            {/* check in/out depth 1 */}
            {clickCount >= 1 && (
                <>
                    <div
                        onMouseEnter={() => handleMouseEnter(1)}
                        onMouseLeave={() => handleMouseLeave(1)}
                    >
                        {/* time inputs */}
                        <div style={{backgroundColor: isHovered ? "rgba(50, 77, 62, 0.2)" : "", padding:"10px 10px 20px 10px", borderRadius: "5px"}}> 
                            {/* <input id="check-in-time" type="time" name="check-in-time" min="12:00" max="18:00" />*/}
                            <Popover 
                                opened={popoverOpenD1In} 
                                onChange={setPopoverOpenD1In}
                                width={300} 
                                position="bottom" 
                                withArrow 
                                shadow="md"
                                arrowSize={10}
                                radius="sm"
                            >

                                {/* parent of popover */}
                                <Popover.Target>
                                    <Grid>
                                        <Grid.Col span={12}>
                                            <Text size='sm'>Check in</Text>
                                            {isHovered && (
                                                <Button.Group>
                                                    <Button
                                                        className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                                        classNames={classes}
                                                        disabled
                                                        fullWidth
                                                        justify="left"
                                                        radius="sm"
                                                    >
                                                        {formatTime(attendanceTimes.check_in_time)}
                                                    </Button>
                                                    {displayTimePicker && (
                                                        <ActionIcon
                                                            size="lg"
                                                            radius="sm"
                                                            color="#4a8a2a"
                                                            onClick={() => setPopoverOpenD1In(true)}
                                                        >
                                                            <IconEdit style={{ width: rem(18) }}/>  
                                                        </ActionIcon>
                                                    )}
                                                    {!displayTimePicker && (
                                                        <Tooltip 
                                                            label="Strict mode enabled."
                                                            multiline
                                                        >
                                                            <ActionIcon
                                                                size="lg"
                                                                radius="sm"
                                                                color="#4a8a2a"
                                                                disabled
                                                            >
                                                                <IconEdit style={{ width: rem(18) }}/>  
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        
                                                    )}
                                                    
                                                </Button.Group>
                                            )}
                                            {!isHovered && (
                                                <Button
                                                    className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                                    disabled
                                                    fullWidth
                                                    justify="left"
                                                >
                                                    {formatTime(attendanceTimes.check_in_time)}
                                                </Button>
                                            )}
                                        </Grid.Col>
                                    </Grid>
                                </Popover.Target>
                                
                                {/* popover content */}
                                <Popover.Dropdown p="md" style={{ backgroundColor: "#182420", border: "transparent", borderRadius: "15px"}}>
                                    {/* display time picker if user is at location OR strict mode is disabled */}
                                    {displayTimePicker && (
                                        <Grid style={{ display:"flex", justifyContent:"center", alignItems:"center"}}>
                                            <Grid.Col span={12}>
                                                <SelectAsync
                                                    data-autofocus
                                                    hoursData={splitTime(checkInTime, 'hours')}
                                                    minutesData={splitTime(checkInTime, 'minutes')}
                                                    periodData={splitTime(checkInTime, 'period')}
                                                    timeIndex={1}
                                                    timeType={0}
                                                    strictMode={strictMode}
                                                    //strictModeLocation={strictModeLocation}
                                                    handlePopoverChange={(timeType, timeIndex, value) => handlePopoverChange(timeType, timeIndex, value)}
                                                    handlePopoverOpened={(opened, timeType, timeIndex) => handlePopoverOpen(opened, timeType, timeIndex)}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    )}
                                    {(!displayTimePicker && !isUserAtLocation) && notAtLocationPopover}
                                    {(!displayTimePicker && timePickerError) && timePickerErrorPopover}
                                </Popover.Dropdown>
                            </Popover>
                            {/* <TimeInputSelect/>  */}
                            <Popover 
                                opened={popoverOpenD1Out} 
                                onChange={setPopoverOpenD1Out}
                                width={300} 
                                position="bottom" 
                                withArrow 
                                shadow="md"
                                arrowSize={8}
                                radius="sm"
                            >
                                {/* parent of popover */}
                                <Popover.Target>
                                    <Grid>
                                        <Grid.Col span={12}>
                                            <Text size='sm'>Check out</Text>
                                            {isHovered && (
                                                <Button.Group>
                                                    <Button
                                                        className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                                        classNames={classes}
                                                        disabled
                                                        fullWidth
                                                        justify="left"
                                                        radius="sm"
                                                    >
                                                        {formatTime(attendanceTimes.check_out_time)}
                                                    </Button>
                                                    <ActionIcon
                                                        size="lg"
                                                        radius="sm"
                                                        color="#4a8a2a"
                                                        onClick={() => setPopoverOpenD1Out(true)}
                                                        //style={{border:"4px solid", borderColor: "#eceff11a"}}
                                                    >
                                                        <IconEdit style={{ width: rem(18) }}/>  
                                                    </ActionIcon>
                                                </Button.Group>
                                            )}
                                            {!isHovered && (
                                                <Button
                                                    className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                                    disabled
                                                    fullWidth
                                                    justify="left"
                                                >
                                                    {formatTime(attendanceTimes.check_out_time)}
                                                </Button>
                                            )}
                                        </Grid.Col>
                                    </Grid>
                                </Popover.Target>
                                
                                {/* popover content */}
                                <Popover.Dropdown p="md" style={{ backgroundColor: "#182420", border: "transparent", borderRadius: "15px"}}>
                                    {displayTimePicker && (
                                        <Grid style={{ display:"flex", justifyContent:"center", alignItems:"center"}}>
                                            <Grid.Col span={12}>
                                                <SelectAsync
                                                    data-autofocus
                                                    hoursData={splitTime(checkOutTime, 'hours')}
                                                    minutesData={splitTime(checkOutTime, 'minutes')}
                                                    periodData={splitTime(checkOutTime, 'period')}
                                                    timeIndex={1}
                                                    timeType={1}
                                                    strictMode={strictMode}
                                                    //strictModeLocation={strictModeLocation}
                                                    handlePopoverChange={(timeType, timeIndex, value) => handlePopoverChange(timeType, timeIndex, value)}
                                                    handlePopoverOpened={(opened, timeType, timeIndex) => handlePopoverOpen(opened, timeType, timeIndex)}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    )}
                                    {(!displayTimePicker && !isUserAtLocation) && notAtLocationPopover}
                                    {(!displayTimePicker && timePickerError) && timePickerErrorPopover}
                                </Popover.Dropdown>
                            </Popover>
                        </div>
                        {/* <div style={{ margin: '10px 0' }}></div> spacing */}
                        <Space h="xs"/>
                        {/* buttons */}
                        {isHovered && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {/* delete button */}
                                    <Button 
                                        color="red" 
                                        variant="light"
                                        size="compact-md" 
                                        style={{ marginRight: "10px" }} 
                                        fullWidth
                                        onClick={() => setConfirmModalVisibleD1(true)}
                                    >
                                        <IconTrash></IconTrash>
                                    </Button>

                                    {/* copy or paste button */}
                                    {copyPasteMode(copyMode, 1)}
                                </div>
                                <div style={{ margin: '20px 0' }}></div> {/* spacing */}
                            </>
                        )}
                    </div>

                    {/* add time button */}
                    {clickCount < 2 && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {isMobile && (
                                    <Button
                                        variant="subtle"
                                        color="#4a8a2a"
                                        size="md"
                                        radius="md"
                                        fullWidth
                                        onClick={() => handleButtonClick()}
                                    >
                                        + Add Time
                                    </Button>
                                )}
                                {!isMobile && (
                                    <Button
                                        variant="subtle"
                                        color="#4a8a2a"
                                        size="md"
                                        radius="md"
                                        style={{ maxWidth: "150px" }}
                                        onClick={() => handleButtonClick()}
                                    >
                                        + Add Time
                                    </Button>
                                )}
                            </div>
                            <div style={{ margin: '10px 0' }}></div> {/* spacing */}
                            <div>
                                <Paper p="md" style={{backgroundColor: "#25352f"}}>
                                    <Group justify="center">
                                        {/* <Text ta="left" size="lg" fw="bold">Total:</Text> */}
                                        <Text size="lg" fw="bold">{total_time} h</Text>
                                    </Group>
                                </Paper>
                            </div>
                        </>
                    )}

                    {/* modal to confirm delete */}
                    {confirmModalVisibleD1 && (
                        <ConfirmDeleteAttendanceModal 
                            onDeleteConfirm={handleDeleteConfirm} 
                            depth={1} 
                        />
                    )}
                </>
            )}

            {/* check in/out depth 2 */}
            {clickCount >= 2 && (
                <>
                    <div 
                        onMouseEnter={() => handleMouseEnter(2)}
                        onMouseLeave={() => handleMouseLeave(2)}
                    >
                        {/* time inputs */}
                        <div style={{backgroundColor: isHovered2 ? "rgba(50, 77, 62, 0.2)" : "", padding:"10px 10px 20px 10px", borderRadius: "5px"}}> 
                        <Popover 
                                opened={popoverOpenD2In} 
                                onChange={setPopoverOpenD2In}
                                width={300} 
                                position="bottom" 
                                withArrow 
                                shadow="md"
                                arrowSize={8}
                                radius="sm"
                            >

                                {/* parent of popover */}
                                <Popover.Target>
                                    <Grid>
                                        <Grid.Col span={12}>
                                            <Text size='sm'>Check in</Text>
                                            {isHovered2 && (
                                                <Button.Group>
                                                    <Button
                                                        className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                                        classNames={classes}
                                                        disabled
                                                        fullWidth
                                                        justify="left"
                                                        radius="sm"
                                                    >
                                                        {formatTime(attendanceTimes.check_in_time_2)}
                                                    </Button>
                                                    <ActionIcon
                                                        size="lg"
                                                        radius="sm"
                                                        color="#4a8a2a"
                                                        onClick={() => setPopoverOpenD2In(true)}
                                                    >
                                                        <IconEdit style={{ width: rem(18) }}/>  
                                                    </ActionIcon>
                                                </Button.Group>
                                            )}
                                            {!isHovered2 && (
                                                <Button
                                                    className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                                    disabled
                                                    fullWidth
                                                    justify="left"
                                                >
                                                    {formatTime(attendanceTimes.check_in_time_2)}
                                                </Button>
                                            )}
                                        </Grid.Col>
                                    </Grid>
                                </Popover.Target>
                                
                                {/* popover content */}
                                <Popover.Dropdown p="md" style={{ backgroundColor: "#182420", border: "transparent", borderRadius: "15px"}}>
                                    {displayTimePicker && (
                                        <Grid style={{ display:"flex", justifyContent:"center", alignItems:"center"}}>
                                            <Grid.Col span={12}>
                                                <SelectAsync
                                                    data-autofocus
                                                    hoursData={splitTime(checkInTime2, 'hours')}
                                                    minutesData={splitTime(checkInTime2, 'minutes')}
                                                    periodData={splitTime(checkInTime2, 'period')}
                                                    timeIndex={2}
                                                    timeType={0}
                                                    strictMode={strictMode}
                                                    //strictModeLocation={strictModeLocation}
                                                    handlePopoverChange={(timeType, timeIndex, value) => handlePopoverChange(timeType, timeIndex, value)}
                                                    handlePopoverOpened={(opened, timeType, timeIndex) => handlePopoverOpen(opened, timeType, timeIndex)}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    )}
                                    {(!displayTimePicker && !isUserAtLocation) && notAtLocationPopover}
                                    {(!displayTimePicker && timePickerError) && timePickerErrorPopover}
                                </Popover.Dropdown>
                            </Popover>
                            <Popover 
                                opened={popoverOpenD2Out} 
                                onChange={setPopoverOpenD2Out}
                                width={300} 
                                position="bottom" 
                                withArrow 
                                shadow="md"
                                arrowSize={8}
                                radius="sm"
                            >

                                {/* parent of popover */}
                                <Popover.Target>
                                    <Grid>
                                        <Grid.Col span={12}>
                                            <Text size='sm'>Check out</Text>
                                            {isHovered2 && (
                                                <Button.Group>
                                                    <Button
                                                        className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                                        classNames={classes}
                                                        disabled
                                                        fullWidth
                                                        justify="left"
                                                        radius="sm"
                                                    >
                                                        {formatTime(attendanceTimes.check_out_time_2)}
                                                    </Button>
                                                    <ActionIcon
                                                        size="lg"
                                                        radius="sm"
                                                        color="#4a8a2a"
                                                        onClick={() => setPopoverOpenD2Out(true)}
                                                    >
                                                        <IconEdit style={{ width: rem(18) }}/>  
                                                    </ActionIcon>
                                                </Button.Group>
                                            )}
                                            {!isHovered2 && (
                                                <Button
                                                    className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                                    disabled
                                                    fullWidth
                                                    justify="left"
                                                >
                                                    {formatTime(attendanceTimes.check_out_time_2)}
                                                </Button>
                                            )}
                                        </Grid.Col>
                                    </Grid>
                                </Popover.Target>
                                
                                {/* popover content */}
                                <Popover.Dropdown p="md" style={{ backgroundColor: "#182420", border: "transparent", borderRadius: "15px"}}>
                                    {displayTimePicker && (
                                        <Grid style={{ display:"flex", justifyContent:"center", alignItems:"center"}}>
                                            <Grid.Col span={12}>
                                                <SelectAsync
                                                    data-autofocus
                                                    hoursData={splitTime(checkOutTime2, 'hours')}
                                                    minutesData={splitTime(checkOutTime2, 'minutes')}
                                                    periodData={splitTime(checkOutTime2, 'period')}
                                                    timeIndex={2}
                                                    timeType={1}
                                                    strictMode={strictMode}
                                                    //strictModeLocation={strictModeLocation}
                                                    handlePopoverChange={(timeType, timeIndex, value) => handlePopoverChange(timeType, timeIndex, value)}
                                                    handlePopoverOpened={(opened, timeType, timeIndex) => handlePopoverOpen(opened, timeType, timeIndex)}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    )}
                                    {(!displayTimePicker && !isUserAtLocation) && notAtLocationPopover}
                                    {(!displayTimePicker && timePickerError) && timePickerErrorPopover}
                                </Popover.Dropdown>
                            </Popover>
                        </div>
                        <Space h="xs"/>
                        {/* buttons */}
                        {isHovered2 && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {/* delete button */}
                                    <Button 
                                        color="red" 
                                        variant="light"
                                        size="compact-md" 
                                        style={{ marginRight: "10px" }} 
                                        fullWidth
                                        onClick={() => setConfirmModalVisibleD2(true)}
                                    >
                                        <IconTrash></IconTrash>
                                    </Button>

                                    {/* copy or paste button */}
                                    {copyPasteMode(copyMode, 2)}
                                </div>
                                <div style={{ margin: '20px 0' }}></div> {/* spacing */}
                            </>
                        )}
                    </div>
                    
                    {/* add time button */}
                    {clickCount < 3 && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {isMobile && (
                                    <Button
                                        variant="subtle"
                                        color="#4a8a2a"
                                        size="md"
                                        radius="md"
                                        fullWidth
                                        onClick={() => handleButtonClick()}
                                    >
                                        + Add Time
                                    </Button>
                                )}
                                {!isMobile && (
                                    <Button
                                        variant="subtle"
                                        color="#4a8a2a"
                                        size="md"
                                        radius="md"
                                        style={{ maxWidth: "150px" }}
                                        onClick={() => handleButtonClick()}
                                    >
                                        + Add Time
                                    </Button>
                                )}
                            </div>
                            <div style={{ margin: '10px 0' }}></div> {/* spacing */}
                            <div>
                                <Paper p="md" style={{backgroundColor: "#25352f"}}>
                                    <Group justify="center">
                                        {/* <Text ta="left" size="lg" fw="bold">Total:</Text> */}
                                        <Text size="lg" fw="bold">{total_time} h</Text>
                                    </Group>
                                </Paper>
                            </div>
                        </>
                    )}

                    {/* modal to confirm delete */}
                    {confirmModalVisibleD2 && (
                        <ConfirmDeleteAttendanceModal 
                            onDeleteConfirm={handleDeleteConfirm} 
                            depth={2} 
                        />
                    )}
                </>
            )}

            {/* check in/out depth 3 */}
            {clickCount == 3 && (
                <>
                    <div 
                        onMouseEnter={() => handleMouseEnter(3)}
                        onMouseLeave={() => handleMouseLeave(3)}
                    >
                        {/* time inputs */}
                        <div style={{backgroundColor: isHovered3 ? "rgba(50, 77, 62, 0.2)" : "", padding:"10px 10px 20px 10px", marginBottom:"10px", borderRadius: "5px"}}>   
                        <Popover 
                            opened={popoverOpenD3In} 
                            onChange={setPopoverOpenD3In}
                            width={300} 
                            position="bottom" 
                            withArrow 
                            shadow="md"
                            arrowSize={8}
                            radius="sm"
                        >

                            {/* parent of popover */}
                            <Popover.Target>
                                <Grid>
                                    <Grid.Col span={12}>
                                        <Text size='sm'>Check in</Text>
                                        {isHovered3 && (
                                            <Button.Group>
                                                <Button
                                                    className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                                    classNames={classes}
                                                    disabled
                                                    fullWidth
                                                    justify="left"
                                                    radius="sm"
                                                >
                                                    {formatTime(attendanceTimes.check_in_time_3)}
                                                </Button>
                                                <ActionIcon
                                                    size="lg"
                                                    radius="sm"
                                                    color="#4a8a2a"
                                                    onClick={() => setPopoverOpenD3In(true)}
                                                >
                                                    <IconEdit style={{ width: rem(18) }}/>  
                                                </ActionIcon>
                                            </Button.Group>
                                        )}
                                        {!isHovered3 && (
                                            <Button
                                                className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                                disabled
                                                fullWidth
                                                justify="left"
                                            >
                                                {formatTime(attendanceTimes.check_in_time_3)}
                                            </Button>
                                        )}
                                    </Grid.Col>
                                </Grid>
                            </Popover.Target>
                            
                            {/* popover content */}
                            <Popover.Dropdown p="md" style={{ backgroundColor: "#182420", border: "transparent", borderRadius: "15px"}}>
                                {displayTimePicker && (
                                    <Grid style={{ display:"flex", justifyContent:"center", alignItems:"center"}}>
                                        <Grid.Col span={12}>
                                            <SelectAsync
                                                data-autofocus
                                                hoursData={splitTime(checkInTime3, 'hours')}
                                                minutesData={splitTime(checkInTime3, 'minutes')}
                                                periodData={splitTime(checkInTime3, 'period')}
                                                timeIndex={3}
                                                timeType={0}
                                                strictMode={strictMode}
                                                //strictModeLocation={strictModeLocation}
                                                handlePopoverChange={(timeType, timeIndex, value) => handlePopoverChange(timeType, timeIndex, value)}
                                                handlePopoverOpened={(opened, timeType, timeIndex) => handlePopoverOpen(opened, timeType, timeIndex)}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                )}
                                {(!displayTimePicker && !isUserAtLocation) && notAtLocationPopover}
                                {(!displayTimePicker && timePickerError) && timePickerErrorPopover}
                            </Popover.Dropdown>
                        </Popover>
                        <Popover 
                            opened={popoverOpenD3Out} 
                            onChange={setPopoverOpenD3Out}
                            width={300} 
                            position="bottom" 
                            withArrow 
                            shadow="md"
                            arrowSize={8}
                            radius="sm"
                        >

                            {/* parent of popover */}
                            <Popover.Target>
                                <Grid>
                                    <Grid.Col span={12}>
                                        <Text size='sm'>Check out</Text>
                                        {isHovered3 && (
                                            <Button.Group>
                                                <Button
                                                    className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                                    classNames={classes}
                                                    disabled
                                                    fullWidth
                                                    justify="left"
                                                    radius="sm"
                                                >
                                                    {formatTime(attendanceTimes.check_out_time_3)}
                                                </Button>
                                                <ActionIcon
                                                    size="lg"
                                                    radius="sm"
                                                    color="#4a8a2a"
                                                    onClick={() => setPopoverOpenD3Out(true)}
                                                >
                                                    <IconEdit style={{ width: rem(18) }}/>  
                                                </ActionIcon>
                                            </Button.Group>
                                        )}
                                        {!isHovered3 && (
                                            <Button
                                                className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                                disabled
                                                fullWidth
                                                justify="left"
                                            >
                                                {formatTime(attendanceTimes.check_out_time_3)}
                                            </Button>
                                        )}
                                    </Grid.Col>
                                </Grid>
                            </Popover.Target>
                            
                            {/* popover content */}
                            <Popover.Dropdown p="md" style={{ backgroundColor: "#182420", border: "transparent", borderRadius: "15px"}}>
                                {displayTimePicker && (
                                    <Grid style={{ display:"flex", justifyContent:"center", alignItems:"center"}}>
                                        <Grid.Col span={12}>
                                            <SelectAsync
                                                data-autofocus
                                                hoursData={splitTime(checkOutTime3, 'hours')}
                                                minutesData={splitTime(checkOutTime3, 'minutes')}
                                                periodData={splitTime(checkOutTime3, 'period')}
                                                timeIndex={3}
                                                timeType={1}
                                                strictMode={strictMode}
                                                //strictModeLocation={strictModeLocation}
                                                handlePopoverChange={(timeType, timeIndex, value) => handlePopoverChange(timeType, timeIndex, value)}
                                                handlePopoverOpened={(opened, timeType, timeIndex) => handlePopoverOpen(opened, timeType, timeIndex)}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                )}
                                {(!displayTimePicker && !isUserAtLocation) && notAtLocationPopover}
                                {(!displayTimePicker && timePickerError) && timePickerErrorPopover}
                            </Popover.Dropdown>
                        </Popover>
                    </div>
                    <div style={{ margin: '10px 0' }}></div> {/* spacing */}

                        {/* buttons */}
                        {isHovered3 && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {/* delete button */}
                                    <Button 
                                        color="red" 
                                        variant="light"
                                        size="compact-md" 
                                        style={{ marginRight: "10px" }} 
                                        fullWidth
                                        onClick={() => setConfirmModalVisibleD3(true)}
                                    >
                                        <IconTrash></IconTrash>
                                    </Button>

                                    {/* copy or paste button */}
                                    {copyPasteMode(copyMode, 3)}
                                </div>
                                <div style={{ margin: '20px 0' }}></div> {/* spacing */}
                            </>
                        )}
                    </div>

                    <div style={{ margin: '10px 0' }}></div> {/* spacing */}

                    {clickCount == 3 && (
                        <div>
                            <Paper p="md" style={{backgroundColor: "#25352f"}}>
                                <Group justify="center">
                                    {/* <Text ta="left" size="lg" fw="bold">Total:</Text> */}
                                    <Text size="lg" fw="bold">{total_time} h</Text>
                                </Group>
                            </Paper>
                        </div>
                    )}

                    {/* modal to confirm delete */}
                    {confirmModalVisibleD3 && (
                        <ConfirmDeleteAttendanceModal 
                            onDeleteConfirm={handleDeleteConfirm} 
                            depth={3} 
                        />
                    )}
                </>
            )}
        </div>
    );
}


export {DayTimePicker};