import React, { ChangeEvent, FormEvent, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import SuccessSnackbar from '../../../components/Snackbar';
import { API_ROUTES } from '../../../apiRoutes';
import { useForm } from '@mantine/form';
import { Text, Button, Paper, Grid, TextInput, Textarea, Select, Group, Stepper, Code, Container, rem, Fieldset, Divider, Space, Stack, Title, useComputedColorScheme } from '@mantine/core';
import { countryData, canadaProvinceData } from '../../../helpers/SelectData';
import { formatPostalCode } from '../../../helpers/Helpers';
import { IconBuilding, IconUser } from '@tabler/icons-react';
import classes from '../../../css/BusinessRegistration.module.scss';
import '../../../css/MantineComponents.scss';
import { AuthContext } from '../../../authentication/AuthContext';
import { FetchChildAttendanceRecordsForWeek, getBusinessTypes, getOwnerIdByUserId, getUserById } from '../../../helpers/Api';

export type Location = {
    //location_id: number;
    business_id: string;
    latitude: number;
    longitude: number;
};

export default function BusinessRegistrationFormOld() {
    // form fields for mantine components
    const form = useForm({
        initialValues: {
            name: '',
            street: '',
            city: '',
            province: '',
            country: '',
            postal_code: '',
            contact_number: '',
            business_type: -1,
            business_owner: '',
            location_id: '',
            strict_mode: false,
            strict_mode_location: false,
            business_plan_id: 1,
        },
        validate: (value) => {
            switch (activeCount) {
                case 0:
                    return {
                        name: value.name.trim().length < 2 ? 'Name must have at least 2 letters' : null,
                        contact_number: value.contact_number.trim().length < 1 ? 'Contact number is required' : null,
                        business_type: value.business_type < 0 ? 'Business type is required' : null,
                        business_owner: value.business_owner.length < 0 ? 'Business owner is required' : null,
                    }
                case 1:
                    return {
                        street: value.street.trim().length < 1 ? 'Street address is required' : null,
                        city: value.city.trim().length < 1 ? 'City is required' : null,
                        province: value.province.trim().length < 1 ? 'Province is required' : null,
                        country: value.country.trim().length < 1 ? 'Country is required' : null,
                        postal_code: value.postal_code.trim().length < 1 ? 'Postal code is required' : null,
                    };
            }
            return {};
        }
    });

    // States
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    let { authTokens, user } : any = useContext(AuthContext);
    const [types, setTypes] = useState<any[]>([]);
    const [typesData, setTypesData] = useState<any[]>([]);
    const [selectedBusinessType, setSelectedBusinessType] = useState('');
    const [owners, setOwners] = useState<any[]>([]);
    const [ownersData, setOwnersData] = useState<any[]>([]);
    const [ownerData, setOwnerData] = useState<any>();
    const [selectedOwner, setSelectedOwner] = useState('');
    const [activeCount, setActiveCount] = useState<number>(0);


    useEffect(() => {
        const fetchData = async () => {
            if (user != null) {
                if (authTokens == null || authTokens == undefined) {
                    authTokens = JSON.parse(localStorage.getItem("authTokens")!);
                }

                // get owner data
                var ownerData = await getUserById(user.user_id, authTokens);
                setOwnerData(ownerData);
                form.values.business_owner = (ownerData?.first_name + " " + ownerData?.last_name);

                // get business type data
                var businessTypeData = await getBusinessTypes(authTokens);
                const typesData = businessTypeData.map((type: { type_id: number; name: string; }) => ({
                    value: type.type_id.toString(),
                    label: type.name,
                }));
                setTypes(businessTypeData);
                setTypesData(typesData);
            }
        };

        // Get data from api on component load
        fetchData();
    }, []);

    async function getOwners() {
        try {
            const response = await axios.get(API_ROUTES.OWNERS);
            if (response.status == 200) {
                const ownersData = response.data.map((owner: { owner_id: number; first_name: string; last_name: string; }) => ({
                    value: owner.owner_id.toString(),
                    label: owner.first_name + " " + owner.last_name,
                }));
                setOwners(response.data);
                setOwnersData(ownersData);
            }
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Find businessType of business using name
    const findBusinessTypeIdByName = (name: string) => {
        const businessType = types.find(type => type.name === name);
        return businessType ? businessType.type_id : null; // Return the ID if found, otherwise return null
    };

    // Find owner of business using name
    const findOwnerIdByName = (name: string) => {
        const nameSplit = name.split(' ');
        const owner = owners.find(owner => owner.first_name === nameSplit[0]);
        return owner ? owner.owner_id : null; // Return the ID if found, otherwise return null
    };

    // handler for select
    const handleSelectChange = (selectType: string, value: string | null) => {
        if (value != null) {
            switch (selectType) {
                // case 'owner':
                //     form.setValues({ business_owner: Number(value) });
                //     return;
                case 'type':
                    form.setValues({ business_type: Number(value) });
                    return;
                default:
                    return;
            }
        }
        return;
    }

    // Quickly fill in form with test data
    const handleFillTestData = () => {
        form.setValues({
            name: 'Sunshine Business',
            street: '59 Aero Drive',
            city: 'Calgary',
            country: 'Canada',
            province: 'AB',
            postal_code: 'A1B2C3',
            contact_number: '4039998888',
            business_type: 1,
            business_owner: '',
            location_id: '',
            strict_mode: false,
            strict_mode_location: false,
            business_plan_id: 1,
        });
    };

    // Handler to submit form
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            // get important data used to retrieve lat and lon from geocode api
            var formattedStreet = form.values.street.replace(/ /g, "+");
            var city = form.values.city;
            var country = form.values.country;
            var state = form.values.province;
            var postalCode = form.values.postal_code.replace(/ /g, "+");

            if (authTokens == null || authTokens == undefined) {
                authTokens = JSON.parse(localStorage.getItem("authTokens")!);
            }
            form.values.business_owner = await getOwnerIdByUserId(user.user_id, authTokens);
            form.values.business_plan_id = 1;

            // get latitude and longitude from geocode api 
            // https://geocode.maps.co/
            var url = "https://geocode.maps.co/search?";
            url += "street=" + formattedStreet + "&city=" + city + "&state=" + state + "&postalcode=" + postalCode + "&country=" + country;
            const geocodeResponse = await axios.get(url);
            if (geocodeResponse.status == 200) {
                const locations = geocodeResponse.data;
                if (locations.length > 0) {
                    const latitude = parseFloat(locations[0].lat);
                    const longitude = parseFloat(locations[0].lon);

                    // POST new business
                    var businessId = "";
                    const response = await axios.post(API_ROUTES.BUSINESSES, form.values);
                    if (response.status === 201) {
                        // get new business id
                        const businessResponse = await axios.get(API_ROUTES.BUSINESSES_NAME(form.values.name));
                        if (businessResponse.status === 200) {
                            businessId = businessResponse.data.business_id;
                            // create new location object
                            var location: Location = {
                                business_id: businessId,
                                latitude: latitude,
                                longitude: longitude
                            }
                            // POST location object to create a new location record
                            const latLonResponse = await axios.post(API_ROUTES.LOCATIONS, location);
                            if (latLonResponse.status === 201) {
                                var locationId = -1;
                                const newLocation = await axios.get(API_ROUTES.LOCATIONS_BUSINESS_ID(businessId));
                                if (newLocation.status === 200) {
                                    locationId = newLocation.data.location_id;
                                    // update location_id for the business
                                    const updatedData = {
                                        location_id: locationId
                                    };
                                    const updateBusinessResponse = await axios.put(API_ROUTES.BUSINESSES_ID(businessId), updatedData);
                                    if (updateBusinessResponse.status === 200) {
                                        // open success snackbar
                                        handleOpenSnackbar();
                                        return;
                                    }
                                }
                                // open success snackbar
                                handleOpenSnackbar();
                            }
                        }
                    }
                }
            }
            else {
                // show error
            }
            // else {
            //   // POST new business without location
            //   const response = await axios.post(API_ROUTES.BUSINESSES, form.values);
            //   if (response.status === 201) {
            //     // open success snackbar
            //     handleOpenSnackbar();
            //   }
            // }
        }
        catch (error) {
            console.error('Error submitting form:', error);
            // TODO: open error snackbar
        }
    };

    // State to control whether snackbar is open or closed
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);

    // Handler to open snackbar
    const handleOpenSnackbar = () => {
        setSnackbarOpen(true);
    }

    // Handler to close snackbar
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    }

    // increment step counter
    const nextStep = () => {
        console.log(form.values);
        setActiveCount((current) => {
            if (form.validate().hasErrors) {
                return current;
            }
            return current < 3 ? current + 1 : current;
        });
    }

    // decrement step counter
    const prevStep = () => {
        setActiveCount((current) => (current > 0 ? current - 1 : current));
    }

    /* 
      Business registration form
      - string business_name*
      - string street*
      - string city*
      - string province*
      - string country*
      - string postal_code*
      - string contact_number*
      - int business_type_id*
      - int business_owner_id 
      - string latitude*
      - string longitude*
      - string strict_mode*
      - string strict_mode_location*
      - string business_plan_id*
    */
    return (
        <Container size="md" color="white">
            {/* display success snackbar */}
            <SuccessSnackbar triggerOpen={snackbarOpen} message={1} />

            {/* Title */}
            {/* <Group justify="center" style={{ marginBottom: '16px' }}>
                <IconBuilding size={42}/>
                <Title ta="center" order={2}>
                    Business Registration Form
                </Title>
            </Group> */}
            

            {/* Button to fill in test data */}
            {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Button
                    onClick={handleFillTestData}
                    color="red"
                    size="sm"
                >
                    Test data
                </Button>
            </div> */}

            {/* Business registration form */}
            <Stepper
                active={activeCount}
            // styles={{separator: {
            //   maxWidth:"150px",
            //   //marginRight: rem(-2),
            //   //height: rem(10),
            // },}}
            >
                <Stepper.Step 
                    p="sm" 
                    label="Step 1" 
                    description="Business information" 
                    //color="#fff"
                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                >
                    <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background:"#161b26", color:"white"}}>
                        <Stack>
                            <Text ta="left" style={{ fontSize: '24px' }}>
                                Business information
                            </Text>
                            <Text size="md" ta="left">
                                Tell us about your business! Just the basic information, such as your business name and contact information.
                            </Text>
                        </Stack>
                        <Space h="md"/>
                        <Divider/>
                        <Space h="md"/>
                        <Grid>
                            <Grid.Col span={12}>
                                <TextInput
                                    required
                                    id="business-name"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Business name"
                                    name="name"
                                    placeholder="Business name"
                                    size="lg"
                                    //classNames={classes}
                                    {...form.getInputProps('name')}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    required
                                    disabled
                                    id="owner"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Business owner"
                                    name="owner"
                                    placeholder="Business owner"
                                    size="lg"
                                    {...form.getInputProps('business_owner')}
                                />
                                {/* <Select
                                    required
                                    id="owner"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Owner"
                                    placeholder="Select an owner"
                                    allowDeselect={false}
                                    size="lg"
                                    data={ownerData}
                                    //classNames={classes}
                                    {...form.getInputProps('business_owner')}
                                    onChange={(value) => handleSelectChange('owner', value)}
                                //value={form.getInputProps('business_owner').value.toString()}
                                >
                                </Select> */}
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    required
                                    id="contact-number"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Business contact number"
                                    name="contact_number"
                                    placeholder="Business contact number"
                                    size="lg"
                                    {...form.getInputProps('contact_number')}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Select
                                    required
                                    id="type"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    allowDeselect={false}
                                    placeholder="Select a business type"
                                    label="Business type"
                                    name="business_type"
                                    size="lg"
                                    data={typesData}
                                    {...form.getInputProps('business_type')}
                                    onChange={(value) => handleSelectChange('type', value)}
                                //value={form.getInputProps('business_type').value}
                                >
                                </Select>
                            </Grid.Col>
                        </Grid>
                    </Paper>

                </Stepper.Step>
                <Stepper.Step 
                    label="Step 2" 
                    description="Location information"
                    color="#fff"
                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                >
                    <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="md" style={{ marginTop: "15px", padding: "20px", background:"#161b26", color:"white"}}>
                        <Stack>
                            <Text ta="left" style={{ fontSize: '24px' }}>
                                Business address information
                            </Text>
                            <Text ta="left" size="md">
                                Where is this business currently located? Please provide the location information.
                            </Text>
                        </Stack>
                        <Space h="md"/>
                        <Divider/>
                        <Space h="md"/>
                        <Grid>
                            <Grid.Col span={12}>
                                <TextInput
                                    required
                                    id="street"
                                    label="Street address"
                                    name="street"
                                    placeholder="Street address"
                                    size="lg"
                                    {...form.getInputProps('street')}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <TextInput
                                    required
                                    id="city"
                                    label="City"
                                    name="city"
                                    placeholder="City"
                                    size="lg"
                                    {...form.getInputProps('city')}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <Select
                                    required
                                    id="country"
                                    allowDeselect={false}
                                    placeholder="Select a country"
                                    label="Country"
                                    size="lg"
                                    data={countryData}
                                    {...form.getInputProps('country')}
                                >
                                </Select>
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <Select
                                    required
                                    allowDeselect={false}
                                    id="province"
                                    label="Province"
                                    name="province"
                                    placeholder="Select a province"
                                    size="lg"
                                    data={canadaProvinceData}
                                    {...form.getInputProps('province')}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <TextInput
                                    required
                                    id="postal-code"
                                    label="Postal code"
                                    name="postal_code"
                                    placeholder="Postal code"
                                    size="lg"
                                    {...form.getInputProps('postal_code')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>
                </Stepper.Step>
                <Stepper.Step 
                    label="Final step" 
                    description="Other information"
                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                >
                    <Fieldset radius="md" style={{ marginTop: "15px", padding: "20px" }}>
                        <Stack>
                            <Text ta="left" style={{ fontSize: '24px' }}>
                                Other information
                            </Text>
                            <Text ta="left" size="md">
                                Is there anything else we should know about?
                            </Text>
                        </Stack>
                        <Space h="md"/>
                        <Divider/>
                        <Space h="md"/>
                        <Grid>
                            <Grid.Col span={12}>
                                <Textarea
                                    autosize
                                    minRows={6}
                                    id="other-info"
                                    name="notes"
                                    placeholder="Enter any other information here"
                                    size="lg"
                                    {...form.getInputProps('notes')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Fieldset>
                </Stepper.Step>
                <Stepper.Completed>
                    <Fieldset radius="md" style={{marginTop:"15px", padding:"20px"}}>
                        <Stack>
                            <Text ta="left" style={{ fontSize: '24px' }}>
                                All done!
                            </Text>
                            <Text ta="left" size="md">
                                The form has been filled out. Click the submit button to register this new person!
                            </Text>
                            <Space h="md"/>
                            <Divider/>
                            <Space h="md"/>
                            <Button 
                                type='submit'
                                size='xl'
                                fullWidth
                                color='green'
                                radius="md"
                                onClick={handleSubmit}
                                style={{marginTop: "50px"}}
                            >
                                Submit
                            </Button>
                        </Stack>
                    </Fieldset>
                    
                    {/* <Code block mt="xl">
                        {JSON.stringify(form.values, null, 2)}
                    </Code> */}
                </Stepper.Completed>
            </Stepper>

            {activeCount === 0 && (
                <Group justify="flex-end" mt="xl">
                    <Button 
                        onClick={nextStep} 
                        size='lg' 
                        radius="md"
                    >
                        Next step
                    </Button>
                </Group>
            )}
            {activeCount > 0 && (
                <Group justify="space-between" mt="xl">
                    {activeCount !== 0 && (
                        <Button 
                            variant="default" 
                            onClick={prevStep} 
                            size='lg'
                            radius="md"
                        >
                            Back
                        </Button>
                    )}
                    {(activeCount != 2 && activeCount != 3) && (<Button onClick={nextStep} size='lg' radius="md">Next step</Button>)}
                    {activeCount == 2 && <Button onClick={nextStep} size='lg' radius="md">Done</Button>}
                </Group>
            )}
        </Container>
    );
};