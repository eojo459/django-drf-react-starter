import { Avatar, Button, Grid, Group, Paper, Space, Stack, Text, Tooltip } from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import ModifyGroupModal from './ModifyGroupModal';
import { AuthContext } from '../../../../authentication/AuthContext';
import { DeleteBusinessGroup, getBusinessGroupsWithinBusiness } from '../../../../helpers/Api';
import { useGlobalState } from '../../../../context/GlobalStateContext';
import CreateGroupModal from './CreateGroupModal';

export type GroupData = {
    uid: string;
    name: string;
    description: string;
    members: {
        uid: string;
        first_name: string;
        last_name: string;
    }[];
    member_count: number;
}

export default function GroupManager() {
    //let {authTokens, user}: any = useContext(AuthContext);
    const {businessUid: businessId} = useGlobalState();
    const [createModalOpened, setCreateModalOpened] = useState<boolean>(false);
    const [editModalOpened, setEditModalOpened] = useState<boolean>(false);
    const [groupList, setGroupList] = useState<GroupData[]>([]);
    const [editGroupUid, setEditGroupUid] = useState('');

    // run on componnt load
    // useEffect(() => {
    //     fetchData();
    // },[businessId])

    // useEffect(() => {
    //     if (createModalOpened == false || editModalOpened == false) {
    //         fetchData();
    //     }
    // },[createModalOpened, editModalOpened])

    // fetch data from api
    // const fetchData = async () => {
    //     if (authTokens == null || authTokens == undefined) {
    //         authTokens = JSON.parse(localStorage.getItem("authTokens")!);
    //     }
    //     if (businessId != null && businessId != undefined && businessId != '') {
    //         var groupDataLocal = await getBusinessGroupsWithinBusiness(businessId, authTokens);
    //         setGroupList(groupDataLocal);
    //     }
    // };

    // handlers
    function handleEditChanges(openChange: boolean, groupUid?: string) {
        if (openChange) {
            setEditModalOpened(true);
            if (groupUid){
                setEditGroupUid(groupUid);
            }
        }
        else {
            setEditModalOpened(false);
        }
    }

    function handleCreateChanges(openChange: boolean) {
        if (openChange) {
            setCreateModalOpened(true);
        }
        else {
            setCreateModalOpened(false);
        }
    }

    async function handleDelete(groupId: string) {
        // if (authTokens == null || authTokens == undefined) {
        //     authTokens = JSON.parse(localStorage.getItem("authTokens")!);
        // }
        // var groupResponse = await DeleteBusinessGroup(groupId, authTokens);
        // if (groupResponse === 200) {
        //     // success alert
        // }
        // else {
        //     // error alert
        // }
    }

    const gridRows = groupList?.map((group) => (
        <Grid.Col span={{base: 12, xs: 3}}>
            <Paper shadow="md" p="xl" radius="lg" style={{background:"#161b26", minHeight:"200px", color:"white"}}>
                <Stack gap="lg">
                    <Group justify="space-between">
                        <Text fw={700}>{group.member_count} users</Text>
                        <Avatar.Group spacing="xs">
                            <Tooltip label="user name" withArrow>
                                <Avatar color="cyan" radius="xl">MK</Avatar>
                            </Tooltip>
                            <Tooltip label="Salazar Troop" withArrow>
                                <Avatar color="red" radius="xl">AB</Avatar>    
                            </Tooltip>
                            <Tooltip label="Salazar Troop" withArrow>
                                <Avatar color="green" radius="xl">CD</Avatar>
                            </Tooltip>
                            <Avatar>+5</Avatar>
                        </Avatar.Group>
                    </Group>
                    <Text size="xl">
                        {group.name}
                    </Text>
                    <Space h="xs"/>
                    <Grid>
                        <Grid.Col span={{base: 12, md: 6}}>
                            <Button 
                                variant="light" 
                                radius="md" 
                                size="md" 
                                fullWidth
                                onClick={() => handleEditChanges(true, group.uid)}
                            >
                                Edit
                            </Button>
                        </Grid.Col>
                        <Grid.Col span={{base: 12,  md: 6}}>
                            <Button 
                                variant="light" 
                                color="red" 
                                radius="md" 
                                size="md" 
                                fullWidth
                                onClick={() => handleDelete(group.uid)}
                            >
                                Delete
                            </Button>
                        </Grid.Col>
                    </Grid>
                </Stack>
            </Paper>
        </Grid.Col>
    ));
    
    return(
        <>
            {/* create modal */}
            { createModalOpened && (
                <CreateGroupModal isOpen={createModalOpened} handleOpenChanges={handleCreateChanges}/>
            )}

            {/* edit modal */}
            { editModalOpened && (
                <ModifyGroupModal isOpen={editModalOpened} handleOpenChanges={handleEditChanges} groupUid={editGroupUid}/>
            )}
            <Grid 
                grow
                gutter="xs"
            >
                {gridRows}
                
                <Grid.Col span={{base: 12, xs: 3}} mt="lg">
                    <Button 
                        //variant="light" 
                        color="#336E1E"
                        radius="md" 
                        size="md" 
                        //disabled
                        //onClick={() => handleCreateChanges(true)}
                    >
                        Add new group
                    </Button>
                </Grid.Col>
            </Grid>
        </>
    )
}