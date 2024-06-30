import { Avatar, Badge, Button, Grid, Group, Loader, Modal, Stack, Table, Text, TextInput, Title, rem } from '@mantine/core';
import { useEffect, useState } from 'react';
import { GetChargebeeUpdatePaymentMethodCheckoutUrl, GetUserInfoByUid, getUserById } from '../helpers/Api';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { ProfileHeader } from './ProfileHeader';
import { UserProfileModel } from './UserProfile';
import classes from "../css/UserProfileModal.module.css";
import inputClasses from "../css/UserProfile.module.css";
//import { getStatusColor } from '../../../helpers/Helpers';
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../css/Notifications.module.css";
import { IconCheck, IconX } from '@tabler/icons-react';

interface IVerifyConfirmEmailModal {
    modalOpened: boolean;
    isMobile: boolean;
    closeModal: () => void;
    handleSendEmail: (redirect: string) => void;
}

export default function VerifyConfirmEmailModal(props: IVerifyConfirmEmailModal) {
    const { user, session } = useAuth(); 
    const [ loading, setLoading ] = useState(false);
    const [redirectPath, setRedirectPath] = useState('');
    
    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const handleSendEmailClickProp = props.handleSendEmail;

    // run on component load
    useEffect(() => {
        // get the URL location
        setRedirectPath(window.location.pathname);
    },[]);

    // handle when send email button is clicked
    function handleSendEmailButtonClick() {
        handleSendEmailClickProp(redirectPath);
        closeModalProp();
    }

    return (
        <>
            <Modal
                title={<Text c="#dcdcdc" size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Verify your email</Text>}
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
                        <Text size="xl" fw={500}>An account activation link will be sent to your email address:</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <TextInput
                            placeholder="Email address"
                            size="lg"
                            disabled
                            classNames={inputClasses}
                            value={user?.email}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Group justify="end">
                            <Button
                                size="lg"
                                radius="md"
                                color="#3C5B4C"
                                fullWidth
                                onClick={() => handleSendEmailButtonClick()}
                            >
                                Send email
                            </Button>
                        </Group>
                    </Grid.Col>
                </Grid>
                
            </Modal>
        </>
    );
}