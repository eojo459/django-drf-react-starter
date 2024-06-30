import React, { useEffect, useRef, useState } from 'react';
import { ChildAttendanceData, ChildAttendanceRecord, ChildProfile, CopiedAttendanceData, TimePickerDayDepth } from '../pages/owner-dashboard/child/Attendance';
import { DayTimePicker } from './AttendanceTimePicker';
import { Text, Button, Paper, Grid, TextInput, Textarea, Select, Avatar, Container, Table, ActionIcon, useComputedColorScheme, Stack, Accordion, Group, Space, Divider, Title, ScrollArea, Badge } from '@mantine/core';
import { IconBuildingStore, IconPhoto, IconTrash, IconUser, IconUserCircle, IconUserSquareRounded } from '@tabler/icons-react';
import classes from '../css/AttendanceTable.module.scss';
import "../css/AttendanceTable.scss";
import { AtendanceTableHeaderControl } from './AttendanceTableHeader';
import dayjs, { Dayjs } from "dayjs";
import { useMediaQuery } from '@mantine/hooks';
import '@mantine/carousel/styles.css';
import { StaffAttendanceData, StaffProfile } from '../pages/owner-dashboard/staff/StaffAttendance';

// data passed to this child component
interface AttendanceProps {
    personProfiles: ChildProfile[] | StaffProfile[];
    personType: string;
    personAttendanceData: AttendanceData[];
    tableHeadersWeekDay: string[];
    tableHeadersDay: string[];
    dateList: string[];
    copyMode: boolean;
    copiedAttendanceTimes: CopiedAttendanceData | null;
    isUserAtLocation: boolean;
    strictMode: boolean;
    strictModeLocation: boolean;
    handleAttendanceRecordChange: (updatedData: AttendanceRecord) => void; // handle attendance record changes
    handleCopyModeChange: (copyMode: boolean) => void; // handle copy mode changes
    handleCopiedTimeChange: (copiedData: CopiedAttendanceData) => void; // handle the copied values
    handleNewChanges: (changes: boolean) => void // handle new changes
    //handleWeekChange: (startDate: Dayjs) => void; // handle week change
    //handleBusinessIdChange: (businessId: number) => void; // handle business id change
}

export type AttendanceRecord = {
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
    timezone: string;
}

export type AttendanceData = {
    uid: string;
    business_id: string;
    first_name: string;
    last_name: string;
    attendance: AttendanceRecord[];
    total_time: number;
    type: string;
};

function isStaffProfileArray(profiles: ChildProfile[] | StaffProfile[]): profiles is StaffProfile[] {
    // Assuming 'role' is a property unique to StaffProfile
    return (profiles as StaffProfile[])[0]?.position !== undefined; // true = staff | false = child
}

