import { Autocomplete, Button, Container, Grid, Group, Paper, Stack, Tabs, Title, Text, rem, Select } from "@mantine/core";
import { useEffect, useState } from "react";
import StaffSubmittedTimesheets from "./components/StaffSubmittedTimesheets";
import UnsubmittedTimesheets from "./components/UnsubmittedTimesheets";
import PendingChangesTimesheets from "./components/PendingChangesTimesheets";
import ArchivedTimesheets from "./components/ArchivedTimesheets";
import { DatePickerInput, getStartOfWeek } from "@mantine/dates";
import { businessListFormat, isInWeekRange } from "../../helpers/Helpers";
import dayjs, { Dayjs } from "dayjs";
import React from "react";
import SubmittedTimesheets from "./components/SubmittedTimesheets";
import { useMediaQuery } from "@mantine/hooks";
import classes from "../../css/TextInput.module.css";
import GenerateReport from "./components/GenerateReport";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../../css/Notifications.module.css";
import { IconCheck, IconX } from "@tabler/icons-react";
import { GetReports, PostDenyTimesheet, PostReport } from "../../helpers/Api";
import ArchivedReports from "./components/ArchivedReports";

export interface ArchivedReportData {
    id: string,
    start_date: string,
    end_date: string,
    regular_hours: number,
    total_hours: number,
    date_modified: string,
    pdf_url: string,
    type: string,
}

export interface ReportInfo {
    options: string[]
    report_type: string | null;
    data: string;
    start_date: string;
    end_date: string;
}

