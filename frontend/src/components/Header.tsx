import { useContext, useEffect, useState } from 'react';
import { Routes, Route, BrowserRouter, useNavigate, Router } from "react-router-dom";
import { useDisclosure } from '@mantine/hooks';
import { Container, ActionIcon, Burger, Group, Text, useComputedColorScheme, useMantineColorScheme, Button, Drawer, Box, Center, Collapse, Divider, ScrollArea, UnstyledButton, rem, Stack, Avatar } from "@mantine/core";
import { IconSun, IconMoon, IconChevronDown, IconBuilding, IconCalendarUser, IconEye, IconHome, IconList, IconSettings, IconUser, IconUsersGroup, IconGauge, IconReportAnalytics, IconCalendarEvent } from "@tabler/icons-react";
//import classes from '../css/Header.module.scss';
import { theme } from 'antd';
import { AuthContext } from '../authentication/AuthContext';
import HeaderHome from './HeaderHome';
import '../css/Header.scss';
import classes from '../css/Sidebar.module.scss';
import { useChangesContext } from '../context/ChangesContext';
import { useGlobalState } from '../context/GlobalStateContext';
import { ConfirmUnsavedChangesModal } from './ConfirmModal';
import { DoubleNavbar } from './SidebarNavbar';
import { useAuth } from '../authentication/SupabaseAuthContext';
//import { SidebarNavbar } from './SidebarNavbar';


// sidebar pages/links
const links = [
    { link: '/about', label: 'Features' },
    { link: '/pricing', label: 'Pricing' },
    { link: '/learn', label: 'Learn' },
    { link: '/community', label: 'Community' },
];

const adminMainLinksData = [
    { icon: IconGauge, label: 'Dashboard' },
    { icon: IconBuilding, label: 'Business Centre' },
    { icon: IconUser, label: 'User Centre' },
    { icon: IconReportAnalytics, label: 'Timesheet ' },
    { icon: IconUser, label: 'Account' },
    { icon: IconReportAnalytics, label: 'Reports' },
    { icon: IconSettings, label: 'Settings' },
];

const adminLinksData = [
    { link: '/dashboard', label: 'Dashboard', group:'admin', icon: IconHome },
    { link: '/settings', label: 'Settings', group:'admin', icon: IconSettings },
    { link: '/register/owner', label: 'Register Owner', group:'admin', icon: IconUser },
    { link: '/owner/list', label: 'View Owners', group:'admin', icon: IconEye },
    { link: '/register/business', label: 'Register Business', group:'admin', icon: IconBuilding },
    { link: '/business/list', label: 'View Businesses', group:'admin', icon: IconList },
    { link: '/register/staff', label: 'Register Staff', group:'staff', icon: IconUser },
    { link: '/staff/list', label: 'View Staff', group:'staff', icon: IconList },
    { link: '/attendance/staff', label: 'View Staff Attendance', group:'staff', icon: IconCalendarUser },
    { link: '/register/person', label: 'Register User', group:'child', icon: IconUser },
    { link: '/person/list', label: 'View Users', group:'child', icon: IconList },
    { link: '/attendance/person', label: 'View User Attendance', group:'child', icon: IconCalendarUser },
    { link: '/parent/list', label: 'View Parents', group:'child', icon: IconList },
]

export const ownerMainLinksData = [
    { icon: IconGauge, label: 'Dashboard', group: 'dashboard' },
    { icon: IconBuilding, label: 'Business Centre', group: 'business' },
    { icon: IconUser, label: 'User Centre', group: 'user' },
    { icon: IconCalendarEvent, label: 'Attendance', group: 'attendance' },
    { icon: IconReportAnalytics, label: 'Timesheet', group: 'timesheet' },
    { icon: IconReportAnalytics, label: 'Reports', group: 'reports' },
    { icon: IconSettings, label: 'Settings', group: 'settings' },
];

