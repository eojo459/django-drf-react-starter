import React, { ChangeEvent, useState } from 'react';
import { Typography, TextField, InputAdornment, FormControl, InputLabel, MenuItem, SelectChangeEvent } from '@mui/material'; 
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import { API_ROUTES } from '../../../apiRoutes';
import SuccessSnackbar from '../../../components/Snackbar';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
//import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmationModal from '../../../components/DeleteModal';
import { Text, Button, Paper, Grid, TextInput, Textarea, Select, Avatar, Container } from '@mantine/core';

export type ParentProfile = {
    parent_id: number;
    business_id: number;
    first_name: string;
    last_name: string;
    street: string;
    city: string;
    province: string;
    country: string;
    postal_code: string;
    gender: string;
    cell_number: string;
    work_number: string;
    home_number: string;
    email: string;
    notes: string;
};

interface ParentProfilePageProps {
  //child: ChildProfile;
  parent: ParentProfile;
}

const ParentProfilePage: React.FC<ParentProfilePageProps> = ({ parent }) => {

    const navigate = useNavigate();

    // Child form
    // const [childFormData, setChildFormData] = useState({
    //     child_id: child.child_id,
    //     business_id: child.business_id,
    //     first_name: child.first_name,
    //     last_name: child.last_name,
    //     address: child.address,
    //     age: child.age,
    //     gender: child.gender,
    //     date_of_birth: child.date_of_birth,
    //     allergies: child.allergies,
    //     medical_info: child.medical_info,
    //     emergency_contact_id: child.emergency_contact_id,
    //     notes: child.notes,
    //     date_joined: child.date_joined
    // });

    // Parent form
    const [parentFormData, setParentFormData] = useState({
        parent_id: parent.parent_id,
        business_id: parent.business_id,
        first_name: parent.first_name,
        last_name: parent.last_name,
        //address: parent.address,
        gender: parent.gender,
        cell_number: parent.cell_number,
        work_number: parent.work_number,
        home_number: parent.home_number,
        email: parent.email
    });

    // Child relationship form
    const [childRelationshipFormData, setChildRelationshipFormData] = useState({
        business_id: '',
        child_id: '',
        parent_id: '',
        relationship_type: ''
    });

    // Modal
    const [openModal, setOpenModal] = useState(false);
    
    // Child dob
    // const [childDob, setChildDob] = React.useState<Dayjs | null>(
    //     child.date_of_birth ? dayjs(child.date_of_birth) : null
    // );

    // Relationship type
    const [relationshipTypes, setRelationshipTypes] = useState<any[]>([]);
    const [selectedRelationshipTypeModel, setSelectedRelationshipTypeModel] = useState({
        type_id: '',
        name: ''
    });
      
    // Handlers
    const handleParentChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setParentFormData(prev => ({ ...prev, [name]: value }));
    };

    // const handleChildChange = (event: ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = event.target;
    //     setChildFormData(prev => ({ ...prev, [name]: value }));
    // };

    const handleParentGenderSelectChange = (value: string | null) => {
        if (value != null) {
            setParentFormData(prev => ({ ...prev, gender: value }));
        }
    };

    // const handleChildGenderSelectChange = (event: SelectChangeEvent) => {
    //     const { name, value } = event.target;
    //     setChildFormData(prev => ({ ...prev, [name]: event.target.value }));
    // };
    
    const handleChildDoBChange = (value: any) => {
        // setChildFormData(prev => ({ 
        //     ...prev, 
        //     date_of_birth: value.format('YYYY-MM-DD'),
        //     date_joined: value.format('YYYY-MM-DD') // fix this later
        // }));
        // setChildDob(prev => ({ ...prev, date_of_birth: value);
        console.log("date_of_birth:" + value.format('YYYY-MM-DD'));
    };

    // const handleParentChange = (event: ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = event.target;
    //     setParentFormData(prev => ({ ...prev, [name]: value }));
    // };

    // const handleParentGenderSelectChange = (event: SelectChangeEvent) => {
    //     const { name, value } = event.target;
    //     setParentFormData(prev => ({ ...prev, [name]: event.target.value }));
    // };

    const handleDeleteClick = () => {
        setOpenModal(true);
    };
    
    const handleDeleteConfirm = () => {
        // Perform the actual delete operation
        handleDelete(parent.parent_id);
        
        // Close the modal
        setOpenModal(false);
    };

    const handleModalClose = () => {
        setOpenModal(false);
    };

    const handleRelationshipTypeSelectChange = (event: SelectChangeEvent) => {
        const { name, value } = event.target;

        // change the type id and name in selected relationship type model
        const relationshipTypeId = findRelationshipTypeIdByName(value);
        setSelectedRelationshipTypeModel({
            type_id: relationshipTypeId.toString(),
            name: event.target.value
        });

        // update child relationship form, link to relationship type
        setChildRelationshipFormData(prev => ({ ...prev, relationship_type: relationshipTypeId }));
    };

    const handleSaveChanges = async () => {
        try {
          // Prepare the updated data
          const updatedParentData = parentFormData;
      
          // Send PUT request to update parent data
          const PARENT_ID = API_ROUTES.PARENTS_ID(parent.parent_id);
          const response = await axios.put(PARENT_ID, updatedParentData);
          if (response.status === 200) {
            console.log("Parent data updated successfully!");
            // Optionally, you can navigate back to the list page or show a success message
            setSaveMessage('1');
            handleOpenSnackbar();
          } else {
            console.error("Failed to update parent data");
          }
        } catch (error) {
          console.error("Error updating parent data:", error);
        }
    };

    // Handler for delete
    const handleDelete = async (id: number | string) => {
        try {
            const PARENT_ID = API_ROUTES.PARENTS_ID(parent.parent_id);
            const response = await axios.delete(PARENT_ID);
            if (response.status === 200) {
                //getChild();
                setSaveMessage('2');
                handleOpenSnackbar();
                navigate('/parent/list');
            }
        } catch (error) {
            console.error('Error deleting data:', error);
        }
    };

    // Find relationship type using name
    const findRelationshipTypeIdByName = (name: string) => {
        const relationshipType = relationshipTypes.find(relationshipType => relationshipType.name === name);
        return relationshipType ? relationshipType.type_id : null; // Return the ID if found, otherwise return null
    };

    // Calculate age from date of birth
    const calculateAge = (dob: any): number => {
        return dayjs().diff(dob, 'year');
    };

    // State to control type of message to be used (saved vs deleted)
    const [saveMessage, setSaveMessage] = React.useState('');

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

    return (
        <Container size="md">
            {/* display success snackbar */}
            {saveMessage == '1' && (
                <SuccessSnackbar triggerOpen={snackbarOpen} message={4} />
            )}
            {/* display success deleted snackbar */}
            {saveMessage == '2' && (
                <SuccessSnackbar triggerOpen={snackbarOpen} message={5} />
            )}
            
            <Grid>
                <Grid.Col span={12} style={{ display:"flex", justifyContent:"center" }}>
                    <Avatar
                        size="xl"
                        style={{fontSize: '40px', height:"100px", width:"100px"}}
                    >
                        {parent.first_name.charAt(0).toUpperCase() + " " + parent.last_name.charAt(0).toUpperCase()}
                    </Avatar>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Text 
                        style={{textTransform: 'capitalize', textAlign: 'center', fontSize:"25px"}}
                    >
                        {parent.first_name + " " + parent.last_name}'s Profile
                    </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput 
                        id="first-name" 
                        label="First name" 
                        name="first_name"
                        placeholder="First name"
                        value={parentFormData.first_name}
                        onChange={handleParentChange} 
                        size="lg"
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput 
                        id="last-name" 
                        label="Last name" 
                        name="last_name"
                        placeholder="Last name" 
                        value={parentFormData.last_name}
                        onChange={handleParentChange}
                        size="lg"
                    />
                </Grid.Col>
                {/* <Grid.Col span={12}>
                    <TextInput 
                        id="address" 
                        label="Address"
                        name="address" 
                        placeholder="Address"
                        value={parentFormData.address}
                        onChange={handleParentChange}
                        size="lg"
                    />
                </Grid.Col> */}
                <Grid.Col span={3}>
                    <Select
                        id="parent-gender-select"
                        value={parentFormData.gender}
                        name="gender"
                        label="Gender"
                        placeholder="Please select one"
                        onChange={handleParentGenderSelectChange}
                        size="lg"
                        data={['Male','Female','Other']}
                    >
                    </Select>
                </Grid.Col>
                <Grid.Col span={3}>
                    <TextInput
                        required
                        id="cell-number"
                        label="Cell number"
                        name="cell_number"
                        placeholder="Cell number"
                        value={parentFormData.cell_number}
                        onChange={handleParentChange}
                        size="lg"
                    />
                </Grid.Col>
                <Grid.Col span={3}>
                    <TextInput 
                        id="work-number" 
                        label="Work number" 
                        name="work_number"
                        placeholder="Work number"
                        value={parentFormData.work_number}
                        onChange={handleParentChange}
                        size="lg"
                    />
                </Grid.Col>
                <Grid.Col span={3}>
                    <TextInput 
                        id="home-number" 
                        label="Home number" 
                        name="home_number"
                        placeholder="Home number" 
                        value={parentFormData.home_number}
                        onChange={handleParentChange}
                        size="lg"
                    />
                </Grid.Col>
                <Grid.Col span={12}>
                    <TextInput 
                        id="email" 
                        label="Email" 
                        name="email"
                        placeholder="Email" 
                        value={parentFormData.email} 
                        onChange={handleParentChange}
                        size="lg"
                    />
                </Grid.Col>
                {/* Parent section */}
                {/*<Grid container item xs={12}>
                    <Typography variant="h5" align="left" style={{ marginTop: '32px' }}>
                        Parent Contact Information
                    </Typography>
                </Grid>
                 <Grid container item xs={6}>
                    <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="parent-first_name"
                    label="Parent First Name"
                    name="first_name"
                    value={parentFormData.first_name}
                    onChange={handleParentChange}
                    />
                </Grid>
                <Grid container item xs={6}>
                    <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="parent-last_name"
                    label="Parent Last Name"
                    name="last_name"
                    value={parentFormData.last_name}
                    onChange={handleParentChange}
                    />
                </Grid>
                <Grid container item xs={12}>
                    <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="parent-address"
                    label="Parent Address"
                    name="address"
                    value={parentFormData.address}
                    onChange={handleParentChange}
                    />
                </Grid>
                <Grid container item xs={6}>
                    <FormControl fullWidth>
                        <InputLabel id="parent-gender-select-label">Gender</InputLabel>
                        <Select
                            labelId="parent-gender-select-label"
                            id="parent-gender-select"
                            required
                            value={parentFormData.gender}
                            name='gender'
                            label="Gender"
                            onChange={handleParentGenderSelectChange}
                        >
                            <MenuItem value={"Male"}>Male</MenuItem>
                            <MenuItem value={"Female"}>Female</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid container item xs={6}>
                    <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="parent-cell-number"
                    label="Parent Cell Number"
                    name="cell_number"
                    value={parentFormData.cell_number}
                    onChange={handleParentChange}
                    />
                </Grid>
                <Grid container item xs={6}>
                    <TextField
                    variant="outlined"
                    fullWidth
                    id="parent-work-number"
                    label="Parent Work Number"
                    name="work_number"
                    value={parentFormData.work_number}
                    onChange={handleParentChange}
                    />
                </Grid>
                <Grid container item xs={6}>
                    <TextField
                    variant="outlined"
                    fullWidth
                    id="parent-home-number"
                    label="Parent Home Number"
                    name="home_number"
                    value={parentFormData.home_number}
                    onChange={handleParentChange}
                    />
                </Grid>
                <Grid container item xs={12}>
                    <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="parent-email"
                    label="Parent Email"
                    name="email"
                    value={parentFormData.email}
                    onChange={handleParentChange}
                    />
                </Grid>
                <Grid container item xs={12}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="relationship-select-label">Relationship Type</InputLabel>
                        <Select
                        labelId="relationship-select-label"
                        name="relationship_type"
                        required
                        value={selectedRelationshipTypeModel.name}
                        onChange={handleRelationshipTypeSelectChange}
                        label="Relationship Type"
                        >
                        {relationshipTypes.map(types => (
                            <MenuItem key={types.types_id} value={types.name}>
                                {types.name}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                </Grid> */}
                <Grid.Col span={12}>
                    <Button 
                        onClick={handleSaveChanges} 
                        color="green" 
                        size="lg"
                        fullWidth
                        style={{height: "50px", marginBottom: "25px"}}
                    >
                        Save Changes
                    </Button>
                </Grid.Col>
                {/* <Grid item xs={6}>
                    <Button 
                        onClick={() => handleDelete(child.child_id)}
                        color="error" 
                        variant="contained" 
                        size="large"
                        startIcon={<DeleteIcon />}
                        fullWidth
                        >
                        Delete {child.first_name + " " + child.last_name}
                    </Button>
                </Grid> */}
            </Grid>
        </Container>
    );
};

export default ParentProfilePage;