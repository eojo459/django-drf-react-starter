import { Accordion, Box, Button, Collapse, Group, Paper, Table, Title, Text, Grid, Stack, Pagination, Badge, ScrollArea } from "@mantine/core";
import { randomId, useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { chunk, getDayOfWeek, getFormattedDate } from "../../../helpers/Helpers";
import classes from "../../../css/StaffSubmittedTimesheets.module.css";
import PDFViewer from "../../../components/PdfViewer";
import { ArchivedStaffTimesheetData } from "../../staff-dashboard/timesheet";

interface ArchivedTimesheets {
    archivedStaffTimesheetData: ArchivedStaffTimesheetData[];
}

export default function ArchivedTimesheets(props: ArchivedTimesheets) {
    const [submittedData, setSubmittedData] = useState(true);
    const [opened, { toggle }] = useDisclosure(false);
    const [activePage, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [archivedStaffTimesheetData, setArchivedStaffTimesheetData] = useState<ArchivedStaffTimesheetData[]>([]);

    // props
    const archivedTimesheetsProp = props.archivedStaffTimesheetData;

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

    useEffect(() => {
        if (archivedTimesheetsProp) {
            setArchivedStaffTimesheetData(archivedTimesheetsProp);
        }
    },[archivedTimesheetsProp]);

    const fakeData = chunk(
        Array(100)
          .fill(0)
          .map((_, index) => ({ 
            id: index, 
            uid: randomId(),
            name: randomId(),
            manager: randomId(),
            value: randomId().toString(),
            total: "40.0",
            time_off: "0.0",
            expenses: "$1800",
            pdf: 'Timesheet pdf',
            week: '07-01-2024',
        })),
        itemsPerPage
    );

    //const chunkedData = chunk(archivedTimesheetsProp, itemsPerPage);
    //const items = chunkedData[activePage - 1]?.map((item) => (
    const items = archivedStaffTimesheetData?.map((item) => (
        <Accordion.Item key={item.uid} value={item.uid} style={{border: "transparent"}} mt="sm">
            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#354E40", color: "#dcdcdc" }}>
                <Accordion.Control style={{ background: "#354E40", color: "#dcdcdc" }}>
                    <Grid c="#dcdcdc">
                        {windowWidth < 1050 && (
                            <Grid.Col span={{ base: 12 }}>
                                <Badge size="lg" color="rgba(24,28,38,0.5)" radius="md">
                                    <Text fw={600}>{getFormattedDate(item.start_date, "short")} - {getFormattedDate(item.end_date, "short")} {new Date().getFullYear()}</Text>
                                </Badge>
                            </Grid.Col>
                        )}
                        
                        <Grid.Col span={{ base: 12 }}>
                            <Grid>
                                {windowWidth < 1050 && (
                                    <>
                                        <Grid.Col span={{ base: 8 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Name</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Hours</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                {windowWidth > 1050 && (
                                    <>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Badge size="lg" color="rgba(24,28,38,0.5)" radius="md">
                                                <Text fw={600}>{getFormattedDate(item.start_date, "short")} - {getFormattedDate(item.end_date, "short")} {new Date().getFullYear()}</Text>
                                            </Badge>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Name</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Hours</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                
                            </Grid>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12 }}>
                            <Grid>
                                {windowWidth < 1050 && (
                                    <>
                                        <Grid.Col span={{ base: 8 }}>
                                            <Text fw={600}>{item.first_name + " " + item.last_name}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text fw={600}>{item.total} h</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                {windowWidth > 1050 && (
                                    <>
                                        <Grid.Col span={{ base: 4 }}>
                                            {/* <Text fw={600}>{getFormattedDate(item.start_date, "short")} - {getFormattedDate(item.end_date, "short")}</Text> */}
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text fw={600}>{item.first_name + " " + item.last_name}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text fw={600}>{item.total} h</Text>
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
                    <Text 
                        size="35px" 
                        fw={600} 
                        style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        mb="lg"
                    >
                        {getFormattedDate(item.start_date, 'long') + " - " + getFormattedDate(item.end_date, 'long') + " " + new Date().getFullYear() + " timesheet report"}
                    </Text>
                    <PDFViewer url={item.pdf_file}/>
                </Paper>
            </Accordion.Panel>
        </Accordion.Item>
    ));

    return (
        <>
            <Accordion classNames={classes}>
                {/* <ScrollArea h={800} scrollbarSize={20}> */}
                    {items}
                {/* </ScrollArea> */}
            </Accordion>
            <Group justify="center">
                {/* <Pagination total={archivedStaffTimesheetData?.length} value={activePage} onChange={setPage} mt="sm" /> */}
            </Group>
        </>
    );
}