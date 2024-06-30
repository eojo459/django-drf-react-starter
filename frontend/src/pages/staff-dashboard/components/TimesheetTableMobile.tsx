import { Button, Container, Group, Paper, ScrollArea, ScrollAreaAutosize, Space, Stack, Table, Tabs, Title, Text, Badge, Grid } from '@mantine/core';
import { useEffect, useState } from 'react';
import TimesheetTimeline from '../../../components/TimesheetTimeline';
import ActivityTimeline from '../../../components/ActivityTimeline';
import classes from "../../../css/HomePanel.module.css";
import { StaffAttendanceRecord } from '../../owner-dashboard/child/Attendance';
import { getDayOfWeek, getFormattedDate } from '../../../helpers/Helpers';
import TimesheetInformation from '../../../components/TimesheetInformation';

interface ITimesheetTableMobile {
    modalOpened: boolean;
    isMobile: boolean;
    attendanceRecordData: StaffAttendanceRecord[];
    activePanel: string;
    closeModal: () => void;
    handleOpenModal: () => void;
    handleUpdateAttendanceRecord: (updatedAttendanceRecord: StaffAttendanceRecord) => void;
    handleDelete: (timeType: number, timeIndex: number, attendanceRecord: StaffAttendanceRecord) => void;
    handlePanelChange: (panel: string) => void;
    //timesheetData: (submitFlag: boolean) => void; // get data from parent
}

const elements = [
    { attendance_id: 1, date: 'Monday', check_in_time: '8:00 AM', check_out_time: '5:00 PM', break: '12:00 PM - 1:00 PM', check_in_time_2: 'Carbon', check_out_time_2: '', break_2: '', check_in_time_3: '', check_out_time_3: '', break_3: '', total: '5 hours', overtime: '', sick: '', vacation: '', holiday: '', unpaid: '', other_unpaid: '', other_paid: '' },
    { attendance_id: 2, date: 'Tuesday', check_in_time: '7:30 AM', check_out_time: '6:00 PM', break: '12:00 PM - 1:00 PM', check_in_time_2: 'Carbon', check_out_time_2: '', break_2: '', check_in_time_3: '', check_out_time_3: '', break_3: '', total: '5 hours', overtime: '', sick: '', vacation: '', holiday: '', unpaid: '', other_unpaid: '', other_paid: '' },
    { attendance_id: 3, date: 'Wednesday', check_in_time: '8:00 AM', check_out_time: '5:00 PM', break: '12:00 PM - 1:00 PM', check_in_time_2: 'Carbon', check_out_time_2: '', break_2: '', check_in_time_3: '', check_out_time_3: '', break_3: '', total: '5 hours', overtime: '', sick: '', vacation: '', holiday: '', unpaid: '', other_unpaid: '', other_paid: '' },
    { attendance_id: 4, date: 'Thursday', check_in_time: '9:30 AM', check_out_time: '7:00 PM', break: '1:00 PM - 2:00 PM', check_in_time_2: 'Carbon', check_out_time_2: '', break_2: '', check_in_time_3: '', check_out_time_3: '', break_3: '', total: '5 hours', overtime: '', sick: '', vacation: '', holiday: '', unpaid: '', other_unpaid: '', other_paid: '' },
    { attendance_id: 5, date: 'Friday', check_in_time: '7:00 AM', check_out_time: '5:00 PM', break: '12:00 PM - 1:00 PM', check_in_time_2: 'Carbon', check_out_time_2: '', break_2: '', check_in_time_3: '', check_out_time_3: '', break_3: '', total: '5 hours', overtime: '', sick: '', vacation: '', holiday: '', unpaid: '', other_unpaid: '', other_paid: '' },
    //{ attendance_id: 6, date: 'Saturday', check_in_time: 12.011, check_out_time: 'C', break: '', check_in_time_2: 'Carbon', check_out_time_2: '', break_2: '', check_in_time_3: '', check_out_time_3: '', break_3: '', total: '', overtime: '', sick: '', vacation: '', holiday: '', unpaid: '', other_unpaid: '', other_paid: '' },
    //{ attendance_id: 7, date: 'Sunday', check_in_time: 12.011, check_out_time: 'C', break: '', check_in_time_2: 'Carbon', check_out_time_2: '', break_2: '', check_in_time_3: '', check_out_time_3: '', break_3: '', total: '', overtime: '', sick: '', vacation: '', holiday: '', unpaid: '', other_unpaid: '', other_paid: '' },
];

