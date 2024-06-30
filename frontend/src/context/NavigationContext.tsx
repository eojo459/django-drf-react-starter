import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { ownerLinks, staffLinks } from '../components/SimpleHeader';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { GetStaffNotificationMessages } from '../helpers/Api';
import { useSupabase } from '../authentication/SupabaseContext';

// Define the type for the context
type NavigationContextType = {
    active: string;
    homebasePanelActive: boolean;
    profilePanelActive: boolean;
    clockInPanelActive: boolean;
    settingsPanelActive: boolean;
    registrationPanelActive: boolean;
    managementPanelActive: boolean;
    inboxPanelActive: boolean;
    homePanelActive: boolean;
    timesheetsPanelActive: boolean;
    timesheetListPanelActive: boolean;
    groupsPanelActive: boolean;
    attendancePanelActive: boolean;
    reportPanelActive: boolean;
    notificationMessages: boolean;
    setActive: React.Dispatch<React.SetStateAction<string>>;
    setHomebasePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setProfilePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setClockInPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setSettingsPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setGroupsPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setRegistrationPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setManagementPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setInboxPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setHomePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setTimesheetsPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setAttendancePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setReportPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setTimesheetListPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
    setNotificationMessages: React.Dispatch<React.SetStateAction<boolean>>;
    getNotifications: () => void;
};

// Create the context
const NavigationContext = createContext<NavigationContextType>({
    active: "",
    homebasePanelActive: false,
    profilePanelActive: false,
    clockInPanelActive: false,
    settingsPanelActive: false,
    registrationPanelActive: false,
    managementPanelActive: false,
    inboxPanelActive: false,
    homePanelActive: false,
    timesheetsPanelActive: false,
    timesheetListPanelActive: false,
    groupsPanelActive: false,
    attendancePanelActive: false,
    reportPanelActive: false,
    notificationMessages: false,
    setActive: () => { },
    setHomebasePanelActive:() => { },
    setProfilePanelActive: () => { },
    setClockInPanelActive: () => { },
    setSettingsPanelActive: () => { },
    setGroupsPanelActive: () => { },
    setRegistrationPanelActive: () => { },
    setManagementPanelActive: () => { },
    setInboxPanelActive: () => { },
    setHomePanelActive: () => { },
    setTimesheetsPanelActive: () => { },
    setAttendancePanelActive: () => { },
    setReportPanelActive: () => { },
    setTimesheetListPanelActive: () => { },
    setNotificationMessages: () => {},
    getNotifications: () => {},
});

