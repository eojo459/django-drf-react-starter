import { useEffect, useState } from 'react';
import { Container, Group, Burger, Image, Menu, Avatar, rem, Text, Button, Title, SimpleGrid, Grid, Drawer, Stack, Indicator } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import classes from '../css/SimpleHeader.module.css';
import myImage from '../assets/VerifiedHoursLogo-Shield.png';
import myImageV2 from '../assets/VerifiedHoursLogo2.png';
import { useNavigationContext } from "../context/NavigationContext";
import { IconUser, IconSettings, IconLogout } from '@tabler/icons-react';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../authentication/SupabaseContext';

export const defaultLinks = [
    { link: '/about', label: 'Features' },
    { link: '/pricing', label: 'Pricing' },
    { link: '/learn', label: 'Learn' },
    { link: '/community', label: 'Community' },
];

export const ownerLinks = [
    { link: 'homebase', label: 'Home', notifications: false },
    { link: 'home', label: 'Dashboard', notifications: false },
    { link: 'registration', label: 'Registration', notifications: false },
    { link: 'management', label: 'Management', notifications: false },
    { link: 'attendance', label: 'Attendance', notifications: false },
    { link: 'inbox', label: 'Inbox', notifications: true },
    { link: 'report', label: 'Reports', notifications: false },
    { link: 'settings', label: 'Settings', notifications: false },
];

export const staffManagerLinks = [
    { link: 'homebase', label: 'Home', notifications: false },
    { link: 'clockin', label: 'Clock in', notifications: false },
    { link: 'registration', label: 'Registration', notifications: false },
    { link: 'attendance', label: 'Attendance', notifications: false },
    { link: 'management', label: 'Management', notifications: false },
    { link: 'timesheetInbox', label: 'Inbox', notifications: true },
    { link: 'settings', label: 'Settings', notifications: false },
];

export const staffLinks = [
    { link: 'homebase', label: 'Home', notifications: false },
    { link: 'clockin', label: 'Clock in', notifications: false },
    { link: 'timesheetInbox', label: 'Timesheet', notifications: true },
    { link: 'settings', label: 'Settings', notifications: false },
];

