import { useState } from 'react';
import * as Location from 'expo-location';

export const useLocation = () => {
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getLocation = async () => {
        setLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            setLoading(false);
            return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setLocation({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
        });
        setLoading(false);
    };

    return { location, errorMsg, loading, getLocation };
};