import { Grid, Paper, Select, Space, Table, TextInput, Text, useCombobox, Combobox, Stack } from "@mantine/core";
import DayCheckboxes from "../DayCheckboxes";
import { IndustryData, countryData, employeeCountData, canadaProvinceData, timezoneData, usaStateData } from "../../helpers/SelectData";
import classes from '../../css/TextInput.module.css';
import { useEffect, useState } from "react";
import { TimeInputSelectBase } from "../TimeInputSelectBase";
import { useForm } from "@mantine/form";
import { isNullOrEmpty } from "../../helpers/Helpers";
import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';
import L from "leaflet";
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import LocationSearch from "../LocationSearch";
import { GetGeoApifyData } from "../../helpers/Api";
import { useAuth } from "../../authentication/SupabaseAuthContext";
//require('dotenv').config();
if (typeof window === 'undefined') {
    require('dotenv').config();
}

interface BusinessContactForm {
    handleFormChanges: (form: any) => void; // send back form data to parent
}

interface Response {
    data: any;
}

export interface ContactFormFields {
    street: string;
    street_2: string;
    city: string;
    province: string;
    country: string;
    country_code: string;
    postal_code: string;
    contact_number: string;
    email: string;
    lon: string;
    lat: string;
    timezone: string;
}

// Simple address search ("Lessingstraße 3, Regensburg"):
// https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/#quick-start
// https://api.geoapify.com/v1/geocode/autocomplete?text=Lessingstra%C3%9Fe%203%2C%20Regensburg&format=json&apiKey=YOUR_API_KEY


// TODO GET MAP WORKING: https://jsfiddle.net/Geoapify/jsgw53z8/


// const GeoapifyApiKey = "09c676a64439453ba2380eab97232940";
// document.addEventListener('DOMContentLoaded', () => {
//     // Your TypeScript code that depends on the DOM should go here
//     const autocompleteElement = document.getElementById("autocomplete");
//     if (autocompleteElement && GeoapifyApiKey) {
//         const autocomplete = new GeocoderAutocomplete(
//             autocompleteElement,
//             GeoapifyApiKey, // https://apidocs.geoapify.com/
//         );

//         // The Leaflet map Object
//         const map = L.map('map', { zoomControl: false }).setView([38.908838755401035, -77.02346458179596], 12);

//         // Retina displays require different mat tiles quality
//         const isRetina = L.Browser.retina;

//         const baseUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GeoapifyApiKey}`;
//         const retinaUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey=${GeoapifyApiKey}`;

//         // Add map tiles layer. Set 20 as the maximal zoom and provide map data attribution.
//         interface CustomTileLayerOptions extends L.TileLayerOptions {
//             apiKey: string;
//         }

//         const tileLayerOptions: CustomTileLayerOptions = {
//             attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors',
//             apiKey: GeoapifyApiKey != undefined ? GeoapifyApiKey : "",
//             maxZoom: 20,
//             id: 'osm-bright'
//         };

//         L.tileLayer(isRetina ? retinaUrl : baseUrl, tileLayerOptions).addTo(map);

//         // add a zoom control to bottom-right corner
//         L.control.zoom({
//             position: 'bottomright'
//         }).addTo(map);

//         // generate an marker icon with https://apidocs.geoapify.com/playground/icon
//         const markerIcon = L.icon({
//             iconUrl: `https://api.geoapify.com/v1/icon/?type=awesome&color=%232ea2ff&size=large&scaleFactor=2&apiKey=${GeoapifyApiKey}`,
//             iconSize: [38, 56], // size of the icon
//             iconAnchor: [19, 51], // point of the icon which will correspond to marker's location
//             popupAnchor: [0, -60] // point from which the popup should open relative to the iconAnchor
//         });

//         let marker: L.Marker<any>;
//         autocomplete.on('select', (location) => {
//             // Add marker with the selected location
//             if (marker) {
//                 marker.remove();
//             }

//             if (location) {
//                 marker = L.marker([location.properties.lat, location.properties.lon], {
//                     icon: markerIcon
//                 }).addTo(map);

//                 map.panTo([location.properties.lat, location.properties.lon]);

//             }
//         });

//     } else {
//         console.error("Element with ID 'autocomplete' not found.");
//     }
// });

