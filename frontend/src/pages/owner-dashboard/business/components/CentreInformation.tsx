import React, { ChangeEvent, useEffect, useState } from 'react';
import { Typography, TextField, InputAdornment, FormControl, InputLabel, MenuItem, SelectChangeEvent } from '@mui/material'; 
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import { API_ROUTES } from '../../../../apiRoutes';
import SuccessSnackbar from '../../../../components/Snackbar';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
//import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmationModal from '../../../../components/DeleteModal';
import { OwnerProfile } from '../owner/owner-profile';
import { useForm } from '@mantine/form';
import { Text, Button, Paper, Grid, TextInput, Textarea, Select, Avatar, Container, Title, rem } from '@mantine/core';
import classes from '../../../../css/TextInput.module.css';
import { IndustryData, canadaProvinceData, countryData, usaStateData } from '../../../../helpers/SelectData';
import { isNullOrEmpty } from '../../../../helpers/Helpers';
import { useAuth } from '../../../../authentication/SupabaseAuthContext';
import { PatchBusinessById } from '../../../../helpers/Api';
import notiicationClasses from "../../../../css/Notifications.module.css";
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

export type BusinessProfile = {
    id: string;
    name: string;
    street: string;
    street_2: string;
    city: string;
    province: string;
    country: string;
    country_code: string;
    postal_code: string;
    contact_number: string;
    industry: string;
    business_owner: string;
    location_id: string;
    strict_mode: boolean;
    gps_geolocation: boolean;
    staff_limit_reached: boolean;
    user_limit_reached: boolean;
    review_approve_edits: boolean;
    report_frequency: string;
    submitted_timesheet_email: boolean;
    auto_clocked_out_email: boolean;
    auto_clock_out_max_duration: number;
    overtime_max_duration: number;
    employee_count: string;
    timezone: string;
    email: string;
    plan_id: string;
    notes: string;
};

interface CentreInformation {
    business: BusinessProfile;
    handleOnChange: (form: any) => void;
}

