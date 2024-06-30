import { useForm } from '@mantine/form';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { formatDate } from '../../../../../helpers/Helpers';
import { Button, Divider, Fieldset, Grid, Select, TextInput, Text, Stack, Group, Paper, Space, Container } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { countryData, canadaProvinceData } from '../../../../../helpers/SelectData';
import classes from '../../../../../css/Settings.module.scss';

export function SettingsPersonal() {
    const [userType, setUserType] = useState('Owner'); // TODO: get userType from authenticated user

    // form fields for mantine components
    const ownerForm = useForm({
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
            profile_plan_id: 1,
        },
        validate: (value) => {
            return {
                first_name: value.first_name.trim().length < 2 ? 'Name must have at least 2 letters' : null,
                last_name: value.last_name.trim().length < 1 ? 'Last name is required' : null,
                gender: value.gender.trim().length < 1 ? 'Gender is required' : null,
                role: value.role.trim().length < 1 ? 'Role is required' : null,
                cell_number: value.cell_number.trim().length < 1 ? 'Cell number is required' : null,
                email: /^\S+@\S+$/.test(value.email.trim()) ? null : 'Invalid email',
                street: value.street.trim().length < 1 ? 'Street address is required' : null,
                city: value.city.trim().length < 1 ? 'City is required' : null,
                province: value.province.trim().length < 1 ? 'Province is required' : null,
                country: value.country.trim().length < 1 ? 'Country is required' : null,
                postal_code: value.postal_code.trim().length < 1 ? 'Postal code is required' : null,
            }
        }
    });

    const userForm = useForm({
        initialValues: {
            business_id: -1,
            first_name: '',
            last_name: '',
            street: '',
            city: '',
            province: '',
            country: '',
            postal_code: '',
            gender: '',
            age: 0,
            date_of_birth: '',
            allergies: '',
            medical_info: '',
            date_joined: formatDate(new Date), // use current date
            notes: '',
            emergency_contact_id: -1,
        },
        validate: (value) => {
            return {
                business_id: value.business_id < 0 ? 'Business is required' : null,
                first_name: value.first_name.trim().length < 1 ? 'First name is required' : null,
                last_name: value.last_name.trim().length < 1 ? 'Last name is required' : null,
                gender: value.gender.trim().length < 1 ? 'Gender is required' : null,
                date_of_birth: value.date_of_birth == '' ? 'Date of birth is required' : null,
                street: value.street.trim().length < 1 ? 'Street address is required' : null,
                city: value.city.trim().length < 1 ? 'City is required' : null,
                province: value.province.trim().length < 1 ? 'Province is required' : null,
                country: value.country.trim().length < 1 ? 'Country is required' : null,
                postal_code: /^([A-Za-z])\d([A-Za-z])\s(\d)([A-Za-z])\d$/.test(value.postal_code.trim()) ? null : 'Please use the form \'A1B 2C3\'',
            }
        }
    });

    if (userType == 'Owner') {
        return (
            <Container fluid>
                <Group grow align="start" justify="center" style={{ marginTop: "20px" }}>
                    <Paper 
                        radius="md" 
                        withBorder 
                        style={{padding: "15px", marginTop: "10px", maxWidth: "600px", height: "200px"}}
                    >
                        <Text size="lg">Personal information</Text>
                        <Space h="sm"/>
                        <Divider/>
                        <Space h="sm"/>
                        <Text size="md">
                            Manage and update your personal details to ensure accurate account information.
                        </Text>
                    </Paper>
                    
                    <Fieldset 
                        legend="Personal information" 
                        style={{ maxWidth: "600px", marginBottom:"10px", height: "210px"}} 
                        classNames={classes}
                        radius="md"
                    >
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    required
                                    variant="filled"
                                    id="first-name"
                                    label="First name"
                                    name="first_name"
                                    placeholder="First name"
                                    size="md"
                                    radius="md"
                                    {...ownerForm.getInputProps('first_name')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    required
                                    variant="filled"
                                    id="last-name"
                                    label="Last name"
                                    name="last_name"
                                    placeholder="Last name"
                                    size="md"
                                    radius="md"
                                    {...ownerForm.getInputProps('last_name')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    id="owner-gender-select"
                                    required
                                    variant="filled"
                                    name='gender'
                                    label="Gender"
                                    placeholder="Select a gender"
                                    allowDeselect={false}
                                    data={['Male', 'Female', 'Other']}
                                    size="md"
                                    radius="md"
                                    {...ownerForm.getInputProps('gender')}
                                >
                                </Select>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    required
                                    variant="filled"
                                    id="role"
                                    label="Role"
                                    name="role"
                                    placeholder="Role"
                                    size="md"
                                    radius="md"
                                    {...ownerForm.getInputProps('role')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Fieldset>
                </Group>
            
                <Group grow align="start" justify="center" style={{ marginTop: "15px" }}>
                    <Paper 
                        radius="md" 
                        withBorder 
                        style={{padding: "15px", marginTop: "10px", maxWidth: "600px", height: "200px"}} 
                        classNames={classes}
                    >
                        <Text size="lg">Contact information</Text>
                        <Space h="sm"/>
                        <Divider/>
                        <Space h="sm"/>
                        <Text size="md">
                            Never miss important updates by keeping your contact information up to date. 
                            Update your email address and phone number to stay informed.
                        </Text>
                    </Paper>
                    {/* <Text size="md">Contact information</Text> */}
                    <Fieldset 
                        legend="Contact information" 
                        style={{ maxWidth: "600px", marginBottom:"15px", height: "210px"}}
                        radius="md"
                    >
                        <Grid>
                            <Grid.Col span={4}>
                                <TextInput
                                    required
                                    variant="filled"
                                    id="cell-number"
                                    label="Cell number"
                                    name="cell_number"
                                    placeholder="Cell number"
                                    size="md"
                                    radius="md"
                                    {...ownerForm.getInputProps('cell_number')}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    variant="filled"
                                    id="work-number"
                                    label="Work number"
                                    name="work_number"
                                    placeholder="Work number"
                                    size="md"
                                    radius="md"
                                    {...ownerForm.getInputProps('work_number')}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    variant="filled"
                                    id="home-number"
                                    label="Home number"
                                    name="home_number"
                                    placeholder="Home number"
                                    size="md"
                                    radius="md"
                                    {...ownerForm.getInputProps('home_number')}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <TextInput
                                    required
                                    variant="filled"
                                    id="email"
                                    label="Email"
                                    name="email"
                                    placeholder="Email"
                                    size="md"
                                    radius="md"
                                    {...ownerForm.getInputProps('email')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Fieldset>
                </Group>
            
                <Group grow align="start" justify="center" style={{ marginTop: "15px" }}>
                    <Paper 
                        radius="md" 
                        withBorder 
                        style={{padding: "15px", marginTop: "10px", maxWidth: "600px", height: "200px"}} 
                        classNames={classes}
                    >
                        <Text size="lg">Location information</Text>
                        <Space h="sm"/>
                        <Divider/>
                        <Space h="sm"/>
                        <Text size="md">
                            This is where you are currently living. Update your address, city, country and other fields.
                        </Text>
                    </Paper>
                    {/* <Text size="md">Location information</Text> */}
                    <Fieldset 
                        legend="Location information" 
                        style={{ maxWidth: "600px", height: "210px"}}
                        radius="md"
                    >
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    required
                                    variant="filled"
                                    id="street"
                                    label="Street address"
                                    name="street"
                                    placeholder="Street address"
                                    size="md"
                                    radius="md"
                                    {...ownerForm.getInputProps('street')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    required
                                    variant="filled"
                                    id="city"
                                    label="City"
                                    name="city"
                                    placeholder="City"
                                    size="md"
                                    radius="md"
                                    {...ownerForm.getInputProps('city')}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Select
                                    required
                                    variant="filled"
                                    id="country"
                                    allowDeselect={false}
                                    placeholder="Select a country"
                                    label="Country"
                                    size="md"
                                    radius="md"
                                    data={countryData}
                                    {...ownerForm.getInputProps('country')}
                                >
                                </Select>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Select
                                    required
                                    variant="filled"
                                    allowDeselect={false}
                                    id="province"
                                    label="Province"
                                    name="province"
                                    placeholder="Select a province"
                                    size="md"
                                    radius="md"
                                    data={canadaProvinceData}
                                    {...ownerForm.getInputProps('province')}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    required
                                    variant="filled"
                                    id="postal-code"
                                    label="Postal code"
                                    name="postal_code"
                                    placeholder="Postal code"
                                    size="md"
                                    radius="md"
                                    {...ownerForm.getInputProps('postal_code')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Fieldset>
                </Group>
                <Group justify="center">
                    <Button 
                        size="lg" 
                        fullWidth 
                        color="green"
                        style={{ maxWidth: "1200px", marginTop:"25px", marginBottom: "60px"}}
                    >
                        Save
                    </Button>
                </Group>
                

            </Container>
        );
    }
    else {
        return (
            <></>
        );
    }


}