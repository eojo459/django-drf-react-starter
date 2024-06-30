import { useContext, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Container, ActionIcon, Burger, Group, Text, useComputedColorScheme, useMantineColorScheme, Button, Drawer, Box, Center, Collapse, Divider, ScrollArea, UnstyledButton, rem, Stack } from "@mantine/core";
import { IconSun, IconMoon, IconChevronDown, IconNotification } from "@tabler/icons-react";
//import classes from '../css/Header.module.scss';
import { theme } from 'antd';
import { AuthContext } from '../authentication/AuthContext';

const links = [
    { link: '/about', label: 'Features' },
    { link: '/pricing', label: 'Pricing' },
    { link: '/learn', label: 'Learn' },
    { link: '/community', label: 'Community' },
];

export default function HeaderHome() {
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

    const items = links.map((link) => (
        <a
            key={link.label}
            href={link.link}
            //className={classes.link}
            onClick={(event) => event.preventDefault()}
        >
            {link.label}
        </a>
    ));

    return (
        <>
            <header>
                <div>
                    <Group align="center" justify="space-between" m="lg">
                        <Burger opened={drawerOpened} onClick={toggleDrawer} size="sm" hiddenFrom="sm" />
                        <Text>Dashboard</Text>
                        <Group>
                        <ActionIcon variant="filled" aria-label="Settings">
                            <IconNotification/>
                        </ActionIcon>
                            <Button>Sign up</Button>
                        </Group>
                    </Group>
                </div>
            </header>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                title="Navigation"
                hiddenFrom="sm"
                zIndex={1000000}
            >
                <Stack>
                    <a href="#" >
                        Features
                    </a>
                    <Divider my="sm" />
                    <a href="#" >
                        Pricing
                    </a>
                    <Divider my="sm" />
                    <a href="#" >
                        Learn
                    </a>
                    <Divider my="sm" />
                    <a href="#" >
                        Community
                    </a>
                </Stack>
            </Drawer>
        </>
    );
}





// export default function Header() {
//     const { setColorScheme } = useMantineColorScheme();
//     const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
//     const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
//     const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
    
//     return (
//         <Group h="100%" px="md" style={{display:"flex", justifyContent:"space-between"}}>
//           <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
//           <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
//           {/* <MantineLogo size={30} /> */}
//           {/* <Text size="lg">Business Management</Text> */}

//           {/* light/dark mode button */}
//           <ActionIcon
//             onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
//             variant="default"
//             size="xl"
//             aria-label="Toggle color scheme"
//           >
//             {computedColorScheme === 'light' ? <IconSun/> : <IconMoon/> }
//           </ActionIcon>
//         </Group>
        
//     )
// }