import { useEffect, useState } from 'react';
import {
    Table,
    ScrollArea,
    UnstyledButton,
    Group,
    Text,
    Center,
    TextInput,
    rem,
    keys,
    Badge,
    ActionIcon,
    Menu,
    Button,
    Loader,
    Avatar,
    Paper,
    Title,
    Stack,
    Grid,
    Box,
} from '@mantine/core';
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch, IconDots, IconArrowsLeftRight, IconMessageCircle, IconPhoto, IconSettings, IconTrash, IconUser, IconUsersGroup } from '@tabler/icons-react';
import classes from '../css/PeopleDirectoryTable.module.css';
import { GetPeopleDirectoryList } from '../helpers/Api';
import { useAuth } from '../authentication/SupabaseAuthContext';
import UserProfileModal from './UserProfileModal';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useNavigationContext } from "../context/NavigationContext";
import AddUnassignedUserBusinessModal from './AddUnassignedUserBusinessModal';
import { MyBusinessData, UserRowData } from '../pages/owner-dashboard/business/Business-Management';

interface UnassignedUsersDirectoryTable {
    userData: UserRowData[] | undefined;
    myBusinessData: MyBusinessData[] | undefined;
    handleAddUnassignedUserToBusiness: (userUid: string, businessId: string) => void; // send user uid and business id to parent
}

// interface UserRowData {
//     uid: string;
//     name: string;
//     email: string;
//     position: string;
// }

interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;
    onSort(): void;
}

export interface ParamFields {
    businessId: string;
    position: string;
    name: string;
    role: string;
    email: string;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
    const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
    return (
        <Table.Th className={classes.th}>
            <UnstyledButton onClick={onSort} className={classes.control}>
                <Group justify="space-between">
                    <Text fw={500} fz="lg">
                        {children}
                    </Text>
                    <Center className={classes.icon}>
                        <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    </Center>
                </Group>
            </UnstyledButton>
        </Table.Th>
    );
}

function filterData(data: UserRowData[], search: string) {
    const query = search.toLowerCase().trim();
    return data.filter((item) =>
        keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
    );
}

function sortData(
    data: UserRowData[],
    payload: { sortBy: keyof UserRowData | null; reversed: boolean; search: string }
) {
    const { sortBy } = payload;

    if (!sortBy) {
        return filterData(data, payload.search);
    }

    return filterData(
        [...data].sort((a, b) => {
            if (payload.reversed) {
                return b[sortBy].localeCompare(a[sortBy]);
            }

            return a[sortBy].localeCompare(b[sortBy]);
        }),
        payload.search
    );
}


