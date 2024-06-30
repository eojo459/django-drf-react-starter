import { useContext, useEffect, useState } from "react";
import { Button, Container, Grid, Group, Paper, Select, Stack, Tabs, Title, Text, ActionIcon } from "@mantine/core";
import { AuthContext } from "../../authentication/AuthContext";
import { useGlobalState } from "../../context/GlobalStateContext";
import CentreInformation, { BusinessProfile } from "../owner-dashboard/business/components/CentreInformation";
import { MembersTable } from "../owner-dashboard/business/components/CentreMembersTable";
import CentreSettings from "../owner-dashboard/business/components/CentreSettings";
import GroupManager from "../owner-dashboard/business/components/GroupManager";
import { getStartOfWeek, DatePickerInput, MonthPickerInput } from "@mantine/dates";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import { isInWeekRange } from "../../helpers/Helpers";
import React from "react";
import { useMediaQuery } from "@mantine/hooks";
import WeekPickerWithArrows from "../../components/WeekPickerWithArrows";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import classes from "../../css/TextInput.module.css";
import { useNavigationContext } from "../../context/NavigationContext";
import tabClasses from "../../css/HomePanel.module.css";

export default function TimesheetList() {
    //let { authTokens, user }: any = useContext(AuthContext);
    const { user, session } = useAuth();
    const [pdfData, setPdfData] = useState(true);
    const { businessUid: businessIdGlobal } = useGlobalState();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [tabWidth, setTabWidth] = useState('');
    const [datePickerWidth, setDatePickerWidth] = useState('');
    const [monthValue, setMonthValue] = useState<Date | null>(null);
    const [selectedWeekStartDate, setSelectedWeekStartDate] = React.useState<Dayjs | null>(null);
    const [hovered, setHovered] = useState<Date | null>(null);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const { timesheetsPanelActive, timesheetListPanelActive, setTimesheetsPanelActive, setTimesheetListPanelActive } = useNavigationContext();

    // run on component load
    useEffect(() => {
        fetchData();

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
            setTabWidth("320px")
        }
    }, [windowWidth]);

    useEffect(() => {
        if (isMobile || windowWidth < 800) {
            setDatePickerWidth("100%");
        }
        else {
            setDatePickerWidth("300px")
        }
    }, [isMobile]);

    // fetch data from api
    const fetchData = async () => {
        // fetch pdf data for the selected week
    };

    function handleWeekChange(startDate: Dayjs) {
        console.log("Parent received updated start date:", startDate);
        //setNewChanges(false);
        setSelectedWeekStartDate(startDate);
    }

    return (
        <>
            {windowWidth > 800 && (
                <Stack>
                    <Group>
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
                    </Group>
                    <Group align="flex-end" ml="md" mb="lg">
                        <ActionIcon
                            size="xl"
                            style={{ marginBottom: "3px" }}
                            radius="md"
                            color="#324D3E"
                        // onClick={() => {
                        //     if (unsavedChanges) {
                        //         setPrevWeekChange(true);
                        //     }
                        //     else {
                        //         if (weekValue) {
                        //             var tempValue = dayjs(getStartOfWeek(weekValue)).subtract(1, 'week').toDate();
                        //             setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                        //             handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                        //         }
                        //     }
                        // }}
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
                            // getDayProps={(date) => {
                            //     const isHovered = isInWeekRange(date, hovered);
                            //     const isSelected = isInWeekRange(date, weekValue);
                            //     const isInRange = isHovered || isSelected;
                            //     return {
                            //         onMouseEnter: () => setHovered(date),
                            //         onMouseLeave: () => setHovered(null),
                            //         inRange: isInRange,
                            //         firstInRange: isInRange && date.getDay() === 1,
                            //         lastInRange: isInRange && date.getDay() === 0,
                            //         selected: isSelected,
                            //         onClick: () => {
                            //             setWeekValue(getStartOfWeek(date));
                            //             handleWeekChange(dayjs(getStartOfWeek(date)));
                            //             // if (unsavedChanges) {
                            //             //     setWeekValueTemp(getStartOfWeek(date));
                            //             //     setWeekChange(true);
                            //             // }
                            //             // else {
                            //             //     setWeekValue(getStartOfWeek(date));
                            //             //     handleWeekChange(dayjs(getStartOfWeek(date)));
                            //             // }
                            //             //console.log(formatDateWeek(date));
                            //         },
                            //     };
                            // }}
                        />
                        <ActionIcon
                            size="xl"
                            radius="md"
                            style={{ marginBottom: "3px" }}
                            color="#324D3E"
                        // onClick={() => {
                        //     if (unsavedChanges) {
                        //         setNextWeekChange(true);
                        //     }
                        //     else {
                        //         if (weekValue) {
                        //             // Check if tempValue is not in the future
                        //             var today = dayjs();
                        //             var tempValue = dayjs(getStartOfWeek(weekValue)).add(1, 'week').toDate();
                        //             if (dayjs(tempValue).isBefore(dayjs(today))) {
                        //                 setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                        //                 handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                        //             }
                        //         }
                        //     }
                        // }}
                        >
                            <IconChevronRight />
                        </ActionIcon>
                    </Group>
                </Stack>

            )}
            {windowWidth < 800 && (
                <Grid align="flex-end" mb="20px" mt="lg">
                    <Grid.Col span={{ base: 12}}>
                        <Group>
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
                        </Group>
                    </Grid.Col>
                    {/* previous week button */}
                    <Grid.Col span={{ base: 2 }}>
                        <ActionIcon
                            size="xl"
                            style={{ marginBottom: "3px" }}
                            radius="md"
                            // onClick={() => {
                            //     if (unsavedChanges) {
                            //         setPrevWeekChange(true);
                            //     }
                            //     else {
                            //         if (weekValue) {
                            //             var tempValue = dayjs(getStartOfWeek(weekValue)).subtract(1, 'week').toDate();
                            //             setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                            //             handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                            //         }
                            //     }
                            // }}
                        >
                            <IconChevronLeft />
                        </ActionIcon>
                    </Grid.Col>
                        {/* Week picker */}
                    <Grid.Col span={{ base: 8 }}>
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
                            style={{ marginTop:"10px"}}
                            // getDayProps={(date) => {
                            //     const isHovered = isInWeekRange(date, hovered);
                            //     const isSelected = isInWeekRange(date, monthValue);
                            //     const isInRange = isHovered || isSelected;
                            //     return {
                            //         onMouseEnter: () => setHovered(date),
                            //         onMouseLeave: () => setHovered(null),
                            //         inRange: isInRange,
                            //         firstInRange: isInRange && date.getDay() === 1,
                            //         lastInRange: isInRange && date.getDay() === 0,
                            //         selected: isSelected,
                            //         onClick: () => {
                            //             setMonthValue(getStartOfWeek(date));
                            //             handleWeekChange(dayjs(getStartOfWeek(date)));
                            //             // if (unsavedChanges) {
                            //             //     setWeekValueTemp(getStartOfWeek(date));
                            //             //     setWeekChange(true);
                            //             // }
                            //             // else {
                            //             //     setWeekValue(getStartOfWeek(date));
                            //             //     handleWeekChange(dayjs(getStartOfWeek(date)));
                            //             // }
                            //             //console.log(formatDateWeek(date));
                            //         },
                            //     };
                            // }}
                        />
                    </Grid.Col>
                    {/* next week button */}
                    <Grid.Col span={{ base: 2 }}>
                        <ActionIcon
                            size="xl"
                            radius="md"
                            style={{ marginBottom: "3px" }}
                            // onClick={() => {
                            //     if (unsavedChanges) {
                            //         setNextWeekChange(true);
                            //     }
                            //     else {
                            //         if (weekValue) {
                            //             // Check if tempValue is not in the future
                            //             var today = dayjs();
                            //             var tempValue = dayjs(getStartOfWeek(weekValue)).add(1, 'week').toDate();
                            //             if (dayjs(tempValue).isBefore(dayjs(today))) {
                            //                 setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                            //                 handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                            //             }
                            //         }
                            //     }
                            // }}
                        >
                            <IconChevronRight />
                        </ActionIcon>
                    </Grid.Col>
                </Grid>
            )}
            
            <Tabs 
                variant="pills" 
                radius="md" 
                color="rgba(24,28,38,0.5)" 
                defaultValue="monday" 
                orientation={windowWidth < 800 ? "horizontal" : "vertical"}
            >
                <Tabs.List grow>
                    {windowWidth < 800 && (
                        <Paper shadow="md" p="sm" style={{ background: "#24352f", color: "#dcdcdc", borderRadius: "20px" }} className="sticky" >
                            <Group grow>
                                <Stack align="center" style={{ background: "#212735", borderRadius: "10px", paddingTop: "20px", paddingBottom: "20px" }}>
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
                                {/* <Stack align="center">
                                <Title order={3}>Sat</Title>
                                <Title order={2}>10</Title>
                            </Stack>
                            <Stack align="center">
                                <Title order={3}>Sun</Title>
                                <Title order={2}>11</Title>
                            </Stack> */}
                            </Group>
                        </Paper>
                    )}
                    {windowWidth > 800 && (
                        <Paper shadow="md" p="lg" mb="lg" ml="sm" mr="sm" radius="lg" style={{ background: "#24352f", width: tabWidth, color: "white" }}>
                            <Stack gap="xs">
                                <Tabs.Tab value="monday" p="md" style={{width:"100%"}} classNames={tabClasses}>
                                    <Stack>
                                        <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>January 1-7</Text>
                                        <Text size="25px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>2024</Text>
                                    </Stack>
                                </Tabs.Tab>
                                <Tabs.Tab value="tuesday" p="md" style={{width:"100%"}} classNames={tabClasses}>
                                    <Stack>
                                        <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>January 8-14</Text>
                                        <Text size="25px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>2024</Text>
                                    </Stack>
                                </Tabs.Tab>
                                <Tabs.Tab  value="wednesday" p="md" style={{width:"100%"}} classNames={tabClasses}>
                                    <Stack>
                                        <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>January 15-21</Text>
                                        <Text size="25px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>2024</Text>
                                    </Stack>
                                </Tabs.Tab>
                                <Tabs.Tab value="thursday" p="md" style={{width:"100%"}} classNames={tabClasses}>
                                    <Stack>
                                        <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>January 22-28</Text>
                                        <Text size="25px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>2024</Text>
                                    </Stack>
                                </Tabs.Tab>
                                <Tabs.Tab value="friday" p="md" style={{width:"100%"}} classNames={tabClasses}>
                                    <Stack>
                                        <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>January 29-31</Text>
                                        <Text size="25px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>2024</Text>
                                    </Stack>
                                </Tabs.Tab>
                            </Stack>
                        </Paper>
                    )}
                    
                    {/* {windowWidth < 800 && (
                        <Button
                            variant="light"
                            radius="md"
                            size="lg"
                            mt="lg"
                            mb="xl"
                            mr="sm"
                            ml="sm"
                            fullWidth
                        >
                            <Title order={4}>Export</Title>
                        </Button>
                    )}
                    {windowWidth > 800 && (
                        <Button
                            variant="light"
                            radius="md"
                            size="lg"
                            mb="xl"
                            mr="sm"
                            ml="sm"
                        >
                            <Title order={4}>Export</Title>
                        </Button>
                    )} */}
                    
                </Tabs.List>

                {/* TODO: map each day to its own panel */}
                <Tabs.Panel value="monday">
                    {pdfData && (
                        <Paper shadow="md" p="lg" ml="lg" mr="lg" radius="lg" style={{ background: "#24352f", maxWidth: "1200px", color: "white" }}>
                            <Group justify="space-between">
                                <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pdf file preview for Monday Jan 1 2024</Text>
                                <Button
                                    variant="light"
                                    radius="md"
                                    size="lg"
                                >
                                    <Title order={4}>Export</Title>
                                </Button>
                            </Group>
                            
                        </Paper>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="tuesday">
                    {pdfData && (
                        <Paper shadow="md" p="lg" ml="lg" mr="lg" radius="lg" style={{ background: "#24352f", maxWidth: "1200px", color: "white" }}>
                            <Group justify="space-between">
                                <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pdf file preview for Tuesday Jan 2 2024</Text>
                                <Button
                                    variant="light"
                                    radius="md"
                                    size="lg"
                                >
                                    <Title order={4}>Export</Title>
                                </Button>
                            </Group>
                        </Paper>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="wednesday">
                    {pdfData && (
                        <Paper shadow="md" p="lg" ml="lg" mr="lg" radius="lg" style={{ background: "#24352f", maxWidth: "1200px", color: "white" }}>
                            <Group justify="space-between">
                                <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pdf file preview for Wednesday Jan 3 2024</Text>
                                <Button
                                    variant="light"
                                    radius="md"
                                    size="lg"
                                >
                                    <Title order={4}>Export</Title>
                                </Button>
                            </Group>
                        </Paper>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="thursday">
                    {pdfData && (
                        <Paper shadow="md" p="lg" ml="lg" mr="lg" radius="lg" style={{ background: "#24352f", maxWidth: "1200px", color: "white" }}>
                            <Group justify="space-between">
                                <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pdf file preview for Thursday Jan 4 2024</Text>
                                <Button
                                    variant="light"
                                    radius="md"
                                    size="lg"
                                >
                                    <Title order={4}>Export</Title>
                                </Button>
                            </Group>
                        </Paper>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="friday">
                    {pdfData && (
                        <Paper shadow="md" p="lg" ml="lg" mr="lg" radius="lg" style={{ background: "#24352f", maxWidth: "1200px", color: "white" }}>
                            <Group justify="space-between">
                                <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pdf file preview for Friday Jan 5 2024</Text>
                                <Button
                                    variant="light"
                                    radius="md"
                                    size="lg"
                                >
                                    <Title order={4}>Export</Title>
                                </Button>
                            </Group>
                        </Paper>
                    )}
                </Tabs.Panel>
            </Tabs>


        </>
    );
}