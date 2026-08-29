// PashuRaksha UI translations — Hindi / Marathi / English.
// Lazy design: a plain typed map + React context. No i18n library needed for a
// fixed label set. Keys are stable identifiers; add new ones as UI grows.
// ponytail: covers the nav + common UI labels used across pages. Page-body copy
// that isn't farmer-facing (govt analytics tables) is left in English by design.

export type Lang = 'en' | 'hi' | 'mr';

export const LANGUAGE_OPTIONS: { code: Lang; name: string; label: string }[] = [
  { code: 'en', name: 'English', label: 'English' },
  { code: 'hi', name: 'हिन्दी', label: 'Hindi' },
  { code: 'mr', name: 'मराठी', label: 'Marathi' },
];

type Dict = Record<string, string>;

const en: Dict = {
  // Branding
  'app.name': 'PashuRaksha',
  'app.tagline': 'Health Surveillance',
  // Nav
  'nav.dashboard': 'Dashboard',
  'nav.aiAdvisory': 'AI Advisory',
  'nav.reportDisease': 'Report Disease',
  'nav.myCases': 'My Cases',
  'nav.cases': 'Cases',
  'nav.allCases': 'All Cases',
  'nav.vaccinations': 'Vaccinations',
  'nav.diseaseMap': 'Disease Map',
  'nav.myAssignments': 'My Assignments',
  'nav.labSamples': 'Lab Samples',
  'nav.riskZones': 'Risk Zones',
  'nav.analytics': 'Analytics',
  'nav.admin': 'Admin',
  'nav.adminPanel': 'Admin Panel',
  // Common actions
  'action.signOut': 'Sign Out',
  'action.submit': 'Submit',
  'action.cancel': 'Cancel',
  'action.save': 'Save',
  'action.loading': 'Loading...',
  'action.retry': 'Retry',
  'action.captureLocation': 'Capture Location',
  'action.readAloud': 'Read Aloud',
  'action.stop': 'Stop',
  // States
  'state.error': 'Something went wrong. Please try again.',
  'state.offline': 'You are offline',
  'state.noData': 'No data available',
};

const hi: Dict = {
  'app.name': 'पशुरक्षा',
  'app.tagline': 'स्वास्थ्य निगरानी',
  'nav.dashboard': 'डैशबोर्ड',
  'nav.aiAdvisory': 'एआई सलाह',
  'nav.reportDisease': 'रोग की सूचना दें',
  'nav.myCases': 'मेरे मामले',
  'nav.cases': 'मामले',
  'nav.allCases': 'सभी मामले',
  'nav.vaccinations': 'टीकाकरण',
  'nav.diseaseMap': 'रोग मानचित्र',
  'nav.myAssignments': 'मेरे कार्य',
  'nav.labSamples': 'प्रयोगशाला नमूने',
  'nav.riskZones': 'जोखिम क्षेत्र',
  'nav.analytics': 'विश्लेषण',
  'nav.admin': 'प्रशासन',
  'nav.adminPanel': 'प्रशासन पैनल',
  'action.signOut': 'साइन आउट',
  'action.submit': 'जमा करें',
  'action.cancel': 'रद्द करें',
  'action.save': 'सहेजें',
  'action.loading': 'लोड हो रहा है...',
  'action.retry': 'पुनः प्रयास करें',
  'action.captureLocation': 'स्थान प्राप्त करें',
  'action.readAloud': 'ज़ोर से पढ़ें',
  'action.stop': 'रोकें',
  'state.error': 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
  'state.offline': 'आप ऑफ़लाइन हैं',
  'state.noData': 'कोई डेटा उपलब्ध नहीं',
};

const mr: Dict = {
  'app.name': 'पशुरक्षा',
  'app.tagline': 'आरोग्य देखरेख',
  'nav.dashboard': 'डॅशबोर्ड',
  'nav.aiAdvisory': 'एआय सल्ला',
  'nav.reportDisease': 'रोगाची तक्रार करा',
  'nav.myCases': 'माझी प्रकरणे',
  'nav.cases': 'प्रकरणे',
  'nav.allCases': 'सर्व प्रकरणे',
  'nav.vaccinations': 'लसीकरण',
  'nav.diseaseMap': 'रोग नकाशा',
  'nav.myAssignments': 'माझी कामे',
  'nav.labSamples': 'प्रयोगशाळा नमुने',
  'nav.riskZones': 'जोखीम क्षेत्रे',
  'nav.analytics': 'विश्लेषण',
  'nav.admin': 'प्रशासन',
  'nav.adminPanel': 'प्रशासन पॅनेल',
  'action.signOut': 'साइन आउट',
  'action.submit': 'सादर करा',
  'action.cancel': 'रद्द करा',
  'action.save': 'जतन करा',
  'action.loading': 'लोड होत आहे...',
  'action.retry': 'पुन्हा प्रयत्न करा',
  'action.captureLocation': 'स्थान मिळवा',
  'action.readAloud': 'मोठ्याने वाचा',
  'action.stop': 'थांबा',
  'state.error': 'काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.',
  'state.offline': 'तुम्ही ऑफलाइन आहात',
  'state.noData': 'डेटा उपलब्ध नाही',
};

export const TRANSLATIONS: Record<Lang, Dict> = { en, hi, mr };