export function SimpleHeader() {
    const { user, session } = useAuth();
    const { signOutUser, isManager, onboarding } = useSupabase();
    const [burgerDrawerOpened, { toggle: toggleBurgerDrawer, close: closeBurgerDrawer }] = useDisclosure(false);
    //const [active, setActive] = useState(user?.role == "OWNER" || user?.role == "STAFF" ? user?.role == "OWNER" ? ownerLinks[0].link : staffLinks[0].link : '');
    const { active, setActive, notificationMessages: notifications } = useNavigationContext();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width: 50em)');
    const isMobile2 = useMediaQuery('(max-width: 79em)');

    function handleSupabaseLogout() {
        signOutUser(navigate);
    }

    const items = defaultLinks.map((link) => (
        <a
            key={link.label}
            href={link.link}
            className={classes.link}
            data-active={active === link.link || undefined}
            onClick={(event) => {
                event.preventDefault();
                setActive(link.link);
            }}
        >
            {link.label}
        </a>
    ));

    const ownerItems = ownerLinks.map((link) => (
        link.notifications ? (
            <Indicator disabled={!notifications} color="red" size={18} offset={8}>
                <a
                    key={link.label}
                    href={link.link}
                    className={classes.link}
                    data-active={active === link.link || undefined}
                    onClick={(event) => {
                        event.preventDefault();
                        setActive(link.link);
                        navigate("/dashboard");
                        closeBurgerDrawer();
                    }}
                >
                    {link.label}
                </a>
            </Indicator>
        ) : (
            <a
                key={link.label}
                href={link.link}
                className={classes.link}
                data-active={active === link.link || undefined}
                onClick={(event) => {
                    event.preventDefault();
                    setActive(link.link);
                    navigate("/dashboard");
                    closeBurgerDrawer();
                }}
            >
                {link.label}
            </a>
        )
        
    ));

    const staffManagerItems = staffManagerLinks.map((link) => (
        <a
            key={link.label}
            href={link.link}
            className={classes.link}
            data-active={active === link.link || undefined}
            onClick={(event) => {
                event.preventDefault();
                setActive(link.link);
                navigate("/dashboard");
                closeBurgerDrawer();
            }}
        >
            {link.label}
        </a>
    ));

    const staffItems = staffLinks.map((link) => (
        <a
            key={link.label}
            href={link.link}
            className={classes.link}
            data-active={active === link.link || undefined}
            onClick={(event) => {
                event.preventDefault();
                setActive(link.link);
                navigate("/dashboard");
                closeBurgerDrawer();
            }}
        >
            {link.label}
        </a>
    ));

    return (
        <header className={classes.header}>
            <Container size="xl" className={classes.inner}>

                {/* <Group gap={5} visibleFrom="xs">
                    {items}
                </Group> */}

                {/* NO AUTH  */}
                {user?.role !== "OWNER" && user?.role !== "STAFF" && (
                    <>
                        <Image
                            radius="md"
                            src={myImage}
                            h={70}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate("/")}
                            mr="lg"
                        />
                        <Group>
                            <Button
                                //variant="light"
                                color="#324d3e"
                                radius="md"
                                size={isMobile ? "sm" : "lg"}
                                onClick={() => navigate("/login")}
                            >
                                <Title order={4}>Login</Title>
                            </Button>
                            <Button
                                //variant="subtle"
                                color="#4a8a2a"
                                radius="md"
                                size={isMobile ? "sm" : "lg"}
                                onClick={() => navigate("/register")}
                            >
                                <Title order={4}>Sign up</Title>
                            </Button>
                        </Group>
                    </>
                )}

                {/* AUTH */}
                {user?.role === "OWNER" && (
                    <>
                        <Drawer.Root opened={burgerDrawerOpened} onClose={toggleBurgerDrawer}>
                            <Drawer.Overlay />
                            <Drawer.Content style={{ backgroundColor: "#25352F" }}>
                                <Drawer.Header style={{ backgroundColor: "#25352F" }}>
                                    <Drawer.Title>
                                        <Image
                                            radius="md"
                                            src={myImageV2}
                                            h={100}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                navigate("/dashboard");
                                                setActive('homebase');
                                            }}
                                            mr="lg"
                                            p="md"
                                        />
                                    </Drawer.Title>
                                    <Drawer.CloseButton />
                                </Drawer.Header>
                                <Drawer.Body>
                                    <Stack c="#dcdcdc">
                                        {ownerItems}
                                    </Stack>
                                </Drawer.Body>
                            </Drawer.Content>
                        </Drawer.Root>
                        <Burger color="#336E1E" opened={burgerDrawerOpened} onClick={toggleBurgerDrawer} hiddenFrom="lg" size="xl" />
                        <Image
                            radius="md"
                            src={myImage}
                            h={100}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                navigate("/dashboard");
                                setActive('homebase');
                            }}
                            mr="lg"
                            p="md"
                        />
                        <Group gap={5} visibleFrom="lg">
                            {ownerItems}
                        </Group>
                        <Menu
                            shadow="md"
                            trigger="click-hover"
                            openDelay={100}
                            closeDelay={100}
                        >
                            <Menu.Target>
                                <Avatar
                                    size="50px"
                                    style={{
                                        zIndex: 5,
                                        background: "#323c43db"
                                    }}
                                >
                                    {user?.first_name != undefined ?
                                        user?.first_name.charAt(0).toUpperCase() + user?.last_name.charAt(0).toUpperCase() :
                                        user?.username.charAt(0).toUpperCase()}
                                </Avatar>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => setActive('settings')}
                                >
                                    <Text size="md">Settings</Text>
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={handleSupabaseLogout}
                                >
                                    <Text size="md">Logout</Text>
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </>
                )}

                {user?.role === "STAFF" && (
                    <>
                        <Drawer.Root opened={burgerDrawerOpened} onClose={toggleBurgerDrawer} size="100%">
                            <Drawer.Overlay />
                            <Drawer.Content style={{ backgroundColor: "#25352F" }}>
                                <Drawer.Header style={{ backgroundColor: "#25352F" }}>
                                    <Drawer.Title>
                                        <Image
                                            radius="md"
                                            src={myImageV2}
                                            h={100}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                navigate("/dashboard");
                                                setActive('homebase');
                                            }}
                                            mr="lg"
                                            p="md"
                                        />
                                    </Drawer.Title>
                                    <Drawer.CloseButton />
                                </Drawer.Header>
                                <Drawer.Body>
                                    <Stack c="#dcdcdc" ml="sm">
                                        {isManager ? staffManagerItems : staffItems}
                                    </Stack>
                                </Drawer.Body>
                            </Drawer.Content>
                        </Drawer.Root>
                        <Burger color="#336E1E" opened={burgerDrawerOpened} onClick={toggleBurgerDrawer} hiddenFrom="xs" size="xl" />
                        <Image
                            radius="md"
                            src={myImage}
                            h={100}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                navigate("/dashboard");
                                setActive('homebase');
                            }}
                            mr="lg"
                            p="md"
                        />
                        <Group gap={5} visibleFrom="xs">
                            {isManager ? staffManagerItems : staffItems}
                        </Group>
                        <Menu
                            shadow="md"
                            trigger="click-hover"
                            openDelay={100}
                            closeDelay={100}
                        >
                            <Menu.Target>
                                <Avatar
                                    size="50px"
                                    style={{
                                        zIndex: 5,
                                        background: "#323c43db"
                                    }}
                                >
                                    {user?.first_name !== undefined ?
                                        user?.first_name.charAt(0).toUpperCase() + user?.last_name.charAt(0).toUpperCase() :
                                        user?.username.charAt(0).toUpperCase()}
                                </Avatar>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                                //onClick={() => handleUserSelection(row.uid)}
                                >
                                    <Text size="md">Profile</Text>
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                                //onClick={() => handleUserSelection(row.uid)}
                                >
                                    <Text size="md">Settings</Text>
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={handleSupabaseLogout}
                                >
                                    <Text size="md">Logout</Text>
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </>
                )}
            </Container>
        </header>
    );
}