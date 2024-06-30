import { Button, Grid, Paper, Stack, Title, Text } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import TeamMemberListModal from "../pages/staff-dashboard/components/TeamMembersListModal";
import { StaffActivity, UserActivity, UserActivityModel } from "./HomePanel";

export interface TeamMemberData {
    first_name: string;
    last_name: string;
    status: number;
    status_value: string;
    position: string;
}

export interface ITeamStatus {
    type: string;
    staffData?: StaffActivity;
    userData?: UserActivity;
    currentTime: string;
}

export function TeamStatus(props: ITeamStatus) {
    const [teamMemberModalOpened, { open: openTeamMemberModal, close: closeTeamMemberModal }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 50em)');
    //const [teamMemberData, setTeamMemberData] = useState<TeamMemberData[] | null>(null);

    // props
    const typeProp = props.type;
    const staffDataProp = props.staffData;
    const userDataProp = props.userData;
    const currentTimeProp = props.currentTime;

    // useEffect(() => {
    //     if (teamMemberDataProp != undefined) {
    //         setTeamMemberData(teamMemberDataProp);
    //     }
    // }, [teamMemberDataProp]);

    return (
        <>
            {teamMemberModalOpened && staffDataProp && (
                <TeamMemberListModal 
                    modalOpened={teamMemberModalOpened} 
                    isMobile={isMobile !== undefined ? isMobile : false} 
                    closeModal={closeTeamMemberModal} 
                    staffData={staffDataProp?.staff_activity}
                    userData={userDataProp?.user_activity}
                    currentTime={currentTimeProp}
                />
            )}
            {typeProp === "STAFF" && (
                <Grid mt="lg">
                    {/* <Grid.Col span={{ base: 12 }} mt="lg">
                        <Text size="lg" fw={600}>Current employee status</Text>
                    </Grid.Col> */}
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                        <Paper p="lg" style={{ background: "#356d1a" }}>
                            <Stack align="center">
                                <Text size="40px" style={{ fontFamily: "AK-Bold" }} mt="sm" mb="sm">
                                        <span style={{ 
                                            paddingRight:"20px", 
                                            paddingLeft: "20px", 
                                            paddingBottom: "10px",
                                            paddingTop: "10px",
                                            backgroundColor: "rgba(33, 74, 13,0.3)", 
                                            borderRadius: "10px"}}
                                        >
                                            {staffDataProp?.total_in_count ?? 0}
                                        </span>
                                </Text>
                                <Text size="22px" style={{ fontFamily: "AK-Medium" }}>In</Text>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                        <Paper p="lg" style={{ background: "#a3842a"}}>
                            <Stack align="center">
                                <Text size="40px" style={{ fontFamily: "AK-Bold" }} mt="sm" mb="sm">
                                        <span style={{ 
                                            paddingRight:"20px", 
                                            paddingLeft: "20px", 
                                            paddingBottom: "10px",
                                            paddingTop: "10px",
                                            backgroundColor: "rgba(138, 110, 19,0.5)", 
                                            borderRadius: "10px"}}
                                        >
                                            {staffDataProp?.total_break_count ?? 0}
                                        </span>
                                </Text>
                                <Text size="22px" style={{ fontFamily: "AK-Medium" }}>Break</Text>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                        <Paper p="lg" style={{ background: "rgba(110, 30, 30,1)" }}>
                            <Stack align="center">
                                <Text size="40px" style={{ fontFamily: "AK-Bold" }} mt="sm" mb="sm">
                                        <span style={{ 
                                            paddingRight:"20px", 
                                            paddingLeft: "20px", 
                                            paddingBottom: "10px",
                                            paddingTop: "10px",
                                            backgroundColor: "rgba(91,19,19,0.5)", 
                                            borderRadius: "10px"}}
                                        >
                                            {staffDataProp?.total_out_count ?? 0}
                                        </span>
                                </Text>
                                <Text size="22px" style={{ fontFamily: "AK-Medium" }}>Out</Text>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                        <Paper p="lg" style={{ background: "rgba(24,28,38,0.5)" }}>
                            <Stack align="center">
                                <Text size="40px" style={{ fontFamily: "AK-Bold" }} mt="sm" mb="sm">
                                        <span style={{ 
                                            paddingRight:"20px", 
                                            paddingLeft: "20px", 
                                            paddingBottom: "10px",
                                            paddingTop: "10px",
                                            backgroundColor: "rgba(24,28,38,0.3)", 
                                            borderRadius: "10px"}}
                                        >
                                            {staffDataProp?.total_user_count ?? 0}
                                        </span>
                                </Text>
                                <Text size="22px" style={{ fontFamily: "AK-Medium" }}>Total</Text>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <Button
                            //variant="light"
                            color="#324d3e"
                            radius="md"
                            size="lg"
                            fullWidth
                            onClick={openTeamMemberModal}
                        >
                            <Text size="lg" style={{ fontFamily: "AK-Medium", color: "#dcdcdc" }}>View team</Text>
                        </Button>
                    </Grid.Col>
                </Grid>
            )}

            {typeProp === "USER" && (
                <Grid mt="lg">
                    {/* <Grid.Col span={{ base: 12 }} mt="lg">
                        <Title order={3}>Current user status</Title>
                    </Grid.Col> */}
                    <Grid.Col span={{ base: 6, sm: 4 }}>
                        <Paper p="lg" style={{ background: "#356d1a" }}>
                            <Stack align="center">
                                <Text size="40px" style={{ fontFamily: "AK-Bold" }} mt="sm" mb="sm">
                                        <span style={{ 
                                            paddingRight:"20px", 
                                            paddingLeft: "20px",
                                            paddingBottom: "10px",
                                            paddingTop: "10px",
                                            backgroundColor: "rgba(33, 74, 13,0.3)", 
                                            borderRadius: "10px"}}
                                        >
                                            {staffDataProp?.total_in_count}
                                        </span>
                                </Text>
                                <Text size="22px" style={{ fontFamily: "AK-Medium" }}>In</Text>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 4 }}>
                        <Paper p="lg" style={{ background: "rgba(110, 30, 30,1)" }}>
                            <Stack align="center">
                                <Text size="40px" style={{ fontFamily: "AK-Bold" }} mt="sm" mb="sm">
                                        <span style={{ 
                                            paddingRight:"20px", 
                                            paddingLeft: "20px", 
                                            paddingBottom: "10px",
                                            paddingTop: "10px",
                                            backgroundColor: "rgba(91,19,19,0.5)", 
                                            borderRadius: "10px"
                                        }}>
                                            {staffDataProp?.total_out_count}
                                        </span>
                                </Text>
                                <Text size="22px" style={{ fontFamily: "AK-Medium" }}>Out</Text>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Paper p="lg" style={{ background: "rgba(24,28,38,0.5)" }}>
                            <Stack align="center">
                                <Text size="40px" style={{ fontFamily: "AK-Bold" }} mt="sm" mb="sm">
                                        <span style={{ 
                                            paddingRight:"20px", 
                                            paddingLeft: "20px", 
                                            paddingBottom: "10px",
                                            paddingTop: "10px",
                                            backgroundColor: "rgba(24,28,38,0.3)", 
                                            borderRadius: "10px"
                                        }}>
                                            {staffDataProp?.total_user_count}
                                        </span>
                                </Text>
                                <Text size="22px" style={{ fontFamily: "AK-Medium" }}>Total</Text>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <Button
                            color="#324d3e"
                            radius="md"
                            size="lg"
                            fullWidth
                            onClick={openTeamMemberModal}
                        >
                            <Text size="lg" style={{ fontFamily: "AK-Medium", color: "#dcdcdc" }}>View users</Text>
                        </Button>
                    </Grid.Col>
                </Grid>
            )}


        </>
    )
}