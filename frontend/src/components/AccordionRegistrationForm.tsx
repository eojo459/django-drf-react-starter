import React, { useEffect, useState } from 'react';
import { Accordion, Button, Container, Divider, Grid, Group, Paper, Select, Space, Stack, TextInput, Title, Text, List, Table, rem } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import classes from '../../../css/TextInput.module.scss';
import { IconBuilding, IconCheck, IconInfoCircle, IconPhone, IconSettings, IconUser, IconUsersGroup, IconX } from '@tabler/icons-react';
import DayCheckboxes from './DayCheckboxes';
import { IndustryData, timezoneData } from '../helpers/SelectData';
import { SelectAsync } from './TimeInputSelect';
import { TimeInputSelectBase } from './TimeInputSelectBase';
import BusinessInformationForm from './forms/BusinessInformationForm';
import BusinessPayrollForm from './forms/BusinessPayrollForm';
import BusinessStaffCustomizationForm from './forms/BusinessStaffCustomizationForm';
import BusinessPreferencesForm from './forms/BusinessPreferencesForm';
import OwnerInformationForm from './forms/OwnerInformationForm';
import StaffInformationForm from './forms/StaffInformationForm';
import EmergencyContactForm from './forms/EmergencyContactForm';
import ContactInformationForm from './forms/ContactInformationForm';
import UserInformationForm from './forms/UserInformationForm';
import ParentInformationForm from './forms/ParentInformationForm';
import { useForm } from '@mantine/form';
import BusinessContactForm from './forms/BusinessContactForm';
import { GetBusinessInfoForUserByUid, GetEmploymentPositionsByBusinessId, GetHolidayApiData, GetPayrollInformation, PostBusiness, PostChild, PostOwner, PostStaff, PostUser } from '../helpers/Api';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { GenerateUUID } from '../helpers/Helpers';
import { BusinessContactInfoForm, BusinessInformation, BusinessSettings, BusinessWorkingHours, GenerateHolidays, Holiday, PayrollInformation, PayrollInformationForm, PositionRoles } from '../pages/owner-dashboard/business/Business-Management';
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../css/Notifications.module.css";
import { useSupabase } from '../authentication/SupabaseContext';

interface AccordionRegistrationForm {
    formType: string;
}

interface FormData {
    business_form: any,
    owner_form: any,
    staff_form: any,
    user_form: any,
    parent_form: any,
    business_id: string,
}

export interface BusinessRegistrationInformationForm {
    business_name: string,
    business_owner: string,
    industry: string,
    employee_count: string,
    selected_weekdays: string[], // foreach create a new record in business schedule
    selected_weekends: string[], 
    hours_of_operation: any,
}

