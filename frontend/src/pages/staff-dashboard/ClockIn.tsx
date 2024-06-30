import { Avatar, Grid, Group, Paper, Stack, Title, Text, Badge, Container, Button, RingProgress, Center, ActionIcon, rem, Space, Menu, Modal, Image, Tabs, ScrollArea, Loader, Alert } from "@mantine/core";
import { IconActivity, IconBookmark, IconBriefcase2, IconCalendar, IconCheck, IconChevronDown, IconClock, IconInfoCircle, IconLogout, IconSortAscendingNumbers, IconTimeline, IconTrash, IconUser, IconX } from "@tabler/icons-react";
import * as React from "react";
import { useEffect, useState } from "react";
import ActivityTimeline from "../../components/ActivityTimeline";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import TeamMemberList from "./components/TeamMembersListModal";
import ProfileEdit from "./components/ProfileEditModal";
import { useNavigate } from "react-router-dom";
import ProfileEditModal from "./components/ProfileEditModal";
import TeamMemberListModal from "./components/TeamMembersListModal";
import StaffStatusModal from "../owner-dashboard/components/StaffStatusModal";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import myImage from "../../assets/timeclock-vector-9.svg";
import myCenter from "../../assets/center.svg";
import "../../css/ClockIn.scss";
import { TeamMemberData, ITeamStatus, TeamStatus } from "../../components/TeamStatus";
import classes from "../../css/HomePanel.module.css";
import { StaffActivity, UserActivity, UserActivityModel, UserStatus } from "../../components/HomePanel";
import { GetCookies, GetStaffActivity, GetStaffActivityByUid, GetStaffActivityLogsByUid, PatchCookies, PatchStaffActivityByUid, PatchStaffAttendanceAutoClockOut } from "../../helpers/Api";
import GeolocationModal from "../../components/GeolocationModal";
import Feature from 'ol/Feature.js';
import Geolocation from 'ol/Geolocation.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {fromLonLat} from 'ol/proj.js';
import { Coordinate } from "ol/coordinate";
import { calculateHaversineDistance } from "../../helpers/Geolocation";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../../css/Notifications.module.css";
import { CalculateRemainingSeconds, TimeStatus, addHoursToDate, addMinutesToDate, cookieExpiryDate, createCountdownCookie, dateToTimeString, dateToWords, deleteCookie, formatCountdownTime, formatDate, getCookie, getCookieV2, getCurrentTime, getCurrentTime12Hours, getCurrentTimestamp, getCurrentTimezoneOffset, getCurrentUnixTimestamp, getDayOfWeekFromInt, isTimeLessThan, sortTimestampsNewest, sortTimestampsOldest, updateTime } from "../../helpers/Helpers";
import { useSupabase } from "../../authentication/SupabaseContext";
import { ConfirmClockInModal, ConfirmClockInNotScheduledModal } from "../../components/ConfirmModal";
import ClockInConfirmModal from "../../components/ClockInConfirmModal";

interface IClockIn {
    handleSubmittedTimesheetClick: (value: boolean) => void;
}

const maxDistance = 15; // distance in meters