// Create a provider component
export const NavigationProvider = ({ children }: any) => {
    const { user, session, fetchAuthData } = useAuth();
    const { isManager } = useSupabase();
    const [active, setActive] = useState(user?.role == "OWNER" || user?.role == "STAFF" ? user?.role == "OWNER" ? ownerLinks[0].link : staffLinks[0].link : '');
    const [profilePanelActive, setProfilePanelActive] = useState(false);
    // const [clockInPanelActive, setClockInPanelActive] = useState(user?.role == "STAFF" ? true : false);
    const [clockInPanelActive, setClockInPanelActive] = useState(false);
    const [settingsPanelActive, setSettingsPanelActive] = useState(false);
    const [groupsPanelActive, setGroupsPanelActive] = useState(false);
    const [timesheetsPanelActive, setTimesheetsPanelActive] = useState(false);
    const [timesheetListPanelActive, setTimesheetListPanelActive] = useState(false);
    const [registrationPanelActive, setRegistrationPanelActive] = useState(false);
    //const [homePanelActive, setHomePanelActive] = useState(user?.role == "OWNER" ? true : false);
    const [homePanelActive, setHomePanelActive] = useState(false);
    const [homebasePanelActive, setHomebasePanelActive] = useState(false);
    const [managementPanelActive, setManagementPanelActive] = useState(false);
    const [inboxPanelActive, setInboxPanelActive] = useState(false);
    const [attendancePanelActive, setAttendancePanelActive] = useState(false);
    const [reportPanelActive, setReportPanelActive] = useState(false);
    const [url, setUrl] = useState(window.location.href);
    const navigate = useNavigate();
    const [notificationMessages, setNotificationMessages] = useState(false);
    //const [loading, setLoading] = useState(false);

    // run when active page changes
    useEffect(() => {
        // TODO: when the navigation panels are clicked, make sure you are on the dashboard page first
        setUrl(window.location.href);
        fetchAuthData();
        console.log(url);
        console.log(active);
        var page = checkUrl();
        // if (page !== "dashboard") {
        //     navigate("/dashboard");
        // }

        switch (active) {
            case "homebase":
                setHomebasePanelActive(true);
                setHomePanelActive(false);
                setInboxPanelActive(false);
                setManagementPanelActive(false);
                setRegistrationPanelActive(false);
                setProfilePanelActive(false);
                setClockInPanelActive(false);
                setSettingsPanelActive(false);
                setGroupsPanelActive(false);
                setTimesheetsPanelActive(false);
                setTimesheetListPanelActive(false);
                setAttendancePanelActive(false);
                setReportPanelActive(false);
                // if (page != "/dashboard") {
                //     navigate("/dashboard");
                // }
                break;
            case "home":
                setHomePanelActive(true);
                setHomebasePanelActive(false);
                setInboxPanelActive(false);
                setManagementPanelActive(false);
                setRegistrationPanelActive(false);
                setProfilePanelActive(false);
                setClockInPanelActive(false);
                setSettingsPanelActive(false);
                setGroupsPanelActive(false);
                setTimesheetsPanelActive(false);
                setTimesheetListPanelActive(false);
                setAttendancePanelActive(false);
                setReportPanelActive(false);
                // if (page != "/dashboard") {
                //     navigate("/dashboard");
                // }
                break;
            case "registration":
                if (isManager) {
                    setRegistrationPanelActive(true);
                    setHomebasePanelActive(false);
                    setProfilePanelActive(false);
                    setClockInPanelActive(false);
                    setSettingsPanelActive(false);
                    setGroupsPanelActive(false);
                    setTimesheetsPanelActive(false);
                    setTimesheetListPanelActive(false);
                    setManagementPanelActive(false);
                    setInboxPanelActive(false);
                    setHomePanelActive(false);
                    setAttendancePanelActive(false);
                    setReportPanelActive(false);
                }
                break;
            case "attendance":
                if (isManager) {
                    setAttendancePanelActive(true);
                    setHomebasePanelActive(false);
                    setRegistrationPanelActive(false);
                    setProfilePanelActive(false);
                    setClockInPanelActive(false);
                    setSettingsPanelActive(false);
                    setGroupsPanelActive(false);
                    setTimesheetsPanelActive(false);
                    setTimesheetListPanelActive(false);
                    setManagementPanelActive(false);
                    setInboxPanelActive(false);
                    setHomePanelActive(false);
                    setReportPanelActive(false);
                }
                break;
            case "management":
                if (isManager) {
                    setManagementPanelActive(true);
                    setHomebasePanelActive(false);
                    setRegistrationPanelActive(false);
                    setProfilePanelActive(false);
                    setClockInPanelActive(false);
                    setSettingsPanelActive(false);
                    setGroupsPanelActive(false);
                    setTimesheetsPanelActive(false);
                    setTimesheetListPanelActive(false);
                    setInboxPanelActive(false);
                    setHomePanelActive(false);
                    setAttendancePanelActive(false);
                    setReportPanelActive(false);
                }
                break;
            case "inbox":
                if (isManager) {
                    setInboxPanelActive(true);
                    setHomebasePanelActive(false);
                    setManagementPanelActive(false);
                    setRegistrationPanelActive(false);
                    setProfilePanelActive(false);
                    setClockInPanelActive(false);
                    setSettingsPanelActive(false);
                    setGroupsPanelActive(false);
                    setTimesheetsPanelActive(false);
                    setTimesheetListPanelActive(false);
                    setHomePanelActive(false);
                    setAttendancePanelActive(false);
                    setReportPanelActive(false);
                }
                break;
            case "settings":
                setSettingsPanelActive(true);
                setHomebasePanelActive(false);
                setProfilePanelActive(false);
                setClockInPanelActive(false);
                setGroupsPanelActive(false);
                setTimesheetsPanelActive(false);
                setTimesheetListPanelActive(false);
                setRegistrationPanelActive(false);
                setManagementPanelActive(false);
                setInboxPanelActive(false);
                setHomePanelActive(false);
                setAttendancePanelActive(false);
                setReportPanelActive(false);
                break;
            case "report":
                if (isManager) {
                    setReportPanelActive(true);
                    setHomebasePanelActive(false);
                    setInboxPanelActive(false);
                    setManagementPanelActive(false);
                    setRegistrationPanelActive(false);
                    setProfilePanelActive(false);
                    setClockInPanelActive(false);
                    setSettingsPanelActive(false);
                    setGroupsPanelActive(false);
                    setTimesheetsPanelActive(false);
                    setTimesheetListPanelActive(false);
                    setHomePanelActive(false);
                    setAttendancePanelActive(false);
                }
                break;
            case "clockin":
                setClockInPanelActive(true);
                setHomebasePanelActive(false);
                setReportPanelActive(false);
                setInboxPanelActive(false);
                setManagementPanelActive(false);
                setRegistrationPanelActive(false);
                setProfilePanelActive(false);
                setSettingsPanelActive(false);
                setGroupsPanelActive(false);
                setTimesheetsPanelActive(false);
                setTimesheetListPanelActive(false);
                setHomePanelActive(false);
                setAttendancePanelActive(false);
                break;
            case "timesheetInbox":
                setTimesheetsPanelActive(true);
                setTimesheetListPanelActive(false);
                setHomebasePanelActive(false);
                setClockInPanelActive(false);
                setReportPanelActive(false);
                setInboxPanelActive(false);
                setManagementPanelActive(false);
                setRegistrationPanelActive(false);
                setProfilePanelActive(false);
                setSettingsPanelActive(false);
                setGroupsPanelActive(false);
                setHomePanelActive(false);
                setAttendancePanelActive(false);
                break;
            case "":
                setHomebasePanelActive(false);
                setHomePanelActive(false);
                setInboxPanelActive(false);
                setManagementPanelActive(false);
                setRegistrationPanelActive(false);
                setProfilePanelActive(false);
                setClockInPanelActive(false);
                setSettingsPanelActive(false);
                setGroupsPanelActive(false);
                setTimesheetsPanelActive(false);
                setTimesheetListPanelActive(false);
                setAttendancePanelActive(false);
                setReportPanelActive(false);
                break;
            default:
                break;
        }

        // get notifications
        getNotifications();
    }, [active]);

    function checkUrl() {
        const myUrl = new URL(url);
        const path = myUrl.pathname;
        console.log(path);
        return path.split('/')[1];
    }
    
    // Your state or any other logic for the context
    const handleNewChanges = (changes: boolean) => {
        // Your implementation here
        console.log('Handling changes:', changes);
    };

    async function getNotifications() {
        if (user) {
            var notifications = await GetStaffNotificationMessages(user?.uid, session?.access_token);
            if (notifications?.length > 0) {
                setNotificationMessages(true);
                return true;
            }
        }
        return false;
    }

    // Provide the context value
    const contextValue: NavigationContextType = {
        active,
        homebasePanelActive,
        profilePanelActive,
        clockInPanelActive,
        settingsPanelActive,
        registrationPanelActive,
        managementPanelActive,
        inboxPanelActive,
        groupsPanelActive,
        timesheetsPanelActive,
        timesheetListPanelActive,
        homePanelActive,
        attendancePanelActive,
        reportPanelActive,
        notificationMessages: notificationMessages,
        setActive,
        setHomebasePanelActive,
        setProfilePanelActive,
        setClockInPanelActive,
        setGroupsPanelActive,
        setHomePanelActive,
        setSettingsPanelActive,
        setRegistrationPanelActive,
        setManagementPanelActive,
        setInboxPanelActive,
        setTimesheetsPanelActive,
        setTimesheetListPanelActive,
        setAttendancePanelActive,
        setReportPanelActive,
        setNotificationMessages: setNotificationMessages,
        getNotifications,
    };

    return (
        <NavigationContext.Provider value={contextValue}>
            {children}
        </NavigationContext.Provider>
    );
};

// Create a custom hook for accessing the context
export const useNavigationContext = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useChangesContext must be used within a ChangesProvider');
    }
    return context;
};
