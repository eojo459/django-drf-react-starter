import { Button, Grid, Group, Modal, Select, TextInput, Title, Text, rem, Switch, useMantineTheme, NumberInput } from "@mantine/core";
import { canadaProvinceData, countryData, genderSelectData, staffBaseTypeData, usaStateData } from "../helpers/SelectData";
import classes from "../css/TextInput.module.css";
import { PositionLabel, UserProfileModel, UserProfilePosition } from "../components/UserProfile";
import { useForm } from "@mantine/form";
import { SetStateAction, useEffect, useState } from "react";
import { FormProvider } from "antd/es/form/context";
import { formatTime, isNullOrEmpty } from "../helpers/Helpers";
import { DeleteUserByUid, GetEmploymentPositionType, GetEmploymentPositionsByBusinessId, GetEmploymentPositionsByEmploymentName, GetEmploymentPositionsByEmploymentTypeId, PatchStaff, PatchStaffWorkingHours, PatchUserById, PostApproveStaffUser, getStaffLimitStatus } from "../helpers/Api";
import { useAuth } from "../authentication/SupabaseAuthContext";
import classes2 from "../css/ProfileEditModal.module.css";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../css/Notifications.module.css";
import { IconCheck, IconX } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";

interface IReviewNewUserModal {
    user: UserProfileModel;
    notificationId: string;
    modalOpened: boolean;
    isMobile: boolean;
    closeModal: () => void;
    refreshData: () => void;
    //userProfileData: (reason: string) => void; // get user profile data from parent
}

