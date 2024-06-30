// DeleteConfirmationModal.js
import React from 'react';
import {Button} from '@mui/material';
import DeleteIcon from '@material-ui/icons/Delete';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';

interface DeleteConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ open, onClose, onDelete }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <div style={{ 
        position: 'absolute',
        width: 400,
        backgroundColor: 'white',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: 20,
        textAlign: 'center'
      }}>
        <Typography variant="h6" gutterBottom>
          Confirm Deletion
        </Typography>
        <Typography paragraph>
          Are you sure you want to delete this person?
        </Typography>
        <Button 
          onClick={onDelete}
          color="error"
          variant="contained" 
          size="large"
          startIcon={<DeleteIcon />}
          style={{marginTop: "20px"}}
        >
          Delete
        </Button>
        <Button 
          onClick={onClose}
          color="inherit" 
          variant="contained" 
          size="large"
          style={{marginTop: "20px", marginLeft: "10px"}}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
