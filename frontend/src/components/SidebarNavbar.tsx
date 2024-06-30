import { useState } from 'react';
import { UnstyledButton, Tooltip, Title, rem, Grid, Stack } from '@mantine/core';
import {
    IconHome2,
    IconGauge,
    IconDeviceDesktopAnalytics,
    IconFingerprint,
    IconCalendarStats,
    IconUser,
    IconSettings,
} from '@tabler/icons-react';
import classes from '../css/DoubleNavbar.module.css';
import { useNavigate } from 'react-router-dom';

interface DoubleNavbar {
    showLinks: boolean;
    showSidebar: boolean;
    mainLinks: any[];
    secondaryLinks: any[];
}

export function DoubleNavbar(props: DoubleNavbar) {
    const [activeGroup, setActiveGroup] = useState('');
    const [activeLabel, setActiveLabel] = useState('');
    const [activeLink, setActiveLink] = useState('');
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const navigate = useNavigate();

    // props
    const showLinks = props.showLinks;
    const mainLinksData = props.mainLinks;
    const secondaryLinksData = props.secondaryLinks;
    const showSidebar = props.showSidebar;

    const mainLinks = mainLinksData.map((link) => (
        <Tooltip
            label={link.label}
            position="right"
            withArrow
            transitionProps={{ duration: 0 }}
            key={link.label}
            style={{ zIndex: 5555 }}
        >
            <UnstyledButton
                onClick={() => {
                    setActiveGroup(link.group);
                    setActiveLabel(link.label);
                }}
                className={classes.mainLink}
                data-active={link.group === activeGroup || undefined}
                mt="lg"
            >
                <link.icon style={{ width: rem(40), height: rem(40) }} stroke={1.5} />
            </UnstyledButton>
        </Tooltip>
    ));

    const links = secondaryLinksData.map((link) => (
        link.group === activeGroup ? (
            <a
                className={classes.link}
                data-active={activeLink === link.id || undefined}
                href="#"
                onClick={(event) => {
                    event.preventDefault();
                    setActiveLink(link.id);
                    navigate(link.link);
                    console.log(link.link);
                }}
                key={link.id}
            >
                <Title order={3}>{link.label}</Title>
            </a>
        ) : null
    ));

    let sidebarClasses = "sidebar active";

    return (
        <>
            {showSidebar && (
                <div className={sidebarClasses}>
                    <Grid style={{ width: "350px" }}>
                        <Grid.Col span={{ base: 3 }} bg="#1a1a1a">
                            
                        </Grid.Col>
                        <Grid.Col span={{ base: 9 }} bg="#353a40">
                            <Title order={2} className={classes.title}>
                                {activeLabel}
                            </Title>
                        </Grid.Col>
                        <Grid.Col span={{ base: 3 }} bg="#1a1a1a">
                            <Stack className={classes.aside} gap="xs">
                                {mainLinks}
                            </Stack>
                        </Grid.Col>
                        {showLinks && (
                            <Grid.Col span={{ base: 9 }} bg="#222222">
                                {links}
                            </Grid.Col>
                        )}
                    </Grid>
                </div>
            )}
        </>
        

    );
}