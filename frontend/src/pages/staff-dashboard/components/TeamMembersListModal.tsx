import { Avatar, Badge, Grid, Group, Modal, Table, Text, Title } from '@mantine/core';
import { GenerateColour, formatTime, formatTimestamp12Hours, getEmployeeRoleColor, getStatusColor, getStatusName } from '../../../helpers/Helpers';
import classes from '../../../css/TeamMembersListModal.module.css';
import { StaffActivity, UserActivityModel } from '../../../components/HomePanel';
import { useMediaQuery } from '@mantine/hooks';

interface ITeamMemberListModal {
    modalOpened: boolean;
    isMobile: boolean;
    staffData: UserActivityModel[]; // get staff data from parent
    userData?: UserActivityModel[]; // get user data from parent
    currentTime: string;
    closeModal: () => void;
}

// status_int 
// 0 = check out
// 1 = check in
// 2 = break
// -1 = no unknown status
const elements = [
    { name: 'Carbon', role: 'Cashier', employment_type: 2, status: 'IN • 7:00 AM', status_int: 1 },
    { name: 'Nitrogen', role: 'Developer', employment_type: 3, status: 'OUT • 2:00 PM', status_int: 0 },
    { name: 'Yttrium', role: 'Security', employment_type: 4, status: 'IN • 8:30 AM', status_int: 1},
    { name: 'Barium', role: 'Manager', employment_type: 1, status: 'BREAK • 9:00 AM', status_int: 2},
    // { name: 'Cerium', role: 'Merchandiser', employment_type: 2, status: '-', status_int: -1 },
    // { name: 'Karium', role: 'Cashier', employment_type: 2, status: '-', status_int: -1 },
];

export default function TeamMemberListModal(props: ITeamMemberListModal) {
    const isMobile = useMediaQuery('(max-width: 50em)');
    
    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const staffDataProp = props.staffData;
    const userDataProp = props.userData;
    const currentTimeProp = props.currentTime;
    //const teamMemberData = props.teamMemberData;

    const rows = staffDataProp.map((user) => (
        <Table.Tr key={user.uid}>
            <Table.Td>
                <Group gap="sm">
                    <Avatar size={34} radius="xl" style={{ backgroundColor: "#488A32"}}><Text c="white">{user.first_name.charAt(0)}</Text></Avatar>
                    <Text size="md" style={{ fontFamily: "AK-Medium" }}>{user.first_name}</Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge 
                    size="lg" 
                    //variant="light"
                    radius="md" 
                    p="md"
                    color={getStatusColor(user.status)}
                    style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)"}}
                >
                    <Text 
                        size="md" 
                        c="#dcdcdc" 
                        style={{ fontFamily: "AK-Medium",  letterSpacing:"1px", textShadow: "0px 0px 3px #24352f" }}
                    >
                        {getStatusName(user.status)} {user.status !== 5 ? "- " + formatTime(user.timestamp) : ""}
                    </Text>
                </Badge>
            </Table.Td>
            <Table.Td>
                {/* <Badge>{element.role}</Badge> */}
                <Badge 
                    size="lg" 
                    radius="md" 
                    p="md"
                    //color={getEmployeeRoleColor(user.employment_type)}
                    style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)"}}
                >
                    <Text size="md" c="#dcdcdc" style={{ fontFamily: "AK-Medium",  letterSpacing:"1px", textShadow: "0px 0px 3px #24352f" }}>{user.position}</Text>
                </Badge>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Modal.Root 
                opened={modalOpenedProp} 
                onClose={closeModalProp} 
                c="#dcdcdc" 
                size="xl"
                fullScreen={isMobileProp}
            > 
                <Modal.Overlay />
                <Modal.Content style={{ backgroundColor: "transparent" }}>
                    <Modal.Header style={{ backgroundColor:"#0f1714", borderTopLeftRadius: "10px", borderTopRightRadius: "10px"}}>
                        <Modal.Title>
                            {isMobile && (
                                <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Team status</Text>
                            )}

                            {!isMobile && (
                                <Grid align="center">
                                    <Grid.Col span={{ base: 6 }}>
                                        <Group justify="end">
                                            <Badge radius="md" color="rgba(9,15,13,0.4)" p="lg" pb="30px" pr="lg">
                                                <Text size="25px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px", color: "#dcdcdc" }}>{currentTimeProp}</Text>
                                            </Badge>
                                        </Group>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 6 }}>
                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Team status</Text>
                                    </Grid.Col>
                                </Grid>
                            )}
                            
                        </Modal.Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor:"#24352f", borderBottomLeftRadius:"15px", borderBottomRightRadius:"15px"}}>
                        <Table.ScrollContainer minWidth={500}>
                            <Table 
                                verticalSpacing="lg" 
                                withRowBorders={false}
                            >
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Name</Text>
                                        </Table.Th>
                                        <Table.Th>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Status</Text>
                                        </Table.Th>
                                        <Table.Th>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Position</Text>
                                        </Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{rows}</Table.Tbody>
                            </Table>
                        </Table.ScrollContainer>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
            {/* <Modal
                opened={modalOpenedProp}
                onClose={closeModalProp}
                title={<Title order={3}>Team members list</Title>}
                fullScreen={isMobileProp}
                size="xl"
                radius="md"
                classNames={classes}
                transitionProps={{ transition: 'fade', duration: 200 }}
            >
                <Table.ScrollContainer minWidth={500}>
                    <Table verticalSpacing="md">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>
                                    <Text size="lg">Name</Text>
                                </Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Role</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Modal> */}
        </>
    );
}