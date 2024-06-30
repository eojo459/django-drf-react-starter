import { ActionIcon, Avatar, Badge, Button, Grid, Group, Paper, Space, Stack, Title, Text, Box, Loader, ScrollArea } from "@mantine/core";
import { IconUser, IconBriefcase2, IconBuilding, IconCalendar, IconDeviceMobile, IconDeviceLandlinePhone, IconPhone, IconMail, IconDots, IconActivity, IconSortAscendingNumbers, IconBadge, IconChristmasBall, IconClockPlay, IconBeach, IconReportMedical, IconCoin, IconHourglass, IconCalendarMonth, IconCalendarExclamation, IconCalendarEvent } from "@tabler/icons-react";
import ActivityTimeline from "./ActivityTimeline";
import { StaffWorkingHours, UserProfileModel } from "./UserProfile";
import ProfileEditModal from "../pages/staff-dashboard/components/ProfileEditModal";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { GetStaffActivityLogsByUid, getUserById } from "../helpers/Api";
import { useAuth } from "../authentication/SupabaseAuthContext";
import { UserActivityModel } from "./HomePanel";
import { dateToWords, sortTimestampsNewest } from "../helpers/Helpers";

interface IProfilePanel {
    user: UserProfileModel;
    staffWorkingHours?: StaffWorkingHours;
    handleDataChange: (flag: boolean) => void;
}

