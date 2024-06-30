import { AuthSession, createClient } from '@supabase/supabase-js'
import LogoutCard from '../components/LogoutCard';
import { Navigate, NavigateFunction, useNavigate } from 'react-router-dom';
import { CheckUsers, GetAuthUserEmailByUsername, GetBusinessInfoForUserByUid, GetOwnerPayment, GetOwnerSubscription, GetOwnerWorkingHours, GetStaffRelationshipByBusinessId, GetStaffWorkingHours, PostChild, PostOwner, PostParent, PostStaff, PostUser, getBusinessProfilePlanById, getStaffLimitStatus, getUserById } from '../helpers/Api';
import { useAuth } from './SupabaseAuthContext';
import { useNavigationContext } from '../context/NavigationContext';
import { StaffWorkingHours, UserProfileModel, UserProfleBusinessInfo } from '../components/UserProfile';
import { createContext, useContext, useState } from 'react';
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../css/Notifications.module.css";
import { IconX } from '@tabler/icons-react';
import { rem } from '@mantine/core';
import { isObjectEmpty } from '../helpers/Helpers';
//import bcrypt from "bcrypt";

interface EmailData {
    email: string;
}

// Create a single supabase client for interacting with your database
let supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseKey) supabaseKey = '';
export const supabase = createClient('https://cmkoomcgbmueihzpvtck.supabase.co', supabaseKey)
const supabase_admin = createClient('https://cmkoomcgbmueihzpvtck.supabase.co', supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
});
  

// create a context for authentication
const SupabaseContext = createContext<{  
    isNewUser: boolean,
    onboarding: boolean,
    isManager: boolean,
    isActive: boolean,
    setIsNewUser: (value: boolean) => void,
    setOnboarding: (value: boolean) => void,
    setIsManager: (value: boolean) => void,
    setIsActive: (value: boolean) => void,
    signInUser: (form: any, navigate: NavigateFunction) => Promise<any>,
    signUpNewUser: (form: any, userType: string, navigate: NavigateFunction) => Promise<boolean>,
    signOutUser: (navigate: NavigateFunction) => void,
    generateRecoveryEmail: (email: string) => void,
}>({ isNewUser: false, onboarding: false, isManager: false, isActive: false, 
    setIsNewUser: () => false, signInUser: async () => false, signUpNewUser: async () => false, 
    signOutUser: () => { }, setIsActive: () => { }, setIsManager: () => { }, setOnboarding: () => {},
    generateRecoveryEmail: () => {}});


// TODO: FINISH PIN AUTH
export async function comparePin(pin: string, form: any) {
    //var bcrypt = require('bcrypt');
    const hashedPinCode = pin;
    const username = form.username;
    const userPincode = form.pin_code;
    return hashedPinCode == userPincode;

    //const isPinCodeValid = await bcrypt.compare(pin + username, hashedPinCode);
    // let isPinCodeValid = true;
    // return isPinCodeValid;
}

// TODO: FINISH PIN AUTH
export async function hashPin(pin: string, username: string) {
    //var bcrypt = require('bcrypt');
    //var salt = bcrypt.genSaltSync(10);
    //var hash = bcrypt.hashSync("B4c0/\/", salt);
    //return hash.toString();
    return "";
}


