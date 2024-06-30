import { Badge, Grid, Group, Paper, Stack, ThemeIcon, Timeline, Text } from "@mantine/core";
import { GenerateUUID, TimeStatus, formatTime, formatTimestamp12Hours, getStatusDescription, getStatusName, getTimelineColor, getTimelineIconColor } from "../helpers/Helpers";

export interface ITimelineItem {
    firstName: string;
    status: number;
    time?: string;
    timestamp?: string;
}

export default function TimelineItem(props: ITimelineItem) {

    // props
    const statusProp = props.status;
    const timeProp = props.time;
    const timestampProp = props.timestamp;
    const firstNameProp = props.firstName;

    return (
        <>
            <Timeline.Item
                key={GenerateUUID()}
                color={getTimelineColor(statusProp)}
                bullet={
                    <ThemeIcon
                        size={42}
                        //variant="gradient"
                        color={getTimelineIconColor(statusProp)}
                        //gradient={{ from: 'lime', to: 'cyan' }}
                        radius="xl"
                    >
                    </ThemeIcon>
                }
            //title="Checked in • 7:00 AM"
            >
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }}>
                    <Stack gap="xs">
                        <Grid>
                            <Grid.Col span={{ base: 3 }}>
                                <Text
                                    size="25px"
                                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                                >
                                    {getStatusName(statusProp)}
                                </Text>
                            </Grid.Col>
                            <Grid.Col span={{ base: 9 }}>
                                <Group justify="end">
                                    <Badge
                                        size="lg"
                                        mb="md"
                                        radius="lg"
                                        color={getTimelineColor(statusProp)}
                                        p="md"
                                        style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                    >
                                        <Text
                                            size="md"
                                            c="#dcdcdc"
                                            fw={600}
                                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                        >
                                            {statusProp === 2 ? "•" : ""} {timeProp ? formatTime(timeProp) : (timestampProp ? formatTimestamp12Hours(timestampProp) : "")}
                                        </Text>
                                    </Badge>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12 }}>
                                <Text
                                    c="#c1c0c0"
                                    size="lg"
                                    fw={600}
                                    style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}
                                >
                                    {firstNameProp} {getStatusDescription(statusProp)} {timeProp ? formatTime(timeProp) : (timestampProp ? formatTimestamp12Hours(timestampProp) : "")}.
                                </Text>
                            </Grid.Col>
                        </Grid>

                        {/* TODO: FIGURE OUT HOW TO CALCULATE X MIN/HOURS AGO FROM CURRENT TIME */}
                        {/* <Text size="md" mt={4}>8 hours ago</Text>  */}
                    </Stack>
                </Paper>
            </Timeline.Item>
        </>
    );
}