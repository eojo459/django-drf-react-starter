import { ActionIcon, Grid, Paper, Stack, Table, Title, Text, Group, Avatar } from "@mantine/core";
import { IconBellRinging } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { NotSubmittedStaffTimesheetsData, NotSubmittedUserTimesheetsData } from "../TimesheetInbox";

export interface UnsubmittedTimesheets {
    notSubmittedStaffTimesheets: NotSubmittedStaffTimesheetsData[];
    notSubmittedUserTimesheets: NotSubmittedUserTimesheetsData[];
}

export default function UnsubmittedTimesheets(props: UnsubmittedTimesheets) {
    const [unsubmittedData, setUnsubmittedData] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // props
    const notSubmittedStaffTimesheetDataProp = props.notSubmittedStaffTimesheets;
    const notSubmittedUserTimesheetDataProp = props.notSubmittedUserTimesheets;

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

    const staffRows = notSubmittedStaffTimesheetDataProp?.map((person) => (
        <Paper shadow="md" p="lg" radius="lg" style={{ background: "#354E40", color: "#dcdcdc" }}>
            <Grid align="center" c="#dcdcdc">
                {windowWidth < 1000 && (
                    <>
                        <Grid.Col span={{ base: 9 }}>
                            <Group>
                                <Avatar color="cyan" radius="xl">{person.first_name.charAt(0) + person.last_name.charAt(0)}</Avatar>
                                <Text fw={600}>{person.first_name + " " + person.last_name}</Text>
                            </Group>
                        </Grid.Col>
                        <Grid.Col span={{ base: 3 }}>
                            <Text fw={600}>{person.total} h</Text>
                        </Grid.Col>
                    </>
                )}

                {windowWidth > 1000 && (
                    <>
                        <Grid.Col span={{ base: 5 }}>
                            <Group>
                                <Avatar color="cyan" radius="xl">{person.first_name.charAt(0) + person.last_name.charAt(0)}</Avatar>
                                <Text fw={600}>{person.first_name + " " + person.last_name}</Text>
                            </Group>
                        </Grid.Col>
                        <Grid.Col span={{ base: 2 }}>
                            <Text fw={600}>{person.total} h</Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 3 }}>
                            <Text fw={600}>${person.pay}</Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 2 }}>
                            <ActionIcon variant="subtle">
                                <IconBellRinging color="#64a155" />
                            </ActionIcon>
                        </Grid.Col>
                    </>
                )}
            </Grid>
            
        </Paper>
    ));

    return (
        <>
            {notSubmittedStaffTimesheetDataProp?.length > 0 && (
                <Grid>
                    {windowWidth < 1000 && (
                        <>
                            <Grid.Col span={{ base: 8 }}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Name</Text>
                            </Grid.Col>
                            <Grid.Col span={{ base: 4 }}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Hours</Text>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12 }}>
                                <Stack>
                                    {staffRows}
                                </Stack>
                            </Grid.Col>
                        </>
                    )}

                    {windowWidth > 1000 && (
                        <>
                            <Grid.Col span={{ base: 5 }}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Name</Text>
                            </Grid.Col>
                            <Grid.Col span={{ base: 2 }}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Hours</Text>
                            </Grid.Col>
                            <Grid.Col span={{ base: 2 }}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pay</Text>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12 }}>
                                <Stack>
                                    {staffRows}
                                </Stack>
                            </Grid.Col>
                        </>
                    )}
                    
                </Grid>
            )}

            {notSubmittedStaffTimesheetDataProp?.length < 1 && (
                <Text fw={500} ta="center" mt="lg">Nothing found</Text>
            )}
            
        </>
    );
}