export default function ReviewNewUserModal(props: IReviewNewUserModal) {
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
    const [payRate, setPayRate] = useState<string | number>(0);
    const [selectedRoleType, setSelectedRoleType] = useState<string | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [positionData, setPositionData] = useState<UserProfilePosition>();
    const [positionSelectData, setPositionSelectData] = useState<any[]>([]);

    // setup props
    const modalOpenedProp = props.modalOpened;
    const notificationIdProp = props.notificationId;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const userDataProp = props.user;
    const refreshDataProp = props.refreshData;

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
            level: '',
            position: { label: '', employment_type_id: '', business_id: '', business_name: '' },
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

    useEffect(() => {
        if (selectedRoleType && selectedRoleType?.length > 0) {
            // fetch positions for this employment type
            setSelectedLabel(null);
            fetchPositionData();
        }
    }, [selectedRoleType]);

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

    async function handleSubmit() {
        if (!user || !business || business === undefined) return;

        // send patch request to update staff activity to OUT status
        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });

        var data = {
            'request_type': 'no-auth',
        }
        // check and make sure business is within staff member limits
        var staffLimitReached = await getStaffLimitStatus(business?.id, data);
        if (staffLimitReached['registration_open'] === false) {
            // staff limit reached, show error
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error approving the account. The staff limit has already been reached. Please upgrade your account.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 5000,
                    classNames: notiicationClasses,
                });
            }, 500);
            return;
        }

        // setup data to be sent to the server
        var staffWorkingHoursData = {
            'holiday_allowed': holidayChecked,
            'overtime_allowed': overtimeChecked,
            'vacation_allowed': vacationChecked,
            'sick_allowed': sickLeaveChecked,
            'full_time': isFulltimeChecked,
            'salaried': isSalariedChecked,
            'pay_rate': payRate,
            'start_date': startDate,
            'end_date': endDate,
        }

        // update staff working hours
        var response = await PatchStaffWorkingHours(userDataProp.uid, staffWorkingHoursData, session?.access_token);
        if (response !== 200) {
            // error
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error approving the account. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
            }, 500);
        }

        // approve user access and update profile options
        var approveData = {
            'is_new_user': false,
            'notification_id': notificationIdProp,
            'position': selectedLabel,
        }

        var userResponse = await PostApproveStaffUser(userDataProp.uid, approveData, session?.access_token);
        if (userResponse === 201) {
            // success
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'User account was approved',
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
                    message: 'There was an error approving the account. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
            }, 500);
        }

        refreshDataProp();
        closeModalProp();
    }

    // delete selected user
    async function handleDenyUser() {
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
        var response = await DeleteUserByUid(userDataProp.uid, session?.access_token);
        if (response === 200) {
            // show success
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'User was denied.',
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
                    message: 'There was an error denying the user. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
            }, 500);
        }
        refreshDataProp();
        closeModalProp();
    }

    async function fetchPositionData() {
        if (user && selectedRoleType && business) {
            // get employment type id from selected position label
            var employmentPosition = await GetEmploymentPositionType(business?.id, selectedRoleType, session?.access_token);

            // get all positions related to a employment position type
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

    const selectedWorkingHours = (
        <>
            <Grid>
                {/* monday */}
                {userDataProp?.working_hours?.monday_start && userDataProp?.working_hours?.monday_end && (
                    <>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.monday_start ? formatTime(userDataProp?.working_hours?.monday_start) : ""}
                                label="Monday start"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.monday_end ? formatTime(userDataProp?.working_hours?.monday_end) : ""}
                                label="Monday end"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                    </>
                )}

                {/* tuesday */}
                {userDataProp?.working_hours?.tuesday_start && userDataProp?.working_hours?.tuesday_end && (
                    <>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.tuesday_start ? formatTime(userDataProp?.working_hours?.tuesday_start) : ""}
                                label="Tuesday start"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.tuesday_end ? formatTime(userDataProp?.working_hours?.tuesday_end) : ""}
                                label="Tuesday end"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                    </>
                )}

                {/* wednesday */}
                {userDataProp?.working_hours?.wednesday_start && userDataProp?.working_hours?.wednesday_end && (
                    <>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.wednesday_start ? formatTime(userDataProp?.working_hours?.wednesday_start) : ""}
                                label="Wednesday start"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.wednesday_end ? formatTime(userDataProp?.working_hours?.wednesday_end) : ""}
                                label="Wednesday end"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                    </>
                )}

                {/* thursday */}
                {userDataProp?.working_hours?.thursday_start && userDataProp?.working_hours?.thursday_end && (
                    <>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.thursday_start ? formatTime(userDataProp?.working_hours?.thursday_start) : ""}
                                label="Thursday start"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.thursday_end ? formatTime(userDataProp?.working_hours?.thursday_end) : ""}
                                label="Thursday end"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                    </>
                )}

                {/* friday */}
                {userDataProp?.working_hours?.friday_start && userDataProp?.working_hours?.friday_end && (
                    <>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.friday_start ? formatTime(userDataProp?.working_hours?.friday_start) : ""}
                                label="Friday start"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.friday_end ? formatTime(userDataProp?.working_hours?.friday_end) : ""}
                                label="Friday end"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                    </>
                )}

                {/* saturday */}
                {userDataProp?.working_hours?.saturday_start && userDataProp?.working_hours?.saturday_start && (
                    <>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.saturday_start ? formatTime(userDataProp?.working_hours?.saturday_start) : ""}
                                label="Saturday start"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.saturday_end ? formatTime(userDataProp?.working_hours?.saturday_end) : ""}
                                label="Saturday end"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                    </>
                )}

                {/* sunday */}
                {userDataProp?.working_hours?.sunday_start && userDataProp?.working_hours?.sunday_end && (
                    <>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.sunday_start ? formatTime(userDataProp?.working_hours?.sunday_start) : ""}
                                label="Sunday start"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }} mt="lg">
                            <TextInput
                                value={userDataProp?.working_hours?.sunday_end ? formatTime(userDataProp?.working_hours?.sunday_end) : ""}
                                label="Sunday end"
                                placeholder=""
                                size="lg"
                                disabled={true}
                                classNames={classes}
                            />
                        </Grid.Col>
                    </>
                )}
            </Grid>
        </>
    );

    return (
        <>
            <Modal
                opened={modalOpenedProp}
                onClose={closeModalProp}
                title={<Text c="#dcdcdc" size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Review profile</Text>}
                fullScreen={isMobileProp}
                size="60%"
                radius="md"
                classNames={classes2}
                transitionProps={{ transition: 'fade', duration: 200 }}
            >
                <Grid c="#dcdcdc">
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Personal information</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            value={userDataProp?.first_name}
                            label="First name"
                            placeholder=""
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            value={userDataProp?.last_name}
                            label="Last name"
                            placeholder=""
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            value={userDataProp?.gender}
                            id="gender"
                            placeholder=""
                            label="Gender"
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        >
                        </TextInput>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Contact information</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <TextInput
                            value={userDataProp?.street}
                            label="Street"
                            placeholder=""
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <TextInput
                            value={userDataProp?.street_2}
                            label="Street 2 (optional)"
                            placeholder=""
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            value={userDataProp?.city}
                            label="City"
                            placeholder=""
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            value={userDataProp?.province}
                            id="province"
                            label="Province"
                            name="province"
                            placeholder=""
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        >
                        </TextInput>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            value={userDataProp?.country}
                            id="country"
                            placeholder=""
                            label="Country"
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        >
                        </TextInput>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            value={userDataProp?.postal_code}
                            id="postal-code"
                            label={usaSelected ? "Zip code" : "Postal code"}
                            name="postal_code"
                            placeholder=""
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            value={userDataProp?.cell_number}
                            label="Cell number"
                            placeholder=""
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            value={userDataProp?.home_number}
                            label="Home number (optional)"
                            placeholder=""
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            value={userDataProp?.work_number}
                            label="Work number (optional)"
                            placeholder=""
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <TextInput
                            value={userDataProp?.email}
                            label="Email"
                            placeholder=""
                            size="lg"
                            disabled={true}
                            classNames={classes}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Text size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Selected working hours</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        {selectedWorkingHours}
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
                                    setHolidayChecked(event.currentTarget.checked);
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
                                    setOvertimeChecked(event.currentTarget.checked);
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
                                    setVacationChecked(event.currentTarget.checked);
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
                                    setSickLeaveChecked(event.currentTarget.checked);
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
                                    setIsManagerChecked(event.currentTarget.checked);
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
                                    setIsFulltimeChecked(event.currentTarget.checked);
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
                                    setIsSalariedChecked(event.currentTarget.checked);
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
                                onChange={setPayRate}
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
                                onChange={setPayRate}
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
                            value={selectedRoleType}
                            onChange={setSelectedRoleType}
                            allowDeselect={false}
                            placeholder="Employment type"
                            label="Employment type"
                            size="lg"
                            classNames={classes}
                            data={staffBaseTypeData}
                        >
                        </Select>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                            required
                            id="label"
                            value={selectedLabel}
                            onChange={setSelectedLabel}
                            disabled={selectedRoleType == null || selectedRoleType === ""}
                            allowDeselect={false}
                            placeholder="Select a title"
                            label="Position title"
                            size="lg"
                            classNames={classes}
                            data={positionSelectData}
                        >
                        </Select>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <DatePickerInput
                            label="Employment start date"
                            required
                            placeholder=""
                            size="lg"
                            value={startDate}
                            onChange={setStartDate}
                            classNames={classes}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <DatePickerInput
                            label="Employment end date (optional)"
                            placeholder=""
                            size="lg"
                            value={endDate}
                            onChange={setEndDate}
                            classNames={classes}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Group grow>
                            <Button
                                size="lg"
                                radius="md"
                                color="#316F22"
                                disabled={selectedLabel ? false : true}
                                onClick={handleSubmit}
                            >
                                Approve
                            </Button>
                            <Button
                                size="lg"
                                radius="md"
                                color="#ca4628"
                                onClick={handleDenyUser}
                            >
                                Deny
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