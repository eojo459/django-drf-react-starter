import { Text, Progress, Card } from '@mantine/core';

interface IProgressCad {
    title: string;
    current: string;
    max: string;
    value: number;
}

export function ProgressCard(props: IProgressCad) {
    // props
    const titleProp = props.title;
    const currentProp = props.current;
    const maxProp = props.max;
    const valueProp = props.value;

    return (
        <Card radius="md" padding="xl" bg="#374842">
            <Text fz="md" tt="uppercase" fw={700} c="#dcdcdc">
                {titleProp}
            </Text>
            <Text fz="lg" fw={500} c="#dcdcdc">
                {currentProp} / {maxProp === '999' ? "∞" : maxProp}
            </Text>
            <Progress value={valueProp} mt="md" size="lg" radius="xl" color="#4a8a2a" />
        </Card>
    );
}