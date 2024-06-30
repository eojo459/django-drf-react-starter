import { Image, Accordion, Grid, Container, Title, Text, Space } from '@mantine/core';
import image from '../assets/faq.svg';
import classes from '../css/FrequentlyAskedQuestions.module.scss';

const placeholder =
    'It can’t help but hear a pin drop from over half a mile away, so it lives deep in the mountains where there aren’t many people or Pokémon.';

export function FrequentlyAskedQuestions() {
    return (
        <div className={classes.wrapper}>
            <Container size="lg">
                <Grid id="faq-grid" gutter={50}>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Image src={image} alt="Frequently Asked Questions" />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        {/* <Title order={2} ta="left" className={classes.title}>
                            Frequently Asked Questions
                        </Title> */}

                        <Accordion chevronPosition="right" defaultValue="target-users" variant="separated">
                            <Accordion.Item className={classes.item} value="target-users">
                                <Accordion.Control className={classes.control}>Who is this for?</Accordion.Control>
                                <Accordion.Panel className={classes.panel}>
                                    <Text c="#dcdcdc" size="lg" mt="sm">VerifiedHours time tracking and management system is designed for individuals, teams, and businesses of all sizes who want to streamline their workflow and improve productivity and efficiency.</Text>
                                    <Space h="lg"/>
                                    <Text c="#dcdcdc" size="lg" mt="sm">Whether you have 1 employee or 100. VerifiedHours provides the tools and flexibility to meet your needs.</Text>
                                </Accordion.Panel>
                            </Accordion.Item>
                            
                            <Accordion.Item className={classes.item} value="reset-password">
                                <Accordion.Control className={classes.control}>I am an employee. Do I need to purchase a subscription?</Accordion.Control>
                                <Accordion.Panel className={classes.panel}>
                                    <Text c="#dcdcdc" size="lg" mt="sm">No. Only business owners need to purchase a subscription.</Text>
                                    <Space h="lg"/>
                                    <Text c="#dcdcdc" size="lg" mt="sm">Reach out to your employer to receive an invite code/link to join and create a free account.</Text>
                                </Accordion.Panel>
                            </Accordion.Item>
                            {/* rovenas idea: make them answer a few questions then get recommended a plan. If they have no idea whats happening => FREE plan */}
                            <Accordion.Item className={classes.item} value="another-account">
                                <Accordion.Control className={classes.control}>Which plan should I choose?</Accordion.Control>
                                <Accordion.Panel className={classes.panel}>
                                    <Text c="#dcdcdc" size="lg" mt="sm">If you are unsure, start with the free plan and try it out.</Text>
                                    <Space h="lg"/>
                                    <Text c="#dcdcdc" size="lg">When your business grows, consider upgrading to a different plan with more features to suit your needs.</Text>
                                </Accordion.Panel>
                            </Accordion.Item>

                            <Accordion.Item className={classes.item} value="newsletter">
                                <Accordion.Control className={classes.control}>How can I sign up?</Accordion.Control>
                                <Accordion.Panel className={classes.panel}>
                                    <Text c="#dcdcdc" size="lg" mt="sm">For owners/employers, create a free account or choose a plan. Then invite your employees to join by giving them your invite code/link.</Text>
                                    <Space h="lg"/>
                                    <Text c="#dcdcdc" size="lg">For staff/employees, please contact your employer to receive an invite code/link to join and create a free account.</Text>
                                </Accordion.Panel>
                            </Accordion.Item>

                            <Accordion.Item className={classes.item} value="credit-card">
                                <Accordion.Control className={classes.control}>
                                    What is GPS geolocation time tracking?
                                </Accordion.Control>
                                <Accordion.Panel className={classes.panel}>
                                    <Text c="#dcdcdc" size="lg" mt="sm">GPS geolocation time tracking becomes operational only upon the user's authorization to utilize GPS technology for recording and monitoring employee locations.</Text>
                                    <Space h="lg"/>
                                    <Text c="#dcdcdc" size="lg">This feature is optional and serves to facilitate mandatory onsite time tracking for clocking in and out, ensuring compliance with company policies and regulations.</Text>
                                </Accordion.Panel>
                            </Accordion.Item>

                            <Accordion.Item className={classes.item} value="report-format">
                                <Accordion.Control className={classes.control}>What formats are the reports in?</Accordion.Control>
                                <Accordion.Panel className={classes.panel}>
                                    <Text c="#dcdcdc" size="lg" mt="sm">Reports can be downloaded as a PDF or a CSV file format.</Text>
                                    <Space h="lg"/>
                                    <Text c="#dcdcdc" size="lg">Generate daily, weekly, bi-weekly, monthly, quarterly, semi-annually and annually timesheet and payroll reports.</Text>
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    </Grid.Col>
                </Grid>
            </Container>
        </div>
    );
}