import { Button, Grid, Group, Paper, Space, Stack, Text, Title } from "@mantine/core";
import * as React from "react";
import { UserCapacityCount } from "./components/UserCapacityCount";
import StaffCheckedInToday from "./components/StaffCheckedInToday";
import AttendanceWeekCount from "./components/AttendanceWeekCount";
import AbsentWeekCount from "./components/AbsentWeekCount";
import UserCheckedInToday from "./components/UserCheckedInToday copy";
import { useDisclosure } from "@mantine/hooks";
import StaffStatusModal from "./components/StaffStatusModal";
import { DoubleNavbar } from "../../components/SidebarNavbar";
import { ownerLinksData, ownerMainLinksData } from "../../components/Header";


export default function OwnerDashboard() {
    const [staffMemberModalOpened, { open: openStaffMemberModal, close: closeStaffMemberModal }] = useDisclosure(false);

    return(
        <>
            {/* <DoubleNavbar showLinks={true} mainLinks={ownerMainLinksData} secondaryLinks={ownerLinksData}/> */}
            {/* {staffMemberModalOpened && (
                <StaffStatusModal modalOpened={staffMemberModalOpened} isMobile={false} closeModal={closeStaffMemberModal}/>
            )}
            <Grid 
                grow
                gutter="xs"
            >
                
                <Grid.Col span={{ base: 12, xs: 3}}>
                    <Paper shadow="md" p="xl" m="lg" radius="lg" style={{background:"#161b26", height:"300px", color:"white"}}>
                        <Stack>
                            <Group justify="space-between">
                                <Title order={2}>
                                    Staff status
                                </Title>
                                <Button
                                    variant="light"
                                    radius="md"
                                    size="md"
                                    onClick={openStaffMemberModal}
                                >
                                    <Title order={4}>View staff</Title>
                                </Button>
                            </Group>
                            <StaffCheckedInToday/>
                        </Stack>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 3}}>
                    <Paper shadow="md" p="xl" m="lg" radius="lg" style={{background:"#161b26", height:"300px", color:"white"}}>
                        <Stack>
                            <Title order={2}>
                                .secondaryLinks;ondaryLinks;ondaryLinks; status
                            </Title>
                            <UserCheckedInToday/>
                        </Stack>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 3}}>
                    <Paper shadow="md" p="xl" m="lg" radius="lg" style={{background:"#161b26", height:"300px", color:"white"}}>
                        <Stack>
                            <Text fw={700}>
                                Attendances this week
                            </Text>
                            <AttendanceWeekCount/>
                        </Stack>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 3}}>
                    <Paper shadow="md" p="xl" m="lg" radius="lg" style={{background:"#161b26", height:"300px", color:"white"}}>
                        <Stack>
                            <Text fw={700}>
                                Absenses this week
                            </Text>
                            <AbsentWeekCount/>
                        </Stack>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 3}}>
                    <Paper shadow="md" p="xl" m="lg" radius="lg" style={{background:"#161b26", height:"300px", color:"white"}}>
                        <UserCapacityCount/>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 9}}>
                    <Paper shadow="md" p="xl" m="lg" radius="lg" style={{background:"#161b26", height:"500px", color:"white"}}>
                        <Text fw={700}>
                            Schedule
                        </Text>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 3}}>
                    <Paper shadow="md" p="xl" m="lg" radius="lg" style={{background:"#161b26", height:"500px", color:"white"}}>
                        <Text fw={700}>
                            Tasks todo
                        </Text>
                    </Paper>
                </Grid.Col>
            </Grid> */}
        </>
    )
}