export default function AccordionRegistrationForm(props: AccordionRegistrationForm) {
    const { user, session } = useAuth();
    const { signUpNewUser } = useSupabase();
    const [openedItem, setOpenedItem] = useState<string | null>(props.formType);
    const [formType, setFormType] = useState('');
    const [endOfForm, setEndOfForm] = useState(false);
    const [currentValue, setCurrentValue] = useState('');
    //const [currentIndex, setCurrentIndex] = useState(0);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
    const [selectedWeekends, setSelectedWeekends] = useState<string[]>([]);
    const navigate = useNavigate();
    const [employmentPositionData, setEmploymentPositionData] = useState<PositionRoles[]>([]);
    const [businessCountryCode, setBusinessCountryCode] = useState('');
    const [holidayApiData, setHolidayApiData] = useState<any[]>([]);
    const [validCountryCode, setValidCountryCode] = useState(false);
    const [payrollData, setPayrollData] = useState<PayrollInformation | undefined>();

    // props
    const formTypeProps = props.formType;

    // form fields for mantine components
    // const businessInfoForm = useForm<BusinessInformation>({
    //     initialValues: {
    //         business_id: '',
    //         name: '',
    //         street: '',
    //         street_2: '',
    //         city: '',
    //         province: '',
    //         country: '',
    //         postal_code: '',
    //         contact_number: '',
    //         industry: '',
    //         business_owner: '',
    //         location_id: '',
    //         strict_mode: false,
    //         gps_geolocation: false,
    //         review_approve_edits: true,
    //         report_frequency: '',
    //         staff_limit_reached: false,
    //         user_limit_reached: false,
    //         auto_clocked_out_email: true,
    //         auto_clock_out_max_duration: 15,
    //         overtime_max_duration: 0,
    //         plan_id: '',
    //         notes: '',
    //         lon: 0,
    //         lat: 0,
    //         employee_count: '',
    //         //timezone: "",
    //         selected_weekdays: [], // foreach create a new record in business schedule
    //         selected_weekends: [],
    //         hours_of_operation: [],
    //     },
    // });
    const businessInfoForm = useForm<BusinessRegistrationInformationForm>({
        initialValues: {
            business_name: '',
            business_owner: '',
            industry: '',
            employee_count: '',
            selected_weekdays: [], // foreach create a new record in business schedule
            selected_weekends: [], 
            hours_of_operation: {},      
        },
    });
    const payrollInfoForm = useForm<PayrollInformation>({});
    const businessContactInfoForm = useForm<BusinessContactInfoForm>({});
    const employmentPositionsForm = useForm<PositionRoles>({});
    const businessSettingsForm = useForm<BusinessSettings>({});

    const businessFormFields = useForm({
        initialValues: {
            business_info: businessInfoForm.values,
            business_payroll_info: payrollInfoForm.values,
            business_contact_info: businessContactInfoForm.values,
            business_preferences: businessSettingsForm.values,
            business_employment_positions: employmentPositionsForm.values,
        },
        validate: (value) => {
            return {
                business_info: value.business_info != null ? 'Business information is required' : null,
                business_payroll_info: value.business_payroll_info != null ? 'Payroll information is required' : null,
                busines_preferences: value.business_preferences != null ? 'Preferences is required' : null,
                business_employment_positions: value.business_employment_positions != null ? 'Business roles and positions is required' : null,
                business_contact_info: value.business_contact_info != null? 'Contact information is required' : null,
            }
        }
    });

    const ownerFormFields = useForm({
        initialValues: {
            owner_info: {},
            owner_contact_info: {},
        },
        validate: (value) => {
            return {
                owner_info: value.owner_info != null ? 'Owner information is required' : null,
                owner_contact_info: value.owner_contact_info != null ? 'Owner contact information is required' : null,
            }
        }
    });

    const staffFormFields = useForm({
        initialValues: {
            staff_info: {},
            staff_contact_info: {},
            emergency_contact_info: {},
        },
        validate: (value) => {
            return {
                staff_info: value.staff_info != null ? 'Staff information is required' : null,
                staff_contact_info: value.staff_contact_info != null ? 'Staff contact information is required' : null,
            }
        }
    });

    const userFormFields = useForm({
        initialValues: {
            user_info: {},
            user_contact_info: {},
            parent_info: {},
            parent_contact_info: {},
            emergency_contact_info: {},
        },
        validate: (value) => {
            return {
                user_info: value.user_info != null ? 'User information is required' : null,
                user_contact_info: value.user_contact_info != null ? 'User contact information is required' : null,
                parent_info: value.parent_info != null? 'Parent information is required' : null,
                parent_contact_info: value.parent_contact_info != null? 'Parent contact information is required' : null,
            }
        }
    });

    // POST this form on submit
    const formData = useForm<FormData>({
        initialValues: {
            business_form: {},
            owner_form: {},
            staff_form: {},
            user_form: {},
            parent_form: {},
            business_id: '',
        },
    });

    // run on component load
    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                // business information and settings
                const myBusinessData = await GetBusinessInfoForUserByUid(user?.uid, session?.access_token);
                if (myBusinessData) {
                    formData.values.business_id = myBusinessData[0]?.value;
                }

                // employment positions
                var employmentPositionData = await GetEmploymentPositionsByBusinessId('register', session?.access_token);
                if (employmentPositionData) {
                    setEmploymentPositionData(employmentPositionData);
                }

                // payroll information
                var payrollData = await GetPayrollInformation('register', session?.access_token);
                if (payrollData) {
                    setPayrollData(payrollData);
                }
            }
        };
        fetchData();
    },[]);

    // useEffect(() => {
    //     console.log(selectedWeekdays);
    // },[selectedWeekdays]);

    // useEffect(() => {
    //     console.log(selectedWeekends);
    // },[selectedWeekends]);

    useEffect(() => {
        // get country code from business contact info form onchange
        var countryCode = businessFormFields.getInputProps('country_code').value;
        if (countryCode?.length > 0) {
            setBusinessCountryCode(countryCode);
            setValidCountryCode(true);
            // display holidays and save on submit
            // similiar modify as positions
        }
        //console.log(businessFormFields);
        // add canada and usa holidays to seeding?
    },[formData.values.business_form]);

    // update form fields when payroll data changes
    useEffect(() => {
        if (payrollData) {
            businessFormFields.setFieldValue('business_payroll_info', payrollData);
            formData.values.business_form = businessFormFields;
        }
    },[payrollData]);

    // useEffect(() => {
    //     console.log(staffFormFields);
    // },[staffFormFields]);

    // useEffect(() => {
    //     console.log(userFormFields);
    // },[userFormFields]);

    useEffect(() => {
        setFormType(formTypeProps);
    },[formTypeProps]);

    function handleSelectedWeekdays(selected: string[]) {
        setSelectedWeekdays(selected); 
        //console.log(selected);   
    }

    function handleSelectedWeekends(selected: string[]) {
        setSelectedWeekends(selected);  
        //console.log(selected);  
    }

    // generate the holidays
    async function handleGenerateHolidays() {
        if (user && payrollData) {
            if (payrollData.country_code.length > 0) {
                // use country code from payroll data if any
                var holidaysData = await GenerateHolidays(payrollData.country_code);
                if (holidaysData) {
                    //console.log(holidaysData);
                    var holidays = "holidays";
                    //formData.values.business_form.bu
                    // update payroll data to cause re-render of table
                    setPayrollData(prevData => ({
                        ...prevData!,
                        [holidays]: holidaysData,
                    }));
                }
            }
            else if (businessCountryCode) {
                // use country code from business contact form
                var holidaysData = await GenerateHolidays(businessCountryCode);
                if (holidaysData) {
                    //console.log(holidaysData);
                    var holidays = "holidays";
                    // update payroll data to cause re-render of table
                    setPayrollData(prevData => ({
                        ...prevData!,
                        [holidays]: holidaysData,
                    }));
                }
            }
        }
    }
    

    // HANDLE WHEN FORM IS SUBMIT
    async function handleSubmit() {
        // console.log(user);
        // console.log(session);
        // console.log(formData);

        // show notification
        //let id: string;
        let id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });

        switch(formType) {
            case "BUSINESS":
                // POST new business
                //console.log(businessFormFields.values);
                //console.log(formData.values.business_form);

                var response = await PostBusiness(formData.values.business_form.values, session?.access_token);
                if (response != undefined && response.status === 201) {
                    // show success notification
                    setTimeout(() => {
                        notifications.update({
                            id,
                            color: 'teal',
                            title: 'Success',
                            message: 'Business was created.',
                            icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                            loading: false,
                            autoClose: 1000,
                            classNames: notiicationClasses,
                        });
                    }, 500);
                }
                else {
                    // show error notification
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
                break;
            case "OWNER":
                // POST new owner
                //console.log(formData.values.owner_form);

                var ownerResponse = await signUpNewUser(formData.values.owner_form.values.owner_info, "OWNER", navigate);
                if (ownerResponse != null && ownerResponse != undefined && ownerResponse == true) {
                    // show success notification
                    setTimeout(() => {
                        notifications.update({
                            id,
                            color: 'teal',
                            title: 'Success',
                            message: 'User was created.',
                            icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                            loading: false,
                            autoClose: 1000,
                            classNames: notiicationClasses,
                        });
                    }, 500);
                    
                }
                else {
                    // show error notification
                    setTimeout(() => {
                        notifications.update({
                            id,
                            color: 'red',
                            title: 'Error',
                            message: 'There was an error creating the user. Please try again.',
                            icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                            loading: false,
                            autoClose: 1500,
                            classNames: notiicationClasses,
                        });
                    }, 500);
                }
                break;
            case "STAFF":
                // POST new staff
                //console.log(formData.values.staff_form);
                //console.log(formData.values.staff_form.staff_info);

                formData.values.staff_form.staff_info.email = formData.values.staff_form.contact_info.email;
                var staffFormattedForm = {
                    'username': formData.values.staff_form.staff_info.username,
                    'first_name': formData.values.staff_form.staff_info.first_name,
                    'last_name': formData.values.staff_form.staff_info.last_name,
                    'email': formData.values.staff_form.contact_info.email,
                    'cell_number': formData.values.staff_form.contact_info.cell_number,
                    'home_number': formData.values.staff_form.contact_info.home_number,
                    'work_number': formData.values.staff_form.contact_info.work_number,
                    'street': formData.values.staff_form.contact_info.street,
                    'street_2': formData.values.staff_form.contact_info.street_2,
                    'city': formData.values.staff_form.contact_info.city,
                    'province': formData.values.staff_form.contact_info.province,
                    'country': formData.values.staff_form.contact_info.country,
                    'postal_code': formData.values.staff_form.contact_info.postal_code,
                    'gender': formData.values.staff_form.staff_info.gender,
                    'role': "STAFF",
                    'pin_code': formData.values.staff_form.staff_info.pin_code,
                    'password': formData.values.staff_form.staff_info.password,
                    'position': formData.values.staff_form.staff_info.position,
                }

                var staffResponse = await signUpNewUser(staffFormattedForm, "STAFF", navigate);
                if (staffResponse!= null && staffResponse!= undefined && staffResponse == true) {
                    // show success notification
                    setTimeout(() => {
                        notifications.update({
                            id,
                            color: 'teal',
                            title: 'Success',
                            message: 'Staff was created.',
                            icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                            loading: false,
                            autoClose: 1000,
                            classNames: notiicationClasses,
                        });
                    }, 500);
                }
                else {
                    // show error notification
                    setTimeout(() => {
                        notifications.update({
                            id,
                            color: 'red',
                            title: 'Error',
                            message: 'There was an error creating the user. Please try again.',
                            icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                            loading: false,
                            autoClose: 1500,
                            classNames: notiicationClasses,
                        });
                    }, 500);
                }
                break;
            case "USER":
                // POST new user
                console.log(formData.values.user_form);

                // user form
                var userFormattedForm = {
                    'uid': GenerateUUID(),
                    //'username': formData.values.user_form.user_info.username,
                    'first_name': formData.values.user_form.user_info.first_name,
                    'last_name': formData.values.user_form.user_info.last_name,
                    //'email': formData.values.user_form.user_info.email,
                    'date_of_birth': formData.values.user_form.user_info.date_of_birth.toISOString().split('T')[0],
                    'cell_number': formData.values.user_form.contact_info.cell_number,
                    'home_number': formData.values.user_form.contact_info.home_number,
                    'work_number': formData.values.user_form.contact_info.work_number,
                    'street': formData.values.user_form.contact_info.street,
                    'street_2': formData.values.user_form.contact_info.street_2,
                    'city': formData.values.user_form.contact_info.city,
                    'province': formData.values.user_form.contact_info.province,
                    'country': formData.values.user_form.contact_info.country,
                    'postal_code': formData.values.user_form.contact_info.postal_code,
                    'gender': formData.values.user_form.user_info.gender,
                    'role': "USER",
                    //'pin_code': formData.values.user_form.user_info.pin_code,
                    //'password': formData.values.user_form.user_info.password,
                    'date_joined': new Date().toISOString().split('T')[0],
                    'request_type': 'Register',
                }

                // parent form
                var parentFormattedForm = {
                    'uid': GenerateUUID(),
                    //'username': formData.values.parent_form.parent_info.username,
                    'first_name': formData.values.parent_form.parent_info.first_name,
                    'last_name': formData.values.parent_form.parent_info.last_name,
                    'email': formData.values.parent_form.contact_info.email,
                    'cell_number': formData.values.parent_form.contact_info.cell_number,
                    'home_number': formData.values.parent_form.contact_info.home_number,
                    'work_number': formData.values.parent_form.contact_info.work_number,
                    'street': formData.values.parent_form.contact_info.street,
                    'street_2': formData.values.parent_form.contact_info.street_2,
                    'city': formData.values.parent_form.contact_info.city,
                    'province': formData.values.parent_form.contact_info.province,
                    'country': formData.values.parent_form.contact_info.country,
                    'postal_code': formData.values.parent_form.contact_info.postal_code,
                    'gender': formData.values.parent_form.parent_info.gender,
                    'relationship_type': formData.values.parent_form.parent_info.relationship,
                    'role': "PARENT",
                    //'pin_code': formData.values.parent_form.parent_info.pin_code,
                    //'password': formData.values.parent_form.parent_info.password,
                }
                
                // combined formatted form
                var formattedForm = {
                    'user_info': userFormattedForm,
                    'parent_info': parentFormattedForm,
                    'business_id': formData.values.business_id,
                    'role': "USER",
                }

                // POST new user + parent on django server
                var userResponse = await PostUser(formattedForm, session?.access_token);
                if (userResponse != null && userResponse.toString() == "201") {
                    // show success notification
                    setTimeout(() => {
                        notifications.update({
                            id,
                            color: 'teal',
                            title: 'Success',
                            message: 'User was created.',
                            icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                            loading: false,
                            autoClose: 1000,
                            classNames: notiicationClasses,
                        });
                    }, 500);
                }
                else {
                    // show error notification
                    setTimeout(() => {
                        notifications.update({
                            id,
                            color: 'red',
                            title: 'Error',
                            message: 'There was an error creating the user. Please try again.',
                            icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                            loading: false,
                            autoClose: 1500,
                            classNames: notiicationClasses,
                        });
                    }, 500);
                }
                break;
        }
    }

    // update the proper form when the form changes
    function handleFormChanges(form: any, type: string) {
        console.log(form);  
        switch(type) {
            // business form
            case 'BUSINESS':
                switch(form.section) {
                    case 'business_info':
                        businessFormFields.values.business_info = form;
                        //businessFormFields.setFieldValue('business_info', form);
                        break;
                    case 'business_payroll_info':
                        businessFormFields.values.business_payroll_info = form;
                        //businessFormFields.setFieldValue('business_payroll_info', form);
                        break;
                    case 'business_contact_info':
                        businessFormFields.values.business_contact_info = form;
                        //businessFormFields.setFieldValue('business_contact_info', form);
                        break;
                    case 'business_preferences':
                        businessFormFields.values.business_preferences = form;
                        //businessFormFields.setFieldValue('business_preferences', form);
                        break;
                    case 'business_employment_positions':
                        businessFormFields.values.business_employment_positions = form;
                        //businessFormFields.setFieldValue('business_employment_positions', form);
                        break;
                }
                formData.values.business_form = businessFormFields;
                console.log("formdata ");
                console.log(formData.values);
                break;
            // owner form
            case 'OWNER':
                switch(form.values.section) {
                    case 'owner_info':
                        ownerFormFields.values.owner_info = form.values.owner_info;
                        break;
                    case 'contact_info':
                        ownerFormFields.values.owner_contact_info = form.values.contact_info;
                        break;
                }
                var ownerForm = {
                    'owner_info': ownerFormFields.values.owner_info,
                    'contact_info': ownerFormFields.values.owner_contact_info,
                    'role': 'OWNER',
                }
                formData.values.owner_form = ownerForm
                break;
            // staff form
            case'STAFF':
                switch(form.values.section) {
                    case 'staff_info':
                        staffFormFields.values.staff_info = form.values.staff_info;
                        break;
                    case'contact_info':
                        staffFormFields.values.staff_contact_info = form.values.contact_info;
                        break;
                    case 'emergency_contact_info':
                        staffFormFields.values.emergency_contact_info = form.values.emergency_contact_info;
                        break;
                }
                var staffForm = {
                    'staff_info': staffFormFields.values.staff_info,
                    'contact_info': staffFormFields.values.staff_contact_info,
                    'emergency_contact_info': staffFormFields.values.emergency_contact_info,
                    'role': "STAFF",
                }
                formData.values.staff_form = staffForm
                break;
            // parent form
            case 'PARENT':
                switch(form.values.section) {
                    case 'parent_info':
                        userFormFields.values.parent_info = form.values.parent_info;
                        break;
                    case 'contact_info':
                        userFormFields.values.parent_contact_info = form.values.contact_info;
                        break;
                }
                var parentForm = {
                    'parent_info': userFormFields.values.parent_info,
                    'contact_info': userFormFields.values.parent_contact_info,
                    'role': 'PARENT',
                }
                formData.values.parent_form = parentForm;
                break;
            // user form
            case 'USER':
                switch(form.values.section) {
                    case 'user_info':
                        userFormFields.values.user_info = form.values.user_info;
                        break;
                    case 'contact_info':
                        userFormFields.values.user_contact_info = form.values.contact_info;
                        break;
                    case 'parent_info':
                        userFormFields.values.parent_info = form.values.parent_info;
                        break;
                    case 'parent_contact_info':
                        userFormFields.values.parent_contact_info = form.values.contact_info;
                        break;
                    case 'emergency_contact_info':
                        userFormFields.values.emergency_contact_info = form.values.emergency_contact_info;
                        break;
                }
                var userForm = {
                    'user_info': userFormFields.values.user_info,
                    'contact_info': userFormFields.values.user_contact_info,
                    'parent_info': userFormFields.values.parent_info,
                    'parent_contact_info': userFormFields.values.parent_contact_info,
                    'emergency_contact_info': userFormFields.values.emergency_contact_info,
                    'role': 'USER',
                }
                formData.values.user_form = userForm;
                break;
            default:
                break;
        }
    }

    const handleTimeInputChange = (value: string, day: string) => {
        // Handle time change logic here
        console.log("Day=" + day + " Time=" + value)
    };

    const selectedWeekdaysHours = selectedWeekdays.map((day) => (
        <Group key={day}>
            <Text>{day}</Text>
            <TimeInputSelectBase handleTimeChange={(value: string) => handleTimeInputChange(value, day)} />
        </Group>
    ));

    const rows = selectedWeekdays.map((element) => (
        <Table.Tr key={element}>
          <Table.Td><Text size="lg" fw={700}>{element}</Text></Table.Td>
          <Table.Td>
            <TimeInputSelectBase handleTimeChange={(value: string) => handleTimeInputChange(value, element)} />
          </Table.Td>
          <Table.Td>
            <TimeInputSelectBase handleTimeChange={(value: string) => handleTimeInputChange(value, element)} />
          </Table.Td>
        </Table.Tr>
    ));

    
    const businessContactForm = (
        <Accordion.Item key="" value="contact">
            <Accordion.Control icon="">Business contact information</Accordion.Control>
            <Accordion.Panel>Business contact forms</Accordion.Panel>
        </Accordion.Item>
    );
    
    const businessOtherForm = (
        <Accordion.Item key="" value="other">
            <Accordion.Control icon="">Other information</Accordion.Control>
            <Accordion.Panel>Other information text area</Accordion.Panel>
        </Accordion.Item>
    );
    
    const businessFormAccordionList = [
        {
            uid: randomId(),
            emoji: <IconBuilding/>,
            value: 'Business',
            title: 'Business information',
            //description: businessInfoForm,
            description: <BusinessInformationForm handleFormChanges={(form) => handleFormChanges(form, 'BUSINESS')}/>,
        },
        {
            uid: randomId(),
            emoji: <IconPhone/>,
            value: 'Contact',
            title: 'Business contact information',
            //description: businessContactForm,
            description: <BusinessContactForm handleFormChanges={(form) => handleFormChanges(form, 'BUSINESS')}/>,
        },
        {
            uid: randomId(),
            emoji: <IconInfoCircle/>,
            value: 'Payroll',
            title: 'Payroll information',
            //description: businessOtherForm,
            description: <BusinessPayrollForm handleGenerateHoliday={handleGenerateHolidays} payrollData={payrollData} handleFormChanges={(form) => handleFormChanges(form, 'BUSINESS')}/>
        },
        {
            uid: randomId(),
            emoji: <IconUsersGroup/>,
            value: 'staff',
            title: 'Employment positions customization',
            //description: <BusinessStaffCustomizationForm employmentPositionData={employmentPositionData} />,
            description: <BusinessStaffCustomizationForm employmentPositionData={employmentPositionData} handleFormChanges={(form) => handleFormChanges(form, 'BUSINESS')}/>,
        },
        {
            uid: randomId(),
            emoji: <IconSettings/>,
            value: 'preferences',
            title: 'Preferences',
            description: <BusinessPreferencesForm handleFormChanges={(form) => handleFormChanges(form, 'BUSINESS')}/>,
        },
    ];

    const ownerFormAccordionList = [
        {
            uid: randomId(),
            emoji: <IconBuilding/>,
            value: 'Owner',
            title: 'Owner information',
            //description: businessInfoForm,
            description: <OwnerInformationForm handleFormChanges={(form) => handleFormChanges(form, 'OWNER')}/>,
        },
        {
            uid: randomId(),
            emoji: <IconPhone/>,
            value: 'Contact',
            title: 'Contact information',
            description: <ContactInformationForm handleFormChanges={(form) => handleFormChanges(form, 'OWNER')}/>,
        },
    ];

    const staffFormAccordionList = [
        {
            uid: randomId(),
            emoji: <IconUser/>,
            value: 'Staff',
            title: 'Staff information',
            description: <StaffInformationForm handleFormChanges={(form) => handleFormChanges(form, 'STAFF')}/>,
        },
        {
            uid: randomId(),
            emoji: <IconPhone/>,
            value: 'Contact',
            title: 'Contact information',
            description: <ContactInformationForm handleFormChanges={(form) => handleFormChanges(form, 'STAFF')}/>,
        },
        {
            uid: randomId(),
            emoji: <IconPhone/>,
            value: 'Emergency',
            title: 'Emergency contact information',
            description: <EmergencyContactForm handleFormChanges={(form) => handleFormChanges(form, 'STAFF')}/>,
        },
    ];

    const userFormAccordionList = [
        {
            uid: randomId(),
            emoji: <IconUser/>,
            value: 'User',
            title: 'User information',
            description: <UserInformationForm handleFormChanges={(form) => handleFormChanges(form, 'USER')}/>,
        },
        {
            uid: randomId(),
            emoji: <IconPhone/>,
            value: 'Contact',
            title: 'Contact information',
            description: <ContactInformationForm handleFormChanges={(form) => handleFormChanges(form, 'USER')}/>,
        },
        {
            uid: randomId(),
            emoji: <IconPhone/>,
            value: 'ParentInformation',
            title: 'Parent/Guardian information',
            description: <ParentInformationForm handleFormChanges={(form) => handleFormChanges(form, 'PARENT')}/>,
        },
        {
            uid: randomId(),
            emoji: <IconPhone/>,
            value: 'ParentContact',
            title: 'Parent/Guardian contact information',
            description: <ContactInformationForm handleFormChanges={(form) => handleFormChanges(form, 'PARENT')}/>,
        },
        {
            uid: randomId(),
            emoji: <IconPhone/>,
            value: 'Emergency',
            title: 'Emergency contact information',
            description: <EmergencyContactForm handleFormChanges={(form) => handleFormChanges(form, 'USER')}/>,
        },
    ];

    const parentFormAccordionList = [
        {
            uid: randomId(),
            emoji: <IconUser/>,
            value: 'ParentInformation',
            title: 'Parent/Guardian information',
            description: <ParentInformationForm handleFormChanges={(form) => handleFormChanges(form, 'PARENT')}/>,
        },
        {
            uid: randomId(),
            emoji: <IconPhone/>,
            value: 'ParentContact',
            title: 'Parent/Guardian contact information',
            description: <ContactInformationForm handleFormChanges={(form) => handleFormChanges(form, 'PARENT')}/>,
        },
    ];

    function handleTimeChange(value: string, type: string) {
        let [hourMinute, amPm] = value.split(" "); // HH:MM A
        var timeSplit = hourMinute.split(":"); // HH:MM
        let hoursInt = Number(timeSplit[0]);
        let minutes = timeSplit[1];
        let newTime = "";
    
        // rebuild the string combining all parts and convert into HH:MM:SS
        if (amPm == 'PM' && hoursInt < 12) {
            hoursInt = hoursInt + 12; // convert to 24 hours
        }
    
        // check if '12:-- AM' => convert to 00:MM:00 (12:-- AM) instead of 12:MM:00 (12:-- PM)
        if (amPm == 'AM' && hoursInt == 12) {
            newTime = "00:" + minutes + ":00"; // 00:MM:00
        }
        else {
            newTime = hoursInt + ":" + minutes + ":00"; // HH:MM:00
        }
        //console.log("NEw time= " + newTime);
        if (type == "start") {
            setStartTime(newTime);
        }
        else {
            setEndTime(newTime);
        }
    }

    function handleAccordionChange(value: string | null) {
        if (value != null) {
            let currentIndex;
            let nextIndex;
            let newIndex;
            switch (formType) {
                case 'BUSINESS':
                    currentIndex = businessFormAccordionList.findIndex((item) => item.value === openedItem);
                    newIndex = businessFormAccordionList.findIndex((item) => item.value === value);
                    if (newIndex > currentIndex) {
                        // go forward
                        if (currentIndex != businessFormAccordionList.length - 1) {
                            nextIndex = (currentIndex + 1) % businessFormAccordionList.length;
                            if(nextIndex == businessFormAccordionList.length - 1) {
                                setEndOfForm(true); // change next step to submit on last step
                            }
                            else {
                                setEndOfForm(false);
                            }
                            setOpenedItem(businessFormAccordionList[nextIndex].value);
                        }
                    }
                    else {
                        // go back
                        if (currentIndex > 0) {
                            const prevIndex = (currentIndex - 1 + businessFormAccordionList.length) % businessFormAccordionList.length;
                            setOpenedItem(businessFormAccordionList[prevIndex].value);
                            setEndOfForm(false);
                        }
                    }
                    break;
                case 'OWNER':
                    // get owner index
                    currentIndex = ownerFormAccordionList.findIndex((item) => item.value === openedItem);
                    newIndex = ownerFormAccordionList.findIndex((item) => item.value === value);
                    if (newIndex > currentIndex) {
                        // go forward
                        if (currentIndex != ownerFormAccordionList.length - 1) {
                            nextIndex = (currentIndex + 1) % ownerFormAccordionList.length;
                            if(nextIndex == ownerFormAccordionList.length - 1) {
                                setEndOfForm(true); // change next step to submit on last step
                            }
                            else {
                                setEndOfForm(false);
                            }
                            setOpenedItem(ownerFormAccordionList[nextIndex].value);
                        }
                    }
                    else {
                        // go back
                        if (currentIndex > 0) {
                            const prevIndex = (currentIndex - 1 + ownerFormAccordionList.length) % ownerFormAccordionList.length;
                            setOpenedItem(ownerFormAccordionList[prevIndex].value);
                            setEndOfForm(false);
                        }
                    }
                    break;
                case 'STAFF':
                    currentIndex = staffFormAccordionList.findIndex((item) => item.value === openedItem);
                    newIndex = staffFormAccordionList.findIndex((item) => item.value === value);
                    if (newIndex > currentIndex) {
                        // go forward
                        if (currentIndex != staffFormAccordionList.length - 1) {
                            nextIndex = (currentIndex + 1) % staffFormAccordionList.length;
                            if(nextIndex == staffFormAccordionList.length - 1) {
                                setEndOfForm(true); // change next step to submit on last step
                            }
                            else {
                                setEndOfForm(false);
                            }
                            setOpenedItem(staffFormAccordionList[nextIndex].value);
                        }
                    }
                    else {
                        // go back
                        if (currentIndex > 0) {
                            const prevIndex = (currentIndex - 1 + staffFormAccordionList.length) % staffFormAccordionList.length;
                            setOpenedItem(staffFormAccordionList[prevIndex].value);
                            setEndOfForm(false);
                        }
                    }
                    break;
                case 'USER':
                    // get user index
                    currentIndex = userFormAccordionList.findIndex((item) => item.value === openedItem);
                    newIndex = userFormAccordionList.findIndex((item) => item.value === value);
                    if (newIndex > currentIndex) {
                        // go forward
                        if (currentIndex != userFormAccordionList.length - 1) {
                            nextIndex = (currentIndex + 1) % userFormAccordionList.length;
                            if(nextIndex == userFormAccordionList.length - 1) {
                                setEndOfForm(true); // change next step to submit on last step
                            }
                            else {
                                setEndOfForm(false);
                            }
                            setOpenedItem(userFormAccordionList[nextIndex].value);
                        }
                    }
                    else {
                        // go back
                        if (currentIndex > 0) {
                            const prevIndex = (currentIndex - 1 + userFormAccordionList.length) % userFormAccordionList.length;
                            setOpenedItem(userFormAccordionList[prevIndex].value);
                            setEndOfForm(false);
                        }
                    }
                    break;
                case 'PARENT':
                    // get parent index
                    currentIndex = parentFormAccordionList.findIndex((item) => item.value === openedItem);
                    newIndex = parentFormAccordionList.findIndex((item) => item.value === value);
                    if (newIndex > currentIndex) {
                        // go forward
                        if (currentIndex != parentFormAccordionList.length - 1) {
                            nextIndex = (currentIndex + 1) % parentFormAccordionList.length;
                            if(nextIndex == parentFormAccordionList.length - 1) {
                                setEndOfForm(true); // change next step to submit on last step
                            }
                            else {
                                setEndOfForm(false);
                            }
                            setOpenedItem(parentFormAccordionList[nextIndex].value);
                        }
                    }
                    else {
                        // go back
                        if (currentIndex > 0) {
                            const prevIndex = (currentIndex - 1 + parentFormAccordionList.length) % parentFormAccordionList.length;
                            setOpenedItem(parentFormAccordionList[prevIndex].value);
                            setEndOfForm(false);
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }


    // accordion forms
    const businessForm = businessFormAccordionList.map((item) => (
        <Accordion.Item 
            key={item.value} 
            value={item.value}
            style={{ background: "transparent", border:"transparent" }} 
            c="#dcdcdc"
        >
            <Paper shadow="md" pl="sm" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                <Accordion.Control icon={item.emoji} p="md" c="#dcdcdc" style={{ borderRadius:"15px" }}>
                    <Text size="25px" c="#dcdcdc" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{item.title}</Text>
                </Accordion.Control>
            </Paper>
            <Accordion.Panel 
                mt="sm"
                p="lg"
                style={{ borderRadius:"15px", backgroundColor:"#25352F"}}
            >
                {item.description}
            </Accordion.Panel>
        </Accordion.Item>
    ));

    const ownerForm = ownerFormAccordionList.map((item) => (
        <Accordion.Item 
            key={item.value} 
            value={item.value}
            style={{ background: "transparent", border:"transparent" }} 
            c="#dcdcdc"
        >
            <Paper shadow="md" pl="sm" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                <Accordion.Control icon={item.emoji} p="md" c="#dcdcdc" style={{ borderRadius:"15px" }}>
                    <Title order={2}>{item.title}</Title>
                </Accordion.Control>
            </Paper>
            <Accordion.Panel 
                mt="sm"
                p="lg"
                style={{ borderRadius:"15px", backgroundColor:"#25352F" }}
            >
                {item.description}
            </Accordion.Panel>
        </Accordion.Item>
    ));

    const staffForm = staffFormAccordionList.map((item) => (
        <Accordion.Item 
            key={item.value} 
            value={item.value}
            style={{ background: "transparent", border:"transparent" }} 
            c="#dcdcdc"
        >
            <Paper shadow="md" pl="sm" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                <Accordion.Control icon={item.emoji} p="md" c="#dcdcdc" style={{ borderRadius:"15px" }}>
                    <Title order={2}>{item.title}</Title>
                </Accordion.Control>
            </Paper>
            <Accordion.Panel 
                mt="sm"
                p="lg"
                style={{ borderRadius:"15px", backgroundColor:"#25352F" }}
            >
                {item.description}
            </Accordion.Panel>
        </Accordion.Item>
    ));

    const userForm = userFormAccordionList.map((item) => (
        <Accordion.Item 
            key={item.value} 
            value={item.value}
            style={{ background: "transparent", border:"transparent" }} 
            c="#dcdcdc"
        >
            <Paper shadow="md" pl="sm" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                <Accordion.Control icon={item.emoji} p="md" c="#dcdcdc" style={{ borderRadius:"15px" }}>
                    <Title order={2}>{item.title}</Title>
                </Accordion.Control>
            </Paper>
            <Accordion.Panel 
                mt="sm"
                p="lg"
                style={{ borderRadius:"15px", backgroundColor:"#25352F" }}
            >
                {item.description}
            </Accordion.Panel>
        </Accordion.Item>
    ));

    const parentForm = parentFormAccordionList.map((item) => (
        <Accordion.Item 
            key={item.value} 
            value={item.value}
            style={{ background: "transparent", border:"transparent" }} 
            c="#dcdcdc"
        >
            <Paper shadow="md" pl="sm" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                <Accordion.Control icon={item.emoji} p="md" c="#dcdcdc" style={{ borderRadius:"15px" }}>
                    <Title order={2}>{item.title}</Title>
                </Accordion.Control>
            </Paper>
            <Accordion.Panel 
                mt="sm"
                p="lg"
                style={{ borderRadius:"15px", backgroundColor:"#25352F" }}
            >
                {item.description}
            </Accordion.Panel>
        </Accordion.Item>
    ));

    // go to next accordion
    const handleNextAccordion = () => {
        let currentIndex;
        let nextIndex;
        switch (formType) {
            case 'BUSINESS':
                currentIndex = businessFormAccordionList.findIndex((item) => item.value === openedItem);
                if (currentIndex != businessFormAccordionList.length - 1) {
                    nextIndex = (currentIndex + 1) % businessFormAccordionList.length;
                    setOpenedItem(businessFormAccordionList[nextIndex].value);
                }
                if(nextIndex == businessFormAccordionList.length - 1) {
                    // change next step to submit on last step
                    setEndOfForm(true);
                }
                break;
            case 'OWNER':
                // get owner index
                currentIndex = ownerFormAccordionList.findIndex((item) => item.value === openedItem);
                if (currentIndex != ownerFormAccordionList.length - 1) {
                    nextIndex = (currentIndex + 1) % ownerFormAccordionList.length;
                    setOpenedItem(ownerFormAccordionList[nextIndex].value);
                }
                if(nextIndex == ownerFormAccordionList.length - 1) {
                    // change next step to submit on last step
                    setEndOfForm(true);
                }
                break;
            case 'STAFF':
                currentIndex = staffFormAccordionList.findIndex((item) => item.value === openedItem);
                if (currentIndex != staffFormAccordionList.length - 1) {
                    nextIndex = (currentIndex + 1) % staffFormAccordionList.length;
                    setOpenedItem(staffFormAccordionList[nextIndex].value);
                }
                if(nextIndex == staffFormAccordionList.length - 1) {
                    // change next step to submit on last step
                    setEndOfForm(true);
                }
                break;
            case 'USER':
                // get user index
                currentIndex = userFormAccordionList.findIndex((item) => item.value === openedItem);
                if (currentIndex != userFormAccordionList.length - 1) {
                    nextIndex = (currentIndex + 1) % userFormAccordionList.length;
                    setOpenedItem(userFormAccordionList[nextIndex].value);
                }
                if(nextIndex == userFormAccordionList.length - 1) {
                    // change next step to submit on last step
                    setEndOfForm(true);
                }
                break;
            case 'PARENT':
                // get parent index
                currentIndex = parentFormAccordionList.findIndex((item) => item.value === openedItem);
                if (currentIndex != parentFormAccordionList.length - 1) {
                    nextIndex = (currentIndex + 1) % parentFormAccordionList.length;
                    setOpenedItem(parentFormAccordionList[nextIndex].value);
                }
                if(nextIndex == parentFormAccordionList.length - 1) {
                    // change next step to submit on last step
                    setEndOfForm(true);
                }
                break;
            default:
                break;
        }
    };

    // go to previous accordion
    const handlePrevAccordion = () => {
        let currentIndex;
        switch (formType) {
            case 'BUSINESS':
                currentIndex = businessFormAccordionList.findIndex((item) => item.value === openedItem);
                if (currentIndex > 0) {
                    const prevIndex = (currentIndex - 1 + businessFormAccordionList.length) % businessFormAccordionList.length;
                    setOpenedItem(businessFormAccordionList[prevIndex].value);
                    setEndOfForm(false);
                }
                break;
            case 'OWNER':
                currentIndex = ownerFormAccordionList.findIndex((item) => item.value === openedItem);
                if (currentIndex > 0) {
                    const prevIndex = (currentIndex - 1 + ownerFormAccordionList.length) % ownerFormAccordionList.length;
                    setOpenedItem(ownerFormAccordionList[prevIndex].value);
                    setEndOfForm(false);
                }
                break;
            case 'STAFF':
                currentIndex = staffFormAccordionList.findIndex((item) => item.value === openedItem);
                if (currentIndex > 0) {
                    const prevIndex = (currentIndex - 1 + staffFormAccordionList.length) % staffFormAccordionList.length;
                    setOpenedItem(staffFormAccordionList[prevIndex].value);
                    setEndOfForm(false);
                }
                break;
            case 'USER':
                currentIndex = userFormAccordionList.findIndex((item) => item.value === openedItem);
                if (currentIndex > 0) {
                    const prevIndex = (currentIndex - 1 + userFormAccordionList.length) % userFormAccordionList.length;
                    setOpenedItem(userFormAccordionList[prevIndex].value);
                    setEndOfForm(false);
                }
                break;
            case 'PARENT':
                currentIndex = parentFormAccordionList.findIndex((item) => item.value === openedItem);
                if (currentIndex > 0) {
                    const prevIndex = (currentIndex - 1 + parentFormAccordionList.length) % parentFormAccordionList.length;
                    setOpenedItem(parentFormAccordionList[prevIndex].value);
                    setEndOfForm(false);
                }
                break;
            default:
                break;
        }
    };

    return (
        <>
            {/* <Container size="lg"> */}
                <Accordion 
                    defaultValue={openedItem} 
                    value={openedItem} 
                    onChange={handleAccordionChange} 
                    variant="separated"
                    radius="md"
                >
                    {formType == "BUSINESS" && businessForm}
                    {formType == "OWNER" && ownerForm}
                    {formType == "STAFF" && staffForm}
                    {formType == "USER" && userForm}
                    {formType == "PARENT" && parentForm}
                </Accordion>
                <Space h="lg"/>
                <Group justify="space-between">
                    <Button 
                        //fullWidth 
                        variant="light" 
                        size="lg" 
                        radius="md" 
                        color="gray"
                        onClick={handlePrevAccordion}
                    >
                        <Title order={4}>Previous step</Title>
                    </Button>
                    {endOfForm && (
                        <Button 
                            //fullWidth 
                            size="lg" 
                            radius="md" 
                            onClick={handleSubmit}
                            color="#4a8a2a"
                        >
                            <Title order={4}>Submit</Title>
                        </Button>
                    )}
                    {!endOfForm && (
                        <Button 
                            //fullWidth 
                            color="#2a758a"
                            size="lg" 
                            radius="md" 
                            onClick={handleNextAccordion}
                        >
                            <Title order={4}>Next step</Title>
                        </Button>
                    )}
                </Group>
                <Space h="lg"/>
            {/* </Container> */}
        </>
    );
}
