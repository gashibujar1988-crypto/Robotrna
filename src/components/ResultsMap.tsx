import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';

declare global {
    interface Window {
        google: any;
    }
}

interface PlaceResult {
    name: string;
    address: string;
    rating?: number;
    link?: string;
    location?: { lat: number; lng: number }; // We might need to fetch geometry
}

const ResultsMap = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [places, setPlaces] = useState<PlaceResult[]>([]);
    const mapRef = useRef<HTMLDivElement>(null);
    const internalMap = useRef<any>(null);
    const markers = useRef<any[]>([]);

    useEffect(() => {
        const handleShowMap = (event: CustomEvent) => {
            console.log("Map Event Received:", event.detail);
            setPlaces(event.detail.places || []);
            setIsVisible(true);
        };

        window.addEventListener('SHOW_MAP_RESULTS' as any, handleShowMap);
        return () => window.removeEventListener('SHOW_MAP_RESULTS' as any, handleShowMap);
    }, []);

    useEffect(() => {
        if (isVisible && mapRef.current && window.google) {
            if (!internalMap.current) {
                internalMap.current = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 59.9139, lng: 10.7522 }, // Default Oslo
                    zoom: 12,
                    styles: [ // Dark mode style
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        {
                            featureType: "administrative.locality",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        // ... more styles can be added
                    ],
                    disableDefaultUI: true,
                });
            }

            // Clear old markers
            markers.current.forEach(m => m.setMap(null));
            markers.current = [];

            const bounds = new window.google.maps.LatLngBounds();

            places.forEach((place) => {
                // Geocode if location missing (Simulated for now if API doesn't return lat/lng directly)
                // Ideally the API returns location. 
                // For this demo, we might need to use the geocoder or just random offset if location missing
                // NOTE: The Place Search response usually has geometry.location.
                // We'll assume the client passes it or we geocode.

                // If we don't have lat/lng, we'll try to geocode based on address or name
                if (place.location) {
                    const marker = new window.google.maps.Marker({
                        position: place.location,
                        map: internalMap.current,
                        title: place.name,
                        animation: window.google.maps.Animation.DROP,
                    });
                    markers.current.push(marker);
                    bounds.extend(place.location);
                } else {
                    // Fallback Geocoding
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ address: place.address || place.name }, (results: any, status: any) => {
                        if (status === 'OK' && results[0]) {
                            const loc = results[0].geometry.location;
                            const marker = new window.google.maps.Marker({
                                position: loc,
                                map: internalMap.current,
                                title: place.name
                            });
                            markers.current.push(marker);
                            bounds.extend(loc);
                            internalMap.current.fitBounds(bounds);
                        }
                    });
                }
            });

            if (places.length > 0) {
                // Fit bounds after a delay to allow geocoding
                setTimeout(() => {
                    if (internalMap.current) internalMap.current.fitBounds(bounds);
                }, 1000);
            }
        }
    }, [isVisible, places]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <div className="relative w-full max-w-4xl h-[600px] bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">

                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                            <div className="flex items-center gap-2 pointer-events-auto">
                                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                                    <MapPin className="text-orange-400 w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Hunter's Map View</h3>
                                    <p className="text-gray-400 text-xs">{places.length} leads fundna</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Map Container */}
                        <div ref={mapRef} className="w-full h-full" />

                        {/* List Overlay (Bottom) */}
                        <div className="absolute bottom-4 left-4 right-4 flex gap-4 overflow-x-auto pb-2 pointer-events-auto">
                            {places.map((place, i) => (
                                <div key={i} className="min-w-[200px] bg-black/80 border border-white/10 p-3 rounded-lg backdrop-blur-md">
                                    <h4 className="text-white font-medium text-sm truncate">{place.name}</h4>
                                    <p className="text-gray-400 text-xs truncate">{place.address}</p>
                                    {place.rating && (
                                        <div className="mt-1 flex items-center gap-1">
                                            <span className="text-yellow-400 text-xs">★</span>
                                            <span className="text-gray-300 text-xs">{place.rating}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ResultsMap;
