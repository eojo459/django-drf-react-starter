import { Card, Text, SimpleGrid, UnstyledButton, Anchor, Group, useMantineTheme, Container, Paper, Stack, Image, Button, Space, TextInput, Grid, Box, Loader } from '@mantine/core';
import {
    IconCreditCard,
    IconBuildingBank,
    IconRepeat,
    IconReceiptRefund,
    IconReceipt,
    IconReceiptTax,
    IconReport,
    IconCashBanknote,
    IconCoin,
    IconClock,
    IconSettings,
    IconHome,
    IconUserPlus,
    IconCalendarTime,
    IconTool,
    IconInbox,
    IconMail,
    IconFileDescription,
} from '@tabler/icons-react';
import classes from "../css/AppMenu.module.css";
import vsLogo from '../assets/VerifiedHoursLogo2.png';
import { useMediaQuery } from '@mantine/hooks';
import { useNavigationContext } from '../context/NavigationContext';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { useEffect } from 'react';
import { GenerateUUID } from '../helpers/Helpers';

const mockdata = [
    { title: 'Credit cards', icon: IconCreditCard, color: 'violet' },
    { title: 'Banks nearby', icon: IconBuildingBank, color: 'indigo' },
    { title: 'Transfers', icon: IconRepeat, color: 'blue' },
    { title: 'Refunds', icon: IconReceiptRefund, color: 'green' },
    { title: 'Receipts', icon: IconReceipt, color: 'teal' },
    { title: 'Taxes', icon: IconReceiptTax, color: 'cyan' },
    { title: 'Reports', icon: IconReport, color: 'pink' },
    { title: 'Payments', icon: IconCoin, color: 'red' },
    { title: 'Cashback', icon: IconCashBanknote, color: 'orange' },
];

const ownerData = [
    { title: 'Dashboard', icon: IconHome, link: 'home' },
    { title: 'Registration', icon: IconUserPlus, link: 'registration' },
    { title: 'Attendance', icon: IconCalendarTime, link: 'attendance' },
    { title: 'Management', icon: IconTool, link: 'management' },
    { title: 'Inbox', icon: IconMail, link: 'inbox' },
    { title: 'Reports', icon: IconFileDescription, link: 'report' },
    { title: 'Settings', icon: IconSettings, link: 'settings' },
];

const staffManagerData = [
    { title: 'Clock in', icon: IconClock, link: 'clockIn' },
    { title: 'Timesheet', icon: IconBuildingBank, link: 'timesheetInbox' },
    { title: 'Registration', icon: IconUserPlus, link: 'registration' },
    { title: 'Attendance', icon: IconCalendarTime, link: 'attendance' },
    { title: 'Management', icon: IconTool, link: 'management' },
    { title: 'Inbox', icon: IconMail, link: 'inbox' },
    { title: 'Settings', icon: IconSettings, link: 'settings' },
];

const staffData = [
    { title: 'Clock in', icon: IconClock, link: 'clockin' },
    { title: 'Timesheet', icon: IconReport, link: 'timesheetInbox' },
    { title: 'Settings', icon: IconSettings, link: 'settings' },
];

