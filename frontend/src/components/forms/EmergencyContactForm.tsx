import { Grid, Paper, Select, Space, Table, TextInput, Text } from "@mantine/core";
import DayCheckboxes from "../DayCheckboxes";
import { IndustryData, countryData, employeeCountData, canadaProvinceData, timezoneData, usaStateData, genderSelectData } from "../../helpers/SelectData";
import classes from '../../css/TextInput.module.css';
import { useEffect, useState } from "react";
import { TimeInputSelectBase } from "../TimeInputSelectBase";
import { useForm } from "@mantine/form";
import { isNullOrEmpty } from "../../helpers/Helpers";

interface EmergencyContactForm {
    handleFormChanges: (form: any) => void; // send back form data to parent
}

export default function EmergencyContactForm(props: EmergencyContactForm) {
    const [selectedCountry, setSelectedCountry] = useState<string | null>('');
    const [provinceStateData, setProvinceStateData] = useState(canadaProvinceData);
    const [usaSelected, setUsaSelected] = useState(false);
    const [provinceTextbox, setProvinceTextbox] = useState(true);

    //setup props
    const handleFormChangesProp = props.handleFormChanges;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            gender: '',
            street: '',
            street_2: '',
            city: '',
            province: '',
            country: '',
            postal_code: '',
            contact_number: '',
            email: '',
        },
        // validate: (value) => {
        //     return {
        //         street: value.street.trim().length <= 0 ? 'Street address is required' : null,
        //         city: value.city.trim().length <= 0 ? 'City is required' : null,
        //         province: value.province.trim().length <= 0 ? 'Province is required' : null,
        //         country: value.country.trim().length <= 0 ? 'Country is required' : null,
        //         postal_code: value.postal_code.length <= 0 ? 'Postal code is required' : null,
        //         contact_number: value.contact_number.length <= 0 ? 'Contact number is required' : null,
        //         email: value.email.trim().length <= 0 && !value.email.includes('@') ? 'Email is required' : null,
        //     }
        // }
    });

    // detect form updates and send back form data to parent
    useEffect(() => {
        handleFormChangesProp(form);
    },[form]);

    useEffect(() => {
        if (!isNullOrEmpty(selectedCountry) && selectedCountry != null) {
            console.log(selectedCountry);
            form.values.country = selectedCountry;

            switch(selectedCountry) {
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
    },[selectedCountry]);

    return (
        <>
            {/* <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background: "#25352F", color: "white" }}> */}
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
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
                        <TextInput
                            id="contact-number"
                            label="Contact number"
                            name="contact_number"
                            placeholder="Contact number"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('contact_number')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
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
                    <Grid.Col span={{ base: 12 }}>
                        <TextInput
                            id="street" 
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Street (optional)"
                            name="street"
                            placeholder="Street address"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('street')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <TextInput
                            id="street-2"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Street 2 (optional)"
                            name="street-2"
                            placeholder="Apartment, building, complex"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('street_2')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select
                            id="country"
                            value={selectedCountry}
                            onChange={setSelectedCountry}
                            allowDeselect={false}
                            placeholder="Select a country"
                            label="Country (optional)"
                            size="lg"
                            classNames={classes}
                            data={countryData}
                            //{...form.getInputProps('country')}
                        >
                        </Select>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            id="city"
                            placeholder="Enter a city"
                            label="City (optional)"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('city')}
                        >
                        </TextInput>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        {provinceTextbox && (
                            <TextInput
                                id="province"
                                label="Province (optional)"
                                name="province"
                                placeholder="Enter a province"
                                size="lg"
                                classNames={classes}
                                {...form.getInputProps('province')}
                            >
                            </TextInput>
                        )}
                        {!provinceTextbox && (
                            <Select
                                allowDeselect={false}
                                id="province"
                                label={usaSelected ? "State (optional)" : "Province (optional)"}
                                name="province"
                                placeholder={usaSelected ? "Select a state" : "Select a province"}
                                size="lg"
                                classNames={classes}
                                data={provinceStateData}
                                {...form.getInputProps('province')}
                            />
                        )}
                        
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            id="postal-code"
                            label={usaSelected ? "Zip code (optional)" : "Postal code (optional)"}
                            name="postal_code"
                            placeholder={usaSelected ? "Enter a zip code" : "Enter a postal code"}
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('postal_code')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <TextInput
                            id="email"
                            label="Email address (optional)"
                            name="email"
                            placeholder="Email address"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('email')}
                        />
                    </Grid.Col>
                </Grid>
            {/* </Paper> */}
        </>
    );
}