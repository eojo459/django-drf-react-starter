import React, {useContext, useEffect} from 'react'
import { AuthContext } from '../../authentication/AuthContext';
import axios from 'axios';
import { API_ROUTES } from '../../apiRoutes';
import { Container } from '@mantine/core';
import RegisterCard from '../../components/RegisterCard';
import { useAuth } from '../../authentication/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

export interface IRegisterPage {
    initialState?: number
}

function RegisterPage(props: IRegisterPage) {
    //let { loginUserWithArguments } : any = useContext(AuthContext);
    const { user } = useAuth();
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [cellNumber, setCellNumber] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const navigate = useNavigate();

    // props
    const initalStateProp = props.initialState;
    
    // run on component load
    useEffect(() => {
        if (user) {
            // if auth user exists, redirect to dashboard page
            navigate('/dashboard');
        }
    }, []);

    return (
        <Container size="xs">
            <RegisterCard initalState={initalStateProp}/>
        </Container>
    )
}

export default RegisterPage