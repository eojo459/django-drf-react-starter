import { Accordion, Box, Button, Collapse, Group, Paper, Table, Title, Text, Grid, Stack, Pagination, Badge, ScrollArea } from "@mantine/core";
import { randomId, useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { chunk, getDayOfWeek, getFormattedDate } from "../../../helpers/Helpers";
import classes from "../../../css/StaffSubmittedTimesheets.module.css";
import PDFViewer from "../../../components/PdfViewer";
import { ArchivedStaffTimesheetData } from "../../staff-dashboard/timesheet";
import { ArchivedReportData } from "../ReportInbox";

interface ArchivedReports {
    archivedReportData: ArchivedReportData[];
}

export default function ArchivedReports(props: ArchivedReports) {
    const [submittedData, setSubmittedData] = useState(true);
    const [opened, { toggle }] = useDisclosure(false);
    const [activePage, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [archivedReportData, setArchivedReportData] = useState<ArchivedReportData[]>([]);
    const [scrollAreaHeight, setScrollAreaHeight] = useState(150);

    // props
    const archivedReportsProp = props.archivedReportData;

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
        if (archivedReportsProp) {
            setArchivedReportData(archivedReportsProp);
            if (archivedReportsProp?.length > 0) {
                setScrollAreaHeight(archivedReportsProp?.length * 150);
            }
        }
    },[archivedReportsProp]);

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
    const items = archivedReportData?.map((item) => (
        <Accordion.Item key={item.id} value={item.id} style={{border: "transparent"}} mt="sm">
            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#354E40", color: "#dcdcdc" }}>
                <Accordion.Control style={{ background: "#354E40", color: "#dcdcdc" }}>
                    <Grid c="#dcdcdc">
                        {/* <Grid.Col span={{ base: 12 }}>
                            <Badge size="lg" color="rgba(24,28,38,0.5)" radius="md">
                                <Text fw={600}>{item.start_date}</Text>
                            </Badge>
                        </Grid.Col> */}
                        <Grid.Col span={{ base: 12 }}>
                            <Grid>
                                {windowWidth < 1050 && (
                                    <>
                                        <Grid.Col span={{ base: 6 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Date</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 6 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Type</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                {windowWidth > 1050 && (
                                    <>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Date start</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Date end</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Type</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                
                            </Grid>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12 }}>
                            <Grid>
                                {windowWidth < 1050 && (
                                    <>
                                        <Grid.Col span={{ base: 6 }}>
                                            <Text fw={600}>{item.start_date}</Text>
                                            <Text fw={600}>{item.end_date}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 6 }}>
                                            <Text fw={600}>{item.type}</Text>
                                        </Grid.Col>
                                    </>
                                )}
                                {windowWidth > 1050 && (
                                    <>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text fw={600}>{item.start_date}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text fw={600}>{item.end_date}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text fw={600}>{item.type}</Text>
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
                        {new Date().getFullYear() + " " + getFormattedDate(item.start_date, 'long') + " - " + getFormattedDate(item.end_date, 'long') + " timesheet"}
                    </Text>
                    <PDFViewer url={item.pdf_url}/>
                </Paper>
            </Accordion.Panel>
        </Accordion.Item>
    ));

    return (
        <>
            <Accordion classNames={classes}>
                {/* <ScrollArea h={scrollAreaHeight} scrollbarSize={20}> */}
                    {items}
                {/* </ScrollArea> */}
            </Accordion>
            <Group justify="center">
                {/* <Pagination total={archivedReportData?.length} value={activePage} onChange={setPage} mt="sm" /> */}
            </Group>
        </>
    );
}