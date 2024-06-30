import { Autocomplete, Button, Container, Grid, Group, Paper, Stack, Tabs, Title, Text, rem, Indicator, Select } from "@mantine/core";
import { useEffect, useState } from "react";
import StaffSubmittedTimesheets from "./components/StaffSubmittedTimesheets";
import UnsubmittedTimesheets from "./components/UnsubmittedTimesheets";
import PendingChangesTimesheets from "./components/PendingChangesTimesheets";
import ArchivedTimesheets from "./components/ArchivedTimesheets";
import { DatePickerInput, getStartOfWeek } from "@mantine/dates";
import { businessListFormat, isInWeekRange } from "../../helpers/Helpers";
import dayjs, { Dayjs } from "dayjs";
import React from "react";
import SubmittedTimesheets from "./components/SubmittedTimesheets";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import classes from "../../css/TextInput.module.css";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import { DeleteUserByUid, GetArchivedStaffTimesheetData, GetBusinessById, GetNotSubmittedStaffTimesheetData, GetStaffNotificationMessages, GetSubmittedStaffTimesheetData, PostApproveTimesheet, PostDenyTimesheet } from "../../helpers/Api";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../../css/Notifications.module.css";
import { IconCheck, IconX } from "@tabler/icons-react";
import ApproveTimesheetConfirmModal from "./components/ApproveTimesheetConfirmModal";
import DenyTimesheetConfirmModal from "./components/DenyTimesheetConfirmModal";
import { ArchivedStaffTimesheetData } from "../staff-dashboard/timesheet";
import NotificationMessages from "./components/NotificationMessages";
import { useNavigationContext } from "../../context/NavigationContext";
import { BusinessProfile } from "./business/components/CentreInformation";

export interface StaffSubmittedTimesheetsData {
    timesheet_id: string;
    uid: string;
    first_name: string;
    last_name: string;
    manager_uid: string;
    manager_name: string;
    total: number;
    pay: number;
    pdf_file: string;
}

export interface NotSubmittedStaffTimesheetsData {
    uid: string;
    first_name: string;
    last_name: string;
    total: number;
    pay: number;
}

export interface NotSubmittedUserTimesheetsData {
    uid: string;
    first_name: string;
    last_name: string;
    total: number;
    fees: number;
}

export interface NotSubmittedData {
    not_submitted_staff_list: NotSubmittedStaffTimesheetsData[],
    not_submitted_user_list: NotSubmittedUserTimesheetsData[],
}

// export interface ArchivedStaffTimesheetData {
//     timesheet_id: string;
//     uid: string;
//     first_name: string;
//     last_name: string;
//     manager_uid: string;
//     manager_name: string;
//     total: number;
//     pay: number;
//     pdf_file: string;
// }

export interface ArchivedUserTimesheetData {
    timesheet_id: string;
    uid: string;
    name: string;
    total: number;
    fees: number;
    pdf_file: string;
}

export interface ArchivedTimesheetData {
    archived_staff_list: ArchivedStaffTimesheetData[],
    archived_user_list: ArchivedUserTimesheetData[],
}

export interface NotificationMessageData {
    id: string;
    to_uid: string;
    from_uid: string;
    message: string;
    message_type: number;
    first_name: string;
    last_name: string;
}

