import { Avatar, Badge, Button, Grid, Group, Stack, Title, Text, ActionIcon, Menu, rem, Space } from "@mantine/core";
import { IconDots, IconLogout, IconMapPin, IconSettings, IconTrash, IconUser } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAuth } from "../authentication/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";
import { UserProfileModel } from "./UserProfile";
import row from "antd/es/row";

interface ProfileHeader {
    user: UserProfileModel;
}

export function ProfileHeader(props: ProfileHeader) {
    const { user, session } = useAuth();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const navigate = useNavigate();

    // props
    const userProp = props.user;

    useEffect(() => {

        // Update windowWidth when the window is resized
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    return (
        <>
            <Grid c="#dcdcdc">
                <Grid.Col 
                    span={{ base: 12 }} 
                    style={{ 
                        background: "#161c1a", 
                        width: "100%", 
                        height: "100px",
                        borderTopRightRadius: "20px", 
                        borderTopLeftRadius: "20px", 
                        zIndex: 1
                    }}
                >
                    <Group justify="flex-end" m="sm" mt="30px">
                        {userProp?.active && (
                            <Badge color="green" variant="light" radius="md" size="xl">• ACTIVE</Badge>
                        )}

                        {!userProp?.active && (
                            <Badge color="red" variant="light" radius="md" size="xl">DISABLED</Badge>
                        )}
                    </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12 }} style={{ background: "#101614", borderBottomRightRadius: "20px", borderBottomLeftRadius: "20px" }}>
                    <Stack gap="xs" mb="lg" ml="lg">
                        {windowWidth < 1000 && (
                            <Avatar 
                                size="xl" 
                                mt="-50px" 
                                style={{ 
                                    zIndex: 5, 
                                    background: "#323c43db" 
                                }}
                            >
                                {userProp?.first_name.charAt(0).toUpperCase() + userProp?.last_name.charAt(0).toUpperCase()}
                            </Avatar>
                        )}
                        {windowWidth > 1000 && (
                            <Avatar
                                size="100px"
                                mt="-25px"
                                style={{
                                    zIndex: 5,
                                    background: "#323c43db"
                                }}
                            >
                                {userProp?.first_name != "" ?
                                    userProp?.first_name.charAt(0).toUpperCase() + userProp?.last_name.charAt(0).toUpperCase() :
                                    userProp?.username.charAt(0).toUpperCase()}
                            </Avatar>
                        )}
                        <Space h="sm"/>
                        <Text size="30px" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>{userProp?.first_name != "" ? userProp?.first_name + " " + userProp?.last_name : userProp?.username}</Text>
                        <Group>
                            <IconMapPin style={{ marginRight: "-10px" }} />
                            <Text size="lg" fw={600}>{userProp?.city}</Text>
                        </Group>
                    </Stack>
                </Grid.Col>
            </Grid>
        </>
    );
}