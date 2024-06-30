import { Carousel } from "@mantine/carousel";
import { Group, Paper, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconHome, IconUserPlus, IconUsersGroup, IconMail, IconClock, IconReportAnalytics, IconUser, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { useAuth } from "../authentication/SupabaseAuthContext";

interface CarouselNav {
    handleProfilePanelChange: () => void;
    handleClockInPanelChange: () => void;
    handleSettingsPanelChange: () => void;
    handleInboxPanelChange: () => void;
    handleHomePanelChange: () => void;
    handleRegistrationPanelChange: () => void;
    handleManagementPanelChange: () => void;
    handleTimesheetPanelChange: () => void;
    handleGroupPanelChange: () => void;
}

const pointerCursor = {
    cursor: 'pointer', // Change the cursor to a pointer
};

export function CarouselNav(props: CarouselNav) {
    const { user, session } = useAuth();
    const [showProfileSettings, setShowProfileSettings] = useState(true);
    const [profilePanelActive, setProfilePanelActive] = useState(false);
    const [clockInPanelActive, setClockInPanelActive] = useState(user?.role == "STAFF" ? true : false);
    const [settingsPanelActive, setSettingsPanelActive] = useState(false);
    const [groupsPanelActive, setGroupsPanelActive] = useState(false);
    const [timesheetsPanelActive, setTimesheetsPanelActive] = useState(false);
    const [timesheetListPanelActive, setTimesheetListPanelActive] = useState(false);
    const [registrationPanelActive, setRegistrationPanelActive] = useState(false);
    const [homePanelActive, setHomePanelActive] = useState(user?.role == "OWNER" ? true : false);
    const [managementPanelActive, setManagementPanelActive] = useState(false);
    const [inboxPanelActive, setInboxPanelActive] = useState(false);

    const [isHomeHovered, setIsHomeHovered] = useState(false);
    const [isRegistrationHovered, setIsRegistrationHovered] = useState(false);
    const [isManagementHovered, setIsManagementHovered] = useState(false);
    const [isInboxHovered, setIsInboxHovered] = useState(false);
    const [isClockInHovered, setIsClockInHovered] = useState(false);
    const [isTimesheetsHovered, setIsTimesheetsHovered] = useState(false);
    const [isGroupsHovered, setIsGroupsHovered] = useState(false);
    const [isSettingsHovered, setIsSettingsHovered] = useState(false);
    const [isProfileHovered, setIsProfileHovered] = useState(false);
    const isMobile = useMediaQuery('(max-width: 50em)');

    // props
    const handleProfilePanelChangeProp = props.handleProfilePanelChange;
    const handleClockInPanelChangeProp = props.handleClockInPanelChange;
    const handleSettingsPanelChangeProp = props.handleSettingsPanelChange;
    const handleInboxPanelChangeProp = props.handleInboxPanelChange;
    const handleHomePanelChangeProp = props.handleHomePanelChange;
    const handleRegistrationPanelChangeProp = props.handleRegistrationPanelChange;
    const handleManagementPanelChangeProp = props.handleManagementPanelChange;
    const handleTimesheetsPanelChangeProp = props.handleTimesheetPanelChange;
    const handleGroupsPanelChangeProp = props.handleGroupPanelChange;
    
    return (
        <>
            <Carousel
                withIndicators={false}
                //height={200}
                slideSize={{ base: '100%', sm: '50%', md: '25%' }}
                slideGap={{ base: 0, sm: 'md' }}
                loop
                align="start"
                dragFree
                mt="lg"
            >
                {/* home panel button - OWNER ONLY */}
                {user?.role == 'OWNER' && (
                    <Carousel.Slide>
                        <Paper
                            m="xs"
                            shadow="md"
                            p="lg"
                            radius="lg"
                            style={{
                                background: "#161b26",
                                width: isMobile ? "95%" : "90%",
                                color: "white",
                                outline: homePanelActive ? "6px solid #373f4b" : "",
                                transform: isHomeHovered ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={() => setIsHomeHovered(true)}
                            onMouseLeave={() => setIsHomeHovered(false)}
                        >
                            <Group justify="center" style={pointerCursor} onClick={handleHomePanelChangeProp}>
                                <IconHome />
                                <Title ta="center" order={2}>Home</Title>
                            </Group>
                        </Paper>
                    </Carousel.Slide>
                )}

                {/* registration panel button - OWNER ONLY */}
                {user?.role == 'OWNER' && (
                    <Carousel.Slide>
                        <Paper
                            m="xs"
                            shadow="md"
                            p="lg"
                            radius="lg"
                            style={{
                                background: "#161b26",
                                width: isMobile ? "95%" : "90%",
                                color: "white",
                                outline: registrationPanelActive ? "6px solid #373f4b" : "",
                                transform: isRegistrationHovered ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={() => setIsRegistrationHovered(true)}
                            onMouseLeave={() => setIsRegistrationHovered(false)}
                        >
                            <Group justify="center" style={pointerCursor} onClick={handleRegistrationPanelChangeProp}>
                                <IconUserPlus />
                                <Title ta="center" order={2}>Registration</Title>
                            </Group>
                        </Paper>
                    </Carousel.Slide>
                )}

                {/* management panel button - OWNER ONLY */}
                {user?.role == 'OWNER' && (
                    <Carousel.Slide>
                        <Paper
                            m="xs"
                            shadow="md"
                            p="lg"
                            radius="lg"
                            style={{
                                background: "#161b26",
                                width: isMobile ? "95%" : "90%",
                                color: "white",
                                outline: managementPanelActive ? "6px solid #373f4b" : "",
                                transform: isManagementHovered ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={() => setIsManagementHovered(true)}
                            onMouseLeave={() => setIsManagementHovered(false)}
                        >
                            <Group justify="center" style={pointerCursor} onClick={handleManagementPanelChangeProp}>
                                <IconUsersGroup />
                                <Title ta="center" order={2}>Management</Title>
                            </Group>
                        </Paper>
                    </Carousel.Slide>
                )}

                {/* inbox panel button - OWNER ONLY */}
                {user?.role == 'OWNER' && (
                    <Carousel.Slide>
                        <Paper
                            m="xs"
                            shadow="md"
                            p="lg"
                            radius="lg"
                            style={{
                                background: "#161b26",
                                width: isMobile ? "95%" : "90%",
                                color: "white",
                                outline: inboxPanelActive ? "6px solid #373f4b" : "",
                                transform: isInboxHovered ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={() => setIsInboxHovered(true)}
                            onMouseLeave={() => setIsInboxHovered(false)}
                        >
                            <Group justify="center" style={pointerCursor} onClick={handleInboxPanelChangeProp}>
                                <IconMail />
                                <Title ta="center" order={2}>Inbox</Title>
                            </Group>
                        </Paper>
                    </Carousel.Slide>
                )}

                {/* check in panel button */}
                {user?.role == 'STAFF' && (
                    <Carousel.Slide>
                        <Paper
                            m="xs"
                            shadow="md"
                            p="lg"
                            radius="lg"
                            style={{
                                background: "#161b26",
                                width: isMobile ? "95%" : "90%",
                                color: "white",
                                outline: clockInPanelActive ? "6px solid #373f4b" : "",
                                transform: isClockInHovered ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={() => setIsClockInHovered(true)}
                            onMouseLeave={() => setIsClockInHovered(false)}
                        >
                            <Group justify="center" style={pointerCursor} onClick={handleClockInPanelChangeProp}>
                                <IconClock />
                                <Title order={2}>Clock in</Title>
                            </Group>
                        </Paper>
                    </Carousel.Slide>
                )}


                {/* timesheet panel button */}
                {user?.role == 'STAFF' && (
                    <Carousel.Slide>
                        <Paper
                            m="xs"
                            shadow="md"
                            p="lg"
                            radius="lg"
                            style={{
                                background: "#161b26",
                                width: isMobile ? "95%" : "90%",
                                color: "white",
                                outline: timesheetsPanelActive ? "6px solid #373f4b" : "",
                                transform: isTimesheetsHovered ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={() => setIsTimesheetsHovered(true)}
                            onMouseLeave={() => setIsTimesheetsHovered(false)}
                        >
                            <Group justify="center" style={pointerCursor} onClick={handleTimesheetsPanelChangeProp}>
                                <IconReportAnalytics />
                                <Title order={2}>Timesheet</Title>
                            </Group>
                        </Paper>
                    </Carousel.Slide>
                )}

                {/* profile panel button */}
                {user?.role == 'STAFF' && (
                    <Carousel.Slide>
                        <Paper
                            m="xs"
                            shadow="md"
                            p="lg"
                            radius="lg"
                            style={{
                                background: "#161b26",
                                width: isMobile ? "95%" : "90%",
                                color: "white",
                                outline: profilePanelActive ? "6px solid #373f4b" : "",
                                transform: isProfileHovered ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={() => setIsProfileHovered(true)}
                            onMouseLeave={() => setIsProfileHovered(false)}
                        >
                            <Group justify="center" style={pointerCursor} onClick={handleProfilePanelChangeProp}>
                                <IconUser />
                                <Title order={2}>Profile</Title>
                            </Group>
                        </Paper>
                    </Carousel.Slide>
                )}

                {/* groups panel button */}
                {user?.role == 'STAFF' && (
                    <Carousel.Slide>
                        <Paper
                            m="xs"
                            shadow="md"
                            p="lg"
                            radius="lg"
                            style={{
                                background: "#161b26",
                                width: isMobile ? "95%" : "90%",
                                color: "white",
                                outline: groupsPanelActive ? "6px solid #373f4b" : "",
                                transform: isGroupsHovered ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={() => setIsGroupsHovered(true)}
                            onMouseLeave={() => setIsGroupsHovered(false)}
                        >
                            <Group justify="center" style={pointerCursor} onClick={handleGroupsPanelChangeProp}>
                                <IconUsersGroup />
                                <Title ta="center" order={2}>Groups</Title>
                            </Group>
                        </Paper>
                    </Carousel.Slide>
                )}

                {/* settings panel button */}
                {showProfileSettings && (
                    <Carousel.Slide>
                        <Paper
                            m="xs"
                            shadow="md"
                            p="lg"
                            radius="lg"
                            style={{
                                background: "#161b26",
                                width: isMobile ? "95%" : "90%",
                                color: "white",
                                outline: settingsPanelActive ? "6px solid #373f4b" : "",
                                transform: isSettingsHovered ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={() => setIsSettingsHovered(true)}
                            onMouseLeave={() => setIsSettingsHovered(false)}
                        >
                            <Group justify="center" style={pointerCursor} onClick={handleSettingsPanelChangeProp}>
                                <IconSettings />
                                <Title ta="center" order={2}>Settings</Title>
                            </Group>
                        </Paper>
                    </Carousel.Slide>
                )}

            </Carousel>
        </>
    );
}