export function UnassignedUsersDirectoryTable(props: UnassignedUsersDirectoryTable) {
    const { user, session } = useAuth();
    const [search, setSearch] = useState('');
    const [sortedData, setSortedData] = useState<UserRowData[] | null>(null);
    const [peopleData, setPeopleData] = useState<UserRowData[] | null>(null);
    const [sortBy, setSortBy] = useState<keyof UserRowData | null>(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [selectedUserUid, setSelectedUserUid] = useState('');
    const [profileModalOpened, { open: openProfileModal, close: closeProfileModal }] = useDisclosure(false);
    const [addUnassignedUserModalOpened, { open: openAddUnassignedUserModal, close: closeAddUnassignedUserModal }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [loading, setLoading] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const {
        profilePanelActive, clockInPanelActive, settingsPanelActive, groupsPanelActive,
        timesheetsPanelActive, registrationPanelActive, homePanelActive, managementPanelActive,
        inboxPanelActive, setProfilePanelActive, setClockInPanelActive, setSettingsPanelActive,
        setGroupsPanelActive, setRegistrationPanelActive, setHomePanelActive, setManagementPanelActive,
        setInboxPanelActive, setTimesheetsPanelActive, setActive
    } = useNavigationContext();
    const [myBusinessData, setMyBusinessData] = useState<MyBusinessData[]>([]);

    // props
    const userDataProp = props.userData;
    const myBusinessDataProp = props.myBusinessData;
    const handleAddUnassignedUserToBusinessProp = props.handleAddUnassignedUserToBusiness;

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

    // update state when user data changes
    useEffect(() => {
        if (userDataProp) {
            setPeopleData(userDataProp);
            setLoading(false);
        }
    }, [userDataProp]);


    // update state when my business data changes
    useEffect(() => {
        if (myBusinessDataProp) {
            setMyBusinessData(myBusinessDataProp);
        }
    }, [myBusinessDataProp]);

    const setSorting = (field: keyof UserRowData) => {
        if (peopleData != null) {
            const reversed = field === sortBy ? !reverseSortDirection : false;
            setReverseSortDirection(reversed);
            setSortBy(field);
            setSortedData(sortData(peopleData, { sortBy: field, reversed, search }));
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (peopleData != null) {
            const { value } = event.currentTarget;
            setSearch(value);
            setSortedData(sortData(peopleData, { sortBy, reversed: reverseSortDirection, search: value }));
        }
    };

    function handleUserSelection(userUid: string) {
        setSelectedUserUid(userUid);
        openProfileModal();
    }

    function handleAddButtonClick(userUid: string) {
        setSelectedUserUid(userUid);
        openAddUnassignedUserModal();
    }

    // send back user uid and business id to parent
    function handleAddUnassignedToBusiness(businessId: string) {
        if (selectedUserUid && businessId) {
            handleAddUnassignedUserToBusinessProp(selectedUserUid, businessId);
        }
    }

    const RowItem = ({ name, uid, email }: { name: string; uid: string; email: string; }) => {
        return (
            <Grid align="center">
                <Grid.Col span={{ base: 8 }}>
                    <Group style={{ cursor: "pointer" }} onClick={() => handleUserSelection(uid)}>
                        <Avatar size="lg" style={{ background: "#56796b" }}>
                            <Text c="#dcdcdc" size="25px" style={{ fontFamily: "AK-Medium" }}>{name.charAt(0)}</Text>
                        </Avatar>
                        <Stack>
                            <Box w={windowWidth * 0.11}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium" }}>{name}</Text>
                            </Box>
                            <Text size="15px">{email}</Text>
                        </Stack>
                    </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 4 }}>
                    <Group justify="start">
                        <ActionIcon size="lg" variant="subtle" c="#dcdcdc" onClick={() => handleUserSelection(uid)}>
                            <Text size="30px">⚙️</Text>
                        </ActionIcon>
                        <ActionIcon size="lg" variant="subtle" c="#6C221F" onClick={() => handleAddButtonClick(uid)}>
                            <Text size="25px">➕</Text>
                        </ActionIcon>
                    </Group>
                </Grid.Col>
            </Grid>
        );
    }

    const RowItemMobile = ({ name, uid, email }: { name: string; uid: string; email: string; }) => {
        return (
            <Grid>
                <Grid.Col span={{ base: 8 }}>
                    <Group style={{ cursor: "pointer" }} onClick={() => handleUserSelection(uid)}>
                        <Avatar size="lg" style={{ background: "#56796b" }}>
                            <Text c="#dcdcdc" size="25px" style={{ fontFamily: "AK-Medium" }}>{name.charAt(0)}</Text>
                        </Avatar>
                        <Stack>
                            <Box w={windowWidth * 0.11}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium" }}>{name}</Text>
                            </Box>
                            <Text size="15px">{email}</Text>
                        </Stack>
                    </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 4 }}>
                    <Group justify="start">
                        <ActionIcon size="lg" variant="subtle" c="#dcdcdc" onClick={() => handleUserSelection(uid)}>
                            <Text size="30px">⚙️</Text>
                        </ActionIcon>
                        <ActionIcon size="lg" variant="subtle" c="#6C221F" onClick={() => handleAddButtonClick(uid)}>
                            <Text size="25px">➕</Text>
                        </ActionIcon>
                    </Group>
                </Grid.Col>
            </Grid>
        );
    }

    const rows = peopleData?.map((row: UserRowData) => (
        <>
            {isMobile && (
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#354E40", color: "#dcdcdc" }} mt="sm">
                    <RowItemMobile name={row.name} uid={row.uid} email={row.email} />
                </Paper>
            )}
            {!isMobile && (
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#354E40", color: "#dcdcdc" }} mt="sm">
                    <RowItem name={row.name} uid={row.uid} email={row.email} />
                </Paper>
            )}
        </>
    ));

    const sortedRows = sortedData?.map((row: UserRowData) => (
        <>
            {isMobile && (
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#354E40", color: "#dcdcdc" }} mt="sm">
                    <RowItemMobile name={row.name} uid={row.uid} email={row.email} />
                </Paper>
            )}
            {!isMobile && (
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#354E40", color: "#dcdcdc" }} mt="sm">
                    <RowItem name={row.name} uid={row.uid} email={row.email} />
                </Paper>
            )}
        </>
    ));

    return (
        <>
            {profileModalOpened && (
                <UserProfileModal
                    modalOpened={profileModalOpened}
                    isMobile={isMobile != undefined ? isMobile : false}
                    userUid={selectedUserUid}
                    closeModal={closeProfileModal}
                />
            )}

            {addUnassignedUserModalOpened && (
                <AddUnassignedUserBusinessModal
                    modalOpened={addUnassignedUserModalOpened}
                    isMobile={isMobile != undefined ? isMobile : false}
                    myBusinessData={myBusinessData}
                    closeModal={closeAddUnassignedUserModal}
                    handleAddClick={handleAddUnassignedToBusiness}
                />
            )}

            <Grid align="start">
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Group>
                        {/* <IconUsersGroup style={{ width: rem(30), height: rem(30), color: "#4a8a2a" }} /> */}
                        <Stack>
                            <Text
                                size="35px"
                                fw={600}
                                style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                            >
                                {loading && (
                                    <>Unassigned users</>
                                )}
                                {!loading && rows && rows.length > 0 && !sortedRows && (
                                    <>Unassigned users ({rows.length})</>
                                )}
                                {!loading && sortedRows && sortedRows.length > 0 && (
                                    <>Unassigned users ({sortedRows.length})</>
                                )}
                                {rows && rows.length < 1 && (
                                    <>Unassigned users (0)</>
                                )}

                            </Text>
                        </Stack>
                    </Group>


                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Group justify={windowWidth < 985 ? "start" : "end"}>

                        {/* search input */}
                        <TextInput
                            placeholder="Search by name or email"
                            size="md"
                            m="xs"
                            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                            value={search}
                            onChange={handleSearchChange}
                            classNames={classes}
                            style={{ width: isMobile ? "100%" : "" }}
                        />
                    </Group>
                </Grid.Col>
            </Grid>
            <Stack>
                <ScrollArea>

                    {/* loading spinner */}
                    {loading && (
                        <Group justify="center" mt="lg">
                            <Loader color="cyan" />
                        </Group>
                    )}

                    {/* table headers */}
                    {!loading && ((sortedRows && sortedRows.length > 0) || (rows && rows.length > 0)) && (
                        <Paper shadow="md" p="md" radius="lg" style={{ background: "#44554E", color: "#dcdcdc" }} mt="md">
                            {isMobile && (
                                <Grid>
                                    <Grid.Col span={{ base: 8 }}>
                                        <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Name</Text>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 4 }}>
                                        <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Actions</Text>
                                    </Grid.Col>
                                </Grid>
                            )}
                            {!isMobile && (
                                <Grid>
                                    <Grid.Col span={{ base: 5 }}>
                                        <Text size="26px" style={{ fontFamily: "AK-Medium" }}>Name</Text>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 4 }}>
                                        <Text size="26px" style={{ fontFamily: "AK-Medium" }}>Position</Text>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 3 }}>
                                        <Text size="26px" style={{ fontFamily: "AK-Medium" }}>Actions</Text>
                                    </Grid.Col>
                                </Grid>
                            )}
                        </Paper>
                    )}

                    {/* table rows */}
                    {!loading && sortedRows && sortedRows.length > 0 ? (
                        sortedRows
                    ) : (
                        !loading && rows && rows.length > 0 ? (
                            rows
                        ) : (
                            <Text fw={500} ta="center" mt="lg">
                                {rows && rows.length < 1 && (
                                    "Nothing found"
                                )}
                            </Text>
                        )
                    )}
                </ScrollArea>
            </Stack>
        </>
    );
}