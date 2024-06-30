import { Session, User } from '@supabase/supabase-js';
import { useContext, useState, useEffect, createContext } from 'react';
import { supabase, useSupabase } from './SupabaseContext';
import { useNavigate } from 'react-router-dom';
import { GetAuthUserEmailByUid, GetBusinessInfoForUserByUid, GetOwnerPayment, GetOwnerSubscription, GetOwnerWorkingHours, GetStaffWorkingHours, getUserById } from '../helpers/Api';
import { StaffWorkingHours, Subscription, UserProfileModel, UserProfleBusinessInfo } from '../components/UserProfile';
import { Group, Loader } from '@mantine/core';
import React from 'react';
import { useNavigationContext } from '../context/NavigationContext';
import { BusinessProfile } from '../pages/owner-dashboard/business/components/CentreInformation';
import { isObjectEmpty } from '../helpers/Helpers';

// create a context for authentication
const SupabaseAuthContext = createContext<{ 
    session: Session | null | undefined, 
    user: UserProfileModel | null | undefined, 
    business: UserProfleBusinessInfo | null | undefined,
    businessList: UserProfleBusinessInfo[],
    signOut: () => void,
    setUser: (user: UserProfileModel | null) => void,
    setBusiness: (business: UserProfleBusinessInfo | null) => void,
    fetchAuthData: () => void,
}>({ session: null, user: null, business: null, businessList: [], signOut: () => { }, setUser: () => { }, setBusiness: () => { }, fetchAuthData: () => { }});

interface BaseUser {
    business_id: string;
    id: string;
    email: string;
    username: string;
    cell_number: string;
    role: string; // (ADMIN || OWNER || STAFF || PARENT || USER)
}

export const SupabaseAuthProvider = ({ children }: any) => {
    const [user, setUser] = useState<UserProfileModel | null>(null);
    const [business, setBusiness] = useState<UserProfleBusinessInfo | null>(null);
    const [businessList, setBusinessList] = useState<UserProfleBusinessInfo[]>([]);
    const {signInUser, setIsNewUser, setIsManager, setOnboarding} = useSupabase();
    const [session, setSession] = useState<Session | null>(null);
    //const { loading, setLoading } = useNavigationContext();
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        //let isMounted = true;

        // get session
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                setSession(session);
            }
        });

        // fetch auth data
        fetchAuthData();

        return () => {
            //isMounted = false;
            setIsMounted(false);
            listener?.subscription.unsubscribe();
        };
    }, []);

    // useEffect(() => {
    //     // fetch auth data
    //     fetchAuthData();
    // },[session]);

    // fetch auth data whenever context changes / navigation changes
    async function fetchAuthData() {
        try {
            const { data: { session: authSession } } = await supabase.auth.getSession();
            if (authSession) {
                setSession(authSession);
                
                // get business id
                var businessList: any[] = [];
                console.log("Auth success, access token is=" + authSession?.access_token);
                var businessInfo = await GetBusinessInfoForUserByUid(authSession.user.id, authSession?.access_token);

                // reference this data for API calls
                // get some basic information about business
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

                // check if we have an active business in local storage first
                var activeBusiness: any = localStorage.getItem('activeBusiness');
                if (activeBusiness != null && activeBusiness !== 'undefined') {
                    var activeBusinessJson = JSON.parse(activeBusiness);

                    // find active business from list
                    var index = businessList.findIndex(a => a.id === activeBusinessJson.id);
                    if (index < 0) {
                        setBusiness(businessList[0]);
                    }
                    else {
                        // update the active business data
                        setBusiness(businessList[index]);
                    }
                }
                else {
                    localStorage.setItem("activeBusiness", JSON.stringify(businessList[0]));
                    setBusiness(businessList[0]);
                }
                
                setBusinessList(businessList);

                // get user info
                var userInfo = await getUserById(authSession.user?.id, authSession.access_token); 

                // get user working hours
                let workingHours: StaffWorkingHours = {} as StaffWorkingHours;
                switch(userInfo?.role) {
                    case 'STAFF':
                        workingHours = await GetStaffWorkingHours(userInfo?.uid, authSession?.access_token);
                        break;
                    case 'OWNER':
                        workingHours = await GetOwnerWorkingHours(userInfo?.uid, authSession?.access_token);
                        break;
                    case 'USER':
                        // TODO: get user working hours
                        break;
                }

                if (!userInfo?.active && isObjectEmpty(workingHours)) {
                    if (!workingHours.is_new_user) {
                        // if account is not active auto logout
                        navigate('/logout');
                        return;
                    }
                }

                if (userInfo?.role === 'OWNER') {
                    // get subscription info
                    var ownerSubscription = await GetOwnerSubscription(userInfo?.uid, authSession?.access_token);

                    // get payment info
                    var payment = await GetOwnerPayment(userInfo?.uid, authSession?.access_token);
                }
                
                // setup user info to be saved/cached
                const newUser: UserProfileModel = {
                    business_info: businessList,
                    working_hours: workingHours,
                    subscription: ownerSubscription,
                    payment: payment,
                    uid: authSession.user?.id || "",
                    email: authSession.user?.email || "",
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
                // if (newUser.uid !== "") {
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
                
                //navigate(newUser.role === "OWNER" ? "/dashboard" : "/login");
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    const value = {
        session: session,
        user: user,
        business: business,
        businessList: businessList,
        setUser,
        setBusiness,
        signOut: () => supabase.auth.signOut(),
        fetchAuthData,
    };

    return (
        <SupabaseAuthContext.Provider value={value}>
            {loading ? <Group justify="center">
                            <Loader mt="25%" color="cyan" />
                        </Group> 
                    : children}
        </SupabaseAuthContext.Provider>
    );
};

// export the useAuth hook
export const useAuth = () => {
    return useContext(SupabaseAuthContext);
};