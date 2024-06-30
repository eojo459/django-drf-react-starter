import { Container, Stack, Title, Text, Box, Group, Switch, Grid, Button, rem, useMantineTheme, Select } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import classes from "../../../../css/TextInput.module.css";
import { reportingFrequencyData } from "../../../../helpers/SelectData";
import { useAuth } from "../../../../authentication/SupabaseAuthContext";
import { GetQrcodeInviteLink, PostQrcodeInviteLink } from "../../../../helpers/Api";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../../../../css/Notifications.module.css";
import { supabase } from "../../../../authentication/SupabaseContext";
import { GenerateUUID } from "../../../../helpers/Helpers";
import { supabaseUrl } from "../Business-Management";
import { useMediaQuery } from "@mantine/hooks";

interface CentreInviteCode {
    qrCodeData: any[] | null;
    showCreateQRCodeButton: boolean;
    handleCreateQRCode: () => void;
    handleDownloadQRCode: (fileUrl: string, fileName: string) => void;
}

interface QRCode {
    id: string;
    business_id: string;
    uses: number;
    enabled: boolean;
    expires: string | null;
    qr_code_url: string;
}

export default function CentreInviteCode(props: CentreInviteCode) {
    const { user, business, session } = useAuth();
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [qrCodeData, setQRCodeData] = useState<any[] | null>(null);
    const [showCreateButton, setShowCreateButton] = useState(false);
    const [strictModeLocation, setStrictModeLocation] = useState(false);
    const [reviewChanges, setReviewChanges] = useState(false);
    const theme = useMantineTheme();

    // setup props
    const handleCreateQRCodeProp = props.handleCreateQRCode;
    const handleDownloadQRCodeProp = props.handleDownloadQRCode;
    const qrCodeDataProp = props.qrCodeData;
    const showCreateQRCodeButtonProp = props.showCreateQRCodeButton;

    function handleQrCodeData() {
        setQRCodeData(qrCodeDataProp);
        // if (qrCodeDataProp != null) {
        //     setQRCodeData(qrCodeDataProp);
        // }
    }

    // set data on component mount
    useEffect(() => {
        handleQrCodeData();
    }, []); 

    // set data when qrCodeData changes
    useEffect(() => {
        handleQrCodeData();
    }, [qrCodeDataProp]); 

    return (
        <>
            {/* display qr codes from supbase bucket */}
            {qrCodeData?.map((qrCode) => (
                <div key={GenerateUUID()}>
                    <img 
                        style={{ width: isMobile ? "100%" : "200px", height: isMobile ? "100%" : "200px"}} 
                        src={qrCode?.qr_code_url}
                        alt="QR Code" 
                    />
                </div>
            ))}

            {showCreateQRCodeButtonProp && (
                <Button
                    color="#336E1E"
                    size="md"
                    radius="md"
                    w={ isMobile ? "100%" : "fit" }
                    onClick={handleCreateQRCodeProp}
                >
                    Create invite code
                </Button>
            )}

            {!showCreateQRCodeButtonProp && qrCodeData && (
                <Button
                    color="#336E1E"
                    size="md"
                    radius="md"
                    w={ isMobile ? "100%" : "200px" }
                    onClick={() => handleDownloadQRCodeProp(qrCodeData[0]?.qr_code_url, qrCodeData[0]?.name)}
                >
                    Download
                </Button>
            )}
        </>
    );
}