export default function ReportInbox() {
    const { user, business, businessList, session, setBusiness } = useAuth();
    const [archivedReportsData, setArchivedReportsData] = useState<ArchivedReportData[]>([]);
    const [notSubmittedData, setNotSubmittedData] = useState(true);
    const [archiveData, setArchiveData] = useState(true);
    const [pendingChangesData, setPendingChangesData] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [tabWidth, setTabWidth] = useState('');
    const [weekValue, setWeekValue] = useState<Date | null>(null);
    const [hovered, setHovered] = useState<Date | null>(null);
    const [selectedWeekStartDate, setSelectedWeekStartDate] = React.useState<Dayjs | null>(null);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [businessSelectData, setBusinessSelectData] = useState<any[]>([]);

    // run on component load
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

    useEffect(() => {
        if (windowWidth < 800) {
            setTabWidth("100%");
        }
        else {
            setTabWidth("300px")
        }
    }, [windowWidth]);

    // fetch data on component load
    useEffect(() => {
        fetchData();
    }, []);

    // run when business changes
    useEffect(() => {
        fetchData();
    }, [business]);

    function handleWeekChange(startDate: Dayjs) {
        console.log("Parent received updated start date:", startDate);
        setSelectedWeekStartDate(startDate);
    }

    async function fetchData() {
        if (user && business) {
            // get data for business select
            handleBusinessListFormat();

            // get archived report data
            var archivedReportData = await GetReports(business?.id, session?.access_token);
            setArchivedReportsData(archivedReportData);
        }
    }

    async function handleGenerateReport(reportInfo: ReportInfo) {
        if (user && business) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            // setup link based on report info
            let queryParams: { [key: string]: any } = {};
            queryParams['type'] = reportInfo.report_type;
            queryParams['period_start'] = reportInfo.start_date;
            queryParams['period_end'] = reportInfo.end_date;
            queryParams['data'] = reportInfo.data;

            // check for any optional params and add to query params if any
            reportInfo.options.forEach(option => {
                queryParams[option] = true;
            });

            var response = await PostReport(business?.id, queryParams, session?.access_token);
            if (response === 201) {
                // success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Report was generated',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                fetchData();
            }
            else {
                // error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error generating the report. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
        }
    }

    // handle business select change
    function handleSelectChange(value: string | null) {
        if (!user) return;
        
        user?.business_info.forEach((business: any) => {
            if (business.id === value) {
                setBusiness(business);
                localStorage.setItem("activeBusiness", JSON.stringify(business));
            }
        });
    }

    // format business data for select dropdown
    function handleBusinessListFormat() {
        setBusinessSelectData(businessListFormat(businessList));
    }

    const businessSelect = (
        <Paper shadow="md" p="lg" mb="lg" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
            <Stack>
                {business && (
                    <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{business?.name}</Text>
                )}
                {!business && (
                    <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Business centre</Text>
                )}

                {/* <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Business centre select</Text> */}
                {businessList?.length > 1 && (
                    <Select
                        id="business"
                        placeholder="Select a business to switch to"
                        size="lg"
                        data={businessSelectData}
                        classNames={classes}
                        onChange={(value) => handleSelectChange(value)}
                    >
                    </Select>
                )}
            </Stack>
        </Paper>
    );

    return (
        <>
            {/* <Container fluid> */}
            <Tabs variant="pills" radius="md" color="rgba(24,28,38,0.5)" defaultValue="generate" orientation={windowWidth < 800 ? "horizontal" : "vertical"}>
                <Tabs.List grow mr={isMobile ? "" : "md"}>
                    <Paper shadow="md" p="lg" mb="lg" radius="lg" style={{ background: "#25352F", width: "100%", color: "#dcdcdc" }}>
                        <Stack gap="xs">
                            <Tabs.Tab p="md" style={{ width: "100%" }} value="generate" classNames={classes}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Generate report</Text>
                            </Tabs.Tab>
                            <Tabs.Tab p="md" style={{ width: "100%" }} value="archive" classNames={classes}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>View reports</Text>
                            </Tabs.Tab>
                        </Stack>
                    </Paper>
                </Tabs.List>

                {/* TODO: map each day to its own panel */}
                <Tabs.Panel value="generate">
                    {/* business select */}
                    {businessSelect}

                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                        <Group justify="space-between" mb="lg">
                            <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Generate report</Text>
                        </Group>
                        <GenerateReport handleGenerate={handleGenerateReport} />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="archive">
                    {/* business select */}
                    {businessSelect}

                    {archiveData && (
                        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", maxWidth: "1200px", color: "#dcdcdc" }}>
                            <Stack>
                                <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>View archived reports</Text>

                                {/* TODO: FINISH FILTERING */}
                                {/* <Grid align="end">
                                        <Grid.Col span={{ base: 12, sm: 3 }}>
                                            <DatePickerInput
                                                withCellSpacing={false}
                                                maxDate={new Date()}
                                                size="lg"
                                                id="week-picker"
                                                label="Week of"
                                                placeholder="Select a week"
                                                value={weekValue}
                                                radius="md"
                                                style={{width:"100%", marginTop:"10px"}}
                                                classNames={classes}
                                                getDayProps={(date) => {
                                                    const isHovered = isInWeekRange(date, hovered);
                                                    const isSelected = isInWeekRange(date, weekValue);
                                                    const isInRange = isHovered || isSelected;
                                                    return {
                                                        onMouseEnter: () => setHovered(date),
                                                        onMouseLeave: () => setHovered(null),
                                                        inRange: isInRange,
                                                        firstInRange: isInRange && date.getDay() === 1,
                                                        lastInRange: isInRange && date.getDay() === 0,
                                                        selected: isSelected,
                                                        onClick: () => {
                                                            setWeekValue(getStartOfWeek(date));
                                                            handleWeekChange(dayjs(getStartOfWeek(date)));
                                                        },
                                                    };
                                                }}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, sm: 3}}>
                                            <Autocomplete
                                                label="Filter by person"
                                                placeholder="Pick a person"
                                                size="lg"
                                                radius="md"
                                                classNames={classes}
                                                data={['React', 'Angular', 'Vue', 'Svelte']}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{base: 12, sm: 3}}>
                                            <Autocomplete
                                                label="Filter by manager"
                                                placeholder="Pick a manager"
                                                size="lg"
                                                radius="md"
                                                classNames={classes}
                                                data={['React', 'Angular', 'Vue', 'Svelte']}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{base:12, sm:3}}>
                                            <Group>
                                                <Button
                                                    size="lg"
                                                    radius="md"
                                                    color="#316F22"
                                                >
                                                    Search
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    radius="md"
                                                    color="#354E40"
                                                >
                                                    Clear
                                                </Button>
                                            </Group>
                                        </Grid.Col>
                                    </Grid> */}
                                {archivedReportsData && (
                                    <ArchivedReports archivedReportData={archivedReportsData}/>
                                )}
                                
                            </Stack>
                        </Paper>
                    )}
                </Tabs.Panel>
            </Tabs>
            {/* </Container> */}


        </>
    );
}