export default function ClockIn(props: IClockIn) {
    const { user, business, session } = useAuth();
    const { isManager } = useSupabase();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [tabWidth, setTabWidth] = useState('');
    const navigate = useNavigate();
    //const [teamMemberModalOpened, setTeamMemberModalOpened] = useState(false);
    const [teamMemberModalOpened, { open: openTeamMemberModal, close: closeTeamMemberModal }] = useDisclosure(false);
    const [profileModalOpened, { open: openProfileModal, close: closeProfileModal }] = useDisclosure(false);
    const [geolocationModalOpened, { open: openGeolocationModal, close: closeGeolocationModal }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [activeTab, setActiveTab] = useState<string | null>('staff');
    const [staffActivity, setStaffActivity] = useState<StaffActivity>();
    const [userActivity, setUserActivity] = useState<UserActivity>();
    const [staffActivityLog, setStaffActivityLog] = useState<UserActivityModel[]>([]);
    const [userStatus, setUserStatus] = useState<UserStatus>(); // 1 = out | 2 and 4 = in | 3 = break | 5 = N/A
    const [activityUpdated, setActivityUpdated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [connectionLoading, setConnectionLoading] = useState(false);
    const [OLMap, setOLMap] = useState<Map>();
    const [OLView, setOLView] = useState<View>();
    const [userPosition, setUserPosition] = useState<Coordinate>();
    const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>('');
    const [currentTimeHours, setCurrentTimeHours] = useState(new Date().getHours());
    const [shiftStart, setShiftStart] = useState(handleCurrentDayShiftHours(new Date().getDay())[0]);
    const [shiftEnd, setShiftEnd] = useState(handleCurrentDayShiftHours(new Date().getDay())[1]);
    const [activityLogs, setActivityLogs] = useState<UserActivityModel[]>([]);
    const [activityLogsSorted, setActivityLogsSorted] = useState<UserActivityModel[]>([]);
    const [timestampSortBy, setTimestampSortBy] = useState('new'); // new or old
    const [secondsRemaining, setSecondsRemaining] = useState(CalculateRemainingSeconds(shiftStart, shiftEnd)?.remainingSeconds);
    const [percentageRemaining, setPercentageRemaining] = useState(CalculateRemainingSeconds(shiftStart, shiftEnd)?.percentage);
    const [confirmClockIn, setConfirmClockIn] = useState(false);
    const [geolocationMapLoaded, setGeolocationMapLoaded] = useState(false);
    const [shiftEnded, setShiftEnded] = useState(false);
    const [overtimeStart, setOvertimeStart] = useState('');
    const [overtimeEnd, setOvertimeEnd] = useState('');
    const [overtimeEnded, setOvertimeEnded] = useState(false);
    const [autoClockOutStart, setAutoClockOutStart] = useState('');
    const [autoClockOutEnd, setAutoClockOutEnd] = useState('');
    const [autoClockOutEnded, setAutoClockOutEnded] = useState(false);
    const [autoClockOutSecondsRemaining, setAutoClockOutSecondsRemaining] = useState(0);
    const [autoClockOutPercentageRemaining, setAutoClockOutPercentageRemaining] = useState(0);
    const [overtimeSecondsRemaining, setOvertimeSecondsRemaining] = useState(0);
    const [overtimePercentageRemaining, setOvertimePercentageRemaining] = useState(0);
    const [clockInButtonClicked, setClockInButtonClicked] = useState(false);
    const [overtimeCounterEnabled, setOvertimeCounterEnabled] = useState(false);
    const [autoClockOutCounterEnabled, setAutoClockOutCounterEnabled] = useState(false);
    const [autoClockOutCountdownCookie, setAutoClockOutCountdownCookie] = useState('');
    const [ovetimeCountdownCookie, setOvertimeCountdownCookie] = useState('');
    const [documentCookies, setDocumentCookies] = useState('');
    //const [timerMode, setTimerMode] = useState(0);

    // props
    const handleSubmittedTimesheet = props.handleSubmittedTimesheetClick;

    // fetch data on component load
    useEffect(() => {
        fetchData();
    }, []);

    // track current time
    useEffect(() => {
        var updatedTime = updateTime();
        setCurrentTimeHours(updatedTime?.hours);
        setCurrentTimeFormatted(updatedTime?.formattedTime);

        // Update the time every second
        const intervalId = setInterval(handleUpdateTime, 1000);

        // Cleanup function to clear the interval
        return () => clearInterval(intervalId);
    }, []);

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

    // initialize map on component load
    useEffect(() => {
        const view = new View({
            center: fromLonLat([0,0]),
            zoom: 2,
        });

        const mapInstance = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: view,
        });

        setOLMap(mapInstance);
        setOLView(view);
    }, []);

    // Run effect every time secondsRemaining changes
    useEffect(() => {
        if (autoClockOutEnded) return;
        if (shiftEnded) return;
        if (secondsRemaining < 0) return;
        //if (userStatus?.status !== 2 && userStatus?.status !== 3 && userStatus?.status !== 4) return;

        const intervalId = setInterval(() => {
            //if (getCookieV2('countdownStartTime') === undefined) return
            var calculate = CalculateRemainingSeconds(shiftStart, shiftEnd);
            if (calculate?.percentage === 0 && calculate?.remainingSeconds === 0 && !shiftEnded) {
                // countdown timer ends and reaches 0
                // call function to check if we should do overtime or autoClockOut countdown
                setSecondsRemaining(-1);
                handleEndOfShiftTrigger();
            }
            else {
                setSecondsRemaining(Math.round(calculate?.remainingSeconds));
                setPercentageRemaining(calculate?.percentage);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [secondsRemaining]);

    // Run effect every time overtimeSecondsRemaining changes
    useEffect(() => {
        if (overtimeEnded) return;
        if (overtimeStart === "" || overtimeEnd === "") return;
        if (overtimeSecondsRemaining < 0) return;

        const intervalId = setInterval(() => {
            var calculate = CalculateRemainingSeconds(overtimeStart, overtimeEnd);
            if (calculate?.percentage === 0 && calculate?.remainingSeconds === 0) {
                // overtime countdown timer ends and reaches 0
                setOvertimeSecondsRemaining(-1);
                handleOvertimeTrigger();
            }
            else {
                setOvertimeSecondsRemaining(Math.round(calculate?.remainingSeconds));
                setOvertimePercentageRemaining(calculate?.percentage);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [overtimeSecondsRemaining]);

    // Run effect every time autoClockOutSecondsRemaining changes
    useEffect(() => {
        if (autoClockOutEnded) return;
        if (autoClockOutStart === "" || autoClockOutEnd === "") return;
        if (autoClockOutSecondsRemaining < 0) return;

        const intervalId = setInterval(() => {
            var calculate = CalculateRemainingSeconds(autoClockOutStart, autoClockOutEnd);
            if (calculate?.percentage === 0 && calculate?.remainingSeconds === 0) {
                // auto clock out countdown timer ends and reaches 0
                setAutoClockOutSecondsRemaining(-1);
                handleAutoClockOutTrigger();
            }
            else {
                setAutoClockOutSecondsRemaining(Math.round(calculate?.remainingSeconds));
                setAutoClockOutPercentageRemaining(calculate?.percentage);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [autoClockOutSecondsRemaining]);

    // run when userStatus changes
    useEffect(() => {
        if (userStatus === undefined) return;
        handleTimerSync();
    }, [userStatus]);

    // run when business changes
    useEffect(() => {
        if (!business || business === undefined) return;
        handleTimerSync();
    }, [business]);

    // run when cookie changes
    useEffect(() => {
        if (documentCookies === '') return;
        if (getCookieV2('countdownStartTime') !== undefined || getCookieV2('autoClockOutCountdownStartTime') !== undefined || getCookieV2('overtimeCountdownStartTime') !== undefined) {
            handleTimerSync(); // refresh/sync countdown timer
        }
    },[documentCookies]);

    // trigger auto clock out events
    function handleAutoClockOutTrigger() {
        if (userStatus?.status !== TimeStatus.CLOCKED_IN && userStatus?.status !== TimeStatus.BREAK_START && userStatus?.status !== TimeStatus.BREAK_END) return;
        if (getCookieV2('autoClockOutCountdownStartTime') === undefined) return;
        
        handleAutoClockOutClick(); // auto clock out
        setAutoClockOutCounterEnabled(false);
        setAutoClockOutEnded(true);

        // cleanup
        var autoClockOutCountdownData = {
            'cookie_name': 'autoClockOutCountdownStartTime',
            'user_uid': user?.uid,
            'access_token': session?.access_token,
        }
        deleteCookie(autoClockOutCountdownData, true);

        var countdownData = {
            'cookie_name': 'countdownStartTime',
            'user_uid': user?.uid,
            'access_token': session?.access_token,
        }
        deleteCookie(countdownData, true);
    }

    // check if we need a countdown for overtime or auto clock out
    async function handleEndOfShiftTrigger() {
        if (!user) return;
        if (userStatus?.status !== TimeStatus.CLOCKED_IN && userStatus?.status !== TimeStatus.BREAK_START && userStatus?.status !== TimeStatus.BREAK_END) return;

        // clean up old countdown cookie
        var cookie_data = {
            'cookie_name': 'countdownStartTime',
            'user_uid': user?.uid,
            'access_token': session?.access_token,
        }
        deleteCookie(cookie_data, true);

        if (user?.working_hours?.overtime_allowed) {
            // get cookies for overtime out timer
            var overtimeData = {
                'cookie_name': 'overtimeCountdownStartTime',
                'user_uid': user?.uid,
                'access_token': session?.access_token,
            }
            deleteCookie(overtimeData, false);
            await GetCookies(user?.uid, false, session?.access_token);
            var overtimeCountdownCookie = getCookieV2('overtimeCountdownStartTime');
            if (overtimeCountdownCookie === undefined) {
                // patch attendance with overtime_in_time
                await handleOvertimeIn();

                // cookie does not exist, create it
                var overtimeTimer = business?.overtime_max_duration ?? 720; // TODO: use value from business settings
                var overtimeCountdownCookieExpiry = createCountdownCookie('overtimeCountdownStartTime', overtimeTimer, "mins");
                updateCookies(overtimeCountdownCookieExpiry[1].toString());
            }
        }
        else {
            // get cookies for auto clock out timer
            var autoClockOutData = {
                'cookie_name': 'autoClockOutCountdownStartTime',
                'user_uid': user?.uid,
                'access_token': session?.access_token,
            }
            deleteCookie(autoClockOutData, false);
            await GetCookies(user?.uid, false, session?.access_token);
            var autoClockOutCountdownCookie = getCookieV2('autoClockOutCountdownStartTime');
            if (autoClockOutCountdownCookie === undefined) {
                // cookie does not exist, create it
                var autoClockoutTimer = business?.auto_clock_out_max_duration ?? 15;
                var autoClockOutCountdownCookieExpiry = createCountdownCookie('autoClockOutCountdownStartTime', autoClockoutTimer, "mins");
                updateCookies(autoClockOutCountdownCookieExpiry[1].toString());
            }
        }
        handleTimerSync();
        setShiftEnded(true);
    }

    // trigger overtime counter events when timer reaches 0
    async function handleOvertimeTrigger() {
        if (!user) return;
        if (userStatus?.status !== TimeStatus.OVERTIME_START) return;
        if (getCookieV2('overtimeCountdownStartTime') === undefined) return;

        // patch attendance with current time as overtime_out_time
        await handleOvertimeOut();

        // cleanup, delete old cookies
        var overtimeCountdownData = {
            'cookie_name': 'overtimeCountdownStartTime',
            'user_uid': user?.uid,
            'access_token': session?.access_token,
        }
        deleteCookie(overtimeCountdownData, true);

        var countdownData = {
            'cookie_name': 'countdownStartTime',
            'user_uid': user?.uid,
            'access_token': session?.access_token,
        }
        deleteCookie(countdownData, true);

        setOvertimeCounterEnabled(false);
        setOvertimeEnded(true);
    }

    
    function handleCurrentDayShiftHours(day: number): string[] {
        var shiftStart = "";
        var shiftEnd = "";
        var businessWorkingHours = user?.business_info[0]?.working_hours;
        switch (day) {
            case 0:
                // sunday
                if (user?.working_hours?.sunday_start && user?.working_hours?.sunday_end) {
                    shiftStart = user?.working_hours?.sunday_start;
                    shiftEnd = user?.working_hours?.sunday_end;
                }
                else if (businessWorkingHours?.sunday_start && businessWorkingHours?.sunday_end) {
                    // get business hours if any
                    shiftStart = businessWorkingHours?.sunday_start;
                    shiftEnd = businessWorkingHours?.sunday_end;
                }
                return [shiftStart, shiftEnd];
            case 1:
                // monday
                if (user?.working_hours?.monday_start && user?.working_hours?.monday_end) {
                    shiftStart = user?.working_hours?.monday_start;
                    shiftEnd = user?.working_hours?.monday_end;
                }
                else if (businessWorkingHours?.monday_start && businessWorkingHours?.monday_end) {
                    // get business hours if any
                    shiftStart = businessWorkingHours?.monday_start;
                    shiftEnd = businessWorkingHours?.monday_end;
                }
                return [shiftStart, shiftEnd];
            case 2:
                // tuesday
                if (user?.working_hours?.tuesday_start && user?.working_hours?.tuesday_end) {
                    shiftStart = user?.working_hours?.tuesday_start;
                    shiftEnd = user?.working_hours?.tuesday_end;
                }
                else if (businessWorkingHours?.tuesday_start && businessWorkingHours?.tuesday_end) {
                    // get business hours if any
                    shiftStart = businessWorkingHours?.tuesday_start;
                    shiftEnd = businessWorkingHours?.tuesday_end;
                }
                return [shiftStart, shiftEnd];
            case 3:
                // wednesday
                if (user?.working_hours?.wednesday_start && user?.working_hours?.wednesday_end) {
                    shiftStart = user?.working_hours?.wednesday_start;
                    shiftEnd = user?.working_hours?.wednesday_end;
                }
                else if (businessWorkingHours?.wednesday_start && businessWorkingHours?.wednesday_end) {
                    // get business hours if any
                    shiftStart = businessWorkingHours?.wednesday_start;
                    shiftEnd = businessWorkingHours?.wednesday_end;
                }
                return [shiftStart, shiftEnd];
            case 4:
                // thursday
                if (user?.working_hours?.thursday_start && user?.working_hours?.thursday_end) {
                    shiftStart = user?.working_hours?.thursday_start;
                    shiftEnd = user?.working_hours?.thursday_end;
                }
                else if (businessWorkingHours?.thursday_start && businessWorkingHours?.thursday_end) {
                    // get business hours if any
                    shiftStart = businessWorkingHours?.thursday_start;
                    shiftEnd = businessWorkingHours?.thursday_end;
                }
                return [shiftStart, shiftEnd];
            case 5:
                // friday
                if (user?.working_hours?.friday_start && user?.working_hours?.friday_end) {
                    shiftStart = user?.working_hours?.friday_start;
                    shiftEnd = user?.working_hours?.friday_end;
                }
                else if (businessWorkingHours?.friday_start && businessWorkingHours?.friday_end) {
                    // get business hours if any
                    shiftStart = businessWorkingHours?.friday_start;
                    shiftEnd = businessWorkingHours?.friday_end;
                }
                return [shiftStart, shiftEnd];
            case 6:
                // saturday
                if (user?.working_hours?.saturday_start && user?.working_hours?.saturday_end) {
                    shiftStart = user?.working_hours?.saturday_start;
                    shiftEnd = user?.working_hours?.saturday_end;
                }
                else if (businessWorkingHours?.saturday_start && businessWorkingHours?.saturday_end) {
                    // get business hours if any
                    shiftStart = businessWorkingHours?.saturday_start;
                    shiftEnd = businessWorkingHours?.saturday_end;
                }
                return [shiftStart, shiftEnd];
            default:
                return [shiftStart, shiftEnd];
        }
    }
    
    // handle updating the time
    function handleUpdateTime() {
        var updatedTime = updateTime();
        setCurrentTimeHours(updatedTime?.hours);
        setCurrentTimeFormatted(updatedTime?.formattedTime);
    }

    // handle timeline activity sorting
    function handleTimestampSort() {
        if (timestampSortBy === 'new' && staffActivityLog) {
            // change to sort by old
            setActivityLogsSorted(sortTimestampsOldest(staffActivityLog));
            setTimestampSortBy('old');
        }
        else if (timestampSortBy !== 'new' && staffActivityLog) {
            // change to sort by new
            setActivityLogsSorted(sortTimestampsNewest(staffActivityLog));
            setTimestampSortBy('new');
        }
    }

    function handleConfirmClockIn(value: boolean) {
        if (value) {
            setConfirmClockIn(true);
        }
    }

    const geolocation = new Geolocation({
        // enableHighAccuracy must be set to true to have the heading value.
        trackingOptions: {
          enableHighAccuracy: true,
          timeout: 600000,
          //maximumAge: 5000,
        },
        projection: OLMap?.getView().getProjection(),
    });

    const accuracyFeature = new Feature();
    geolocation.on('change:accuracyGeometry', function () {
        const accuracyGeometry = geolocation.getAccuracyGeometry();
        if (accuracyGeometry != null) {
            accuracyFeature.setGeometry(accuracyGeometry);
        }
    });

    useEffect(() => {
        if (activityUpdated === true) {
            fetchData();
        }
    }, [activityUpdated]);

    useEffect(() => {
        if (windowWidth < 800) {
            setTabWidth("");
        }
        else {
            setTabWidth("300px")
        }
    }, [windowWidth]);

    // useEffect(() => {
    //     console.log("Geolocation changed, NEW POSITION: " + userPosition);
    // }, [userPosition]);

    function handleFormSubmitted(flag: boolean) {
        console.log("Form submitted");
    }

    async function fetchData() {
        if (user && business?.id !== undefined) {
            setLoading(true);
            setActivityUpdated(false);

            // get current staff activity status for this user 
            var userStatusData = await GetStaffActivityByUid(business?.id, user?.uid, session?.access_token);
            setUserStatus(userStatusData);
            //console.log(userStatusData);

            // get all current user activity for the day
            var staffActivityLogData = await GetStaffActivityLogsByUid(business?.id, user?.uid, session?.access_token);
            setStaffActivityLog(sortTimestampsNewest(staffActivityLogData));

            // get all staff status
            var staffActivityData = await GetStaffActivity(business?.id, session?.access_token);
            setStaffActivity(staffActivityData);
            //console.log(staffAactivityData);

            // TODO: GET COOKIES BASED ON USER CONSENT PREFERENCES
            // get cookies, disable httponly to allow javascript to access cookies
            await GetCookies(user?.uid, false, session?.access_token);
            setDocumentCookies(document.cookie);

            setLoading(false);
        }
    }

    function handleGeolocationMapLoaded() {
        setGeolocationMapLoaded(true);
        console.log("map loaded -- end loading");
    }

    // handle when clock in button is clicked
    async function handleClockInClick() {
        if (!(user && user?.working_hours)) {
            // show error?
            return;
        }

        // get current date
        var date = new Date();
        //var currentDate = formatDate(date);
        
        // verify working schedule hours
        var isWorkDay = false;
        var businessStart = "";
        var businessEnd = "";
        var isScheduled = false;
        var shiftStart = "";
        var shiftEnd = "";
        var businessWorkingHours = user?.business_info[0]?.working_hours;
        switch(date.getDay()) {
            case 0:
                // sunday
                // check if business work day
                if (businessWorkingHours?.sunday_start && businessWorkingHours?.sunday_end) {
                    isWorkDay = true;
                    businessStart = user?.business_info[0]?.working_hours?.sunday_start;
                    businessEnd = user?.business_info[0]?.working_hours?.sunday_end;

                    // check if user is scheduled to work today
                    if (user?.working_hours?.sunday_start && user?.working_hours?.sunday_end) {
                        isScheduled = true;
                        shiftStart = user?.working_hours?.sunday_start;
                        shiftEnd = user?.working_hours?.sunday_end;
                    }
                }
                break;
            case 1:
                // monday
                // check if business work day
                if (businessWorkingHours?.monday_start && businessWorkingHours?.monday_end) {
                    isWorkDay = true;
                    businessStart = user?.business_info[0]?.working_hours?.monday_start;
                    businessEnd = user?.business_info[0]?.working_hours?.monday_end;

                    // check if user is scheduled to work today
                    if (user?.working_hours?.monday_start && user?.working_hours?.monday_end) {
                        isScheduled = true;
                        shiftStart = user?.working_hours?.monday_start;
                        shiftEnd = user?.working_hours?.monday_end;
                    }
                }
                break;
            case 2:
                // tuesday
                // check if business work day
                if (businessWorkingHours?.tuesday_start && businessWorkingHours?.tuesday_end) {
                    isWorkDay = true;
                    businessStart = user?.business_info[0]?.working_hours?.tuesday_start;
                    businessEnd = user?.business_info[0]?.working_hours?.tuesday_end;

                    // check if user is scheduled to work today
                    if (user?.working_hours?.tuesday_start && user?.working_hours?.tuesday_end) {
                        isScheduled = true;
                        shiftStart = user?.working_hours?.tuesday_start;
                        shiftEnd = user?.working_hours?.tuesday_end;
                    }
                }
                break;
            case 3:
                // wednesday
                // check if business work day
                if (businessWorkingHours?.wednesday_start && businessWorkingHours?.wednesday_end) {
                    isWorkDay = true;
                    businessStart = user?.business_info[0]?.working_hours?.wednesday_start;
                    businessEnd = user?.business_info[0]?.working_hours?.wednesday_end;

                    // check if user is scheduled to work today
                    if (user?.working_hours?.wednesday_start && user?.working_hours?.wednesday_end) {
                        isScheduled = true;
                        shiftStart = user?.working_hours?.wednesday_start;
                        shiftEnd = user?.working_hours?.wednesday_end;
                    }
                }
                break;
            case 4:
                // thursday
                // check if business work day
                if (businessWorkingHours?.thursday_start && businessWorkingHours?.thursday_end) {
                    isWorkDay = true;
                    businessStart = user?.business_info[0]?.working_hours?.thursday_start;
                    businessEnd = user?.business_info[0]?.working_hours?.thursday_end;

                    // check if user is scheduled to work today
                    if (user?.working_hours?.thursday_start && user?.working_hours?.thursday_end) {
                        isScheduled = true;
                        shiftStart = user?.working_hours?.thursday_start;
                        shiftEnd = user?.working_hours?.thursday_end;
                    }
                }
                break;
            case 5:
                // friday
                // check if business work day
                if (businessWorkingHours?.friday_start && businessWorkingHours?.friday_end) {
                    isWorkDay = true;
                    businessStart = user?.business_info[0]?.working_hours?.friday_start;
                    businessEnd = user?.business_info[0]?.working_hours?.friday_end;

                    // check if user is scheduled to work today
                    if (user?.working_hours?.friday_start && user?.working_hours?.friday_end) {
                        isScheduled = true;
                        shiftStart = user?.working_hours?.friday_start;
                        shiftEnd = user?.working_hours?.friday_end;
                    }
                }
                break;
            case 6:
                // saturday
                // check if business work day
                if (businessWorkingHours?.saturday_start && businessWorkingHours?.saturday_end) {
                    isWorkDay = true;
                    businessStart = user?.business_info[0]?.working_hours?.saturday_start;
                    businessEnd = user?.business_info[0]?.working_hours?.saturday_end;

                    // check if user is scheduled to work today
                    if (user?.working_hours?.saturday_start && user?.working_hours?.saturday_end) {
                        isScheduled = true;
                        shiftStart = user?.working_hours?.saturday_start;
                        shiftEnd = user?.working_hours?.saturday_end;
                    }
                }
                break;
            default:
                return;
        }

        if (!isWorkDay) {
            // show error, can't clock in, business not open today
            notifications.show({
                color: 'red',
                title: 'Error',
                message: 'There was an error clocking in. Your workplace is not open today.',
                icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                loading: false,
                autoClose: 5000,
                classNames: notiicationClasses,
            });
            return;
        }

        if (!currentTimeWithinBusinessHours(getCurrentTime())) {
            // show error, can't clock in, current time is not within business hours
            notifications.show({
                color: 'red',
                title: 'Error',
                message: 'The current time is not within the regular working hours for this workplace.',
                icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                loading: false,
                autoClose: 5000,
                classNames: notiicationClasses,
            });
            return;
        }

        if (isScheduled && isWorkDay) {
            setShiftStart(shiftStart);
            setShiftEnd(shiftEnd);
        }
        else if (!isScheduled && isWorkDay) {
            // setup default shift
            setShiftStart(businessStart);
            setShiftEnd(businessEnd);
        }
        else {
            // unknown
            notifications.show({
                color: 'red',
                title: 'Error',
                message: 'There was an error clocking in. Please try again.',
                icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                loading: false,
                autoClose: 3000,
                classNames: notiicationClasses,
            });
            return;
        }
        
        setConnectionLoading(true);

        var confirmClockIn;
        if (!isScheduled && (user?.business_info[0]?.gps_geolocation)) {
            // not scheduled and geolocation is enabled
            confirmClockIn = await ConfirmClockInNotScheduledModal({ onConfirm: handleConfirmClockIn });
            if (!confirmClockIn) {
                return;
            }
            handleGeolocationClick();
            openGeolocationModal();
            return;
        }
        else if (!isScheduled && !(user?.business_info[0]?.gps_geolocation)) {
            // not scheduled and geolocation not enabled
            confirmClockIn = await ConfirmClockInNotScheduledModal({ onConfirm: handleConfirmClockIn });
        }
        else if (isScheduled && user?.business_info[0]?.gps_geolocation) {
            // scheduled and geolocation is enabled
            confirmClockIn = await ConfirmClockInModal({ onConfirm: handleConfirmClockIn});
            if (!confirmClockIn) {
                return;
            }
            handleGeolocationClick();
            openGeolocationModal();
            return;
        }
        else if (isScheduled && !(user?.business_info[0]?.gps_geolocation)) {
            // scheduled and geolocation is not enabled
            confirmClockIn = await ConfirmClockInModal({ onConfirm: handleConfirmClockIn});
        }

        if (!confirmClockIn) {
            return;
        }

        // clock in api call
        handleClockInClickSubmit();
    }

    // handle api call for clocking in
    async function handleClockInClickSubmit() {
        if (user && business) {
            // setup new activity
            var new_activity = {
                'user_uid': user?.uid,
                'business_id': business?.id,
                'status': TimeStatus.CLOCKED_IN,
                'timestamp': getCurrentTimestamp(),
                'date': formatDate(new Date()),
                'timezone': getCurrentTimezoneOffset(),
            }

            console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());
            
            // notification 
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            // send patch request to update staff activity to IN status
            var requestStatus = await PatchStaffActivityByUid(business?.id, user?.uid, new_activity, session?.access_token);
            if (requestStatus === 200) {
                // show success alert
                setActivityUpdated(true);
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'You have clocked in.',
                        icon: <IconCheck size="lg" style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 5000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                closeGeolocationModal();
                setShiftEnded(false);
                setAutoClockOutEnded(false);
                setOvertimeEnded(false);

                // clean up old cookies
                var cookie_data = {
                    'cookie_name': 'autoClockOutCountdownStartTime',
                    'user_uid': user?.uid,
                    'access_token': session?.access_token,
                }
                deleteCookie(cookie_data, true);

                var cookie_data_2 = {
                    'cookie_name': 'overtimeCountdownStartTime',
                    'user_uid': user?.uid,
                    'access_token': session?.access_token,
                }
                deleteCookie(cookie_data_2, true);

                // create new cookie, set countdown for regular shift from current time
                const remainingSeconds = CalculateRemainingSeconds(shiftStart, shiftEnd)?.remainingSeconds;
                var countdownCookieExpiry = createCountdownCookie('countdownStartTime', remainingSeconds + 60, "seconds");
                updateCookies(countdownCookieExpiry[1].toString());
            }
            else {
                // show error alert
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error clocking in. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 1000);
                closeGeolocationModal();
            }
            fetchData();
        }
    }

    // handle api call for clocking out
    async function handleClockOutClick() {
        if (!user || !business) return;
    
        // TODO: if geolocation is enabled, verify geolocation conditions -- show clock out geolocation modal

        // setup new activity
        var new_activity;
        if (overtimeCounterEnabled) {
            // patch attendance with overtime_check_out
            new_activity = {
                'user_uid': user?.uid,
                'business_id': business?.id,
                'status': TimeStatus.OVERTIME_END,
                'timestamp': getCurrentTimestamp(),
                'date': formatDate(new Date()),
            }
        }
        else {
            // regular clock out
            new_activity = {
                'user_uid': user?.uid,
                'business_id': business?.id,
                'status': TimeStatus.CLOCKED_OUT,
                'timestamp': getCurrentTimestamp(),
                'date': formatDate(new Date()),
            }
        }

        console.log(formatDate(new Date()));
        console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());

        // TODO: FIRST check if we can update the attendance record

        // send patch request to update staff activity to OUT status
        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });
        var requestStatus = await PatchStaffActivityByUid(business?.id, user?.uid, new_activity, session?.access_token);
        if (requestStatus === 200) {
            // show success alert
            setActivityUpdated(true);
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'You have clocked out.',
                    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1000,
                    classNames: notiicationClasses,
                });
            }, 500);
            setSecondsRemaining(0);
            setPercentageRemaining(0);
            setShiftEnded(false);
        }
        else {
            // show error alert
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error clocking out. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
            }, 500);
        }
        fetchData();
    }

    async function handleBreakStartClick() {
        if (user && business) {
            // if geolocation is enabled, verify geolocation conditions
            // setup new activity
            var new_activity = {
                'user_uid': user?.uid,
                'business_id': business?.id,
                'status': TimeStatus.BREAK_START,
                'timestamp': getCurrentTimestamp(),
                'date': formatDate(new Date()),
            }

            // TODO: FIRST check if we can update the attendance record
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            // send patch request to update staff activity to OUT status
            var requestStatus = await PatchStaffActivityByUid(business?.id, user?.uid, new_activity, session?.access_token);
            if (requestStatus === 200) {
                // show success alert
                setActivityUpdated(true);
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'You started your break',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
            else {
                // show error alert
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error starting your break. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
            fetchData();
        }
    }

    async function handleBreakEndClick() {
        if (user && business) {
            // if geolocation is enabled, verify geolocation conditions
            // setup new activity
            var new_activity = {
                'user_uid': user?.uid,
                'business_id': business?.id,
                'status': TimeStatus.BREAK_END,
                'timestamp': getCurrentTimestamp(),
                'date': formatDate(new Date()),
            }
            // TODO: FIRST check if we can update the attendance record

            // send patch request to update staff activity to OUT status
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });
            var requestStatus = await PatchStaffActivityByUid(business?.id, user?.uid, new_activity, session?.access_token);
            if (requestStatus === 200) {
                // show success alert
                setActivityUpdated(true);
    
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'You ended your break',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
            else {
                // show error alert
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error ending your break. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
            fetchData();
        }
    }

    // handle api call for auto clocking out
    async function handleAutoClockOutClick() {
        if (!user || !business) return;

        // setup new activity
        var new_auto_clock_out;
        if (overtimeCounterEnabled) {
            // patch attendance with overtime_check_out
            new_auto_clock_out = {
                'user_uid': user?.uid,
                'business_id': business?.id,
                'status': TimeStatus.OVERTIME_END,
                'timestamp': getCurrentTimestamp(),
                'date': formatDate(new Date()),
            }
        }
        else {
            // regular auto clock out
            new_auto_clock_out = {
                'user_uid': user?.uid,
                'business_id': business?.id,
                //'status': TimeStatus.CLOCKED_OUT,
                'timestamp': getCurrentTimestamp(),
                'date': formatDate(new Date()),
            }
        }
        
        //console.log(formatDate(new Date()));
        //console.log( new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());

        // TODO: FIRST check if we can update the attendance record

        // send patch request to update staff attendance and clock out if the attendance is unfinished
        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });
        var requestStatus = await PatchStaffAttendanceAutoClockOut(user?.uid, new_auto_clock_out, session?.access_token);
        if (requestStatus === 200) {
            // show success alert
            setActivityUpdated(true);
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'You have clocked out.',
                    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1000,
                    classNames: notiicationClasses,
                });
            }, 500);
            setSecondsRemaining(0);
            setPercentageRemaining(0);
            setShiftEnded(false);
            setAutoClockOutCounterEnabled(false);
        }
        else {
            // show error alert
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error clocking out. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
            }, 500);
        }
        fetchData();
    }

    // handle api call for clocking overtime in
    async function handleOvertimeIn() {
        if (!user || !business) return;
        //if (!overtimeCounterEnabled) return;
    
        // TODO: if geolocation is enabled, verify geolocation conditions -- show clock out geolocation modal

        // setup new activity
        var new_activity = {
            'user_uid': user?.uid,
            'business_id': business?.id,
            'status': TimeStatus.OVERTIME_START,
            'timestamp': getCurrentTimestamp(),
            'date': formatDate(new Date()),
        }

        // TODO: FIRST check if we can update the attendance record

        // send patch request to update staff activity
        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });
        var requestStatus = await PatchStaffActivityByUid(business?.id, user?.uid, new_activity, session?.access_token);
        if (requestStatus === 200) {
            // show success alert
            setActivityUpdated(true);
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'You have started overtime.',
                    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1000,
                    classNames: notiicationClasses,
                });
            }, 500);
            setShiftEnded(true);
        }
        else {
            // show error alert
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error starting overtime.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
            }, 500);
        }
        fetchData();
    }

    // handle api call for clocking overtime out
    async function handleOvertimeOut() {
        if (!user || !business) return;
        //if (!overtimeCounterEnabled) return;
    
        // TODO: if geolocation is enabled, verify geolocation conditions -- show clock out geolocation modal

        // setup new activity
        var new_activity = {
            'user_uid': user?.uid,
            'business_id': business?.id,
            'status': TimeStatus.OVERTIME_END,
            'timestamp': getCurrentTimestamp(),
            'date': formatDate(new Date()),
        }

        // TODO: FIRST check if we can update the attendance record

        // send patch request to update staff activity
        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });
        var requestStatus = await PatchStaffActivityByUid(business?.id, user?.uid, new_activity, session?.access_token);
        if (requestStatus === 200) {
            // show success alert
            setActivityUpdated(true);
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'You have ended overtime.',
                    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1000,
                    classNames: notiicationClasses,
                });
            }, 500);
            setShiftEnded(true);
        }
        else {
            // show error alert
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error ending overtime.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
            }, 500);
        }
        fetchData();
    }

    // check and see if current time is < business scheduled end time
    function currentTimeWithinBusinessHours(currentTime: string) {
        var day = new Date().getDay();
        switch(day) {
            case 0:
                // sunday
                var sundayEnd = business?.working_hours?.sunday_end;
                if (isTimeLessThan(currentTime, sundayEnd)) return true;
                return false;
            case 1:
                // monday
                var mondayEnd = business?.working_hours?.monday_end;
                if (isTimeLessThan(currentTime, mondayEnd)) return true;
                return false;
            case 2:
                // tuesday
                var tuesdayEnd = business?.working_hours?.tuesday_end;
                if (isTimeLessThan(currentTime, tuesdayEnd)) return true;
                return false;
            case 3:
                // wednesday
                var wednesdayEnd = business?.working_hours?.wednesday_end;
                if (isTimeLessThan(currentTime, wednesdayEnd)) return true;
                return false;
            case 4:
                // thursday
                var thursdayEnd = business?.working_hours?.thursday_end;
                if (isTimeLessThan(currentTime, thursdayEnd)) return true;
                return false;
            case 5:
                // friday
                var fridayEnd = business?.working_hours?.friday_end;
                if (isTimeLessThan(currentTime, fridayEnd)) return true;
                return false;
            case 6: 
                // saturday
                var saturdayEnd = business?.working_hours?.saturday_end;
                if (isTimeLessThan(currentTime, saturdayEnd)) return true;
                return false;
            default:
                return false;
        }   
    }

    async function updateCookies(expiry: string) {
        if (!user) return;

        var data = {
            'user_uid': user?.uid,
            'expires_at': expiry,
        }

        // send patch request to update cookies
        var requestStatus = await PatchCookies(user?.uid, data, session?.access_token);
        if (requestStatus === 200) {
            // show success alert
            await GetCookies(user?.uid, false, session?.access_token);
            //handleTimerSync();
            //fetchData();
        }
        else {
            // show error alert
            console.log("Error updating cookies");
        }
    }

    // handle setting up and syncing the countdown timers
    async function handleTimerSync() {
        if (!user) return;

        var currentTime = new Date().getTime();

        // get data from cookies if any 
        //await GetCookies(user?.uid, false, session?.access_token);
        const countdownStartTimeCookie = getCookieV2('countdownStartTime');
        var overtimeCountdownStartTimeCookie = getCookieV2('overtimeCountdownStartTime');
        var autoClockOutCountdownStartTimeCookie = getCookieV2('autoClockOutCountdownStartTime');
        const shiftEndedFlag = (overtimeCountdownStartTimeCookie !== undefined || autoClockOutCountdownStartTimeCookie !== undefined) && countdownStartTimeCookie === undefined;
        setAutoClockOutCounterEnabled(false);
        setOvertimeCounterEnabled(false);

        if (shiftEndedFlag && overtimeCountdownStartTimeCookie !== undefined) {
            // get data from cookies if any
            var overtimeTimer = business?.overtime_max_duration ?? 720; // default 12 hours;
            var overtimeStartTime = new Date(parseInt(overtimeCountdownStartTimeCookie, 10) * 1000);
            var overtimeEndTime = addMinutesToDate(overtimeStartTime, overtimeTimer); // add x minutes to the start time in unix milliseconds

            //console.log("current time=" + currentTime + " | auto clock out time=" + autoClockOutEndCalculated);
            
            if (currentTime > overtimeEndTime.getTime()) {
                // timer is up, trigger overtime counter
                setOvertimeEnd(dateToTimeString(overtimeEndTime));
                setOvertimeSecondsRemaining(0);
                setOvertimePercentageRemaining(100);
                return;
            }

            // calculate time till end of overtime timer
            const overtimeElapsedTime = (currentTime - overtimeStartTime.getTime()) / 1000;
            const overtimeStart = dateToTimeString(overtimeStartTime);
            const overtimeEnd = dateToTimeString(overtimeEndTime);
            const overtimeRemainingSeconds = CalculateRemainingSeconds(overtimeStart, overtimeEnd)?.remainingSeconds - overtimeElapsedTime;
            const overtimeRemainingPercentage = CalculateRemainingSeconds(overtimeStart, overtimeEnd)?.percentage;

            setOvertimeCounterEnabled(true);
            setOvertimeSecondsRemaining(overtimeRemainingSeconds > 0 ? Math.round(overtimeRemainingSeconds) : 0);
            setOvertimePercentageRemaining(overtimeRemainingPercentage > 0 ? overtimeRemainingPercentage : 100);
            setOvertimeStart(overtimeStart);
            setOvertimeEnd(overtimeEnd);
            setOvertimeCountdownCookie(overtimeCountdownStartTimeCookie);
        }
        else if (shiftEndedFlag && autoClockOutCountdownStartTimeCookie !== undefined) {
            // get data from cookies if any
            var autoClockOutTimer = business?.auto_clock_out_max_duration ?? 15; // default 15 minutes
            var autoClockOutStartTime = new Date(parseInt(autoClockOutCountdownStartTimeCookie, 10) * 1000);
            var autoClockOutEndTime = addMinutesToDate(autoClockOutStartTime, autoClockOutTimer); // add x minutes to the start time in unix milliseconds

            //console.log("current time=" + currentTime + " | auto clock out time=" + autoClockOutEndCalculated);
            
            if (currentTime > autoClockOutEndTime.getTime()) {
                // timer is up, trigger auto clock out
                setAutoClockOutEnd(dateToTimeString(autoClockOutEndTime));
                setAutoClockOutSecondsRemaining(0);
                setAutoClockOutPercentageRemaining(100);
                return;
            }

            // calculate time till end of auto clock out timer
            const autoClockOutElapsedTime = (currentTime - autoClockOutStartTime.getTime()) / 1000;
            const autoClockOutStart = dateToTimeString(autoClockOutStartTime);
            const autoClockOutEnd = dateToTimeString(autoClockOutEndTime);
            const autoClockOutRemainingSeconds = CalculateRemainingSeconds(autoClockOutStart, autoClockOutEnd)?.remainingSeconds - autoClockOutElapsedTime;
            const autoClockOutRemainingPercentage = CalculateRemainingSeconds(autoClockOutStart, autoClockOutEnd)?.percentage;

            setAutoClockOutCounterEnabled(true);
            setAutoClockOutSecondsRemaining(autoClockOutRemainingSeconds > 0 ? Math.round(autoClockOutRemainingSeconds) : 0);
            setAutoClockOutPercentageRemaining(autoClockOutRemainingPercentage > 0 ? autoClockOutRemainingPercentage : 100);
            setAutoClockOutStart(autoClockOutStart);
            setAutoClockOutEnd(autoClockOutEnd);
            setAutoClockOutCountdownCookie(autoClockOutCountdownStartTimeCookie);
        }
        else if (countdownStartTimeCookie !== undefined && (userStatus?.status !== 1 && userStatus?.status !== 5 )) {
            // set countdown for regular shift from cookie
            const startTime = new Date(parseInt(countdownStartTimeCookie, 10));
            const elapsedTime = (currentTime - startTime.getTime()) / 1000;
            const remainingSeconds = CalculateRemainingSeconds(shiftStart, shiftEnd)?.remainingSeconds - elapsedTime;
            const remainingPercentage = CalculateRemainingSeconds(shiftStart, shiftEnd)?.percentage;

            setSecondsRemaining(remainingSeconds > 0 ? Math.round(remainingSeconds) : 0);
            setPercentageRemaining(remainingPercentage > 0 ? remainingPercentage : 100);
        }
    }

    const handleGeolocationClick = React.useCallback(() => {
        //console.log('Geolocation clicked');
        geolocation.setTracking(true);
        setLoading(true);

        // show notification
        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });

        // attempt to get users location via coordiantes latitude and longitude with geolocation api
        const coordinates = geolocation.getPosition();
        if (coordinates !== undefined || geolocationMapLoaded) {
            setUserPosition(coordinates);
            OLMap?.getView().setCenter(coordinates); // build the open layers map with the coordiantes
            setLoading(false);
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'Connected to the server.',
                    icon: <IconCheck size="lg" style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 3000,
                    classNames: notiicationClasses,
                });
                setConnectionLoading(false);
            }, 1000);
            //console.log("current position: " + coordinates);
        }
        else {
            notifications.update({
                id,
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: 0,
                withCloseButton: false,
                classNames: notiicationClasses,
            });
            attemptGeolocation(3, 2000); // Try 3 times with a delay of 2 second
            //window.location.reload();
        }
    }, []);


    async function handleGeolocationOnsiteClick() {
        if (geolocation != null && geolocation !== undefined && userPosition && user && business) {
            // verify that user is within x meters of their work location
            //console.log("my location: lon="+userPosition[0].toString()+" lat="+userPosition[1].toString());
            //console.log("designated location: lon="+user?.business_info[0]?.lon.toString()+" lat="+user?.business_info[0]?.lat.toString());
            var distance = calculateHaversineDistance(userPosition[0], userPosition[1], parseFloat(business?.lon), parseFloat(business?.lat));
            //console.log("the distance is= " + distance + "m");

            if (distance <= maxDistance) {
                // allow clock in
                handleClockInClickSubmit();
            }
            else {
                // show error
                notifications.show({
                    color: 'red',
                    title: 'Error',
                    message: `You are not within ${maxDistance}m of your work location site. Please get closer.`,
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 2500,
                    classNames: notiicationClasses,
                });
            }
        }
    }

    const positionFeature = new Feature();
    positionFeature.setStyle(
        new Style({
            image: new CircleStyle({
                radius: 6,
                fill: new Fill({
                    color: '#3399CC',
                }),
                stroke: new Stroke({
                    color: '#fff',
                    width: 2,
                }),
            }),
        }),
    );
    
    // set coordinates when geolocation position changes
    geolocation.on('change:position', function () {
        const coordinates = geolocation.getPosition();
        if (coordinates != null) {
            setUserPosition(coordinates);
            OLMap?.getView().setCenter(coordinates);
            //console.log("position changed, new coords: " + coordinates);
            positionFeature.setGeometry(new Point(coordinates));
        }
    });

    // geolocation.on('change:position', function () {
    //     const coordinates = geolocation.getPosition();
    //     if (coordinates != null) {
    //         console.log("position changed, new coords: " + coordinates);
    //         positionFeature.setGeometry(new Point(coordinates));
    //     }
    // });
    
    new VectorLayer({
        map: OLMap,
        source: new VectorSource({
            features: [accuracyFeature, positionFeature],
        }),
    });

    geolocation.on('error', function (error) {
        console.log(error.message);
        switch(error.code) {
            case 1:
                // permission denied
                return;
            case 2:
                // positon unavailable
                return ;
            case 3:
                // timeout - try again
                geolocation.setTracking(true);
                return;
            default:
                // unknown error
                console.log("An unknown error occured");
                return;
        }
    });

    function attemptGeolocation(maxAttempts: number, delay: number) {
        let attempt = 0;

        // show notification
        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });
    
        function tryAgain() {
            if (attempt < maxAttempts) {
                attempt++;
                const coordinates = geolocation.getPosition();
                if (coordinates !== undefined || geolocationMapLoaded) {
                    // Geolocation successful, initialize map with coordinates
                    setUserPosition(coordinates);
                    OLMap?.getView().setCenter(coordinates);
                    //console.log("Geolocation successful:", coordinates);
                    setTimeout(() => {
                        notifications.update({
                            id,
                            color: 'teal',
                            title: 'Success',
                            message: 'Connected to the server.',
                            icon: <IconCheck size="lg" style={{ width: rem(18), height: rem(18) }} />,
                            loading: false,
                            autoClose: 3000,
                            classNames: notiicationClasses,
                        });
                        setLoading(false);
                        setConnectionLoading(false);
                    }, 1500);
                } 
                else {
                    // Geolocation unsuccessful, try again after delay
                    console.log("Attempt", attempt, "failed. Retrying...");
                    setTimeout(tryAgain, delay);
                }
            } 
            else {
                // Max attempts reached, notify the user
                console.error("Max attempts reached. Unable to retrieve geolocation.");
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'Unable to retrieve your location. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 3000,
                        classNames: notiicationClasses,
                    });
                    setLoading(false);
                    setConnectionLoading(false);
                }, 5000);
                //window.location.reload(); // reload page
            }
        }
        
        attempt = 0;
        tryAgain(); // Start the first attempt
    }

    const autoClockOutNotification = (
        <Alert
            variant="light"
            color="red"
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
                Your shift has ended and you will be automatically clocked out in {formatCountdownTime(autoClockOutSecondsRemaining)}
            </Text>
            <Text
                mt="sm"
                c="#dcdcdc"
                size="md"
                style={{ fontFamily: "AK-Medium" }}
            >
                Your manager will be notified if you do not clock out before the timer ends.
            </Text>
        </Alert>
    );

    const overtimeNotification = (
        <Alert
            variant="light"
            color="green"
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
                Your shift has ended and you are now working overtime.
            </Text>
        </Alert>
    );

    return (
        <>
            {teamMemberModalOpened && staffActivity && (
                <StaffStatusModal
                    modalOpened={teamMemberModalOpened}
                    isMobile={isMobile !== undefined ? isMobile : false} 
                    closeModal={closeTeamMemberModal}
                    staffData={staffActivity?.staff_activity}
                />
            )}
            {profileModalOpened && user && (
                <ProfileEditModal 
                    user={user}
                    modalOpened={profileModalOpened} 
                    isMobile={isMobile !== undefined ? isMobile : false} 
                    closeModal={closeProfileModal} 
                    formSubmitted={handleFormSubmitted}
                    //userProfileData={userProfileData}
                />
            )}
            {geolocationModalOpened && OLMap && userPosition && (
                <GeolocationModal
                    modalOpened={geolocationModalOpened}
                    isMobile={isMobile !== undefined ? isMobile : false} 
                    connectionLoading={loading}
                    closeModal={closeGeolocationModal}
                    submitClicked={handleGeolocationOnsiteClick}
                    refreshClicked={handleGeolocationClick}
                    handleMapLoaded={handleGeolocationMapLoaded}
                    olMap={OLMap}
                    userPosition={userPosition}
                    accuracyFeature={accuracyFeature}
                />
            )}

            {/* notifications */}
            {autoClockOutCounterEnabled && (userStatus?.status !== TimeStatus.CLOCKED_OUT && userStatus?.status !== TimeStatus.UNKNOWN ) && autoClockOutNotification}
            {overtimeCounterEnabled && (userStatus?.status !== TimeStatus.CLOCKED_OUT && userStatus?.status !== TimeStatus.UNKNOWN && userStatus?.status !== TimeStatus.OVERTIME_END) && overtimeNotification}

            <Grid c="#dcdcdc">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack>
                        {/* <Paper shadow="md" p="lg" radius="lg" style={{ background: "#161b26", width: "100%", color: "white" }}>
                            <Stack>
                                <Group>
                                    <Avatar color="gray" radius="40px" size="xl">MK</Avatar>
                                    <Title order={2}>tdev</Title>
                                </Group>
                                <Group>
                                    <IconUser />
                                    <Text size="xl" fw={600}>Tom dev</Text>
                                </Group>
                                <Group>
                                    <IconBriefcase2 />
                                    <Badge color="gray" variant="light" radius="md" size="xl">Crew Member</Badge>
                                </Group>
                                <Group>
                                    <IconCalendar />
                                    <Text size="lg" fw={600}>Joined April 2023</Text>
                                </Group>
                                <Button size="md" radius="md" variant="light" fullWidth onClick={openProfileModal}>
                                    <Title order={4}>My profile</Title>
                                </Button>
                            </Stack>
                        </Paper> */}

                        {/* activity controller left panel */}
                        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f", width: "100%", color: "#dcdcdc" }}>
                            <Stack>
                                <Stack gap="xs">
                                    <Text size="50px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }} ta="center">{getDayOfWeekFromInt(new Date().getDay())}</Text>
                                    <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }} ta="center">{dateToWords(new Date())}</Text>
                                </Stack>
                                <Space />

                                {/* countdown timer */}
                                <Stack align="center">
                                    <div className="container">
                                        <Image src={myImage} alt="PNG Image" className="png-image" />
                                        <Image src={myCenter} alt="Image" className="png-image-center"/>
                                        <div className="html-element">
                                            {overtimeCounterEnabled && (
                                                <RingProgress
                                                    size={260}
                                                    thickness={35}
                                                    sections={[
                                                        { 
                                                            value: (userStatus?.status === TimeStatus.CLOCKED_IN || userStatus?.status === TimeStatus.BREAK_START || userStatus?.status === TimeStatus.BREAK_END || userStatus?.status === TimeStatus.OVERTIME_START) ? overtimePercentageRemaining : 0, 
                                                            color: 'green', 
                                                            opacity: "80%" 
                                                        }
                                                    ]}
                                                    label={
                                                        <Center mb="sm">
                                                            <Text c="black" size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }} ta="center">
                                                                {(userStatus?.status === TimeStatus.CLOCKED_IN || userStatus?.status === TimeStatus.BREAK_START || userStatus?.status === TimeStatus.BREAK_END || userStatus?.status === TimeStatus.OVERTIME_START) && formatCountdownTime(overtimeSecondsRemaining)}
                                                                {(userStatus?.status === TimeStatus.CLOCKED_OUT || userStatus?.status === TimeStatus.UNKNOWN || userStatus?.status === TimeStatus.OVERTIME_END || user?.working_hours?.is_new_user) && "00:00"}
                                                            </Text>
                                                        </Center>
                                                    }
                                                />
                                            )}
                                            {autoClockOutCounterEnabled && (
                                                <RingProgress
                                                    size={260}
                                                    thickness={35}
                                                    sections={[
                                                        { 
                                                            value: (userStatus?.status === TimeStatus.CLOCKED_IN || userStatus?.status === TimeStatus.BREAK_START || userStatus?.status === TimeStatus.BREAK_END) ? autoClockOutPercentageRemaining : 0, 
                                                            color: '#ca4628', 
                                                            opacity: "80%" 
                                                        }
                                                    ]}
                                                    label={
                                                        <Center mb="sm">
                                                            <Text c="black" size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }} ta="center">
                                                                {(userStatus?.status === TimeStatus.CLOCKED_IN || userStatus?.status === TimeStatus.BREAK_START || userStatus?.status === TimeStatus.BREAK_END) && formatCountdownTime(autoClockOutSecondsRemaining)}
                                                                {(userStatus?.status === TimeStatus.CLOCKED_OUT || userStatus?.status === TimeStatus.UNKNOWN || userStatus?.status === TimeStatus.OVERTIME_END || user?.working_hours?.is_new_user) && "00:00"}
                                                            </Text>
                                                        </Center>
                                                    }
                                                />
                                            )}
                                            {!overtimeCounterEnabled && !autoClockOutCounterEnabled && (
                                                <RingProgress
                                                    size={260}
                                                    thickness={35}
                                                    sections={[
                                                        { 
                                                            value: (userStatus?.status === TimeStatus.CLOCKED_IN || userStatus?.status === TimeStatus.BREAK_START || userStatus?.status === TimeStatus.BREAK_END) ? percentageRemaining : 0, 
                                                            color: userStatus?.status === 3 ? '#d9b430' : 'green', 
                                                            opacity: "80%" 
                                                        }
                                                    ]}
                                                    label={
                                                        <Center mb="sm">
                                                            <Text c="black" size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }} ta="center">
                                                                {(userStatus?.status === TimeStatus.CLOCKED_IN || userStatus?.status === TimeStatus.BREAK_START || userStatus?.status === TimeStatus.BREAK_END) && formatCountdownTime(secondsRemaining)}
                                                                {(userStatus?.status === TimeStatus.CLOCKED_OUT || userStatus?.status === TimeStatus.UNKNOWN || userStatus?.status === TimeStatus.OVERTIME_END || userStatus?.status === undefined || user?.working_hours?.is_new_user) && "00:00"}
                                                            </Text>
                                                        </Center>
                                                    }
                                                />
                                            )}
                                            
                                        </div>
                                    </div>
                                    
                                </Stack>
                                <Grid>
                                    {/* STATUS == 2 or 4 == IN */}
                                    {(userStatus?.status === TimeStatus.CLOCKED_IN || userStatus?.status === TimeStatus.BREAK_END || userStatus?.status === TimeStatus.OVERTIME_START) && (
                                        <>
                                            <Grid.Col span={{ base: 6 }}>
                                                {/* break */}
                                                <Button 
                                                    color="#a3842a" 
                                                    fullWidth 
                                                    size="md" 
                                                    radius="md" 
                                                    style={{ height: "80px" }}
                                                    onClick={handleBreakStartClick}
                                                >
                                                    <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Break</Text>
                                                </Button>
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 6 }}>
                                                {/* clock out */}
                                                <Button.Group>
                                                    <Button 
                                                        color="rgba(110, 30, 30,1)" 
                                                        fullWidth 
                                                        size="md" 
                                                        radius="md" 
                                                        style={{ height: "80px" }}
                                                        onClick={handleClockOutClick}
                                                    >
                                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Out</Text>
                                                    </Button>
                                                    <Menu transitionProps={{ transition: 'pop' }} position="bottom-end" withinPortal>
                                                        <Menu.Target>
                                                            <ActionIcon
                                                                color="rgba(110, 30, 30,1)"
                                                                size={55}
                                                                //radius="md"
                                                                style={{ height: "80px", borderRadius: "0px 7px 7px 0px" }}
                                                            //className={classes.menuControl}
                                                            >
                                                                <IconChevronDown style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                                                            </ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item
                                                                leftSection={
                                                                    <IconLogout
                                                                        style={{ width: rem(16), height: rem(16) }}
                                                                        stroke={1.5}
                                                                    //color={theme.colors.blue[5]}
                                                                    />
                                                                }
                                                            >
                                                                <Title order={4}>End shift</Title>
                                                            </Menu.Item>
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                </Button.Group>
                                            </Grid.Col>
                                        </>
                                    )}

                                    {/* STATUS == (1 or 5 == OUT or N/A) */}
                                    {(userStatus?.status === TimeStatus.CLOCKED_OUT || userStatus?.status === TimeStatus.UNKNOWN || userStatus?.status === TimeStatus.OVERTIME_END || userStatus?.status === undefined || user?.working_hours?.is_new_user) && (
                                        <Grid.Col span={{ base: 12 }}>
                                            <Button 
                                                id="clock-in-btn"
                                                fullWidth 
                                                color="#356d1a" 
                                                size="md" 
                                                radius="md" 
                                                disabled={user?.working_hours?.is_new_user ? true : false}
                                                style={{ height: "80px" }} 
                                                onClick={handleClockInClick}
                                            >
                                                <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>
                                                    {loading && <Loader/>}
                                                    {!loading && "Clock in"} 
                                                </Text>
                                            </Button>
                                        </Grid.Col>
                                    )}

                                    {/* STATUS == 3 == BREAK */}
                                    {userStatus?.status === TimeStatus.BREAK_START && (
                                        <>
                                            <Grid.Col span={{ base: 12 }}>
                                                {/* break */}
                                                <Button 
                                                    color="#a3842a" 
                                                    fullWidth 
                                                    size="md" 
                                                    radius="md" 
                                                    style={{ height: "80px" }}
                                                    onClick={handleBreakEndClick}
                                                >
                                                    <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>End break</Text>
                                                </Button>
                                            </Grid.Col>
                                            {/* <Grid.Col span={{ base: 6 }}>
                                                <Button.Group>
                                                    <Button 
                                                        color="rgba(110, 30, 30,1)" 
                                                        fullWidth 
                                                        size="md" 
                                                        radius="md" 
                                                        style={{ height: "80px" }}
                                                        onClick={handleClockOutClick}
                                                    >
                                                        <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Out</Text>
                                                    </Button>
                                                    <Menu transitionProps={{ transition: 'pop' }} position="bottom-end" withinPortal>
                                                        <Menu.Target>
                                                            <ActionIcon
                                                                color="rgba(110, 30, 30,1)"
                                                                size={55}
                                                                //radius="md"
                                                                style={{ height: "80px", borderRadius: "0px 7px 7px 0px" }}
                                                            //className={classes.menuControl}
                                                            >
                                                                <IconChevronDown style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                                                            </ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item
                                                                leftSection={
                                                                    <IconLogout
                                                                        style={{ width: rem(16), height: rem(16) }}
                                                                        stroke={1.5}
                                                                    //color={theme.colors.blue[5]}
                                                                    />
                                                                }
                                                            >
                                                                <Title order={4}>End shift</Title>
                                                            </Menu.Item>
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                </Button.Group>
                                            </Grid.Col> */}
                                        </>
                                    )}
                                </Grid>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack>

                        {/* team status */}
                        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f", color: "#dcdcdc" }}>
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    {currentTimeHours < 12 && (
                                        <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>👋 Good morning</Text>
                                    )}
                                    {currentTimeHours >= 12 && currentTimeHours < 17 && (
                                        <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>👋 Good afternoon</Text>
                                    )}
                                    {currentTimeHours >= 17 && (
                                        <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>👋 Good evening</Text>
                                    )}
                                </Grid.Col>
                                {/* <Grid.Col span={{ base: 12, md: 6 }}>
                                    <Badge size="55px" radius="md" color="rgba(24,28,38,0.3)" p="lg" pb="lg">
                                        <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px", color: "#dcdcdc" }}>{currentTimeFormatted}</Text>
                                    </Badge>
                                </Grid.Col> */}
                                <Grid.Col span={{ base: 12 }}>
                                    <Tabs value={activeTab} onChange={setActiveTab} variant="pills" color="rgba(24,28,38,0.5)" radius="md">
                                        {isManager && (
                                            <Tabs.List style={{ color: "#dcdcdc" }}>
                                                <Tabs.Tab value="staff" p="md" classNames={classes}>
                                                    <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Staff employees</Text>
                                                </Tabs.Tab>
                                                <Tabs.Tab value="user" p="md" classNames={classes}>
                                                    <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Users</Text>
                                                </Tabs.Tab>
                                            </Tabs.List>
                                        )}

                                        <Tabs.Panel value="staff">
                                            <TeamStatus 
                                                type="STAFF" 
                                                staffData={staffActivity} 
                                                currentTime={currentTimeFormatted}
                                            />
                                        </Tabs.Panel>
                                        <Tabs.Panel value="user">
                                            <></>
                                            {/* <TeamStatus type="USER" teamMemberData={userActivity} /> */}
                                        </Tabs.Panel>
                                    </Tabs>
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        {/* activity timelime */}
                        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f" }}>
                            <Grid>
                                <Grid.Col span={{ base: 12 }}>
                                    {/* TODO: SORT BY DESCENDING (show newest activity first, then oldest (first in the day)) */}
                                    <Text
                                        size={isMobile ? "30px" : "35px"}
                                        fw={600}
                                        //ta="center" 
                                        style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                                    >
                                        {new Date().toDateString()} activity
                                    </Text>
                                </Grid.Col>
                                <Grid.Col span={{ base: 12 }}>
                                    <Stack gap="lg">
                                    {loading && (
                                        <Group justify="center" mt="lg">
                                            <Loader color="cyan" />
                                        </Group>
                                    )}
                                    {staffActivityLog && !loading && activityLogsSorted.length < 1 && (
                                        <ScrollArea h={500}>
                                            <ActivityTimeline activityLogData={staffActivityLog}/>
                                        </ScrollArea>
                                    )}
                                    {activityLogsSorted.length > 0 && !loading && (
                                        <ScrollArea h={800}>
                                            <ActivityTimeline activityLogData={activityLogsSorted}/>
                                        </ScrollArea>
                                    )}
                                    </Stack>
                                </Grid.Col>
                                {/* <Grid.Col span={{ base: 12, sm: 5}}>
                                <Stack>
                                    <Button size="md" radius="md" style={{ height: "100px" }}>
                                        Clock in
                                    </Button>
                                    <Button size="md" radius="md" style={{ height: "100px" }}>
                                        Go on break
                                    </Button>
                                    <Button size="md" radius="md" style={{ height: "100px" }}>
                                        Clock out
                                    </Button>
                                </Stack>
                            </Grid.Col> */}
                            </Grid>
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>
        </>
    );
}