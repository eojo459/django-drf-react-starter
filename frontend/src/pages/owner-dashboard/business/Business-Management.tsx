import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../authentication/AuthContext";
import { Button, Container, Grid, Group, Paper, Select, Stack, Tabs, Title, Text, Collapse, Space, rem, Badge } from "@mantine/core";
import GroupManager from "./components/GroupManager";
import CentreInformation, { BusinessProfile } from "./components/CentreInformation";
import { useGlobalState } from "../../../context/GlobalStateContext";
import { DeleteBusinessById, DeleteUserByUid, GetBusinessById, GetBusinessInfoForUserByUid, GetChildRelationshipByBusinessId, GetEmploymentPositionsByBusinessId, GetHolidayApiData, GetPayrollInformation, GetStaffRelationshipByBusinessId, GetUnassignedUsersByBusinessId, PatchBusinessById, PatchEmploymentPositions, PostQrcodeInviteLink, PatchUnassignedUserRelationship, PostUnassignedUsers, PutPayrollInformationById, PatchUnassignedStaffRelationship, PatchBusinessHours, GetQrcodeInviteLink, getBusinessProfilePlanByName, getBusinessOwnerPlanByName, getBusinessProfilePlanById, getBusinessOwnerPlanById, getBusinessByOwnerId, EmailNewBusinessOwners } from "../../../helpers/Api";
import { MembersTable } from "./components/CentreMembersTable";
import CentreSettings from "./components/CentreSettings";
import { PeopleDirectoryTable } from "../../../components/PeopleDirectoryTable";
import { useAuth } from "../../../authentication/SupabaseAuthContext";
import classes from "../../../css/TextInput.module.css";
import { randomId, useDisclosure, useMediaQuery } from "@mantine/hooks";
import { EmployeeDirectoryTable } from "../../../components/EmployeeDirectoryTable";
import { UserDirectoryTable } from "../../../components/UserDirectoryTable";
import { UnassignedUsersDirectoryTable } from "../../../components/UnassignedUsersDirectoryTable";
import { UnassignedEmployeesDirectoryTable } from "../../../components/UnassignedEmployeesDirectoryTable";
import BusinessPayrollForm from "../../../components/forms/BusinessPayrollForm";
import BusinessStaffCustomizationForm from "../../../components/forms/BusinessStaffCustomizationForm";
import { IconCheck, IconChevronDown, IconChevronUp, IconX } from "@tabler/icons-react";
import DeleteBusinessConfirmModal from "../../../components/DeleteBusinessConfirmModal";
import CentreInviteCode from "./components/CentreInviteCode";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../../../css/Notifications.module.css";
import { useForm } from "@mantine/form";
import { supabase, useSupabase } from "../../../authentication/SupabaseContext";
import { GenerateNullUUID, businessListFormat, getCurrentTimezoneOffset } from "../../../helpers/Helpers";
import { FileDownload } from "../../../helpers/Download";
import SelectedWorkingHours from "../../../components/SelectedWorkingHours";
import { UserProfleBusinessInfo } from "../../../components/UserProfile";
import { ProgressCard } from "../../../components/ProgressCard";

// supabase storage - 
export const supabaseUrl = "https://cmkoomcgbmueihzpvtck.supabase.co/storage/v1/object/public/qr_codes/";

export interface PositionRoles {
    coowner_labels: any[];
    manager_labels: any[];
    fulltime_labels: any[];
    parttime_labels: any[];
    term_labels: any[];
    contractor_labels: any[];
    freelancer_labels: any[];
    student_labels: any[];
    max_labels: number;
}

export interface Holiday {
    id: string;
    name: string;
    date: string;
    country_code: string;
    global_holiday: boolean;
    counties: string[];
}

export interface PayrollInformation {
    id: string;
    business_id: string;
    overtime: boolean;
    overtime_rate: 1.5;
    overtime_max_duration: number;
    holiday: boolean;
    holiday_rate: number;
    holidays: Holiday[];
    vacation: boolean;
    vacation_rate: number;
    vacation_days_accrual_period: number;
    vacation_days_gained_per_accrual: number;
    sick_leave: boolean;
    sick_leave_rate: number;
    sick_leave_days_accrual_period: number;
    sick_leave_gained_per_accrual: number;
    federal_tax: number;
    province_tax: number;
    employment_insurance: number;
    canada_pension_plan: number;
    rrsp_contribution: number;
    tfsa_contribution: number;
    country_code: string;
}

export interface PayrollInformationForm {
    business_payroll_info: PayrollInformation;
    section: 'business_payroll_info';
}

export interface BusinessInformation {
    business_id: string;
    name: string;
    street: string;
    street_2: string;
    city: string;
    province: string;
    country: string;
    postal_code: string;
    contact_number: string;
    industry: string;
    business_owner: string;
    location_id: string;
    strict_mode: boolean;
    gps_geolocation: boolean;
    review_approve_edits: boolean;
    report_frequency: string;
    staff_limit_reached: boolean;
    user_limit_reached: boolean;
    auto_clocked_out_email: boolean;
    auto_clock_out_max_duration: number;
    overtime_max_duration: number;
    plan_id: string;
    notes: string;
    lon: number;
    lat: number;
    employee_count: string;
    //timezone: "",
    selected_weekdays: string[], // foreach create a new record in business schedule
    selected_weekends: string[],
    hours_of_operation: any,
}

export interface BusinessContactInfoForm {
    street: string;
    street_2: string;
    city: string;
    province: string;
    country: string;
    country_code: string;
    postal_code: string;
    contact_number: string;
    email: string;
    lon: number;
    lat: number;
    timezone: string;
}

export interface BusinessSettings {
    strict_mode: boolean;
    review_approve_edits: boolean;
    gps_geolocation: boolean;
    report_frequency: string;
    auto_clocked_out_email: boolean;
    auto_clock_out_max_duration: number;
    submitted_timesheet_email: boolean;
}

export interface BusinessWorkingHours {
    id: string;
    business_id: string;
    monday_start: string;
    monday_end: string;
    tuesday_start: string;
    tuesday_end: string;
    wednesday_start: string;
    wednesday_end: string;
    thursday_start: string;
    thursday_end: string;
    friday_start: string;
    friday_end: string;
    saturday_start: string;
    saturday_end: string;
    sunday_start: string;
    sunday_end: string;
}

export interface ISelectedDayOfWeek {
    label: string;
    checked: boolean;
    key: string;
}

