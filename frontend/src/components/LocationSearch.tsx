import React from 'react';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';


// %20 = space
// https://api.geoapify.com/v1/geocode/autocomplete?text=20%20bedfield%20close&apiKey=b8568cb9afc64fad861a69edbddb2658&limit=5
// https://api.geoapify.com/v1/geocode/autocomplete?text=20%20bedfield%20close&apiKey=09c676a64439453ba2380eab97232940&limit=5&lang=en


// TODO https://apidocs.geoapify.com/docs/geocoding/batch/#api
export default function LocationSearch() {

    function onPlaceSelect(value: any) {
        console.log("Selected:" + value);
        // Handle place selection
    }

    function onSuggestionChange(value: any) {
        console.log("CHANGED:" + value);
        // Handle suggestion change
    }

    return (
        <GeoapifyContext apiKey="">
            <GeoapifyGeocoderAutocomplete
                placeholder="Enter address here"
                //type="city" // Example type
                lang="en" // Example language
                //position="top-left" // Example position
                //countryCodes="us" // Example country codes
                limit={5} // Example limit
                value="" // Example value
                placeSelect={onPlaceSelect}
                suggestionsChange={onSuggestionChange}
            />
        </GeoapifyContext>
    );
};
