import { Avatar, Badge, Button, Grid, Group, Loader, Modal, Stack, Table, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { GetUserInfoByUid, getUserById } from '../helpers/Api';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { ProfileHeader } from './ProfileHeader';
import { UserProfileModel } from './UserProfile';
import classes from "../css/UserProfileModal.module.css";
//import { getStatusColor } from '../../../helpers/Helpers';

interface ICancelSubscriptionModal {
    modalOpened: boolean;
    isMobile: boolean;
    closeModal: () => void;
    handleEndOfTermClick: () => void;
    handleImmediateClick: () => void;
}

export default function CancelSubscriptionModal(props: ICancelSubscriptionModal) {
    const { user, session } = useAuth(); 
    const [ loading, setLoading ] = useState(false);
    
    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const handleEndOfTermClickProp = props.handleEndOfTermClick;
    const handleImmediateClickProp = props.handleImmediateClick;

    function handleEndOfTermButtonClick() {
        handleEndOfTermClickProp();
        closeModalProp();
    }

    function handleImmediateButtonClick() {
        handleImmediateClickProp();
        closeModalProp();
    }

    return (
        <>
            <Modal
                title={<Text c="#dcdcdc" size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Cancel subscription</Text>}
                opened={modalOpenedProp}
                onClose={closeModalProp}
                fullScreen={isMobileProp}
                size="lg"
                radius="md"
                //withCloseButton={false}
                classNames={classes}
                transitionProps={{ transition: 'fade', duration: 200 }}
            >
                <Grid c="#dcdcdc" align="end">
                    <Grid.Col span={{ base: 12 }}>
                        <Text size="xl" fw={500}>Cancel the subscription at the end of the term or immediately?</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Button
                            size="lg"
                            radius="md"
                            color="#3C5B4C"
                            fullWidth
                            onClick={handleEndOfTermButtonClick}
                        >
                            End of term
                        </Button>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }} mt="lg">
                        <Button
                            size="lg"
                            radius="md"
                            variant="light"
                            color="red"
                            fullWidth
                            onClick={handleImmediateButtonClick}
                        >
                            Immediate
                        </Button>
                    </Grid.Col>
                    {/* <Grid.Col span={{ base: 6 }} mt="lg">
                        <Group justify="end">
                            <Button
                                size="lg"
                                radius="md"
                                color="#6C221F"
                                fullWidth
                                onClick={() => handleOkButtonClick()}
                            >
                                Ok
                            </Button>
                        </Group>
                    </Grid.Col> */}
                </Grid>
                
            </Modal>
        </>
    );
}