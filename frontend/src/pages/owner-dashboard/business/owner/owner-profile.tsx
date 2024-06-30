import React, { ChangeEvent, useState } from 'react';
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
import { useForm } from '@mantine/form';
import { Text, Button, Paper, Grid, TextInput, Textarea, Select, Avatar, Container } from '@mantine/core';

export type OwnerProfile = {
    owner_id: string;
    first_name: string;
    last_name: string;
    street: string;
    city: string;
    province: string;
    country: string;
    postal_code: string;
    gender: string;
    role: string;
    cell_number: string;
    work_number: string;
    home_number: string;
    email: string;
    notes: string;
    location_limit_reached: boolean;
    profile_plan_id: string;
};

interface OwnerProfilePageProps {
  owner: OwnerProfile;
}

const OwnerProfilePage: React.FC<OwnerProfilePageProps> = ({ owner }) => {

    const navigate = useNavigate();

    // Owner form TODO: REPLACE WITH MANTINE
    const [ownerFormData, setOwnerFormData] = useState({
        first_name: owner.first_name,
        last_name: owner.last_name,
        //address: owner.address,
        gender: owner.gender,
        role: owner.role,
        cell_number: owner.cell_number,
        work_number: owner.work_number,
        home_number: owner.home_number,
        email: owner.email,
        //other: owner.other
    });

    // Modal
    const [openModal, setOpenModal] = useState(false);
      
    // Handlers
    const handleOwnerChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setOwnerFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOwnerGenderSelectChange = (value: string | null) => {
        if (value != null) {
            setOwnerFormData(prev => ({ ...prev, gender: value }));
        }
    };

    const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setOwnerFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDeleteClick = () => {
        setOpenModal(true);
    };
    
    const handleDeleteConfirm = () => {
        // Perform the actual delete operation
        handleDelete();
        
        // Close the modal
        setOpenModal(false);
    };

    const handleModalClose = () => {
        setOpenModal(false);
    };

    const handleSaveChanges = async () => {
        try {
          // Prepare the updated data
          const updatedOwnerData = ownerFormData;
      
          // Send PUT request to update owner data
          const OWNER_ID = API_ROUTES.OWNERS_UID(owner.owner_id);
          const ownerUpdateResponse = await axios.put(OWNER_ID, updatedOwnerData);
          if (ownerUpdateResponse.status === 200) {
            console.log("Owner data updated successfully!");
            // Optionally, you can navigate back to the list page or show a success message
            setSaveMessage('1');
            handleOpenSnackbar();
          } else {
            console.error("Failed to update owner data");
          }
        } catch (error) {
          console.error("Error updating owner data:", error);
        }
    };

    // Handler for delete
    const handleDelete = async () => {
        try {
            const OWNER_ID = API_ROUTES.OWNERS_UID(owner.owner_id);
            const response = await axios.delete(OWNER_ID);
            if (response.status === 200) {
                setSaveMessage('2');
                handleOpenSnackbar();
                navigate('/owner/list');
            }
        } catch (error) {
            console.error('Error deleting data:', error);
        }
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
                        style={{fontSize: '40px', height:"100px", width:"100px"}}
                        size="xl"
                    >
                        {owner.first_name.charAt(0).toUpperCase() + " " + owner.last_name.charAt(0).toUpperCase()}
                    </Avatar>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Text  
                        style={{textTransform: 'capitalize', textAlign: 'center', fontSize:"25px"}}
                    >
                        {owner.first_name + " " + owner.last_name}'s Profile
                    </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput 
                        id="first-name" 
                        label="First name" 
                        name="first_name"
                        placeholder="First name"
                        value={ownerFormData.first_name}
                        onChange={handleOwnerChange} 
                        size="lg"
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput 
                        id="last-nme" 
                        label="Last name" 
                        name="last_name"
                        placeholder="Last name"
                        value={ownerFormData.last_name}
                        onChange={handleOwnerChange}
                        size="lg"
                    />
                </Grid.Col>
                {/* <Grid.Col span={12}>
                    <TextInput 
                        id="address" 
                        label="Address"
                        name="address"
                        placeholder="Address"
                        value={ownerFormData.address}
                        onChange={handleOwnerChange}
                        size="lg"
                    />
                </Grid.Col> */}
                <Grid.Col span={6}>
                    <Select
                        id="owner-gender-select"
                        value={ownerFormData.gender}
                        name="gender"
                        label="Gender"
                        placeholder="Please select one"
                        onChange={handleOwnerGenderSelectChange}
                        size="lg"
                        data={['Male','Female','Other']}
                    >
                    </Select>
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput
                        required
                        id="role"
                        label="Role"
                        name="role"
                        placeholder="Role"
                        value={ownerFormData.role}
                        onChange={handleOwnerChange}
                        size="lg"
                    />
                </Grid.Col>
                <Grid.Col span={4}>
                    <TextInput 
                        id="cell-number" 
                        label="Cell Number" 
                        name="cell_number"
                        placeholder="Cell number"
                        value={ownerFormData.cell_number}
                        onChange={handleOwnerChange}
                        size="lg"
                    />
                </Grid.Col>
                <Grid.Col span={4}>
                    <TextInput 
                        id="work-number" 
                        label="Work number" 
                        name="work_number"
                        placeholder="Work number"
                        value={ownerFormData.work_number}
                        onChange={handleOwnerChange}
                        size="lg"
                    />
                </Grid.Col>
                <Grid.Col span={4}>
                    <TextInput 
                        id="home-number" 
                        label="Home number" 
                        name="home_number"
                        placeholder="Home number"
                        value={ownerFormData.home_number}
                        onChange={handleOwnerChange}
                        size="lg"
                    />
                </Grid.Col>
                <Grid.Col span={12}>
                    <TextInput 
                        id="email" 
                        label="Email" 
                        name="email"
                        placeholder="Email"
                        value={ownerFormData.email} 
                        onChange={handleOwnerChange}
                        size="lg"
                    />
                </Grid.Col>
                {/* <Grid.Col span={12}>
                    <Textarea 
                        autosize
                        id="other" 
                        label="Other" 
                        name="other"
                        placeholder="Other information"
                        value={ownerFormData.other} 
                        onChange={handleTextAreaChange}
                        size="lg"
                        minRows={4}
                    />
                </Grid.Col> */}
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
            </Grid>
        </Container>
    );
};

export default OwnerProfilePage;