import { ActionIcon, Avatar, Badge, Button, Grid, Group, Loader, Menu, Modal, Paper, Popover, Select, Space, Stack, Table, Text, TextInput, Title, rem } from '@mantine/core';
import { useEffect, useState } from 'react';
import { GetUserInfoByUid, getUserById, saveAttendanceRecords } from '../helpers/Api';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { ProfileHeader } from './ProfileHeader';
import { UserProfileModel } from './UserProfile';
import { ProfilePanel } from './ProfilePanel';
import classes from "../css/UserProfileModal.module.css";
import textClasses from "../css/TextInput.module.css";
import { TimesheetDataReview } from '../pages/staff-dashboard/timesheet';
import timepickerClasses from '../css/AttendanceTimePicker.module.scss';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { TimeStatus, formatPopoverTime, formatTime, getActivityColor, getStatusDescriptionPersonal, getStatusName, splitTime } from '../helpers/Helpers';
import { timeTypeData } from '../helpers/SelectData';
import { SelectAsync } from './TimeInputSelect';
import { StaffAttendanceRecord } from '../pages/owner-dashboard/child/Attendance';
//import { getStatusColor } from '../../../helpers/Helpers';

interface AddNewTimeModal {
    modalOpened: boolean;
    isMobile: boolean;
    timeData: string | null;
    timeIndex: number;
    statusType: number;
    attendanceRecord: StaffAttendanceRecord;
    addOrEdit: string;
    closeModal: () => void;
    submitClicked: () => void;
    handleAttendanceRecordChange: (updatedAttendanceRecord: StaffAttendanceRecord) => void;
}

