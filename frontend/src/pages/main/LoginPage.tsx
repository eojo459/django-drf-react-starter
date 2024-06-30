import React, {useContext, useEffect, useRef} from 'react'
import { AuthContext } from '../../authentication/AuthContext';
import { Container, Stack } from '@mantine/core';
import LoginCard from '../../components/LoginCard';
import { useForm } from '@mantine/form';



const LoginPage = () => {
    //let { loginUser } : any = useContext(AuthContext)
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const formRef = useRef<HTMLFormElement | null>(null);
    //const submitButtonRef = useRef<HTMLFormElement | null>(null);
    const submitButtonRef = useRef<HTMLInputElement | null>(null);


    function handleFormChanges(form: any) {
        setUsername(form.values.username);
        setPassword(form.values.password);
        console.log(form);
    }

    function handleLogin(value: boolean) {
        if (value) {
            // try to login
            if (formRef.current != null) {
                const usernameInput = formRef.current.querySelector('[name="username"]') as HTMLInputElement;
                const passwordInput = formRef.current.querySelector('[name="password"]') as HTMLInputElement;
                usernameInput.value = username;
                passwordInput.value = password;
                //(formRef.current as HTMLFormElement).submit();
            }

            if (submitButtonRef.current != null) {
                submitButtonRef.current.click();
            }
        }
        
    }

    return (
        <Container size="xs">
            <form ref={formRef}>
            {/* <form ref={formRef} onSubmit={loginUser}> */}
            {/* <form ref={formRef} onSubmit={(e) => e.preventDefault()}> */}
                <input type="hidden" name="username" value={username} placeholder="Enter Username" />
                <input type="hidden" name="password" value={password} placeholder="Enter Password" />
                <input type="submit" style={{ display:"none"}} ref={submitButtonRef}/>
            </form>
            <LoginCard handleFormChanges={handleFormChanges} handleLogin={handleLogin}/>
        </Container>
    )
}

export default LoginPage
