import { Grid, Paper, Select, Space, Table, TextInput, Text, Stack } from "@mantine/core";
import DayCheckboxes from "../DayCheckboxes";
import { IndustryData, contractorLabels, coownerLabels, countryData, employeeCountData, freelancerLabels, fullTimeLabels, genderSelectData, managerLabels, partTimeLabels, canadaProvinceData, staffBaseTypeData, studentLabels, termLabels, timezoneData } from "../../helpers/SelectData";
import classes from '../../css/TextInput.module.css';
import { useEffect, useState } from "react";
import { TimeInputSelectBase } from "../TimeInputSelectBase";
import { useForm } from "@mantine/form";
import { isNullOrEmpty } from "../../helpers/Helpers";
import { DateInput, DatePicker, DateValue } from "@mantine/dates";

interface UserInformationForm {
    handleFormChanges: (form: any) => void; // send back form data to parent
}

export default function UserInformationForm(props: UserInformationForm) {
    const [selectedRoleType, setSelectedRoleType] = useState<string | null>('');
    const [selectedLabel, setSelectedLabel] = useState<string | null>('');
    const [labelData, setLabelData] = useState([
        { value: '', label: '' },
    ]);
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);

    //setup props
    const handleFormChangesProp = props.handleFormChanges;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            user_info: {
                first_name: '',
                last_name: '',
                gender: '',
                username: '',
                password: '',
                pin_code: '',
                date_of_birth: new Date(),
                allergies: '',
                medical_info: '',
                notes:'',
                emergency_contact: '',
                position_role: { label: '', role_type: '', business_id: '' },
            },
            section: 'user_info',
        },
        validate: (value) => {
            return {
                first_name: value.user_info.first_name.trim().length <= 0 ? 'First name is required' : null,
                last_name: value.user_info.last_name.trim().length <= 0 ? 'Last name is required' : null,
                position_role: value.user_info.position_role.role_type.trim().length <= 0 ? 'Role is required' : null,
                gender: value.user_info.gender.trim().length <= 0 ? 'Gender is required' : null,
            }
        }
    });

    // detect form updates and send back form data to parent
    useEffect(() => {
        handleFormChangesProp(form);
    }, [form]);

    useEffect(() => {
        if (!isNullOrEmpty(selectedRoleType)) {
            // based on selected role type, populate label select
            setSelectedLabel(null);
            switch(selectedRoleType) {
                case "Co-owner":
                    setLabelData(coownerLabels);
                    break;
                case "Manager":
                    setLabelData(managerLabels);
                    break;
                case "Full-time":
                    setLabelData(fullTimeLabels);
                    break;
                case "Part-time":
                    setLabelData(partTimeLabels);
                    break;
                case "Term":
                    setLabelData(termLabels);
                    break;
                case "Contractor":
                    setLabelData(contractorLabels);
                    break;
                case "Freelancer":
                    setLabelData(freelancerLabels);
                    break;
                case "Student":
                    setLabelData(studentLabels);
                    break;
            }
        }
    }, [selectedRoleType]);


    // update form values when role type & label changes
    useEffect(() => {
        if (selectedLabel != null && selectedRoleType != null) {
            form.values.user_info.position_role.label = selectedLabel;
            form.values.user_info.position_role.role_type = selectedRoleType;
        }
    },[selectedLabel]);

    function handleDateOfBirthChange(birthDate: DateValue) {
        if(birthDate != null) {
            setDateOfBirth(birthDate);
            form.values.user_info.date_of_birth = birthDate;
        }
    }

    return (
        <>
            {/* <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background: "#25352F", color: "white" }}> */}
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            required
                            id="first-name"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="First name"
                            name="first_name"
                            placeholder="Enter first name"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('user_info.first_name')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            required
                            id="last-name"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Last name"
                            name="last_name"
                            placeholder="Enter last name"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('user_info.last_name')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack>
                            {/* <Text size="lg" fw={500}>Date of birth <span style={{ color: "#db3c34", marginLeft:"2px" }}>*</span></Text> */}
                            <DateInput
                                id="birth-date"
                                value={dateOfBirth}
                                onChange={handleDateOfBirthChange}
                                label="Date of birth"
                                placeholder="Date of birth"
                                size="lg"
                                radius="md"
                                required
                                classNames={classes}
                            />
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                            required
                            id="gender"
                            allowDeselect={false}
                            placeholder="Select a gender"
                            label="Gender"
                            size="lg"
                            classNames={classes}
                            data={genderSelectData}
                            {...form.getInputProps('user_info.gender')}
                        >
                        </Select>
                    </Grid.Col>
                    {/* <Grid.Col span={{ base: 12, md: 4 }}>
                        <Select
                            required    
                            id="role-type"
                            value={selectedRoleType}
                            onChange={setSelectedRoleType}
                            allowDeselect={false}
                            placeholder="Select a staff position level"
                            label="Staff position level"
                            size="lg"
                            classNames={classes}
                            data={staffBaseTypeData}
                        >
                        </Select>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        {isNullOrEmpty(selectedRoleType) && (
                            <Select
                                required
                                id="label"
                                disabled={true}
                                allowDeselect={false}
                                placeholder="Select a title"
                                label="Position title"
                                size="lg"
                                classNames={classes}
                            >
                            </Select>
                        )}

                        {!isNullOrEmpty(selectedRoleType) && (
                            <Select
                                required
                                id="label"
                                value={selectedLabel}
                                onChange={setSelectedLabel}
                                allowDeselect={false}
                                placeholder="Select a title"
                                label="Position title"
                                size="lg"
                                classNames={classes}
                                data={labelData}
                            >
                            </Select>
                        )}

                    </Grid.Col> */}
                </Grid>
            {/* </Paper> */}
        </>
    );
}