import { Badge, Button, Grid, Group, Paper, Stack, Title, Text, Tabs, ActionIcon, ScrollArea, Loader, Select } from "@mantine/core";
import { IconActivity, IconSortAscendingNumbers, IconSortDescendingNumbers } from "@tabler/icons-react";
import ActivityTimeline from "./ActivityTimeline";
import { useEffect, useState } from "react";
import TeamMemberListModal from "../pages/staff-dashboard/components/TeamMembersListModal";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { TeamMemberData, ITeamStatus, TeamStatus } from "./TeamStatus";
import { AreaChart } from '@mantine/charts';
import classes from '../css/HomePanel.module.css';
import textClasses from "../css/TextInput.module.css";
import { useAuth } from "../authentication/SupabaseAuthContext";
import { GetBusinessById, GetStaffActivity, GetStaffActivityLogs, GetTotalMonthlyStats, GetUserActivity } from "../helpers/Api";
import { businessListFormat, sortTimestampsNewest, sortTimestampsOldest, updateTime } from "../helpers/Helpers";
import { BusinessProfile } from "../pages/owner-dashboard/business/components/CentreInformation";
//import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    {
        month: "Jan",
        hours: "0",
        wages: "0",
    },
    {
        month: "Feb",
        hours: "0",
        wages: "0",
    },
    {
        month: "Mar",
        hours: "0",
        wages: "0",
    },
    {
        month: "Apr",
        hours: "0",
        wages: "0",
    },
    {
        month: "May",
        hours: "0",
        wages: "0",
    },
    {
        month: "Jun",
        hours: "0",
        wages: "0",
    },
    {
        month: "Jul",
        hours: "0",
        wages: "0",
    },
    {
        month: "Aug",
        hours: "0",
        wages: "0",
    },
    {
        month: "Sep",
        hours: "0",
        wages: "0",
    },
    {
        month: "Oct",
        hours: "0",
        wages: "0",
    },
    {
        month: "Nov",
        hours: "0",
        wages: "0",
    },
    {
        month: "Dec",
        hours: "0",
        wages: "0",
    },
];

export type UserActivityModel = {
    uid: string;
    business_id: string;
    first_name: string;
    last_name: string;
    position: string;
    status: number;
    date: string;
    timestamp: string;
};

export type StaffActivity = {
    staff_activity: UserActivityModel[];
    total_in_count: number;
    total_out_count: number;
    total_break_count: number;
    total_user_count: number;
}

export type UserActivity = {
    user_activity: UserActivityModel[];
    total_in_count: number;
    total_out_count: number;
    total_break_count: number;
    total_user_count: number;
}

export type MonthlyTotalHours = {
    id: string;
    business_id: string;
    total_hours: number;
    month: number;
};

export type MonthlyTotalWages = {
    id: string;
    business_id: string;
    total_wages: number;
    month: number;
};

export type MonthlyStatItem = {
    month: number;
    month_str: string;
    hours: number;
    wages: number;
    fees?: number;
};

export type UserStatus = {
    user_uid: string;
    first_name: string;
    last_name: string;
    position: string;
    business_id: string;
    status: number;
    date: string;
    timestamp: string;
};

