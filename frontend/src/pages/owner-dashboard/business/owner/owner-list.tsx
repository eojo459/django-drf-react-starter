import React, { useState, useEffect, ChangeEvent, useContext } from 'react';
import { DataGrid, GridCellParams, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import { API_ROUTES } from '../../../../apiRoutes';
import { TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import SuccessSnackbar from '../../../../components/Snackbar';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import OwnerProfilePage from './owner-profile';
import DeleteConfirmationModal from '../../../../components/DeleteModal';
import { Text, Button, Paper, Grid, TextInput, Textarea, Select, Avatar, Container, Table, ActionIcon } from '@mantine/core';
import { IconTrash, IconUser, IconUserCircle, IconUserSquareRounded } from '@tabler/icons-react';
import { OwnerProfile } from './owner-profile';
import { getOwners } from '../../../../helpers/Api';
import { AuthContext } from '../../../../authentication/AuthContext';

export default function OwnerDataGridDisplay() {
    const [ownerData, setOwnerData] = useState<OwnerProfile[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [openProfilePage, setOpenProfilePage] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState<OwnerProfile | null>(null);
    let { authTokens } : any = useContext(AuthContext);

    useEffect(() => {
        // Get data from api on component load
        getOwner();
    }, []);

    // TODO FIX DATA NOT SHOWING, MIGHT BE BECAUSE OWNERPROFILE IS NOT MATCING DATABASE MODEL
    useEffect(() => {
        console.log(ownerData);
    }, [ownerData]);

    // State to control type of message to be used (saved vs deleted)
    const [saveMessage, setSaveMessage] = React.useState('');

    // Modal
    const [openModal, setOpenModal] = useState(false);

    // Fetch the owner data from the API
    async function getOwner() {
        try {
            if (authTokens == null || authTokens == undefined) {
                authTokens = JSON.parse(localStorage.getItem("authTokens")!);
            }
            const response = await getOwners(authTokens)
            if (response != undefined && response != null) {
                setOwnerData(response.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const handleProfileSetup = (owner: OwnerProfile, isDelete: boolean) => {
        console.log(owner);
        setSelectedOwner(owner);
        if (isDelete) {
            handleDeleteClick();
            setOpenProfilePage(false);
        }
        else {
            // setting this && selected child will display the profile page
            //setSelectedParent(parentData[0]);
            setOpenProfilePage(true);
        }
    };

    const handleBackToList = () => {
        setSelectedOwner(null);
        getOwner(); // refresh database to show new changes if any
    };

    const handleDeleteClick = () => {
        setOpenModal(true);
    };
    
    const handleDeleteConfirm = () => {
        // Perform the actual delete operation
        if (selectedOwner !== null) {
            handleDelete(selectedOwner.owner_id);
        }
        
        // Close the modal
        setOpenModal(false);
    };

    const handleModalClose = () => {
        setOpenModal(false);
    };

    const handleSaveChanges = () => {
        // pass
    }
    

    // Handler for delete
    const handleDelete = async (id: number | string) => {
        try {
            const response = await axios.delete(`${API_ROUTES.OWNERS_ID}${Number(id)}`);
            if (response.status === 200) {
                getOwner();
                setSaveMessage('2');
                handleOpenSnackbar();
                if (selectedOwner) {
                    setSelectedOwner(null);
                    setOpenProfilePage(false);
                }
            }
        } catch (error) {
            console.error('Error deleting data:', error);
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

    // setup the table rows to be displayed
    const tableRows = ownerData.map((owner) => (
        <Table.Tr key={owner.owner_id}>
            {/* Profile button */}
            <Table.Td>
                <ActionIcon
                    variant="filled"
                    size="xl"
                    radius="lg"
                    onClick={() => handleProfileSetup(owner, false)}
                >
                    <IconUser/>
                </ActionIcon>
            </Table.Td>
            {/* Owner info */}
            <Table.Td>{owner.first_name}</Table.Td>
            <Table.Td>{owner.last_name}</Table.Td>
            <Table.Td>{owner.role}</Table.Td>
            <Table.Td>{owner.cell_number}</Table.Td>
            <Table.Td>{owner.email}</Table.Td>
            {/* Delete button */}
            <Table.Td>
                <ActionIcon
                    variant="filled"
                    size="xl"
                    radius="lg"
                    color="red"
                    onClick={() => handleProfileSetup(owner, true)}
                >
                    <IconTrash/>
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
    ));

    // Display data grid
    return (
        <Paper shadow="sm">
            {/* display success snackbar */}
            {saveMessage == '1' && (
                <SuccessSnackbar triggerOpen={snackbarOpen} message={4} />
            )}
            {/* display success deleted snackbar */}
            {saveMessage == '2' && (
                <SuccessSnackbar triggerOpen={snackbarOpen} message={5} />
            )}
            <Grid>
                <Grid.Col span={12} style={{ display:"flex", justifyContent:"space-around" }}>
                    {/* Back button */}
                    {(selectedOwner && openProfilePage) && (
                        <Button 
                            onClick={handleBackToList} 
                            color="blue" 
                            size="lg"
                            style={{marginTop:"20px"}}
                        >
                            Back
                        </Button>
                    )}
                    {/* Delete button */}
                    {(selectedOwner && openProfilePage) && (
                        <Button 
                            //onClick={() => handleDelete(selectedChild.child_id)}
                            onClick={handleDeleteClick}
                            color="red" 
                            size="lg"
                            style={{marginTop:"20px"}}
                        >
                            Delete
                        {/* Delete {selectedChild.first_name + " " + selectedChild.last_name} */}
                        </Button>
                    )}
                </Grid.Col>
                <Grid.Col span={12}>
                    {/* Display owner profile */}
                    {(selectedOwner && openProfilePage) ? (
                        <OwnerProfilePage owner={selectedOwner} />
                    ) : (
                            // Display staff list as table
                            <Table 
                                verticalSpacing="lg"
                                horizontalSpacing="lg" 
                                striped
                                highlightOnHover
                                style={{ fontSize:"20px" }}
                            >
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th></Table.Th>
                                        <Table.Th>First name</Table.Th>
                                        <Table.Th>Last name</Table.Th>
                                        <Table.Th>Role</Table.Th>
                                        <Table.Th>Cell number</Table.Th>
                                        <Table.Th>Email</Table.Th>
                                        <Table.Th></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{tableRows}</Table.Tbody>
                            </Table>
                    )}
                </Grid.Col>
            </Grid>
            <DeleteConfirmationModal
                open={openModal}
                onClose={handleModalClose}
                onDelete={handleDeleteConfirm}
            />
        </Paper>
    );
}
