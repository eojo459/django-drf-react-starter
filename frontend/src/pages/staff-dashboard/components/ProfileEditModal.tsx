import { Button, Grid, Group, Modal, Select, TextInput, Title, Text, rem, NumberInput, Switch, useMantineTheme } from "@mantine/core";
import { canadaProvinceData, countryData, genderSelectData, staffBaseTypeData, usaStateData } from "../../../helpers/SelectData";
import classes from "../../../css/TextInput.module.css";
import { StaffWorkingHours, UserProfileModel, UserProfilePosition } from "../../../components/UserProfile";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { FormProvider } from "antd/es/form/context";
import { formatDate, isNullOrEmpty } from "../../../helpers/Helpers";
import { GetEmploymentPositionType, GetEmploymentPositionsByEmploymentTypeId, PatchStaff, PatchStaffWorkingHours, PatchUserById as PatchUser } from "../../../helpers/Api";
import { useAuth } from "../../../authentication/SupabaseAuthContext";
import classes2 from "../../../css/ProfileEditModal.module.css";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../../../css/Notifications.module.css";
import { IconCheck, IconX } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { theme } from "antd";

interface IProfileEditModal {
    user: UserProfileModel;
    modalOpened: boolean;
    isMobile: boolean;
    closeModal: () => void;
    formSubmitted: (submitFlag: boolean) => void;
    //userProfileData: (reason: string) => void; // get user profile data from parent
}

