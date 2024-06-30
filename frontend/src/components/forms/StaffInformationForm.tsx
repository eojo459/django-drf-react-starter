import { Grid, Paper, Select, Space, Table, TextInput, Text } from "@mantine/core";
import DayCheckboxes from "../DayCheckboxes";
import { IndustryData, contractorLabels, coownerLabels, countryData, employeeCountData, freelancerLabels, fullTimeLabels, genderSelectData, managerLabels, partTimeLabels, canadaProvinceData, staffBaseTypeData, studentLabels, termLabels, timezoneData } from "../../helpers/SelectData";
//import classes from "../../css/TextInput.module.scss";
import classes from "../../css/TextInput.module.css";
import { useEffect, useState } from "react";
import { TimeInputSelectBase } from "../TimeInputSelectBase";
import { useForm } from "@mantine/form";
import { isNullOrEmpty } from "../../helpers/Helpers";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import { GetBusinessInfoForUserByUid, GetEmploymentTypeById, GetEmploymentTypes } from "../../helpers/Api";

interface StaffInformationForm {
    handleFormChanges: (form: any) => void; // send back form data to parent
}

interface Business {
    value: string;
    label: string;
    owner_uid: string;
    lon: number;
    lat: number;
}

export default function StaffInformationForm(props: StaffInformationForm) {
    const { user, session } = useAuth();
    const [selectedRoleType, setSelectedRoleType] = useState<string | null>('');
    const [selectedLabel, setSelectedLabel] = useState<string | null>('');
    const [labelData, setLabelData] = useState([
        { value: '', label: '' },
    ]);
    const [businessData, setBusinessData] = useState<Business[]>([]);
    const [selectedBusiness, setSelectedBusiness] = useState<string | null>('');
    const [selectedBusinessIndex, setSelectedBusinessIndex] = useState(-1);
    const [staffBaseType, setStaffBaseType] = useState([
        { value: 'Owner', label: 'Owner/CEO/Director', disabled: true },
        { value: 'Co-owner', label: 'Co-owner', disabled: false },
        { value: 'Manager', label: 'Manager', disabled: false },
        { value: 'Full-time', label: 'Full-time employee', disabled: false },
        { value: 'Part-time', label: 'Part-time employee', disabled: false },
        { value: 'Term', label: 'Term/Seasonal employee', disabled: false },
        { value: 'Contractor', label: 'Contractor', disabled: false },
        { value: 'Freelancer', label: 'Freelancer', disabled: false },
        { value: 'Student', label: 'Student', disabled: false },
    ]);

    //setup props
    const handleFormChangesProp = props.handleFormChanges;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            staff_info: {
                first_name: '',
                last_name: '',
                gender: '',
                username: '',
                email: '',
                password: '',
                pin_code: '',
                level: '',
                position: { label: '', employment_type_id: '', business_id: '', business_name: '' },
            },
            section: 'staff_info',
        },
        validate: (value) => {
            return {
                first_name: value.staff_info.first_name.trim().length <= 0 ? 'First name is required' : null,
                last_name: value.staff_info.last_name.trim().length <= 0 ? 'Last name is required' : null,
                position: value.staff_info.position.employment_type_id.trim().length <= 0 ? 'Position is required' : null,
                gender: value.staff_info.gender.trim().length <= 0 ? 'Gender is required' : null,
            }
        }
    });

    // run on component load
    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                const myBusinessData = await GetBusinessInfoForUserByUid(user?.uid, session?.access_token);
                if (myBusinessData) {
                    setBusinessData(myBusinessData);
                    form.values.staff_info.position.business_id = myBusinessData[0]?.value;
                    form.values.staff_info.position.business_name = myBusinessData[0]?.label;
                    setSelectedBusiness(myBusinessData[0]?.label);
                    //console.log(myBusinessData[0]);
                    const employmentTypes = await GetEmploymentTypes(session?.access_token);
                    setStaffBaseType(employmentTypes);
                }
            }
        };
        fetchData();
    },[]);

    // detect form updates and send back form data to parent
    useEffect(() => {
        handleFormChangesProp(form);
    }, [form]);

    useEffect(() => {
        const fetchData = async () => {

            if (selectedRoleType != null && selectedRoleType != undefined) {
                // find name of role type 
                var employmentType = await GetEmploymentTypeById(selectedRoleType, session?.access_token);
                var employmentTypeName = employmentType.name;

                // based on selected role type, populate label select
                setSelectedLabel(null);
                switch(employmentTypeName) {
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
        }

        fetchData();
    }, [selectedRoleType]);


    // update form values when role type & label changes
    useEffect(() => {
        if (selectedLabel != null && selectedRoleType != null) {
            form.values.staff_info.position.label = selectedLabel;
            form.values.staff_info.position.employment_type_id = selectedRoleType;
        }
    },[selectedLabel]);

    // update values when business changes
    function handleBusinessChange(value: string) {
        const selectedIndex = businessData.findIndex(item => item.value === value);
        console.log("Selected index:", selectedIndex);
        setSelectedBusiness(value);
        //setSelectedBusinessIndex(selectedIndex);

        // update form fields
        form.values.staff_info.position.business_id = value;
        form.values.staff_info.position.business_name = businessData[selectedIndex]?.label;
    }

    return (
        <>
            {/* <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background: "#25352F", color: "#dcdcdc" }}> */}
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            required
                            id="username"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Username"
                            name="username"
                            placeholder="Enter a username"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('staff_info.username')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            required
                            id="password"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Password"
                            name="password"
                            placeholder="Enter a password"
                            type="password"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('staff_info.password')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            required
                            id="first-name"
                            label="First name"
                            name="first_name"
                            placeholder="Enter first name"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('staff_info.first_name')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            required
                            id="last-name"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Last name"
                            name="last_name"
                            placeholder="Enter last name"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('staff_info.last_name')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Select
                            required
                            id="gender"
                            allowDeselect={false}
                            placeholder="Select a gender"
                            label="Gender"
                            size="lg"
                            classNames={classes}
                            data={genderSelectData}
                            {...form.getInputProps('staff_info.gender')}
                        >
                        </Select>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        {businessData.length > 1 && (
                            <Select
                                required
                                id="business"
                                allowDeselect={false}
                                value={selectedBusiness}
                                onChange={(value) => { 
                                    if (value){
                                        handleBusinessChange(value);
                                    } 
                                }}
                                placeholder="Select a business"
                                label="Workplace"
                                size="lg"
                                disabled={businessData.length > 1 ? false : true}
                                classNames={classes}
                                data={businessData}
                                //{...form.getInputProps('staff_info.position.business_id')}
                            >
                            </Select>
                        )}
                        {businessData.length == 1 && (
                            <TextInput
                                required
                                id="business"
                                placeholder="Select a business"
                                label="Workplace"
                                size="lg"
                                disabled
                                classNames={classes}
                                {...form.getInputProps('staff_info.position.business_name')}
                            >
                            </TextInput>
                        )}
                        
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Select
                            required    
                            id="role-type"
                            value={selectedRoleType}
                            onChange={setSelectedRoleType}
                            allowDeselect={false}
                            placeholder="Select a staff employment type"
                            label="Staff employment type"
                            size="lg"
                            classNames={classes}
                            data={staffBaseType}
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

                    </Grid.Col>
                </Grid>
            {/* </Paper> */}
        </>
    );
}