export const ownerLinksData = [
    { id: 1, link: '/dashboard', label: 'Dashboard', group:'dashboard', icon: IconHome },
    { id: 2, link: '/settings', label: 'Settings', group:'settings', icon: IconSettings },
    { id: 3, link: '/register/business', label: 'Register Business', group:'business', icon: IconBuilding },
    { id: 4, link: '/business/list', label: 'View Businesses', group:'business', icon: IconList },
    { id: 5, link: '/register/staff', label: 'Register Staff', group:'user', icon: IconUser },
    { id: 6, link: '/staff/list', label: 'View Staff', group:'user', icon: IconList },
    { id: 7, link: '/attendance/staff', label: 'View Staff Attendance', group:'attendance', icon: IconCalendarUser },
    { id: 8, link: '/register/person', label: 'Register User', group:'user', icon: IconUser },
    { id: 9, link: '/person/list', label: 'View Users', group:'user', icon: IconList },
    { id: 10, link: '/attendance/person', label: 'View User Attendance', group:'attendance', icon: IconCalendarUser },
    { id: 11, link: '/parent/list', label: 'View Parents', group:'user', icon: IconList },
    // { link: '/business/group-manager', label: 'Group Manager', group:'owner', icon: IconUsersGroup },
    { id: 12, link: '/business/centre-manager', label: 'Centre Manager', group:'business', icon: IconUsersGroup },
];

const staffLinksData = [
    { link: '/dashboard', label: 'Dashboard', group:'staff', icon: IconHome },
    { link: '/settings', label: 'Settings', group:'staff', icon: IconSettings },
    { link: '/register/staff', label: 'Register Staff', group:'staff', icon: IconUser },
    { link: '/staff/list', label: 'View Staff', group:'staff', icon: IconList },
    { link: '/attendance/staff', label: 'View Staff Attendance', group:'staff', icon: IconCalendarUser },
    { link: '/register/person', label: 'Register User', group:'child', icon: IconUser },
    { link: '/person/list', label: 'View Users', group:'child', icon: IconList },
    { link: '/attendance/person', label: 'View User Attendance', group:'child', icon: IconCalendarUser },
    { link: '/parent/list', label: 'View Parents', group:'child', icon: IconList },
];

