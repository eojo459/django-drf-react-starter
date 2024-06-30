import { Container, Grid, Title, Text, Button, Stack, Image, Group, Paper, rem, Space } from "@mantine/core";
import * as React from "react";
import { DoubleNavbar } from "../../components/SidebarNavbar";
import { IconBolt, IconChartHistogram, IconClockCheck, IconReportMoney, IconShieldLock, IconTrendingUp, IconUsersGroup } from "@tabler/icons-react";
import { FrequentlyAskedQuestions } from "../../components/FrequentlyAskedQuestions";
import { ContactUsForm } from "../../components/ContactUsForm";
import { Footer } from "../../components/Footer";
import PlansPricing from "../../components/PlansPricing";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import heroScreens from '../../assets/verifiedshift-screens.png';
import vsLogo from '../../assets/VerifiedHoursLogo2.png';
import { useMediaQuery } from "@mantine/hooks";


export default function MainHomePage() {
    const { user, session} = useAuth();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width: 50em)');

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    },[]);

    return (
        <>
            <Container size="xl">
                <Grid mt="60px">
                    {/* hero section */}
                    <Grid.Col span={{ base: 12, md: 8 }} mb="xl">
                        <Image
                            radius="md"
                            src={vsLogo}
                            //h={30}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Stack>
                            <Text 
                                size="30px" 
                                fw={600}
                                style={{ lineHeight:"45px", letterSpacing: "1px" }}
                                c="#dcdcdc"
                            >
                                Unlock efficiency, accuracy, and peace of mind with VerifiedHours
                            </Text>
                            <Space h="10px"/>
                            <Button
                                //variant="subtle"
                                color="#4a8a2a"
                                radius="md"
                                size="md"
                                style={{ height: "60px"}}
                                onClick={() => navigate("/register")}
                            >
                                <Title order={2}>Free Sign up</Title>
                            </Button>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Text 
                            size={isMobile ? "45px" : "60px"} 
                            c="#dcdcdc"
                            style={{fontFamily: "AK-Medium", lineHeight:"80px", letterSpacing: "1px"}}
                        >
                            All-in-One Time Tracking and Management system for teams of all sizes
                        </Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        {/* dashboard photo */}
                        <Image
                            radius="md"
                            //h={200}
                            w="fit"
                            fit="contain"
                            src={heroScreens}
                            mt="50px"
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <Text 
                            fw={600} 
                            size="40px" 
                            ta="center"
                            mb="100px"
                            mt="100px"
                            c="#dcdcdc"
                            style={{ lineHeight:"70px", letterSpacing: "1px" }}
                        >
                            VerifiedHours simplifies the struggles of managing data, allowing you to focus on growing your business.
                        </Text>
                    </Grid.Col>

                    {/* Features */}
                    <Grid.Col span={{ base: 12 }} mb="200px">
                        <Text 
                            fw={600} 
                            size="40px" 
                            ta="center"
                            mb="50px"
                            c="#dcdcdc"
                        >
                            Features
                        </Text>
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "white" }}>
                                    <Stack align="center">
                                        <IconClockCheck
                                            style={{ width: rem(40), height: rem(40) }}
                                            stroke={1.5}
                                        />
                                        <Text c="#dcdcdc" ta="center" fw={700} size="24px" mb="md" >Time tracking made easy</Text>
                                        <Text c="#dcdcdc" ta="center" size="lg">Effortlessly capture, monitor, and manage employee work hours. Ensures accurate time entries.</Text>
                                    </Stack>
                                </Paper>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "white" }}>
                                    <Stack align="center">
                                        <IconReportMoney
                                            style={{ width: rem(40), height: rem(40) }}
                                            stroke={1.5}
                                        />
                                        <Text c="#dcdcdc" ta="center" fw={700} size="24px" mb="md">Automated payroll processing</Text>
                                        <Text c="#dcdcdc" ta="center" size="lg">Say goodbye to manual calculations and errors. Ensuring timely and accurate payments.</Text>
                                    </Stack>
                                </Paper>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "white" }}>
                                    <Stack align="center">
                                        <IconUsersGroup
                                            style={{ width: rem(40), height: rem(40) }}
                                            stroke={1.5}
                                        />
                                        <Text c="#dcdcdc" ta="center" fw={700} size="24px" mb="md">User management</Text>
                                        <Text c="#dcdcdc" ta="center" size="lg">Streamline user access and permissions. Assign roles and manage user profiles with ease.</Text>
                                    </Stack>
                                </Paper>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "white" }}>
                                    <Stack align="center">
                                        <IconBolt
                                            style={{ width: rem(40), height: rem(40) }}
                                            stroke={1.5}
                                        />
                                        <Text c="#dcdcdc" ta="center" fw={700} size="24px" mb="md">Real-time insights</Text>
                                        <Text c="#dcdcdc" ta="center" size="lg">Gain valuable insights into employee productivity. Make informed decisions with real-time data</Text>
                                    </Stack>
                                </Paper>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "white" }}>
                                    <Stack align="center">
                                        <IconChartHistogram
                                            style={{ width: rem(40), height: rem(40) }}
                                            stroke={1.5}
                                        />
                                        <Text c="#dcdcdc" ta="center" fw={700} size="24px" mb="md">Customizable reports</Text>
                                        <Text c="#dcdcdc" ta="center" size="lg">Generate detailed reports for timesheet entries, payroll summaries, and daily user activities.</Text>
                                    </Stack>
                                </Paper>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "white" }}>
                                    <Stack align="center">
                                        <IconShieldLock
                                            style={{ width: rem(40), height: rem(40) }}
                                            stroke={1.5}
                                        />
                                        <Text c="#dcdcdc" ta="center" fw={700} size="24px" mb="md">Secure and scalable</Text>
                                        <Text c="#dcdcdc" ta="center" size="lg">A secure system that grows with your business while maintaining data security and integrity.</Text>
                                    </Stack>
                                </Paper>
                            </Grid.Col>
                        </Grid>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mb="200px">
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
                            {/* <PlansPricing/> */}
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mb="100px">
                        <Stack>
                            <Text 
                                fw={600} 
                                c="#dcdcdc"
                                size="40px" 
                                ta="center"
                                mb="50px"
                            >
                                Frequently Asked Questions
                            </Text>
                            <FrequentlyAskedQuestions/>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <ContactUsForm/>
                    </Grid.Col>

                </Grid>
            </Container>
            {/* <Footer/> */}
        </>
    )
}