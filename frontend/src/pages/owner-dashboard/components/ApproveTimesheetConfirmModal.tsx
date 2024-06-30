import { Avatar, Badge, Button, Grid, Group, Loader, Modal, Stack, Table, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { GetUserInfoByUid, getUserById } from '../../../helpers/Api';
import { useAuth } from '../../../authentication/SupabaseAuthContext';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { UserProfileModel } from '../../../components/UserProfile';
import classes from "../../../css/UserProfileModal.module.css";
//import { getStatusColor } from '../../../helpers/Helpers';

interface ApproveTimesheetConfirmModal {
    modalOpened: boolean;
    isMobile: boolean;
    timesheetId: string;
    closeModal: () => void;
    handleApproveClick: (timesheet: string) => void;
}

export default function ApproveTimesheetConfirmModal(props: ApproveTimesheetConfirmModal) {
    const { user, session } = useAuth(); 
    const [ userData, setUserData ] = useState<UserProfileModel | null>(null);
    const [ loading, setLoading ] = useState(false);
    
    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const timesheedIdProp = props.timesheetId;
    const handleApproveClick = props.handleApproveClick;

    function handleApproveButtonClick(timesheetId: string) {
        handleApproveClick(timesheetId);
        closeModalProp();
    }

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
                        <Text size="xl" fw={500}>Are you sure you want to approve this timesheet?</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }} mt="lg">
                        <Group justify="end">
                            <Button
                                size="lg"
                                radius="md"
                                color="#3C5B4C"
                                fullWidth
                                onClick={() => closeModalProp()}
                            >
                                Cancel
                            </Button>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }} mt="lg">
                        <Group justify="end">
                            <Button
                                size="lg"
                                radius="md"
                                color="#316F22"
                                fullWidth
                                onClick={() => handleApproveButtonClick(timesheedIdProp)}
                            >
                                Approve
                            </Button>
                        </Group>
                    </Grid.Col>
                </Grid>
                
            </Modal>
        </>
    );
}