export default function HeaderHomePage() {
    const { user, session } = useAuth();
    const [opened, { toggle }] = useDisclosure(false);
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
    const navigate = useNavigate();
    //let {logoutUser, user}: any = useContext(AuthContext);
    const [activePage, setActivePage] = useState('');
    const { handleNewChanges } = useChangesContext();
    const { unsavedChanges, setUnsavedChanges } = useGlobalState();
    const [showLinks, setShowLinks] = useState(true);

    // Access and update the global state
    const handleToggleGlobalSavedChanges = () => {
        setUnsavedChanges((prevValue) => !prevValue);
    };

    // useEffect(() => {
    //     console.log(activePage);
    //     if (user) {
    //         console.log(user);
    //     }
    // },[activePage])

    // useEffect(() => {

    // },[showLinks]);

    // switch(user.role) {
    //     case "ADMIN":
    //         // show header for authenticated users
    //         break;
    //     case "OWNER":
    //     case "STAFF":
    //     case "PARENT":
    //         break;
    //     default:
    //         return <HeaderHome/>
    // }

    function handleUnsavedChanges(confirm: boolean) {
        if (confirm) {
            console.log("confirmed");
        }
        else {
            console.log("denied");
        }
    }

    const itemsDefault = links.map((link) => (
        <a
            key={link.label}
            href={link.link}
            //className={classes.link}
            onClick={async (event) => {
                event.preventDefault();
                if (unsavedChanges) {
                    toggleDrawer();
                    const confirmation = await ConfirmUnsavedChangesModal({ onDeleteConfirm: handleUnsavedChanges});
                    if (!confirmation) {
                        return;
                    }
                    handleToggleGlobalSavedChanges(); // reset global saved changes 
                }
                setActivePage(link.label);
                navigate(link.link);
                toggleDrawer();
            }}
        >
            {link.label}
        </a>
    ));

    const itemsAdmin = adminLinksData.map((link) => (
        <a
            key={link.label}
            href={link.link}
            //className={classes.link}
            onClick={async (event) => {
                event.preventDefault();
                if (unsavedChanges) {
                    toggleDrawer();
                    const confirmation = await ConfirmUnsavedChangesModal({ onDeleteConfirm: handleUnsavedChanges});
                    if (!confirmation) {
                        return;
                    }
                    handleToggleGlobalSavedChanges(); // reset global saved changes 
                }
                setActivePage(link.label);
                navigate(link.link);
                toggleDrawer();
            }}
        >
            {link.label}
        </a>
    ));

    const itemsOwner = ownerLinksData.map((link) => (
        <a
            key={link.label}
            href={link.link}
            //className={classes.link}
            onClick={async (event) => {
                event.preventDefault();
                if (unsavedChanges) {
                    toggleDrawer();
                    const confirmation = await ConfirmUnsavedChangesModal({ onDeleteConfirm: handleUnsavedChanges});
                    if (!confirmation) {
                        return;
                    }
                    handleToggleGlobalSavedChanges(); // reset global saved changes 
                }
                setActivePage(link.label);
                navigate(link.link);
                toggleDrawer();
            }}
        >
            {link.label}
        </a>
    ));

    const itemsStaff = staffLinksData.map((link) => (
        <a
            key={link.label}
            href={link.link}
            //className={classes.link}
            onClick={async (event) => {
                event.preventDefault();
                if (unsavedChanges) {
                    toggleDrawer();
                    const confirmation = await ConfirmUnsavedChangesModal({ onDeleteConfirm: handleUnsavedChanges});
                    if (!confirmation) {
                        return;
                    }
                    handleToggleGlobalSavedChanges(); // reset global saved changes 
                }
                setActivePage(link.label);
                navigate(link.link);
                toggleDrawer();
            }}
        >
            {link.label}
        </a>
    ));

    return (
        <>
            <header>
                <div className='sticky'>
                    <Group align="center" justify="space-between" m="lg">
                        <Group>
                            <Burger opened={drawerOpened} onClick={toggleDrawer} size="sm" />
                            {/* {user ? (
                                <Text ta="left" ml="xl" size="lg" style={{color:"white"}}>{activePage}</Text>
                            ) : (
                                <Text>BusinessManagement</Text>
                            )} */}
                        </Group>
                        

                        {!user && (
                            <Group gap={5} align="center" visibleFrom="sm">
                                {itemsDefault}
                            </Group>
                        )}

                        {!user && (
                            <Group>
                                <Button variant="default" onClick={() => navigate("login")}>Log in</Button>
                                <Button onClick={() => navigate("register")}>Sign up</Button>
                            </Group>
                        )}
                        
                        {user && (
                            <Group> 
                                {/* <p>Welcome {user.first_name}</p> */}
                                <Avatar
                                    style={{fontSize: '20px', height:"50px", width:"50px"}}
                                    size="md"
                                >
                                    {/* {user.first_name[0]?.toUpperCase()} */}
                                    {/* {user.first_name.charAt(0).toUpperCase() + " " + user.last_name.charAt(0).toUpperCase()} */}
                                </Avatar>
                                {/* light/dark mode button */}
                                <ActionIcon
                                    onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                                    variant="default"
                                    size="xl"
                                    aria-label="Toggle color scheme"
                                >
                                    {computedColorScheme === 'light' ? <IconSun/> : <IconMoon/> }
                                </ActionIcon>
                            </Group>
                        )}
                    </Group>
                </div>
            </header>
            <DoubleNavbar showLinks={true} showSidebar={drawerOpened} mainLinks={ownerMainLinksData} secondaryLinks={ownerLinksData}/> 
            {/* <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                withCloseButton={false}
                //size="100%"
                size={ showLinks ? "xs" : "80px" }
                ml="-15px"
                //padding="md"
                //title="Navigation"
                //hiddenFrom="sm"
                zIndex={10}
            >
                {user ? (
                    // <Stack>
                    //     {user.role == "ADMIN" && itemsAdmin}
                    //     {user.role == "OWNER" && itemsOwner}
                    //     {user.role == "STAFF" && itemsStaff}
                    // </Stack>
                    <>
                        {user.role == "ADMIN" && (
                            <SidebarNavbar mainLinksData={adminMainLinksData} linksData={adminLinksData} toggleDrawer={toggleDrawer} />
                        )}
                        {user.role == "OWNER" && (
                            <DoubleNavbar showLinks={showLinks} />
                        )}
                        {user.role == "STAFF" && itemsStaff}
                    </>
                    
                    
                ) : 
                (
                    <Stack>
                        {itemsDefault}
                    </Stack>
                )}
                
            </Drawer> */}
        </>
    );
}





// export default function Header() {
//     const { setColorScheme } = useMantineColorScheme();
//     const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
//     const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
//     const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
    
//     return (
//         <Group h="100%" px="md" style={{display:"flex", justifyContent:"space-between"}}>
//           <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
//           <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
//           {/* <MantineLogo size={30} /> */}
//           {/* <Text size="lg">Business Management</Text> */}

//           {/* light/dark mode button */}
//           <ActionIcon
//             onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
//             variant="default"
//             size="xl"
//             aria-label="Toggle color scheme"
//           >
//             {computedColorScheme === 'light' ? <IconSun/> : <IconMoon/> }
//           </ActionIcon>
//         </Group>
        
//     )
// }