export default function BusinessContactForm(props: BusinessContactForm) {
    const { user, session } = useAuth();
    const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
    const [value, setValue] = useState('');
    const [selectedAutocompleteOption, setSelectedAutocompleteOption] = useState(-1);
    const [geoApifyResponse, setGeoApifyResponse] = useState<Response | null>(null);
    //const GeoapifyApiKey = process.env.GEOAPIFY_API_KEY;

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const comboboxOptions = autocompleteOptions.map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    //setup props
    const handleFormChangesProp = props.handleFormChanges;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            street: '',
            street_2: '',
            city: '',
            province: '',
            country: '',
            country_code: '',
            postal_code: '',
            contact_number: '',
            email: '',
            lon: '',
            lat: '',
            timezone: '',
            section: 'business_contact_info',
        },
        validate: (value) => {
            return {
                street: value.street.trim().length <= 0 ? 'Address is required' : null,
                city: value.city.trim().length <= 0 ? 'Address is required' : null,
                province: value.province.trim().length <= 0 ? 'Address is required' : null,
                country: value.country.trim().length <= 0 ? 'Address is required' : null,
                postal_code: value.postal_code.length <= 0 ? 'Address is required' : null,
                contact_number: value.contact_number.length <= 0 ? 'Contact number is required' : null,
                //email: value.business_contact_info.email.trim().length <= 0 && !value.business_contact_info.email.includes('@') ? 'Email is required' : null,
            }
        },
        onValuesChange: (values) => {
            handleFormChangesProp(values);
        },
    });

    // detect form updates and send back form data to parent
    // useEffect(() => {
    //     handleFormChangesProp(form);
    // },[form]);

    // run when selected option changes
    useEffect(() => {
        if (selectedAutocompleteOption > -1 && geoApifyResponse) {
            var addressData = geoApifyResponse?.data.features[selectedAutocompleteOption].properties;
            if (addressData != undefined) {
                // fill form with data from geoapify response
                form.setFieldValue('street', addressData.housenumber + " " + addressData.street);
                form.setFieldValue('city', addressData.city);
                form.setFieldValue('postal_code', addressData.postcode);
                form.setFieldValue('province', addressData.state);
                form.setFieldValue('country', addressData.country);
                form.setFieldValue('country_code', addressData.country_code);
                form.setFieldValue('timezone', addressData.timezone.abbreviation_STD + addressData.timezone.offset_STD + " " + addressData.timezone.name);
                
                // get location data
                form.setFieldValue('lon', addressData.lon);
                form.setFieldValue('lat', addressData.lat);
                //handleFormChangesProp(form);
            }
        }
    }, [selectedAutocompleteOption])


    // on (space or enter) key press, fetch geoapify data for current value
    // https://api.geoapify.com/v1/geocode/autocomplete?text={address}&apiKey={key}&limit=5
    const handleKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if ((event.key === ' ' || event.key === 'Enter') && value.trim().length > 0 && user) {
            //console.log('Fetch geoapify');
            var addressData = await GetGeoApifyData(value);
            setGeoApifyResponse({ data: addressData });

            // foreach address get the address_line1 and address_line2
            var addressList: string[] = [];
            addressData.features.forEach((element: { properties: { address_line1: any, address_line2: any }; }) => {
                addressList.push(element.properties.address_line1 + " " + element.properties.address_line2);
            });
            setAutocompleteOptions(addressList);
        }
    };
    

    return (
        <>
            {/* <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background: "#25352F", color: "white" }}> */}
                <Grid>
                    <Grid.Col span={{ base: 12 }} mb="lg">
                        <Text size="xl" fw={600} mb="lg">Please provide accurate contact information regarding your organization.</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        {/* <div id="map"></div>
                        <div className="autocomplete-panel">
                            <div id="autocomplete" className="autocomplete-container"></div>
                        </div> */}
                        
                        <Stack>
                            <Combobox
                                onOptionSubmit={(optionValue) => {
                                    setValue(optionValue);
                                    combobox.closeDropdown();
                                    setSelectedAutocompleteOption(autocompleteOptions.indexOf(optionValue));
                                    //console.log("Selected index:", autocompleteOptions.indexOf(optionValue));
                                }}
                                store={combobox}
                                size="lg"
                                classNames={classes}
                            >
                                <Combobox.Target>
                                    <TextInput
                                        label="Business address"
                                        placeholder="Business address physical location"
                                        size="lg"
                                        value={value}
                                        onChange={(event) => {
                                            setValue(event.currentTarget.value);
                                            combobox.openDropdown();
                                        }}
                                        onClick={() => combobox.openDropdown()}
                                        onFocus={() => combobox.openDropdown()}
                                        onBlur={() => combobox.closeDropdown()}
                                        onKeyDown={handleKeyPress}
                                        classNames={classes}
                                    />
                                </Combobox.Target>

                                <Combobox.Dropdown>
                                    <Combobox.Options>
                                        {comboboxOptions.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> : comboboxOptions}
                                    </Combobox.Options>
                                </Combobox.Dropdown>
                            </Combobox>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            required
                            id="contact-number"
                            label="Contact number"
                            name="contact_number"
                            placeholder="Business contact number"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('contact_number')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            id="email"
                            label="Email address"
                            name="email"
                            placeholder="Email address"
                            size="lg"
                            classNames={classes}
                            {...form.getInputProps('email')}
                        />
                    </Grid.Col>
                </Grid>
            {/* </Paper> */}
        </>
    );
}