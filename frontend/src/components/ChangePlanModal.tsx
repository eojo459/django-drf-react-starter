import { Accordion, Avatar, Badge, Button, Grid, Group, Loader, Modal, Space, Stack, Table, Text, Title, rem } from '@mantine/core';
import { useEffect, useState } from 'react';
import { CancelChargebeeSubscription, GetUserInfoByUid, PostChargebeeNewCheckoutUrl, getUserById } from '../helpers/Api';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { ProfileHeader } from './ProfileHeader';
import { UserProfileModel } from './UserProfile';
import classes from "../css/UserProfileModal.module.css";
import { GenerateUUID } from '../helpers/Helpers';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import CancelSubscriptionModal from './CancelSubscriptionModal';
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../css/Notifications.module.css";
import { IconCheck, IconX } from '@tabler/icons-react';
import ChargebeeCheckoutModal from './ChargebeeCheckoutModal';
import { useNavigate } from 'react-router-dom';
import { ConfirmSubscriptionChangeDowngradeModal } from './ConfirmModal';
//import { getStatusColor } from '../../../helpers/Helpers';

interface IChangePlanModal {
    modalOpened: boolean;
    isMobile: boolean;
    closeModal: () => void;
    handleOkClick: () => void;
}

export default function ChangePlanModal(props: IChangePlanModal) {
    const { user, session, fetchAuthData } = useAuth(); 
    const [ loading, setLoading ] = useState(false);
    const [cancelSubscriptionModalOpened, { open: openCancelSubscriptionModal, close: closeCancelSubscriptionModal }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [hostedUrl, setHostedUrl] = useState('');
    const [chargebeeCheckoutModalOpened, { open: openChargbeeCheckoutModal, close: closeChargebeeCheckoutModal }] = useDisclosure(false);
    const navigate = useNavigate();

    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const handleOkClickProp = props.handleOkClick;

    // cancel the subscription at the end of the term
    function handleEndOfTermClick() {
        //handleOkClickProp();
        handleCancelSubscription(true);
        closeModalProp();
    }

    // cancel the subscription immediately
    function handleImmediateClick() {
        //handleOkClickProp();
        handleCancelSubscription(false);
        closeModalProp();
    }

    // create the hosted url checkout for chargebee
    function handleHostedUrlChange(hostedUrl: string) {
        setHostedUrl(hostedUrl);
        openChargbeeCheckoutModal();
    }

    async function handleCancelSubscription(type: boolean) {
        if (!user) return;

        var data = {
            'end_of_term': type
        }

        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });

        var result = await CancelChargebeeSubscription(user?.uid, data, session?.access_token);
        if (result === 200) {
            // go through cancellation flow
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'Your subscription has been cancelled',
                    icon: <IconCheck size="lg" style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1000,
                    classNames: notiicationClasses,
                });
                fetchAuthData();
            }, 500);
        }
        else {
            // show error
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error cancelling your subscription. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
            }, 5000);
        }
    }

    // handle when basic plan sign up button is clicked
    async function handleBasicPlanSignup() {
        if (user) {
            if (user?.subscription?.status === "active" && user?.subscription?.item_price_id === "Basic") {
                // we already have an active basic plan
                // show error notification
                notifications.show({
                    color: 'red',
                    title: 'Error',
                    message: "You already have this plan",
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 2500,
                    classNames: notiicationClasses,
                });
                return;
            }
            // if user is authenticated => call endpoint and create checkout url
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            setLoading(true);

            // create subscription customer data 
            var formData = {
                'item_id': 'VerifiedHours_Basic-CAD-Monthly',
                'first_name': user?.first_name,
                'last_name': user?.last_name,
                'email': user?.email,
                'phone': user?.cell_number,
            }

            var response = await PostChargebeeNewCheckoutUrl(formData, session?.access_token);
            if (response?.status === 200) {
                // get hosted page checkout url
                var hostedUrl = response?.data.url;
                console.log(response?.data.id);
                if (hostedUrl) {
                    handleHostedUrlChange(hostedUrl);
                }
                setLoading(false);
                
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Connected to the server.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                
            }
            else {
                // show error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error connecting to the server. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 5000);
            }
        }
        else {
            // else redirect to create account with query param for basic plan
            navigate('/register?plan=basic&isOwner=true');
            setTimeout(() => {
                notifications.show({
                    color: 'teal',
                    //title: '',
                    message: 'Please register for an account next.',
                    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 3000,
                    classNames: notiicationClasses,
                });
            }, 500);
        }
        setLoading(false);
    }

    // handle when pro plan sign up button is clicked
    async function handleProPlanSignup() {
        if (user) {
            if (user?.subscription?.status === "active" && user?.subscription?.item_price_id === "Pro") {
                // we already have an active pro plan
                // show error notification
                notifications.show({
                    color: 'red',
                    title: 'Error',
                    message: "You already have this plan",
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 2500,
                    classNames: notiicationClasses,
                });
                return;
            }
            // if user is authenticated => call endpoint and create checkout url
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            setLoading(true);

            // create subscription customer data 
            var formData = {
                'item_id': 'VerifiedHours_Pro-CAD-Monthly',
                'first_name': user?.first_name,
                'last_name': user?.last_name,
                'email': user?.email,
                'phone': user?.cell_number,
            }

            var response = await PostChargebeeNewCheckoutUrl(formData, session?.access_token);
            if (response?.status === 200) {
                // get hosted page checkout url
                var hostedUrl = response?.data.url;
                console.log(response?.data.id);
                if (hostedUrl) {
                    handleHostedUrlChange(hostedUrl);
                }
                setLoading(false);
                
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Connected to the server.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                
            }
            else {
                // show error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error connecting to the server. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 5000);
            }
        }
        else {
            // else redirect to create account with query param for pro plan
            navigate('/register?plan=pro&isOwner=true');
            setTimeout(() => {
                notifications.show({
                    color: 'teal',
                    //title: '',
                    message: 'Please register for an account next.',
                    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 3000,
                    classNames: notiicationClasses,
                });
            }, 500);
        }
        setLoading(false);
    }

    return (
        <>
            {cancelSubscriptionModalOpened && (
                <CancelSubscriptionModal
                    modalOpened={cancelSubscriptionModalOpened}
                    isMobile={isMobile !== undefined? isMobile : false}
                    closeModal={closeCancelSubscriptionModal}
                    handleEndOfTermClick={handleEndOfTermClick}
                    handleImmediateClick={handleImmediateClick}
                />
            )}

            {chargebeeCheckoutModalOpened && hostedUrl !== "" && (
                <ChargebeeCheckoutModal
                    modalOpened={chargebeeCheckoutModalOpened}
                    isMobile={isMobile !== undefined ? isMobile : false}
                    closeModal={closeChargebeeCheckoutModal}
                    hostedUrl={hostedUrl}
                />
            )}

            <Modal
                title={<Text c="#dcdcdc" size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Change plan</Text>}
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
                    {/* <Grid.Col span={{ base: 12 }}>
                        <Text size="xl" fw={500}>Subscription plan</Text>
                    </Grid.Col> */}
                    <Grid.Col span={{ base: 12 }}>
                        <Accordion variant="separated" defaultValue={user?.subscription?.item_price_id}>
                            <Accordion.Item key={GenerateUUID()} value="Basic" style={{ backgroundColor: "#3c5b4c", borderRadius: "20px", borderColor: "#30493c", borderWidth: "5px" }}>
                                <Accordion.Control
                                    style={{ backgroundColor: "#3c5b4c", borderRadius: "15px" }}
                                >
                                    <Grid align="center">
                                        <Grid.Col span={{ base: 6 }}>
                                            <Text size="xl" fw={600} c="#dcdcdc">Basic plan</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 6 }}>
                                            {user?.subscription?.item_price_id === "Basic" && user?.subscription?.status === "active" && (
                                                <Group justify="end" mr="lg">
                                                    <Text c="#dcdcdc">✅ Current plan</Text>
                                                </Group>
                                            )}
                                        </Grid.Col>
                                    </Grid>
                                </Accordion.Control>
                                <Accordion.Panel 
                                    style={{ backgroundColor: "#25352F", borderBottomRightRadius: "15px", borderBottomLeftRadius: "15px"}}
                                >
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- <b>$39.95</b> /month</Text>
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- Employee time tracking</Text>
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- <b>( 1 )</b> maximum business centre you can manage and have linked to your account</Text>
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- <b>Unlimited</b> employee accounts</Text>
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- Generate reports</Text>
                                    {/* <Space h="sm"/>
                                    <Text c="#dcdcdc">- Generate automatic reports</Text> */}
                                    {/* <Space h="sm"/>
                                    <Text c="#dcdcdc">- Group manager: Create and assign users to groups</Text> */}
                                    {/* <Space h="sm"/>
                                    <Text c="#dcdcdc">- Automatic schedule creator</Text> */}
                                    {/* <Space h="sm"/>
                                    <Text c="#dcdcdc">- Activity task planner</Text> */}
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- GPS geolocation tracking</Text>
                                    <Space h="sm"/> 

                                    {user?.subscription?.item_price_id === "Basic" && user?.subscription?.status === "active" && (
                                        <>
                                            <Grid>
                                                <Grid.Col span={{ base: 12, md: 6 }}>
                                                    <Button
                                                        size="lg"
                                                        radius="md"
                                                        color="#3D5B4C"
                                                        fullWidth
                                                    >
                                                        Current plan
                                                    </Button>
                                                </Grid.Col>
                                                <Grid.Col span={{ base: 12, md: 6 }}>
                                                    <Button
                                                        size="lg"
                                                        radius="md"
                                                        variant="light"
                                                        color="red"
                                                        fullWidth
                                                        onClick={() => {
                                                            openCancelSubscriptionModal();
                                                        }}
                                                    >
                                                        Cancel subscription
                                                    </Button>
                                                </Grid.Col>
                                            </Grid>
                                        </>
                                    )}
                                    
                                    {(user?.subscription?.item_price_id !== "Basic" || user?.subscription?.status !== "active") && (
                                        <Button
                                            size="lg"
                                            radius="md"
                                            color="#3D5B4C"
                                            fullWidth
                                            onClick={async () => {
                                                if (user?.subscription?.item_price_id !== "Basic" || user?.subscription?.status !== "active") {
                                                    // confirm if user wants to downgrade subscription and lose features
                                                    if (user?.subscription?.item_price_id === "Pro" || user?.subscription?.item_price_id === "Enterprise") {
                                                        var confirmSubscriptionChange = await ConfirmSubscriptionChangeDowngradeModal();
                                                        if (!confirmSubscriptionChange) return;
                                                    }
                                                    
                                                    // upgrade to basic
                                                    handleBasicPlanSignup();
                                                }
                                            }}
                                        >
                                            Select plan
                                        </Button>
                                    )}
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item key={GenerateUUID()} value="Pro" style={{ backgroundColor: "#3c5b4c", borderRadius: "20px", borderColor: "#30493c", borderWidth: "5px" }}>
                                <Accordion.Control
                                    style={{ backgroundColor: "#3c5b4c", borderRadius: "15px" }}
                                >
                                    <Grid align="center">
                                        <Grid.Col span={{ base: 6 }}>
                                            <Text size="xl" fw={600} c="#dcdcdc">Pro plan</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 6 }}>
                                            {user?.subscription?.item_price_id === "Pro" && user?.subscription?.status === "active" && (
                                                <Group justify="end" mr="lg">
                                                    <Text c="#dcdcdc">✅ Current plan</Text>
                                                </Group>
                                            )}
                                        </Grid.Col>
                                    </Grid>
                                </Accordion.Control>
                                <Accordion.Panel 
                                    style={{ backgroundColor: "#25352F", borderBottomRightRadius: "15px", borderBottomLeftRadius: "15px"}}
                                >
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- <b>$79.95</b> /month</Text>
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- Employee time tracking</Text>
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- <b>( 3 )</b> maximum business centres you can manage and have linked to your account</Text>
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- <b>Unlimited</b> employee accounts</Text>
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- Generate reports</Text>
                                    {/* <Space h="sm"/>
                                    <Text c="#dcdcdc">- Generate automatic reports</Text> */}
                                    {/* <Space h="sm"/>
                                    <Text c="#dcdcdc">- Group manager: Create and assign users to groups</Text> */}
                                    {/* <Space h="sm"/>
                                    <Text c="#dcdcdc">- Automatic schedule creator</Text> */}
                                    {/* <Space h="sm"/>
                                    <Text c="#dcdcdc">- Activity task planner</Text> */}
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- GPS geolocation tracking</Text>
                                    <Space h="sm"/>

                                    {user?.subscription?.item_price_id === "Pro" && user?.subscription?.status === "active" && (
                                        <>
                                            <Grid>
                                                <Grid.Col span={{ base: 12, md: 6 }}>
                                                    <Button
                                                        size="lg"
                                                        radius="md"
                                                        color="#3D5B4C"
                                                        fullWidth
                                                    >
                                                        Current plan
                                                    </Button>
                                                </Grid.Col>
                                                <Grid.Col span={{ base: 12, md: 6 }}>
                                                    <Button
                                                        size="lg"
                                                        radius="md"
                                                        variant="light"
                                                        color="red"
                                                        fullWidth
                                                        onClick={() => {
                                                            openCancelSubscriptionModal();
                                                        }}
                                                    >
                                                        Cancel subscription
                                                    </Button>
                                                </Grid.Col>
                                            </Grid>
                                        </>
                                    )}

                                    {(user?.subscription?.item_price_id !== "Pro" || user?.subscription?.status !== "active") && (
                                        <Button
                                            size="lg"
                                            radius="md"
                                            color="#3D5B4C"
                                            fullWidth
                                            onClick={async () => {
                                                if (user?.subscription?.item_price_id !== "Pro" || user?.subscription?.status !== "active") {
                                                    // confirm if user wants to downgrade subscription and lose features
                                                    if (user?.subscription?.item_price_id === "Enterprise") {
                                                        var confirmSubscriptionChange = await ConfirmSubscriptionChangeDowngradeModal();
                                                        if (!confirmSubscriptionChange) return;
                                                    }
                                                    
                                                    // upgrade to pro
                                                    handleProPlanSignup();
                                                }
                                            }}
                                        >
                                            Select plan
                                        </Button>
                                    )}
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item key={GenerateUUID()} value="Enterprise" style={{ backgroundColor: "#3c5b4c", borderRadius: "20px", borderColor: "#30493c", borderWidth: "5px" }}>
                                <Accordion.Control
                                    style={{ backgroundColor: "#3c5b4c", borderRadius: "15px" }}
                                >
                                    <Grid align="center">
                                        <Grid.Col span={{ base: 6 }}>
                                            <Text size="xl" fw={600} c="#dcdcdc">Enterprise plan</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 6 }}>
                                            {user?.subscription?.item_price_id === "Enterprise" && user?.subscription?.status === "active" && (
                                                <Group justify="end" mr="lg">
                                                    <Text c="#dcdcdc">✅ Current plan</Text>
                                                </Group>
                                            )}
                                        </Grid.Col>
                                    </Grid>
                                </Accordion.Control>
                                <Accordion.Panel 
                                    style={{ backgroundColor: "#25352F", borderBottomRightRadius: "15px", borderBottomLeftRadius: "15px"}}
                                >
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- <b>$$ Contact us</b></Text>
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- Employee time tracking</Text>
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- <b>Unlimited</b> maximum business centres you can manage and have linked to your account</Text>
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- <b>Unlimited</b> employee accounts</Text>
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- Generate reports</Text>
                                    {/* <Space h="sm"/>
                                    <Text c="#dcdcdc">- Generate automatic reports</Text> */}
                                    {/* <Space h="sm"/>
                                    <Text c="#dcdcdc">- Group manager: Create and assign users to groups</Text> */}
                                    {/* <Space h="sm"/>
                                    <Text c="#dcdcdc">- Automatic schedule creator</Text> */}
                                    {/* <Space h="sm"/>
                                    <Text c="#dcdcdc">- Activity task planner</Text> */}
                                    <Space h="sm"/>
                                    <Text c="#dcdcdc">- GPS geolocation tracking</Text>
                                    <Space h="sm"/>

                                    {user?.subscription?.item_price_id === "Enterprise" && user?.subscription?.status === "active" && (
                                        <>
                                            <Grid>
                                                <Grid.Col span={{ base: 12, md: 6 }}>
                                                    <Button
                                                        size="lg"
                                                        radius="md"
                                                        color="#3D5B4C"
                                                        fullWidth
                                                    >
                                                        Current plan
                                                    </Button>
                                                </Grid.Col>
                                                <Grid.Col span={{ base: 12, md: 6 }}>
                                                    <Button
                                                        size="lg"
                                                        radius="md"
                                                        variant="light"
                                                        color="red"
                                                        fullWidth
                                                        onClick={() => {
                                                            openCancelSubscriptionModal();
                                                        }}
                                                    >
                                                        Cancel subscription
                                                    </Button>
                                                </Grid.Col>
                                            </Grid>
                                        </>
                                    )}

                                    {(user?.subscription?.item_price_id !== "Enterprise" || user?.subscription?.status !== "active") && (
                                        <Button
                                            size="lg"
                                            radius="md"
                                            color="#3D5B4C"
                                            fullWidth
                                            onClick={() => {
                                                if (user?.subscription?.item_price_id !== "Enterprise" || user?.subscription?.status !== "active") {
                                                    // TODO: send contact email
                                                }
                                            }}
                                        >
                                            Select plan
                                        </Button>
                                    )}
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <Text ta="center" size="xl" fw={500} c="#dcdcdc">Questions? Please contact our support at support@verifiedhours.com</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Group justify="end">
                            <Button
                                size="lg"
                                radius="md"
                                color="#3C5B4C"
                                fullWidth
                                onClick={() => closeModalProp()}
                            >
                                Close
                            </Button>
                        </Group>
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