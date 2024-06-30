import { Timeline, Text, ThemeIcon, Paper, Title, Group, Badge, Stack, Grid, Space } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconBeach, IconCheck, IconClockPause, IconClockPlay, IconCalendarEvent, IconGitBranch, IconGitCommit, IconGitPullRequest, IconLogout, IconMessageDots, IconOutbound, IconPennant, IconPlaneArrival, IconPlaneDeparture, IconReportMedical, IconVideo, IconDoorExit, IconQuestionMark, IconArrowBarRight, IconArrowRight, IconArrowLeft, IconCoffee, IconClock, IconLocationCheck, IconMapPin, IconMapPinCheck, IconFlagFilled } from "@tabler/icons-react";
import { useState } from "react";
import { GenerateUUID } from "../helpers/Helpers";
import { StaffAttendanceRecord } from "../pages/owner-dashboard/child/Attendance";

interface TimesheetInformation {
    attendanceDataRecord: StaffAttendanceRecord;
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

export function getActivityColor(activity: string) {
    var colors = []; // [0] = timeline line color, [1] = bullet color

    switch(activity.toLowerCase()) {
        case "in": 
            colors.push("rgba(74,138,42,0.5)");
            colors.push("rgba(74,138,42,1)"); 
            return colors;
        case "out": 
            colors.push("rgba(182,65,39,0.5)");
            colors.push("rgba(182,65,39,1)");
            return colors;
        case "break": 
            colors.push("rgba(209,167,29,0.5)");
            colors.push("rgba(209,167,29,1)");
            return colors;
        case "end": 
            colors.push("rgba(9,15,13,0.4)");
            colors.push("rgba(9,15,13,0.6)");
            return colors;
    }
    return [];
}

export default function TimesheetInformation(props: TimesheetInformation) {
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

    // props
    const attendanceRecordDataProp = props.attendanceDataRecord;
 
    return (
        <>
            {/* regular hours  */}
            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="lg">
                <Grid align="center">
                    <Grid.Col span={{ base: 7 }}>
                        <Stack gap="xs">
                            <Text size={isMobile ? "20px" : "25px"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Total regular hours</Text>
                            <Text c="#c1c0c0" size={isMobile ? "md" : "lg"} fw={600}>Total regular hours was {attendanceRecordDataProp?.regular_hours.toFixed(2)} h</Text>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 5 }}>
                        <Group justify="end">
                            <Badge size="lg" radius="md" color="rgba(24,28,38,0.3)" p="md" pb="lg">
                                <Text size={isMobile ? "md" : "lg"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{attendanceRecordDataProp?.regular_hours.toFixed(2)} h</Text>
                            </Badge>
                        </Group>
                    </Grid.Col>
                </Grid>
            </Paper>

            {/* overtime hours  */}
            {attendanceRecordDataProp?.overtime_hours > 0 && (
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="lg">
                    <Grid>
                        <Grid.Col span={{ base: 6 }}>
                            <Stack gap="xs">
                                <Group>
                                    <Text size={isMobile ? "20px" : "25px"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Overtime hours</Text>
                                </Group>
                                <Text c="#c1c0c0" size={isMobile ? "md" : "lg"} fw={600}>Overtime hours was {attendanceRecordDataProp?.overtime_hours} h</Text>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <Group justify="end">
                                <Badge size="lg" radius="md" color="rgba(24,28,38,0.3)" p="md" pb="lg">
                                    <Text size={isMobile ? "md" : "lg"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{attendanceRecordDataProp?.overtime_hours} h</Text>
                                </Badge>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>
            )}

            {/* vacation hours  */}
            {attendanceRecordDataProp?.vacation_hours > 0 && (
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="lg">
                    <Grid>
                        <Grid.Col span={{ base: 6 }}>
                            <Stack gap="xs">
                                <Group>
                                    <Text size={isMobile ? "20px" : "25px"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Vacation hours</Text>
                                </Group>
                                <Text c="#c1c0c0" size={isMobile ? "md" : "lg"} fw={600}>Vacation hours was {attendanceRecordDataProp?.vacation_hours} h</Text>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <Group justify="end">
                                <Badge size="lg" radius="md" color="rgba(24,28,38,0.3)" p="md" pb="lg">
                                    <Text size={isMobile ? "md" : "lg"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{attendanceRecordDataProp?.vacation_hours} h</Text>
                                </Badge>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>
            )}

            {/* holiday hours  */}
            {attendanceRecordDataProp?.holiday_hours > 0 && (
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="lg">
                    <Grid>
                        <Grid.Col span={{ base: 6 }}>
                            <Stack gap="xs">
                                <Group>
                                    <Text size={isMobile ? "20px" : "25px"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Holiday hours</Text>
                                </Group>
                                <Text c="#c1c0c0" size={isMobile ? "md" : "lg"} fw={600}>Holiday hours was {attendanceRecordDataProp?.holiday_hours} h</Text>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <Group justify="end">
                                <Badge size="lg" radius="md" color="rgba(24,28,38,0.3)" p="md" pb="lg">
                                    <Text size={isMobile ? "md" : "lg"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{attendanceRecordDataProp?.holiday_hours} h</Text>
                                </Badge>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>
            )}

            {/* unpaid hours  */}
            {attendanceRecordDataProp?.unpaid_hours > 0 && (
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="lg">
                    <Grid>
                        <Grid.Col span={{ base: 6 }}>
                            <Stack gap="xs">
                                <Group>
                                    <Text size={isMobile ? "20px" : "25px"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Unpaid hours</Text>
                                </Group>
                                <Text c="#c1c0c0" size={isMobile ? "md" : "lg"} fw={600}>Unpaid hours was {attendanceRecordDataProp?.unpaid_hours} h</Text>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <Group justify="end">
                                <Badge size="lg" radius="md" color="rgba(24,28,38,0.3)" p="md" pb="lg">
                                    <Text size={isMobile ? "md" : "lg"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{attendanceRecordDataProp?.unpaid_hours} h</Text>
                                </Badge>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>
            )}

            {/* other paid hours  */}
            {attendanceRecordDataProp?.other_paid_hours > 0 && (
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="lg">
                    <Grid>
                        <Grid.Col span={{ base: 6 }}>
                            <Stack gap="xs">
                                <Group>
                                    <Text size={isMobile ? "20px" : "25px"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Other paid hours</Text>
                                </Group>
                                <Text c="#c1c0c0" size={isMobile ? "md" : "lg"} fw={600}>Other paid hours was {attendanceRecordDataProp?.other_paid_hours} h</Text>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <Group justify="end">
                                <Badge size="lg" radius="md" color="rgba(24,28,38,0.3)" p="md" pb="lg">
                                    <Text size={isMobile ? "md" : "lg"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{attendanceRecordDataProp?.other_paid_hours} h</Text>
                                </Badge>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>
            )}

            {/* TODO: SETUP CORRECT PAY */}
            {/* pay rate */}
            {false && (
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="lg">
                    <Grid>
                        <Grid.Col span={{ base: 6 }}>
                            <Stack gap="xs">
                                <Group>
                                    <Text size={isMobile ? "20px" : "25px"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pay rate</Text>
                                </Group>
                                <Text c="#c1c0c0" size={isMobile ? "md" : "lg"} fw={600}>Pay rate is $0.00 per hour</Text>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <Group justify="end">
                                <Badge size="lg" radius="md" color="rgba(24,28,38,0.3)" p="md" pb="lg">
                                    <Text size={isMobile ? "md" : "lg"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>$0.00 /hr</Text>
                                </Badge>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>
            )}
            

            {/* TODO: SETUP CORRECT PAY */}
            {/* total pay */}
            {false && (
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="lg">
                    <Grid>
                        <Grid.Col span={{ base: 6 }}>
                            <Stack gap="xs">
                                <Group>
                                    <Text size={isMobile ? "20px" : "25px"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Total pay</Text>
                                </Group>
                                <Text c="#c1c0c0" size={isMobile ? "md" : "lg"} fw={600}>Total pay is $0.00</Text>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <Group justify="end">
                                <Badge size="lg" radius="md" color="rgba(24,28,38,0.3)" p="md" pb="lg">
                                    <Text size={isMobile ? "md" : "lg"} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>$0.00</Text>
                                </Badge>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>
            )}

            
        </>
    );
}