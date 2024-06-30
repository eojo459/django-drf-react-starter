import React, { ChangeEvent, FormEvent, useContext, useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import SuccessSnackbar from '../../../components/Snackbar';
import { API_ROUTES } from '../../../apiRoutes';
import { useForm } from '@mantine/form';
import { Text, Button, Paper, Grid, TextInput, Textarea, Select, Stepper, Group, Container, Fieldset, Title, Divider, Space, Stack, useComputedColorScheme } from '@mantine/core';
import { countryData, canadaProvinceData } from '../../../helpers/SelectData';
import { IconUser } from '@tabler/icons-react';
import { AuthContext } from '../../../authentication/AuthContext';
import { PostEmergencyContact, PostStaff, PostStaffRelationship, getBusinesses, getIdByContactNumber, getIdByUsername } from '../../../helpers/Api';

export default function StaffRegistrationForm() {
    // States
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    let { authTokens, user } : any = useContext(AuthContext);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [businessesSelectData, setBusinessesSelectData] = useState<any[]>([]);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const levels = ['1', '2', '3'];
    const [activeCount, setActiveCount] = useState<number>(0);

    // Function runs as soon as the component loads
    useEffect(() => {
        const fetchData = async () => {
            if (user != null) {
                if (authTokens == null || authTokens == undefined) {
                    authTokens = JSON.parse(localStorage.getItem("authTokens")!);
                }
                // get business data
                var businesses = await getBusinesses(authTokens);
                if (businesses.length > 0) {
                    const businessData = businesses.map((business: { uid: string, name: string }) => ({
                        value: business.uid,
                        label: business.name,
                    }));
                    setBusinesses(businesses);
                    setBusinessesSelectData(businessData);
                }
            }
        };
        // Get data from api on component load
        fetchData();
    }, []);

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            business_id: '',
            username: '',
            password: '',
            first_name: '',
            last_name: '',
            street: '',
            city: '',
            province: '',
            country: '',
            postal_code: '',
            gender: '',
            role: '',
            cell_number: '',
            work_number: '',
            home_number: '',
            email: '',
            notes: '',
            level: 0,
            emergency_contact_id: -1,
        },
        validate: (value) => {
            switch (activeCount) {
                case 0:
                    return {
                        business_id: value.business_id.trim().length < 1 ? 'Business is required' : null,
                        first_name: value.first_name.trim().length < 2 ? 'First name must have at least 2 letters' : null,
                        last_name: value.last_name.trim().length < 1 ? 'Last name is required' : null,
                        gender: value.gender.trim().length < 1 ? 'Gender is required' : null,
                        //role: value.role.trim().length < 1 ? 'Role is required' : null,
                        cell_number: value.cell_number.trim().length < 1 ? 'Cell number is required' : null,
                        email: /^\S+@\S+$/.test(value.email.trim()) ? null : 'Invalid email'
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

    const emergencyContactForm = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            contact_number: '',
            notes: '',
        },
        validate: (value) => {
            return {
                first_name: value.first_name.trim().length < 1 ? 'First name is required' : null,
                last_name: value.last_name.trim().length < 1 ? 'Last name is required' : null,
                contact_number: value.contact_number.trim().length < 1 ? 'Cell number is required' : null,
            }
        }
    });

    const staffRelationshipForm = useForm({
        initialValues: {
            business_id: '',
            staff_id: '',
        },
        validate: (value) => {
            switch (activeCount) {
                case 0:
                    return {
                        business_id: value.business_id.trim().length < 1 ? 'First name must have at least 2 letters' : null,
                        staff_id: value.staff_id.trim().length < 1 ? 'Last name is required' : null,
                    }
            }
            return {};
        }
    });

    // Quickly fill in form with test data
    const handleFillTestData = () => {
        // update staff fields
        form.setValues({
            business_id: '',
            first_name: 'Kyle',
            last_name: 'Wesley',
            street: '2491 11th Ave',
            city: 'Calgary',
            country: 'Canada',
            province: 'AB',
            postal_code: 'A1B 2C3',
            gender: 'Male',
            role: 'Staff',
            cell_number: '4039998888',
            work_number: '',
            home_number: '',
            email: 'kyle.wesley@email.com',
            notes: '',
            level: 0,
        });

        // update emergency contact fields
        emergencyContactForm.setValues({
            first_name: 'Bart',
            last_name: 'Simpson',
            contact_number: '4449992222',
            notes: '',
        });
    };

    // Handlers
    const handleOpenSnackbar = () => {
        setSnackbarOpen(true);
    }

    // Handler to close snackbar
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    }

    // handler for select
    const handleSelectChange = (selectType: string, value: string | null) => {
        if (value != null) {
            switch (selectType) {
                case 'business':
                    form.setValues({ business_id: value });
                    return;
                default:
                    return;
            }
        }
        return;
    }

    // Handle form submit
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (authTokens == null || authTokens == undefined) {
                authTokens = JSON.parse(localStorage.getItem("authTokens")!);
            }
            // check if emergency contact was filled
            if (!emergencyContactForm.validate().hasErrors) {
                // POST new emergency contact first
                const emergencyContactResponse = await PostEmergencyContact(emergencyContactForm.values, authTokens);
                if (emergencyContactResponse?.status === 201) {
                    // POST staff with emergency contact linked
                    //const createdEmergencyContact = await getIdByContactNumber(emergencyContactForm.values.contact_number, false, authTokens);
                    const createdEmergencyContact = emergencyContactResponse.data.Location;
                    form.values.emergency_contact_id = createdEmergencyContact;
                    const staffResponse = await PostStaff(form.values, authTokens);
                    if (staffResponse?.status === 201) {
                        //const createdStaff = await getIdByUsername(form.values.username, authTokens);
                        const createdStaff = staffResponse.data.Location;

                        // setup new staff relationship data
                        staffRelationshipForm.values.business_id = form.values.business_id;
                        staffRelationshipForm.values.staff_id = createdStaff;

                        // POST new staff relationship
                        const staffRelationshipResponse = await PostStaffRelationship(staffRelationshipForm.values, authTokens);
                        if (staffRelationshipResponse === 201) {
                            // open success alert
                            handleOpenSnackbar();
                            return;
                        }
                    }
                }
                // open error alert
                return;
            }
            else {
                // POST staff without emergency contact
                const staffResponse = await PostStaff(form.values, authTokens);
                if (staffResponse?.status === 201) {
                    //const createdStaff = await getIdByUsername(form.values.username, authTokens);
                    const createdStaff = staffResponse.data.Location;

                    // setup new staff relationship data
                    staffRelationshipForm.values.business_id = form.values.business_id;
                    staffRelationshipForm.values.staff_id = createdStaff;

                    // POST new staff relationship
                    const staffRelationshipResponse = await axios.post(API_ROUTES.STAFFS_RELATIONSHIP, staffRelationshipForm.values);
                    if (staffRelationshipResponse.status === 201) {
                        // open success alert
                        handleOpenSnackbar();
                        return;
                    }
                }
                // open error alert
                return;
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            // TODO: open error snackbar
        }
    };

    // increment step counter
    const nextStep = () => {
        setActiveCount((current) => {
            if (form.validate().hasErrors) {
                return current;
            }
            return current < 4 ? current + 1 : current;
        });
    }

    // decrement step counter
    const prevStep = () => {
        setActiveCount((current) => (current > 0 ? current - 1 : current));
    }

    /*
      Staff registration form 
      - int    business_id*
      - string first_name*
      - string last_name* 
      - TODO: date of birth*
      - string city*
      - string street*
      - string province*
      - string postal_code*
      - string country*
      - string gender* 
      - string role*
      - string cell_number*
      - string home_number
      - string level
      - email  email*
      - string notes
      - int    emergency_contact_id*
    */
    return (
        <Container size="lg">
            {/* display success snackbar */}
            <SuccessSnackbar triggerOpen={snackbarOpen} message={2} />

            {/* Title */}
            {/* <Group justify="center" style={{ marginTop: '32px', marginBottom: '64px' }}>
                <IconUser size={42} />
                <Title ta="center" order={1}>
                    Staff Registration Form
                </Title>
            </Group> */}

            {/* Button to fill in test data */}
            {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px' }}>
                <Button
                    onClick={handleFillTestData}
                    variant="default"
                    size="sm"
                >
                    Test data
                </Button>
            </div> */}

            {/* Staff registration form */}
            <Stepper active={activeCount}>
                <Stepper.Step label="Step 1" description="Personal information">
                    <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background:"#161b26", color:"white"}}>
                        <Text ta="left" style={{ marginBottom: '16px', fontSize: '24px' }}>
                            Staff information
                        </Text>
                        <Text size="md" ta="left">
                            Tell us about this employee! Their information is secure and we do not share this information with other third parties.
                        </Text>
                        <Space h="md"/>
                        <Divider/>
                        <Space h="md"/>
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    required
                                    id="username"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Username"
                                    name="username"
                                    placeholder="Username"
                                    size="lg"
                                    {...form.getInputProps('username')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    required
                                    id="password"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Password"
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    size="lg"
                                    {...form.getInputProps('password')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    required
                                    id="first-name"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="First name"
                                    name="first_name"
                                    placeholder="First name"
                                    size="lg"
                                    {...form.getInputProps('first_name')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    required
                                    id="last-name"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Last name"
                                    name="last_name"
                                    placeholder="Last name"
                                    size="lg"
                                    {...form.getInputProps('last_name')}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Select
                                    required
                                    id="business"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Business"
                                    placeholder="Select a business"
                                    allowDeselect={false}
                                    size="lg"
                                    data={businessesSelectData}
                                    {...form.getInputProps('business_id')}
                                    onChange={(value) => handleSelectChange('business', value)}
                                >
                                </Select>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Select
                                    id="staff-gender-select"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    required
                                    name='gender'
                                    label="Gender"
                                    placeholder="Select a gender"
                                    allowDeselect={false}
                                    data={['Male', 'Female', 'Other']}
                                    size="lg"
                                    {...form.getInputProps('gender')}
                                >
                                </Select>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    //required
                                    id="role"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Role"
                                    name="role"
                                    placeholder="Role"
                                    size="lg"
                                    {...form.getInputProps('role')}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Select
                                    //required
                                    id="level"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Level"
                                    name="level"
                                    placeholder="Level"
                                    size="lg"
                                    allowDeselect={true}
                                    data={levels}
                                    {...form.getInputProps('level')}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    required
                                    id="cell-number"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Cell number"
                                    name="cell_number"
                                    placeholder="Cell number"
                                    size="lg"
                                    {...form.getInputProps('cell_number')}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    id="work-number"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Work number"
                                    name="work_number"
                                    placeholder="Work number"
                                    size="lg"
                                    {...form.getInputProps('work_number')}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    id="home-number"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Home number"
                                    name="home_number"
                                    placeholder="Home number"
                                    size="lg"
                                    {...form.getInputProps('home_number')}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <TextInput
                                    required
                                    id="email"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Email"
                                    name="email"
                                    placeholder="Email"
                                    size="lg"
                                    {...form.getInputProps('email')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>
                </Stepper.Step>
                <Stepper.Step label="Step 2" description="Location information">
                    <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background:"#161b26", color:"white"}}>
                        <Stack>
                            <Text ta="left" style={{ fontSize: '24px' }}>
                                Address information
                            </Text>
                            <Text ta="left" style={{ fontSize: '16px' }}>
                                Where do they currently live?
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
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
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
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
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
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
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
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
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
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
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
                {/* Emergency contact section */}
                <Stepper.Step label="Step 3" description="Emergency contact information">
                    <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background:"#161b26", color:"white"}}>
                        <Stack>
                            <Text ta="left" style={{ fontSize: '24px' }}>
                                Emergency Contact Information
                            </Text>
                            <Text ta="left" style={{ fontSize: '16px' }}>
                                Who should we contact in case of an emergency?
                            </Text>
                        </Stack>
                        <Space h="md"/>
                        <Divider/>
                        <Space h="md"/>
                        <Grid>
                            <Grid.Col span={4}>
                                <TextInput
                                    id="emergency_contact_first_Name"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="First name"
                                    name="first_name"
                                    placeholder="Emergency contact first name"
                                    size="lg"
                                    {...emergencyContactForm.getInputProps('first_name')}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    id="emergency_contact_last_Name"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Last name"
                                    name="last_name"
                                    placeholder="Emergency contact last name"
                                    {...emergencyContactForm.getInputProps('last_name')}
                                    size="lg"
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    id="emergency_contact_number"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Emergency contact number"
                                    name="contact_number"
                                    placeholder="Emergency contact number"
                                    {...emergencyContactForm.getInputProps('contact_number')}
                                    size="lg"
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea
                                    autosize
                                    minRows={6}
                                    id="other-info"
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    label="Other information"
                                    name="notes"
                                    placeholder="Enter any other information here"
                                    size="lg"
                                    {...emergencyContactForm.getInputProps('notes')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>
                </Stepper.Step>
                <Stepper.Step label="Final step" description="Other information">
                    <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background:"#161b26", color:"white"}}>
                        <Stack>
                            <Text ta="left" style={{ fontSize: '24px' }}>
                                Other Information
                            </Text>
                            <Text ta="left" style={{ fontSize: '16px' }}>
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
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                    name="notes"
                                    placeholder="Enter any other information here"
                                    size="lg"
                                    {...form.getInputProps('notes')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>
                </Stepper.Step>
                <Stepper.Completed>
                    <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background:"#161b26", color:"white"}}>
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
                    </Paper>
                    
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
                    {(activeCount != 3 && activeCount != 4) && (<Button onClick={nextStep} size='lg' radius="md">Next step</Button>)}
                    {activeCount == 3 && <Button onClick={nextStep} size='lg' radius="md">Done</Button>}
                </Group>
            )}
        </Container>
    );
};