export function AppMenu() {
    const { user } = useAuth();
    const theme = useMantineTheme();
    const isMobile = useMediaQuery('(max-width: 50em)');
    const { active, setActive } = useNavigationContext();

    const items = mockdata.map((item) => (
        <UnstyledButton key={item.title} className={classes.item}>
            <item.icon color={theme.colors[item.color][6]} size="2rem" />
            <Text size="xs" mt={7}>
                {item.title}
            </Text>
        </UnstyledButton>
    ));

    const ownerAppMenuItems = ownerData.map((item) => (
        item.title === "Settings" ? (
            <Grid.Col span={{ base: 12, md: 4 }} key={GenerateUUID()}>
                <Paper
                    p="lg"
                    style={{ background: "#356d1a", cursor: "pointer" }}
                    onClick={() => handleButtonClick(item.link)}
                >
                    <Stack align="center">
                        <Box style={{
                            padding: "10px",
                            backgroundColor: "rgba(33, 74, 13,0.3)",
                            borderRadius: "10px"
                        }}
                        >
                            <item.icon style={{ width: "50px", height: "50px" }}/>
                            {/* <IconHome style={{ width: "50px", height: "50px" }} /> */}
                        </Box>

                        <Text size={isMobile ? "20px" : "30px"} style={{ fontFamily: "AK-Medium" }}>{item.title}</Text>
                    </Stack>
                </Paper>
            </Grid.Col>
        ) : (
            <Grid.Col span={{ base: 6, md: 4 }} key={GenerateUUID()}>
                <Paper
                    p="lg"
                    style={{ background: "#356d1a", cursor: "pointer" }}
                    onClick={() => handleButtonClick(item.link)}
                >
                    <Stack align="center">
                        <Box style={{
                            padding: "10px",
                            backgroundColor: "rgba(33, 74, 13,0.3)",
                            borderRadius: "10px"
                        }}
                        >
                            <item.icon style={{ width: "50px", height: "50px" }}/>
                            {/* <IconReport style={{ width: "50px", height: "50px" }} /> */}
                        </Box>

                        <Text size={isMobile ? "20px" : "30px"} style={{ fontFamily: "AK-Medium" }}>{item.title}</Text>
                    </Stack>
                </Paper>
            </Grid.Col>
        )
    ));

    const staffAppMenuItems = staffData.map((item) => (
        item.title === "Settings" ? (
            <Grid.Col span={{ base: 12, md: 4 }} key={GenerateUUID()}>
                <Paper
                    p="lg"
                    style={{ background: "#356d1a", cursor: "pointer" }}
                    onClick={() => handleButtonClick(item.link)}
                >
                    <Stack align="center">
                        <Box style={{
                            padding: "10px",
                            backgroundColor: "rgba(33, 74, 13,0.3)",
                            borderRadius: "10px"
                        }}
                        >
                            <item.icon style={{ width: "50px", height: "50px" }} />
                        </Box>

                        <Text size={isMobile ? "20px" : "30px"} style={{ fontFamily: "AK-Medium" }}>{item.title}</Text>
                    </Stack>
                </Paper>
            </Grid.Col>
        ) : (
            <Grid.Col span={{ base: 6, md: 4 }} key={GenerateUUID()}>
                <Paper
                    p="lg"
                    style={{ background: "#356d1a", cursor: "pointer" }}
                    onClick={() => handleButtonClick(item.link)}
                >
                    <Stack align="center">
                        <Box style={{
                            padding: "10px",
                            backgroundColor: "rgba(33, 74, 13,0.3)",
                            borderRadius: "10px"
                        }}
                        >
                            <item.icon style={{ width: "50px", height: "50px" }} />
                        </Box>

                        <Text size={isMobile ? "20px" : "30px"} style={{ fontFamily: "AK-Medium" }}>{item.title}</Text>
                    </Stack>
                </Paper>
            </Grid.Col>
        )
        
    ));

    function handleButtonClick(link: string) {
        if (link != null && link != "") {
            setActive(link);
        }
    }

    return (
        // <Container>
            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#0f1714", color: "white" }}>
                <Stack>
                    {/* <Text size="30px" fw={900} style={{letterSpacing:"1px"}}>Welcome to VerifiedShift! 👋</Text> */}
                    <Image
                        radius="md"
                        src={vsLogo}
                    //h={30}
                    />
                    {/* <Text size="24px" fw={900} ta="center" mb="lg">Please sign-in to start the adventure 🚀</Text> */}
                    <Grid>
                        {user?.role == "OWNER" && ownerAppMenuItems}
                        {user?.role == "STAFF" && staffAppMenuItems}
                    </Grid>
                </Stack>
                {!user && (
                    <Group align="center" justify="center">
                        <Loader />
                    </Group>
                )}
            </Paper>
        // </Container>
    );
}