export default function CentreInformation(props: CentreInformation) {
    const navigate = useNavigate();
    const { user, business, session } = useAuth();
    const [selectedCountry, setSelectedCountry] = useState<string | null>('');
    const [selectedProvince, setSelectedProvince] = useState<string | null>('');
    const [provinceStateData, setProvinceStateData] = useState(canadaProvinceData);
    const [usaSelected, setUsaSelected] = useState(false);
    const [canadaSelected, setCanadaSelected] = useState(false);
    const isMobile = useMediaQuery('(max-width: 50em)');

    // props
    const businessProp = props.business;
    const handleOnChangeProp = props.handleOnChange;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            id: businessProp ? businessProp.id : '',
            name: businessProp ? businessProp.name : '',
            street: businessProp ? businessProp.street : '',
            street_2: businessProp ? businessProp.street_2 :'',
            city: businessProp ? businessProp.city : '',
            province: businessProp ? businessProp.province : '',
            country: businessProp ? businessProp.country : '',
            postal_code: businessProp ? businessProp.postal_code : '',
            contact_number: businessProp ? businessProp.contact_number : '',
            industry: businessProp ? businessProp.industry : '',
            business_owner: businessProp ? businessProp.business_owner : '',
            location_id: businessProp ? businessProp.location_id : '',
            strict_mode: businessProp ? businessProp.strict_mode : false,
            gps_geolocation: businessProp ? businessProp.gps_geolocation : false,
            staff_limit_reached: businessProp ? businessProp.staff_limit_reached : false,
            user_limit_reached: businessProp ? businessProp.user_limit_reached : false,
            plan_id: businessProp ? businessProp.plan_id : '',
            notes: businessProp ? businessProp.notes : '',
            section: 'business_info',
        },
        validate: (value) => {
            return {
                name: value.name.trim().length < 1 ? 'Group name is required' : null,
                street: value.street.trim().length < 1 ? 'Street is required' : null,
                city: value.city.trim().length < 1 ? 'City is required' : null,
                province: value.province.trim().length < 1 ? 'Province is required' : null,
                country: value.country.trim().length < 1 ? 'Country is required' : null,
                postal_code: value.postal_code.trim().length < 1 ? 'Postal code is required' : null,
                contact_number: value.contact_number.trim().length < 1 ? 'Contact number is required' : null,
                industry: value.industry.trim().length < 1 ? 'Business industry is required' : null,
                business_owner: value.business_owner != null ? 'Business owner is required' : null,
            }
        },
        onValuesChange: (values) => {
            handleOnChangeProp(values);
        },
    });

    useEffect(() => {
        if (businessProp) {
            form.setValues(businessProp);
    
            setSelectedCountry(businessProp.country);
            switch(businessProp.country) {
                case 'CANADA':
                    setCanadaSelected(true);
                    setUsaSelected(false);
                    break;
                case 'UNITED STATES':
                    setCanadaSelected(false);
                    setUsaSelected(true);
                    break;
                default:
                    setCanadaSelected(false);
                    setUsaSelected(false);
                    break;
            }
        }
    }, [businessProp]);

    // handle country data when it changes
    function handleCountryChange(country: any) {
        if (country) {
            setSelectedCountry(country);
            form.values.country = country;
            switch(country) {
                // clear province and postal code on change
                case "Canada":
                    form.setFieldValue('province', '');
                    form.setFieldValue('postal_code', '');
                    setProvinceStateData(canadaProvinceData);
                    setUsaSelected(false);
                    setCanadaSelected(true);
                    break;
                case "United States":
                    form.setFieldValue('province', '');
                    form.setFieldValue('postal_code', '');
                    setProvinceStateData(usaStateData);
                    setUsaSelected(true);
                    setCanadaSelected(false);
                    break;
                default:
                    // show regular textbox
                    form.setFieldValue('province', '');
                    form.setFieldValue('postal_code', '');
                    setUsaSelected(false);
                    setCanadaSelected(false);
                    break;
            }
        }
    }

    // handle province data when it changes
    function handleProvinceChange(province: any) {
        if (province) {
            setSelectedProvince(province);
            form.setFieldValue('province', province);
        }
    }

    return (
        // <Container size="md">
        <>
            <Grid mt="md">
                <Grid.Col span={{base: 12, sm: 6}}>
                    <TextInput 
                        id="business-name" 
                        label="Name" 
                        name="name"
                        placeholder="Business name"
                        //onChange={handleBusinessChange} 
                        size="lg"
                        classNames={classes}
                        {...form.getInputProps('name')}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, sm: 6}}>
                    <TextInput 
                        id="contact-number" 
                        label="Contact number" 
                        name="contact_number"
                        placeholder="Contact number"
                        //onChange={handleBusinessChange}
                        size="lg"
                        classNames={classes}
                        {...form.getInputProps('contact_number')}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, sm: 12}}>
                    {/* TODO: when address changes, call api to get coordinates and update location in database */}
                    <TextInput 
                        id="street" 
                        label="Street address" 
                        name="street"
                        placeholder="Street address"
                        size="lg"
                        classNames={classes}
                        {...form.getInputProps('street')}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, sm: 3}}>
                    <TextInput 
                        id="city" 
                        label="City" 
                        name="city"
                        placeholder="City"
                        size="lg"
                        classNames={classes}
                        {...form.getInputProps('city')}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12, sm: 3}}>
                    {usaSelected && (
                        <Select
                            required
                            id="province"
                            value={selectedProvince}
                            onChange={handleProvinceChange}
                            allowDeselect={false}
                            placeholder="Select a state"
                            label="State"
                            size="lg"
                            classNames={classes}
                            data={usaStateData}
                        >
                        </Select>
                    )}

                    {canadaSelected && (
                        <Select
                            required
                            id="province"
                            value={selectedProvince}
                            onChange={handleProvinceChange}
                            allowDeselect={false}
                            placeholder="Select a province"
                            label="Province"
                            size="lg"
                            classNames={classes}
                            data={canadaProvinceData}
                        >
                        </Select>
                    )}

                    {!usaSelected && !canadaSelected && (
                        <TextInput
                            id="province"
                            label="Province"
                            name="province"
                            placeholder="Province"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('province')}
                        />
                    )}
                    
                </Grid.Col>
                <Grid.Col span={{base: 12, sm: 3}}>
                    <Select
                        required
                        id="country"
                        value={selectedCountry}
                        onChange={handleCountryChange}
                        allowDeselect={false}
                        placeholder="Select a country"
                        label="Country"
                        size="lg"
                        classNames={classes}
                        data={countryData}
                        //{...form.getInputProps('country')}
                    >
                    </Select>
                </Grid.Col>
                <Grid.Col span={{base: 12, sm: 3}}>
                    <TextInput 
                        id="postal_code" 
                        label={canadaSelected ? "Postal code" : usaSelected ? "Zip code" : "Postal code"}
                        name="postal_code"
                        placeholder={canadaSelected ? "Postal code" : usaSelected ? "Zip code" : "Postal code"}
                        size="lg"
                        classNames={classes}
                        {...form.getInputProps('postal_code')}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 12}}>
                    <Select
                      id="type"
                      label="Business industry"
                      placeholder="Please select one"
                      size="lg"
                      data={IndustryData}
                      classNames={classes}
                      {...form.getInputProps('industry')}
                    >
                    </Select>
                </Grid.Col>
                {/* <Grid.Col span={{base: 12}}>
                    <Textarea
                        autosize
                        minRows={6}
                        id="other-info"
                        label="Other notes and information"
                        name="notes"
                        placeholder="Enter any other information here"
                        size="md"
                        {...form.getInputProps('notes')}
                    />
                </Grid.Col> */}
            </Grid>
            {/* </Container> */}
        </>
    );
};