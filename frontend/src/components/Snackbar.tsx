import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { useEffect } from 'react';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface SnackbarMessage {
    id: number;
    message: string;
}

let messages: SnackbarMessage[] = [
    {
      id: 0,
      message: "Owner was created!"
    },
    {
      id: 1,
      message: "Business was created!"
    },
    {
      id: 2,
      message: "Staff was created!"
    },
    {
      id: 3,
      message: "User was created!"
    },
    {
      id: 4,
      message: "User was updated!"
    },
    {
      id: 5,
      message: "User was deleted!"
    }
]

export default function SuccessSnackbar({ triggerOpen = false, message = 0 }) {
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (triggerOpen) {
      setOpen(true);
    }
  }, [triggerOpen]);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  // Get the correct message based on the given id (message prop)
  const displayMessage = messages.find(msg => msg.id === message)?.message || "Error";

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {/* <Button variant="outlined" onClick={handleClick}>
        Open success snackbar
      </Button> */}
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            {displayMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}