export const SupabaseContextProvider = ({ children }: any) => {
    const { user, setUser, session } = useAuth();
    const [isNewUser, setIsNewUser] = useState(false);
    const [onboarding, setOnboarding] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [isActive, setIsActive] = useState(false);

    // SIGN UP NEW USER
    // signs up a new user on django and supabase
    async function signUpNewUser(form: any, userType: string, navigate: NavigateFunction) {
        // check if there is any more space for staffs to sign up
        if (userType === "STAFF" || userType === "STAFF_INVITE") {
            var data = {
                'request_type': 'no-auth',
            }
            var staffLimitStatus = await getStaffLimitStatus(form.business_id, data);
            
            if (!staffLimitStatus?.registration_open) {
                // business is full and current plan cannot hold any more staff, must upgrade plan
                setTimeout(() => {
                    notifications.show({
                        color: 'red',
                        title: 'Error',
                        message: 'The business centre is full and cannot allow new members. Please contact the business owner.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 5000,
                        classNames: notiicationClasses,
                    });
                }, 2000);
                return false;
            }  
        }

        var data = { 'request_type': 'no-auth'}
        
        // check if username already exists
        var usernameData = { 'username': form.username }
        var usernameExists = await CheckUsers(usernameData, data);
        if (usernameExists) {
            // show error
            setTimeout(() => {
                notifications.show({
                    color: 'red',
                    title: 'Error',
                    message: 'The username already exists',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 5000,
                    classNames: notiicationClasses,
                });
            }, 2000);
            return false;
        }

        // check if email already exists
        var emailData = { 'email': form.email }
        var emailExists = await CheckUsers(emailData, data);
        if (emailExists) {
            // show error
            setTimeout(() => {
                notifications.show({
                    color: 'red',
                    title: 'Error',
                    message: 'The email already exists',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 5000,
                    classNames: notiicationClasses,
                });
            }, 2000);
            return false;
        }

        // check if cell number already exists
        var cellNumberData = { 'cell_number': form.cell_number }
        var cellNumberExists = await CheckUsers(cellNumberData, data);
        if (cellNumberExists) {
            // show error
            setTimeout(() => {
                notifications.show({
                    color: 'red',
                    title: 'Error',
                    message: 'The cell phone number already exists.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 5000,
                    classNames: notiicationClasses,
                });
            }, 2000);
            return false;
        }

        // create new auth user in supabase
        const {data: authData, error: authError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: {
                    username: form.username,
                    cell_number: form.cell_number,
                    role: userType === "STAFF_INVITE" ? "STAFF" : userType,
                    pin_code: form.pin_code,
                    email: form.email,
                }
            }
        });

        if (authData.user != null) {
            // get data from supabase table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select()
                .eq('id', authData.user.id)
                .limit(1)
                .single();

            if (userData != null) {
                // send data to django database
                if (userType === 'STAFF') {
                    // create staff from registration form 
                    var staffUser = {
                        'uid': userData.id,
                        'username': form.username,
                        'first_name': form.first_name,
                        'last_name': form.last_name,
                        'email': form.email,
                        'cell_number': form.cell_number,
                        'home_number': form.home_number,
                        'work_number': form.work_number,
                        'street': form.street,
                        'street_2': form.street_2,
                        'city': form.city,
                        'province': form.province,
                        'country': form.country,
                        'postal_code': form.postal_code,
                        'gender': form.gender,
                        'role': userType,
                        'pin_code': form.pin_code,
                        'password': userData.encrypted_password,
                        'created_at': userData.created_at,
                        'position': form.position,
                        'request_type': 'Register',
                    }
                    await PostUser(staffUser, authData?.session?.access_token);
                }
                else if (userType === "STAFF_INVITE") {
                    // create staff from self registration via invite code
                    var staffInviteUser = {
                        'uid': userData.id,
                        'business_id': form.business_id,
                        'username': form.username,
                        'first_name': form.first_name,
                        'last_name': form.last_name,
                        'email': form.email,
                        'cell_number': form.cell_number,
                        'role': userType,
                        'pin_code': form.pin_code,
                        'password': userData.encrypted_password,
                        'created_at': userData.created_at,
                        'request_type': 'Register',
                        'owner_uid': form.owner_uid,
                        'invite_code': form.invite_code,
                    }
                    await PostUser(staffInviteUser, authData?.session?.access_token);
                }
                else {
                    // create user from registration form
                    var user = {
                        'uid': userData.id,
                        'username': form.username,
                        'first_name': form.first_name,
                        'last_name': form.last_name,
                        'email': form.email,
                        'cell_number': form.cell_number,
                        'home_number': form.home_number,
                        'work_number': form.work_number,
                        'street': form.street,
                        'street_2': form.street_2,
                        'city': form.city,
                        'province': form.province,
                        'country': form.country,
                        'postal_code': form.postal_code,
                        'gender': form.gender,
                        'role': userType,
                        'pin_code': form.pin_code,
                        'password': userData.encrypted_password,
                        'created_at': userData.created_at,
                        'plan_id': '', // TODO: hook up plans with subscription for owners
                        'request_type': 'Register',
                    }
                    await PostUser(user, authData?.session?.access_token);
                }
                // TODO: create user from invite code
                
                // sign in user after signing up
                if (userType === 'OWNER' || userType === "STAFF" || userType === "STAFF_INVITE") {
                    setTimeout(async () => {
                        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                            email: form.email,
                            password: form.password,
                        });

                        if (signInData != null) {
                            navigate('/dashboard');
                            window.location.reload();
                            return true;
                        }
                        else {
                            console.log(signInError);
                            return false;
                        }

                    }, 2000);
                    // const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    //     email: form.email,
                    //     password: form.password,
                    // });
    
                    // if (signInData != null) {
                    //     navigate('/dashboard');
                    //     window.location.reload();
                    //     return true;
                    // }
                    // else {
                    //     console.log(signInError);
                    //     return false;
                    // }
                }
                return true;
            }
        }
        else {
            console.log(authError);
        }
        return false;
    }

    // authenticate with pin code
    async function authenticateWithPinCode(form: any) {
        // Retrieve the hashed pin code from the proper table
        let pinCodeData, pinCodeError;
        try {
            {
                const { data, error } = await supabase
                    .from('users')
                    .select('hashed_pin')
                    .eq('username', form.username);
    
                pinCodeData = data;
                pinCodeError = error;
            }

            // check if pin code matches bcrypt hash pin code
            if (pinCodeData && pinCodeData.length > 0) {
                var compareValue = comparePin(pinCodeData[0].hashed_pin, form);
                console.log(compareValue);
            }
        }
        catch (e) {
            if (pinCodeError) {
                console.error('Error retrieving pin code:', pinCodeError);
                throw pinCodeError;
            }
            console.log(e);
            return false;
        }

        return false; // User not found or pin code not set
    };

    // sign in a user
    // email, username, TODO: pin code, mobile number? OTP?
    async function signInUser(form: any, navigate: NavigateFunction) {
        let data, error;
        switch (form.type) {
            case "email":
                // sign in with email
                ({ data, error } = await supabase.auth.signInWithPassword({
                    email: form.username,
                    password: form.password,
                }));

                if (error != null) {
                    console.log(error);
                    return false;
                }
                break;
            case "username":
                // sign in with username
                // search table for user who owns username
                var authData = {
                    'request_type': 'no-auth',
                }
                var authUserEmail: any = await GetAuthUserEmailByUsername(form.username, authData);
                
                if (authUserEmail != null && authUserEmail !== undefined) {
                    // sign in with email
                    ({ data, error } = await supabase.auth.signInWithPassword({
                        email: authUserEmail.data['email'],
                        password: form.password,
                    }));

                    if (error != null) {
                        console.log(error);
                        return false;
                    }
                }
                else {
                    // else return error
                    console.log(error);
                    return false;
                }
                break;
            case "pin":
                // sign in with pin
                // TODO: hash pin code with  
                // check if hashed pin code matches pincode in database where username=username and pin_code=pin_code
                var validPinCode = await authenticateWithPinCode(form);
                console.log(validPinCode);
                // if match, sign user in/return user data
                // else return error
                break;

            // TODO: mobile auth?
            // TODO: OTP?
        }

        if (data) {
            // user data found
            try {
                const { data: { session: authSession } } = await supabase.auth.getSession();
                if (authSession) {
                    // get business id
                    var businessInfo = await GetBusinessInfoForUserByUid(authSession?.user.id, authSession?.access_token);
                
                    // reference this data for API calls
                    var businessList: any = [];
                    if (businessInfo?.length > 0) {
                        businessInfo.forEach((business: any) => {
                            const businessInfoModel: UserProfleBusinessInfo = {
                                id: business.value,
                                name: business.label,
                                owner_uid: business.owner_uid,
                                lon: business.lon,
                                lat: business.lat,
                                gps_geolocation: business.gps_geolocation,
                                plan: business.plan,
                                working_hours: business.working_hours,
                                auto_clock_out_max_duration: business.auto_clock_out_max_duration,
                                overtime_max_duration: business.overtime_max_duration,
                            }
                            businessList.push(businessInfoModel);
                        });
                    }

                    // get user info
                    var userInfo = await getUserById(authSession?.user?.id, authSession?.access_token); 

                    // get user working hours
                    let workingHours: StaffWorkingHours = {} as StaffWorkingHours;
                    switch(userInfo?.role) {
                        case 'STAFF':
                            workingHours = await GetStaffWorkingHours(userInfo?.id, authSession?.access_token);
                            break;
                        case 'OWNER':
                            workingHours = await GetOwnerWorkingHours(userInfo?.id, authSession?.access_token);
                            break;
                        case 'USER':
                            // TODO: get user working hours
                            break;
                    }

                    if (!userInfo?.active && workingHours) {
                        // if account is not active do not let them login, show error
                        return {'error': 'Disabled'};
                    }

                    if (userInfo?.role === 'OWNER') {
                        // get subscription info
                        var ownerSubscription = await GetOwnerSubscription(userInfo?.id, authSession?.access_token);

                        // get payment info
                        var payment = await GetOwnerPayment(userInfo?.id, authSession?.access_token);
                    }
                    
                    const newUser: UserProfileModel = {
                        business_info: businessList,
                        working_hours: workingHours,
                        subscription: ownerSubscription,
                        payment: payment,
                        uid: authSession?.user?.id || "",
                        email: authSession?.user?.email || "",
                        username: userInfo?.username || "",
                        cell_number: userInfo?.cell_number || "",
                        role: userInfo?.role || "",
                        first_name: userInfo?.first_name,
                        last_name: userInfo?.last_name,
                        street: userInfo?.street,
                        street_2: userInfo?.street_2,
                        city: userInfo?.city,
                        province: userInfo?.province,
                        country: userInfo?.country,
                        postal_code: userInfo?.postal_code,
                        gender: userInfo?.gender,
                        home_number: userInfo?.home_number,
                        work_number: userInfo?.work_number,
                        date_joined: userInfo?.date_joined,
                        active: userInfo?.active,
                        position: userInfo?.position,
                        plan: userInfo?.plan_id,
                        location_limit_reached: userInfo?.location_limit_reached,
                        confirm_email: userInfo?.confirm_email,
                    };

                    setUser(newUser);
                    //console.log(newUser);
                    // if (newUser?.uid !== "") {
                    //     localStorage.setItem("user", JSON.stringify(newUser));
                    // }

                    if (!isObjectEmpty(newUser?.working_hours)) {
                        setIsNewUser(newUser?.working_hours?.is_new_user);
                        setOnboarding(newUser?.working_hours?.onboarding);
                        setIsManager(newUser?.working_hours?.is_manager);
                    }
                    else {
                        setIsNewUser(false);
                        setOnboarding(true);
                        setIsManager(false);
                    }
                }
            } catch (error) {
                console.error(error);
            }

            var role = data.user?.user_metadata.role;
            switch (role) {
                case "OWNER":
                case "STAFF":
                    setTimeout(() => {
                        navigate('/dashboard');
                        window.location.reload();
                    }, 2000);
                    break;
                default:
                    navigate('/logout');
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                    break;
            }
            
            return true;
        }

        return false;
    }

    // sign out
    async function signOutUser(navigate: NavigateFunction) {
        console.log("Signed out");
        localStorage.removeItem("user");
        navigate("/logout");
    }

    // reset password
    async function resetPassword(form: any) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(form.values.email, {
            redirectTo: 'https://example.com/update-password',
        })
    }

    // generate recovery email
    async function generateRecoveryEmail(email: string) {
        const { data, error } = await supabase_admin.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
        });
        return data;
    }

    const contextValue = {
        isNewUser: isNewUser,
        onboarding: onboarding,
        isManager: isManager,
        isActive: isActive,
        setIsNewUser,
        setIsActive,
        setIsManager,
        setOnboarding,
        signUpNewUser,
        signInUser,
        signOutUser,
        generateRecoveryEmail,
    };

    return (
        <SupabaseContext.Provider value={contextValue}>
            {children}
        </SupabaseContext.Provider>
    );

    //return { signUpNewUser, authenticateWithPinCode, signInUser, signOutUser, resetPassword };
}

// export the useSupabase hook
export const useSupabase = () => {
    return useContext(SupabaseContext);
};