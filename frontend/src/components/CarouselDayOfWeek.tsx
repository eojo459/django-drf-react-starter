import { Carousel } from "@mantine/carousel";
import { Group, Paper, Stack, Title, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconHome, IconUserPlus, IconUsersGroup, IconMail, IconClock, IconReportAnalytics, IconUser, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { useAuth } from "../authentication/SupabaseAuthContext";
import { getDayOfWeek, getFormattedDate } from "../helpers/Helpers";
import { StaffAttendanceRecord } from "../pages/owner-dashboard/child/Attendance";

interface ICarouselDayofWeek {
    sundayVisible: boolean;
    saturdayVisible: boolean;
    activePanel: string;
    attendanceRecordData: StaffAttendanceRecord[];
    handlePanelChanges: (panel: string) => void;
}

const pointerCursor = {
    cursor: 'pointer', // Change the cursor to a pointer
};

export function CarouselDayOfWeek(props: ICarouselDayofWeek) {
    const { user, session } = useAuth();
    const [showProfileSettings, setShowProfileSettings] = useState(true);
    const [profilePanelActive, setProfilePanelActive] = useState(false);
    const [clockInPanelActive, setClockInPanelActive] = useState(user?.role == "STAFF" ? true : false);
    const [settingsPanelActive, setSettingsPanelActive] = useState(false);
    const [groupsPanelActive, setGroupsPanelActive] = useState(false);
    const [timesheetsPanelActive, setTimesheetsPanelActive] = useState(false);
    const [timesheetListPanelActive, setTimesheetListPanelActive] = useState(false);
    const [registrationPanelActive, setRegistrationPanelActive] = useState(false);
    const [homePanelActive, setHomePanelActive] = useState(user?.role == "OWNER" ? true : false);
    const [managementPanelActive, setManagementPanelActive] = useState(false);
    const [inboxPanelActive, setInboxPanelActive] = useState(false);

    const [isHomeHovered, setIsHomeHovered] = useState(false);
    const [isRegistrationHovered, setIsRegistrationHovered] = useState(false);
    const [isManagementHovered, setIsManagementHovered] = useState(false);
    const [isInboxHovered, setIsInboxHovered] = useState(false);
    const [isClockInHovered, setIsClockInHovered] = useState(false);
    const [isTimesheetsHovered, setIsTimesheetsHovered] = useState(false);
    const [isGroupsHovered, setIsGroupsHovered] = useState(false);
    const [isSettingsHovered, setIsSettingsHovered] = useState(false);
    const [isProfileHovered, setIsProfileHovered] = useState(false);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [saturdayVisible, setSaturdayVisible] = useState(false);
    const [sundayVisible, setSundayVisible] = useState(false);
    const [mondayHovered, setMondayHovered] = useState(false);
    const [tuesdayHovered, setTuesdayHovered] = useState(false);
    const [wednesdayHovered, setWednesdayHovered] = useState(false);
    const [thursdayHovered, setThursdayHovered] = useState(false);
    const [fridayHovered, setFridayHovered] = useState(false);
    const [saturdayHovered, setSaturdayHovered] = useState(false);
    const [sundayHovered, setSundayHovered] = useState(false);

    // props
    const sundayVisibleProp = props.sundayVisible;
    const saturdayVisibleProp = props.saturdayVisible;
    const activePanelProp = props.activePanel;
    const attendanceRecordDataProp = props.attendanceRecordData
    const handlePanelChangesProp = props.handlePanelChanges;

    return (
        <>
            <Carousel
                withIndicators={false}
                withControls={false}
                //height={200}
                slideSize={{ base: '20%' }}
                slideGap={{ base: 0, sm: 'md' }}
                loop
                align="start"
                dragFree
                //mt="lg"
            >
                {/* monday */}
                <Carousel.Slide>
                    <Stack
                        align="center"
                        onMouseEnter={() => setMondayHovered(true)}
                        onMouseLeave={() => setMondayHovered(false)}
                        onClick={() => handlePanelChangesProp("monday")}
                        style={{ background: (mondayHovered || activePanelProp === "monday") ? "rgba(24,28,38,0.3)" : "", borderRadius: "10px", paddingTop: "20px", paddingBottom: "20px", cursor: "pointer" }}
                    >
                        <Text
                            size="25px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getDayOfWeek(attendanceRecordDataProp[0]?.attendance_date, 'short') ?? "Monday"}
                        </Text>
                        <Text
                            size="15px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getFormattedDate(attendanceRecordDataProp[0]?.attendance_date, 'day')}
                        </Text>
                    </Stack>
                </Carousel.Slide>

                {/* tuesday */}
                <Carousel.Slide>
                    <Stack
                        align="center"
                        onMouseEnter={() => setTuesdayHovered(true)}
                        onMouseLeave={() => setTuesdayHovered(false)}
                        onClick={() => handlePanelChangesProp("tuesday")}
                        style={{ background: (tuesdayHovered || activePanelProp === "tuesday") ? "rgba(24,28,38,0.3)" : "", borderRadius: "10px", paddingTop: "20px", paddingBottom: "20px", cursor: "pointer" }}
                    >
                        <Text
                            size="25px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getDayOfWeek(attendanceRecordDataProp[1]?.attendance_date, 'short') ?? "Tuesday"}
                        </Text>
                        <Text
                            size="15px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getFormattedDate(attendanceRecordDataProp[1]?.attendance_date, 'day')}
                        </Text>
                    </Stack>
                </Carousel.Slide>

                {/* wednesday */}
                <Carousel.Slide>
                    <Stack
                        align="center"
                        onMouseEnter={() => setWednesdayHovered(true)}
                        onMouseLeave={() => setWednesdayHovered(false)}
                        onClick={() => handlePanelChangesProp("wednesday")}
                        style={{ background: (wednesdayHovered || activePanelProp === "wednesday") ? "rgba(24,28,38,0.3)" : "", borderRadius: "10px", paddingTop: "20px", paddingBottom: "20px", cursor: "pointer" }}
                    >
                        <Text
                            size="25px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getDayOfWeek(attendanceRecordDataProp[2]?.attendance_date, 'short') ?? "Wednesday"}
                        </Text>
                        <Text
                            size="15px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getFormattedDate(attendanceRecordDataProp[2]?.attendance_date, 'day')}
                        </Text>
                    </Stack>
                </Carousel.Slide>

                {/* thursday */}
                <Carousel.Slide>
                    <Stack
                        align="center"
                        onMouseEnter={() => setThursdayHovered(true)}
                        onMouseLeave={() => setThursdayHovered(false)}
                        onClick={() => handlePanelChangesProp("thursday")}
                        style={{ background: (thursdayHovered || activePanelProp === "thursday") ? "rgba(24,28,38,0.3)" : "", borderRadius: "10px", paddingTop: "20px", paddingBottom: "20px", cursor: "pointer" }}
                    >
                        <Text
                            size="25px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getDayOfWeek(attendanceRecordDataProp[3]?.attendance_date, 'short') ?? "Thursday"}
                        </Text>
                        <Text
                            size="15px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getFormattedDate(attendanceRecordDataProp[3]?.attendance_date, 'day')}
                        </Text>
                    </Stack>
                </Carousel.Slide>

                {/* friday */}
                <Carousel.Slide>
                    <Stack
                        align="center"
                        onMouseEnter={() => setFridayHovered(true)}
                        onMouseLeave={() => setFridayHovered(false)}
                        onClick={() => handlePanelChangesProp("friday")}
                        style={{ background: (fridayHovered || activePanelProp === "friday") ? "rgba(24,28,38,0.3)" : "", borderRadius: "10px", paddingTop: "20px", paddingBottom: "20px", cursor: "pointer" }}
                    >
                        <Text
                            size="25px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getDayOfWeek(attendanceRecordDataProp[4]?.attendance_date, 'short') ?? "Friday"}
                        </Text>
                        <Text
                            size="15px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getFormattedDate(attendanceRecordDataProp[4]?.attendance_date, 'day')}
                        </Text>
                    </Stack>
                </Carousel.Slide>

                {/* saturday */}
                <Carousel.Slide>
                    <Stack
                        align="center"
                        onMouseEnter={() => setSaturdayHovered(true)}
                        onMouseLeave={() => setSaturdayHovered(false)}
                        onClick={() => handlePanelChangesProp("saturday")}
                        style={{ background: (saturdayHovered || activePanelProp === "saturday") ? "rgba(24,28,38,0.3)" : "", borderRadius: "10px", paddingTop: "20px", paddingBottom: "20px", cursor: "pointer" }}
                    >
                        <Text
                            size="25px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getDayOfWeek(attendanceRecordDataProp[5]?.attendance_date, 'short') ?? "Saturday"}
                        </Text>
                        <Text
                            size="15px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getFormattedDate(attendanceRecordDataProp[5]?.attendance_date, 'day')}
                        </Text>
                    </Stack>
                </Carousel.Slide>

                {/* sunday */}
                <Carousel.Slide>
                    <Stack
                        align="center"
                        onMouseEnter={() => setSundayHovered(true)}
                        onMouseLeave={() => setSundayHovered(false)}
                        onClick={() => handlePanelChangesProp("sunday")}
                        style={{ background: (sundayHovered || activePanelProp === "sunday") ? "rgba(24,28,38,0.3)" : "", borderRadius: "10px", paddingTop: "20px", paddingBottom: "20px", cursor: "pointer" }}
                    >
                        <Text
                            size="25px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getDayOfWeek(attendanceRecordDataProp[6]?.attendance_date, 'short') ?? "Sunday"}
                        </Text>
                        <Text
                            size="15px"
                            fw={600}
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {getFormattedDate(attendanceRecordDataProp[6]?.attendance_date, 'day')}
                        </Text>
                    </Stack>
                </Carousel.Slide>
            </Carousel>
        </>
    );
}