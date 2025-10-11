// Science Breakthrough RSS Sources
// Top open-access medical and scientific journals for breakthrough research

export interface ScienceSource {
  id: string;
  name: string;
  category: 'medical' | 'biology' | 'physics' | 'chemistry' | 'neuroscience' | 'technology';
  rss_url: string;
  website_url: string;
  description: string;
  weight: number; // Importance weight for ranking (1-10)
  active: boolean;
  language: string;
  update_frequency: string;
}

export const MEDICAL_SOURCES: ScienceSource[] = [
  {
    id: 'nature-medicine',
    name: 'Nature Medicine',
    category: 'medical',
    rss_url: 'https://www.nature.com/nm.rss',
    website_url: 'https://www.nature.com/nm/',
    description: 'Leading medical journal publishing breakthrough research',
    weight: 10,
    active: true,
    language: 'en',
    update_frequency: 'weekly'
  },
  {
    id: 'plos-medicine',
    name: 'PLOS Medicine',
    category: 'medical',
    rss_url: 'https://journals.plos.org/plosmedicine/feed/atom',
    website_url: 'https://journals.plos.org/plosmedicine/',
    description: 'Open-access medical journal with global health focus',
    weight: 9,
    active: true,
    language: 'en',
    update_frequency: 'weekly'
  },
  {
    id: 'frontiers-medicine',
    name: 'Frontiers in Medicine',
    category: 'medical',
    rss_url: 'https://www.frontiersin.org/journals/medicine/rss',
    website_url: 'https://www.frontiersin.org/journals/medicine',
    description: 'Open-access medical research platform',
    weight: 8,
    active: true,
    language: 'en',
    update_frequency: 'daily'
  },
  {
    id: 'medrxiv',
    name: 'medRxiv',
    category: 'medical',
    rss_url: 'https://connect.medrxiv.org/medrxiv_xml.php',
    website_url: 'https://www.medrxiv.org/',
    description: 'Medical preprint server for rapid research dissemination',
    weight: 7,
    active: true,
    language: 'en',
    update_frequency: 'daily'
  },
  {
    id: 'nejm',
    name: 'New England Journal of Medicine',
    category: 'medical',
    rss_url: 'https://www.nejm.org/action/showFeed?type=etoc&feed=rss',
    website_url: 'https://www.nejm.org/',
    description: 'Premier medical journal for clinical research',
    weight: 10,
    active: true,
    language: 'en',
    update_frequency: 'weekly'
  }
];

export const BIOLOGY_SOURCES: ScienceSource[] = [
  {
    id: 'nature-biology',
    name: 'Nature',
    category: 'biology',
    rss_url: 'https://www.nature.com/nature.rss',
    website_url: 'https://www.nature.com/',
    description: 'Leading multidisciplinary science journal',
    weight: 10,
    active: true,
    language: 'en',
    update_frequency: 'weekly'
  },
  {
    id: 'cell',
    name: 'Cell',
    category: 'biology',
    rss_url: 'https://www.cell.com/cell.rss',
    website_url: 'https://www.cell.com/cell',
    description: 'Premier biology journal for breakthrough discoveries',
    weight: 9,
    active: true,
    language: 'en',
    update_frequency: 'weekly'
  },
  {
    id: 'science',
    name: 'Science',
    category: 'biology',
    rss_url: 'https://science.org/rss/current.xml',
    website_url: 'https://science.org/',
    description: 'AAAS flagship journal for scientific breakthroughs',
    weight: 10,
    active: true,
    language: 'en',
    update_frequency: 'weekly'
  },
  {
    id: 'bioRxiv',
    name: 'bioRxiv',
    category: 'biology',
    rss_url: 'https://connect.biorxiv.org/biorxiv_xml.php',
    website_url: 'https://www.biorxiv.org/',
    description: 'Biology preprint server for rapid research sharing',
    weight: 7,
    active: true,
    language: 'en',
    update_frequency: 'daily'
  }
];

