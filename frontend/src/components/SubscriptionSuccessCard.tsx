import { Button, Paper, Stack, TextInput, Title, Text, Container, Loader, Group, Space } from "@mantine/core";
import { useEffect, useState } from "react";
import { supabase } from "../authentication/SupabaseContext";
import { useAuth } from "../authentication/SupabaseAuthContext";
import { useNavigationContext } from "../context/NavigationContext";
import { useLocation, useNavigate } from "react-router-dom";
import { GetChargebeeCheckoutUrl, GetChargebeeSubscriptionVerification } from "../helpers/Api";

export default function SubscriptionSuccessCard() {
    const { user, session, fetchAuthData } = useAuth();
    const [stepCount, setStepCount] = useState(0);
    const location = useLocation();
    const [hostedPageId, setHostedPageId] = useState('');
    const [subscriptionId, setSubscriptionId] = useState('');
    const [subscriptionState, setSubscriptionState] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // get the query parameters from the url
        const searchParams = new URLSearchParams(location.search);
        const params: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        //setHostedPageId(params['id']);
        setSubscriptionId(params['sub_id']);
        //setSubscriptionState(params['state']);
    }, [location.search]);

    useEffect(() => {
        if (subscriptionId !== '') {
            // call api and verify subscription info
            setLoading(true);
            setTimeout(() => {
                verifyChargebeeSubscription();
            }, 15000);
            
            // console.log("Verify subscription info");
            // console.log("hostedId=" + hostedPageId);
            // console.log("subscriptionId=" + subscriptionId);
            // console.log("state=" + subscriptionState);
        }
        else {
            // redirect to homepage or dashboard 
            const timeoutId = setTimeout(() => {
                navigate('/');
            }, 3000);
        
            // Cleanup function to clear timeout if component unmounts before 3 seconds
            return () => clearTimeout(timeoutId);
        }
    }, [subscriptionId]);

    // call our api endpoint to retrieve the subscription info and verify it is valid and succeeded
    async function verifyChargebeeSubscription() {
        var subscriptionStatus = await GetChargebeeSubscriptionVerification(subscriptionId, session?.access_token);
        if (subscriptionStatus['status'] === 'active') {
            //success
            setStepCount(stepCount + 1);
            const timeoutId = setTimeout(() => {
                // fetch updated data and redirect
                fetchAuthData();
                navigate('/');
            }, 5000);

            // Cleanup function to clear timeout if component unmounts before 3 seconds
            return () => clearTimeout(timeoutId);
        } 
        else {
            // TODO: be more specific about the error
            setStepCount(stepCount + 2);
            const timeoutId = setTimeout(() => {
                // fetch updated data and redirect
                fetchAuthData();
                navigate('/pricing');
            }, 3000);

            // Cleanup function to clear timeout if component unmounts before 3 seconds
            return () => clearTimeout(timeoutId);
        }
    }
    
    return (
        <Container size="sm">
            <Paper shadow="md" mt="100px" p="lg" radius="lg" style={{ background: "#0f1714", color: "white" }}>
                <Stack>
                    <Title ta="center" order={1}>Please do not close this page</Title>
                    <Space />

                    {stepCount === 0 && (
                        <>
                            <Title ta="center" order={3}>Please wait while we verify your subscription purchase</Title>
                            <Space />
                            {loading && <Group justify="center"><Loader/></Group>}
                            
                        </>
                    )}

                    {stepCount === 1 && (
                        <>
                            <Title ta="center" order={3}>Please wait while we verify your subscription purchase ✅</Title>
                            <Space />
                            <Title ta="center" order={3}>Thank you for subscribing. You will be redirected shortly. </Title>
                        </>
                    )}

                    {stepCount === 2 && (
                        <>
                            <Title ta="center" order={3}>Please wait while we verify your subscription purchase ❌</Title>
                            <Space />
                            <Title ta="center" order={3}>There was an error verifying your subscription purchase. Please try again. </Title>
                        </>
                    )}
                    
                </Stack>
            </Paper>
        </Container>
    );
}