export default function AddNewTimeModal(props: AddNewTimeModal) {
    const { user, session } = useAuth(); 
    const [ userData, setUserData ] = useState<UserProfileModel | null>(null);
    const [ loading, setLoading ] = useState(false);
    const [selectedStatusTypeData, setSelectedStatusTypeData] = useState<string | null>('');
    const [selectedStatusText, setSelectedStatusText] = useState('');
    const [selectedStatusDescription, setSelectedStatusDescription] = useState('');
    const [popoverOpenD1In, setPopoverOpenD1In] = useState(false);
    const [popoverOpenD1Out, setPopoverOpenD1Out] = useState(false);
    const [popoverOpenD2In, setPopoverOpenD2In] = useState(false);
    const [popoverOpenD2Out, setPopoverOpenD2Out] = useState(false);
    const [popoverOpenD3In, setPopoverOpenD3In] = useState(false);
    const [popoverOpenD3Out, setPopoverOpenD3Out] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
    const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState<StaffAttendanceRecord>();
    const [timeData, setTimeData] = useState<string | null>('');
    const [newTimeData, setNewTimeData] = useState<string | null>('');
    const [statusType, setStatusType] = useState(0);
    const [displayTimePicker, setDisplayTimePicker] = useState(true);
    //const [selectedTime]
    
    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const timeDataProp = props.timeData;
    const statusTypeProp = props.statusType;
    const addOrEditProp = props.addOrEdit;
    const timeIndexProp = props.timeIndex;
    const attendanceRecordProp = props.attendanceRecord;
    const handleSubmitClickedProp = props.submitClicked;
    const closeModalProp = props.closeModal;
    const handleAttendanceRecordChangeProp = props.handleAttendanceRecordChange;

    useEffect(() => {
        if (statusTypeProp > 0) {
            switch(statusTypeProp) {
                case 1:
                    // out
                    setSelectedStatusTypeData('1');
                    break;
                case 2:
                    // in
                    setSelectedStatusTypeData('2');
                    break;
                case 3:
                    // break start
                    setSelectedStatusTypeData('3');
                    break;
                case 4:
                    // break end
                    setSelectedStatusTypeData('4');
            }
        }
    },[statusTypeProp]);


    useEffect(() => {
        if (statusTypeProp > 0) {
            setSelectedStatusTypeData(statusTypeProp.toString());
        }
        if (timeIndexProp > 0) {
            setSelectedTimeIndex(timeIndexProp);
        }
        if (attendanceRecordProp) {
            setSelectedAttendanceRecord(attendanceRecordProp);
        }
        if (timeDataProp) {
            //setTimeData(timeDataProp);
            setNewTimeData(timeDataProp);
        }
    },[]);

    useEffect(() => {
        if (selectedStatusTypeData) {
            setSelectedStatusText(getStatusName(Number(selectedStatusTypeData)));
            setSelectedStatusDescription(getStatusDescriptionPersonal(Number(selectedStatusTypeData)));
        }
    },[selectedStatusTypeData]);

    function handlePopoverChange(statusType: number, timeIndex: number, value: string) {
        if (selectedStatusTypeData && selectedTimeIndex && selectedAttendanceRecord) {
            var newTime = formatPopoverTime(value);
            var updatedAttendanceRecord = selectedAttendanceRecord;
            switch(Number(selectedStatusTypeData)) {
                case 1:
                    // out
                    switch(timeIndex) {
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
                    break;
                case 2:
                    // in
                    switch(timeIndex) {
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
                    break;
                case 3:
                    // break start
                    break;
                case 4:
                    // break end
                    break;
            }
            console.log("edit time changed");
            console.log("attendance record after modal:");
            console.log(updatedAttendanceRecord);
            //setSelectedAttendanceRecord(updatedAttendanceRecord);
            //setNewTimeData(newTime);
            //handleAttendanceRecordChangeProp(updatedAttendanceRecord);
        }
    }

    function handlePopoverOpen(opened: boolean, timeType: number, timeIndex: number) {
        if (timeType == 2) {
            switch(timeIndex) {
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
        else if (timeType == 1) {
            switch(timeIndex) {
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

    return (
        <>
            <Modal
                title={<Text c="#dcdcdc" size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{addOrEditProp == "add" ? "Add" : "Edit"} time</Text>}
                opened={modalOpenedProp}
                onClose={closeModalProp}
                fullScreen={isMobileProp}
                size="lg"
                radius="md"
                //withCloseButton={false}
                classNames={classes}
                transitionProps={{ transition: 'fade', duration: 200 }}
            >
                <Grid c="#dcdcdc" align='end'>
                    <Grid.Col span={{ base: 12 }}>
                        <Text size="xl" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>Fill out the missing information.</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }} mt="lg">
                        <Text size="lg" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>Time entry</Text>
                        <Stack>
                            <Select
                                required
                                id="time-type"
                                value={selectedStatusTypeData}
                                onChange={setSelectedStatusTypeData}
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                allowDeselect={false}
                                placeholder="Select one"
                                //label="Time entry"
                                name="time-type"
                                size="lg"
                                classNames={textClasses}
                                data={timeTypeData}
                                //{...form.getInputProps('business_info.industry')}
                            >
                            </Select>
                            
                            
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }}>
                        <Text size="lg" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>Time</Text>
                        <Stack>
                            <Button.Group>
                                <Popover
                                    opened={popoverOpenD1In}
                                    //onChange={handlePopoverChanges}
                                    width={300}
                                    position="bottom"
                                    withArrow
                                    shadow="md"
                                    arrowSize={8}
                                    radius="sm"
                                    closeOnClickOutside={false}
                                >
                                    {/* parent of popover */}
                                    <Popover.Target>
                                        <Button
                                            size="lg"
                                            classNames={textClasses}
                                            color="#43554E"
                                            //disabled
                                            fullWidth
                                            justify="left"
                                            radius="10px"
                                        >
                                            {formatTime(newTimeData)}
                                        </Button>
                                    </Popover.Target>

                                    {/* popover content */}
                                    <Popover.Dropdown
                                        p="md"
                                        style={{ backgroundColor: "#25352F", border: "transparent", borderRadius: "15px" }}
                                    >
                                        {displayTimePicker && (
                                            <Grid style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <Grid.Col span={12}>
                                                    <SelectAsync
                                                        data-autofocus
                                                        hoursData={splitTime(newTimeData, 'hours')}
                                                        minutesData={splitTime(newTimeData, 'minutes')}
                                                        periodData={splitTime(newTimeData, 'period')}
                                                        timeIndex={1}
                                                        timeType={2}
                                                        strictMode={false}
                                                        //strictModeLocation={strictModeLocation}
                                                        handlePopoverChange={(timeType, timeIndex, value) => handlePopoverChange(timeType, timeIndex, value)}
                                                        handlePopoverOpened={(opened, timeType, timeIndex) => handlePopoverOpen(opened, timeType, timeIndex)}
                                                    />
                                                </Grid.Col>
                                            </Grid>
                                        )}
                                    </Popover.Dropdown>
                                </Popover>
                                
                                <Button
                                    size="lg"
                                    classNames={textClasses}
                                    fullWidth
                                    justify="left"
                                    radius="10px"
                                    color="#4a8a2a"
                                    maw={100}
                                    onClick={() => setPopoverOpenD1In(true)}
                                >
                                    Edit
                                </Button>

                            </Button.Group>
                        </Stack>
                        
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <Space h="lg"/>
                        <Text size="lg" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Updated time:</Text>
                        <Paper shadow="md" p="lg" pr="xl" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="sm">
                            <Grid align="center">
                                <Grid.Col span={{ base: 7 }}>
                                    <Stack gap="xs">
                                        <Group>
                                            <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{selectedStatusText}</Text>
                                        </Group>
                                        <Text c="#c1c0c0" size="lg" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>{selectedStatusDescription} {formatTime(newTimeData)}</Text>
                                    </Stack>
                                </Grid.Col>
                                <Grid.Col span={{ base: 5 }}>
                                    {/* {isMobile && (
                                        <Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{item.value}</Text>
                                        </Badge>
                                    )} */}
                                    {/* {!isMobile && ( */}
                                        <Group justify="end">
                                            < Badge size="45px" radius="md" color={getActivityColor(Number(selectedStatusTypeData))[0]} p="lg" pb="lg">
                                                <Text c="#dcdcdc" size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{formatTime(newTimeData)}</Text>
                                            </Badge>
                                        </Group>
                                    {/* )} */}

                                </Grid.Col>
                            </Grid>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }} mt="lg">
                        <Button 
                            size="lg" 
                            radius="md" 
                            color="#316F22"
                            fullWidth
                            onClick={() => handleSubmitClickedProp()} 
                        >
                            Done
                        </Button>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }} mt="lg">
                        <Group justify="end">
                            <Button
                                size="lg"
                                radius="md"
                                color="#35413D"
                                fullWidth
                                onClick={() => closeModalProp()}
                            >
                                Cancel
                            </Button>
                        </Group>
                    </Grid.Col>
                </Grid>
                
            </Modal>
        </>
    );
}