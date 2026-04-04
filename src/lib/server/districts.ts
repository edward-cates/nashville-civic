import { readFileSync } from 'fs';
import { join } from 'path';
import type { Representative } from '$lib/types';

interface DistrictProperties {
	DISTRICT: number;
	DistrictName: string;
	Representative: string;
	FirstName: string;
	LastName: string;
	Email: string;
	BusinessPhone: string;
	Website: string;
}

interface GeoJSONFeature {
	type: 'Feature';
	properties: DistrictProperties;
	geometry: {
		type: string;
		coordinates: number[][][] | number[][][][];
	};
}

interface GeoJSONCollection {
	type: 'FeatureCollection';
	features: GeoJSONFeature[];
}

let districtData: GeoJSONCollection | null = null;

function loadDistrictData(): GeoJSONCollection {
	if (districtData) return districtData;

	try {
		const filePath = join(process.cwd(), 'static', 'districts.geojson');
		const raw = readFileSync(filePath, 'utf-8');
		districtData = JSON.parse(raw);
		return districtData!;
	} catch {
		console.warn('districts.geojson not found — district lookup disabled');
		return { type: 'FeatureCollection', features: [] };
	}
}

// Ray casting algorithm for point-in-polygon
function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
	const [x, y] = point;
	let inside = false;

	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i][0], yi = polygon[i][1];
		const xj = polygon[j][0], yj = polygon[j][1];

		const intersect = ((yi > y) !== (yj > y))
			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

		if (intersect) inside = !inside;
	}

	return inside;
}

function pointInFeature(lng: number, lat: number, feature: GeoJSONFeature): boolean {
	const point: [number, number] = [lng, lat];

	if (feature.geometry.type === 'Polygon') {
		const coords = feature.geometry.coordinates as number[][][];
		return pointInPolygon(point, coords[0]);
	}

	if (feature.geometry.type === 'MultiPolygon') {
		const coords = feature.geometry.coordinates as number[][][][];
		return coords.some((polygon) => pointInPolygon(point, polygon[0]));
	}

	return false;
}

export interface DistrictResult {
	district: number;
	districtName: string;
	representative: Representative;
}

export function findDistrict(lat: number, lng: number): DistrictResult | null {
	const data = loadDistrictData();

	for (const feature of data.features) {
		if (pointInFeature(lng, lat, feature)) {
			const props = feature.properties;
			return {
				district: props.DISTRICT,
				districtName: props.DistrictName,
				representative: {
					name: props.Representative,
					office: `Metro Council — District ${props.DISTRICT}`,
					level: 'local',
					district: String(props.DISTRICT),
					email: props.Email || undefined,
					phone: props.BusinessPhone || undefined,
					website: props.Website || undefined
				}
			};
		}
	}

	return null;
}