export function HomePanel() {
    const { user, business, businessList, session, setBusiness } = useAuth();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [teamMemberModalOpened, { open: openTeamMemberModal, close: closeTeamMemberModal }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [activeTab, setActiveTab] = useState<string | null>('staff');
    const [activeChartTab, setActiveChartTab] = useState<string | null>('hours');
    const [staffActivity, setStaffActivity] = useState<StaffActivity>();
    const [userActivity, setUserActivity] = useState<UserActivity>();
    const [activityLogs, setActivityLogs] = useState<UserActivityModel[]>([]);
    const [activityLogsSorted, setActivityLogsSorted] = useState<UserActivityModel[]>([]);
    const [monthlyTotalStats, setMonthlyTotalStats] = useState<MonthlyStatItem[]>([]);
    const [monthlyTotalUserHours, setMonthlyTotalUserHours] = useState<MonthlyTotalHours>();
    const [monthlyTotalStaffWages, setMonthlyTotalStaffWages] = useState<MonthlyTotalWages>();
    const [monthlyTotalUserWages, setMonthlyTotalUserWages] = useState<MonthlyTotalWages>();
    const [businessPlan, setBusinessPlan] = useState('');
    const [loading, setLoading] = useState(true);
    const [timestampSortBy, setTimestampSortBy] = useState('new'); // new or old
    const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>('');
    const [currentTimeHours, setCurrentTimeHours] = useState(new Date().getHours());
    const [currentDay, setCurrentDay] = useState(new Date());
    const [scrollAreaSize, setScrollAreaSize] = useState(50);
    const [multipleBusinesses, setMultipleBusinesses] = useState(true);
    const [businessData, setBusinessData] = useState<BusinessProfile>();
    const [businessSelectData, setBusinessSelectData] = useState<any[]>([]);

    var teamData: TeamMemberData[] = [];

    // track current time
    useEffect(() => {
        var updatedTime = updateTime();
        setCurrentTimeHours(updatedTime?.hours);
        setCurrentTimeFormatted(updatedTime?.formattedTime);

        // Update the time every second
        const intervalId = setInterval(handleUpdateTime, 1000);

        // Cleanup function to clear the interval
        return () => clearInterval(intervalId);
    }, []);

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

    // fetch data on component load
    useEffect(() => {
        fetchData();
    }, []);

    // fetch data when business changes
    useEffect(() => {
        fetchData();
    }, [business]);

    async function fetchData() {
        if (user && business) {
            // handle multiple businesses select dropdown data
            handleBusinessListFormat();

            // get current staff activity
            var staffActivityData = await GetStaffActivity(business?.id, session?.access_token);
            setStaffActivity(staffActivityData);

            // get current user activity
            var userActivityData = await GetUserActivity(business?.id, session?.access_token);
            setUserActivity(userActivityData);

            // get total monthly staff & user hours and wages
            var totalMonthlyStats = await GetTotalMonthlyStats(business?.id, session?.access_token);
            totalMonthlyStats.sort((a: any, b: any) => a.month - b.month);
            setMonthlyTotalStats(totalMonthlyStats);

            // TODO: get total monthly user fees

            // get all todays activity - sort by newest
            var activityLogsData = await GetStaffActivityLogs(business?.id, session?.access_token);
            setActivityLogs(sortTimestampsNewest(activityLogsData));

            // get scroll size for activity logs
            handleScrollAreaSize(activityLogsData);

            setLoading(false);
        }
    };

    function handleScrollAreaSize(activityLogs: any) {
        if (activityLogs.length > 1) {
            setScrollAreaSize(700);
        }
        else {
            setScrollAreaSize(350);
        }
    }

    // handle updating the time
    function handleUpdateTime() {
        var updatedTime = updateTime();
        setCurrentTimeHours(updatedTime?.hours);
        setCurrentTimeFormatted(updatedTime?.formattedTime);
    }

    // handle timeline activity sorting
    function handleTimestampSort() {
        if (timestampSortBy === 'new' && activityLogs) {
            // change to sort by old
            setActivityLogsSorted(sortTimestampsOldest(activityLogs));
            setTimestampSortBy('old');
        }
        else if (timestampSortBy !== 'new' && activityLogs) {
            // change to sort by new
            setActivityLogsSorted(sortTimestampsNewest(activityLogs));
            setTimestampSortBy('new');
        }
    }

    // format business data for select dropdown
    function handleBusinessListFormat() {
        setBusinessSelectData(businessListFormat(businessList));
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

    return (
        <>
            {/* {teamMemberModalOpened && (
                <TeamMemberListModal 
                    modalOpened={teamMemberModalOpened} 
                    isMobile={isMobile != undefined ? isMobile : false} 
                    closeModal={closeTeamMemberModal} 
                />
            )} */}
            <Grid style={{ color: "#dcdcdc" }}>
                <Grid.Col span={{ base: 12 }}>
                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
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
                                    classNames={textClasses}
                                    onChange={(value) => handleSelectChange(value)}
                                >
                                </Select>
                            )}
                        </Stack>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack>
                        {/* team status */}
                        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                            <Stack>
                                {isMobile && (
                                    <Grid>
                                        <Grid.Col span={{ base: 12 }}>
                                            {currentTimeHours < 12 && (
                                                <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>👋 Good morning</Text>
                                            )}
                                            {currentTimeHours >= 12 && currentTimeHours < 17 && (
                                                <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>👋 Good afternoon</Text>
                                            )}
                                            {currentTimeHours >= 17 && (
                                                <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>👋 Good evening</Text>
                                            )}
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12 }}>
                                            <Group>
                                                <Badge size="55px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                                    <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px", color: "#dcdcdc" }}>{currentTimeFormatted}</Text>
                                                </Badge>
                                            </Group>
                                        </Grid.Col>
                                    </Grid>
                                )}

                                {!isMobile && (
                                    <Group justify="space-between">
                                        {currentTimeHours < 12 && (
                                            <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>👋 Good morning</Text>
                                        )}
                                        {currentTimeHours >= 12 && currentTimeHours < 17 && (
                                            <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>👋 Good afternoon</Text>
                                        )}
                                        {currentTimeHours >= 17 && (
                                            <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>👋 Good evening</Text>
                                        )}
                                        <Group>
                                            <Badge size="55px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                                <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px", color: "#dcdcdc" }}>{currentTimeFormatted}</Text>
                                            </Badge>
                                        </Group>
                                    </Group>
                                )}
                                <Grid>
                                    <Grid.Col span={{ base: 12 }}>
                                        <Tabs value={activeTab} onChange={setActiveTab} variant="pills" color="rgba(24,28,38,0.5)" radius="md">
                                            
                                            {/* <Tabs.List style={{ color: "#dcdcdc" }}>
                                                <Tabs.Tab value="staff" p="md" classNames={classes}>
                                                    <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Staff employees</Text>
                                                </Tabs.Tab>
                                                <Tabs.Tab value="user" p="md" classNames={classes} disabled>
                                                    <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Users</Text>
                                                </Tabs.Tab>
                                            </Tabs.List> */}

                                            <Tabs.Panel value="staff">
                                                {staffActivity && (
                                                    <TeamStatus 
                                                        type="STAFF" 
                                                        staffData={staffActivity} 
                                                        currentTime={currentTimeFormatted}
                                                    />
                                                )}
                                                
                                            </Tabs.Panel>
                                            <Tabs.Panel value="user">
                                                {userActivity && (
                                                    <TeamStatus 
                                                        type="USER" 
                                                        userData={userActivity} 
                                                        currentTime={currentTimeFormatted}
                                                    />
                                                )}
                                            </Tabs.Panel>
                                        </Tabs>
                                    </Grid.Col>
                                </Grid>
                            </Stack>
                        </Paper>

                        {/* charts */}
                        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                            <Stack>
                                {activeChartTab === "hours" && (
                                    <Text 
                                        size={isMobile ? "30px" : "35px"}
                                        fw={600} 
                                        //ta="center"
                                        style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                                    >
                                        Total hours
                                    </Text>
                                )}
                                {activeChartTab === "wages" && (
                                    <Text 
                                        size={isMobile ? "30px" : "35px"}
                                        fw={600} 
                                       //ta="center"
                                        style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                                    >
                                        Total wages
                                    </Text>
                                )}
                                <Grid>
                                    <Grid.Col span={{ base: 12 }}>
                                        <Tabs value={activeChartTab} onChange={setActiveChartTab} variant="pills" color="rgba(24,28,38,0.5)" radius="md">
                                            <Tabs.List style={{ color: "#dcdcdc" }} grow>
                                                <Tabs.Tab value="hours" p="md" classNames={classes}>
                                                    <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Hours</Text>
                                                </Tabs.Tab>

                                                {/* TODO: toggle wages visibility based on business option*/}
                                                <Tabs.Tab value="wages" p="md" classNames={classes}>
                                                    <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Wages</Text>
                                                </Tabs.Tab>
                                            </Tabs.List>

                                            <Tabs.Panel value="hours">
                                                <AreaChart
                                                    //h={300}
                                                    h={300}
                                                    w="100%"
                                                    mt="lg"
                                                    data={monthlyTotalStats}
                                                    dataKey="month_str"
                                                    withLegend
                                                    unit=" Hrs"
                                                    valueFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
                                                    legendProps={{ verticalAlign: 'bottom', height: 50 }}
                                                    series={[
                                                        { name: 'hours', label: 'Total hours', color: 'rgba(74,138,42,1)' },
                                                    ]}
                                                    curveType="linear"
                                                />
                                            </Tabs.Panel>
                                            <Tabs.Panel value="wages" h={300} w="100%">
                                                <AreaChart
                                                    h={300}
                                                    w="100%"
                                                    mt="lg"
                                                    data={monthlyTotalStats}
                                                    dataKey="month_str"
                                                    withLegend
                                                    unit="$"
                                                    valueFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
                                                    legendProps={{ verticalAlign: 'bottom', height: 50 }}
                                                    series={[
                                                        { name: 'wages', label: 'Total wages', color: 'rgba(74,138,42,1)' },
                                                    ]}
                                                    curveType="linear"
                                                />
                                            </Tabs.Panel>
                                        </Tabs>
                                    </Grid.Col>
                                </Grid>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                        <Grid>
                            <Grid.Col span={{ base: 12 }}>
                                {/* TODO: SORT BY DESCENDING (show newest activity first, then oldest (first in the day)) */}
                                <Text 
                                    size={isMobile ? "30px" : "35px"} 
                                    fw={600} 
                                    //ta="center" 
                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                                >
                                    {currentDay.toDateString()} activity
                                </Text>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12 }}>
                                <Stack gap="lg" mt="lg">
                                    {loading && (
                                        <Group justify="center">
                                            <Loader color="cyan" />
                                        </Group>
                                    )}
                                    {activityLogs && !loading && activityLogsSorted.length < 1 && (
                                        <ScrollArea h={scrollAreaSize}>
                                            <ActivityTimeline activityLogData={activityLogs}/>
                                        </ScrollArea>
                                    )}
                                    {activityLogsSorted.length > 0 && !loading && (
                                        <ScrollArea h={800}>
                                            <ActivityTimeline activityLogData={activityLogsSorted}/>
                                        </ScrollArea>
                                    )}
                                </Stack>
                            </Grid.Col>
                            {/* <Grid.Col span={{ base: 12, sm: 5}}>
                                <Stack>
                                    <Button size="md" radius="md" style={{ height: "100px" }}>
                                        Clock in
                                    </Button>
                                    <Button size="md" radius="md" style={{ height: "100px" }}>
                                        Go on break
                                    </Button>
                                    <Button size="md" radius="md" style={{ height: "100px" }}>
                                        Clock out
                                    </Button>
                                </Stack>
                            </Grid.Col> */}
                        </Grid>
                    </Paper>
                </Grid.Col>
            </Grid>
        </>
    );
}