import { Container, Stack, Text, rem } from "@mantine/core";
import PlansPricing from "../../components/PlansPricing";
import { PricingDetailedTable } from "../../components/PricingDetailedTable";
import { useState } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import ChargebeeCheckoutModal from "../../components/ChargebeeCheckoutModal";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import VerifyConfirmEmailModal from "../../components/VerifyConfirmEmailModal";
import { notifications } from "@mantine/notifications";
import { useSupabase } from "../../authentication/SupabaseContext";
import notiicationClasses from "../../css/Notifications.module.css";
import { EmailVerifyToken } from "../../helpers/Api";
import { IconCheck, IconX } from "@tabler/icons-react";

export function PricingDetailed() {
    const { user, session } = useAuth();
    const { generateRecoveryEmail } = useSupabase();
    const [hostedUrl, setHostedUrl] = useState('');
    const [chargebeeCheckoutModalOpened, { open: openChargbeeCheckoutModal, close: closeChargebeeCheckoutModal }] = useDisclosure(false);
    const [confirmEmailModalOpened, { open: openConfirmEmailModal, close: closeConfirmEmailModal }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 50em)');

    function handleHostedUrlChange(hostedUrl: string) {
        if (!user?.confirm_email) {
            openConfirmEmailModal();
        }
        else {
            setHostedUrl(hostedUrl);
            openChargbeeCheckoutModal();
        }
    }

    function handleSendEmail(redirect: string) {
        handleVerifyEmail(redirect);
    }

    // handle when user requests to send email confirmation verify link
    async function handleVerifyEmail(redirect: string) {
        if (!user) return;
        if (user?.confirm_email) return;

        // show notification
        const id = notifications.show({
            loading: true,
            title: 'Connecting to the server',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });
        
        var supabase_token: any = await generateRecoveryEmail(user?.email);

        var data = {
            'hashed_token': supabase_token?.properties?.hashed_token,
            'user_uid': user?.uid,
            'redirect': redirect,
        }

        var response = await EmailVerifyToken(data, session?.access_token);
        if (response === 200) {
            // show success
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'teal',
                    title: 'Success',
                    message: 'Check your email inbox for a confirmation email.',
                    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 3000,
                    classNames: notiicationClasses,
                });
            }, 500);
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
    }

    return (
        <>
            {confirmEmailModalOpened && !user?.confirm_email && (
                <VerifyConfirmEmailModal
                    modalOpened={confirmEmailModalOpened}
                    isMobile={isMobile !== undefined ? isMobile : false} 
                    closeModal={closeConfirmEmailModal}
                    handleSendEmail={handleSendEmail}
                />
            )}
            {chargebeeCheckoutModalOpened && hostedUrl !== "" && user?.confirm_email && (
                <ChargebeeCheckoutModal
                    modalOpened={chargebeeCheckoutModalOpened}
                    isMobile={isMobile !== undefined ? isMobile : false} 
                    closeModal={closeChargebeeCheckoutModal}
                    hostedUrl={hostedUrl}
                />
            )}
            <Container size="xl" mt="xl">
                <Stack>
                    <Text 
                        fw={600} 
                        size="40px" 
                        ta="center"
                        mb="50px"
                        c="#dcdcdc"
                    >
                        Pricing
                    </Text>
                    <PlansPricing handleHostedUrlChange={handleHostedUrlChange}/>

                    <Text 
                        fw={600} 
                        size="40px" 
                        ta="center"
                        mb="50px"
                        c="#dcdcdc"
                        mt="xl"
                    >
                        Pricing Information
                    </Text>
                    <PricingDetailedTable/>
                </Stack>
            </Container>
        </>
    );
}