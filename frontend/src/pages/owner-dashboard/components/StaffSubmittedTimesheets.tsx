import { Accordion, Box, Button, Collapse, Group, Paper, Table, Title, Text, Grid, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import classes from "../../../css/StaffSubmittedTimesheets.module.css";
import { StaffSubmittedTimesheetsData } from "../TimesheetInbox";
import PDFViewer from "../../../components/PdfViewer";

export interface StaffSubmittedTimesheets {
    staffSubmittedTimesheets: StaffSubmittedTimesheetsData[];
    handleApproveButtonClicked: (timesheetId: string) => void;
    handleDenyButtonClicked: (timesheetId: string) => void;
    //handleSelectedTimesheetIdChange: (t)
}

export default function StaffSubmittedTimesheets(props: StaffSubmittedTimesheets) {
    const [submittedData, setSubmittedData] = useState(true);
    const [opened, { toggle }] = useDisclosure(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [selectedTimesheetId, setSelectedTimesheetId] = useState('');

    // props
    const staffSubmittedTimesheetsProp = props.staffSubmittedTimesheets;
    const handleApproveButtonClickedProp = props.handleApproveButtonClicked;
    const handleDenyButtonClickedProp = props.handleDenyButtonClicked;


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

    const items = staffSubmittedTimesheetsProp.map((item) => (
        <Accordion.Item key={item.uid} value={item.uid} style={{border: "transparent"}} mt="sm">
            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#354E40", color: "#dcdcdc" }}>
                <Accordion.Control style={{ background: "#354E40", color: "#dcdcdc" }}>
                    <Grid c="#dcdcdc">
                        <Grid.Col span={{base: 12}}>
                            <Grid>
                                {/* mobile */}
                                {windowWidth < 1050 && (
                                    <>
                                        <Grid.Col span={{ base: 6 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Name</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 3 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Hours</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 3 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pay</Text>
                                        </Grid.Col>
                                    </>
                                )}

                                {/* desktop */}
                                {windowWidth > 1050 && (
                                    <>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Name</Text>
                                        </Grid.Col>
                                        {/* <Grid.Col span={{base:4}}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Manager</Text>
                                        </Grid.Col> */}
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Hours</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Pay</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                
                            </Grid>
                        </Grid.Col>
                        <Grid.Col span={{base: 12}}>
                            <Grid>
                                {/* mobile */}
                                {windowWidth < 1050 && (
                                    <>
                                        <Grid.Col span={{ base: 6 }}>
                                            <Text fw={600}>{item.first_name + " " + item.last_name}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 3 }}>
                                            <Text fw={600}>{item.total} h</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 3 }}>
                                            <Text fw={600}>${item.pay}</Text>
                                        </Grid.Col>
                                    </>
                                )}

                                {/* desktop */}
                                {windowWidth > 1050 && (
                                    <>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text fw={600}>{item.first_name + " " + item.last_name}</Text>
                                        </Grid.Col>
                                        {/* <Grid.Col span={{ base: 4 }}>
                                            <Text fw={600}>{item.manager_name}</Text>
                                        </Grid.Col> */}
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text fw={600}>{item.total} h</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text fw={600}>${item.pay}</Text>
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
                        {/* PDF viewer */}
                        <PDFViewer url={item.pdf_file}/>

                        {/* approve/deny buttons */}
                        <Grid>
                            <Grid.Col span={{base:6}}>
                                <Button 
                                    size="lg" 
                                    radius="md" 
                                    color="#6C221F" 
                                    fullWidth
                                    onClick={() => handleDenyButtonClickedProp(item.timesheet_id)}
                                >
                                    Deny
                                </Button>
                            </Grid.Col>
                            <Grid.Col span={{base:6}}>
                                <Button 
                                    color="#316F22" 
                                    size="lg" 
                                    radius="md" 
                                    fullWidth
                                    onClick={() => handleApproveButtonClickedProp(item.timesheet_id)}
                                >
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
            {staffSubmittedTimesheetsProp?.length > 0 && (
                <Accordion classNames={classes}>
                    {items}
                </Accordion>
            )}

            {staffSubmittedTimesheetsProp?.length < 1 && (
                <Text fw={500} ta="center" mt="lg">Nothing found</Text>
            )}
            
        </>
    );
}