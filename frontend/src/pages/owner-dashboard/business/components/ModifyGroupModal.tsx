import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, ScrollArea, Stack, TextInput, Textarea, Table } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../../authentication/AuthContext';
import { getBusinessGroupById, getBusinessGroupsWithinBusiness } from '../../../../helpers/Api';
import { useGlobalState } from '../../../../context/GlobalStateContext';
import { GroupData } from './GroupManager';
import { useForm } from '@mantine/form';

interface ModifyGroupProps {
    isOpen: boolean;
    groupUid: string;
    handleOpenChanges: (openChange: boolean) => void; // handle changes when modal is opened/closed
}

export default function ModifyGroupModal(props: ModifyGroupProps) {
    //const [opened, { open, close }] = useDisclosure(false);
    let {authTokens, user}: any = useContext(AuthContext);
    const {businessUid: businessId} = useGlobalState();
    const [opened, setOpened] = useState<boolean>(false);
    const [groupData, setGroupData] = useState<GroupData>();

    // setup props
    let isOpenProp = props.isOpen;
    let groupUid = props.groupUid;
    let handleOpenChangesProp = props.handleOpenChanges;

    // run on componnt load
    useEffect(() => {
        const fetchData = async () => {
            if (authTokens == null || authTokens == undefined) {
                authTokens = JSON.parse(localStorage.getItem("authTokens")!);
            }
            var groupDataLocal = await getBusinessGroupById(groupUid, authTokens);
            setGroupData(groupDataLocal);
        };
        fetchData();
    },[])

    useEffect(() => {
        if (groupData){
            form.values.name = groupData.name;
            form.values.description = groupData.description;
        }
    },[groupData])

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            name: '',
            description: '',
        },
        validate: (value) => {
            return {
                name: value.name.trim().length < 1 ? 'Group name is required' : null
            }
        }
    });

    const rows = groupData?.members.map((element) => (
        <Table.Tr key={element.uid}>
          <Table.Td>{element.first_name + " " + element.last_name}</Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Modal
                opened={isOpenProp}
                size="lg"
                onClose={() => {
                    setOpened(false);
                    handleOpenChangesProp(false);
                }}
                title="Header is sticky"
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

                    {/* members in the group */}
                    <Table stickyHeader stickyHeaderOffset={60}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Person</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </Stack>
            </Modal>

            {/* <Button onClick={() => setOpened(true)}>Open modal</Button> */}
        </>
    );
}