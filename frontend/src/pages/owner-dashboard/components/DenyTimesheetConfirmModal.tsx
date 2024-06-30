import { Avatar, Badge, Button, Grid, Group, Loader, Modal, Stack, Table, Text, Textarea, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { GetUserInfoByUid, getUserById } from '../../../helpers/Api';
import { useAuth } from '../../../authentication/SupabaseAuthContext';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { UserProfileModel } from '../../../components/UserProfile';
import classes from "../../../css/UserProfileModal.module.css";
import textClasses from "../../../css/TextInput.module.css";
//import { getStatusColor } from '../../../helpers/Helpers';

interface DenyTimesheetConfirmModal {
    modalOpened: boolean;
    isMobile: boolean;
    timesheetId: string;
    closeModal: () => void;
    handleDenyClick: (timesheet: string, denyReason: string) => void;
}

export default function DenyTimesheetConfirmModal(props: DenyTimesheetConfirmModal) {
    const { user, session } = useAuth(); 
    const [ userData, setUserData ] = useState<UserProfileModel | null>(null);
    const [ loading, setLoading ] = useState(false);
    const [denyReason, setDenyReason] = useState('');
    
    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const timesheedIdProp = props.timesheetId;
    const handleDenyClick = props.handleDenyClick;

    function handleDenyButtonClick(timesheetId: string) {
        handleDenyClick(timesheetId, denyReason);
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
                        <Text size="xl" fw={500}>Are you sure you want to deny this timesheet?</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <Textarea
                            required
                            id="reason"
                            value={denyReason}
                            onChange={(event) => setDenyReason(event.currentTarget.value)}
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Reason"
                            name="reason"
                            autosize
                            minRows={2}
                            maxRows={4}
                            placeholder="Enter a reason"
                            size="lg"
                            classNames={textClasses}
                            //{...form.getInputProps('staff_info.last_name')}
                        />
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
                                color="#6C221F"
                                fullWidth
                                disabled={denyReason?.length > 5 ? false : true}
                                onClick={() => handleDenyButtonClick(timesheedIdProp)}
                            >
                                Deny
                            </Button>
                        </Group>
                    </Grid.Col>
                </Grid>
                
            </Modal>
        </>
    );
}