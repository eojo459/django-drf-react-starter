import { Avatar, Badge, Button, Grid, Group, Loader, Modal, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { GetUserInfoByUid, getUserById } from '../helpers/Api';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { ProfileHeader } from './ProfileHeader';
import { UserProfileModel } from './UserProfile';
import classes from "../css/UserProfileModal.module.css";
import { TimesheetDataReview, TimesheetReviewInformation } from '../pages/staff-dashboard/timesheet';
import { useMediaQuery } from '@mantine/hooks';
import { formatDate, getFormattedDate } from '../helpers/Helpers';
//import { getStatusColor } from '../../../helpers/Helpers';

interface ISubmitTimesheetConfirmModal {
    modalOpened: boolean;
    isMobile: boolean;
    //userUid: string;
    timesheetReviewData: TimesheetReviewInformation | undefined;
    closeModal: () => void;
    submitClicked: () => void;
}

export default function SubmitTimesheetConfirmModal(props: ISubmitTimesheetConfirmModal) {
    const { user, session } = useAuth(); 
    const [ userData, setUserData ] = useState<UserProfileModel | null>(null);
    const [ loading, setLoading ] = useState(false);
    const isMobile = useMediaQuery('(max-width: 25em)');
    
    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    //const userUidProp = props.userUid;
    const handleSubmitClickedProp = props.submitClicked;
    const timesheetReviewDataProp = props.timesheetReviewData;


    return (
        <>
            <Modal
                title={<Text c="#dcdcdc" size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Confirm your action</Text>}
                opened={modalOpenedProp}
                onClose={closeModalProp}
                fullScreen={isMobileProp}
                size="lg"
                radius="md"
                //withCloseButton={false}
                classNames={classes}
                transitionProps={{ transition: 'fade', duration: 200 }}
            >
                <Grid c="#dcdcdc">
                    <Grid.Col span={{ base: 12 }}>
                        <Text size="xl" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>Please review your timesheet again before submitting.</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Text c="#dcdcdc" size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{getFormattedDate(timesheetReviewDataProp?.startDate, "short")} - {getFormattedDate(timesheetReviewDataProp?.endDate, "short")}, 2024 summary</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <Stack>

                            {/* total hours */}
                            <Paper shadow="md" p="lg" pr="xl" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="sm">
                                <Grid align="center">
                                    <Grid.Col span={{ base: 7 }}>
                                        <Stack gap="xs">
                                            <Group>
                                                <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Total hours</Text>
                                            </Group>
                                            <Text c="#c1c0c0" size="lg" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>Total hours worked was {timesheetReviewDataProp?.totalHours.toFixed(2)} h</Text>
                                        </Stack>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 5 }}>
                                        {isMobile && (
                                            <Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{timesheetReviewDataProp?.totalHours.toFixed(2)} h</Text>
                                            </Badge>
                                        )}
                                        {!isMobile && (
                                            <Group justify="end">
                                                < Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                                    <Text c="#dcdcdc" size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{timesheetReviewDataProp?.totalHours.toFixed(2)} h</Text>
                                                </Badge>
                                            </Group>
                                        )}
                                    </Grid.Col>
                                </Grid>
                            </Paper>

                            {/* pay rate */}
                            {/* <Paper shadow="md" p="lg" pr="xl" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="sm">
                                <Grid align="center">
                                    <Grid.Col span={{ base: 7 }}>
                                        <Stack gap="xs">
                                            <Group>
                                                <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pay rate</Text>
                                            </Group>
                                            <Text c="#c1c0c0" size="lg" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>Current rate is {timesheetReviewDataProp?.payRate} per hour</Text>
                                        </Stack>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 5 }}>
                                        {isMobile && (
                                            <Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>${timesheetReviewDataProp?.payRate} /hr</Text>
                                            </Badge>
                                        )}
                                        {!isMobile && (
                                            <Group justify="end">
                                                < Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                                    <Text c="#dcdcdc" size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>${timesheetReviewDataProp?.payRate} /hr</Text>
                                                </Badge>
                                            </Group>
                                        )}
                                    </Grid.Col>
                                </Grid>
                            </Paper> */}

                            {/* total pay */}
                            {/* <Paper shadow="md" p="lg" pr="xl" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }} mt="sm">
                                <Grid align="center">
                                    <Grid.Col span={{ base: 7 }}>
                                        <Stack gap="xs">
                                            <Group>
                                                <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Total pay</Text>
                                            </Group>
                                            <Text c="#c1c0c0" size="lg" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>Total pay was ${timesheetReviewDataProp?.totalPay.toFixed(2)}</Text>
                                        </Stack>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 5 }}>
                                        {isMobile && (
                                            <Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>${timesheetReviewDataProp?.totalPay.toFixed(2)}</Text>
                                            </Badge>
                                        )}
                                        {!isMobile && (
                                            <Group justify="end">
                                                < Badge size="45px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                                    <Text c="#dcdcdc" size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>${timesheetReviewDataProp?.totalPay.toFixed(2)}</Text>
                                                </Badge>
                                            </Group>
                                        )}
                                    </Grid.Col>
                                </Grid>
                            </Paper> */}
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }} mt="lg">
                        <Group justify="end">
                            <Button
                                size="lg"
                                radius="md"
                                color="#6C221F"
                                fullWidth
                                onClick={() => closeModalProp()}
                            >
                                Cancel
                            </Button>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }} mt="lg">
                        <Button 
                            size="lg" 
                            radius="md" 
                            color="#316F22"
                            fullWidth
                            onClick={() => {
                                handleSubmitClickedProp();
                                closeModalProp();
                            }} 
                        >
                            Submit
                        </Button>
                    </Grid.Col>
                </Grid>
                
            </Modal>
        </>
    );
}