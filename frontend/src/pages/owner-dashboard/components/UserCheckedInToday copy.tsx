import { Avatar, Badge, Group, Paper, ScrollArea, Stack, Table, Text, Title } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../authentication/AuthContext';
import { getAbsentCount, getAttendanceCount, getDailyAttendanceStatus } from '../../../helpers/Api';
import { useGlobalState } from '../../../context/GlobalStateContext';

const rowData = [
    { first_name: 'John', last_name: "Blake", value: "08:00:00", status: "0"},
    { first_name: 'Cary', last_name: "Thompson", value: "08:00:00", status: "0" },
    { first_name: 'Brayden', last_name: "Joe", value: "08:00:00", status: "1" },
    { first_name: 'Kyle', last_name: "Fraser", value: "08:00:00", status: "2" },
    { first_name: 'John', last_name: "Plankton", value: "08:00:00", status: "2" },
    { first_name: 'Cary', last_name: "Terrai", value: "08:00:00", status: "0" },
    { first_name: 'Brayden', last_name: "Cake", value: "08:00:00", status: "0" },
    { first_name: 'Kyle', last_name: "Lowry", value: "08:00:00", status: "1" },
    { first_name: 'Thisisavery', last_name: "LongnameIknow", value: "08:00:00", status: "0" },
    { first_name: 'Cary', last_name: "Simpson", value: "08:00:00", status: "-" },
    { first_name: 'Brayden', last_name: "Kite", value: "08:00:00", status: "0" },
    { first_name: 'Kyle', last_name: "Might", value: "08:00:00", status: "0" },
];

export default function UserCheckedInToday() {
    let { authTokens, user }: any = useContext(AuthContext);
    const { businessUid } = useGlobalState();
    const [checkedInData, setCheckedInData] = useState<any>([])

    // run on component load
    useEffect(() => {
        async function fetchData() {
            if (businessUid != null && businessUid != undefined && businessUid != '') {
                if (authTokens == null || authTokens == undefined) {
                    authTokens = JSON.parse(localStorage.getItem("authTokens")!);
                }

                // get status data
                //var statusData = await getDailyAttendanceStatus(businessUid, authTokens);
                //setCheckedInData(statusData);
            }
        }
        fetchData();
    }, [businessUid])

    const rows = rowData?.map((row: any) => (
        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#212735", color: "white" }}>
            <Group grow justify="space-between">
                <Avatar size="md" style={{maxWidth:"40px"}}>{row.first_name.charAt(0) + row.last_name.charAt(0)}</Avatar>
                <Text truncate="end" size="md" fw={600}>{row.first_name + " " + row.last_name}</Text>
                {row.status == "0" && (
                    <Badge color="red" size="lg" radius="md">OUT</Badge>
                )}
                {row.status == "1" && (
                    <Badge color="green" size="lg" radius="md">IN</Badge>
                )}
                {row.status == "2" && (
                    <Badge color="yellow" size="lg" radius="md">BREAK</Badge>
                )}
                {row.status == "-" && (
                    <Badge color="gray" size="lg" radius="md">• • •</Badge>
                )}
            </Group>
        </Paper>
    ));

    return (
        // <Table.ScrollContainer minWidth={500}>
        <ScrollArea h={200} style={{ borderRadius: "15px", paddingBottom:"15px" }}>
            <Stack>
                {rows}
            </Stack>
        </ScrollArea>

        //</Table.ScrollContainer>
    );
}