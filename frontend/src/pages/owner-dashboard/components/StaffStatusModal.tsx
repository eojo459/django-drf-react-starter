import { Avatar, Badge, Button, Group, Modal, Stack, Table, TextInput, Textarea, Title, Text, ScrollArea, Space, Paper, Grid } from "@mantine/core";
import { useState } from "react";
import { getStatusColor } from "../../../helpers/Helpers";
import { randomId } from "@mantine/hooks";
import { StaffActivity, UserActivityModel } from "../../../components/HomePanel";

interface StaffStatusModal {
    modalOpened: boolean;
    isMobile: boolean;
    staffData: UserActivityModel[]; // get data from parent
    closeModal: () => void;
}

// status_int 
// 0 = check out
// 1 = check in
// 2 = break
// -1 = no unknown status
const elements = [
    { name: 'Carbon', role: 'Crew member', status: 'IN • 7:00 AM', status_int: 1 },
    { name: 'Nitrogen', role: 'Employee', status: 'OUT • 2:00 PM', status_int: 0 },
    { name: 'Yttrium', role: 'Crew member', status: 'IN • 8:30 AM', status_int: 1},
    { name: 'Barium', role: 'Manager', status: 'BREAK • 9:00 AM', status_int: 2},
    { name: 'Cerium', role: 'Employee', status: '• • •', status_int: -1 },
    { name: 'Carbon', role: 'Crew member', status: 'IN • 7:00 AM', status_int: 1 },
    { name: 'Nitrogen', role: 'Employee', status: 'OUT • 2:00 PM', status_int: 0 },
    { name: 'Yttrium', role: 'Crew member', status: 'IN • 8:30 AM', status_int: 1},
    { name: 'Barium', role: 'Manager', status: 'BREAK • 9:00 AM', status_int: 2},
    { name: 'Cerium', role: 'Employee', status: '• • •', status_int: -1 },
    { name: 'Carbon', role: 'Crew member', status: 'IN • 7:00 AM', status_int: 1 },
    { name: 'Nitrogen', role: 'Employee', status: 'OUT • 2:00 PM', status_int: 0 },
    { name: 'Yttrium', role: 'Crew member', status: 'IN • 8:30 AM', status_int: 1},
    { name: 'Barium', role: 'Manager', status: 'BREAK • 9:00 AM', status_int: 2},
    { name: 'Cerium', role: 'Employee', status: '• • •', status_int: -1 },
];

const rowData = [
    { uid: randomId(), first_name: 'John', last_name: "Blake", value: "8:00 AM", status: 0, role: "Crew Member"},
    { uid: randomId(), first_name: 'Cary', last_name: "Thompson", value: "7:00 AM", status: 0, role: "Employee" },
    { uid: randomId(), first_name: 'Brayden', last_name: "Joe", value: "9:00 AM", status: 1, role: "Employee" },
    { uid: randomId(), first_name: 'Kyle', last_name: "Fraser", value: "3:00 PM", status: 2, role: "Crew Member" },
    { uid: randomId(), first_name: 'John', last_name: "Plankton", value: "7:00 AM", status: 2, role: "Manager" },
    { uid: randomId(), first_name: 'Cary', last_name: "Terrai", value: "8:30 AM", status: 2, role: "Crew Member" },
    { uid: randomId(), first_name: 'Brayden', last_name: "Cake", value: "1:00 PM", status: -1, role: "Employee" },
    { uid: randomId(), first_name: 'Kyle', last_name: "Lowry", value: "4:00 PM", status: 1, role: "Crew Member" },
    { uid: randomId(), first_name: 'Thisisavery', last_name: "LongnameIknow", value: "7:00 AM", status: 0, role: "Manager" },
    { uid: randomId(), first_name: 'Cary', last_name: "Simpson", value: "9:00 AM", status: -1, role: "Crew Member" },
    { uid: randomId(), first_name: 'Brayden', last_name: "Kite", value: "5:30 PM", status: 0, role: "Employee" },
    { uid: randomId(), first_name: 'Kyle', last_name: "Might", value: "5:00 PM", status: 0, role: "Crew Member" },
];

export default function StaffStatusModal(props: StaffStatusModal) {
    const [reasonValue, setReasonValue] = useState('');

    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const staffDataProp = props.staffData;


    const rows = staffDataProp.map((user) => (
        <Table.Tr key={user.uid}>
            <Table.Td>
                <Group gap="sm">
                    <Avatar size={34} radius="xl">{user.first_name.charAt(0) + user.last_name.charAt(0)}</Avatar>
                    <Text truncate="end" size="lg" fw={500}>
                        {user.first_name + " " + user.last_name}
                    </Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge 
                    size="xl" 
                    radius="md" 
                    variant="light"
                    color={getStatusColor(user.status)}
                >
                    {user.status == 1 && (
                        <>OUT • {user.timestamp}</>
                    )}
                    {(user.status == 2 || user.status == 4) && (
                        <>IN • {user.timestamp}</>
                    )}
                    {user.status == 3 && (
                        <>BREAK • {user.timestamp}</>
                    )}
                    {user.status == 5 && (
                        <>• • •</>
                    )}
                </Badge>
            </Table.Td>
            <Table.Td>
                {/* <Badge>{element.role}</Badge> */}
                <Badge 
                    size="xl" 
                    radius="md" 
                    variant="light"
                    color="gray"
                >
                    {user.position}
                </Badge>
                {/* <Text size="lg" fw={500}>
                    {element.role}
                </Text> */}
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Modal
                opened={modalOpenedProp}
                onClose={closeModalProp}
                fullScreen={isMobileProp}
                size="xl"
                radius="md"
                transitionProps={{ transition: 'fade', duration: 200 }}
                scrollAreaComponent={ScrollArea.Autosize}
                withCloseButton={false}
            >
                <Table verticalSpacing="md" stickyHeader>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>
                                <Title order={3}>Name</Title>
                            </Table.Th>
                            <Table.Th>
                                <Group>
                                    <Title order={3}>Status</Title>
                                    <Badge 
                                        size="xl" 
                                        radius="md" 
                                        variant="light"
                                        color="gray"
                                    >
                                        <Title ta="center" order={3}>12:31 PM</Title>
                                    </Badge>  
                                </Group>
                            </Table.Th>
                            <Table.Th>
                                <Title order={3}>Role</Title>
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows}
                    </Table.Tbody>
                </Table>
                <Space h="lg"/>
                <Button 
                    fullWidth 
                    size="lg" 
                    radius="md" 
                    variant="light"
                    color="gray"
                    onClick={closeModalProp}
                >
                    Close
                </Button>
            </Modal>
        </>
    );
}