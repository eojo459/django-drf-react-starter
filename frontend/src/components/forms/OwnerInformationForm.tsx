import { Grid, Paper, Select, Space, Table, TextInput, Text } from "@mantine/core";
import DayCheckboxes from "../DayCheckboxes";
import { IndustryData, contractorLabels, coownerLabels, countryData, employeeCountData, freelancerLabels, fullTimeLabels, genderSelectData, managerLabels, partTimeLabels, canadaProvinceData, staffBaseTypeData, studentLabels, termLabels, timezoneData } from "../../helpers/SelectData";
import classes from '../../css/TextInput.module.css';
import { useEffect, useState } from "react";
import { TimeInputSelectBase } from "../TimeInputSelectBase";
import { useForm } from "@mantine/form";
import { isNullOrEmpty } from "../../helpers/Helpers";

interface OwnerInformationForm {
    handleFormChanges: (form: any) => void; // send back form data to parent
}

export default function OwnerInformationForm(props: OwnerInformationForm) {
    const [selectedRoleType, setSelectedRoleType] = useState<string | null>('');
    const [selectedLabel, setSelectedLabel] = useState<string | null>('');
    const [labelData, setLabelData] = useState([
        { value: '', label: '' },
    ]);

    //setup props
    const handleFormChangesProp = props.handleFormChanges;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            gender: '',
            username: '',
            password: '',
            pin_code: '',
        },
        validate: (value) => {
            return {
                first_name: value.first_name.trim().length <= 0 ? 'First name is required' : null,
                last_name: value.last_name.trim().length <= 0 ? 'Last name is required' : null,
                gender: value.gender.trim().length <= 0 ? 'Gender is required' : null,
            }
        }
    });

    // detect form updates and send back form data to parent
    useEffect(() => {
        handleFormChangesProp(form);
    }, [form]);


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
                            {...form.getInputProps('first_name')}
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
                            {...form.getInputProps('last_name')}
                        />
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
                            {...form.getInputProps('gender')}
                        >
                        </Select>
                    </Grid.Col>
                </Grid>
            {/* </Paper> */}
        </>
    );
}