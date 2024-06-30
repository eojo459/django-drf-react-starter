import { Avatar, Badge, Group, Loader, Modal, Stack, Table, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { GetUserInfoByUid, getUserById } from '../helpers/Api';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { ProfileHeader } from './ProfileHeader';
import { UserProfileModel } from './UserProfile';
import { ProfilePanel } from './ProfilePanel';
import classes from "../css/UserProfileModal.module.css";
//import { getStatusColor } from '../../../helpers/Helpers';

interface IUserProfileModal {
    modalOpened: boolean;
    isMobile: boolean;
    userUid: string;
    closeModal: () => void;
    //teamMemberData: (reason: string) => void; // get team member data from parent
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
];

export default function UserProfileModal(props: IUserProfileModal) {
    const { user, session } = useAuth(); 
    const [ userData, setUserData ] = useState<UserProfileModel | null>(null);
    const [ loading, setLoading ] = useState(false);
    
    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const userUidProp = props.userUid;

    async function fetchData() {
        if (userUidProp != null && userUidProp !== undefined) {
            //var userData = await GetUserInfoByUid(userUidProp, session?.access_token);
            setLoading(true);
            var userData = await getUserById(userUidProp, session?.access_token);
            setUserData(userData);
            setLoading(false);
            console.log(userData);
        }
    }

    // run on component load
    useEffect(() => {
        fetchData();
    },[])

    // run when userUid changes
    useEffect(() => {
        fetchData();
    },[userUidProp])

    // fetch data again when it changes 
    // TODO: REPLACE WITH REACT QUERY
    function updateData(flag: boolean) {
        if (flag) {
            fetchData();
        }
    }

    const rows = elements.map((element) => (
        <Table.Tr key={element.name}>
            <Table.Td>
                <Group gap="sm">
                    <Avatar size={34} radius="xl"/>
                    <Text size="sm" fw={500}>
                        {element.name}
                    </Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge 
                    size="lg" 
                    radius="md" 
                    variant="light"
                    color="gray"
                >
                    {element.status}
                </Badge>
            </Table.Td>
            <Table.Td>
                {/* <Badge>{element.role}</Badge> */}
                {element.role}
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Modal
                opened={modalOpenedProp}
                onClose={closeModalProp}
                //title={<Title order={3}>{userData?.first_name + " " + userData?.last_name + "'s profile"}</Title>}
                fullScreen={isMobileProp}
                size="80%"
                radius="md"
                //withCloseButton={false}
                classNames={classes}
                transitionProps={{ transition: 'fade', duration: 200 }}
            >
                {loading && (
                    <Group justify="center">
                        <Loader color="cyan" />
                    </Group>  
                )}

                {userData != null && (
                    <Stack>
                        <ProfileHeader user={userData} />
                        <ProfilePanel user={userData} handleDataChange={updateData}/>
                    </Stack>
                )}
                
            </Modal>
        </>
    );
}