export default function TimesheetInbox() {
    const { user, business, businessList, session, setBusiness } = useAuth();
    const { notificationMessages, getNotifications } = useNavigationContext();
    const [submittedData, setSubmittedData] = useState(true);
    const [notSubmittedData, setNotSubmittedData] = useState(true);
    const [archiveData, setArchiveData] = useState(true);
    const [pendingChangesData, setPendingChangesData] = useState(false);
    const [notificationsData, setNotificationsData] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [tabWidth, setTabWidth] = useState('');
    const [weekValue, setWeekValue] = useState<Date | null>(null);
    const [hovered, setHovered] = useState<Date | null>(null);
    const [selectedWeekStartDate, setSelectedWeekStartDate] = React.useState<Dayjs | null>(null);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [submittedStaffTimesheetData, setSubmittedStaffTimesheetData] = useState<StaffSubmittedTimesheetsData[]>([]);
    const [approveTimesheetModalOpened, { open: openApproveTimesheetModal, close: closeApproveTimesheetModal }] = useDisclosure(false);
    const [denyTimesheetModalOpened, { open: openDenyTimesheetModal, close: closeDenyTimesheetModal }] = useDisclosure(false);
    const [selectedTimesheetId, setSelectedTimesheetId] = useState('');
    const [notSubmittedStaffTimesheetData, setNotSubmittedStaffTimesheetData] = useState<NotSubmittedStaffTimesheetsData[]>([]);
    const [notSubmittedUserTimesheetData, setNotSubmittedUserTimesheetData] = useState<NotSubmittedUserTimesheetsData[]>([]);
    const [archivedStaffTimesheetData, setArchivedStaffTimesheetData] = useState<ArchivedStaffTimesheetData[]>([]);
    const [archivedUserTimesheetData, setArchivedUserTimesheetData] = useState<ArchivedUserTimesheetData[]>([]);
    const [notificationData, setNotificationData] = useState<NotificationMessageData[]>([]);
    const [businessData, setBusinessData] = useState<BusinessProfile>();
    const [businessSelectData, setBusinessSelectData] = useState<any[]>([]);

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

    // fetch data on component load
    useEffect(() => {
        fetchData();
    },[]);

    // run when business changes
    useEffect(() => {
        fetchData();
    },[business]);

    useEffect(() => {
        if (windowWidth < 800) {
            setTabWidth("100%");
        }
        else {
            setTabWidth("300px")
        }
    }, [windowWidth]);

    function handleWeekChange(startDate: Dayjs) {
        console.log("Parent received updated start date:", startDate);
        setSelectedWeekStartDate(startDate);
    }

    async function fetchData() { 
        if (user && business) {

            // get business select data
            handleBusinessListFormat();

            // get business information data for the current selected business
            var businessData = await GetBusinessById(business?.id, session?.access_token);
            if (businessData) {
                setBusinessData(businessData);
                console.log(businessData);
            }

            // get submitted staff timesheet data
            var submittedStaffTimesheetData = await GetSubmittedStaffTimesheetData(business?.id, session?.access_token);
            setSubmittedStaffTimesheetData(submittedStaffTimesheetData);
            console.log(submittedStaffTimesheetData);
            
            // TODO: get submitted user timesheet data

            // get not submitted staff & user timesheet data
            var notSubmittedData = await GetNotSubmittedStaffTimesheetData(business?.id, session?.access_token);
            setNotSubmittedStaffTimesheetData(notSubmittedData?.not_submitted_staff_list);
            setNotSubmittedUserTimesheetData(notSubmittedData?.not_submitted_user_list);

            // TODO: get staff timesheets with pending changes
            // TODO: get user timesheets with pending changes

            // get staff & user archived timesheets
            var archivedTimesheetData = await GetArchivedStaffTimesheetData(business?.id, session?.access_token);
            setArchivedStaffTimesheetData(archivedTimesheetData?.archived_staff_list);
            setArchivedUserTimesheetData(archivedTimesheetData?.archived_user_list);

            // get notification messages
            var notificationMessageData = await GetStaffNotificationMessages(user?.uid, session?.access_token);
            setNotificationData(notificationMessageData);
        }
    }

    // handle when approve button is clicked
    async function handleApproveTimesheet(timesheetId: string) {
        if (user && business) {
            // approve timesheet by id
            //console.log("approve timesheet=" + timesheetId);

            //var timesheetIdList = [];
            var data = {
                'ids': timesheetId,
                'uid': user?.uid,
            }
            //timesheetIdList.push(data);

            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            var response = await PostApproveTimesheet(business?.id, data, session?.access_token);
            if (response === 200) {
                // success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Timesheet was approved',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                fetchData();
            }
            else {
                // error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error approving the timesheet. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
        } 
    }

    // handle when approve all button is clicked
    function handleApproveAllButtonClicked(timesheetIds: string[]) {
        // TODO: approve all timesheets by id
        timesheetIds.forEach(Id => {
            console.log("approve timesheet="+Id);
        });
    }

    // handle when deny button is clicked
    async function handleDenyTimesheet(timesheetId: string, denyReason: string) {
        if (user && business) {
            // deny timesheet by id
            //console.log("deny timesheet=" + timesheetId);

            var data = {
                'id': timesheetId,
                'uid': user?.uid,
                'reason': denyReason,
            }

            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            var response = await PostDenyTimesheet(business?.id, data, session?.access_token);
            if (response === 200) {
                // success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Timesheet was denied',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                fetchData();
            }
            else {
                // error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error denying the timesheet. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
        } 
    }

    // open modal when approve button is clicked
    function handleApproveButtonClicked(timesheetId: string) {
        if (timesheetId.length > 0) {
            setSelectedTimesheetId(timesheetId);
            openApproveTimesheetModal();
        }
    }
    
    // open modal when deny button is clicked
    function handleDenyButtonClicked(timesheetId: string) {
        if (timesheetId.length > 0) {
            setSelectedTimesheetId(timesheetId);
            openDenyTimesheetModal();
        }
    }

    function handleRefreshData() {
        // refresh data when user is approved
        fetchData();
        getNotifications();
    }

    // handle business select change
    function handleSelectChange(value: string | null) {
        if (!user) return;
        
        user?.business_info.forEach((business: any) => {
            if (business.id === value) {
                setBusiness(business);
                localStorage.setItem("activeBusiness", JSON.stringify(business));
            }
        });
    }

    // format business data for select dropdown
    function handleBusinessListFormat() {
        setBusinessSelectData(businessListFormat(businessList));
    }

    // business select
    const businessSelect = (
        <Paper shadow="md" p="lg" mb="lg" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
            <Stack>
                {business && (
                    <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{business?.name}</Text>
                )}
                {!business && (
                    <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Business centre</Text>
                )}

                {/* <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Business centre select</Text> */}
                {businessList?.length > 1 && (
                    <Select
                        id="business"
                        placeholder="Select a business to switch to"
                        size="lg"
                        data={businessSelectData}
                        classNames={classes}
                        onChange={(value) => handleSelectChange(value)}
                    >
                    </Select>
                )}
            </Stack>
        </Paper>
    );

    return (
        <>
            {approveTimesheetModalOpened && (
                <ApproveTimesheetConfirmModal 
                    modalOpened={approveTimesheetModalOpened}
                    isMobile={isMobile!= undefined? isMobile : false}
                    timesheetId={selectedTimesheetId}
                    closeModal={closeApproveTimesheetModal}
                    handleApproveClick={handleApproveTimesheet}
                />
            )}

            {denyTimesheetModalOpened && (
                <DenyTimesheetConfirmModal
                    modalOpened={denyTimesheetModalOpened}
                    isMobile={isMobile != undefined ? isMobile : false}
                    timesheetId={selectedTimesheetId}
                    closeModal={closeDenyTimesheetModal}
                    handleDenyClick={handleDenyTimesheet}
                />
            )}

            {/* <Container fluid> */}
                <Tabs variant="pills" radius="md" color="rgba(24,28,38,0.5)" defaultValue="submitted" orientation={windowWidth < 800 ? "horizontal" : "vertical"}>
                    <Tabs.List grow mr={isMobile ? "" : "md"}>
                        <Paper shadow="md" p="lg" mb="lg" radius="lg" style={{ background: "#25352F", width: "100%", color: "#dcdcdc" }}>
                            <Stack gap="xs">
                                <Tabs.Tab p="md" style={{ width: "100%" }} value="submitted" classNames={classes}>
                                    <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Submitted timesheets</Text>
                                </Tabs.Tab>
                                <Tabs.Tab p="md" style={{ width: "100%" }} value="unsubmitted" classNames={classes}>
                                     <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Not submitted timesheets</Text>
                                </Tabs.Tab>
                                {/* <Tabs.Tab p="md" style={{ width: "100%" }} value="pending" classNames={classes}>
                                     <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pending changes</Text>
                                </Tabs.Tab> */}
                                <Tabs.Tab p="md" style={{ width: "100%" }} value="archive" classNames={classes}>
                                     <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Archived timesheets</Text>
                                </Tabs.Tab>
                                <Indicator disabled={notificationData?.length > 0 ? false : true} color="red" size={18} offset={8}>
                                    <Tabs.Tab p="md" style={{ width: "100%" }} value="notifications" classNames={classes}>
                                        <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Notifications</Text>
                                    </Tabs.Tab>
                                </Indicator>
                            </Stack>
                        </Paper>
                    </Tabs.List>

                    {/* TODO: map each day to its own panel */}
                    <Tabs.Panel value="submitted">
                        
                        {/* business select */}
                        {businessSelect}

                        {submittedStaffTimesheetData && (
                            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", maxWidth: "1200px", color: "#dcdcdc" }}>
                                <Group justify="space-between">
                                    <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Submitted timesheets</Text>
                                    
                                    {submittedStaffTimesheetData?.length > 0 && (
                                        <Button 
                                            size="md" 
                                            radius="md" 
                                            color="#316F22" 
                                            onClick={() => handleApproveAllButtonClicked([])}
                                        >
                                            Approve all
                                        </Button>
                                    )}
                                </Group>
                                <SubmittedTimesheets 
                                    staffSubmittedTimesheets={submittedStaffTimesheetData}
                                    handleApproveButtonClicked={handleApproveButtonClicked}
                                    handleDenyButtonClicked={handleDenyButtonClicked}
                                /> 
                            </Paper>
                        )}
                    </Tabs.Panel>

                    <Tabs.Panel value="unsubmitted">
                        {/* business select */}
                        {businessSelect}

                        {notSubmittedData && (
                            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", maxWidth: "1200px", color: "white" }}>
                                <Stack>
                                    <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }} mb="lg">Not submitted timesheets</Text>
                                    <UnsubmittedTimesheets 
                                        notSubmittedStaffTimesheets={notSubmittedStaffTimesheetData}
                                        notSubmittedUserTimesheets={notSubmittedUserTimesheetData}
                                    />
                                </Stack>
                            </Paper>
                        )}
                    </Tabs.Panel>

                    <Tabs.Panel value="archive">
                        {/* business select */}
                        {businessSelect}

                        {archiveData && (
                            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", maxWidth: "1200px", color: "white" }}>
                                <Stack>
                                    <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Archived timesheets</Text>
                                    {/* TODO: finish up querying/sorting */}
                                    {/* <Grid align="end">
                                        <Grid.Col span={{ base: 12, sm: 3 }}>
                                            <DatePickerInput
                                                withCellSpacing={false}
                                                maxDate={new Date()}
                                                size="lg"
                                                id="week-picker"
                                                label="Week of"
                                                placeholder="Select a week"
                                                value={weekValue}
                                                radius="md"
                                                style={{width:"100%", marginTop:"10px"}}
                                                classNames={classes}
                                                getDayProps={(date) => {
                                                    const isHovered = isInWeekRange(date, hovered);
                                                    const isSelected = isInWeekRange(date, weekValue);
                                                    const isInRange = isHovered || isSelected;
                                                    return {
                                                        onMouseEnter: () => setHovered(date),
                                                        onMouseLeave: () => setHovered(null),
                                                        inRange: isInRange,
                                                        firstInRange: isInRange && date.getDay() === 1,
                                                        lastInRange: isInRange && date.getDay() === 0,
                                                        selected: isSelected,
                                                        onClick: () => {
                                                            setWeekValue(getStartOfWeek(date));
                                                            handleWeekChange(dayjs(getStartOfWeek(date)));
                                                        },
                                                    };
                                                }}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, sm: 3}}>
                                            <Autocomplete
                                                label="Filter by person"
                                                placeholder="Pick a person"
                                                size="lg"
                                                radius="md"
                                                classNames={classes}
                                                data={['React', 'Angular', 'Vue', 'Svelte']}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{base: 12, sm: 3}}>
                                            <Autocomplete
                                                label="Filter by manager"
                                                placeholder="Pick a manager"
                                                size="lg"
                                                radius="md"
                                                classNames={classes}
                                                data={['React', 'Angular', 'Vue', 'Svelte']}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{base:12, sm:3}}>
                                            <Group>
                                                <Button
                                                    size="lg"
                                                    radius="md"
                                                    color="#316F22"
                                                >
                                                    Search
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    radius="md"
                                                    color="#354E40"
                                                >
                                                    Clear
                                                </Button>
                                            </Group>
                                        </Grid.Col>
                                    </Grid> */}
                                    
                                    <ArchivedTimesheets archivedStaffTimesheetData={archivedStaffTimesheetData}/>
                                    
                                </Stack>
                            </Paper>
                        )}
                    </Tabs.Panel>

                    <Tabs.Panel value="pending">
                        {/* business select */}
                        {businessSelect}

                        {pendingChangesData && (
                            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", maxWidth: "1200px", color: "white" }}>
                                <Group justify="space-between">
                                    <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }} mb="lg">Timesheets with pending changes</Text>
                                    <Button color="#316F22" size="md" radius="md">
                                        <Title order={4}>Approve all</Title>
                                    </Button>
                                </Group>
                                <PendingChangesTimesheets/>
                            </Paper>
                        )}
                    </Tabs.Panel>

                    <Tabs.Panel value="notifications">
                        {/* business select */}
                        {businessSelect}

                        {notificationsData && (
                            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", maxWidth: "1200px", color: "white" }}>
                                <Stack>
                                    <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }} mb="lg">Notifications</Text>
                                    <NotificationMessages 
                                        notificationMessageData={notificationData} 
                                        refreshData={handleRefreshData}
                                    />
                                </Stack>
                            </Paper>
                        )}
                    </Tabs.Panel>
                </Tabs>
            {/* </Container> */}


        </>
    );
}