// interface for business management data
export interface BusinessManagementFormData {
    business_info: BusinessInformation;
    business_settings: BusinessSettings;
    staff_data: any;
    user_data: any;
    unassigned_staffs_data: any;
    unassigned_users_data: any;
    payroll_info: PayrollInformation;
    employment_positions: PositionRoles;
    working_hours: BusinessWorkingHours;
    selected_weekdays?: ISelectedDayOfWeek;
    selected_weekends?: ISelectedDayOfWeek;
}

export interface StaffRowData {
    uid: string;
    name: string;
    email: string;
    position: string;
}

export interface ParentRowData {
    uid: string;
    name: string;
    email: string;
}

export interface UserRowData {
    uid: string;
    name: string;
    email: string;
    parent_uid: string;
    parent_name: string;
    parent_email: string;
}

export interface MyBusinessData {
    value: string; // business id
    label: string; // business name
    owner_uid: string;
    lon: number;
    lat: number;
}

// generate the holidays
export async function GenerateHolidays(countryCode: string) {
    // show notification
    const id = notifications.show({
        loading: true,
        title: 'Connecting to the server',
        message: 'Please wait.',
        autoClose: false,
        withCloseButton: false,
        classNames: notiicationClasses,
    });

    // get holidays from api
    var response = await GetHolidayApiData(countryCode);
    if (response) {
        var holidayList: Holiday[] = [];
        var globalHolidayList: Holiday[] = [];
        response.forEach((holiday: any) => {
            // format the data 
            var holidayData: Holiday = {
                'id': GenerateNullUUID(),
                'date': holiday?.date,
                'name': holiday?.name,
                'country_code': holiday?.countryCode,
                'global_holiday': holiday?.global,
                'counties': holiday?.counties,
            }
            holidayList.push(holidayData);

            if (holiday?.global) {
                // add to global holidays
                globalHolidayList.push(holidayData);
            }
        });

        // show success
        setTimeout(() => {
            notifications.update({
                id,
                color: 'teal',
                title: 'Success',
                message: 'Holidays were successfully generated.',
                icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                loading: false,
                autoClose: 1000,
                classNames: notiicationClasses,
            });
        }, 500);
        //fetchData();
        return globalHolidayList;
    }
    else {
        // show error
        setTimeout(() => {
            notifications.update({
                id,
                color: 'red',
                title: 'Error',
                message: 'There was an error generating the holidays. Please try again.',
                icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                loading: false,
                autoClose: 1500,
                classNames: notiicationClasses,
            });
        }, 500);
    }
}

