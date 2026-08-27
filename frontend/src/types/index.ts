export interface User {
  id: number;
  username: string;
  email: string;
  role: 'FARMER' | 'VETERINARIAN' | 'GOVERNMENT' | 'GOVT_OFFICIAL' | 'LABORATORY' | 'LAB_TECHNICIAN' | 'ADMIN';
  createdAt: string;
}

export interface Farm {
  id: number;
  name: string;
  farmerId: number;
  village: string;
  block: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  totalAnimals: number;
}

export interface Animal {
  id: number;
  tagNumber: string;
  species: string;
  breed: string;
  gender: string;
  age: number;
  farmId: number;
  status: string;
}

export interface DiseaseCase {
  id: number;
  caseNumber: string;
  animalId: number;
  animal?: Animal;
  farm?: Farm;
  reportedBy: number;
  symptoms: string[];
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'CONFIRMED' | 'RECOVERED' | 'DECEASED';
  riskScore: number;
  latitude: number;
  longitude: number;
  village: string;
  block: string;
  district: string;
  reportedAt: string;
  updatedAt: string;
}

export interface Vaccination {
  id: number;
  animalId: number;
  animal?: Animal;
  vaccineName: string;
  batchNumber: string;
  administeredBy: string;
  administeredAt: string;
  nextDoseDate?: string;
}

export interface Alert {
  id: number;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  type: 'OUTBREAK' | 'RISK' | 'VACCINATION' | 'GENERAL';
  latitude: number;
  longitude: number;
  district: string;
  isRead: boolean;
  createdAt: string;
}

export interface LabSample {
  id: number;
  sampleNumber: string;
  caseId: number;
  case?: DiseaseCase;
  sampleType: string;
  status: 'COLLECTED' | 'IN_TRANSIT' | 'RECEIVED' | 'TESTING' | 'COMPLETED';
  result?: 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE';
  diseaseDetected?: string;
  testedAt?: string;
  collectedAt: string;
}

export interface RiskZone {
  id: number;
  clusterId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  caseCount: number;
  affectedVillages: string[];
  primarySymptoms: string[];
  caseGrowthPercent: number;
  detectedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}
