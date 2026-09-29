export type HeritageCategory = 'Fort' | 'Church' | 'Temple' | 'Neighborhood' | 'House' | 'Museum' | 'Mosque';

export type Taluka = 
  | 'Tiswadi' 
  | 'Bardez' 
  | 'Salcete' 
  | 'Ponda' 
  | 'Mormugao' 
  | 'Bicholim' 
  | 'Sattari' 
  | 'Quepem' 
  | 'Canacona' 
  | 'Sanguem' 
  | 'Dharbandora';

export type District = 'North Goa' | 'South Goa';

export interface VerifiedImage {
  url: string;
  caption: string;
  author?: string;
  license?: string;
  sourceUrl?: string;
  isVerified: boolean;
}

export interface HeritageSite {
  id: string;
  title: string;
  altTitle?: string;
  category: HeritageCategory;
  district: District;
  location: {
    latitude: number;
    longitude: number;
    taluka: Taluka;
    address: string;
  };
  era: string;
  architecturalStyle: string;
  shortDescription: string;
  fullHistory: string;
  architecturalHighlights: string[];
  significance: string;
  images: VerifiedImage[];
  audioGuide: {
    title: string;
    duration: string;
    transcript: string;
    audioUrl?: string;
  };
  thenVsNow?: {
    historicalYear: string;
    historicalImage: VerifiedImage;
    modernImage: VerifiedImage;
    description: string;
  };
  visitorInfo: {
    timings: string;
    entryFee: string;
    dressCode?: string;
    bestTimeToVisit: string;
    parking: string;
    accessibility: string;
  };
  passportQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  hiddenGem: boolean;
  tags: string[];
}

export interface SmartTrail {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'Architectural Walk' | 'Coastal Forts' | 'Spiritual Heritage' | 'Latin Quarter Stroll';
  durationMinutes: number;
  distanceKm: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  stopIds: string[];
  coordinates: [number, number][];
  coverImage: VerifiedImage;
  highlights: string[];
}

export interface LivingCraft {
  id: string;
  title: string;
  konkaniName?: string;
  region: string;
  description: string;
  history: string;
  craftspersonSpotlight: {
    name: string;
    village: string;
    quote: string;
    experienceYears: number;
  };
  image: VerifiedImage;
  materials: string[];
}

export interface CommunityVoice {
  id: string;
  speakerName: string;
  role: string;
  location: string;
  title: string;
  story: string;
  audioTranscript: string;
  date: string;
  image: VerifiedImage;
}

export interface PassportStamp {
  siteId: string;
  unlockedAt: string;
  quizPassed: boolean;
}

export interface UserContribution {
  id: string;
  siteName: string;
  contributorName: string;
  type: 'Folklore' | 'Photo' | 'Correction' | 'Personal Memory';
  content: string;
  timestamp: string;
  approved: boolean;
}
