import { locations } from "../../data/locations";
import LocationDetailsClient from "./LocationDetailsClient";

export async function generateStaticParams() {
    return locations.map(loc => ({ id: loc.id }));
}

export default async function LocationPage({ params }) {
    const { id } = await params;
    return <LocationDetailsClient id={id} />;
}
