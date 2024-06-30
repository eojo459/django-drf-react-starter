import { Avatar, Box, Container, Grid, Group, Stack, Tabs, Title, Text, Button, Space, Paper, Badge, SimpleGrid, ActionIcon, Tooltip, TextInput, Select, Alert, rem } from "@mantine/core";
import { IconActivity, IconBriefcase2, IconBuilding, IconBuildingStore, IconCalendar, IconCheck, IconClock, IconDeviceLandlinePhone, IconDeviceMobile, IconDots, IconDotsCircleHorizontal, IconDotsVertical, IconHome, IconInfoCircle, IconMail, IconMapPin, IconPhone, IconReportAnalytics, IconSettings, IconUser, IconUserPlus, IconUsersGroup, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import ActivityTimeline from "./ActivityTimeline";
import { Carousel } from '@mantine/carousel';
import StaffDashboard from "../pages/staff-dashboard/staff-main";
import ClockIn from "../pages/staff-dashboard/ClockIn";
import Timesheet from "../pages/staff-dashboard/timesheet";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import ProfileEditModal from "../pages/staff-dashboard/components/ProfileEditModal";
import TimesheetList from "../pages/staff-dashboard/timesheet-list";
//import classes from '../css/TextInput.module.css';
import { supabase, useSupabase } from "../authentication/SupabaseContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../authentication/SupabaseAuthContext";
import { userRoleData } from "../helpers/SelectData";
import AccordionRegistrationForm from "./AccordionRegistrationForm";
import { PeopleDirectoryTable } from "./PeopleDirectoryTable";
import TimesheetInbox from "../pages/owner-dashboard/TimesheetInbox";
import { ProfileHeader } from "./ProfileHeader";
import { ProfilePanel } from "./ProfilePanel";
import { HomePanel } from "./HomePanel";
import classes from "../css/UserProfile.module.css";
import inputClasses from "../css/TextInput.module.css";
import BusinessManagement, { BusinessWorkingHours } from "../pages/owner-dashboard/business/Business-Management";
import { CarouselNav } from "./CarouselNav";
import { useNavigationContext } from "../context/NavigationContext";
import ReportInbox from "../pages/owner-dashboard/ReportInbox";
import { AppMenu } from "./AppMenu";
import ViewTimesheet from "../pages/staff-dashboard/ViewTimesheet";
import { Attendance } from "../pages/owner-dashboard/child/Attendance";
import ProfileSettings from "./ProfileSettings";
import StaffOnboardingCard from "./StaffOnboardingCard";
import OwnerOnboardingCard from "./OwnerOnboardingCard";
import { Registration } from "../pages/owner-dashboard/Registration";
import ChargebeeCheckoutModal from "./ChargebeeCheckoutModal";
import { GetChargebeeUpdateSubscriptionCheckoutUrl, PostChargebeeNewCheckoutUrl } from "../helpers/Api";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../css/Notifications.module.css";
import { isObjectEmpty } from "../helpers/Helpers";

interface UserProfile {
    isMyProfile?: boolean;
}

// export interface BusinessWorkingHours {
//     id: string;
//     business_id: string;
//     monday_start: string;
//     monday_end: string;
//     tuesday_start: string;
//     tuesday_end: string;
//     wednesday_start: string;
//     wednesday_end: string;
//     thursday_start: string;
//     thursday_end: string;
//     friday_start: string;
//     friday_end: string;
//     saturday_start: string;
//     saturday_end: string;
//     sunday_start: string;
//     sunday_end: string;
// }

export interface UserProfleBusinessInfo {
    id: string;
    name: string;
    owner_uid: string;
    lon: string;
    lat: string;
    gps_geolocation: boolean;
    plan: number;
    working_hours: BusinessWorkingHours;
    auto_clock_out_max_duration: number;
    overtime_max_duration: number;
}

export interface UserProfilePosition {
    id: string;
    label: string, 
    employment_type_id: string, 
    employment_type: string,
    business_id?: string, 
    business_name?: string, 
}

export interface PositionLabel {
    value: string;
    label: string;
}

export interface Payment {
    payment_type: string;
    card_last4: string;
    card_brand: string;
    card_funding_type: string;
    card_expiry_month: string;
    card_expiry_year: string;
    paypal_email: string;
    txn_date: string;
    txn_amount: number;
}

export interface Subscription {
    item_price_id: string;
    activated_at: string;
    expires_at: string;
    currency_code: string;
    current_term_start: string;
    current_term_end: string;
    next_billing_at: string;
    status: string;
}

export interface UserProfileModel {
    uid: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    street: string;
    street_2: string;
    city: string;
    province: string;
    country: string;
    postal_code: string;
    gender: string;
    cell_number: string;
    home_number: string;
    work_number: string;
    date_joined: string;
    role: string;
    active: boolean;
    position: UserProfilePosition;
    business_info: UserProfleBusinessInfo[];
    working_hours: StaffWorkingHours;
    plan?: number;
    location_limit_reached?: boolean;
    subscription: Subscription;
    payment: Payment;
    confirm_email: boolean;
}

export interface StaffWorkingHours {
    id: string;
    business_id: string;
    staff_uid: string;
    monday_start?: string | null;
    monday_break_start_time?: string | null;
    monday_break_end_time?: string | null;
    monday_break_start_time_2?: string | null;
    monday_break_end_time_2?: string | null;
    monday_break_start_time_3?: string | null;
    monday_break_end_time_3?: string | null;
    monday_end?: string | null;
    tuesday_start?: string | null;
    tuesday_break_start_time?: string | null;
    tuesday_break_end_time?: string | null;
    tuesday_break_start_time_2?: string | null;
    tuesday_break_end_time_2?: string | null;
    tuesday_break_start_time_3?: string | null;
    tuesday_break_end_time_3?: string | null;
    tuesday_end?: string | null;
    wednesday_start?: string | null;
    wednesday_break_start_time?: string | null;
    wednesday_break_end_time?: string | null;
    wednesday_break_start_time_2?: string | null;
    wednesday_break_end_time_2?: string | null;
    wednesday_break_start_time_3?: string | null;
    wednesday_break_end_time_3?: string | null;
    wednesday_end?: string | null;
    thursday_start?: string | null;
    thursday_break_start_time?: string | null;
    thursday_break_end_time?: string | null;
    thursday_break_start_time_2?: string | null;
    thursday_break_end_time_2?: string | null;
    thursday_break_start_time_3?: string | null;
    thursday_break_end_time_3?: string | null;
    thursday_end?: string | null;
    friday_start?: string | null;
    friday_break_start_time?: string | null;
    friday_break_end_time?: string | null;
    friday_break_start_time_2?: string | null;
    friday_break_end_time_2?: string | null;
    friday_break_start_time_3?: string | null;
    friday_break_end_time_3?: string | null;
    friday_end?: string | null;
    saturday_start?: string | null;
    saturday_break_start_time?: string | null;
    saturday_break_end_time?: string | null;
    saturday_break_start_time_2?: string | null;
    saturday_break_end_time_2?: string | null;
    saturday_break_start_time_3?: string | null;
    saturday_break_end_time_3?: string | null;
    saturday_end?: string | null;
    sunday_start?: string | null;
    sunday_break_start_time?: string | null;
    sunday_break_end_time?: string | null;
    sunday_break_start_time_2?: string | null;
    sunday_break_end_time_2?: string | null;
    sunday_break_start_time_3?: string | null;
    sunday_break_end_time_3?: string | null;
    sunday_end?: string | null;
    holiday_allowed: boolean;
    overtime_allowed: boolean;
    vacation_allowed: boolean;
    sick_allowed: boolean;
    full_time: boolean;
    salaried: boolean;
    pay_rate?: number | null;
    start_date: string;
    end_date?: string | null;
    onboarding: boolean;
    is_new_user: boolean;
    is_manager: boolean;
    level?: number;
    active: boolean;
}


const pointerCursor = {
    cursor: 'pointer', // Change the cursor to a pointer
};

export default function UserProfile(props: UserProfile) {
    const { user, session } = useAuth();
    const { signOutUser, isNewUser, onboarding } = useSupabase();
    const { 
        active, profilePanelActive, clockInPanelActive, settingsPanelActive, groupsPanelActive,
        timesheetsPanelActive, registrationPanelActive, homePanelActive, managementPanelActive, 
        inboxPanelActive, reportPanelActive, timesheetListPanelActive, homebasePanelActive, attendancePanelActive,
        setProfilePanelActive, setClockInPanelActive, setSettingsPanelActive, 
        setGroupsPanelActive, setRegistrationPanelActive, setHomePanelActive, setManagementPanelActive, 
        setInboxPanelActive, setTimesheetsPanelActive, setReportPanelActive, setTimesheetListPanelActive,
        setActive
    } = useNavigationContext();
    const [showProfileSettings, setShowProfileSettings] = useState(true);
    const [workPhoneVisible, setWorkPhoneVisible] = useState(false);
    const [homePhoneVisible, setHomePhoneVisible] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    //const [timesheetListPanelActive, setTimesheetListPanelActive] = useState(false);
    const [selectedEntityType, setSelectedEntityType] = useState<string | null>(null);
    const [profileModalOpened, { open: openProfileModal, close: closeProfileModal }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const navigate = useNavigate();
    const location = useLocation();

    const [isHomeHovered, setIsHomeHovered] = useState(false);
    const [isRegistrationHovered, setIsRegistrationHovered] = useState(false);
    const [isManagementHovered, setIsManagementHovered] = useState(false);
    const [isInboxHovered, setIsInboxHovered] = useState(false);
    const [isClockInHovered, setIsClockInHovered] = useState(false);
    const [isTimesheetsHovered, setIsTimesheetsHovered] = useState(false);
    const [isGroupsHovered, setIsGroupsHovered] = useState(false);
    const [isSettingsHovered, setIsSettingsHovered] = useState(false);
    const [isProfileHovered, setIsProfileHovered] = useState(false);
    const [isManager, setIsManager] = useState(false);
    //const [onboardingLockdown, setOnboardingLockdown] = useState(user?.working_hours?.onboarding && user?.role === "STAFF");
    const [onboardingLockdown, setOnboardingLockdown] = useState(onboarding && user?.role === "STAFF");
    const [chargebeeCheckoutModalOpened, { open: openChargbeeCheckoutModal, close: closeChargebeeCheckoutModal }] = useDisclosure(false);
    const [hostedUrl, setHostedUrl] = useState('');

    function handleHostedUrlChange(hostedUrl: string) {
        setHostedUrl(hostedUrl);
        openChargbeeCheckoutModal();
    }

    // setup props
    const isMyProfile = props.isMyProfile;

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

    // useEffect(() => {
    //     const queryParams = new URLSearchParams(location.search);
    //     if (queryParams.get('register') === 'business') {
    //         setIsRegistered(true);
    //     }
    // }, [location.search]);

    // run when isMyProfile changes
    useEffect(() => {
        if (isMyProfile) {
            setShowProfileSettings(isMyProfile);
        }
    }, [isMyProfile])

    useEffect(() => {
        console.log(selectedEntityType);
    }, [selectedEntityType])

    useEffect(() => {
        // Get the URL parameters
        // var queryString = window.location.search;
        // var urlParams = new URLSearchParams(queryString);

        // // Get the value of the 'default' parameter
        // var paramValue = urlParams.get('default');
        if (user){
            console.log(user);
            //console.log("new user= " + user?.working_hours?.is_new_user);
            //console.log("onboarding= " + user?.onboarding);
            handleOnboardLockdown();
        }
    },[]);

    useEffect(() => {
        if (!user) return;
        handleOnboardLockdown();
    },[user]);

    function handleFormSubmitted(flag: boolean) {
        if (flag) {
            console.log("Form submitted");
        }
    }

    function updateData(flag: boolean) {
        if (flag) {
            console.log("update data");
        }
    }

    function handleOnboardLockdown() {
        if (!user) return;

        if (isObjectEmpty(user?.working_hours)) {
            setOnboardingLockdown(user?.role === "STAFF");
        }
        else {
            var onboardLockdown = (user?.working_hours?.onboarding || user?.working_hours?.onboarding === undefined) && user?.role === "STAFF";
            setOnboardingLockdown(onboardLockdown);
        }
    }

    function handleTimesheetsPanelChange() {
        setTimesheetsPanelActive(true);
        setProfilePanelActive(false);
        setClockInPanelActive(false);
        setSettingsPanelActive(false);
        setGroupsPanelActive(false);
        setTimesheetListPanelActive(false);
        setRegistrationPanelActive(false);
        setManagementPanelActive(false);
        setInboxPanelActive(false);
        setHomePanelActive(false);
    }

    function handleTimesheetListPanelChange() {
        setTimesheetListPanelActive(true);
        setProfilePanelActive(false);
        setClockInPanelActive(false);
        setSettingsPanelActive(false);
        setGroupsPanelActive(false);
        setTimesheetsPanelActive(false);
        setRegistrationPanelActive(false);
        setManagementPanelActive(false);
        setInboxPanelActive(false);
        setHomePanelActive(false);
    }

    // switch to registration panel and select business entity
    function handleQuickRegisterBusiness() {
        setActive('registration');
        setSelectedEntityType("0");
    }

    // open modal to reactive subscription
    function handleReactivateSubscription() {
        updateSubscription();
    }

    async function updateSubscription() {
        if (!user) return;

        // show notification
        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });

        // create subscription data 
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
            
            // show success
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'Connected to server.',
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
                    message: 'There was an error saving. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
            }, 500);
        }
    }

    // show get started create new business alert
    const ownerOnboardingNotificationAlert = (
        <Alert
            variant="light"
            color="yellow"
            radius="md"
            title="Note"
            icon={<IconInfoCircle />}
            mb="lg"
        >
            <Text
                c="#dcdcdc"
                size="lg"
                style={{ fontFamily: "AK-Medium" }}
            >
                <Button color="#4a8a2a" size="xs" mr="sm" onClick={handleQuickRegisterBusiness}>click here</Button> to get started and setup your first business profile. 
            </Text>
        </Alert>
    );

    // show account is being reviewed alert
    const staffAccountUnderReviewNotificationAlert = (
        <Alert
            variant="light"
            color="yellow"
            radius="md"
            title="Note"
            icon={<IconInfoCircle />}
            mb="lg"
        >
            <Text
                c="#dcdcdc"
                size="lg"
                style={{ fontFamily: "AK-Medium" }}
            >
                Your account is currently being reviewed by your manager. You will have limited access while being under review. 
            </Text>
        </Alert>
    );

    // show subscription cancelled alert
    const subscriptionCancelledNotificationAlert = (
        <Alert
            variant="light"
            color="yellow"
            radius="md"
            title="Note"
            icon={<IconInfoCircle />}
            mb="lg"
        >
            <Text
                c="#dcdcdc"
                size="lg"
                style={{ fontFamily: "AK-Medium" }}
            >
                Your subscription has ended and you have lost access to your upgraded account features.
            </Text>
            <Text
                c="#dcdcdc"
                size="lg"
                style={{ fontFamily: "AK-Medium" }}
            >
                <Button color="#4a8a2a" size="xs" mr="sm" onClick={handleReactivateSubscription}>click here</Button> to reactivate your subscription. 
            </Text>
        </Alert>
    );

    // show subscription non renewing alert
    const subscriptionNonRenewingNotificationAlert = (
        <Alert
            variant="light"
            color="yellow"
            radius="md"
            title="Note"
            icon={<IconInfoCircle />}
            mb="lg"
        >
            <Text
                c="#dcdcdc"
                size="lg"
                style={{ fontFamily: "AK-Medium" }}
            >
                Your subscription will not be renewed at the end of your term. <Button color="#4a8a2a" size="xs" ml="sm" mr="sm" onClick={handleReactivateSubscription}>click here</Button> to reactivate your subscription.
            </Text>
            <Text
                c="#dcdcdc"
                size="lg"
                style={{ fontFamily: "AK-Medium" }}
            >
                You will lose access to your upgraded account features at the end of your term.
            </Text>
        </Alert>
    );

    return (
        <>
            {/* <CarouselNav 
                handleProfilePanelChange={handleProfilePanelChange} 
                handleClockInPanelChange={handleClockInPanelChange} 
                handleSettingsPanelChange={handleSettingsPanelChange} 
                handleInboxPanelChange={handleInboxPanelChange} 
                handleHomePanelChange={handleHomePanelChange} 
                handleRegistrationPanelChange={handleRegistrationPanelChange} 
                handleManagementPanelChange={handleManagementPanelChange} 
                handleTimesheetPanelChange={handleTimesheetsPanelChange} 
                handleGroupPanelChange={handleGroupsPanelChange}
            /> */}
            {chargebeeCheckoutModalOpened && hostedUrl !== "" && (
                <ChargebeeCheckoutModal
                    modalOpened={chargebeeCheckoutModalOpened}
                    isMobile={isMobile !== undefined ? isMobile : false} 
                    closeModal={closeChargebeeCheckoutModal}
                    hostedUrl={hostedUrl}
                />
            )}
            <Container size={isMobile || active === "attendance" ? "100%" : "xl"} c="#dcdcdc">
                <Stack mt="lg">
                    {/* {user != null && user && (
                        <ProfileHeader user={user}/>
                    )} */}

                    {/* notification alerts */}
                    {isNewUser && user?.role === "OWNER" && ownerOnboardingNotificationAlert}
                    {isNewUser && !onboardingLockdown && user?.role === "STAFF" && staffAccountUnderReviewNotificationAlert}
                    {(user?.subscription?.status === "cancelled") && subscriptionCancelledNotificationAlert}
                    {(user?.subscription?.status === "non_renewing") && subscriptionNonRenewingNotificationAlert}

                    {/* staff onboarding panel */}
                    {onboardingLockdown && user?.role === "STAFF" && (
                        <StaffOnboardingCard/>  
                    )}

                    {/* homebase panel */}
                    {homebasePanelActive && !onboardingLockdown && (
                        <AppMenu />
                    )}

                    {/* clock in panel */}
                    {clockInPanelActive && !onboardingLockdown && (
                        <ClockIn handleSubmittedTimesheetClick={handleTimesheetsPanelChange} />
                    )}

                    {/* edit profile panel */}
                    {profileModalOpened && user && !onboardingLockdown && (
                        <ProfileEditModal
                            user={user}
                            modalOpened={profileModalOpened}
                            isMobile={isMobile !== undefined ? isMobile : false}
                            closeModal={closeProfileModal}
                            formSubmitted={handleFormSubmitted}
                            //userProfileData={userProfileData}
                        />
                    )}

                    {/* profile panel */}
                    {profilePanelActive && user != null && !onboardingLockdown && (
                        <ProfilePanel user={user} handleDataChange={updateData} />
                    )}

                    {/* timesheet panel */}
                    {timesheetsPanelActive && !onboardingLockdown && (
                        <Timesheet handleSubmittedTimesheets={handleTimesheetListPanelChange} />
                    )}

                    {/* timesheet list panel (submitted timesheets) */}
                    {timesheetListPanelActive && !onboardingLockdown && (
                        <ViewTimesheet/>
                    )}

                    {/* groups panel */}
                    {groupsPanelActive && !onboardingLockdown && (
                        <Grid>
                            {/* TODO: map grid.cols for each group the user belongs to */}
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#161b26" }}>
                                    <Stack>
                                        <Grid align="center">
                                            <Grid.Col span={{ base: 8 }}>
                                                <Group>
                                                    <Avatar size="lg" style={{ background: "#323c43db" }}>A</Avatar>
                                                    <Text size="lg" fw={800} style={{ color: "white" }}>Astronaut</Text>
                                                </Group>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 4 }}>
                                                <Group justify="flex-end">
                                                    <ActionIcon variant="subtle" color="gray">
                                                        <IconDots />
                                                    </ActionIcon>
                                                </Group>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12 }}>
                                                <Text size="md" fw={400}>We are the astronauts. We will go into outer space and explore the unknown. We will go where no man has ever dared to go.</Text>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 6 }}>
                                                <Tooltip.Group openDelay={300} closeDelay={100}>
                                                    <Avatar.Group spacing="sm">
                                                        <Tooltip label="Salazar Troop" withArrow>
                                                            <Avatar src="image.png" radius="xl" >ST</Avatar>
                                                        </Tooltip>
                                                        <Tooltip label="Bandit Crimes" withArrow>
                                                            <Avatar src="image.png" radius="xl" >BC</Avatar>
                                                        </Tooltip>
                                                        <Tooltip label="Jane Rata" withArrow>
                                                            <Avatar src="image.png" radius="xl" >JR</Avatar>
                                                        </Tooltip>
                                                        <Tooltip
                                                            withArrow
                                                            label={
                                                                <>
                                                                    <div>John Outcast</div>
                                                                    <div>Levi Capitan</div>
                                                                </>
                                                            }
                                                        >
                                                            <Avatar radius="xl">+2</Avatar>
                                                        </Tooltip>
                                                    </Avatar.Group>
                                                </Tooltip.Group>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 6 }}>
                                                <Button
                                                    variant="light"
                                                    color="gray"
                                                    radius="md"
                                                    size="md"
                                                    fullWidth
                                                >
                                                    <Title order={4}>View</Title>
                                                </Button>
                                            </Grid.Col>
                                        </Grid>
                                    </Stack>
                                </Paper>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#161b26" }}>
                                    <Stack>
                                        <Grid align="center">
                                            <Grid.Col span={{ base: 8 }}>
                                                <Group>
                                                    <Avatar size="lg" style={{ background: "#323c43db" }}>C</Avatar>
                                                    <Text size="lg" fw={800} style={{ color: "white" }}>Chef</Text>
                                                </Group>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 4 }}>
                                                <Group justify="flex-end">
                                                    <ActionIcon variant="subtle" color="gray">
                                                        <IconDots />
                                                    </ActionIcon>
                                                </Group>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12 }}>
                                                <Text size="md" fw={400}>Culinary geniuses. Always creates the most delicious dishes with the highest quality.</Text>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 6 }}>
                                                <Tooltip.Group openDelay={300} closeDelay={100}>
                                                    <Avatar.Group spacing="sm">
                                                        <Tooltip label="Salazar Troop" withArrow>
                                                            <Avatar src="image.png" radius="xl" >ST</Avatar>
                                                        </Tooltip>
                                                        <Tooltip label="Bandit Crimes" withArrow>
                                                            <Avatar src="image.png" radius="xl" >BC</Avatar>
                                                        </Tooltip>
                                                        <Tooltip label="Jane Rata" withArrow>
                                                            <Avatar src="image.png" radius="xl" >JR</Avatar>
                                                        </Tooltip>
                                                        <Tooltip
                                                            withArrow
                                                            label={
                                                                <>
                                                                    <div>John Outcast</div>
                                                                </>
                                                            }
                                                        >
                                                            <Avatar radius="xl">+1</Avatar>
                                                        </Tooltip>
                                                    </Avatar.Group>
                                                </Tooltip.Group>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 6 }}>
                                                <Button
                                                    variant="light"
                                                    color="gray"
                                                    radius="md"
                                                    size="md"
                                                    fullWidth
                                                >
                                                    <Title order={4}>View</Title>
                                                </Button>
                                            </Grid.Col>
                                        </Grid>
                                    </Stack>
                                </Paper>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>

                            </Grid.Col>
                        </Grid>
                    )}

                    {/* settings panel */}
                    {settingsPanelActive && !onboardingLockdown && (
                        <ProfileSettings/>
                    )}

                    {/* registration panel */}
                    {registrationPanelActive && !onboardingLockdown && (
                        <Registration/>
                    )}

                    {/* management panel */}
                    {managementPanelActive && !onboardingLockdown && (
                        <BusinessManagement />
                    )}

                    {/* inbox panel */}
                    {inboxPanelActive && !onboardingLockdown && (
                        <TimesheetInbox />
                    )}

                    {/* home panel */}
                    {homePanelActive && !onboardingLockdown && (
                        <HomePanel />
                    )}

                    {/* report panel */}
                    {reportPanelActive && !onboardingLockdown && (
                        <ReportInbox />
                    )}

                    {/* attendance panel */}
                    {attendancePanelActive && !onboardingLockdown && (
                        <Attendance/>
                    )}
                </Stack>
            </Container>
        </>
    );

}