function AttendanceTable(props: AttendanceProps) {
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const isMobile = useMediaQuery('(max-width: 75em)');
    const yeeye = false;
    const accordionRef = useRef<HTMLDivElement>(null);
    const accordionRefMobile = useRef<HTMLDivElement>(null);
    const parentDivRef = useRef<HTMLDivElement>(null);
    const [elementSize, setElementSize] = useState({ width: 0, height: 0 });
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [maxWidth, setMaxWidth] = useState(windowWidth * 0.95);
    const [activeItem, setActiveItem] = useState('');
    const [badgeWidth, setBadgeWidth] = useState(0);
    const [selectedPerson, setSelectedPerson] = useState('');
    const [selectedAttendanceData, setSelectedAttendanceData] = useState<AttendanceData>();
    

    // setup prop variables
    const personProfiles = props.personProfiles;
    const personType = props.personType;
    const personAttendanceData = props.personAttendanceData;
    const tableHeadersWeekDay: string[] = props.tableHeadersWeekDay;
    const tableHeadersDay: string[] = props.tableHeadersDay;
    const dateList: string[] = props.dateList;
    const copyMode: boolean = props.copyMode;
    const copiedAttendanceTimes: (CopiedAttendanceData | null) = props.copiedAttendanceTimes;
    const isUserAtLocation = props.isUserAtLocation;
    const strictMode = props.strictMode;
    const strictModeLocation = props.strictModeLocation;
    const handleAttendanceRecordChange = props.handleAttendanceRecordChange;
    const handleCopyModeChange = props.handleCopyModeChange;
    const handleCopiedTimeChange = props.handleCopiedTimeChange;
    const handleNewChanges = props.handleNewChanges;
    //const handleWeekChange = props.handleWeekChange;
    //const handleBusinessIdChange = props.handleBusinessIdChange;


    useEffect(() => {
        const updateElementSize = () => {
          if (accordionRef.current) {
            const { width, height } = accordionRef.current.getBoundingClientRect();
            setElementSize({ width, height });
            setMaxWidth(width);
            console.log(width, height);
          }
        };
    
        setWindowWidth(window.innerWidth);

        // Initial update
        updateElementSize();
        
        // Update size on window resize
        window.addEventListener('resize', updateElementSize);
    
        // Cleanup event listener on component unmount
        return () => {
          window.removeEventListener('resize', updateElementSize);
        };
    }, []);

    useEffect(() => {
        if (parentDivRef.current!= null) {
            const { width, height } = parentDivRef.current.getBoundingClientRect();
            setBadgeWidth(width);
        }
    },[isMobile]);

    // run when accordion active item or attendance data changes
    useEffect(() => {
        setSelectedPerson(activeItem);
        setSelectedAttendanceData(personAttendanceData.find((attendanceData) => attendanceData.uid === activeItem));
    }, [activeItem, personAttendanceData, personType])

    // handle active accordion item change
    function handleAccordionChange(value: string | null) {
        console.log(value);
        if (value != null) {
            setActiveItem(value);
        }
        else {
            setActiveItem('');
        }
    }

    // setup the table rows to be displayed
    let tableRows: JSX.Element[] = [];
    if (tableHeadersWeekDay?.length > 0 && personProfiles?.length > 0) {

        // RENDER DESKTOP VIEW
        //
        tableRows = personProfiles.map((person, personIndex) => (
            // <Table.Tr key={person.uid + '-accordion'}>
            <Accordion.Item
                value={person.uid}
                style={{ backgroundColor: "#25352F" }}
                ref={accordionRef}
                mt="lg"
            >
                {/* Accordion header/label */}
                <Accordion.Control
                    style={{ backgroundColor: "#25352F", borderRadius: "15px" }}
                >
                    {activeItem !== person.uid && (
                        <Grid columns={16} align="center">
                            <Grid.Col span={{ base: 2 }}>
                                <Stack m="lg" align="center">
                                    <IconUser
                                        style={{ color: "#dcdcdc", width: "20px", height: "20px" }}
                                    />
                                    <Text c="#dcdcdc" size='xl' fw={600}>{person.first_name}</Text>
                                    <Text c="#dcdcdc" size='xl' fw={600}>{person.last_name}</Text>
                                </Stack>
                            </Grid.Col>

                            {/* for each date in dateList */}
                            {dateList.map((date, dateIndex) => (
                                <Grid.Col span={{ base: 1.7 }}>
                                    <Stack>
                                        <Paper
                                            p="sm"
                                            c="#dcdcdc"
                                            radius="lg"
                                            style={{ background: "#182420", fillOpacity: "70%", textAlign: "center" }}
                                        >
                                            <Text size="lg" fw="bold">{dayjs(date).format('MMM, D')}</Text>
                                        </Paper>
                                        <Paper
                                            c="#dcdcdc"
                                            radius="lg"
                                            style={{ background: "#43554E", fillOpacity: "70%", textAlign: "center" }}
                                        >
                                            <Text size="lg" fw="bold">{personAttendanceData[personIndex]?.attendance[dateIndex]?.total_time} h</Text>
                                        </Paper>
                                    </Stack>
                                </Grid.Col>
                            ))}

                            <Grid.Col span={{ base: 1.5 }}>
                                <Stack>
                                    <Paper
                                        p="sm"
                                        c="#dcdcdc"
                                        radius="lg"
                                        style={{ background: "#182420", fillOpacity: "70%", textAlign: "center" }}
                                    >
                                        <Text size="lg" fw="bold">Total</Text>
                                    </Paper>
                                    <Paper
                                        c="#dcdcdc"
                                        radius="lg"
                                        style={{ background: "#43554E", fillOpacity: "70%", textAlign: "center" }}
                                    >
                                        <Text size="lg" fw="bold">{personAttendanceData[personIndex]?.total_time} h</Text>
                                    </Paper>
                                </Stack>
                            </Grid.Col>

                        </Grid>

                    )}
                    {activeItem === person.uid && (
                        <Group>
                            <Group m="lg">
                                <Text size='lg'></Text>
                                <Text size='lg'></Text>
                            </Group>
                        </Group>
                    )}

                </Accordion.Control>

                {/* Accordion content */}
                <Accordion.Panel style={{ borderRadius: "15px" }}>
                    <ScrollArea maw={maxWidth * 0.95} scrollbars="x" type="always" scrollbarSize={20}>
                        <div className={classes.container}>
                            <div className={classes.sidebar}>
                                <Stack align="center" justify="center" p="md" gap="xs">
                                    <IconUser
                                        style={{ color: "#dcdcdc", width: "30px", height: "30px" }}
                                    />
                                    <Text ta="center" size='lg' fw={600}>{person.first_name + " " + person.last_name}</Text>
                                    <Divider />
                                    {personType === "STAFF" && 'position' in person && (
                                        <Badge
                                            size="lg"
                                            radius="md"
                                            variant="light"
                                            color="cyan"
                                        >
                                            {person?.position}
                                        </Badge>
                                    )}
                                </Stack>
                            </div>
                            <ScrollArea mah={500} scrollbarSize={30} scrollbars="y" offsetScrollbars="y">
                                <Table withRowBorders={false} stickyHeader stickyHeaderOffset={0}>
                                    <Table.Thead style={{ background: "transparent" }}>
                                        <Table.Tr key={person.uid + '-desktop-headers'}>
                                            {tableHeadersWeekDay.map((date, dateIndex) => (
                                                // render time pickers for each day
                                                <Table.Td>
                                                    <Paper
                                                        p="lg"
                                                        radius="lg"
                                                        style={{ background: "#182420", fillOpacity: "70%", textAlign: "center", minWidth: "160px" }}
                                                    >
                                                        <Text size="lg" fw="bold">{date} {tableHeadersDay[dateIndex]}</Text>
                                                    </Paper>
                                                </Table.Td>
                                            ))}
                                            <Table.Td>
                                                <Paper
                                                    p="lg"
                                                    radius="lg"
                                                    style={{ background: "#182420", fillOpacity: "70%", textAlign: "center", minWidth: "160px" }}
                                                >
                                                    <Text size="lg" fw="bold">Total hours</Text>
                                                </Paper>
                                            </Table.Td>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Space h="lg" />
                                    <Table.Tbody>
                                        <Table.Tr key={person.uid + "-body-row"}>
                                            {/* for each date in dateList */}
                                            {dateList.map((date, dateIndex) => (
                                                // render time pickers for each day
                                                <Table.Td key={person.uid + "-" + dateIndex} style={{ verticalAlign: "top", maxWidth: "200px" }}>
                                                    <Paper shadow="sm" radius="lg" p="sm" style={{ background: "#182420", minWidth: "160px" }}>
                                                        {selectedAttendanceData !== undefined && (
                                                            <DayTimePicker
                                                                personAttendanceRecord={selectedAttendanceData.attendance[dateIndex]}
                                                                personId={person.uid}
                                                                date={date}
                                                                copyMode={copyMode}
                                                                copiedAttendanceTimes={copiedAttendanceTimes}
                                                                isUserAtLocation={isUserAtLocation}
                                                                strictMode={strictMode}
                                                                strictModeLocation={strictModeLocation}
                                                                handleAttendanceRecordChange={handleAttendanceRecordChange}
                                                                handleCopyModeChange={handleCopyModeChange}
                                                                handleCopiedTimeChange={handleCopiedTimeChange}
                                                                handleNewChanges={handleNewChanges}
                                                            />
                                                        )}

                                                    </Paper>
                                                </Table.Td>
                                            ))}

                                            <Table.Td key={person.uid + "-total"} style={{ verticalAlign: "top", maxWidth: "200px" }}>
                                                <Paper shadow="sm" radius="lg" p="md" style={{ background: "#182420", minWidth: "160px" }}>
                                                    <Paper p="md" style={{ backgroundColor: "#25352f" }}>
                                                        <Group justify="space-around">
                                                            {/* <Text ta="left" size="lg" fw="bold">Total</Text> */}
                                                            <Text size="lg" fw="bold">{personAttendanceData[personIndex]?.total_time} h</Text>
                                                        </Group>
                                                    </Paper>
                                                </Paper>
                                            </Table.Td>
                                        </Table.Tr>
                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>
                        </div>
                        <Space h="lg" />
                    </ScrollArea>
                </Accordion.Panel>
            </Accordion.Item>
            // </Table.Tr>
        ));
        //}
    }
    else {
        tableRows = [];
    }


    // setup the table rows to be displayed
    let tableRowsMobile: JSX.Element[] = [];
    if (tableHeadersWeekDay?.length > 0 && personProfiles != null && personProfiles?.length > 0) {
        // RENDER MOBILE VIEW
        //
        tableRowsMobile = personProfiles.map((person) => (
            <>
                {/* <Accordion
                    variant="filled"
                    radius="lg"
                    transitionDuration={500}
                    style={{ marginTop: "5px" }}
                    onChange={() => handleAccordionChange(person.uid)}
                    multiple={false}
                > */}
                    <Accordion.Item 
                        value={person.uid} 
                        style={{ backgroundColor: "#25352F" }} 
                        mt="lg"
                        ref={accordionRef} 
                    >
                        {/* Accordion header/label */}
                        <Accordion.Control
                            style={{ backgroundColor: "#25352F", borderRadius: "15px" }}
                        >
                            {activeItem !== person.uid && (
                                <Group>
                                    <Group m="lg">
                                        <IconUser
                                            style={{ color: "white", width: "20px", height: "20px" }}
                                        />
                                        <Text c="#dcdcdc" size='xl'>{person.first_name}</Text>
                                        <Text c="#dcdcdc" size='xl'>{person.last_name}</Text>
                                    </Group>
                                </Group>
                            )}

                            {activeItem === person.uid && (
                                <Group>
                                    <Group m="lg">
                                        <Text size='lg'></Text>
                                        <Text size='lg'></Text>
                                    </Group>
                                </Group>
                            )}

                        </Accordion.Control>

                        {/* Accordion content */}
                        <Accordion.Panel style={{ borderRadius: "15px" }}>
                            <ScrollArea h={800} scrollbarSize={10}>

                                <Table withRowBorders={false} stickyHeader stickyHeaderOffset={0}>
                                    <Table.Thead style={{ background: "transparent" }}>
                                        <Table.Tr key={person.uid + "-content"}>
                                            <Table.Td>
                                                {/* user info */}
                                                <Paper
                                                    p="lg"
                                                    radius="lg"
                                                    mt="-10px"
                                                    style={{ background: "#25352F", fillOpacity: "70%", textAlign: "center", minWidth: "160px" }}
                                                >
                                                    <Stack justify="center" align="center" p="md" gap="xs">
                                                        <Group>
                                                            <IconUser
                                                                style={{ color: "#dcdcdc", width: "30px", height: "30px" }}
                                                            />
                                                            <Text ta="left" size='xl' fw={600}>{person.first_name + " " + person.last_name}</Text>
                                                        </Group>
                                                        <Badge
                                                            size="xl"
                                                            radius="md"
                                                            variant="light"
                                                            color="cyan"
                                                            style={{ width: "200px" }}
                                                        >
                                                            Cashier
                                                        </Badge>
                                                    </Stack>
                                                </Paper>
                                            </Table.Td>
                                        </Table.Tr>
                                    </Table.Thead>

                                    <Table.Tbody>
                                        {dateList.map((date, dateIndex) => (
                                            <Table.Tr key={person.uid + "-row"}>
                                                {/* render time pickers for each day */}
                                                <Table.Td key={person.uid + "-" + dateIndex} style={{ verticalAlign: "top" }}>
                                                    <Paper shadow="sm" radius="lg" p="sm" style={{ background: "#182420", minWidth: "160px" }}>
                                                        <Stack m="lg">
                                                            <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{tableHeadersWeekDay[dateIndex] + " " + tableHeadersDay[dateIndex]}</Text>
                                                            {selectedAttendanceData !== undefined && (
                                                                <DayTimePicker 
                                                                    personAttendanceRecord={selectedAttendanceData.attendance[dateIndex]}
                                                                    personId={person.uid}
                                                                    date={date}
                                                                    copyMode={copyMode}
                                                                    copiedAttendanceTimes={copiedAttendanceTimes}
                                                                    isUserAtLocation={isUserAtLocation}
                                                                    strictMode={strictMode}
                                                                    strictModeLocation={strictModeLocation}
                                                                    handleAttendanceRecordChange={handleAttendanceRecordChange}
                                                                    handleCopyModeChange={handleCopyModeChange}
                                                                    handleCopiedTimeChange={handleCopiedTimeChange}
                                                                    handleNewChanges={handleNewChanges}
                                                                />
                                                            )}
                                                        </Stack>
                                                    </Paper>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                        <Table.Tr key={person.uid + "-total-row"}>
                                            <Table.Td key={person.uid + "-total"} style={{ verticalAlign: "top" }}>
                                                <Paper shadow="sm" radius="lg" p="sm" style={{ backgroundColor: "#182420", minWidth: "160px" }}>
                                                    <Text m="lg" size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Total hours</Text>
                                                    <Paper p="md" m="lg" style={{ backgroundColor: "#25352F" }}>
                                                        <Group justify="center">
                                                            {/* <Text ta="left" size="lg" fw="bold">Total hours:</Text> */}
                                                            <Text size="lg" fw="bold">0 h</Text>
                                                        </Group>
                                                    </Paper>
                                                </Paper>
                                            </Table.Td>
                                        </Table.Tr>

                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>
                        </Accordion.Panel>
                    </Accordion.Item>
                {/* </Accordion> */}
                {/* Profile button */}
                {/* <Table.Td>
                        <ActionIcon
                            variant="filled"
                            size="xl"
                            radius="lg"
                            onClick={() => handleProfileSetup(child, false)}
                        >
                            <IconUser/>
                        </ActionIcon>
                    </Table.Td> */}

                {/* Delete button */}
                {/* <Table.Td>
                        <ActionIcon
                            variant="filled"
                            size="xl"
                            radius="lg"
                            color="red"
                            onClick={() => handleProfileSetup(child, true)}
                        >
                            <IconTrash/>
                        </ActionIcon>
                    </Table.Td> */}
            </>
        ));
    //}
    }
    else {
        tableRowsMobile = [];
    }

    // display attendance table
    return (
        <>
            {isMobile && (
                // render mobile view
                // #161b26 dark blue bg
                // #212735 light gray
                <Table
                    verticalSpacing="lg"
                    horizontalSpacing="lg"
                    //striped 
                    //highlightOnHover
                    //withColumnBorders
                    style={{ fontSize: "20px" }}
                    withRowBorders={false}
                >

                    {/* Table body data */}
                    <Table.Tbody>
                        <Accordion
                            variant="filled"
                            radius="lg"
                            transitionDuration={500}
                            style={{ marginTop: "5px" }}
                            onChange={handleAccordionChange}
                            multiple={false}
                        >
                            {tableRowsMobile}
                        </Accordion>
                    </Table.Tbody>
                </Table>
            )}

            {!isMobile && (
                // Display attendance list as table for desktop
                <Table.ScrollContainer minWidth={200}>
                    <Table
                        verticalSpacing="lg"
                        horizontalSpacing="lg"
                        //striped 
                        //highlightOnHover
                        //withColumnBorders
                        style={{ fontSize: "20px" }}
                        withRowBorders={false}
                    >

                        {/* Table body data */}
                        <Table.Tbody>
                            <Accordion
                                variant="filled"
                                radius="lg"
                                transitionDuration={500}
                                style={{ marginTop: "5px"}}
                                onChange={handleAccordionChange}
                                multiple={false}
                                color="#dcdcdc"
                            >
                                {tableRows}
                            </Accordion>
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            )}
        </>

    );
};

export { AttendanceTable, isStaffProfileArray };
