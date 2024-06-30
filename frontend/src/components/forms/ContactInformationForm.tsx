import { Grid, Paper, Select, Space, Table, TextInput, Text } from "@mantine/core";
import DayCheckboxes from "../DayCheckboxes";
import { IndustryData, countryData, employeeCountData, canadaProvinceData, timezoneData, usaStateData } from "../../helpers/SelectData";
import classes from '../../css/TextInput.module.css';
import { useEffect, useState } from "react";
import { TimeInputSelectBase } from "../TimeInputSelectBase";
import { useForm } from "@mantine/form";
import { isNullOrEmpty } from "../../helpers/Helpers";
import { useMediaQuery } from "@mantine/hooks";


interface IContactInformationForm {
    showEmail?: boolean;
    handleFormChanges: (form: any) => void; // send back form data to parent
}

export default function ContactInformationForm(props: IContactInformationForm) {
    const [selectedCountry, setSelectedCountry] = useState<string | null>('');
    const [provinceStateData, setProvinceStateData] = useState(canadaProvinceData);
    const [usaSelected, setUsaSelected] = useState(false);
    const [provinceTextbox, setProvinceTextbox] = useState(true);
    const [showEmail, setShowEmail] = useState(true);
    const isMobile = useMediaQuery('(max-width: 50em)');

    //setup props
    const handleFormChangesProp = props.handleFormChanges;
    const showEmailProp = props.showEmail;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            street: '',
            street_2: '',
            city: '',
            province: '',
            country: '',
            postal_code: '',
            cell_number: '',
            home_number: '',
            work_number: '',
            email: '',
            section: 'contact_info',
        },
        validate: (value) => {
            return {
                street: value.street.trim().length <= 0 ? 'Street address is required' : null,
                city: value.city.trim().length <= 0 ? 'City is required' : null,
                province: value.province.trim().length <= 0 ? 'Province is required' : null,
                country: value.country.trim().length <= 0 ? 'Country is required' : null,
                postal_code: value.postal_code.length <= 0 ? 'Postal code is required' : null,
                cell_number: value.cell_number.length <= 0 ? 'Cell number is required' : null,
                email: value.email.trim().length <= 0 && !value.email.includes('@') ? 'Email is required' : null,
            }
        },
        onValuesChange: (values) => {
            handleFormChangesProp(values);
        },
    });

    // detect form updates and send back form data to parent
    // useEffect(() => {
    //     handleFormChangesProp(form);
    // },[form]);

    useEffect(() => {
        if (showEmailProp != undefined) {
            setShowEmail(showEmailProp);
        }
    }, [showEmailProp])

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
                    <Grid.Col span={{ base: 12 }}>
                        <TextInput
                            required
                            id="street"
                            //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                            label="Street"
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
                    <Grid.Col span={{ base: 6, md: 3 }}>
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
                    <Grid.Col span={{ base: 6, md: 3 }}>
                        <TextInput
                            required
                            id="city"
                            placeholder="City"
                            label="City"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('city')}
                        >
                        </TextInput>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, md: 3 }}>
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
                                placeholder={usaSelected ? "Select a State" : "Select a Province"}
                                size="lg"
                                classNames={classes}
                                data={provinceStateData}
                                {...form.getInputProps('province')}
                            />
                        )}
                        
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, md: 3 }}>
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
                            required
                            id="cell-number"
                            label="Cell number"
                            name="cell_number"
                            placeholder="Mobile cell number"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('cell_number')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, md: 4 }}>
                        <TextInput
                            id="work-number"
                            label="Work number (optional)"
                            name="work_number"
                            placeholder="Work number"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('work_number')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, md: 4 }}>
                        <TextInput
                            id="home-number"
                            label="Home number (optional)"
                            name="home_number"
                            placeholder="Home number"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('home_number')}
                        />
                    </Grid.Col>
                    {showEmail && (
                        <Grid.Col span={{ base: 12 }}>
                            <TextInput
                                required
                                id="email"
                                label="Email address"
                                name="email"
                                placeholder="Email address"
                                size="lg"
                                classNames={classes}
                                {...form.getInputProps('email')}
                            />
                        </Grid.Col>
                    )}
                    
                </Grid>
            {/* </Paper> */}
        </>
    );
}