export default function BusinessManagement() {
    const { user, business, businessList, setBusiness, session, fetchAuthData } = useAuth();
    const { generateRecoveryEmail } = useSupabase();
    const [businessData, setBusinessData] = useState<BusinessProfile>();
    const { businessUid: businessIdGlobal } = useGlobalState();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [tabWidth, setTabWidth] = useState('');
    const [multipleBusinesses, setMultipleBusinesses] = useState(true);
    const [usersEnabled, setUsersEnabled] = useState(false);
    const [unassignedUsersEnabled, setUnassignedUsersEnabled] = useState(true);
    const [unassignedEmployeesEnabled, setUnassignedEmployeesEnabled] = useState(true);
    const [payrollOpened, { toggle: openPayroll }] = useDisclosure(false);
    const [positionOpened, { toggle: openPosition }] = useDisclosure(false);
    const [businessHoursOpened, { toggle: openBusinessHours }] = useDisclosure(false);
    const [deleteBusinessOpened, { toggle: openDeleteBusiness }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [deleteCentreModalOpened, { open: openDeleteCentreModal, close: closeDeleteCentreModal }] = useDisclosure(false);
    const [qrCodeData, setQRCodeData] = useState<any[] | null>(null);
    const [employmentPositionData, setEmploymentPositionData] = useState<PositionRoles[]>([]);
    const [showCreateQrCodeButton, setShowCreateQrCodeButton] = useState(false);
    const [payrollData, setPayrollData] = useState<PayrollInformation | undefined>();
    const [businessCountryCode, setBusinessCountryCode] = useState('');
    const [staffData, setStaffData] = useState<StaffRowData[]>([]);
    const [userData, setUserData] = useState<UserRowData[]>([]);
    const [unassignedStaffData, setUnassignedStaffData] = useState<StaffRowData[]>([]);
    const [unassignedUserData, setUnassignedUserData] = useState<UserRowData[]>([]);
    const [myBusinessData, setMyBusinessData] = useState<MyBusinessData[]>([]);
    const [inviteCode, setInviteCode] = useState('');
    const [inviteCodeUrl, setInviteCodeUrl] = useState('');
    const [selectedWeekdays, setSelectedWeekdays] = useState<any[]>([]);
    const [selectedWeekends, setSelectedWeekends] = useState<any[]>([]);
    const [hoursOfOperation, setHoursOfOperation] = useState<any[]>([]);
    const [businessSelectData, setBusinessSelectData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [businessCount, setBusinessCount] = useState(0);
    const [staffCount, setStaffCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [maxLocations, setMaxLocations] = useState(0);
    const [maxStaffs, setMaxStaffs] = useState(0);
    const [maxUsers, setMaxUsers] = useState(0);

    // run on component load
    useEffect(() => {
        fetchData();

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

    // form fields for mantine components
    const businessInfoForm = useForm<BusinessInformation>({
        initialValues: {
            business_id: businessData?.id ?? '',
            name: businessData?.name ?? '',
            street: businessData?.street ?? '',
            street_2: businessData?.street_2 ?? '',
            city: businessData?.city ?? '',
            province: businessData?.province ?? '',
            country: businessData?.country ?? '',
            postal_code: businessData?.postal_code ?? '',
            contact_number: businessData?.contact_number ?? '',
            industry: businessData?.industry ?? '',
            business_owner: businessData?.business_owner ?? '',
            location_id: businessData?.location_id ?? '',
            strict_mode: businessData?.strict_mode ?? false,
            gps_geolocation: businessData?.gps_geolocation ?? false,
            review_approve_edits: businessData?.review_approve_edits ?? true,
            report_frequency: businessData?.report_frequency ?? '',
            staff_limit_reached: businessData?.staff_limit_reached ?? false,
            user_limit_reached: businessData?.user_limit_reached ?? false,
            auto_clocked_out_email: businessData?.auto_clocked_out_email ?? true,
            auto_clock_out_max_duration: businessData?.auto_clock_out_max_duration ?? 15,
            overtime_max_duration: businessData?.overtime_max_duration ?? 0,
            plan_id: businessData?.plan_id ?? '',
            notes: businessData?.notes ?? '',
            lon: 0,
            lat: 0,
            employee_count: businessData?.postal_code ?? '',
            //timezone: "",
            selected_weekdays: selectedWeekdays ?? [], // foreach create a new record in business schedule
            selected_weekends: selectedWeekends ?? [],
            hours_of_operation: hoursOfOperation ?? [],
        },
    });

    const businessSettingsForm = useForm<BusinessSettings>({
        initialValues: {
            strict_mode: businessData?.strict_mode ?? false,
            gps_geolocation: businessData?.gps_geolocation ?? false,
            review_approve_edits: businessData?.review_approve_edits ?? true,
            report_frequency: businessData?.report_frequency ?? '',
            auto_clocked_out_email: businessData?.auto_clocked_out_email ?? true,
            auto_clock_out_max_duration: businessData?.auto_clock_out_max_duration ?? 15,
            submitted_timesheet_email: businessData?.submitted_timesheet_email ?? true,
        },
    });

    const payrollInfoForm = useForm<PayrollInformation>({
        initialValues: {
            id: payrollData?.id ?? '',
            business_id: payrollData?.business_id ?? '',
            overtime: payrollData?.overtime ?? false,
            overtime_rate: payrollData?.overtime_rate ?? 1.5,
            overtime_max_duration: payrollData?.overtime_max_duration ?? 0,
            holiday: payrollData?.holiday ?? true,
            holiday_rate: payrollData?.holiday_rate ?? 1.5,
            holidays: payrollData?.holidays ?? [],
            vacation: payrollData?.vacation ?? false,
            vacation_rate: payrollData?.vacation_rate ?? 1.0,
            vacation_days_accrual_period: payrollData?.vacation_days_accrual_period ?? 0,
            vacation_days_gained_per_accrual: payrollData?.vacation_days_gained_per_accrual ?? 0,
            sick_leave: payrollData?.sick_leave ?? false,
            sick_leave_rate: payrollData?.sick_leave_rate ?? 1.0,
            sick_leave_days_accrual_period: payrollData?.sick_leave_days_accrual_period ?? 0,
            sick_leave_gained_per_accrual: payrollData?.sick_leave_gained_per_accrual ?? 0,
            federal_tax: payrollData?.federal_tax ?? 0,
            province_tax: payrollData?.province_tax ?? 0,
            employment_insurance: payrollData?.employment_insurance ?? 0,
            canada_pension_plan: payrollData?.canada_pension_plan ?? 0,
            rrsp_contribution: payrollData?.rrsp_contribution ?? 0,
            tfsa_contribution: payrollData?.tfsa_contribution ?? 0,
            country_code: payrollData?.country_code ?? '',
        },
    });

    const employmentPositionsForm = useForm<PositionRoles>({
        initialValues: {
            coowner_labels: employmentPositionData[0]?.coowner_labels ?? [],
            manager_labels: employmentPositionData[0]?.manager_labels ?? [],
            fulltime_labels: employmentPositionData[0]?.fulltime_labels ?? [],
            parttime_labels: employmentPositionData[0]?.parttime_labels ?? [],
            term_labels: employmentPositionData[0]?.term_labels ?? [],
            contractor_labels: employmentPositionData[0]?.contractor_labels ?? [],
            freelancer_labels: employmentPositionData[0]?.freelancer_labels ?? [],
            student_labels: employmentPositionData[0]?.student_labels ?? [],
            max_labels: employmentPositionData[0]?.max_labels ?? 3,
        },
    });

    const businessWorkingHoursForm = useForm<BusinessWorkingHours>({
        initialValues: {
            id: business?.working_hours.id ?? 'x',
            business_id: business?.id ?? 'x',
            monday_start: business?.working_hours.monday_start ?? 'x',
            monday_end: business?.working_hours.monday_end ?? 'x',
            tuesday_start: business?.working_hours.tuesday_start ?? 'x',
            tuesday_end: business?.working_hours.tuesday_end ?? 'x',
            wednesday_start: business?.working_hours.wednesday_start ?? 'x',
            wednesday_end: business?.working_hours.wednesday_end ?? 'x',
            thursday_start: business?.working_hours.thursday_start ?? 'x',
            thursday_end: business?.working_hours.thursday_end ?? 'x',
            friday_start: business?.working_hours.friday_start ?? 'x',
            friday_end: business?.working_hours.friday_end ?? 'x',
            saturday_start: business?.working_hours.saturday_start ?? 'x',
            saturday_end: business?.working_hours.saturday_end ?? 'x',
            sunday_start: business?.working_hours.sunday_start ?? 'x',
            sunday_end: business?.working_hours.sunday_end ?? 'x',
        },
        onValuesChange: (values: any) => {
            values['section'] = 'working_hours';
            handleFormChanges(values);
        },
    });

    const formData = useForm<BusinessManagementFormData>({
        initialValues: {
            business_info: businessInfoForm.values,
            business_settings: businessSettingsForm.values,
            staff_data: staffData,
            user_data: userData,
            unassigned_staffs_data: unassignedStaffData,
            unassigned_users_data: unassignedUserData,
            payroll_info: payrollInfoForm.values,
            employment_positions: employmentPositionsForm.values,
            working_hours: businessWorkingHoursForm.values,
        },
    });

    useEffect(() => {
        if (windowWidth < 800) {
            setTabWidth("100%");
        }
        else {
            setTabWidth("300px")
        }
    }, [windowWidth]);

    // run when payroll data changes
    useEffect(() => {
        if (payrollData) {
            formData.setFieldValue('payroll_info', payrollData);
            //formData.values.payroll_info = payrollData.business_payroll_info;
            //console.log(payrollData);
        }
    }, [payrollData]);

    // run when user or business changes
    useEffect(() => {
        if (!user || !business) return;

        fetchData();
        //formData.setFieldValue('working_hours', business?.working_hours);
        //businessWorkingHoursForm.setValues(business?.working_hours);
    }, [user, business]);

    // run when business changes
    useEffect(() => {
        if (!business) return;
        if (business == null || business === undefined) return;
        //formData.setFieldValue('working_hours', business?.working_hours);
        initializeForms();
        //formData.values.working_hours = business?.working_hours;
        //formData.values.business_info.overtime_max_duration = business?.overtime_max_duration;
        //formData.values.business_info.auto_clock_out_max_duration = business?.auto_clock_out_max_duration;
    }, [business]);

    // fetch data from api
    async function fetchData() {
        if (!user || !business) {
            return;
        }

        setIsLoading(true);

        handleBusinessListFormat();

        // get all businesses the user is linked to
        var myBusinessData = await GetBusinessInfoForUserByUid(user?.uid, session?.access_token);
        if (myBusinessData) {
            setMyBusinessData(myBusinessData);
            console.log(myBusinessData);
        }

        // get business information data for the current selected business
        var businessData = await GetBusinessById(business?.id, session?.access_token);
        if (businessData) {
            setBusinessData(businessData);
            console.log(businessData);
        }

        // get employment position data for the current selected business
        var employmentPositionData = await GetEmploymentPositionsByBusinessId(business?.id, session?.access_token);
        if (employmentPositionData) {
            setEmploymentPositionData(employmentPositionData);
        }

        // get qr code data for the current selected business
        if (!await fetchQRCodeData()) {
            setShowCreateQrCodeButton(true);
        }

        // get payroll information for the current selected business
        var payrollInformation = await GetPayrollInformation(business?.id, session?.access_token);
        if (payrollInformation) {
            console.log(payrollInformation);
            setPayrollData(payrollInformation);
        }

        // get staff data => get all staff relationships for the selected business
        var staffEmployees = await GetStaffRelationshipByBusinessId(business?.id, session?.access_token);
        if (staffEmployees) {
            setStaffData(staffEmployees);
            console.log(staffEmployees);
        }

        // get user data for the current selected business
        var users = await GetChildRelationshipByBusinessId(business?.id, session?.access_token);
        if (users) {
            setUserData(users);
            console.log(users);
        }

        // get unassigned people for the current selected business
        var unassignedPeople = await GetUnassignedUsersByBusinessId(business?.id, session?.access_token);
        if (unassignedPeople) {
            // unassigned staff
            setUnassignedStaffData(unassignedPeople.unassigned_staffs);

            // unassigned users
            setUnassignedUserData(unassignedPeople.unassigned_users);
            //console.log(unassignedPeople);
        }

        // setup business working hours
        setupHoursOfOperation();

        // get business stats
        validatePlanIntegrity();

        initializeForms();

        setIsLoading(false);
    };

    function initializeForms() {
        var forms: any = {
            'business_info': businessData,
            'business_settings': businessData,
            'staff_data': staffData,
            'user_data': userData,
            'unassigned_staffs_data': unassignedStaffData,
            'unassigned_users_data': unassignedUserData,
            'payroll_info': payrollData,
            'employment_positions': employmentPositionData,
            'working_hours': business?.working_hours,
        }
        formData.initialize(forms);
    }

    // update form values on change
    function handleFormChanges(form: any) {
        console.log(form);
        //formData.setValues(form.values);
        switch (form.section) {
            case "business_employment_positions":
                formData.setFieldValue('employment_positions', form);
                //formData.values.employment_positions = form.values.business_employment_positions;
                break;
            case "business_payroll_info":
                formData.setFieldValue('payroll_info', form);
                //formData.values.payroll_info = form.values.business_payroll_info;
                break;
            case "working_hours":
                //formData.setFieldValue('selected_weekdays', form.values.selected_weekdays);
                //formData.setFieldValue('selected_weekends', form.values.selected_weekends);
                formData.setFieldValue('working_hours', form);
                // formData.values.selected_weekdays = form.values.selected_weekdays;
                // formData.values.selected_weekends = form.values.selected_weekends;
                // formData.values.working_hours = form.values.hours_of_operation;
                //formData.values.business_info.overtime_max_duration = form.values?.overtime_max_duration;
                break;
            case "business_info":
                formData.setFieldValue('business_info', form);
                break;
            case "business_settings":
                formData.setFieldValue('business_settings', form);
                break;
        }
    }

    function handleOvertimeMaxFormChanges(form: any) {
        formData.setFieldValue('business_info.overtime_max_duration', form.values.overtime_max_duration);
        //formData.values.business_info.overtime_max_duration = form.values.overtime_max_duration;
    }

    // format business data for select dropdown
    function handleBusinessListFormat() {
        setBusinessSelectData(businessListFormat(businessList));
    }

    // handle when delete centre button is clicked
    function handleDeleteCentreClick() {
        openDeleteCentreModal();
    }

    // handle centre information changes
    async function handleCentreInformationSaveChanges(form: any) {
        if (user && business) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });
            var response = await PatchBusinessById(business?.id, form, session?.access_token);
            if (response === 200) {
                // success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Centre information was updated.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
            else {
                // error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error updating the centre. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
        }
    }

    // delete a business centre
    async function handleDeleteCentre() {
        if (user && business) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });
            var response = await DeleteBusinessById(business?.id, session?.access_token);
            if (response === 200) {
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Centre was deleted.',
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
                        message: 'There was an error deleting the centre. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
        }
    }

    // save centre settings
    async function handleCentreSettingsSaveChanges(formData: any) {
        if (user && business) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });
            var response = await PatchBusinessById(business?.id, formData, session?.access_token);
            if (response === 200) {
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Centre settings was saved.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                fetchData();
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
    }

    // delete selected user
    async function handleDeleteUserModalButtonClick(selectedUserUid: string) {
        if (user) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });
            var response = await DeleteUserByUid(selectedUserUid, session?.access_token);
            if (response === 200) {
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'User was deleted.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                fetchData();
            }
            else {
                // show error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error deleting the user. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
        }
    }

    // move selected user to unassigned
    async function handleMoveToUnassignedModalButtonClick(selectedUserUid: string) {
        if (user && business) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            // get user uid and business id
            var updatedData = {
                'user_uid': selectedUserUid,
                'owner_uid': business?.owner_uid,
                'business_id': business?.id,
            }
            var response = await PostUnassignedUsers(business?.id, updatedData, session?.access_token);
            if (response === 201) {
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'User was successfully removed from the centre.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                fetchData();
            }
            else {
                // show error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error removing the user from the centre. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
        }
    }

    // move selected staff to the selected business
    async function handleUnassignedStaffAddToBusinessModalButtonClick(selectedUserUid: string, businessId: string) {
        if (user) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            // get user uid and business id
            var updatedData = {
                'user_uid': selectedUserUid,
                'business_id': businessId,
            }
            var response = await PatchUnassignedStaffRelationship(selectedUserUid, updatedData, session?.access_token);
            if (response === 200) {
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'User was successfully added to the centre.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                fetchData();
            }
            else {
                // show error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error adding the user to the centre. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
        }
    }

    // move selected user to the selected business
    async function handleUnassignedUserAddToBusinessModalButtonClick(selectedUserUid: string, businessId: string) {
        if (user) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            // get user uid and business id
            var updatedData = {
                'user_uid': selectedUserUid,
                'business_id': businessId,
            }
            var response = await PatchUnassignedUserRelationship(selectedUserUid, updatedData, session?.access_token);
            if (response === 200) {
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'User was successfully added to the centre.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                fetchData();
            }
            else {
                // show error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error moving the user to the centre. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
        }
    }


    // fetch all qr code invite links
    async function fetchQRCodeData() {
        if (user && business) {
            // get url from qr code
            var qrCodeData = await GetQrcodeInviteLink(business?.id, session?.access_token);
            if (qrCodeData?.length > 0) {
                setQRCodeData(qrCodeData);
                setShowCreateQrCodeButton(false);
                var inviteCode = qrCodeData[0]?.invite_code;
                setInviteCode(inviteCode);
                setInviteCodeUrl(qrCodeData[0]?.qr_code_url);
                return true;
            }
        }
        setQRCodeData(null);
        setInviteCode('');
        setInviteCodeUrl('');
        return false;
    };

    // handle when invite code is copied
    function handleInviteCodeCopyClick() {
        navigator.clipboard.writeText(inviteCode); // save to clipboard

        // notification
        notifications.show({
            loading: false,
            color: 'teal',
            icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
            title: 'Copied to clipboard',
            message: 'Invite code was copied to your clipboard.',
            autoClose: 3000,
            withCloseButton: false,
            classNames: notiicationClasses,
        });
    }

    // create a new qr code invite link
    async function handleModalCreateQRCode() {
        if (user && business) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });
            const response = await PostQrcodeInviteLink(business?.id, session?.access_token);
            if (response === 201) {
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Invite qr code created',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                fetchQRCodeData();
            }
            else {
                // show error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error creating your invite code. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
        }
    };

    // save centre employment positions
    async function handleCentreEmploymentPositionsSaveChanges(formData: any) {
        if (user && business) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });
            var response = await PatchEmploymentPositions(business?.id, formData, session?.access_token);
            if (response === 200) {
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Employment position labels was saved.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                fetchData();
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
    }

    // save centre payroll information
    async function handleCentrePayrollInformationSaveChanges(formData: any) {
        if (user) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            //console.log(formData);

            // send PUT request to update payroll information
            var response = await PutPayrollInformationById(formData.business_id, formData.id, formData, session?.access_token);
            if (response === 200) {
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Payroll information was saved.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                fetchData();
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
    }

    // generate the holidays
    async function handleGenerateHolidays() {
        if (user && payrollData) {
            if (payrollData.country_code.length > 0) {
                // use country code from payroll data if any
                var holidaysData = await GenerateHolidays(payrollData.country_code);
                if (holidaysData) {
                    var holidays = "holidays";
                    // update payroll data to cause re-render of table
                    setPayrollData(prevData => ({
                        ...prevData!,
                        business_payroll_info: {
                            ...prevData!,
                            [holidays]: holidaysData
                        }
                    }));
                }
            }
            else if (businessCountryCode) {
                // use country code from business contact form
                var holidaysData = await GenerateHolidays(businessCountryCode);
                if (holidaysData) {
                    var holidays = "holidays";
                    // update payroll data to cause re-render of table
                    setPayrollData(prevData => ({
                        ...prevData!,
                        business_payroll_info: {
                            ...prevData!,
                            [holidays]: holidaysData
                        }
                    }));
                }
            }
        }
    }

    // save business working hours
    async function handleBusinessHoursSaveChanges(formData: any) {
        if (user && business) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });

            // format data
            var data = {
                'monday_start': formData['monday_start'],
                'monday_end': formData['monday_end'],
                'tuesday_start': formData['tuesday_start'],
                'tuesday_end': formData['tuesday_end'],
                'wednesday_start': formData['wednesday_start'],
                'wednesday_end': formData['wednesday_end'],
                'thursday_start': formData['thursday_start'],
                'thursday_end': formData['thursday_end'],
                'friday_start': formData['friday_start'],
                'friday_end': formData['friday_end'],
                'saturday_start': formData['saturday_start'],
                'saturday_end': formData['saturday_end'],
                'sunday_start': formData['sunday_start'],
                'sunday_end': formData['sunday_end'],
                'timezone': getCurrentTimezoneOffset(),
            }

            console.log(data);

            var response = await PatchBusinessHours(business?.id, data, session?.access_token);
            if (response === 200) {
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Business hours was saved.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
                
                fetchData();

                // get new auth data
                fetchAuthData();
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
    }

    // save centre employment positions
    async function sendNewOwnerEmail() {
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
        generateRecoveryEmail('emmanuelojo025@gmail.com');
        setTimeout(() => {
            notifications.update({
                id,
                color: 'teal',
                title: 'Success',
                message: 'Email was succesfully sent.',
                icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                loading: false,
                autoClose: 1000,
                classNames: notiicationClasses,
            });
        }, 500);
    }

    // setup hours of operation and selected weekdays & weekends
    function setupHoursOfOperation() {
        if (!(user && business?.working_hours)) {
            return;
        }

        var businessWorkingHours = business?.working_hours;

        // go through working hours from business and map to hours of operation
        var mondayStart = "";
        var mondayEnd = "";
        var tuesdayStart = "";
        var tuesdayEnd = "";
        var wednesdayStart = "";
        var wednesdayEnd = "";
        var thursdayStart = "";
        var thursdayEnd = "";
        var fridayStart = "";
        var fridayEnd = "";
        var saturdayStart = "";
        var saturdayEnd = "";
        var sundayStart = "";
        var sundayEnd = "";

        var mondayChecked = false;
        var tuesdayChecked = false;
        var wednesdayChecked = false;
        var thursdayChecked = false;
        var fridayChecked = false;
        var saturdayChecked = false;
        var sundayChecked = false;

        var selectedWeekdaysList = [];
        var selectedWeekendsList = [];

        // get working hours
        if (businessWorkingHours?.monday_start && businessWorkingHours?.monday_end) {
            mondayStart = businessWorkingHours?.monday_start;
            mondayEnd = businessWorkingHours?.monday_end;
            selectedWeekdaysList.push("Monday");
            mondayChecked = true;
        }

        if (businessWorkingHours?.tuesday_start && businessWorkingHours?.tuesday_end) {
            tuesdayStart = businessWorkingHours?.tuesday_start;
            tuesdayEnd = businessWorkingHours?.tuesday_end;
            selectedWeekdaysList.push("Tuesday");
            tuesdayChecked = true;
        }

        if (businessWorkingHours?.wednesday_start && businessWorkingHours?.wednesday_end) {
            wednesdayStart = businessWorkingHours?.wednesday_start;
            wednesdayEnd = businessWorkingHours?.wednesday_end;
            selectedWeekdaysList.push("Wednesday");
            wednesdayChecked = true;
        }

        if (businessWorkingHours?.thursday_start && businessWorkingHours?.thursday_end) {
            thursdayStart = businessWorkingHours?.thursday_start;
            thursdayEnd = businessWorkingHours?.thursday_end;
            selectedWeekdaysList.push("Thursday");
            thursdayChecked = true;
        }

        if (businessWorkingHours?.friday_start && businessWorkingHours?.friday_end) {
            fridayStart = businessWorkingHours?.friday_start;
            fridayEnd = businessWorkingHours?.friday_end;
            selectedWeekdaysList.push("Friday");
            fridayChecked = true;
        }

        if (businessWorkingHours?.saturday_start && businessWorkingHours?.saturday_end) {
            saturdayStart = businessWorkingHours?.saturday_start;
            saturdayEnd = businessWorkingHours?.saturday_end;
            selectedWeekendsList.push("Saturday");
            saturdayChecked = true;
        }

        if (businessWorkingHours?.sunday_start && businessWorkingHours?.sunday_end) {
            sundayStart = businessWorkingHours?.sunday_start;
            sundayEnd = businessWorkingHours?.sunday_end;
            selectedWeekendsList.push("Sunday");
            sundayChecked = true;
        }

        const weekdayValues = [
            { label: "Monday", checked: mondayChecked, key: randomId() },
            { label: "Tuesday", checked: tuesdayChecked, key: randomId() },
            { label: "Wednesday", checked: wednesdayChecked, key: randomId() },
            { label: "Thursday", checked: thursdayChecked, key: randomId() },
            { label: "Friday", checked: fridayChecked, key: randomId() },
        ];

        const weekendValues = [
            { label: "Saturday", checked: saturdayChecked, key: randomId() },
            { label: "Sunday", checked: sundayChecked, key: randomId() },
        ];

        setSelectedWeekdays(weekdayValues);
        setSelectedWeekends(weekendValues);

        setHoursOfOperation([
            {
                'uid': randomId(),
                'day': 'Monday',
                'day_id': 0,
                'start': mondayStart,
                'end': mondayEnd,
                'business_id': business?.id,
            },
            {
                'uid': randomId(),
                'day': 'Tuesday',
                'day_id': 1,
                'start': tuesdayStart,
                'end': tuesdayEnd,
                'business_id': business?.id,
            },
            {
                'uid': randomId(),
                'day': 'Wednesday',
                'day_id': 2,
                'start': wednesdayStart,
                'end': wednesdayEnd,
                'business_id': business?.id,
            },
            {
                'uid': randomId(),
                'day': 'Thursday',
                'day_id': 3,
                'start': thursdayStart,
                'end': thursdayEnd,
                'business_id': business?.id,
            },
            {
                'uid': randomId(),
                'day': 'Friday',
                'day_id': 4,
                'start': fridayStart,
                'end': fridayEnd,
                'business_id': business?.id,
            },
            {
                'uid': randomId(),
                'day': 'Saturday',
                'day_id': 5,
                'start': saturdayStart,
                'end': saturdayEnd,
                'business_id': business?.id,
            },
            {
                'uid': randomId(),
                'day': 'Sunday',
                'day_id': 6,
                'start': sundayStart,
                'end': sundayEnd,
                'business_id': business?.id,
            }
        ]);
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

    async function validatePlanIntegrity() {
        if (!user) {
            return;
        }

        var MAX_LOCATIONS;
        var MAX_USERS;
        var MAX_STAFFS;
        var businessPlanInfo;
        var ownerPlanInfo;

        // get users plan id, if none => FREE PLAN
        var businessPlanId = business?.plan;
        var ownerPlanId = user?.plan;
        if (businessPlanId === undefined || ownerPlanId === undefined) {
            // query database for info about plan
            businessPlanInfo = await getBusinessProfilePlanByName("Free", session?.access_token);
            ownerPlanInfo = await getBusinessOwnerPlanByName("Free", session?.access_token);
        }
        else {
            businessPlanInfo = await getBusinessProfilePlanById(businessPlanId, session?.access_token);
            ownerPlanInfo = await getBusinessOwnerPlanById(ownerPlanId, session?.access_token);
        }

        // guidelines to meet 
        MAX_LOCATIONS = ownerPlanInfo?.max_locations;
        MAX_USERS = businessPlanInfo?.max_users;
        MAX_STAFFS = businessPlanInfo?.max_staff;
        setMaxLocations(MAX_LOCATIONS);
        setMaxStaffs(MAX_STAFFS);
        setMaxUsers(MAX_USERS);

        // check if allowed to create new business
        var businessLocations = await getBusinessByOwnerId(user?.uid, session?.access_token);
        setBusinessCount(businessLocations?.length);

        if (business) {
            // check if allowed to create new staff
            var staffRelationships = await GetStaffRelationshipByBusinessId(business?.id, session?.access_token);
            setStaffCount(staffRelationships?.length);

            // check if allowed to create new user
            var userRelationships = await GetChildRelationshipByBusinessId(business?.id, session?.access_token);
            setUserCount(userRelationships?.length);
        }
    }

    // business select
    const businessSelect = (
        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
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
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <ProgressCard title="Staff members" current={staffCount.toString()} max={maxStaffs.toString()} value={(staffCount / maxStaffs) * 100} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <ProgressCard title="Users" current={userCount.toString()} max={maxUsers.toString()} value={(userCount / maxUsers) * 100} />
                    </Grid.Col>
                </Grid>
            </Stack>
        </Paper>
    );

    // TODO: share a qr code => text message, email


    // handle download qr code
    async function handleDownloadQRCode(fileUrl: string, fileName: string) {
        if (user) {
            //console.log("TODO: SHARE INVITE CODE");
            //FileDownload(fileUrl, fileName);
            window.open(fileUrl, '_blank'); // opens the link in a new tab
            return;
        }
    };

    return (
        <>
            {deleteCentreModalOpened && (
                <DeleteBusinessConfirmModal
                    modalOpened={deleteCentreModalOpened}
                    isMobile={isMobile !== undefined ? isMobile : false}
                    businessId={businessData?.id !== undefined ? businessData?.id : ""}
                    closeModal={closeDeleteCentreModal}
                    handleDeleteClick={handleDeleteCentre}
                />
            )}

            <Tabs variant="pills" radius="md" color="rgba(24,28,38,0.5)" defaultValue="people" orientation={windowWidth < 800 ? "horizontal" : "vertical"}>
                <Tabs.List grow mr={isMobile ? "" : "md"}>
                    <Paper shadow="md" p="lg" mb="lg" radius="lg" style={{ background: "#25352F", width: "100%", color: "white" }}>
                        <Stack gap="xs">
                            <Tabs.Tab style={{ width: "100%" }} value="people" p="md" classNames={classes}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>People manager</Text>
                            </Tabs.Tab>
                            <Tabs.Tab style={{ width: "100%" }} value="center" p="md" classNames={classes}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Centre manager</Text>
                            </Tabs.Tab>
                            {/* <Tabs.Tab style={{ width: "100%" }} value="group" p="md" classNames={classes}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Group manager</Text>
                            </Tabs.Tab> */}
                        </Stack>
                    </Paper>
                </Tabs.List>

                {/* people manager panel */}
                <Tabs.Panel value="people">
                    <Stack>

                        {/* business select */}
                        {businessSelect}

                        {/* employee table */}
                        <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                            <EmployeeDirectoryTable
                                staffData={staffData}
                                handleMoveToUnassigned={handleMoveToUnassignedModalButtonClick}
                                handleDeleteClick={handleDeleteUserModalButtonClick}
                                handleFetchData={fetchData}
                            />
                        </Paper>

                        {/* users table - PRO and UP */}
                        {usersEnabled && (
                            <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <UserDirectoryTable
                                    userData={userData}
                                    handleMoveToUnassigned={handleMoveToUnassignedModalButtonClick}
                                    handleDeleteClick={handleDeleteUserModalButtonClick}
                                />
                            </Paper>
                        )}
                        {/* <PeopleDirectoryTable 
                            handleDeleteClick={handleDeleteUserModalButtonClick}
                            handleUnassignedClick={handleUnassignedModalButtonClick}
                        /> */}
                        {/* unassigned users table */}
                        {unassignedUsersEnabled && unassignedUserData && unassignedUserData.length > 0 && (
                            <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <UnassignedUsersDirectoryTable
                                    userData={unassignedUserData}
                                    myBusinessData={myBusinessData}
                                    handleAddUnassignedUserToBusiness={handleUnassignedUserAddToBusinessModalButtonClick}
                                />
                            </Paper>
                        )}

                        {/* unassigned staff table */}
                        {unassignedEmployeesEnabled && unassignedStaffData && unassignedStaffData.length > 0 && (
                            <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <UnassignedEmployeesDirectoryTable
                                    staffData={unassignedStaffData}
                                    myBusinessData={myBusinessData}
                                    handleAddUnassignedUserToBusiness={handleUnassignedStaffAddToBusinessModalButtonClick}
                                />
                            </Paper>
                        )}
                    </Stack>
                </Tabs.Panel>

                {/* centre manager panel */}
                <Tabs.Panel value="center">
                    {businessData && (
                        <Stack gap="sm">
                            {/* business select */}
                            {businessList?.length > 1 && businessSelect}

                            {/* centre information */}
                            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <Text
                                    size={isMobile ? "30px" : "35px"}
                                    fw={600}
                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                                    mb="lg"
                                >
                                    {businessData.name} centre information
                                </Text>

                                {/* <Grid>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <ProgressCard title="Staff members" current={staffCount.toString()} max={maxStaffs.toString()} value={(staffCount/maxStaffs)*100}/>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <ProgressCard title="Users" current={userCount.toString()} max={maxUsers.toString()} value={(userCount/maxUsers)*100}/>
                                    </Grid.Col>
                                </Grid> */}

                                <CentreInformation
                                    business={businessData}
                                    handleOnChange={handleFormChanges}
                                />
                                <Button
                                    onClick={() => {
                                        handleCentreInformationSaveChanges(formData.getInputProps('business_info').value);
                                    }}
                                    //variant="light"
                                    mt="lg"
                                    color="#336E1E"
                                    size="md"
                                    radius="md"
                                    w={isMobile ? "100%" : "150px"}
                                    style={{ width: "150px" }}
                                >
                                    Save Changes
                                </Button>
                            </Paper>

                            {/* <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <Text 
                                    size={isMobile ? "30px" : "35px"} 
                                    fw={600} 
                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                                    mb="lg"
                                >
                                    {businessData.name} centre stats
                                </Text>
                                
                            </Paper> */}

                            {/* centre settings */}
                            <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <Stack>
                                    <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Centre settings</Text>
                                    <CentreSettings
                                        businessData={businessData}
                                        handleOnChange={handleFormChanges}
                                    />
                                    <Button
                                        onClick={() => {
                                            handleCentreSettingsSaveChanges(formData.getInputProps('business_settings').value);
                                        }}
                                        //variant="light"
                                        mt="lg"
                                        color="#336E1E"
                                        size="md"
                                        radius="md"
                                        w={isMobile ? "100%" : "150px"}
                                        style={{ width: "150px" }}
                                    >
                                        Save Changes
                                    </Button>
                                </Stack>
                            </Paper>

                            {/* centre invite code */}
                            <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <Group mb="lg">
                                    <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Centre invite code </Text>
                                    {inviteCode?.length > 0 && (
                                        <Badge
                                            color="#43554E"
                                            radius="md"
                                            size="xl"
                                            style={{ cursor: 'pointer' }}
                                            onClick={handleInviteCodeCopyClick}
                                        >
                                            {inviteCode}
                                        </Badge>
                                    )}
                                </Group>

                                <Stack>
                                    <CentreInviteCode
                                        handleCreateQRCode={handleModalCreateQRCode}
                                        handleDownloadQRCode={handleDownloadQRCode}
                                        qrCodeData={qrCodeData}
                                        showCreateQRCodeButton={showCreateQrCodeButton}
                                    />
                                </Stack>
                            </Paper>

                            {/* business working hours */}
                            <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <Stack>
                                    <Grid style={{ cursor: "pointer" }} onClick={openBusinessHours}>
                                        <Grid.Col span={{ base: 10 }}>
                                            <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Business working hours</Text>

                                        </Grid.Col>
                                        <Grid.Col span={{ base: 2 }}>
                                            <Group justify="end">
                                                {!businessHoursOpened && (
                                                    <IconChevronDown />
                                                )}

                                                {businessHoursOpened && (
                                                    <IconChevronUp />
                                                )}
                                            </Group>
                                        </Grid.Col>
                                    </Grid>
                                    <Collapse in={businessHoursOpened}>
                                        <SelectedWorkingHours
                                            selectedWeekdays={selectedWeekdays}
                                            selectedWeekends={selectedWeekends}
                                            hoursOfOperation={hoursOfOperation}
                                            handleFormChanges={handleFormChanges}
                                        />
                                        <Button
                                            onClick={() => {
                                                if (!business) return;
                                                //console.log(formData);
                                                handleBusinessHoursSaveChanges(formData.getInputProps('working_hours').value);
                                            }}
                                            //variant="light"
                                            mt="lg"
                                            color="#336E1E"
                                            size="md"
                                            radius="md"
                                            w={isMobile ? "100%" : "150px"}
                                            style={{ width: "150px" }}
                                        >
                                            Save Changes
                                        </Button>
                                    </Collapse>
                                </Stack>
                            </Paper>

                            {/* employment position labels */}
                            <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <Stack>
                                    <Grid style={{ cursor: "pointer" }} onClick={openPosition}>
                                        <Grid.Col span={{ base: 10 }}>
                                            <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Employment position labels</Text>

                                        </Grid.Col>
                                        <Grid.Col span={{ base: 2 }}>
                                            <Group justify="end">
                                                {!positionOpened && (
                                                    <IconChevronDown />
                                                )}

                                                {positionOpened && (
                                                    <IconChevronUp />
                                                )}
                                            </Group>
                                        </Grid.Col>
                                    </Grid>
                                    <Collapse in={positionOpened}>
                                        <BusinessStaffCustomizationForm
                                            handleFormChanges={handleFormChanges}
                                            employmentPositionData={employmentPositionData}
                                        />
                                        <Button
                                            onClick={() => {
                                                handleCentreEmploymentPositionsSaveChanges(formData.getInputProps('employment_positions').value);
                                            }}
                                            //variant="light"
                                            color="#336E1E"
                                            size="md"
                                            radius="md"
                                            w={isMobile ? "100%" : "150px"}
                                            mt="lg"
                                        >
                                            Save Changes
                                        </Button>
                                    </Collapse>
                                </Stack>
                            </Paper>

                            {/* payroll information */}
                            <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <Stack>
                                    <Grid style={{ cursor: "pointer" }} onClick={openPayroll}>
                                        <Grid.Col span={{ base: 10 }}>
                                            <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Payroll information</Text>

                                        </Grid.Col>
                                        <Grid.Col span={{ base: 2 }}>
                                            <Group justify="end">
                                                {!payrollOpened && (
                                                    <IconChevronDown />
                                                )}

                                                {payrollOpened && (
                                                    <IconChevronUp />
                                                )}
                                            </Group>
                                        </Grid.Col>
                                    </Grid>

                                    <Collapse in={payrollOpened}>
                                        <Stack>
                                            <BusinessPayrollForm
                                                payrollData={payrollData}
                                                handleFormChanges={handleFormChanges}
                                                handleGenerateHoliday={handleGenerateHolidays}
                                            />
                                            <Button
                                                onClick={() => {
                                                    handleCentrePayrollInformationSaveChanges(formData.getInputProps('payroll_info').value);
                                                }}
                                                //variant="light"
                                                color="#336E1E"
                                                size="md"
                                                radius="md"
                                                w={isMobile ? "100%" : "150px"}
                                            >
                                                Save Changes
                                            </Button>
                                        </Stack>
                                    </Collapse>

                                </Stack>
                            </Paper>

                            {/* employee table */}
                            {/* <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <EmployeeDirectoryTable staffData={staffData}/>
                            </Paper> */}

                            {/* users table - PRO and UP */}
                            {/* {usersEnabled && (
                                <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                    <UserDirectoryTable userData={userData} />
                                </Paper>
                            )} */}

                            {/* unassigned users table */}
                            {/* {unassignedUsersEnabled && unassignedUserData && unassignedUserData.length > 0 && (
                                <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                    <UnassignedUsersDirectoryTable userData={unassignedUserData} />
                                </Paper>
                            )} */}

                            {/* unassigned staff table */}
                            {/* {unassignedEmployeesEnabled && unassignedStaffData && unassignedStaffData.length > 0 && (
                                <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                    <UnassignedEmployeesDirectoryTable staffData={unassignedStaffData} />
                                </Paper>
                            )} */}

                            {/* delete centre FOREVER!! */}
                            <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <Stack>
                                    <Grid style={{ cursor: "pointer" }} onClick={openDeleteBusiness}>
                                        <Grid.Col span={{ base: 10 }}>
                                            <Text size={isMobile ? "30px" : "35px"} fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Delete business centre</Text>

                                        </Grid.Col>
                                        <Grid.Col span={{ base: 2 }}>
                                            <Group justify="end">
                                                {!deleteBusinessOpened && (
                                                    <IconChevronDown />
                                                )}

                                                {deleteBusinessOpened && (
                                                    <IconChevronUp />
                                                )}
                                            </Group>
                                        </Grid.Col>
                                    </Grid>

                                    <Collapse in={deleteBusinessOpened}>
                                        <Text mb="md">Once you delete your centre, there is no going back. Deleting your centre will remove all attached data from our servers.</Text>
                                        <Button
                                            color="red"
                                            size="md"
                                            radius="md"
                                            onClick={handleDeleteCentreClick}
                                            w={isMobile ? "100%" : "fit"}
                                        >
                                            Delete centre
                                        </Button>
                                    </Collapse>
                                </Stack>
                            </Paper>
                            {/* <Paper shadow="md" p="md" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }} mb="10px">Delete this centre</Text>
                                <Text mb="md">Once you delete your centre, there is no going back. Deleting your centre will remove all attached data from our servers.</Text>
                                <Button color="red" size="md" radius="md" onClick={handleDeleteCentreClick}>
                                    Delete centre
                                </Button>
                            </Paper> */}
                        </Stack>
                    )}
                </Tabs.Panel>

                {/* group manager panel */}
                <Tabs.Panel value="group">
                    {/* {businessData && ( */}
                    <Stack gap="sm">
                        {multipleBusinesses && (
                            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                                <Stack>
                                    <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Business centre select</Text>
                                    <Select
                                        id="business"
                                        placeholder="Please select one"
                                        size="md"
                                        data={['Business', 'yeah']}
                                        classNames={classes}
                                    //{...form.getInputProps('business_type')}
                                    >
                                    </Select>
                                </Stack>
                            </Paper>
                        )}

                        {/* TODO: finish group manager */}
                        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                            <Text size="35px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Group manager</Text>
                            <GroupManager />
                        </Paper>
                    </Stack>
                    {/* )} */}
                </Tabs.Panel>
            </Tabs>
        </>
    );
}