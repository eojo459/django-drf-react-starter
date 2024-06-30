import { Avatar, Badge, Button, Grid, Group, Loader, Modal, Stack, Table, Text, Title, rem } from '@mantine/core';
import { useEffect, useState } from 'react';
import { GetChargebeeUpdatePaymentMethodCheckoutUrl, GetUserInfoByUid, getUserById } from '../helpers/Api';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { ProfileHeader } from './ProfileHeader';
import { UserProfileModel } from './UserProfile';
import classes from "../css/UserProfileModal.module.css";
//import { getStatusColor } from '../../../helpers/Helpers';
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../css/Notifications.module.css";
import { IconCheck, IconX } from '@tabler/icons-react';

interface IManagePaymentModal {
    modalOpened: boolean;
    isMobile: boolean;
    hostedUrl: string;
    closeModal: () => void;
    handleOkClick: () => void;
}

export default function ManagePaymentModal(props: IManagePaymentModal) {
    const { user, session } = useAuth(); 
    const [ loading, setLoading ] = useState(false);
    
    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const handleOkClickProp = props.handleOkClick;
    const hostedUrlProp = props.hostedUrl;

    function handleOkButtonClick() {
        handleOkClickProp();
        closeModalProp();
    }

    return (
        <>
            <Modal
                title={<Text c="#dcdcdc" size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Manage payment</Text>}
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
                        <Text size="xl" fw={500}>Please follow the instructions</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <iframe
                            className='iframe-chargebee'
                            src={hostedUrlProp}
                            title="Chargebee Checkout"
                            width="100%"
                            height={600}
                        ></iframe>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Group justify="end">
                            <Button
                                size="lg"
                                radius="md"
                                color="#3C5B4C"
                                fullWidth
                                onClick={() => handleOkButtonClick()}
                            >
                                Ok
                            </Button>
                        </Group>
                    </Grid.Col>
                </Grid>
                
            </Modal>
        </>
    );
}