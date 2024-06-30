import { Accordion, Box, Button, Collapse, Group, Paper, Table, Title, Text, Grid, Stack, Textarea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import classes from "../../../css/StaffSubmittedTimesheets.module.css";
import inputClasses from "../../../css/TextInput.module.css";

const data = [
    {
        value: 'Apples',
        name: 'Kevin Thompson',
        manager: 'Mario Handy',
        total: '40.0',
        time_off: '0.0',
        expenses: '$2200.0',
        old_pdf: 'Timesheet original pdf',
        new_pdf: 'Timesheet new pdf',
    },
    {
        value: 'Bananas',
        name: 'Rob Anderson',
        manager: 'Mario Handy',
        time_off: '5.0',
        expenses: '$1800.0',
        total: '35.0',
        old_pdf: 'Timesheet original pdf',
        new_pdf: 'Timesheet new pdf',
    },
    {
        value: 'Broccoli',
        name: 'Dennis Hamilton',
        manager: 'Mario Handy',
        time_off: '0.0',
        expenses: '$2200.0',
        total: '40.0',
        old_pdf: 'Timesheet original pdf',
        new_pdf: 'Timesheet new pdf',
    },
];

export default function PendingChangesTimesheets() {
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
                                        <Grid.Col span={{base:4}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Name</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:2}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Hours</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:2}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Time off</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:4}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pay</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                {windowWidth > 1050 && (
                                    <>
                                        <Grid.Col span={{base:3}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Name</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:3}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Manager</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:2}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Hours</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:2}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Time off</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:2}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pay</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                
                            </Grid>
                        </Grid.Col>
                        <Grid.Col span={{base: 12}}>
                            <Grid>
                                {windowWidth < 1050 && (
                                    <>
                                        <Grid.Col span={{base:4}}>
                                            <Text fw={600}>{item.name}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:2}}>
                                            <Text fw={600}>{item.total}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:2}}>
                                            <Text fw={600}>{item.time_off}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:4}}>
                                            <Text fw={600}>{item.expenses}</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                {windowWidth > 1050 && (
                                    <>
                                        <Grid.Col span={{base:3}}>
                                            <Text fw={600}>{item.name}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:3}}>
                                            <Text fw={600}>{item.manager}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:2}}>
                                            <Text fw={600}>{item.total}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:2}}>
                                            <Text fw={600}>{item.time_off}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{base:2}}>
                                            <Text fw={600}>{item.expenses}</Text>
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
                        <Grid>
                            <Grid.Col span={{base:12, md: 6}}>
                                <Stack>
                                    <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Old timesheet</Text>
                                    <Box>{item.old_pdf}</Box>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{base:12, md: 6}}>
                                <Stack>
                                    <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>New timesheet</Text>
                                    <Box>{item.new_pdf}</Box>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{base:12}}>
                                <Stack>
                                    <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Change reason</Text>
                                    <Textarea readOnly classNames={inputClasses}>I changed it because i made a mistake!</Textarea>
                                </Stack>
                            </Grid.Col>
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