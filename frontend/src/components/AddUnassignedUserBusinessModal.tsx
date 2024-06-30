import { Avatar, Badge, Button, Grid, Group, Loader, Modal, Select, Stack, Table, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { GetUserInfoByUid, getUserById } from '../helpers/Api';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { ProfileHeader } from './ProfileHeader';
import { UserProfileModel } from './UserProfile';
import { ProfilePanel } from './ProfilePanel';
import classes from "../css/UserProfileModal.module.css";
import inputClasses from "../css/TextInput.module.css";
import { MyBusinessData } from '../pages/owner-dashboard/business/Business-Management';
//import { getStatusColor } from '../../../helpers/Helpers';

interface AddUnassignedUserBusinessModal {
    modalOpened: boolean;
    isMobile: boolean;
    myBusinessData: MyBusinessData[] | undefined;
    closeModal: () => void;
    handleAddClick: (businessId: string) => void;
}

export default function AddUnassignedUserBusinessModal(props: AddUnassignedUserBusinessModal) {
    const { user, session } = useAuth(); 
    const [ userData, setUserData ] = useState<UserProfileModel | null>(null);
    const [ loading, setLoading ] = useState(false);
    const [myBusinessData, setMyBusinessData] = useState<MyBusinessData[]>([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>('');
    
    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const myBusinessDataProp = props.myBusinessData;
    const handleAddClickProp = props.handleAddClick;

    // send data back to parent when button is clicked
    function handleAddButtonClick() {
        if (selectedBusinessId) {
            handleAddClickProp(selectedBusinessId); 
        }
        closeModalProp();
    }

    // update state when my business data changes
    useEffect(() => {
        if (myBusinessDataProp) {
            setMyBusinessData(myBusinessDataProp);
        }
    },[myBusinessDataProp]);

    return (
        <>
            <Modal
                title={<Text c="#dcdcdc" size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Assign user</Text>}
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
                        <Text size="xl" fw={500}>Which centre would you like to assign this person to?</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Stack>
                            {/* <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Business centre select</Text> */}
                            <Select
                                id="business"
                                value={selectedBusinessId}
                                onChange={setSelectedBusinessId}
                                placeholder="Please select one"
                                size="lg"
                                data={myBusinessData}
                                classNames={inputClasses}
                                //{...form.getInputProps('business_type')}
                            >
                            </Select>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }} mt="lg">
                        <Group justify="end">
                            <Button
                                size="lg"
                                radius="md"
                                color="#2F7025"
                                fullWidth
                                onClick={() => handleAddButtonClick()}
                            >
                                Confirm
                            </Button>
                        </Group>
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
                </Grid>
                
            </Modal>
        </>
    );
}