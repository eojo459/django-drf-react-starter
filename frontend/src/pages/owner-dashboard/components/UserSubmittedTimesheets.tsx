import { Accordion, Box, Button, Collapse, Group, Paper, Table, Title, Text, Grid, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import classes from "../../../css/StaffSubmittedTimesheets.module.css";

const data = [
    {
        value: 'Apples',
        name: 'Bryan Fountain',
        manager: 'Mario Handy',
        total: '40.0',
        time_off: '0.0',
        fees: '$800.0',
        pdf: 'Timesheet pdf',
    },
    {
        value: 'Bananas',
        name: 'Carl Timewheel',
        manager: 'Mario Handy',
        time_off: '5.0',
        fees: '$800.0',
        total: '35.0',
        pdf: 'Timesheet pdf',
    },
    {
        value: 'Broccoli',
        name: 'Milton Francis',
        manager: 'Mario Handy',
        time_off: '0.0',
        fees: '$800.0',
        total: '40.0',
        pdf: 'Timesheet pdf',
    },
];

export default function UserSubmittedTimesheets() {
    const [submittedData, setSubmittedData] = useState(true);
    const [opened, { toggle }] = useDisclosure(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // run on component load
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

    const items = data.map((item) => (
        <Accordion.Item key={item.value} value={item.value} style={{border: "transparent"}} mt="sm">
            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#354E40", color: "#dcdcdc" }}>
                <Accordion.Control>
                    <Grid c="#dcdcdc">
                        <Grid.Col span={{base: 12}}>
                            <Grid>
                                {windowWidth < 1050 && (
                                    <>
                                        <Grid.Col span={{base:6}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Name</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:3}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Hours</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:3}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Fees</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                {windowWidth > 1050 && (
                                    <>
                                        <Grid.Col span={{base:6}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Name</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:3}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Total</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:3}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Fees</Text>
                                        </Grid.Col>
                                    </>
                                )}
                            </Grid>
                        </Grid.Col>
                        <Grid.Col span={{base: 12}}>
                            <Grid>
                                {windowWidth < 1050 && (
                                    <>
                                        <Grid.Col span={{base:6}}>
                                            <Text fw={600}>{item.name}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:3}}>
                                            <Text fw={600}>{item.total}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:3}}>
                                            <Text fw={600}>{item.fees}</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                {windowWidth > 1050 && (
                                    <>
                                        <Grid.Col span={{base:6}}>
                                            <Text fw={600}>{item.name}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:3}}>
                                            <Text fw={600}>{item.total}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:3}}>
                                            <Text fw={600}>{item.fees}</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                
                            </Grid>
                        </Grid.Col>
                    </Grid>
                </Accordion.Control>
            </Paper>
            
                
            <Accordion.Panel mt="xs" style={{ background: "transparent" }}>
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#354E40", color: "#dcdcdc" }}>
                    <Stack>
                        <Box>{item.pdf}</Box>
                        <Grid>
                            <Grid.Col span={{base:6}}>
                                <Button size="md" radius="md" color="#6C221F" fullWidth>
                                    Deny
                                </Button>
                            </Grid.Col>
                            <Grid.Col span={{base:6}}>
                                <Button color="#316F22" size="md" radius="md" fullWidth>
                                    Approve
                                </Button>
                            </Grid.Col>
                        </Grid>
                    </Stack>
                </Paper>
            </Accordion.Panel>
        </Accordion.Item>
    ));

    return (
        <>
            <Accordion classNames={classes}>
                {items}
            </Accordion>
        </>
    );
}