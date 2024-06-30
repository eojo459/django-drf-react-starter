import { InputBase, styled } from "@mui/material";

export const RedditStyleInput = styled(InputBase)(({ theme }) => ({
    // 'label + &': {
    //     marginTop: theme.spacing(3),
    // },
    "& .MuiInputLabel-root": {
        right: 0,
        textAlign: "right"
    },
    '& .MuiInputBase-input': {
        borderRadius: 4,
        position: 'relative',
        backgroundColor: theme.palette.mode == 'light' ? '#F3F6F9': '#000000',
        //backgroundColor: '#dadde0',
        //border: '1px solid #ced4da',
        border: '1px solid',
        borderColor: theme.palette.mode == 'light' ? '#E0E3E7' : '#2D3843',
        fontSize: 16,
        padding: '25px 26px 10px 12px',
        color: 'black',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        // Use the system font instead of the default Roboto font.
        // fontFamily: [
        //     '-apple-system',
        //     'BlinkMacSystemFont',
        //     '"Segoe UI"',
        //     'Roboto',
        //     '"Helvetica Neue"',
        //     'Arial',
        //     'sans-serif',
        //     '"Apple Color Emoji"',
        //     '"Segoe UI Emoji"',
        //     '"Segoe UI Symbol"',
        // ].join(','),
        '&:focus': {
            borderRadius: 4,
            borderColor: '#80bdff',
            boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
        },
    },
}));