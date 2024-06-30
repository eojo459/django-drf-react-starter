import { ActionIcon, Grid, Paper, Stack, Table, Title, Text, Group, Avatar, Button } from "@mantine/core";
import { IconBellRinging, IconChevronRight, IconEye } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { NotificationMessageData } from "../TimesheetInbox";
import { UserProfileModel } from "../../../components/UserProfile";
import ReviewNewUserModal from "../../../components/ReviewNewUserModal";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { getUserById } from "../../../helpers/Api";
import { useAuth } from "../../../authentication/SupabaseAuthContext";

export interface INotificationMessages {
    notificationMessageData: NotificationMessageData[];
    refreshData: () => void;
}

export default function NotificationMessages(props: INotificationMessages) {
    const { user, session } = useAuth();
    const [unsubmittedData, setUnsubmittedData] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [userData, setUserData] = useState<UserProfileModel>();
    const [reviewUserModalOpened, { open: openReviewUserModal, close: closeReviewUserModal }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [selectedNotificationId, setSelectedNotificationId] = useState('');

    // props
    const notificationMessagesDataProp = props.notificationMessageData;
    const refreshDataProp = props.refreshData;

    // run on component load
    useEffect(() => {

        // Update windowWidth when the window is resized
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    function handleFormSubmitted() {
        console.log("submit the form");
    }

    async function handleGetUserToReview(userUid: string, notificationId: string) {
        // get user data from uid
        var userData = await getUserById(userUid, session?.access_token);
        setUserData(userData);
        setSelectedNotificationId(notificationId);
        openReviewUserModal();
    }

    const notificationRows = notificationMessagesDataProp?.map((message) => (
        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#354E40", color: "#dcdcdc" }}>
            <Grid align="center" c="#dcdcdc">
                {windowWidth < 1000 && (
                    <>
                        <Grid.Col span={{ base: 3 }}>
                            <Group>
                                <Avatar size="50px" color="#dcdcdc" radius="xl">{message.first_name.charAt(0) + message.last_name.charAt(0)}</Avatar>
                            </Group>
                        </Grid.Col>
                        <Grid.Col span={{ base: 7 }}>
                            {/* <Text fw={600}>{message.first_name + " " + message.last_name}</Text> */}
                            <Text fw={600}>{message.message}</Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 2 }}>
                            <ActionIcon 
                                size="lg"
                                variant="subtle"
                                color="#336E1E"
                                onClick={() => handleGetUserToReview(message.from_uid, message.id)}
                            >
                                <IconEye size={24}/>
                            </ActionIcon>
                        </Grid.Col>
                    </>
                )}

                {windowWidth > 1000 && (
                    <>
                        <Grid.Col span={{ base: 1 }}>
                            <Group>
                                <Avatar size="50px" color="#dcdcdc" radius="xl">{message.first_name.charAt(0) + message.last_name.charAt(0)}</Avatar>
                            </Group>
                        </Grid.Col>
                        <Grid.Col span={{ base: 9 }}>
                            <Stack>
                                {/* <Text fw={600}>{message.first_name + " " + message.last_name}</Text> */}
                                <Text fw={600} c="#dcdcdc">{message.message}</Text>
                            </Stack>
                            
                        </Grid.Col>
                        <Grid.Col span={{ base: 2 }}>
                            <Button 
                                color="#336E1E"
                                radius="md"
                                onClick={() => handleGetUserToReview(message.from_uid, message.id)}
                                rightSection={<IconChevronRight size={18}/>}
                            >
                                Review
                            </Button>
                        </Grid.Col>
                    </>
                )}
            </Grid>
            
        </Paper>
    ));

    return (
        <>
            {reviewUserModalOpened && userData && (
                <ReviewNewUserModal 
                    user={userData}
                    notificationId={selectedNotificationId}
                    modalOpened={reviewUserModalOpened} 
                    isMobile={isMobile !== undefined ? isMobile : false} 
                    closeModal={closeReviewUserModal} 
                    refreshData={refreshDataProp}
                    //userProfileData={userProfileData}
                />
            )}
            {notificationMessagesDataProp?.length > 0 && (
                <Stack>
                    {notificationRows}
                </Stack>
            )}

            {notificationMessagesDataProp?.length < 1 && (
                <Text fw={500} ta="center" mt="lg">Nothing found</Text>
            )}
            
        </>
    );
}