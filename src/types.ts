/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeatherTelemetry {
  temperature: number;      // °C
  humidity: number;         // %
  windSpeed: number;        // km/h
  rainProbability: number;  // %
}

export interface CostBreakdown {
  organicPerAcre: number;
  organicBreakdown: string[];
  chemicalPerAcre: number;
  chemicalBreakdown: string[];
}

export interface CropDiagnosticReport {
  id: string;
  cropName: string;
  diseaseName: string;
  severity: "Low" | "Medium" | "High";
  technicalExplanation: string;
  treatmentOrganic: string[];
  treatmentChemical: string[];
  summaryEnglish: string;
  summaryTelugu: string;
  date: string;
  imageUrl: string; // Base64 or local path
  detectedRegion?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  weatherTelemetry?: WeatherTelemetry;
  spraySafetyIndex?: string;
  treatmentCosts?: CostBreakdown;
}

export interface SampleCrop {
  id: string;
  name: string;
  disease: string;
  imageUrl: string;
  description: string;
}