export function ProfilePanel(props: IProfilePanel) {
    const { user, session } = useAuth();
    const [profileModalOpened, { open: openProfileModal, close: closeProfileModal }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [workPhoneVisible, setWorkPhoneVisible] = useState(false);
    const [homePhoneVisible, setHomePhoneVisible] = useState(false);
    const [userData, setUserData] = useState<UserProfileModel | null>(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [staffActivityLog, setStaffActivityLog] = useState<UserActivityModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [scrollAreaSize, setScrollAreaSize] = useState(50);

    // props
    const userProp = props.user;
    const staffWorkingHoursProp = props.staffWorkingHours;
    const handleDataChange = props.handleDataChange;

    useEffect(() => {
        setUserData(userProp);
    }, [userProp]);

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
        fetchData();
    },[]);

    function handleScrollAreaSize(activityLogs: any) {
        if (activityLogs.length > 5) {
            setScrollAreaSize(800);
        }
        else if (activityLogs.length > 3) {
            setScrollAreaSize(500);
        }
        else if (activityLogs.length > 1) {
            setScrollAreaSize(350);
        }
    }

    function formatJoinDate(date: string | undefined) {
        if (date != null && date != undefined && date != "") {
            const newDate = new Date(date);
            return newDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        }
        else {
            return "";
        }  
    }

    function formatDate(date: string | undefined) {
        if (date != null && date != undefined && date != "") {
            const newDate = new Date(date);
            return newDate.toDateString();
        }
        else {
            return "";
        }  
    }

    async function fetchData() {
        if (userProp) {
            // get all current user activity for the day
            setLoading(true);
            var staffActivityLogData = await GetStaffActivityLogsByUid(userProp?.business_info[0]?.id, userProp?.uid, session?.access_token);
            setStaffActivityLog(sortTimestampsNewest(staffActivityLogData));
            setLoading(false);

            // setup scroll area size
            handleScrollAreaSize(staffActivityLogData);
        }
    }

    async function handleFormSubmitted(flag: boolean) {
        if (flag) {
            // get new updated data from database
            var userData = await getUserById(userProp.uid, session?.access_token);
            setUserData(userData);
            handleDataChange(true);
        }
    }

    return (
        <>
            {profileModalOpened && (
                <ProfileEditModal 
                    user={userProp}
                    modalOpened={profileModalOpened} 
                    isMobile={isMobile !== undefined ? isMobile : false} 
                    closeModal={closeProfileModal} 
                    formSubmitted={handleFormSubmitted}
                    //userProfileData={userProfileData}
                />
            )}
            <Grid>
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Stack>
                        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", width: "100%", color: "#dcdcdc" }}>
                            <Stack>
                                <Text size={isMobile ? "25px" : "30px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>
                                    About
                                </Text>
                                <Group>
                                    <IconUser />
                                    <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor:"#182420", borderRadius:"10px" }}> 
                                        <Text size="lg" fw={600}>{userData?.first_name + " " + userData?.last_name}</Text>
                                    </Box>
                                </Group>
                                <Group>
                                    <IconBriefcase2 />
                                    <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor:"#182420", borderRadius:"10px" }}>
                                        <Text size="lg" style={{ fontFamily:"Ak-Medium"}}>{userData?.position?.label}</Text>
                                    </Box>
                                </Group>
                                <Group>
                                    <IconBuilding />
                                    <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor:"#182420", borderRadius:"10px" }}>
                                        {userData?.business_info && userData?.business_info.length > 0 && (
                                            <Text size="lg" fw={600}>{userData?.business_info[0]?.name}</Text>
                                        )}
                                        {userData?.business_info && !(userData?.business_info.length > 0) && (
                                            <Text size="lg" fw={600}>-</Text>
                                        )}
                                    </Box>
                                </Group>
                                <Group>
                                    <IconCalendar />
                                    <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor:"#182420", borderRadius:"10px" }}>
                                        <Text size="lg" fw={600}>Joined {dateToWords(userData?.date_joined, undefined, false)}</Text>
                                    </Box>
                                </Group>

                                <Space h="xs" />

                                <Text size={isMobile ? "25px" : "30px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>
                                    Contact
                                </Text>
                                <Group>
                                    <IconDeviceMobile />
                                    <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor:"#182420", borderRadius:"10px" }}>
                                        <Text size="lg" fw={600}>{userData?.cell_number}</Text>
                                    </Box>
                                </Group>
                                {workPhoneVisible && (
                                    <Group>
                                        <IconDeviceLandlinePhone />
                                        <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor: "#182420", borderRadius: "10px" }}>
                                            <Text size="lg" fw={600}>{userData?.work_number}</Text>
                                        </Box>
                                    </Group>
                                )}
                                {homePhoneVisible && (
                                    <Group>
                                        <IconPhone />
                                        <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor: "#182420", borderRadius:"10px" }}>
                                            <Text size="lg" fw={600}>{userData?.home_number}</Text>
                                        </Box>
                                    </Group>
                                )}
                                <Group>
                                    <IconMail />
                                    <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor:"#182420", borderRadius:"10px" }}>
                                        <Text size="lg" fw={600}>{userData?.email}</Text>
                                    </Box>
                                </Group>

                                {user?.working_hours?.is_manager && (
                                    <>
                                        <Space h="xs" />

                                        <Text size={isMobile ? "25px" : "30px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>
                                            Employment
                                        </Text>
                                        {userData?.working_hours?.level && (
                                            <Group>
                                                <IconBadge />
                                                <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor: "#182420", borderRadius: "10px" }}>
                                                <Text size="lg" fw={600}>Level {userData?.working_hours?.level}</Text>
                                                </Box>
                                            </Group>
                                        )}
                                        <Group>
                                            <IconCalendarEvent />
                                            <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor: "#182420", borderRadius: "10px" }}>
                                            <Text size="lg" fw={600}>Start date : {dateToWords(userData?.working_hours?.start_date, 'short')}</Text>
                                            </Box>
                                        </Group>
                                        <Group>
                                            <IconCalendarExclamation />
                                            <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor: "#182420", borderRadius: "10px" }}>
                                            <Text size="lg" fw={600}>End date :  {userData?.working_hours?.end_date ? dateToWords(userData?.working_hours?.end_date, 'short') : "--"}</Text>
                                            </Box>
                                        </Group>
                                        <Group>
                                            <IconCalendarMonth />
                                            <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor: "#182420", borderRadius: "10px" }}>
                                            <Text size="lg" fw={600}>{userData?.working_hours?.full_time ? "Full-time : ✅" : "Part-time : ✅"}</Text>
                                            </Box>
                                        </Group>
                                        <Group>
                                            <IconHourglass />
                                            <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor: "#182420", borderRadius: "10px" }}>
                                            <Text size="lg" fw={600}>{userData?.working_hours?.salaried ? "Salaried : ✅" : "Hourly pay : ✅"}</Text>
                                            </Box>
                                        </Group>
                                        <Group>
                                            <IconCoin />
                                            <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor: "#182420", borderRadius: "10px" }}>
                                            <Text size="lg" fw={600}>Pay rate : ${userData?.working_hours?.pay_rate} {userData?.working_hours?.salaried ? " per year" : " /hr"}</Text>
                                            </Box>
                                        </Group>
                                        
                                        {/* pay options */}
                                        <Group>
                                            <IconChristmasBall />
                                            <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor: "#182420", borderRadius: "10px" }}>
                                                <Text size="lg" fw={600}>Holiday pay : {userData?.working_hours?.holiday_allowed ? "✅" : "❌"}</Text>
                                            </Box>
                                        </Group>
                                        <Group>
                                            <IconClockPlay />
                                            <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor: "#182420", borderRadius: "10px" }}>
                                            <Text size="lg" fw={600}>Overtime pay : {userData?.working_hours?.overtime_allowed ? "✅" : "❌"}</Text>
                                            </Box>
                                        </Group>
                                        <Group>
                                            <IconBeach />
                                            <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor: "#182420", borderRadius: "10px" }}>
                                            <Text size="lg" fw={600}>Vacation pay : {userData?.working_hours?.vacation_allowed ? "✅" : "❌"}</Text>
                                            </Box>
                                        </Group>
                                        <Group>
                                            <IconReportMedical />
                                            <Box p="5px" pl="8px" pr="8px" style={{ backgroundColor: "#182420", borderRadius: "10px" }}>
                                            <Text size="lg" fw={600}>Sick leave pay : {userData?.working_hours?.sick_allowed ? "✅" : "❌"}</Text>
                                            </Box>
                                        </Group>
                                        
                                    </>
                                )}

                                {user?.working_hours?.is_manager && (
                                    <Button size="lg" radius="md" color="#324D3E" fullWidth onClick={openProfileModal}>
                                        Edit profile
                                    </Button>
                                )}
                            </Stack>
                        </Paper>
                        {/* <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", width: "100%", color: "white" }}>
                            <Stack>
                                <Title order={2}>Groups</Title>
                                <Stack>
                                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#212735", color: "white" }}>
                                        <Grid align="center">
                                            <Grid.Col span={{ base: 3 }}>
                                                <Avatar size="lg" style={{ background: "#323c43db" }}>C</Avatar>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 7 }}>
                                                <Stack gap="xs">
                                                    <Text size="lg" fw={800}>Chef</Text>
                                                    <Text size="md" fw={600}>4 Members</Text>
                                                </Stack>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 2 }}>
                                                <ActionIcon variant="subtle" color="gray">
                                                    <IconDots />
                                                </ActionIcon>
                                            </Grid.Col>
                                        </Grid>
                                    </Paper>
                                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#212735", color: "white" }}>
                                        <Grid align="center">
                                            <Grid.Col span={{ base: 3 }}>
                                                <Avatar size="lg" style={{ background: "#323c43db" }}>A</Avatar>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 7 }}>
                                                <Stack gap="xs">
                                                    <Text size="lg" fw={800}>Astronaut</Text>
                                                    <Text size="md" fw={600}>7 Members</Text>
                                                </Stack>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 2 }}>
                                                <ActionIcon variant="subtle" color="gray">
                                                    <IconDots />
                                                </ActionIcon>
                                            </Grid.Col>
                                        </Grid>
                                    </Paper>
                                    <Button
                                        variant="light"
                                        radius="md"
                                        size="md"
                                        fullWidth
                                        //onClick={handleGroupsPanelChange}
                                    >
                                        <Title order={4}>View all groups</Title>
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper> */}
                    </Stack>

                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", width: "100%", color: "#dcdcdc" }}>
                        <Grid>
                            <Grid.Col span={{ base: 12 }}>
                                {/* TODO: SORT BY DESCENDING (show newest activity first, then oldest (first in the day)) */}
                                <Text size={isMobile ? "25px" : "30px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>
                                    {userData?.first_name ? userData?.first_name : "User"}'s activity today
                                </Text>
                                {/* {(isMobile || windowWidth < 1450) && (
                                    <Grid align="center">
                                        <Grid.Col span={{ base: 1 }} mr="10px">
                                            <IconActivity style={{ color: "#4a8a2a", width: "40px", height: "40px" }} />
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 9 }}>
                                            <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>
                                                {userData?.first_name ? userData?.first_name : "User"}'s activity
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 1}}>
                                            <Group justify="end">
                                                <ActionIcon variant="light" c="white" size="xl">
                                                    <IconSortAscendingNumbers />
                                                </ActionIcon>
                                            </Group>
                                            
                                        </Grid.Col>
                                    </Grid>
                                )}
                                {!isMobile && windowWidth > 1450 && (
                                    <>
                                        <Group justify="space-between">
                                            <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>
                                                <IconActivity style={{ marginRight:"20px", color: "#4a8a2a", width: "35px", height: "35px" }} />
                                                {userData?.first_name ? userData?.first_name : "User"}'s activity
                                            </Text>
                                            <ActionIcon variant="light" c="white" size="lg">
                                                <IconSortAscendingNumbers />
                                            </ActionIcon>
                                        </Group>
                                    </>
                                )} */}


                                {/* <Group justify="space-between">
                                        <Title order={3}>Shift activity</Title>
                                        <Button variant="light" size="md" radius="md" color="gray">View timesheet</Button>
                                    </Group> */}
                            </Grid.Col>
                            <Grid.Col span={{ base: 12 }}>
                                <Stack gap="lg">
                                    {loading && (
                                        <Group justify="center" mt="lg">
                                            <Loader color="cyan" />
                                        </Group>
                                    )}
                                    {staffActivityLog?.length > 0 && !loading && (
                                        <ScrollArea h={scrollAreaSize}>
                                            <ActivityTimeline activityLogData={staffActivityLog} />
                                        </ScrollArea>
                                    )}
                                    {staffActivityLog?.length <= 0 && !loading && (
                                        <Group justify="center" mt="lg">
                                            <Text c="#c1c0c0" size="lg" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>Nothing found</Text>
                                        </Group> 
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