import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, ScrollArea, Stack, TextInput, Textarea, Table, MultiSelect, Checkbox, Text, Space } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../../authentication/AuthContext';
import { PostBusinessGroupRelationship, getBusinessGroupsWithinBusiness, getChildInBusinessId, getStaffInBusinessId } from '../../../../helpers/Api';
import { useGlobalState } from '../../../../context/GlobalStateContext';
import { GroupData } from './GroupManager';
import { useForm } from '@mantine/form';
import { StaffProfile } from '../../staff/StaffAttendance';

interface CreateGroupProps {
    isOpen: boolean;
    handleOpenChanges: (openChange: boolean) => void; // handle changes when modal is opened/closed
}

export default function CreateGroupModal(props: CreateGroupProps) {
    //const [opened, { open, close }] = useDisclosure(false);
    let { authTokens, user }: any = useContext(AuthContext);
    const { businessUid: businessIdGlobal } = useGlobalState();
    const [staffData, setStaffData] = useState<StaffProfile[]>([]);
    const [childData, setChildData] = useState<any[]>([]);
    const [peopleData, setPeopleData] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    // setup props
    let isOpenProp = props.isOpen;
    let handleOpenChangesProp = props.handleOpenChanges;

    // run on componnt load
    useEffect(() => {
        const fetchData = async () => {
            if (authTokens == null || authTokens == undefined) {
                authTokens = JSON.parse(localStorage.getItem("authTokens")!);
            }
            if (businessIdGlobal != null && businessIdGlobal != undefined) {
                // get staffs
                var staffDataLocal = await getStaffInBusinessId(businessIdGlobal, authTokens);
                setStaffData(staffDataLocal);

                // get child/users
                var childDataLocal = await getChildInBusinessId(businessIdGlobal, authTokens);
                setChildData(childDataLocal);

                // add staff to people list
                var selectDataLocal: any = [];
                staffDataLocal.forEach((staff: any) => {
                    let staffObject = {
                        uid: staff.uid,
                        first_name: staff.first_name,
                        last_name: staff.last_name,
                    };
                    selectDataLocal.push(staffObject);
                });

                // add users to people list
                childDataLocal.forEach((child: any) => {
                    let childObject = {
                        uid: child.uid,
                        first_name: child.first_name,
                        last_name: child.last_name,
                    };
                    selectDataLocal.push(childObject);
                });
                setPeopleData(selectDataLocal);
            }
        };
        fetchData();
    }, [])

    useEffect(() => {
        console.log(selectedRows);
    }, [selectedRows])

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            business_id: businessIdGlobal,
            name: '',
        },
        validate: (value) => {
            return {
                name: value.name.trim().length < 1 ? 'Group name is required' : null
            }
        }
    });

    async function handleSubmit() {
        if (!form.validate().hasErrors) {
            try { 
                if (authTokens == null || authTokens == undefined) {
                    authTokens = JSON.parse(localStorage.getItem("authTokens")!);
                }

                // create the group
                // const groupResponse = await PostBusinessGroup(form.values, authTokens);
                // if (groupResponse?.status === 201) {
                //     var groupId = groupResponse.data.Location;
                //     //console.log(selectedRows);
                    
                //     // add users to the group
                //     selectedRows.forEach(async (row: any) => {
                //         console.log("uid:" + groupId);
                //         console.log("business_id:" + businessIdGlobal);
                //         console.log("member_id:" + row);
                //         let relationshipObject = {
                //             uid: groupId,
                //             business_id: businessIdGlobal,
                //             member_id: row,
                //         };
                //         const relationshipResponse = await PostBusinessGroupRelationship(relationshipObject, authTokens);
                //         if (relationshipResponse === 201) {
                //             console.log("Relationship created");
                //         }
                //     });
                // }

                
            } 
            catch (error) {
                // error snackbar
            }  
        }
    }

    const rows = peopleData?.map((person) => (
        <Table.Tr
            key={person.uid}
            bg={selectedRows.includes(person.uid) ? 'var(--mantine-color-blue-light)' : undefined}
        >
            <Table.Td>{person.first_name + " " + person.last_name}</Table.Td>
            <Table.Td>
                <Checkbox
                    aria-label="Select row"
                    checked={selectedRows.includes(person.uid)}
                    onChange={(event) =>
                        setSelectedRows(
                            event.currentTarget.checked
                                ? [...selectedRows, person.uid]
                                : selectedRows.filter((uid) => uid !== person.uid)
                        )
                    }
                />
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Modal
                opened={isOpenProp}
                size="lg"
                onClose={() => {
                    handleOpenChangesProp(false);
                }}
                title=" Create a new group"
                scrollAreaComponent={ScrollArea.Autosize}
            >
                <Stack>
                    <TextInput
                        required
                        variant="filled"
                        id="group-name"
                        label="Group name"
                        name="group_name"
                        placeholder="Group name"
                        size="md"
                        radius="md"
                        {...form.getInputProps('name')}
                    />

                    {/* list of users and staff in the business */}
                    <Space h="sm"/>
                    <Text>Select people to add to this group:</Text>
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Person</Table.Th>
                                <Table.Th />
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                    {selectedRows.length > 0 && (
                        <Button radius="md" size="md" onClick={() => handleSubmit()}>
                            Add to group
                        </Button>
                    )}
                </Stack>
            </Modal>

            {/* <Button onClick={() => setOpened(true)}>Open modal</Button> */}
        </>
    );
}