export const PHYSICS_SOURCES: ScienceSource[] = [
  {
    id: 'nature-physics',
    name: 'Nature Physics',
    category: 'physics',
    rss_url: 'https://www.nature.com/nphys.rss',
    website_url: 'https://www.nature.com/nphys/',
    description: 'Leading physics journal for breakthrough research',
    weight: 9,
    active: true,
    language: 'en',
    update_frequency: 'weekly'
  },
  {
    id: 'arxiv-physics',
    name: 'arXiv Physics',
    category: 'physics',
    rss_url: 'http://export.arxiv.org/api/query?search_query=cat:physics.*&start=0&max_results=50&sortBy=lastUpdatedDate&sortOrder=descending',
    website_url: 'https://arxiv.org/list/physics/recent',
    description: 'Physics preprint server for latest research',
    weight: 8,
    active: true,
    language: 'en',
    update_frequency: 'daily'
  }
];

export const NEUROSCIENCE_SOURCES: ScienceSource[] = [
  {
    id: 'nature-neuroscience',
    name: 'Nature Neuroscience',
    category: 'neuroscience',
    rss_url: 'https://www.nature.com/neuro.rss',
    website_url: 'https://www.nature.com/neuro/',
    description: 'Leading neuroscience journal for brain research',
    weight: 9,
    active: true,
    language: 'en',
    update_frequency: 'weekly'
  },
  {
    id: 'neuron',
    name: 'Neuron',
    category: 'neuroscience',
    rss_url: 'https://www.cell.com/neuron.rss',
    website_url: 'https://www.cell.com/neuron',
    description: 'Premier neuroscience journal for brain discoveries',
    weight: 8,
    active: true,
    language: 'en',
    update_frequency: 'weekly'
  }
];

export const CHEMISTRY_SOURCES: ScienceSource[] = [
  {
    id: 'nature-chemistry',
    name: 'Nature Chemistry',
    category: 'chemistry',
    rss_url: 'https://www.nature.com/nchem.rss',
    website_url: 'https://www.nature.com/nchem/',
    description: 'Leading chemistry journal for molecular breakthroughs',
    weight: 8,
    active: true,
    language: 'en',
    update_frequency: 'weekly'
  },
  {
    id: 'chemrxiv',
    name: 'ChemRxiv',
    category: 'chemistry',
    rss_url: 'https://chemrxiv.org/engage/chemrxiv/rss',
    website_url: 'https://chemrxiv.org/',
    description: 'Chemistry preprint server for rapid research sharing',
    weight: 6,
    active: true,
    language: 'en',
    update_frequency: 'daily'
  }
];

export const TECHNOLOGY_SOURCES: ScienceSource[] = [
  {
    id: 'nature-biotechnology',
    name: 'Nature Biotechnology',
    category: 'technology',
    rss_url: 'https://www.nature.com/nbt.rss',
    website_url: 'https://www.nature.com/nbt/',
    description: 'Leading biotechnology journal for innovation',
    weight: 9,
    active: true,
    language: 'en',
    update_frequency: 'weekly'
  },
  {
    id: 'nature-methods',
    name: 'Nature Methods',
    category: 'technology',
    rss_url: 'https://www.nature.com/nmeth.rss',
    website_url: 'https://www.nature.com/nmeth/',
    description: 'Methods journal for scientific innovation',
    weight: 8,
    active: true,
    language: 'en',
    update_frequency: 'weekly'
  }
];

// Combine all science sources
export const ALL_SCIENCE_SOURCES = [
  ...MEDICAL_SOURCES,
  ...BIOLOGY_SOURCES,
  ...PHYSICS_SOURCES,
  ...NEUROSCIENCE_SOURCES,
  ...CHEMISTRY_SOURCES,
  ...TECHNOLOGY_SOURCES
];

// Active sources only
export const ACTIVE_SCIENCE_SOURCES = ALL_SCIENCE_SOURCES.filter(source => source.active);

// Sources by category for easier filtering
export const SCIENCE_SOURCES_BY_CATEGORY = {
  medical: MEDICAL_SOURCES.filter(s => s.active),
  biology: BIOLOGY_SOURCES.filter(s => s.active),
  physics: PHYSICS_SOURCES.filter(s => s.active),
  neuroscience: NEUROSCIENCE_SOURCES.filter(s => s.active),
  chemistry: CHEMISTRY_SOURCES.filter(s => s.active),
  technology: TECHNOLOGY_SOURCES.filter(s => s.active)
};

// Weight-based ranking
export const getTopSourcesByWeight = (limit: number = 10): ScienceSource[] => {
  return ACTIVE_SCIENCE_SOURCES
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
};
