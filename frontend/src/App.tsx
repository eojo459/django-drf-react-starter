import './App.css';

// fonts
import './fonts/AkcelerAalt-Bold.ttf';
import './fonts/AkcelerAalt-Medium.ttf';
import './fonts/AkcelerAalt.ttf';

import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';

import { Routes, Route, BrowserRouter, useNavigate, Router } from "react-router-dom";
import { AuthProvider } from "./authentication/AuthContext";
import BusinessOwnerRegistrationForm from './pages/owner-dashboard/business/owner/owner-registration';
import BusinessRegistrationFormOld from './pages/owner-dashboard/business/business-registration';
import OwnerDataGridDisplay from './pages/owner-dashboard/business/owner/owner-list';
import StaffRegistrationForm from './pages/owner-dashboard/staff/staff-registration';
import { useEffect, useState } from 'react';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { useDisclosure } from '@mantine/hooks';
import { ActionIcon, AppShell, Burger, Divider, Group, Skeleton, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import {
  IconBellRinging,
  IconFingerprint,
  IconKey,
  IconSettings,
  Icon2fa,
  IconDatabaseImport,
  IconReceipt2,
  IconSwitchHorizontal,
  IconLogout,
  IconSun,
  IconMoon,
  IconHome,
  IconUser,
  IconEye,
  IconBuilding,
  IconList,
  IconCalendar,
  IconCalendarUser,
} from '@tabler/icons-react';
import classes from './css/Navbar.module.css';
import { SettingsPage } from './pages/owner-dashboard/business/settings/settings';
import StaffHomePage from './pages/staff-dashboard/staff-main';
import RegisterPage from './pages/main/register-page';
import AdminRoute from './authentication/AdminRoute';
import StaffRoute from './authentication/StaffRoute';
import OwnerRoute from './authentication/OwnerRoute';
import ParentRoute from './authentication/ParentRoute';
import Header from './components/Header';
import HeaderHomePage from './components/Header';
import { ChangesProvider } from './context/ChangesContext';
import { GlobalStateProvider } from './context/GlobalStateContext';
import GroupManager from './pages/owner-dashboard/business/components/GroupManager';
import BusinessManagement from './pages/owner-dashboard/business/Business-Management';
import StaffDashboard from './pages/staff-dashboard/staff-main';
import Timesheet from './pages/staff-dashboard/timesheet';
import TimesheetList from './pages/staff-dashboard/timesheet-list';
import TimesheetInbox from './pages/owner-dashboard/TimesheetInbox';
import AuthRoute from './authentication/AuthRoute';
import ProfilePage from './pages/main/ProfilePage';
import AccordionRegistrationForm from './components/AccordionRegistrationForm';
import { DoubleNavbar } from './components/SidebarNavbar';
import PinLogin from './components/PinLogin';
import ForgotPassword from './components/ForgotPasswordCard';
import ResetPassword from './components/ResetPasswordCard';
import VerifyEmail from './components/VerifyEmailCard';
import { SupabaseAuthProvider } from './authentication/SupabaseAuthContext';
import LogoutCard from './components/LogoutCard';
import { Footer } from './components/Footer';
import { SimpleHeader } from './components/SimpleHeader';
import { NavigationProvider } from './context/NavigationContext';
import { PrivacyPolicy } from './pages/main/PrivacyPolicy';
import { TermsConditions } from './pages/main/TermsConditions';
import { PricingDetailed } from './pages/main/PricingDetailed';
import { ContactUs } from './pages/main/ContactUs';
import LoginPage from './pages/main/LoginPage';
import Dashboard from './pages/main/Dashboard';
import { StaffAttendance } from './pages/owner-dashboard/staff/StaffAttendance';
import MainHomePage from './pages/main/Main';
import { SupabaseContextProvider } from './authentication/SupabaseContext';
import SubscriptionSuccessCard from './components/SubscriptionSuccessCard';

// sidebar pages
const data = [
  { link: '/dashboard', label: 'Dashboard', group: 'admin', icon: IconHome },
  { link: '/settings', label: 'Settings', group: 'admin', icon: IconSettings },
]

const adminData = [
  { link: '/register/owner', label: 'Register Owner', group: 'admin', icon: IconUser },
  { link: '/owner/list', label: 'View Owners', group: 'admin', icon: IconEye },
  { link: '/register/business', label: 'Register Business', group: 'admin', icon: IconBuilding },
  { link: '/business/list', label: 'View Businesses', group: 'admin', icon: IconList },
]

const staffData = [
  { link: '/register/staff', label: 'Register Staff', group: 'staff', icon: IconUser },
  { link: '/staff/list', label: 'View Staff', group: 'staff', icon: IconList },
  { link: '/attendance/staff', label: 'View Staff Attendance', group: 'staff', icon: IconCalendarUser },
];

const childData = [
  { link: '/register/person', label: 'Register User', group: 'child', icon: IconUser },
  { link: '/person/list', label: 'View Users', group: 'child', icon: IconList },
  { link: '/attendance/person', label: 'View User Attendance', group: 'child', icon: IconCalendarUser },
  { link: '/parent/list', label: 'View Parents', group: 'child', icon: IconList },
]

function App() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
  const [active, setActive] = useState('Billing');
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  // useEffect to apply the dynamic body background color
  useEffect(() => {
    const body = document.body;
    // body.style.backgroundColor = (computedColorScheme === 'light' ? '#fff' : '#0c0f17');
    body.style.backgroundColor = (computedColorScheme === 'light' ? '#182420' : '#182420');
  }, [computedColorScheme]);

  return (
    <>
      <SupabaseContextProvider>
        <SupabaseAuthProvider>
          <NavigationProvider>
            <SimpleHeader />
            <main style={{ paddingBottom: "100px", fontFamily: "AK-Regular", minHeight: "100vh" }}>
              <GlobalStateProvider>
                <ChangesProvider>

                  {/* <HeaderHomePage/> */}
                  <Routes>
                    {/* GENERAL MAIN PAGES */}
                    <Route index element={<MainHomePage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="invite" element={<RegisterPage initialState={1} />} />
                    <Route path="pinlogin" element={<PinLogin />} />
                    <Route path="forgot" element={<ForgotPassword />} />
                    <Route path="reset" element={<ResetPassword />} />
                    <Route path="verify" element={<VerifyEmail />} />
                    <Route path="logout" element={<LogoutCard />} />
                    <Route path="privacy" element={<PrivacyPolicy />} />
                    <Route path="terms-of-service" element={<TermsConditions />} />
                    <Route path="pricing" element={<PricingDetailed />} />
                    <Route path="contact" element={<ContactUs />} />
                    <Route path="success" element={<SubscriptionSuccessCard />} />

                    {/* AUTH ROUTES -- MUST BE SIGNED IN */}
                    <Route element={<AuthRoute />}>

                      {/* AUTH DASHBOARD */}
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="user/:uid" element={<ProfilePage />} />

                      {/* OWNER ROUTES */}
                      <Route element={<OwnerRoute />}>

                        {/* SETTINGS */}
                        <Route path="settings" element={<SettingsPage />} />

                        {/* MANAGEMENT */}
                        <Route path="business/group-manager" element={<GroupManager />} />
                        <Route path="business/centre-manager" element={<BusinessManagement />} />

                        {/* INBOX */}
                        <Route path="timesheet/inbox" element={<TimesheetInbox />} />
                      </Route>

                      {/* STAFF ROUTES */}
                      <Route element={<StaffRoute />}>
                        <Route path="staff-dashboard" element={<StaffDashboard />} />
                        {/* <Route path="timesheet" element={<Timesheet/>} /> */}
                        {/* <Route path="timesheet/list" element={<TimesheetList/>} /> */}
                      </Route>

                    </Route>

                    {/* PARENT ROUTES */}
                    {/* <Route element={<ParentRoute/>}>
                  <Route path="parent-dashboard" element={<StaffHomePage/>} />
                </Route> */}
                  </Routes>
                </ChangesProvider>
              </GlobalStateProvider>
            </main>
            <Footer />
          </NavigationProvider>
        </SupabaseAuthProvider>
      </SupabaseContextProvider>
    </>
  );
}

export default App;
