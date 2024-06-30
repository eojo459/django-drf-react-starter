import { Avatar, Badge, Button, Grid, Group, Loader, Modal, Stack, Table, Text, Title } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { GetUserInfoByUid, getUserById } from '../helpers/Api';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { ProfileHeader } from './ProfileHeader';
import { UserProfileModel } from './UserProfile';
import classes from "../css/UserProfileModal.module.css";
import { TimesheetDataReview } from '../pages/staff-dashboard/timesheet';
import TileLayer from 'ol/layer/Tile';
import { Collection, Feature, Map as OLMap, Overlay, View } from 'ol';
import { OSM } from 'ol/source';
import positionMarker from '../../src/assets/geolocation_marker.png';
import locationMarker from '../../src/assets/geolocation_location_marker.png';
import {fromLonLat} from 'ol/proj.js';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle, Point } from 'ol/geom';
import { Icon, Style } from 'ol/style';
import { State } from 'ol/View';
//import { getStatusColor } from '../../../helpers/Helpers';

interface GeolocationModal {
    modalOpened: boolean;
    isMobile: boolean;
    userPosition: Coordinate; // [lat,lon]
    connectionLoading: boolean;
    closeModal: () => void;
    submitClicked: () => void;
    refreshClicked: () => void;
    handleMapLoaded: () => void;
    accuracyFeature: any;
    olMap: OLMap;
}

interface MapOptions {
    layers: any[]; 
    view: any; 
    target: string | HTMLElement | undefined;
    //overlays: any[] | Collection<Overlay> | undefined;
}

