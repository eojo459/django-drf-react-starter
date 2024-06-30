import { Container, Group, Anchor, Text, Stack } from '@mantine/core';
//import { MantineLogo } from '@mantinex/mantine-logo';
import classes from '../css/Footer.module.scss';
import { useNavigate } from 'react-router-dom';
import { useNavigationContext } from "../context/NavigationContext";

const links = [
    { link: '/pricing', label: 'Pricing' },
    { link: '/contact', label: 'Contact' },
    { link: '/privacy', label: 'Privacy' },
    { link: '/terms-of-service', label: 'Terms' },
    // { link: '#', label: 'Blog' },
    //{ link: '#', label: 'Help' },
];

export function Footer() {
    const navigate = useNavigate();
    
    const items = links.map((link) => (
        <Anchor<'a'>
            c="dimmed"
            key={link.label}
            href={link.link}
            //style={{fontSize:"18px"}}
            //onClick={(event) => event.preventDefault()}
            // onClick={() => {
            //     //navigate(link.link);
            //     //setActive("");
            // }}
            size="lg"
        >
            {link.label}
        </Anchor>
    ));

    return (
        <div className={classes.footer}>
            <Container className={classes.inner}>
                {/* <MantineLogo size={28} /> */}
                <Stack>
                    <Group className={classes.links}>{items}</Group>
                    <Text c="#dcdcdc" ta="center" style={{ letterSpacing: "1px" }}>© VerifiedHours 2024</Text>
                </Stack>
            </Container>
        </div>
    );
}