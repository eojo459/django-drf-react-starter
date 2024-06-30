import { Grid, Group, Paper, Stack, Text, rem } from "@mantine/core";
import { UserCapacityCount } from "../owner-dashboard/components/UserCapacityCount";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../authentication/AuthContext";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import OwnerDashboard from "../owner-dashboard/owner-dashboard";
import StaffDashboard from "../staff-dashboard/staff-main";
import UserProfile from "../../components/UserProfile";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import { useNavigationContext } from "../../context/NavigationContext";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../../css/Notifications.module.css";
import { VerifyConfirmEmail } from "../../helpers/Api";
import { IconCheck, IconX } from "@tabler/icons-react";


export default function Dashboard() {
    const { setHomebasePanelActive } = useNavigationContext();
    const { user, session, fetchAuthData } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [emailToken, setEmailToken ] = useState('');
    const [redirectUrl, setRedirectUrl ] = useState('');

    // run on component load
    useEffect(() => {
        // get the URL parameters
        var queryString = window.location.search;
        var urlParams = new URLSearchParams(queryString);

        // email token
        var token = urlParams.get('token'); 
        if (token) {
            setEmailToken(token);
        }   

        // redirect after token verification
        var redirectUrl = urlParams.get('redirect'); 
        if (redirectUrl) {
            setRedirectUrl(redirectUrl);
        }  
    },[]);

    // run when email token changes
    useEffect(() => {
        if (emailToken === '') return;
        verifyEmailToken();
    }, [emailToken]);

    // handle when email token is verified
    async function verifyEmailToken() {
        if (!user) return;
        if (emailToken === '') return;

        // show notification
        const id = notifications.show({
            loading: true,
            title: 'Verifying your email',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });
    
        // send token to server
        var data = {
            'token': emailToken,
        }
        var response = await VerifyConfirmEmail(user?.uid, data, session?.access_token);
        if (response === 200) {
            // show success
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'Your email has been successfully verified.',
                    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1000,
                    classNames: notiicationClasses,
                });
            }, 500);
            fetchAuthData();
            if (redirectUrl !== '') {
                navigate(redirectUrl);
                return;
            }
        }
        else {
            // show error
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error. Please try again.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 1500,
                    classNames: notiicationClasses,
                });
            }, 5000);
        }
        navigate('/dashboard');
    }
    
 
	let role;
	if ((user == null && session == null) || (user == undefined && session == undefined)) {
        // Authentication is still loading
		console.log("NOTHING -- NULL");
        return <Navigate to="/" />;
    }
	else {
		role = session?.user.user_metadata.role;
	}
    
    switch (role) {
        case "ADMIN":
            return (<>Admin Dashboard</>);
        case "OWNER":
            return (<UserProfile isMyProfile={true}/>);
        case "STAFF":
            return (<UserProfile isMyProfile={true}/>);
        case "PARENT":
            return (<>Parent dashboard</>); // TODO: create parent dashboard
        default:
            navigate("/");
            break;
    }
}