export default function GeolocationModal(props: GeolocationModal) {
    const { user, session } = useAuth(); 
    const [ userData, setUserData ] = useState<UserProfileModel | null>(null);
    const [ loading, setLoading ] = useState(true);
    const [refreshCount, setRefreshCount] = useState(0);
    
    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    //const userUidProp = props.userUid;
    const handleSubmitClickedProp = props.submitClicked;
    const handleRefreshClickedProp = props.refreshClicked;
    const handleMapLoadedProp = props.handleMapLoaded;
    const userPositionProp = props.userPosition;
    const accuracyFeatureProp = props.accuracyFeature;
    const olMapProp = props.olMap;
    const connectionLoadingProp = props.connectionLoading;

    const ref = useRef<HTMLDivElement>(null);
    const mapRef = useRef<OLMap | null>(null);

    // Increment refresh count to force state change and map re-render on refresh
    const refreshClicked = () => {
        setRefreshCount(prevCount => prevCount + 1);
        setLoading(true);
    };

    function initializeMap() {
        if (user) {
            //console.log("Map is mounting!");
            // user location point marker
            const userPositionIconFeature = new Feature({
                geometry: new Point(fromLonLat(userPositionProp)),
            });
            const iconStyle = new Style({
                image: new Icon({
                    //anchor: userPositionProp,
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: positionMarker,
                }),
            });
            userPositionIconFeature.setStyle(iconStyle);

            // designated work location point marker
            const locationPositionIconFeature = new Feature({
               geometry: new Point(fromLonLat([parseFloat(user?.business_info[0]?.lon), parseFloat(user?.business_info[0]?.lat)])),
               //geometry: new Circle(fromLonLat(userPositionProp), 30),
            });
            const locationIconStyle = new Style({
                image: new Icon({
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: locationMarker,
                }),
            });
            locationPositionIconFeature.setStyle(locationIconStyle);

            // create 30m radius (60m diameter) circle around designated location point
            // TODO may be configurable by businesses individually
            const circleFeature = new Feature({
                geometry: new Circle(fromLonLat([parseFloat(user?.business_info[0]?.lon), parseFloat(user?.business_info[0]?.lat)]), 30),
                //geometry: new Circle(fromLonLat(userPositionProp), 30),
            });
            circleFeature.setStyle(
                new Style({
                    renderer(coordinates: any, state) {
                        const [[x, y], [x1, y1]] = coordinates;
                        const ctx = state.context;
                        const dx = x1 - x;
                        const dy = y1 - y;
                        const radius = Math.sqrt(dx * dx + dy * dy);
                        const innerRadius = 0;
                        const outerRadius = radius * 1.4;
                        const gradient = ctx.createRadialGradient(
                            x,
                            y,
                            innerRadius,
                            x,
                            y,
                            outerRadius,
                        );
                        gradient.addColorStop(0, 'rgba(255,0,0,0)');
                        gradient.addColorStop(0.6, 'rgba(255,0,0,0.2)');
                        gradient.addColorStop(1, 'rgba(255,0,0,0.8)');
                        ctx.beginPath();
                        ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
                        ctx.fillStyle = gradient;
                        ctx.fill();
                        ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
                        ctx.strokeStyle = 'rgba(255,0,0,1)';
                        ctx.stroke();
                    },
                }),
            );

            // build the openlayers openstreet map - https://openlayers.org/
            if (ref.current) {
                const options: MapOptions = {
                    layers: [
                        new TileLayer({ source: new OSM() }),
                        new VectorLayer({
                            source: new VectorSource({
                                features: [
                                    userPositionIconFeature,
                                    accuracyFeatureProp,
                                    locationPositionIconFeature,
                                    circleFeature,
                                ],
                            }),
                        }),
                    ],
                    view: new View({ center: fromLonLat(userPositionProp), zoom: 15 }),
                    target: ref.current,
                };

                if (mapRef.current) {
                    mapRef.current.setTarget(undefined); // destroy the old map if any
                }
                mapRef.current = new OLMap(options);
                mapRef.current.renderSync();
                
                setLoading(false);
                handleMapLoadedProp();
                
                console.log("Map is loaded!");
                //handleSubmitClickedProp(mapRef.current);
            }
            //setLoading(false);
        }
    }

    // when these change re-initialize the map 
    useEffect(() => {
        initializeMap();
    }, [modalOpenedProp, userPositionProp, refreshCount]);

    // after 3 seconds run this function to refresh map to make sure it has loaded
    useEffect(() => {
        if (modalOpenedProp) {
            const timeout = setTimeout(() => {
                refreshClicked();
            }, 1500);

            return () => clearTimeout(timeout);
        }
    }, [modalOpenedProp]);

    // return the modal
    return (
        <>
            <Modal
                title={<Text c="#dcdcdc" size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Geolocation Verification</Text>}
                opened={modalOpenedProp}
                onClose={closeModalProp}
                fullScreen={isMobileProp}
                size="lg"
                radius="md"
                //withCloseButton={false}
                classNames={classes}
                transitionProps={{ transition: 'fade', duration: 200 }}
            >
                <Grid c="#dcdcdc">
                    <Grid.Col span={{ base: 12 }}>
                        <Text size="xl" fw={600} style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}>Please ensure that your device's location services is enabled and that location permissions are granted.</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        {mapRef && ( // Check if map is loaded
                            <div ref={ref} id="map" style={{ width:"100%", height:"400px"}}>
                                {loading && ( 
                                    <Group justify="center">
                                        <Loader mt="200px"/>
                                    </Group>
                                )}
                            </div>
                        )}

                        
                        {/* <div ref={ref} id="map" style={{ width:"100%", height:"400px"}}></div> */}
                        {/* {ref.current !== null && ( // Check if map is loaded
                            <div ref={ref} id="map" style={{ width:"100%", height:"400px"}}></div>
                        )}
                        {ref.current === null && loading && ( // Check if map is still loading
                            <Loader/>
                        ) } */}
                        
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }} mt="lg">
                        <Button 
                            id="clock-in-geolocation-btn"
                            size="lg" 
                            radius="md" 
                            color="#316F22"
                            disabled={connectionLoadingProp}
                            fullWidth
                            onClick={handleSubmitClickedProp}
                        >
                            I am onsite. Clock in
                        </Button>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }} mt="lg">
                        <Button 
                            id="clock-in-geolocation-btn"
                            size="lg" 
                            radius="md" 
                            color="#316F22"
                            fullWidth
                            onClick={() => {
                                refreshClicked();
                                handleRefreshClickedProp();
                                //setLoading(true);
                            }}
                        >
                            Refresh
                        </Button>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }} mt="lg">
                        <Group justify="end">
                            <Button
                                size="lg"
                                radius="md"
                                color="#6C221F"
                                fullWidth
                                onClick={() => closeModalProp()}
                            >
                                Cancel
                            </Button>
                        </Group>
                    </Grid.Col>
                </Grid>
                
            </Modal>
        </>
    );
}