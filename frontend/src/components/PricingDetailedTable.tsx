import cx from 'clsx';
import { useState } from 'react';
import { Table, ScrollArea, Stack, Text } from '@mantine/core';
import classes from '../css/PricingDetailedTable.module.css';
import { IconCheck, IconX } from '@tabler/icons-react';

interface DataRow {
    name: string;
    description: string;
    freePlan?: number | boolean | string;
    basicPlan?: number | boolean | string;
    proPlan?: number | boolean | string;
    enterprisePlan?: number | boolean | string;
}

const data = [
    {
        name: 'Pricing',
        description: '',
        freePlan: '$0 /month',
        basicPlan: '$39.95 /month',
        proPlan: '$79.95 /month',
        enterprisePlan: 'Contact us',
    },
    {
        name: 'Business centres',
        description: 'Maximum number of business centres you can manage and have linked to your account',
        freePlan: '1',
        basicPlan: '1',
        proPlan: '3',
        enterprisePlan: 'Unlimited',
    },
    {
        name: 'Employees',
        description: 'Maximum number of employees that can be registered to a single business centre',
        freePlan: '5',
        basicPlan: 'Unlimited',
        proPlan: 'Unlimited',
        enterprisePlan: 'Unlimited',
    },
    {
        name: 'Employee time tracking',
        description: 'Track employee hours for check in, check out and breaks',
        freePlan: true,
        basicPlan: true,
        proPlan: true,
        enterprisePlan: true,
    },
    {
        name: 'Generate reports',
        description: 'Generate timesheet and payroll reports files as a PDF or CSV',
        freePlan: true,
        basicPlan: true,
        proPlan: true,
        enterprisePlan: true,
    },
    {
        name: 'Generate automatic reports',
        description: 'Generate automatic reports based on a frequency schedule',
        freePlan: false,
        basicPlan: true,
        proPlan: true,
        enterprisePlan: true,
    },
    // {
    //     name: 'Group manager',
    //     description: 'Create and assign users to groups',
    //     freePlan: false,
    //     basicPlan: true,
    //     proPlan: true,
    //     enterprisePlan: true,
    // },
    // {
    //     name: 'Automatic schedule creator',
    //     description: 'Generate weekly and monthly schedules based on business needs, staff availability and work hours',
    //     freePlan: false,
    //     basicPlan: true,
    //     proPlan: true,
    //     enterprisePlan: true,
    // },
    // {
    //     name: 'Activity task planner',
    //     description: 'Management centre to plan tasks and activities',
    //     freePlan: false,
    //     basicPlan: true,
    //     proPlan: true,
    //     enterprisePlan: true,
    // },
    {
        name: 'GPS geolocation tracking',
        description: "Use GPS to make sure that when employees clock in, clock out, or take a break at work, their current location is verified and confirmed to be at the defined in-person location",
        freePlan: false,
        basicPlan: false,
        proPlan: true,
        enterprisePlan: true,
    },
    {
        name: 'Email support',
        description: "",
        freePlan: true,
        basicPlan: true,
        proPlan: true,
        enterprisePlan: true,
    },
];

export function PricingDetailedTable() {
    const [scrolled, setScrolled] = useState(false);

    const rows = data.map((row: DataRow) => {
        if (typeof row.freePlan === 'boolean') {
            return (
                <Table.Tr c="#dcdcdc" key={row.name}>
                    <Table.Td maw={300}>
                        <Stack>
                            <Text size="lg">{row.name}</Text>
                            <Text size="sm">{row.description}</Text>
                        </Stack>
                    </Table.Td>
                    {row.freePlan ? <Table.Td align='center'><IconCheck/></Table.Td> : <Table.Td align='center'><IconX/></Table.Td>}
                    {row.basicPlan ? <Table.Td align='center'><IconCheck/></Table.Td> : <Table.Td align='center'><IconX/></Table.Td>}
                    {row.proPlan ? <Table.Td align='center'><IconCheck/></Table.Td> : <Table.Td align='center'><IconX/></Table.Td>}
                    {row.enterprisePlan ? <Table.Td align='center'><IconCheck/></Table.Td> : <Table.Td align='center'><IconX/></Table.Td>}
                </Table.Tr>
            );
        } 
        else if (typeof row.freePlan === 'string' || typeof row.basicPlan === 'number') {
            return (
                <Table.Tr c="#dcdcdc" key={row.name}>
                    <Table.Td maw={300}>
                        <Stack>
                            <Text size="lg">{row.name}</Text>
                            <Text size="sm">{row.description}</Text>
                        </Stack>
                    </Table.Td>
                    <Table.Td align='center'>{row.freePlan}</Table.Td> 
                    <Table.Td align='center'>{row.basicPlan}</Table.Td> 
                    <Table.Td align='center'>{row.proPlan}</Table.Td> 
                    <Table.Td align='center'>{row.enterprisePlan}</Table.Td> 
                </Table.Tr>
            );
        }
        else {
            return (<></>);
        }
    });
    

    return (
        <ScrollArea h={600} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
            <Table 
                miw={700} 
                withColumnBorders
                verticalSpacing="md"
                horizontalSpacing="md"
            >
                <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
                    <Table.Tr>
                        <Table.Th><Text size="lg">Feature overview</Text></Table.Th>
                        <Table.Th ta="center"><Text size="lg">Free</Text></Table.Th>
                        <Table.Th ta="center"><Text size="lg">Basic</Text></Table.Th>
                        <Table.Th ta="center"><Text size="lg">Pro</Text></Table.Th>
                        <Table.Th ta="center"><Text size="lg">Enterprise</Text></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </ScrollArea>
    );
}