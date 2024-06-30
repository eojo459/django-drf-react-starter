import React, { ChangeEvent, ChangeEventHandler, FormEvent, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import SuccessSnackbar from '../../../../components/Snackbar';
import { API_ROUTES } from '../../../../apiRoutes';
import { useForm } from '@mantine/form';
import { Text, Button, Paper, Grid, TextInput, Textarea, Select, Stepper, Code, Group, Container, Fieldset, Title, Stack, Divider, Space, useComputedColorScheme } from '@mantine/core';
import { countryData, canadaProvinceData } from '../../../../helpers/SelectData';
import { IconUser } from '@tabler/icons-react';
import { OwnerDataLocal } from './test-data-owner';
import { formatDate } from '../../../../helpers/Helpers';
import '../../../../css/MantineComponents.scss';
import { PostOwner } from '../../../../helpers/Api';
import { AuthContext } from '../../../../authentication/AuthContext';

export default function OwnerRegistrationForm() {
    // states
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const [activeCount, setActiveCount] = useState<number>(0);
    let { authTokens } : any = useContext(AuthContext);
    const selectClassesDark = "input-dark mantine-Select-options-dark mantine-ScrollArea-root";
    const selectClassesLight = "input-light mantine-Select-options-light";

    // form fields for mantine components
    const form = useForm({
        initialValues: {
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
            username: '',
            password: '',
        },
        validate: (value) => {
            switch (activeCount) {
                case 0:
                    return {
                        first_name: value.first_name.trim().length < 2 ? 'Name is required' : null,
                        last_name: value.last_name.trim().length < 1 ? 'Last name is required' : null,
                        gender: value.gender.trim().length < 1 ? 'Gender is required' : null,
                        role: value.role.trim().length < 1 ? 'Role is required' : null,
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

    // Quickly fill in form with test data
    const handleFillTestData = () => {
         // randomly pick child from test data
         const localDataOwner = OwnerDataLocal;
         const randomIndex = Math.floor(Math.random() * localDataOwner.length);
         const randomOwner = localDataOwner[randomIndex];
 
         // update staff fields
         form.setValues({
             first_name: randomOwner.first_name,
             last_name: randomOwner.last_name,
             street: randomOwner.street,
             city: randomOwner.city,
             province: randomOwner.province,
             country: randomOwner.country,
             postal_code: randomOwner.postal_code,
             gender: randomOwner.gender,
             notes: randomOwner.notes,
         });
    };

    // Handle form submit
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // POST new owner
        try {
            if (authTokens == null || authTokens == undefined) {
                authTokens = JSON.parse(localStorage.getItem("authTokens")!);
            }
            const data = await PostOwner(form.values, authTokens);
            if (data?.status == 201) {
                // show success alert
            }
        } catch (error) {
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
      Owner registration form 
      - string first_name*
      - string last_name* 
      - string city*
      - string street*
      - string province*
      - string country*
      - string postal_code*
      - string city*
      - string gender* 
      - string role*
      - string cell_number*
      - string work_number
      - string home_number
      - email email*
      - string notes 
      - int profile_plan_id
    */
    return (
        <Container size="md" style={{marginBottom:"120px"}}>
            {/* display success snackbar */}
            <SuccessSnackbar triggerOpen={snackbarOpen} message={0} />

            {/* Title */}
            <Group justify="center" style={{ marginTop: '32px', marginBottom: '64px', color:"white"}}>
                <IconUser size={42}/>
                <Title ta="center" order={1}>
                    Owner Registration Form
                </Title>
            </Group>

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

            {/* Owner registration form */}
            <Stepper active={activeCount}>
                <Stepper.Step 
                    label="Step 1" 
                    description="Personal Information"
                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                >
                    <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ marginTop: "15px", padding: "20px", background:"#151b28", color:"white"}}>
                        <Stack>
                            <Text ta="left" style={{ fontSize: '24px' }}>
                                Owner information
                            </Text>
                            <Text size="md" ta="left">
                                Tell us about yourself! Your information is secure and we do not share this information with other third parties.
                            </Text>
                        </Stack>
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
                            <Grid.Col span={6}>
                                <Select
                                    id="owner-gender-select"
                                    //className={computedColorScheme == 'light' ? "input-dark mantine-Select-options-dark" : "input-light mantine-Select-options-light"}
                                    //className={computedColorScheme == 'light' ? "mantine-Select-options-light" : "mantine-Select-options-dark"}
                                    className={computedColorScheme == 'light' ? selectClassesLight : selectClassesDark}
                                    checkIconPosition="left"
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
                            <Grid.Col span={6}>
                                <TextInput
                                    required
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
                <Stepper.Step 
                    label="Step 2" 
                    description="Location information"
                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                >
                    <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="md" style={{ marginTop: "15px", padding: "20px", background:"#161b26", color:"white"}}>
                        <Stack>
                            <Text ta="left" style={{ fontSize: '24px' }}>
                                Owner address information
                            </Text>
                            <Text ta="left" size="md">
                                Where do they currently live? Please provide their location information.
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
                                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
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
                <Stepper.Step 
                    label="Final step"
                    description="Other information"
                    className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                >
                    <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="md" style={{ marginTop: "15px", padding: "20px", background:"#161b26", color:"white"}}>
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
                <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="md" style={{ marginTop: "15px", padding: "20px", background:"#161b26", color:"white"}}>
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
                    {(activeCount != 2 && activeCount != 3) && (<Button onClick={nextStep} size='lg' radius="md">Next step</Button>)}
                    {activeCount == 2 && <Button onClick={nextStep} size='lg' radius="md">Done</Button>}

                </Group>
            )}
        </Container>
    );
};