export const timesheetData = [
    { type: 'Total time', value: '8:00 hr', description: 'Total time was 8:00 hours' },
    { type: 'Pay rate', value: '$20.00 /hr', description: 'Pay rate is $20.00 per hour' },
    { type: 'Total pay', value: '$160.00', description: 'Total pay was $160.00' },
    { type: 'Overtime', value: '--', description: 'Overtime was --' },
    { type: 'Sick', value: '--', description: 'Sick leave time was --' },
    { type: 'Holiday', value: '--', description: 'Holiday time was --' },
    { type: 'Vacation', value: '--', description: 'Vacation time was --' },
    { type: 'Unpaid', value: '--', description: 'Unpaid time was --' },
    { type: 'Other', value: '--', description: 'Other paid time was --' },
];

export default function TimesheetTableMobile(props: ITimesheetTableMobile) {

    const [mondayPanelActive, setMondayPanelActive] = useState(true);
    const [tuesdayPanelActive, setTuesdayPanelActive] = useState(false);
    const [wednesdayPanelActive, setWednesdayPanelActive] = useState(false);
    const [thursdayPanelActive, setThursdayPanelActive] = useState(false);
    const [fridayPanelActive, setFridayPanelActive] = useState(false);
    const [saturdayPanelActive, setSaturdayPanelActive] = useState(false);
    const [sundayPanelActive, setSundayPanelActive] = useState(false);
    const [overtimeVisible, setOvertimeVisible] = useState(false);
    const [sickVisible, setSickVisible] = useState(false);
    const [vacationVisible, setVacationVisible] = useState(false);
    const [holidayVisible, setHolidayVisible] = useState(false);
    const [unpaidVisible, setUnpaidVisible] = useState(false);
    const [otherUnpaidVisible, setOtherUnpaidVisible] = useState(false);
    const [otherPaidVisible, setOtherPaidVisible] = useState(false);
    const [saturdayVisible, setSaturdayVisible] = useState(false);
    const [sundayVisible, setSundayVisible] = useState(false);
    const [editTime, setEditTime] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [tabWidth, setTabWidth] = useState('');
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [scrollAreaMah, setScrollAreaMah] = useState(300);

    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const activePanelProp = props.activePanel;
    const closeModalProp = props.closeModal;
    const openModalProp = props.handleOpenModal;
    const attendanceRecordDataProp = props.attendanceRecordData;
    const handleAttendanceRecordChangeProp = props.handleUpdateAttendanceRecord;
    const handleDeleteProp = props.handleDelete;
    const handlePanelChangeProp = props.handlePanelChange;

    const minimumHours = 0.01;

    // run on component load
    useEffect(() => {
        //fetchData();

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


    useEffect(() => {
        if (windowWidth < 800) {
            setTabWidth("100%");
        }
        else {
            setTabWidth("300px")
        }
    }, [windowWidth]);

    useEffect(() => {
        if (attendanceRecordDataProp) {
            console.log(attendanceRecordDataProp);
        }
    }, [attendanceRecordDataProp]);

    useEffect(() => {
        switch(activePanelProp) {
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
    }, [activePanelProp]);

    function handleEditTime(attendanceId: number, newTime: string, depth: number, type: string) {
        // get new time and update it
    }

    const timesheetDataItem = timesheetData.map((item) => (
        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="lg">
            <Grid>
                <Grid.Col span={{ base: 6 }}>
                    <Stack gap="xs">
                        <Group>
                            <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{item.type}</Text>
                        </Group>
                        <Text c="#c1c0c0" size="lg" fw={600}>{item.description}</Text>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 6 }}>
                    <Group justify="end">
                        <Badge size="55px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{item.value}</Text>
                        </Badge>
                    </Group>
                </Grid.Col>
            </Grid>
        </Paper>
    ));

    // change scroll area mah 
    function handleScrollAreaSize(attendanceRecord: StaffAttendanceRecord) {
        if (attendanceRecord) {
            if ((attendanceRecord.check_in_time_3 && attendanceRecord.check_out_time_3) ||
                (attendanceRecord.check_in_time_3 && !attendanceRecord.check_out_time_3)) {
                // max 800
                return 800;
            }
            else if ((attendanceRecord.check_in_time_2 && attendanceRecord.check_out_time_2) ||
                (attendanceRecord.check_in_time_2 && !attendanceRecord.check_out_time_2)) {
                // med 600
                return 600;
            }
            else if ((attendanceRecord.check_in_time && attendanceRecord.check_out_time) ||
                (attendanceRecord.check_in_time && !attendanceRecord.check_out_time)) {
                // lowest 300 (check in and check out)
                return 300;
            }
        }
    }

    // function handlePanelChange(panel: string) {
    //     handlePanelChangeProp(panel);
    // }

    return (
        <>
            {/* MONDAY */}
            {mondayPanelActive && (
                <>
                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                        <Stack>
                            <Text
                                size="30px"
                                fw={600}
                                style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                            >
                                {getDayOfWeek(attendanceRecordDataProp[0]?.attendance_date, 'long') + " " + getFormattedDate(attendanceRecordDataProp[0]?.attendance_date, 'long')}
                            </Text>
                            {unsavedChanges && (
                                <Button
                                    size="lg"
                                    radius="md"
                                    color="green"
                                    variant="light"
                                    fullWidth
                                    onClick={openModalProp}
                                >
                                    Save changes
                                </Button>
                            )}

                        </Stack>

                        {/* show timesheet information */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[0]?.id !== '-1'
                            && attendanceRecordDataProp[0]?.check_in_time !== ""
                            && (
                                <>
                                    <Space h="lg" />
                                    <ScrollArea h={handleScrollAreaSize(attendanceRecordDataProp[0])}>
                                        <TimesheetTimeline
                                            attendanceRecordData={attendanceRecordDataProp[0]}
                                            handleAttendanceRecordChange={handleAttendanceRecordChangeProp}
                                            handleDelete={handleDeleteProp}
                                        />
                                    </ScrollArea>
                                    <Space h="lg" />
                                </>
                            )
                        }

                        {/* show not found message */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[0]?.check_in_time === ""
                            && attendanceRecordDataProp[0]?.regular_hours < minimumHours
                            && (
                                <>
                                    <Space h="lg" />
                                    <Group justify='center'>
                                        <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                    </Group>
                                    <Space h="lg" />
                                </>
                            )
                        }
                    </Paper>

                    {attendanceRecordDataProp[0]?.regular_hours >= minimumHours && (
                        <Paper mt="lg" shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                            <Stack>
                                <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Timesheet information</Text>
                            </Stack>
                            {/* show timesheet information */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[0]?.check_in_time !== ""
                                && (
                                    <>
                                        {/* {timesheetDataItem} */}
                                        <TimesheetInformation attendanceDataRecord={attendanceRecordDataProp[0]} />
                                    </>
                                )
                            }

                            {/* show not found message */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[0]?.check_in_time === ""
                                && (
                                    <>
                                        <Space h="lg" />
                                        <Group justify='center'>
                                            <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                        </Group>
                                        <Space h="lg" />
                                    </>
                                )
                            }
                        </Paper>
                    )}
                </>
            )}


            {/* TUESDAY */}
            {tuesdayPanelActive && (
                <>
                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                        <Stack>
                            <Text
                                size="30px"
                                fw={600}
                                style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                            >
                                {getDayOfWeek(attendanceRecordDataProp[1]?.attendance_date, 'long') + " " + getFormattedDate(attendanceRecordDataProp[1]?.attendance_date, 'long')}
                            </Text>
                            {unsavedChanges && (
                                <Button
                                    size="lg"
                                    radius="md"
                                    color="green"
                                    variant="light"
                                    fullWidth
                                    onClick={openModalProp}
                                >
                                    Save changes
                                </Button>
                            )}
                        </Stack>

                        {/* show information */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[1]?.id !== '-1'
                            && attendanceRecordDataProp[1]?.check_in_time !== ""
                            && (
                                <>
                                    <Space h="lg" />
                                    <ScrollArea h={handleScrollAreaSize(attendanceRecordDataProp[1])}>
                                        <TimesheetTimeline
                                            attendanceRecordData={attendanceRecordDataProp[1]}
                                            handleAttendanceRecordChange={handleAttendanceRecordChangeProp}
                                            handleDelete={handleDeleteProp}
                                        />
                                    </ScrollArea>
                                    <Space h="lg" />
                                </>
                            )}

                        {/* show not found message */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[1]?.check_in_time === ""
                            && attendanceRecordDataProp[1]?.regular_hours < minimumHours
                            && (
                                <>
                                    <Space h="lg" />
                                    <Group justify='center'>
                                        <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                    </Group>
                                    <Space h="lg" />
                                </>
                            )
                        }
                    </Paper>

                    {attendanceRecordDataProp[1]?.regular_hours >= minimumHours && (
                        <Paper mt="lg" shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                            <Stack>
                                <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Timesheet information</Text>
                            </Stack>
                            {/* show information */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[1]?.check_in_time !== ""
                                && (
                                    <>
                                        <TimesheetInformation attendanceDataRecord={attendanceRecordDataProp[1]} />
                                    </>
                                )
                            }

                            {/* show not found message */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[1]?.check_in_time === ""
                                && (
                                    <>
                                        <Space h="lg" />
                                        <Group justify='center'>
                                            <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                        </Group>
                                        <Space h="lg" />
                                    </>
                                )
                            }
                        </Paper>
                    )}
                </>
            )}


            {/* WEDNESDAY */}
            {wednesdayPanelActive && (
                <>
                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                        <Stack>
                            <Text
                                size="30px"
                                fw={600}
                                style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                            >
                                {getDayOfWeek(attendanceRecordDataProp[2]?.attendance_date, 'long') + " " + getFormattedDate(attendanceRecordDataProp[2]?.attendance_date, 'long')}
                            </Text>
                            {unsavedChanges && (
                                <Button
                                    size="lg"
                                    radius="md"
                                    color="green"
                                    variant="light"
                                    fullWidth
                                    onClick={openModalProp}
                                >
                                    Save changes
                                </Button>
                            )}
                        </Stack>
                        {/* show information */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[2]?.id !== '-1'
                            && attendanceRecordDataProp[2]?.check_in_time !== ""
                            && (
                                <>
                                    <Space h="lg" />
                                    <ScrollArea h={handleScrollAreaSize(attendanceRecordDataProp[2])}>
                                        <TimesheetTimeline
                                            attendanceRecordData={attendanceRecordDataProp[2]}
                                            handleAttendanceRecordChange={handleAttendanceRecordChangeProp}
                                            handleDelete={handleDeleteProp}
                                        />
                                    </ScrollArea>
                                    <Space h="lg" />
                                </>
                            )}

                        {/* show not found message */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[2]?.check_in_time === ""
                            && attendanceRecordDataProp[2]?.regular_hours < minimumHours
                            && (
                                <>
                                    <Space h="lg" />
                                    <Group justify='center'>
                                        <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                    </Group>
                                    <Space h="lg" />
                                </>
                            )
                        }
                    </Paper>

                    {attendanceRecordDataProp[2]?.regular_hours >= minimumHours && (
                        <Paper mt="lg" shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                            <Stack>
                                <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Timesheet information</Text>
                            </Stack>
                            {/* show information */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[2]?.check_in_time !== ""
                                && (
                                    <>
                                        <TimesheetInformation attendanceDataRecord={attendanceRecordDataProp[2]} />
                                    </>
                                )
                            }

                            {/* show not found message */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[2]?.check_in_time === ""
                                && (
                                    <>
                                        <Space h="lg" />
                                        <Group justify='center'>
                                            <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                        </Group>
                                        <Space h="lg" />
                                    </>
                                )
                            }
                        </Paper>
                    )}
                </>
            )}


            {/* THURSDAY */}
            {thursdayPanelActive && (
                <>
                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                        <Stack>
                            <Text
                                size="30px"
                                fw={600}
                                style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                            >
                                {getDayOfWeek(attendanceRecordDataProp[3]?.attendance_date, 'long') + " " + getFormattedDate(attendanceRecordDataProp[3]?.attendance_date, 'long')}
                            </Text>
                            {unsavedChanges && (
                                <Button
                                    size="lg"
                                    radius="md"
                                    color="green"
                                    variant="light"
                                    fullWidth
                                    onClick={openModalProp}
                                >
                                    Save changes
                                </Button>
                            )}
                        </Stack>
                        {/* show information */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[3]?.id !== '-1'
                            && attendanceRecordDataProp[3]?.check_in_time !== ""
                            && (
                                <>
                                    <Space h="lg" />
                                    <ScrollArea h={handleScrollAreaSize(attendanceRecordDataProp[3])}>
                                        <TimesheetTimeline
                                            attendanceRecordData={attendanceRecordDataProp[3]}
                                            handleAttendanceRecordChange={handleAttendanceRecordChangeProp}
                                            handleDelete={handleDeleteProp}
                                        />
                                    </ScrollArea>
                                    <Space h="lg" />
                                </>
                            )}

                        {/* show not found message */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[3]?.check_in_time === ""
                            && attendanceRecordDataProp[3]?.regular_hours < minimumHours
                            && (
                                <>
                                    <Space h="lg" />
                                    <Group justify='center'>
                                        <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                    </Group>
                                    <Space h="lg" />
                                </>
                            )
                        }
                    </Paper>

                    {attendanceRecordDataProp[3]?.regular_hours >= minimumHours && (
                        <Paper mt="lg" shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                            <Stack>
                                <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Timesheet information</Text>
                            </Stack>
                            {/* show information */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[3]?.check_in_time !== ""
                                && (
                                    <>
                                        <TimesheetInformation attendanceDataRecord={attendanceRecordDataProp[3]} />
                                    </>
                                )
                            }

                            {/* show not found message */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[3]?.check_in_time === ""
                                && (
                                    <>
                                        <Space h="lg" />
                                        <Group justify='center'>
                                            <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                        </Group>
                                        <Space h="lg" />
                                    </>
                                )
                            }
                        </Paper>
                    )}
                </>
            )}


            {/* FRIDAY */}
            {fridayPanelActive && (
                <>
                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                        <Stack>
                            <Text
                                size="30px"
                                fw={600}
                                style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                            >
                                {getDayOfWeek(attendanceRecordDataProp[4]?.attendance_date, 'long') + " " + getFormattedDate(attendanceRecordDataProp[4]?.attendance_date, 'long')}
                            </Text>
                            {unsavedChanges && (
                                <Button
                                    size="lg"
                                    radius="md"
                                    color="green"
                                    variant="light"
                                    fullWidth
                                    onClick={openModalProp}
                                >
                                    Save changes
                                </Button>
                            )}
                        </Stack>
                        {/* show information */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[4]?.id !== '-1'
                            && attendanceRecordDataProp[4]?.check_in_time !== ""
                            && (
                                <>
                                    <Space h="lg" />
                                    <ScrollArea h={handleScrollAreaSize(attendanceRecordDataProp[4])}>
                                        <TimesheetTimeline
                                            attendanceRecordData={attendanceRecordDataProp[4]}
                                            handleAttendanceRecordChange={handleAttendanceRecordChangeProp}
                                            handleDelete={handleDeleteProp}
                                        />
                                    </ScrollArea>
                                    <Space h="lg" />
                                </>
                            )}

                        {/* show not found message */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[4]?.check_in_time === ""
                            && attendanceRecordDataProp[4]?.regular_hours < minimumHours
                            && (
                                <>
                                    <Space h="lg" />
                                    <Group justify='center'>
                                        <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                    </Group>
                                    <Space h="lg" />
                                </>
                            )
                        }
                    </Paper>

                    {attendanceRecordDataProp[4]?.regular_hours >= minimumHours && (
                        <Paper mt="lg" shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                            <Stack>
                                <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Timesheet information</Text>
                            </Stack>
                            {/* show information */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[4]?.check_in_time !== ""
                                && (
                                    <>
                                        <TimesheetInformation attendanceDataRecord={attendanceRecordDataProp[5]} />
                                    </>
                                )
                            }

                            {/* show not found message */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[4]?.check_in_time === ""
                                && (
                                    <>
                                        <Space h="lg" />
                                        <Group justify='center'>
                                            <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                        </Group>
                                        <Space h="lg" />
                                    </>
                                )
                            }
                        </Paper>
                    )}
                </>
            )}


            {/* SATURDAY */}
            {saturdayPanelActive && (
                <>
                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                        <Stack>
                            <Text
                                size="30px"
                                fw={600}
                                style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                            >
                                {getDayOfWeek(attendanceRecordDataProp[5]?.attendance_date, 'long') + " " + getFormattedDate(attendanceRecordDataProp[5]?.attendance_date, 'long')}
                            </Text>
                            {unsavedChanges && (
                                <Button
                                    size="lg"
                                    radius="md"
                                    color="green"
                                    variant="light"
                                    fullWidth
                                    onClick={openModalProp}
                                >
                                    Save changes
                                </Button>
                            )}
                        </Stack>
                        {/* show information */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[5]?.id !== '-1'
                            && attendanceRecordDataProp[5]?.check_in_time !== ""
                            && (
                                <>
                                    <Space h="lg" />
                                    <ScrollArea h={handleScrollAreaSize(attendanceRecordDataProp[5])}>
                                        <TimesheetTimeline
                                            attendanceRecordData={attendanceRecordDataProp[5]}
                                            handleAttendanceRecordChange={handleAttendanceRecordChangeProp}
                                            handleDelete={handleDeleteProp}
                                        />
                                    </ScrollArea>
                                    <Space h="lg" />
                                </>
                            )}

                        {/* show not found message */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[5]?.check_in_time === ""
                            && attendanceRecordDataProp[5]?.regular_hours < minimumHours
                            && (
                                <>
                                    <Space h="lg" />
                                    <Group justify='center'>
                                        <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                    </Group>
                                    <Space h="lg" />
                                </>
                            )
                        }
                    </Paper>

                    {attendanceRecordDataProp[5]?.regular_hours >= minimumHours && (
                        <Paper mt="lg" shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                            <Stack>
                                <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Timesheet information</Text>
                            </Stack>
                            {/* show information */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[5]?.check_in_time !== ""
                                && (
                                    <>
                                        <TimesheetInformation attendanceDataRecord={attendanceRecordDataProp[5]} />
                                    </>
                                )
                            }

                            {/* show not found message */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[5]?.check_in_time === ""
                                && (
                                    <>
                                        <Space h="lg" />
                                        <Group justify='center'>
                                            <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                        </Group>
                                        <Space h="lg" />
                                    </>
                                )
                            }
                        </Paper>
                    )}
                </>
            )}

            {/* SUNDAY */}
            {sundayPanelActive && (
                <>
                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                        <Stack>
                            <Text
                                size="30px"
                                fw={600}
                                style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                            >
                                {getDayOfWeek(attendanceRecordDataProp[6]?.attendance_date, 'long') + " " + getFormattedDate(attendanceRecordDataProp[6]?.attendance_date, 'long')}
                            </Text>
                            {unsavedChanges && (
                                <Button
                                    size="lg"
                                    radius="md"
                                    color="green"
                                    variant="light"
                                    fullWidth
                                    onClick={openModalProp}
                                >
                                    Save changes
                                </Button>
                            )}
                        </Stack>
                        {/* show information */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[6]?.id !== '-1'
                            && attendanceRecordDataProp[6]?.check_in_time !== ""
                            && (
                                <>
                                    <Space h="lg" />
                                    <ScrollArea h={handleScrollAreaSize(attendanceRecordDataProp[6])}>
                                        <TimesheetTimeline
                                            attendanceRecordData={attendanceRecordDataProp[6]}
                                            handleAttendanceRecordChange={handleAttendanceRecordChangeProp}
                                            handleDelete={handleDeleteProp}
                                        />
                                    </ScrollArea>
                                    <Space h="lg" />
                                </>
                            )}

                        {/* show not found message */}
                        {
                            attendanceRecordDataProp
                            && attendanceRecordDataProp[6]?.check_in_time === ""
                            && attendanceRecordDataProp[6]?.regular_hours < minimumHours
                            && (
                                <>
                                    <Space h="lg" />
                                    <Group justify='center'>
                                        <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                    </Group>
                                    <Space h="lg" />
                                </>
                            )
                        }
                    </Paper>

                    {attendanceRecordDataProp[6]?.regular_hours >= minimumHours && (
                        <Paper mt="lg" shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                            <Stack>
                                <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Timesheet information</Text>
                            </Stack>
                            {/* show information */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[6]?.check_in_time !== ""
                                && (
                                    <>
                                        <TimesheetInformation attendanceDataRecord={attendanceRecordDataProp[6]} />
                                    </>
                                )
                            }

                            {/* show not found message */}
                            {
                                attendanceRecordDataProp
                                && attendanceRecordDataProp[6]?.check_in_time === ""
                                && (
                                    <>
                                        <Space h="lg" />
                                        <Group justify='center'>
                                            <Text size="20px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Nothing found</Text>
                                        </Group>
                                        <Space h="lg" />
                                    </>
                                )
                            }
                        </Paper>
                    )}
                </>
            )}

        </>
    );
}