export interface Representative {
	name: string;
	office: string;
	level: 'local' | 'state' | 'federal';
	party?: string;
	district?: string;
	phone?: string;
	email?: string;
	website?: string;
	photoUrl?: string;
	address?: string;
	channels?: { type: string; id: string }[];
}

export interface GeocodingResult {
	lat: number;
	lng: number;
	displayName: string;
}

export interface CouncilDistrict {
	district: number;
	member?: Representative;
}

export interface LegistarPerson {
	PersonId: number;
	PersonFullName: string;
	PersonEmail: string;
	PersonPhone: string;
	PersonWWW: string;
	PersonAddress1: string;
	PersonCity1: string;
	PersonState1: string;
	PersonZip1: string;
	PersonActiveFlag: number;
}

export interface LegistarOfficeRecord {
	OfficeRecordId: number;
	OfficeRecordFullName: string;
	OfficeRecordTitle: string;
	OfficeRecordStartDate: string;
	OfficeRecordEndDate: string;
	OfficeRecordPersonId: number;
}

export interface CivicOfficial {
	name: string;
	party: string;
	phones?: string[];
	urls?: { value: string }[];
	emails?: string[];
	photoUrl?: string;
	channels?: { type: string; id: string }[];
	address?: { line1: string; city: string; state: string; zip: string }[];
}

export interface CivicOffice {
	name: string;
	divisionId: string;
	levels?: string[];
	officialIndices: number[];
}

export interface ContactFormData {
	senderName: string;
	senderEmail: string;
	subject: string;
	message: string;
	representativeName: string;
	representativeEmail: string;
	representativeLevel: string;
}
