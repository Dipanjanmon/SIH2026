export const MODULES = ['gis-map', 'nadcp', 'outbreak', 'mvu', 'vet-lab', 'reports', 'farmers', 'officer', 'epidemic']

export const DASHBOARD_TABS = ['dashboard', 'gis-map', 'cases', 'farms', 'vaccination', 'lab', 'analytics', 'mvu', 'reports', 'medteam', 'govteam', 'rescueteam']
export const TEAM_TABS = ['medteam', 'govteam', 'rescueteam']

export const diseaseHotspots = [
  { name: 'Barmer (RJ)', disease: 'FMD Serotype O', risk: 'Critical', lat: 25.75, lng: 71.4, color: '#dc2626' },
  { name: 'Mehsana (GJ)', disease: 'Lumpy Skin Disease', risk: 'High', lat: 23.59, lng: 72.37, color: '#ea580c' },
  { name: 'Alappuzha (KL)', disease: 'Avian Influenza H5N1', risk: 'Critical', lat: 9.49, lng: 76.33, color: '#dc2626' },
  { name: 'Kamrup (AS)', disease: 'African Swine Fever', risk: 'High', lat: 26.14, lng: 91.65, color: '#ea580c' },
  { name: 'Mathura (UP)', disease: 'PPR', risk: 'Moderate', lat: 27.49, lng: 77.67, color: '#ca8a04' },
  { name: 'Dharwad (KA)', disease: 'Bluetongue', risk: 'Low', lat: 15.46, lng: 75.01, color: '#16a34a' }
]

export const diseaseFocusSlides = [
  {
    title: 'Foot & Mouth Disease (FMD)',
    desc: 'Highly contagious viral infection affecting cattle, buffalo, sheep & goats. Blisters on mouth and feet.',
    badge: 'Critical', badgeCls: 'bg-red-500', stat: 'Affected: 14 Clusters', spread: 'Vaccine Cover: 84.6%',
    icon: 'shield-alert', iconColor: 'text-amber-400', index: 'L2',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg/500px-Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg',
    alt: 'FMD affected cattle'
  },
  {
    title: 'Lumpy Skin Disease (LSD)',
    desc: 'Poxvirus disease of cattle marked by skin nodules, fever and reduced milk yield. Vector-borne transmission.',
    badge: 'High Risk', badgeCls: 'bg-orange-500', stat: 'Affected: 8 Clusters', spread: 'Ring Vaccination Active',
    icon: 'bug', iconColor: 'text-orange-400', index: 'L3',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/CH_cow_2.jpg/500px-CH_cow_2.jpg',
    alt: 'LSD affected cow'
  },
  {
    title: 'Peste Des Petits Ruminants (PPR)',
    desc: 'Acute viral disease of sheep and goats (Goat Plague) with fever, ocular-nasal discharge and pneumonia.',
    badge: 'Moderate', badgeCls: 'bg-yellow-500', stat: 'Affected: 5 Clusters', spread: 'Vaccine Cover: 71%',
    icon: 'syringe', iconColor: 'text-yellow-400', index: 'L2',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Domestic_goat_01.jpg/500px-Domestic_goat_01.jpg',
    alt: 'PPR affected goat / sheep'
  },
  {
    title: 'African Swine Fever (ASF)',
    desc: 'Severe haemorrhagic viral disease of domestic pigs. No vaccine available; strict biosecurity required.',
    badge: 'High Risk', badgeCls: 'bg-orange-500', stat: 'Affected: 6 Clusters', spread: 'Movement Ban Active',
    icon: 'alert-triangle', iconColor: 'text-red-400', index: 'L4',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Pot-bellied_pigs_in_Lisbon_Zoo_2008.jpg/500px-Pot-bellied_pigs_in_Lisbon_Zoo_2008.jpg',
    alt: 'ASF affected pig'
  }
]

export const notificationDataSeed = [
  { icon: 'alert-triangle', color: 'text-red-500', title: 'FMD Outbreak Confirmed', time: '12 mins ago', desc: 'Barmer, Rajasthan · 14 cattle affected', type: 'Critical' },
  { icon: 'flask-conical', color: 'text-purple-500', title: 'Lab Result Ready', time: '45 mins ago', desc: 'IVRI-2026-8941 PCR result uploaded', type: 'Lab' },
  { icon: 'syringe', color: 'text-emerald-500', title: 'Vaccination Round 7', time: '2 hours ago', desc: '84.6% coverage achieved nationwide', type: 'NADCP' },
  { icon: 'shield-check', color: 'text-blue-500', title: 'MVU Deployed', time: '5 hours ago', desc: 'Unit #8 dispatched to Mehsana (LSD)', type: 'Field' },
  { icon: 'map-pin', color: 'text-orange-500', title: 'New Risk Zone', time: 'Yesterday', desc: 'Alappuzha poultry mortality spike', type: 'GIS' }
]

export const demoCredentials = {
  gov: { id: 'GOV', pass: 'gov123' },
  vet: { id: 'VET', pass: 'vet123' },
  farmer: { id: 'FARMER', pass: 'farmer123' },
  lab: { id: 'LAB', pass: 'lab123' },
  admin: { id: 'ADMIN', pass: 'admin123' }
}

export const heroImages = ['animal1.jpg', 'animal2.jpg', 'animal3.jpg', 'farmer.jpg', 'lab.jpg', 'lab2.jpg']

export const ROLE_NAMES = {
  gov: 'Government Officer (Central HQ)',
  vet: 'Field Veterinarian (MVU Unit 14)',
  farmer: 'Livestock Owner / Farmer',
  lab: 'ICAR Diagnostic Lab Analyst',
  admin: 'System Administrator'
}

export const teamBtnMap = { medteam: 'teamMedBtn', govteam: 'teamGovBtn', rescueteam: 'teamRescueBtn' }

export const FALLBACK_IMG =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27600%27 height=%27400%27%3E%3Crect width=%27600%27 height=%27400%27 fill=%27%23334155%27/%3E%3Ctext x=%27300%27 y=%27210%27 fill=%27%2394a3b8%27 font-family=%27monospace%27 font-size=%2724%27 text-anchor=%27middle%27%3EImage%3C/text%3E%3C/svg%3E"