export default function ProfileEditModal(props: IProfileEditModal) {
    const { user, business, session } = useAuth();
    const theme = useMantineTheme();
    const [selectedCountry, setSelectedCountry] = useState<string | null>('');
    const [provinceStateData, setProvinceStateData] = useState(canadaProvinceData);
    const [usaSelected, setUsaSelected] = useState(false);
    const [provinceTextbox, setProvinceTextbox] = useState(true);
    const [holidayChecked, setHolidayChecked] = useState(true);
    const [overtimeChecked, setOvertimeChecked] = useState(false);
    const [vacationChecked, setVacationChecked] = useState(false);
    const [sickLeaveChecked, setSickLeaveChecked] = useState(false);
    const [isManagerChecked, setIsManagerChecked] = useState(false);
    const [isSalariedChecked, setIsSalariedChecked] = useState(false);
    const [isFulltimeChecked, setIsFulltimeChecked] = useState(false);
    const [isActiveChecked, setIsActiveChecked] = useState(false);
    const [payRate, setPayRate] = useState<string | number>(0);
    const [selectedEmploymentType, setSelectedEmploymentType] = useState<string | null>();
    const [selectedPositionLabel, setSelectedPositionLabel] = useState<string | null>();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [positionData, setPositionData] = useState<UserProfilePosition>();
    const [positionSelectData, setPositionSelectData] = useState<any[]>([]);

    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const userDataProp = props.user;
    const formSubmittedProp = props.formSubmitted;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            first_name: userDataProp ? userDataProp.first_name : '',
            last_name: userDataProp ? userDataProp.last_name : '',
            street: userDataProp ? userDataProp.street : '',
            street_2: userDataProp ? userDataProp.street_2 : '',
            city: userDataProp ? userDataProp.city : '',
            country: userDataProp ? userDataProp.country : '',
            province: userDataProp ? userDataProp.province : '',
            postal_code: userDataProp ? userDataProp.postal_code : '',
            cell_number: userDataProp ? userDataProp.cell_number : '',
            work_number: userDataProp ? userDataProp.work_number : '',
            home_number: userDataProp ? userDataProp.home_number : '',
            email: userDataProp ? userDataProp.email : '',
            gender: userDataProp ? userDataProp.gender : '',
            username: userDataProp ? userDataProp.username : '',
            password: '',
            pin_code: '',
            level: userDataProp ? userDataProp?.working_hours?.level : 0,
            is_manager: isManagerChecked,
            active: userDataProp ? userDataProp.active : false,
            position:
            {
                id: userDataProp ? userDataProp?.position?.id : '',
                label: userDataProp ? userDataProp?.position?.label : '',
                employment_type_id: userDataProp ? userDataProp?.position?.employment_type_id : '',
                employment_type: userDataProp ? userDataProp?.position?.employment_type : '',
            },
        },
        // validate: (value) => {
        //     return {
        //         first_name: value.staff_info.first_name.trim().length <= 0 ? 'First name is required' : null,
        //         last_name: value.staff_info.last_name.trim().length <= 0 ? 'Last name is required' : null,
        //         position: value.staff_info.position.employment_type_id.trim().length <= 0 ? 'Position is required' : null,
        //         gender: value.staff_info.gender.trim().length <= 0 ? 'Gender is required' : null,
        //     }
        // }
    });

    const staffWorkingHoursForm = useForm({
        initialValues: {
            holiday_allowed: userDataProp ? userDataProp?.working_hours?.holiday_allowed : holidayChecked,
            overtime_allowed: userDataProp ? userDataProp?.working_hours?.overtime_allowed : overtimeChecked,
            vacation_allowed: userDataProp ? userDataProp?.working_hours?.vacation_allowed : vacationChecked,
            sick_allowed: userDataProp ? userDataProp?.working_hours?.sick_allowed : sickLeaveChecked,
            full_time: userDataProp ? userDataProp?.working_hours?.full_time : isFulltimeChecked,
            salaried: userDataProp ? userDataProp?.working_hours?.salaried : isSalariedChecked,
            pay_rate: userDataProp ? userDataProp?.working_hours?.pay_rate : '',
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
            is_manager: userDataProp ? userDataProp?.working_hours?.is_manager : isManagerChecked,
        }
    });

    useEffect(() => {
        console.log('form');
        console.log(form.values);
        console.log(staffWorkingHoursForm.values);
        handleStateLoad();
    }, []);

    useEffect(() => {
        var selectedEmploymentType = form.values.position.employment_type;
        if (selectedEmploymentType && selectedEmploymentType?.length > 0) {
            // fetch positions for this employment type
            //setSelectedPositionLabel(null);
            if (form.isTouched('position.employment_type')) {
                form.setFieldValue('position.id', null);
            }

            fetchPositionData();
        }
    }, [form.values.position.employment_type]);

    useEffect(() => {
        if (!isNullOrEmpty(selectedCountry) && selectedCountry != null) {
            console.log(selectedCountry);
            form.values.country = selectedCountry;

            switch (selectedCountry) {
                case "Canada":
                    form.values.province = '';
                    form.values.postal_code = '';
                    setProvinceStateData(canadaProvinceData);
                    setUsaSelected(false);
                    setProvinceTextbox(false);
                    break;
                case "United States":
                    form.values.province = '';
                    form.values.postal_code = '';
                    setProvinceStateData(usaStateData);
                    setUsaSelected(true);
                    setProvinceTextbox(false);
                    break;
                default:
                    // show regular textbox
                    form.values.province = '';
                    form.values.postal_code = '';
                    setUsaSelected(false);
                    setProvinceTextbox(true);
                    break;
            }
        }
    }, [selectedCountry]);

    useEffect(() => {
        if (!startDate || startDate == null) return;
        staffWorkingHoursForm.setFieldValue('start_date', formatDate(startDate));
    },[startDate]);

    useEffect(() => {
        staffWorkingHoursForm.setFieldValue('end_date', formatDate(endDate));
    },[endDate]);

    // handle when submit button is clicked
    async function handleSubmit() {
        // notification
        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });

        // patch user info (personal & contact info)
        var response = await PatchUser(userDataProp.uid, form.values, session?.access_token);
        if (response !== 200) {
            // error
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
            }, 5000);
            return;
        }

        // patch and update staff working hours
        var workingHoursResponse = await PatchStaffWorkingHours(userDataProp.uid, staffWorkingHoursForm.values, session?.access_token);
        if (workingHoursResponse !== 200) {
            // error
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error saving. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 3000,
                    classNames: notiicationClasses,
                });
            }, 7000);
            return;
        }

        // update staff position
        var positionData = {
            'position': form.values.position.id,
            'level': form.values.level,
        }
        var positionResponse = await PatchStaff(userDataProp.uid, positionData, session?.access_token);
        if (positionResponse === 200) {
            // success
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'User profile settings saved',
                    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1000,
                    classNames: notiicationClasses,
                });
            }, 1000);
        }
        else {
            // error
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error saving. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 3000,
                    classNames: notiicationClasses,
                });
            }, 7000);
            return;
        }

        formSubmittedProp(true);
        closeModalProp();
    }

    function handleStateLoad() {
        if (userDataProp) {
            setIsActiveChecked(userDataProp?.active);
            setHolidayChecked(userDataProp?.working_hours?.holiday_allowed);
            setOvertimeChecked(userDataProp?.working_hours?.overtime_allowed);
            setVacationChecked(userDataProp?.working_hours?.vacation_allowed);
            setSickLeaveChecked(userDataProp?.working_hours?.sick_allowed);
            setIsFulltimeChecked(userDataProp?.working_hours?.full_time);
            setIsManagerChecked(userDataProp?.working_hours?.is_manager);
            setIsSalariedChecked(userDataProp?.working_hours?.salaried);
            setPayRate(userDataProp?.working_hours?.pay_rate ? userDataProp?.working_hours?.pay_rate : 0);
            setSelectedCountry(userDataProp?.country);
            setSelectedEmploymentType(userDataProp?.position?.employment_type);
            setSelectedPositionLabel(userDataProp?.position?.id);

            staffWorkingHoursForm.values.holiday_allowed = userDataProp?.working_hours?.holiday_allowed;
            staffWorkingHoursForm.values.overtime_allowed = userDataProp?.working_hours?.overtime_allowed;
            staffWorkingHoursForm.values.vacation_allowed = userDataProp?.working_hours?.vacation_allowed;
            staffWorkingHoursForm.values.sick_allowed = userDataProp?.working_hours?.sick_allowed;
            staffWorkingHoursForm.values.pay_rate = userDataProp?.working_hours?.pay_rate;   
            staffWorkingHoursForm.values.start_date = userDataProp?.working_hours?.start_date;
            staffWorkingHoursForm.values.end_date = userDataProp?.working_hours?.end_date ?? '';   
            staffWorkingHoursForm.values.is_manager = userDataProp?.working_hours?.is_manager;
            staffWorkingHoursForm.values.full_time = userDataProp?.working_hours?.full_time;
            staffWorkingHoursForm.values.salaried = userDataProp?.working_hours?.salaried;

            // set start date
            if (userDataProp?.working_hours?.start_date) {
                var startDateParts = userDataProp?.working_hours?.start_date.split('-');
                var year = parseInt(startDateParts[0]);
                var month = parseInt(startDateParts[1]) - 1; // Months are 0-indexed
                var day = parseInt(startDateParts[2]);
                var startDate = new Date(year, month, day);
                setStartDate(startDate);
            }
            else {
                setStartDate(null);
            }

            // set end date
            if (userDataProp?.working_hours?.end_date) {
                var endDateParts = userDataProp?.working_hours?.end_date.split('-');
                year = parseInt(endDateParts[0]);
                month = parseInt(endDateParts[1]) - 1; // Months are 0-indexed
                day = parseInt(endDateParts[2]);
                var endDate = new Date(year, month, day);
                setEndDate(endDate);
            }
            else {
                setEndDate(null);
            }

            //setStartDate(userDataProp?.working_hours?.start_date ? new Date(userDataProp?.working_hours?.start_date) : null);
            //setEndDate(userDataProp?.working_hours?.end_date ? new Date(userDataProp?.working_hours?.end_date) : null);
        }
    }

    function handleStaffWorkingHoursFormChanges() {
        staffWorkingHoursForm.values.holiday_allowed = holidayChecked;
        staffWorkingHoursForm.values.overtime_allowed = overtimeChecked;
        staffWorkingHoursForm.values.vacation_allowed = vacationChecked;
        staffWorkingHoursForm.values.sick_allowed = sickLeaveChecked;
        staffWorkingHoursForm.values.pay_rate = payRate;  
        staffWorkingHoursForm.values.start_date = startDate ? formatDate(startDate) : '';
        staffWorkingHoursForm.values.end_date = endDate ? formatDate(endDate) : '';   
        staffWorkingHoursForm.values.is_manager = isManagerChecked;
        staffWorkingHoursForm.values.full_time = isFulltimeChecked;
    }

    async function fetchPositionData() {
        var selectedEmploymentType = form.values.position.employment_type;
        if (user && selectedEmploymentType && business) {
            // get employment type id from selected position label
            var employmentPosition = await GetEmploymentPositionType(business?.id, selectedEmploymentType, session?.access_token);
            if (employmentPosition === undefined || employmentPosition == null) {
                return;
            }

            // get all positions related to an employment type (ex. all positions related to full time employment)
            var positionData = await GetEmploymentPositionsByEmploymentTypeId(business?.id, employmentPosition['id'], session?.access_token);
            setPositionData(positionData);

            var positionList: any[] = [];
            positionData.forEach((position: UserProfilePosition) => {
                var newPosition = {
                    'value': position.id,
                    'label': position.label,
                };
                positionList.push(newPosition);
            });
            setPositionSelectData(positionList);
        }
    }

    // update form when holiday changes
    function handleHolidayChange(checked: boolean) {
        setHolidayChecked(checked);
        staffWorkingHoursForm.values.holiday_allowed = checked;
    }

    // update form when overtime changes
    function handleOvertimeChange(checked: boolean) {
        setOvertimeChecked(checked);
        staffWorkingHoursForm.values.overtime_allowed = checked;
    }

    // update form when vacation changes
    function handleVacationChange(checked: boolean) {
        setVacationChecked(checked);
        staffWorkingHoursForm.values.vacation_allowed = checked;
    }

    // update form when sick changes
    function handleSickLeaveChange(checked: boolean) {
        setSickLeaveChecked(checked);
        staffWorkingHoursForm.values.sick_allowed = checked;
    }

    // update form when manager changes
    function handleManagerChange(checked: boolean) {
        setIsManagerChecked(checked);
        staffWorkingHoursForm.values.is_manager = checked;
    }

    // update form when full-time changes
    function handleFulltimeChange(checked: boolean) {
        setIsFulltimeChecked(checked);
        staffWorkingHoursForm.values.full_time = checked;
    }

    // update form when salary changes
    function handleSalaryChange(checked: boolean) {
        setIsSalariedChecked(checked);
        staffWorkingHoursForm.values.salaried = checked;
    }

    // update form when payrate changes
    function handlePayrateChange(payRate: string | number) {
        setPayRate(payRate);
        staffWorkingHoursForm.values.pay_rate = payRate;
    }

    // update form when active status changes
    function handleActiveStatusChange(checked: boolean) {
        setIsActiveChecked(checked);
        form.setFieldValue('active', checked);
    }

    return (
        <>
            <Modal
                opened={modalOpenedProp}
                onClose={closeModalProp}
                title={<Text c="#dcdcdc" size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Edit profile</Text>}
                fullScreen={isMobileProp}
                size="60%"
                radius="md"
                classNames={classes2}
                transitionProps={{ transition: 'fade', duration: 200 }}
            >
                <Grid c="#dcdcdc" justify="end">
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Account status</Text>
                    </Grid.Col>

                    {/* account status */}
                    <Grid.Col span={{ base: 12 }}>
                        <Group justify="space-between" wrap="nowrap" gap="xl">
                            <div>
                                {/* <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Account status</Text> */}
                                <Text size="md" c="dimmed" mt="sm">
                                    {userDataProp?.first_name ?? "User"}'s account is set to ACTIVE and will be able to login and perform staff activities. Disabling this option will disable this user's account and prevent them from logging in.
                                </Text>
                            </div>
                            <Switch
                                checked={isActiveChecked}
                                onChange={(event) => {
                                    handleActiveStatusChange(event.currentTarget.checked);
                                }}
                                offLabel="DISABLED"
                                onLabel="ACTIVE"
                                color="#4a8a2a"
                                size="xl"
                                //label={<Text size="xl" fw={700}>Holiday</Text>}
                                thumbIcon={
                                    isActiveChecked ? (
                                        <IconCheck
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.teal[6]}
                                            stroke={3}
                                        />
                                    ) : (
                                        <IconX
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.red[6]}
                                            stroke={3}
                                        />
                                    )
                                }
                            />
                        </Group>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Personal information</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            label="First name"
                            placeholder="First name"
                            size="lg"
                            required
                            classNames={classes}
                            {...form.getInputProps('first_name')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            label="Last name"
                            placeholder="Last name"
                            size="lg"
                            required
                            classNames={classes}
                            {...form.getInputProps('last_name')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Select
                            id="gender"
                            allowDeselect={false}
                            placeholder="Gender"
                            label="Gender"
                            size="lg"
                            classNames={classes}
                            data={genderSelectData}
                            {...form.getInputProps('gender')}
                        >
                        </Select>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Contact information</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <TextInput
                            label="Street"
                            placeholder="Street address"
                            size="lg"
                            required
                            classNames={classes}
                            {...form.getInputProps('street')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <TextInput
                            label="Street 2 (optional)"
                            placeholder="Street address"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('street_2')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            label="City"
                            placeholder="City"
                            size="lg"
                            required
                            classNames={classes}
                            {...form.getInputProps('city')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        {provinceTextbox && (
                            <TextInput
                                required
                                id="province"
                                label="Province"
                                name="province"
                                placeholder="Province"
                                size="lg"
                                classNames={classes}
                                {...form.getInputProps('province')}
                            >
                            </TextInput>
                        )}
                        {!provinceTextbox && (
                            <Select
                                required
                                allowDeselect={false}
                                id="province"
                                label={usaSelected ? "State" : "Province"}
                                name="province"
                                placeholder={usaSelected ? "State" : "Province"}
                                size="lg"
                                classNames={classes}
                                data={provinceStateData}
                                {...form.getInputProps('province')}
                            />
                        )}
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                            required
                            id="country"
                            value={selectedCountry}
                            onChange={setSelectedCountry}
                            allowDeselect={false}
                            placeholder="Country"
                            label="Country"
                            size="lg"
                            classNames={classes}
                            data={countryData}
                        //{...form.getInputProps('country')}
                        >
                        </Select>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            required
                            id="postal-code"
                            label={usaSelected ? "Zip code" : "Postal code"}
                            name="postal_code"
                            placeholder={usaSelected ? "Zip code" : "Postal code"}
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('postal_code')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            label="Cell number"
                            placeholder="Cell number"
                            size="lg"
                            required
                            classNames={classes}
                            {...form.getInputProps('cell_number')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            label="Home number"
                            placeholder="Home number"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('home_number')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            label="Work number"
                            placeholder="Work number"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('work_number')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <TextInput
                            label="Email"
                            placeholder="Email address"
                            size="lg"
                            required
                            classNames={classes}
                            {...form.getInputProps('email')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Employment information</Text>
                    </Grid.Col>

                    {/* holidays */}
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Group justify="space-between" wrap="nowrap" gap="xl">
                            <div>
                                <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Holiday pay</Text>
                                <Text size="md" c="dimmed" mt="sm">
                                    {userDataProp?.first_name ?? "User"} will be paid a holiday rate if they work during holidays.
                                </Text>
                            </div>
                            <Switch
                                checked={holidayChecked}
                                onChange={(event) => {
                                    handleHolidayChange(event.currentTarget.checked);
                                }}
                                offLabel="OFF"
                                onLabel="ON"
                                color="#4a8a2a"
                                size="xl"
                                //label={<Text size="xl" fw={700}>Holiday</Text>}
                                thumbIcon={
                                    holidayChecked ? (
                                        <IconCheck
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.teal[6]}
                                            stroke={3}
                                        />
                                    ) : (
                                        <IconX
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.red[6]}
                                            stroke={3}
                                        />
                                    )
                                }
                            />
                        </Group>
                    </Grid.Col>

                    {/* overtime */}
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Group justify="space-between" wrap="nowrap" gap="xl">
                            <div>
                                <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Overtime pay</Text>
                                <Text size="md" c="dimmed" mt="sm">
                                    {userDataProp?.first_name ?? "User"} will be paid an overtime rate if they exceed their maximum work hours and work overtime.
                                </Text>
                            </div>
                            <Switch
                                checked={overtimeChecked}
                                onChange={(event) => {
                                    handleOvertimeChange(event.currentTarget.checked);
                                }}
                                offLabel="OFF"
                                onLabel="ON"
                                color="#4a8a2a"
                                size="xl"
                                //label={<Text size="xl" fw={700}>Holiday</Text>}
                                thumbIcon={
                                    overtimeChecked ? (
                                        <IconCheck
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.teal[6]}
                                            stroke={3}
                                        />
                                    ) : (
                                        <IconX
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.red[6]}
                                            stroke={3}
                                        />
                                    )
                                }
                            />
                        </Group>
                    </Grid.Col>

                    {/* vacation */}
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Group justify="space-between" wrap="nowrap" gap="xl">
                            <div>
                                <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Vacation pay</Text>
                                <Text size="md" c="dimmed" mt="sm">
                                    {userDataProp?.first_name ?? "User"} will be paid a vacation rate when take any vacation leave.
                                </Text>
                            </div>
                            <Switch
                                checked={vacationChecked}
                                onChange={(event) => {
                                    handleVacationChange(event.currentTarget.checked);
                                }}
                                offLabel="OFF"
                                onLabel="ON"
                                color="#4a8a2a"
                                size="xl"
                                //label={<Text size="xl" fw={700}>Holiday</Text>}
                                thumbIcon={
                                    vacationChecked ? (
                                        <IconCheck
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.teal[6]}
                                            stroke={3}
                                        />
                                    ) : (
                                        <IconX
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.red[6]}
                                            stroke={3}
                                        />
                                    )
                                }
                            />
                        </Group>
                    </Grid.Col>

                    {/* sick */}
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Group justify="space-between" wrap="nowrap" gap="xl">
                            <div>
                                <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Sick leave pay</Text>
                                <Text size="md" c="dimmed" mt="sm">
                                    {userDataProp?.first_name ?? "User"} will be paid a sick leave rate when they take any sick leave.
                                </Text>
                            </div>
                            <Switch
                                checked={sickLeaveChecked}
                                onChange={(event) => {
                                    handleSickLeaveChange(event.currentTarget.checked);
                                }}
                                offLabel="OFF"
                                onLabel="ON"
                                color="#4a8a2a"
                                size="xl"
                                //label={<Text size="xl" fw={700}>Holiday</Text>}
                                thumbIcon={
                                    sickLeaveChecked ? (
                                        <IconCheck
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.teal[6]}
                                            stroke={3}
                                        />
                                    ) : (
                                        <IconX
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.red[6]}
                                            stroke={3}
                                        />
                                    )
                                }
                            />
                        </Group>
                    </Grid.Col>

                    {/* manager permissions */}
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Group justify="space-between" wrap="nowrap" gap="xl">
                            <div>
                                <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Manager permissions</Text>
                                <Text size="md" c="dimmed" mt="sm">
                                    {userDataProp?.first_name ?? "User"} will be given manager permissions and can manage and oversee other staff employees and users.
                                </Text>
                            </div>
                            <Switch
                                checked={isManagerChecked}
                                onChange={(event) => {
                                    handleManagerChange(event.currentTarget.checked);
                                }}
                                offLabel="OFF"
                                onLabel="ON"
                                color="#4a8a2a"
                                size="xl"
                                //label={<Text size="xl" fw={700}>Holiday</Text>}
                                thumbIcon={
                                    isManagerChecked ? (
                                        <IconCheck
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.teal[6]}
                                            stroke={3}
                                        />
                                    ) : (
                                        <IconX
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.red[6]}
                                            stroke={3}
                                        />
                                    )
                                }
                            />
                        </Group>
                    </Grid.Col>

                    {/* full-time field */}
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Group justify="space-between" wrap="nowrap" gap="xl">
                            <div>
                                <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Full-time employee</Text>
                                <Text size="md" c="dimmed" mt="sm">
                                    {userDataProp?.first_name ?? "User"} will be set as a full-time employee.
                                </Text>
                            </div>
                            <Switch
                                checked={isFulltimeChecked}
                                onChange={(event) => {
                                    handleFulltimeChange(event.currentTarget.checked);
                                }}
                                offLabel="OFF"
                                onLabel="ON"
                                color="#4a8a2a"
                                size="xl"
                                //label={<Text size="xl" fw={700}>Holiday</Text>}
                                thumbIcon={
                                    isFulltimeChecked ? (
                                        <IconCheck
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.teal[6]}
                                            stroke={3}
                                        />
                                    ) : (
                                        <IconX
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.red[6]}
                                            stroke={3}
                                        />
                                    )
                                }
                            />
                        </Group>
                    </Grid.Col>

                    {/* salaried field */}
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Group justify="space-between" wrap="nowrap" gap="xl">
                            <div>
                                <Text size="20px" style={{ fontFamily: "AK-Medium" }}>Salaried</Text>
                                <Text size="md" c="dimmed" mt="sm">
                                    {userDataProp?.first_name ?? "User"} will be paid as a salaried employee.
                                </Text>
                            </div>
                            <Switch
                                checked={isSalariedChecked}
                                onChange={(event) => {
                                    handleSalaryChange(event.currentTarget.checked);
                                }}
                                offLabel="OFF"
                                onLabel="ON"
                                color="#4a8a2a"
                                size="xl"
                                //label={<Text size="xl" fw={700}>Holiday</Text>}
                                thumbIcon={
                                    isSalariedChecked ? (
                                        <IconCheck
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.teal[6]}
                                            stroke={3}
                                        />
                                    ) : (
                                        <IconX
                                            style={{ width: rem(12), height: rem(12) }}
                                            color={theme.colors.red[6]}
                                            stroke={3}
                                        />
                                    )
                                }
                            />
                        </Group>
                    </Grid.Col>

                    {isSalariedChecked && (
                        <Grid.Col span={{ base: 12 }}>
                            <NumberInput
                                id="pay-rate"
                                required
                                mb="md"
                                value={payRate}
                                onChange={handlePayrateChange}
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Salary"
                                name="pay_rate"
                                placeholder=""
                                size="lg"
                                prefix="$"
                                suffix=" / year"
                                min={0}
                                max={10000000}
                                thousandSeparator=","
                                decimalScale={2}
                                fixedDecimalScale
                                classNames={classes}
                            />
                        </Grid.Col>
                    )}

                    {!isSalariedChecked && (
                        <Grid.Col span={{ base: 12 }}>
                            <NumberInput
                                id="pay-rate"
                                required
                                mb="md"
                                value={payRate}
                                onChange={handlePayrateChange}
                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                label="Regular hourly pay rate"
                                name="pay_rate"
                                placeholder=""
                                size="lg"
                                prefix="$"
                                suffix=" / hour"
                                min={0}
                                max={1000}
                                thousandSeparator=","
                                decimalScale={2}
                                fixedDecimalScale
                                classNames={classes}
                            />
                        </Grid.Col>
                    )}

                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                            required
                            id="role-type"
                            //value={selectedEmploymentType}
                            //onChange={setSelectedEmploymentType}
                            allowDeselect={false}
                            placeholder="Employment type"
                            label="Employment type"
                            size="lg"
                            classNames={classes}
                            data={staffBaseTypeData}
                            {...form.getInputProps('position.employment_type')}
                        >
                        </Select>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                            required
                            id="label"
                            //value={selectedPositionLabel}
                            //onChange={setSelectedPositionLabel}
                            disabled={selectedEmploymentType == null || selectedEmploymentType === ""}
                            allowDeselect={false}
                            placeholder="Select a title"
                            label="Position title"
                            size="lg"
                            classNames={classes}
                            data={positionSelectData}
                            {...form.getInputProps('position.id')}
                        >
                        </Select>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <TextInput
                            id="level"
                            placeholder="Level"
                            label="Level"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('level')}
                        >
                        </TextInput>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <DatePickerInput
                            label="Start date"
                            required
                            placeholder=""
                            size="lg"
                            value={startDate}
                            onChange={setStartDate}
                            classNames={classes}
                            //{...staffWorkingHoursForm.getInputProps('start_date')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Button.Group style={{ alignItems: "end"}}>
                            <DatePickerInput
                                label="End date (optional)"
                                placeholder=""
                                size="lg"
                                value={endDate}
                                onChange={setEndDate}
                                classNames={classes}
                                style={{ width: "100%"}}
                                //{...staffWorkingHoursForm.getInputProps('end_date')}
                            />
                            <Button
                                color="rgba(110, 30, 30,1)"
                                //fullWidth
                                size="lg"
                                radius="md"
                                style={{ borderTopLeftRadius: "5px", borderBottomLeftRadius: "5px" }}
                                onClick={() => setEndDate(null)}
                            >
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>X</Text>
                            </Button>
                        </Button.Group>
                        
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Group grow>
                            <Button
                                size="lg"
                                radius="md"
                                color="#316F22"
                                onClick={handleSubmit}
                            >
                                Save changes
                            </Button>
                            <Button
                                size="lg"
                                radius="md"
                                color="#3b5b4c"
                                onClick={closeModalProp}
                            >
                                Close
                            </Button>
                        </Group>

                    </Grid.Col>
                </Grid>
            </Modal>
        </>
    );
}