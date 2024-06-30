import { ScrollArea, Table } from '@mantine/core';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../authentication/AuthContext';
import { useGlobalState } from '../../../context/GlobalStateContext';
import { getDailyAttendanceStatus, getAttendanceCount, getAbsentCount } from '../../../helpers/Api';

const rowData = [
    { name: 'John Blake', count: 1 },
    { name: 'Cary Thompson', count: 2 },
    { name: 'Brayden Joe', count: 1 },
    { name: 'Kyle Fraser', count: 0 },
    { name: 'John Lake', count: 4 },
    { name: 'Cary Simpson', count: 3 },
    { name: 'Brayden Carousel', count: 2 },
    { name: 'Kyle Fries', count: 1 },
    { name: 'John Name', count: 2 },
    { name: 'Cary Cake', count: 4 },
    { name: 'Brayden Tyrant', count: 3 },
    { name: 'Kyle Fred', count: 2 },
  ];

export default function AttendanceWeekCount() {
  let {authTokens, user}: any = useContext(AuthContext);
  const { businessUid } = useGlobalState();
  const [attendanceCountData, setAttendanceCountData] = useState<any>([])

  // run on component load
  useEffect(() => {
    async function fetchData() {
      if (businessUid != null && businessUid != undefined && businessUid != '') {
        if (authTokens == null || authTokens == undefined) {
          authTokens = JSON.parse(localStorage.getItem("authTokens")!);
        }
      
        // get attendance count data
        var attendanceCountData = await getAttendanceCount(businessUid, "week", authTokens);
        setAttendanceCountData(attendanceCountData);
      }
    } 
    fetchData();
  }, [businessUid])

  const rows = attendanceCountData?.map((row: any) => (
    <Table.Tr key={row.uid}>
      <Table.Td>{row.name}</Table.Td>
      <Table.Td>{row.value}</Table.Td>
    </Table.Tr>
  ));

  return (
    // <Table.ScrollContainer minWidth={500}>
    <ScrollArea h={200} style={{borderRadius:"15px"}}>
        <Table stickyHeader verticalSpacing="xs" horizontalSpacing="md">
            <Table.Thead>
            <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Count</Table.Th>
            </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    </ScrollArea>
      
    //</Table.ScrollContainer>
  );
}