import { Timeline, Text, ThemeIcon, Paper, Title, Group, Badge, Stack, Grid } from "@mantine/core";
import { IconCheck, IconClockPause, IconDoorExit, IconFlag, IconFlagFilled, IconGitBranch, IconGitCommit, IconGitPullRequest, IconLogout, IconMessageDots, IconOutbound, IconPennant, IconPlaneArrival, IconPlaneDeparture, IconPlayerPlayFilled, IconVideo } from "@tabler/icons-react";
import { UserActivityModel } from "./HomePanel";
import { GenerateUUID, formatTimestamp12Hours, getStatusDescription, getStatusName, getStatusNameLong, getTimelineColor, getTimelineIconColor } from "../helpers/Helpers";
import { useState } from "react";
import TimelineItem from "./TimelineItem";
import { useMediaQuery } from "@mantine/hooks";

interface IActivityTimeline {
    activityLogData: UserActivityModel[];
}

export default function ActivityTimeline(props: IActivityTimeline) {
    const isMobile = useMediaQuery('(max-width: 28em)');
    
    // props
    const activityDataLogProp = props.activityLogData;

    // create activity item for each activity log item
    const activityItems = activityDataLogProp?.map((activity) => (
        <Timeline.Item
            key={GenerateUUID()}
            color={getTimelineColor(activity.status)}
            bullet={
                <ThemeIcon
                    size={42}
                    //variant="gradient"
                    color={getTimelineIconColor(activity.status)}
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
                        <Grid.Col span={{ base: 5 }}>
                            <Text 
                                size={isMobile ? "25px" : "30px"}
                                style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                            >
                                {getStatusNameLong(activity.status)}
                            </Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 7 }}>
                            <Group justify="end">
                                <Badge 
                                    size="lg" 
                                    //mb="md" 
                                    radius="lg" 
                                    color={getTimelineColor(activity.status)} 
                                    p="md" 
                                    style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}
                                >
                                    <Text 
                                        size={isMobile ? "sm" : "md"} 
                                        c="#dcdcdc" 
                                        fw={600} 
                                        style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}
                                    >
                                        {formatTimestamp12Hours(activity.timestamp)}
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
                                {activity.first_name} {getStatusDescription(activity.status)} {formatTimestamp12Hours(activity.timestamp)}.
                            </Text>
                        </Grid.Col>
                    </Grid>
    
                    {/* TODO: FIGURE OUT HOW TO CALCULATE X MIN/HOURS AGO FROM CURRENT TIME */}
                    {/* <Text size="md" mt={4}>8 hours ago</Text>  */}
                </Stack>
            </Paper>
        </Timeline.Item>
    ));
    

    return (
        <>
            <Timeline active={activityItems.length} bulletSize={42} lineWidth={14} color="gray">
                {activityItems.length > 0 && activityItems}
                {activityItems.length === 0 && (
                    // <Group justify="center" mt="lg">
                        <Text 
                            c="#c1c0c0" 
                            size="lg" 
                            fw={600} 
                            ta="center"
                            style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}
                        >
                            Nothing found
                        </Text>
                    // </Group> 
                )}

                {/* <Timeline.Item
                    color="rgba(9,15,13,0.3)"
                    bullet={
                        <ThemeIcon
                            size={22}
                            //variant="gradient"
                            color="rgba(9,15,13,0.4)"
                            //gradient={{ from: 'lime', to: 'cyan' }}
                            radius="xl"
                        >
                            <IconFlagFilled size="0.8rem" />
                        </ThemeIcon>
                    }
                //title="Shift ended • 12:00 PM"
                >
                    <Paper shadow="md" p="lg" radius="lg" style={{ background: "#324d3e", color: "#dcdcdc" }}>
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text size="25px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>End</Text>
                                <Badge size="xl" mb="md" radius="md" color="rgba(9,15,13,0.4)" p="lg" style={{ boxShadow: "0px 0px 5px 5px rgba(0, 0, 0, 0.05)" }}>
                                    <Text size="xl" c="#dcdcdc" fw={600} style={{ fontFamily: "AK-Medium", letterSpacing: "1px", textShadow: "0px 0px 3px #24352f" }}>5 h 30 m</Text>
                                </Badge>
                            </Group>
                            <Text c="#c1c0c0" size="lg" fw={600}>Tom ended their shift at 12:00 PM.</Text>
                            <Text size="md" mt={4}>34 minutes ago</Text>
                        </Stack>
                    </Paper>
                </Timeline.Item> */}
            </Timeline>
        </>
    );
}