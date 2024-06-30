import { Grid, Paper, Select, Space, Table, TextInput, Text } from "@mantine/core";
import DayCheckboxes from "../DayCheckboxes";
import { IndustryData, contractorLabels, coownerLabels, countryData, employeeCountData, freelancerLabels, fullTimeLabels, genderSelectData, managerLabels, partTimeLabels, canadaProvinceData, staffBaseTypeData, studentLabels, termLabels, timezoneData, parentRelationshipData } from "../../helpers/SelectData";
import classes from '../../css/TextInput.module.css';
import { useEffect, useState } from "react";
import { TimeInputSelectBase } from "../TimeInputSelectBase";
import { useForm } from "@mantine/form";
import { isNullOrEmpty } from "../../helpers/Helpers";

interface ParentInformationForm {
    handleFormChanges: (form: any) => void; // send back form data to parent
}

export default function ParentInformationForm(props: ParentInformationForm) {

    //setup props
    const handleFormChangesProp = props.handleFormChanges;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            parent_info: {
                first_name: '',
                last_name: '',
                gender: '',
                username: '',
                password: '',
                pin_code: '',
                relationship: '',
            },
            section: 'parent_info',
        },
        validate: (value) => {
            return {
                first_name: value.parent_info.first_name.trim().length <= 0 ? 'First name is required' : null,
                last_name: value.parent_info.last_name.trim().length <= 0 ? 'Last name is required' : null,
                gender: value.parent_info.gender.trim().length <= 0 ? 'Gender is required' : null,
                relationship: value.parent_info.relationship.trim().length <= 0 ? 'Relationship is required' : null,
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
                            {...form.getInputProps('parent_info.first_name')}
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
                            {...form.getInputProps('parent_info.last_name')}
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
                            {...form.getInputProps('parent_info.gender')}
                        >
                        </Select>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                            required
                            id="relationship"
                            allowDeselect={false}
                            placeholder="Select a relationship"
                            label="Relationship"
                            size="lg"
                            classNames={classes}
                            data={parentRelationshipData}
                            {...form.getInputProps('parent_info.relationship')}
                        >
                        </Select>
                    </Grid.Col>
                </Grid>
            {/* </Paper> */}
        </>
    );
}