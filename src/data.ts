/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CropDiagnosticReport } from "./types";

export interface SampleCropData {
  id: string;
  name: string;
  scientificName: string;
  disease: string;
  severity: "Low" | "Medium" | "High";
  imageUrl: string;
  description: string;
  report: CropDiagnosticReport;
}

export const SAMPLE_CROPS: SampleCropData[] = [
  {
    id: "sample-rice-blast",
    name: "Rice (వరి)",
    scientificName: "Oryza sativa",
    disease: "Rice Blast (వరి అగ్గితెగులు)",
    severity: "High",
    imageUrl: "/src/assets/images/rice_blast_leaf_1779785105714.png",
    description: "Spindle-shaped leafy lesions with necrotic dark-brown borders and grey center. Rapidly spreading across local paddy fields.",
    report: {
      id: "report-rice-blast-static",
      cropName: "Rice (వరి - Oryza sativa)",
      diseaseName: "Rice Blast / వరి అగ్గితెగులు (Magnaporthe oryzae)",
      severity: "High",
      technicalExplanation: "Rice Blast is caused by the fungal pathogen Magnaporthe oryzae (Pyricularia oryzae). The fungus attacks all aboveground parts, most severely leaves (showing classic spindle-shaped spots) and node necks. It flourishes under high humidity, low night temperatures, and excessive nitrogenous fertilizer application.",
      treatmentOrganic: [
        "Avoid excessive urea/nitrogen applications; use compost to balance fertilizer absorption.",
        "Spray organic Neem oil (3% dilution ratio) or Trichoderma viride formulations on leaves at 10-day intervals.",
        "Proper plant spacing (20x15cm) to ensure ample sunlight and reduced humidity in the canopy.",
        "Completely destroy and burn crop residues after harvest to clear fungal spores."
      ],
      treatmentChemical: [
        "Apply Tricyclazole 75% WP @ 0.6 grams per liter of water.",
        "Or, spray Kasugamycin 2% @ 1.5 ml per liter of water as a systemic fungicide.",
        "Ensure spraying is carried out during early morning hours to avoid spray evaporation."
      ],
      summaryEnglish: "The rice crop exhibits severe symptoms of Rice Blast fungus. Recommended steps include imediate suspension of nitrogen fertilizers, spraying Tricyclazole, and improving field ventilation.",
      summaryTelugu: "వరి పంట నివారణకు నత్రజని (యూరియా) ఎరువుల వాడకాన్ని వెంటనే తగ్గించాలి. లీటర్ నీటికి 0.6 గ్రా చొప్పున ట్రైసైక్లాజోల్ (Tricyclazole 75% WP) పొడిని మరియు ట్రైకోడెర్మా విరిడి వంటి జీవ నివారణల మందును పిచికారీ చేయడం ద్వారా ఈ అగ్గి తెగులును సమర్థవంతంగా అరికట్టవచ్చు.",
      date: "2026-05-26",
      imageUrl: "/src/assets/images/rice_blast_leaf_1779785105714.png",
      detectedRegion: "Chebrolu Sector",
      gpsLatitude: 16.2045,
      gpsLongitude: 80.5218,
      weatherTelemetry: {
        temperature: 28.5,
        humidity: 88,
        windSpeed: 6.2,
        rainProbability: 25
      },
      spraySafetyIndex: "Safe — Low Wind & Mild Rain Probability",
      treatmentCosts: {
        organicPerAcre: 550,
        organicBreakdown: [
          "Organic leaf composting additions - ₹200",
          "Concentrated neem seed extracts - ₹250",
          "Foliar dry spacing labor - ₹100"
        ],
        chemicalPerAcre: 1100,
        chemicalBreakdown: [
          "Systemic Tricyclazole WP pack - ₹700",
          "Farming spraying operator charge - ₹300",
          "Liquid surfactant formula - ₹100"
        ]
      }
    }
  },
  {
    id: "sample-tomato-blight",
    name: "Tomato (టమాటా)",
    scientificName: "Solanum lycopersicum",
    disease: "Late Blight (మచ్చ తెగులు / లేట్ బ్లైట్)",
    severity: "Medium",
    imageUrl: "/src/assets/images/tomato_blight_leaf_1779785137160.png",
    description: "Large, dark, water-soaked brown leaf patches with subtle white fuzzy fungal growth on bottom edges. Active during cool wet monsoon climates.",
    report: {
      id: "report-tomato-blight-static",
      cropName: "Tomato (టమాటా - Solanum lycopersicum)",
      diseaseName: "Late Blight / ටැක්ස් බ్లైట్ (Phytophthora infestans)",
      severity: "Medium",
      technicalExplanation: "Late Blight is caused by the oomycete Phytophthora infestans. It is a highly destructive disease that causes rapid defoliation and fruit decay. The pathogen thrives in cool, wet environments, spreading actively via wind-borne sporangia that germinate on wet leaf surfaces.",
      treatmentOrganic: [
        "Prune the lower leaves to improve airflow and lift leaves away from splash soil.",
        "Apply copper-based organic fungicides (e.g. Bordeaux mixture 1% concentration) to organic crops.",
        "Transition field watering to drip irrigation instead of sprinkler systems to keep crop leaves dry.",
        "Rotate crops with non-solanaceous options (like beans or carrots) in subsequent seasons."
      ],
      treatmentChemical: [
        "Spray Metalaxyl 8% + Mancozeb 64% WP @ 1.5 grams/liter of water.",
        "Or, spray Cymoxanil + Mancozeb @ 2 ml/liter of water during cool weather margins.",
        "Apply as a uniform, fine spray covering both the upper and lower surfaces of active plant leaf tissue."
      ],
      summaryEnglish: "Tomato Late Blight detected at medium severity. Direct actions involve pruning lower leaves, shifting to dry soil watering, and application of a copper-based or systemic fungicide spray.",
      summaryTelugu: "ఈ పంట లేట్ బ్లైట్ (మచ్చ తెగులు) తో బాధపడుతోంది. నివారణకు పొలంలో తేమను తగ్గించి, మొక్కల క్రింది ఆకులను కత్తిరించాలి. లీటరు నీటికి బోర్డో మిశ్రమాన్ని (1%) లేదా మెటాలాక్సిల్ + మాంకోజెబ్ (Metalaxyl + Mancozeb @ 1.5 గ్రా) వేసి ఆకులపై పిచికారీ చేయడం వల్ల ఈ తెగులును తగ్గించవచ్చు.",
      date: "2026-05-26",
      imageUrl: "/src/assets/images/tomato_blight_leaf_1779785137160.png",
      detectedRegion: "Tenali Farm Lab",
      gpsLatitude: 16.2430,
      gpsLongitude: 80.6402,
      weatherTelemetry: {
        temperature: 24.2,
        humidity: 95,
        windSpeed: 18.5,
        rainProbability: 80
      },
      spraySafetyIndex: "Unsafe — Heavy Rain Imminent & Drifting Wind",
      treatmentCosts: {
        organicPerAcre: 750,
        organicBreakdown: [
          "Bordeaux copper-mixture elements - ₹350",
          "Lower canopy leaf pruning labor - ₹250",
          "Silt-bed draining adjustments - ₹150"
        ],
        chemicalPerAcre: 1350,
        chemicalBreakdown: [
          "Metalaxyl-M and Mancozeb sachet - ₹850",
          "Targeted mechanical power spray - ₹400",
          "Surfactant droplets spreader - ₹100"
        ]
      }
    }
  },
  {
    id: "sample-cotton-curl",
    name: "Cotton (పత్తి)",
    scientificName: "Gossypium hirsutum",
    disease: "Cotton Leaf Curl Virus (ఆకు ముడుత వైరస్)",
    severity: "High",
    imageUrl: "/src/assets/images/cotton_curl_leaf_1779785154333.png",
    description: "Significant cup-like upward curling of leaves, pronounced leaf vein thickening, and miniaturized stunted flower blooms. Spread by sap-sucking whiteflies.",
    report: {
      id: "report-cotton-curl-static",
      cropName: "Cotton (పత్తి - Gossypium hirsutum)",
      diseaseName: "Cotton Leaf Curl Virus (CLCuV) / పత్తి ఆకు ముడుత తెగులు",
      severity: "High",
      technicalExplanation: "Cotton Leaf Curl Virus is a Begomovirus transmitted exclusively by the Silverleaf Whitefly (Bemisia tabaci). It leads to severe stunting, leaf margins turning upward like a cup, and vein enations on the leaf underside. The virus stops overall photosynthetic capacity, crushing yield rates.",
      treatmentOrganic: [
        "Install yellow sticky traps @ 15 traps per acre to capture flying whitefly vector insects.",
        "Spray natural 5% Neem Seed Kernel Extract (NSKE) to disrupt whitefly egg development.",
        "Conserve and encourage natural predators like ladybird beetles and lacewings in the crop boundaries.",
        "Uproot and bury severely infected stunted crops immediately to prevent virus transmission reservoirs."
      ],
      treatmentChemical: [
        "Spray Diafenthiuron 50% WP @ 1.2 grams per liter of water to eliminate sucking pests.",
        "Or, apply Imidacloprid 17.8% SL @ 0.4 ml per liter of water for systemic whitefly control.",
        "Ensure rotative pest chemicals are used to prevent insecticide resistance in the insect colony."
      ],
      summaryEnglish: "Cotton Leaf Curl Virus identified. Since viruses have no chemical cures, focus must center on controlling the whitefly vector using sticky traps, neem extracts, and systemic insecticides.",
      summaryTelugu: "ఈ పత్తి ఆకు ముడుత ఒక వైరస్ తెగులు, ఇది తెల్లదోమ (whitefly) ద్వారా వ్యాపిస్తుంది. దీని నియంత్రణకు ముందుగా ఎకరాకు 15 పసుపు జిగురు పూసిన డబ్బాలను (sticky traps) అమర్చాలి. తెల్లదోమల నివారణకు లీటర్ నీటికి ఇమిడాక్లోప్రిడ్ (Imidacloprid @ 0.4 ml) లేదా డయాఫెంథియురాన్ (Diafenthiuron @ 1.2 గ్రా) కలిపి గాలి వాలుగా ఉండేలా పిచికారీ చేయాలి.",
      date: "2026-05-26",
      imageUrl: "/src/assets/images/cotton_curl_leaf_1779785154333.png",
      detectedRegion: "Guntur Research Plot",
      gpsLatitude: 16.2238,
      gpsLongitude: 80.5621,
      weatherTelemetry: {
        temperature: 34.0,
        humidity: 62,
        windSpeed: 14.5,
        rainProbability: 10
      },
      spraySafetyIndex: "Caution — Moderate Wind Drift Hazard",
      treatmentCosts: {
        organicPerAcre: 400,
        organicBreakdown: [
          "Whitefly sticky pads (15 pcs) - ₹180",
          "5% NSKE raw neem extract - ₹120",
          "Natural lacewings insect release - ₹100"
        ],
        chemicalPerAcre: 1250,
        chemicalBreakdown: [
          "Diafenthiuron 50% compound pack - ₹600",
          "Imidacloprid SL insecticide agent - ₹350",
          "Tractor-driven mist sprayer fee - ₹300"
        ]
      }
    }
  }
];
