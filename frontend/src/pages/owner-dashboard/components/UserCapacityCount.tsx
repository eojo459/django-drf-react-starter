import { Text, Progress, Card, Space, Divider } from '@mantine/core';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../authentication/AuthContext';
import { useGlobalState } from '../../../context/GlobalStateContext';
import { getAbsentCount, getBusinessProfilePlanById, getChildCountInBusinessId, getStaffCountInBusinessId } from '../../../helpers/Api';

export function UserCapacityCount() {
    let { authTokens, user }: any = useContext(AuthContext);
    const { businessUid, businessPlanUid } = useGlobalState();
    const [userCapacity, setUserCapacity] = useState<number>(0)
    const [staffCapacity, setStaffCapacity] = useState<number>(0)
    const [userCount, setUserCount] = useState<number>(0)
    const [staffCount, setStaffCount] = useState<number>(0)

    // run on component load
    useEffect(() => {
        async function fetchData() {
            if (businessUid != null && businessUid != undefined && businessUid != '') {
                if (authTokens == null || authTokens == undefined) {
                    authTokens = JSON.parse(localStorage.getItem("authTokens")!);
                }

                // get user & staff capacity
                var businessPlan = await getBusinessProfilePlanById(businessPlanUid, authTokens);
                if (businessPlan != null && businessPlan != undefined && businessPlan.length > 0) {
                    setUserCapacity(businessPlan?.max_users);
                    setStaffCapacity(businessPlan?.max_staff);
    
                    // get user & staff count
                    var userCount = await getChildCountInBusinessId(businessUid, authTokens);
                    var staffCount = await getStaffCountInBusinessId(businessUid, authTokens);
                    setUserCount(userCount?.count);
                    setStaffCount(staffCount?.count);
                }
            }
        }
        fetchData();
    }, [businessUid])

    return (
        <>
            {/* <Card radius="md" padding="xl" bg="var(--mantine-color-body)"> */}
            <Text fz="sm" fw={700}>
                User capacity
            </Text>
            <Text fz="lg" fw={500}>
                {userCount} / {userCapacity}
            </Text>
            <Progress value={(userCount / userCapacity) * 100} mt="md" size="lg" radius="xl" />
            <Space h="xl" />
            <Divider />
            <Space h="xl" />
            <Text fz="sm" fw={700}>
                Staff capacity
            </Text>
            <Text fz="lg" fw={500}>
                {staffCount} / {staffCapacity}
            </Text>
            <Progress value={(staffCount / staffCapacity) * 100} mt="md" size="lg" radius="xl" />
            {/* </Card> */}
        </>
    );
}