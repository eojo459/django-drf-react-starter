import { Avatar, Grid, Group, Paper, Stack, Title, Text, Badge, Container, Button, RingProgress, Center, ActionIcon, rem, Space, Menu, Modal } from "@mantine/core";
import { IconActivity, IconBookmark, IconBriefcase2, IconCalendar, IconCheck, IconChevronDown, IconClock, IconLogout, IconTimeline, IconTrash, IconUser } from "@tabler/icons-react";
import * as React from "react";
import { useEffect, useState } from "react";
import ActivityTimeline from "../../components/ActivityTimeline";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import TeamMemberList from "./components/TeamMembersListModal";
import ProfileEdit from "./components/ProfileEditModal";
import { useNavigate } from "react-router-dom";
import ProfileEditModal from "./components/ProfileEditModal";
import TeamMemberListModal from "./components/TeamMembersListModal";
import StaffStatusModal from "../owner-dashboard/components/StaffStatusModal";


export default function StaffDashboard() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [tabWidth, setTabWidth] = useState('');
    const navigate = useNavigate();
    //const [teamMemberModalOpened, setTeamMemberModalOpened] = useState(false);
    const [teamMemberModalOpened, { open: openTeamMemberModal, close: closeTeamMemberModal }] = useDisclosure(false);
    const [profileModalOpened, { open: openProfileModal, close: closeProfileModal }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 50em)');

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
            setTabWidth("");
        }
        else {
            setTabWidth("300px")
        }
    }, [windowWidth]);

    return (
        <Container size="lg">
            {/* {teamMemberModalOpened && (
                <StaffStatusModal
                    modalOpened={teamMemberModalOpened}
                    isMobile={isMobile != undefined ? isMobile : false} 
                    closeModal={closeTeamMemberModal}
                    //staffData={staffData}
                />
            )} */}
            {/* {profileModalOpened && (
                <ProfileEditModal 
                    modalOpened={profileModalOpened} 
                    isMobile={isMobile != undefined ? isMobile : false} 
                    closeModal={closeProfileModal} 
                    //userProfileData={userProfileData}
                />
            )} */}
            <Grid mt="lg">
                <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Stack>
                        {/* <Paper shadow="md" p="lg" radius="lg" style={{ background: "#161b26", width: "100%", color: "white" }}>
                            <Stack>
                                <Group>
                                    <Avatar color="gray" radius="40px" size="xl">MK</Avatar>
                                    <Title order={2}>tdev</Title>
                                </Group>
                                <Group>
                                    <IconUser />
                                    <Text size="xl" fw={600}>Tom dev</Text>
                                </Group>
                                <Group>
                                    <IconBriefcase2 />
                                    <Badge color="gray" variant="light" radius="md" size="xl">Crew Member</Badge>
                                </Group>
                                <Group>
                                    <IconCalendar />
                                    <Text size="lg" fw={600}>Joined April 2023</Text>
                                </Group>
                                <Button size="md" radius="md" variant="light" fullWidth onClick={openProfileModal}>
                                    <Title order={4}>My profile</Title>
                                </Button>
                            </Stack>
                        </Paper> */}

                        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#161b26", width: "100%", color: "white" }}>
                            <Stack>
                                <Stack gap="xs">
                                    <Title ta="center" order={1}>Wednesday</Title>
                                    <Title ta="center" order={2}>January 3rd 2024</Title>
                                </Stack>
                                <Space />
                                <Paper p="md" style={{ background: "#212735" }}>
                                    <Title ta="center" size="50px" order={1}>12:31 PM</Title>
                                </Paper>
                                <Stack align="center">
                                    <RingProgress
                                        size={260}
                                        thickness={30}
                                        sections={[{ value: 90, color: 'green', opacity:"80%" }]}
                                        label={
                                            <Center>
                                                {/* <ActionIcon color="teal" variant="light" radius="xl" size="70px">
                                                    <IconClock style={{ width: rem(30), height: rem(30) }} />
                                                </ActionIcon> */}
                                                <Title order={2}>7h 45m</Title>
                                            </Center>
                                        }
                                    />
                                </Stack>
                                <Grid>
                                    <Grid.Col span={{ base: 6 }}>
                                        <Button fullWidth color="#244f27" size="md" radius="md" style={{ height: "60px" }}>
                                            <Title order={4}>Clock in</Title>
                                        </Button>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 6 }}>
                                        <Button color="#4f4424" fullWidth size="md" radius="md" style={{ height: "60px" }}>
                                            <Title order={4}>Break</Title>
                                        </Button>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12 }}>
                                        <Button.Group>
                                            <Button color="#4f2424" fullWidth size="md" radius="md" style={{ height: "60px" }}>
                                                <Title order={4}>Clock out</Title>
                                            </Button>
                                            <Menu transitionProps={{ transition: 'pop' }} position="bottom-end" withinPortal>
                                                <Menu.Target>
                                                    <ActionIcon
                                                        color="#4f2424"
                                                        size={55}
                                                        //radius="md"
                                                        style={{ height: "60px", borderRadius: "0px 7px 7px 0px"}}
                                                    //className={classes.menuControl}
                                                    >
                                                        <IconChevronDown style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={
                                                            <IconLogout
                                                                style={{ width: rem(16), height: rem(16) }}
                                                                stroke={1.5}
                                                            //color={theme.colors.blue[5]}
                                                            />
                                                        }
                                                    >
                                                        <Title order={4}>End shift</Title>
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Button.Group>
                                        {/* <Group wrap="nowrap" gap={0}>
                                            <Button color="#4f2424" fullWidth size="md" radius="md" style={{ height: "60px" }}>
                                                Clock out
                                            </Button>
                                            <Menu transitionProps={{ transition: 'pop' }} position="bottom-end" withinPortal>
                                                <Menu.Target>
                                                    <ActionIcon
                                                        color="#4f2424"
                                                        size={55}
                                                        radius="md"
                                                        style={{ height: "60px" }}
                                                    //className={classes.menuControl}
                                                    >
                                                        <IconChevronDown style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={
                                                            <IconLogout
                                                                style={{ width: rem(16), height: rem(16) }}
                                                                stroke={1.5}
                                                            //color={theme.colors.blue[5]}
                                                            />
                                                        }
                                                    >
                                                        End shift
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group> */}
                                    </Grid.Col>
                                </Grid>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }}>
                    <Stack>
                        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#161b26", color: "white" }}>
                            <Grid>
                                <Grid.Col span={{ base: 12 }}>
                                    <Group justify="space-between">
                                        <Title order={2}>👋 Good evening, Tom</Title>
                                        <Group>
                                            <Badge size="xl" radius="md" color="#212735"><Title order={3}>12:31 PM</Title></Badge>
                                        </Group>

                                    </Group>
                                </Grid.Col>
                                <Grid.Col span={{ base: 6, sm: 3 }}>
                                    <Paper p="lg" style={{ background: "#244f27", color: "white" }}>
                                        <Stack align="center">
                                            <Title order={3}>6</Title>
                                            <Title order={4}>On shift</Title>
                                        </Stack>
                                    </Paper>
                                </Grid.Col>
                                <Grid.Col span={{ base: 6, sm: 3 }}>
                                    <Paper p="lg" style={{ background: "#a3842a", color: "white" }}>
                                        <Stack align="center">
                                            <Title order={3}>1</Title>
                                            <Title order={4}>On break</Title>
                                        </Stack>
                                    </Paper>
                                </Grid.Col>
                                <Grid.Col span={{ base: 6, sm: 3 }}>
                                    <Paper p="lg" style={{ background: "#4f2424", color: "white" }}>
                                        <Stack align="center">
                                            <Title order={3}>1</Title>
                                            <Title order={4}>Out</Title>
                                        </Stack>
                                    </Paper>
                                </Grid.Col>
                                <Grid.Col span={{ base: 6, sm: 3 }}>
                                    <Paper p="lg" style={{ background: "#212735", color: "white" }}>
                                        <Stack align="center">
                                            <Title order={3}>10</Title>
                                            <Title order={4}>Scheduled</Title>
                                        </Stack>
                                    </Paper>
                                </Grid.Col>
                                <Grid.Col span={{ base: 12 }}>
                                    <Button
                                        variant="light"
                                        radius="md"
                                        size="md"
                                        fullWidth
                                        onClick={openTeamMemberModal}
                                    >
                                        <Title order={4}>View team</Title>
                                    </Button>
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#161b26", color: "white" }}>
                            <Grid>
                                <Grid.Col span={{ base: 12 }}>
                                    <Group justify="space-between">
                                        <Title order={2}><IconActivity style={{marginRight:"20px"}}/>Shift activity for today</Title>
                                        {windowWidth < 800 && (
                                            <Button 
                                                fullWidth 
                                                variant="light" 
                                                size="md" 
                                                radius="md" 
                                                color="gray"
                                                onClick={() => navigate("/timesheet")}
                                            >
                                                <Title order={4}>View timesheet</Title>
                                            </Button>
                                        )}
                                        {windowWidth > 800 && (
                                            <Button 
                                                //fullWidth 
                                                variant="light" 
                                                size="md" 
                                                radius="md" 
                                                color="gray"
                                                onClick={() => navigate("/timesheet")}
                                            >
                                                <Title order={4}>View timesheet</Title>
                                            </Button>
                                        )}
                                        
                                    </Group>
                                    
                                    {/* <Group justify="space-between">
                                        <Title order={3}>Shift activity</Title>
                                        <Button variant="light" size="md" radius="md" color="gray">View timesheet</Button>
                                    </Group> */}
                                </Grid.Col>
                                <Grid.Col span={{ base: 12 }}>
                                    <Stack gap="lg">
                                        {/* <ActivityTimeline /> */}
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
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    );
}