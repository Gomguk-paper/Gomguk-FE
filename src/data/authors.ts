export interface Author {
    id: string;
    name: string;
    affiliations: string[];
    email?: string;
    website?: string;
    avatarUrl?: string;
    bio?: string;

    // Research info
    researchInterests: string[];

    // Statistics
    stats: {
        totalPapers: number;
        totalCitations: number;
        hIndex: number;
        i10Index: number;
    };

    // Career
    education: EducationEntry[];
    positions: PositionEntry[];
}

export interface EducationEntry {
    degree: string;
    field: string;
    institution: string;
    year: number;
}

export interface PositionEntry {
    title: string;
    institution: string;
    startYear: number;
    endYear?: number; // undefined means current
}

// Mock author data
export const authors: Author[] = [
    {
        id: "yann-lecun",
        name: "Yann LeCun",
        affiliations: ["Meta AI", "New York University"],
        email: "yann@cs.nyu.edu",
        website: "http://yann.lecun.com",
        bio: "Chief AI Scientist at Meta, Silver Professor at NYU. Turing Award winner, pioneer in deep learning and convolutional neural networks.",
        researchInterests: ["Deep Learning", "Computer Vision", "Neural Networks", "AI"],
        stats: {
            totalPapers: 245,
            totalCitations: 185000,
            hIndex: 142,
            i10Index: 420,
        },
        education: [
            {
                degree: "PhD",
                field: "Computer Science",
                institution: "Université Pierre et Marie Curie",
                year: 1987,
            },
            {
                degree: "Diplôme d'Ingénieur",
                field: "Electrical Engineering",
                institution: "ESIEE Paris",
                year: 1983,
            },
        ],
        positions: [
            {
                title: "Chief AI Scientist",
                institution: "Meta AI",
                startYear: 2013,
            },
            {
                title: "Silver Professor",
                institution: "New York University",
                startYear: 2003,
            },
            {
                title: "Fellow",
                institution: "AT&T Labs-Research",
                startYear: 1996,
                endYear: 2003,
            },
        ],
    },
    {
        id: "andrej-karpathy",
        name: "Andrej Karpathy",
        affiliations: ["OpenAI"],
        email: "karpathy@openai.com",
        website: "https://karpathy.ai",
        bio: "Co-founder of OpenAI, former Director of AI at Tesla. Known for contributions to computer vision and deep learning.",
        researchInterests: ["Deep Learning", "Computer Vision", "NLP", "Reinforcement Learning"],
        stats: {
            totalPapers: 48,
            totalCitations: 45000,
            hIndex: 35,
            i10Index: 42,
        },
        education: [
            {
                degree: "PhD",
                field: "Computer Science",
                institution: "Stanford University",
                year: 2016,
            },
            {
                degree: "MSc",
                field: "Computer Science",
                institution: "University of British Columbia",
                year: 2011,
            },
            {
                degree: "BSc",
                field: "Computer Science & Physics",
                institution: "University of Toronto",
                year: 2009,
            },
        ],
        positions: [
            {
                title: "Co-founder",
                institution: "OpenAI",
                startYear: 2023,
            },
            {
                title: "Senior Director of AI",
                institution: "Tesla",
                startYear: 2017,
                endYear: 2022,
            },
            {
                title: "Research Scientist",
                institution: "OpenAI",
                startYear: 2015,
                endYear: 2017,
            },
        ],
    },
    {
        id: "demis-hassabis",
        name: "Demis Hassabis",
        affiliations: ["Google DeepMind"],
        website: "https://www.deepmind.com",
        bio: "CEO and Co-founder of Google DeepMind. Leading researcher in artificial intelligence and neuroscience.",
        researchInterests: ["Artificial Intelligence", "Neuroscience", "Reinforcement Learning", "AlphaGo"],
        stats: {
            totalPapers: 120,
            totalCitations: 95000,
            hIndex: 85,
            i10Index: 115,
        },
        education: [
            {
                degree: "PhD",
                field: "Cognitive Neuroscience",
                institution: "University College London",
                year: 2009,
            },
            {
                degree: "BSc",
                field: "Computer Science",
                institution: "University of Cambridge",
                year: 1997,
            },
        ],
        positions: [
            {
                title: "CEO & Co-founder",
                institution: "Google DeepMind",
                startYear: 2010,
            },
        ],
    },
];

// Helper function to get author by ID
export function getAuthorById(id: string): Author | undefined {
    return authors.find((author) => author.id === id);
}

// Helper function to get author by name
export function getAuthorByName(name: string): Author | undefined {
    return authors.find(
        (author) => author.name.toLowerCase() === name.toLowerCase()
    );
}
