import { Group, Avatar, Text, Accordion, Tabs, Fieldset, Switch, Space } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { BusinessProfile } from '../pages/owner-dashboard/business/components/CentreInformation';
import { ParentProfile } from '../pages/owner-dashboard/parents/parent-profile';
import { getBusinessByOwnerId, getBusinesses, getChildInBusinessId, getStaffInBusinessId, getStaffs } from '../helpers/Api';
import { OwnerProfile } from '../pages/owner-dashboard/business/owner/owner-profile';
import { Icon, IconBuildingStore } from '@tabler/icons-react';
import { findBusinessNameById } from '../helpers/Helpers';
import { AuthContext } from '../authentication/AuthContext';
import { StaffProfile } from '../pages/owner-dashboard/staff/StaffAttendance';

const charactersList = [
    {
        id: 'bender',
        image: 'https://img.icons8.com/clouds/256/000000/futurama-bender.png',
        label: 'Bender Bending Rodríguez',
        description: 'Fascinated with cooking, though has no sense of taste',
        content: "Bender Bending Rodríguez, (born September 4, 2996), designated Bending Unit 22, and commonly known as Bender, is a bending unit created by a division of MomCorp in Tijuana, Mexico, and his serial number is 2716057. His mugshot id number is 01473. He is Fry's best friend.",
    },

    {
        id: 'carol',
        image: 'https://img.icons8.com/clouds/256/000000/futurama-mom.png',
        label: 'Carol Miller',
        description: 'One of the richest people on Earth',
        content: "Carol Miller (born January 30, 2880), better known as Mom, is the evil chief executive officer and shareholder of 99.7% of Momcorp, one of the largest industrial conglomerates in the universe and the source of most of Earth's robots. She is also one of the main antagonists of the Futurama series.",
    },

    {
        id: 'homer',
        image: 'https://img.icons8.com/clouds/256/000000/homer-simpson.png',
        label: 'Homer Simpson',
        description: 'Overweight, lazy, and often ignorant',
        content: 'Homer Jay Simpson (born May 12) is the main protagonist and one of the five main characters of The Simpsons series(or show). He is the spouse of Marge Simpson and father of Bart, Lisa and Maggie Simpson.',
    },
];

interface AccordionLabelProps {
    label: string;
    //description: string;
}

function AccordionLabel({ label }: AccordionLabelProps) {
    return (
        <Group wrap="nowrap">
            <IconBuildingStore/>
            <div>
                <Text>{label}</Text>
                {/* <Text size="sm" c="dimmed" fw={400}>
                    {description}
                </Text> */}
            </div>
        </Group>
    );
}

export function AccordionDropdown() {
    const [businessData, setBusinessData] = useState<BusinessProfile[]>([]);
    const [ownerData, setOwnerData] = useState<OwnerProfile>();
    const [staffData, setStaffData] = useState<StaffProfile[]>([]);
    const [parentData, setParentData] = useState<ParentProfile[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>('first');
    const [strictModeChecked, setStrictModeChecked] = useState(false);
    const [geoStrictModeChecked, setGeoStrictModeChecked] = useState(false);
    let {authTokens}: any = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (ownerData?.owner_id) {
                    const data = await getBusinessByOwnerId(ownerData?.owner_id, authTokens);
                    setBusinessData(data);
                }
                // else {
                //     const data = await getBusinessByOwnerId(1, authTokens);
                //     setBusinessData(data);
                // }
            } catch (error) {
                // Handle errors here
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []); 
    


    const items = businessData?.map((item) => (
        <Accordion.Item value={item.id.toString()} key={item.id}>
            <Accordion.Control>
                <AccordionLabel label={item.name}  />
            </Accordion.Control>
            <Accordion.Panel>
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List>
                        <Tabs.Tab value="first">Business settings</Tabs.Tab>
                        <Tabs.Tab value="second">Staff</Tabs.Tab>
                        <Tabs.Tab value="third">Users</Tabs.Tab>
                        <Tabs.Tab value="fourth">Parents</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="first">
                        <Text size="md" style={{ marginTop: "20px" }}>
                            Optional rule enforcement
                        </Text>
                        <Fieldset
                            style={{
                                maxWidth: "400px",
                                marginTop: "15px",
                                marginBottom: "10px",
                                padding: "25px",
                            }}
                            radius="md"
                        >
                            <Group justify="space-between">
                                <Text size="md">Strict mode</Text>
                                <Switch
                                    size="lg"
                                    checked={strictModeChecked}
                                    onChange={(event) =>
                                        setStrictModeChecked(event.currentTarget.checked)
                                    }
                                />
                            </Group>
                            <Space h="md" />
                            <Group justify="space-between">
                                <Text size="md">Geolocation strict mode</Text>
                                <Switch
                                    size="lg"
                                    checked={geoStrictModeChecked}
                                    onChange={(event) =>
                                        setGeoStrictModeChecked(event.currentTarget.checked)
                                    }
                                />
                            </Group>
                        </Fieldset>
                    </Tabs.Panel>
                    <Tabs.Panel value="second">Staff panel</Tabs.Panel>
                    <Tabs.Panel value="third">Users panel</Tabs.Panel>
                    <Tabs.Panel value="fourth">Parents panel</Tabs.Panel>
                </Tabs>
                {/* <Text size="sm">{item.content}</Text> */}
            </Accordion.Panel>
        </Accordion.Item>
    ));

    return (
        <Accordion 
            chevronPosition="right" 
            variant="contained" 
            multiple
            //defaultValue={[businessData[0]?.business_id.toString(), businessData[1]?.business_id.toString()]}
            defaultValue={['1']}
        >
            {items}
        </Accordion>
    );
}