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
        ],
        positions: [
            {
                title: "CEO & Co-founder",
                institution: "Google DeepMind",
                startYear: 2010,
            },
        ],
    },
    // --- Added Authors from Mock Papers ---
    {
        id: "vaswani-a",
        name: "Vaswani, A.",
        affiliations: ["Google Brain", "Adept AI"],
        bio: "Lead author of 'Attention Is All You Need'. Co-founder of Adept AI.",
        researchInterests: ["NLP", "Transformers", "Deep Learning"],
        stats: { totalPapers: 35, totalCitations: 150000, hIndex: 30, i10Index: 32 },
        education: [],
        positions: [],
    },
    {
        id: "shazeer-n",
        name: "Shazeer, N.",
        affiliations: ["Google", "Noam Shazeer"],
        bio: "Deep learning researcher known for Transformer and large scale models.",
        researchInterests: ["Deep Learning", "Model Scaling", "Transformers"],
        stats: { totalPapers: 45, totalCitations: 120000, hIndex: 40, i10Index: 42 },
        education: [],
        positions: [],
    },
    {
        id: "parmar-n",
        name: "Parmar, N.",
        affiliations: ["Google Research"],
        bio: "Researcher in deep learning, focusing on attention mechanisms.",
        researchInterests: ["Deep Learning", "Attention", "Computer Vision"],
        stats: { totalPapers: 25, totalCitations: 80000, hIndex: 25, i10Index: 28 },
        education: [],
        positions: [],
    },
    {
        id: "devlin-j",
        name: "Devlin, J.",
        affiliations: ["Google AI Language"],
        bio: "Primary author of BERT. Research scientist at Google.",
        researchInterests: ["NLP", "Pre-training", "Language Models"],
        stats: { totalPapers: 40, totalCitations: 90000, hIndex: 38, i10Index: 40 },
        education: [],
        positions: [],
    },
    {
        id: "chang-m",
        name: "Chang, M.",
        affiliations: ["Google Research", "University of Washington"],
        bio: "Researcher in NLP and machine learning.",
        researchInterests: ["NLP", "Machine Learning"],
        stats: { totalPapers: 60, totalCitations: 40000, hIndex: 45, i10Index: 50 },
        education: [],
        positions: [],
    },
    {
        id: "lee-k",
        name: "Lee, K.",
        affiliations: ["Google Research"],
        bio: "Research scientist working on language understanding.",
        researchInterests: ["NLP", "Deep Learning"],
        stats: { totalPapers: 30, totalCitations: 35000, hIndex: 28, i10Index: 30 },
        education: [],
        positions: [],
    },
    {
        id: "ho-j",
        name: "Ho, J.",
        affiliations: ["Google Research", "UC Berkeley"],
        bio: "Researcher known for Denoising Diffusion Probabilistic Models.",
        researchInterests: ["Generative Models", "Diffusion", "Robotics"],
        stats: { totalPapers: 32, totalCitations: 25000, hIndex: 22, i10Index: 25 },
        education: [],
        positions: [],
    },
    {
        id: "jain-a",
        name: "Jain, A.",
        affiliations: ["UC Berkeley"],
        bio: "Researcher in machine learning and robotics.",
        researchInterests: ["Machine Learning", "Robotics", "Optimization"],
        stats: { totalPapers: 18, totalCitations: 10000, hIndex: 15, i10Index: 18 },
        education: [],
        positions: [],
    },
    {
        id: "abbeel-p",
        name: "Abbeel, P.",
        affiliations: ["UC Berkeley"],
        bio: "Professor at UC Berkeley, renowned for reinforcement learning and robotics research.",
        researchInterests: ["Robotics", "Reinforcement Learning", "AI"],
        stats: { totalPapers: 400, totalCitations: 160000, hIndex: 130, i10Index: 350 },
        education: [],
        positions: [],
    },
    {
        id: "schulman-j",
        name: "Schulman, J.",
        affiliations: ["OpenAI"],
        bio: "Co-founder of OpenAI, lead developer of PPO.",
        researchInterests: ["Reinforcement Learning", "Deep Learning", "AI Safety"],
        stats: { totalPapers: 50, totalCitations: 60000, hIndex: 35, i10Index: 40 },
        education: [],
        positions: [],
    },
    {
        id: "wolski-f",
        name: "Wolski, F.",
        affiliations: ["OpenAI"],
        bio: "Researcher at OpenAI.",
        researchInterests: ["Reinforcement Learning", "AI"],
        stats: { totalPapers: 10, totalCitations: 5000, hIndex: 8, i10Index: 9 },
        education: [],
        positions: [],
    },
    {
        id: "dhariwal-p",
        name: "Dhariwal, P.",
        affiliations: ["OpenAI"],
        bio: "Research Scientist at OpenAI, known for diffusion models.",
        researchInterests: ["Generative Models", "Deep Learning"],
        stats: { totalPapers: 20, totalCitations: 30000, hIndex: 18, i10Index: 20 },
        education: [],
        positions: [],
    },
    {
        id: "dosovitskiy-a",
        name: "Dosovitskiy, A.",
        affiliations: ["Google Brain"],
        bio: "Lead author of Vision Transformer.",
        researchInterests: ["Computer Vision", "Deep Learning", "Representation Learning"],
        stats: { totalPapers: 55, totalCitations: 70000, hIndex: 40, i10Index: 45 },
        education: [],
        positions: [],
    },
    {
        id: "beyer-l",
        name: "Beyer, L.",
        affiliations: ["Google Brain"],
        bio: "Researcher working on large-scale vision models.",
        researchInterests: ["Computer Vision", "Machine Learning"],
        stats: { totalPapers: 30, totalCitations: 45000, hIndex: 25, i10Index: 28 },
        education: [],
        positions: [],
    },
    {
        id: "kolesnikov-a",
        name: "Kolesnikov, A.",
        affiliations: ["Google Brain"],
        bio: "Researcher in computer vision and deep learning.",
        researchInterests: ["Computer Vision", "Self-supervised Learning"],
        stats: { totalPapers: 40, totalCitations: 50000, hIndex: 32, i10Index: 35 },
        education: [],
        positions: [],
    },
    {
        id: "openai",
        name: "OpenAI",
        affiliations: ["OpenAI"],
        bio: "AI research and deployment company tailored for the benefit of all humanity.",
        researchInterests: ["Artificial Intelligence", "AGI"],
        stats: { totalPapers: 100, totalCitations: 500000, hIndex: 100, i10Index: 200 },
        education: [],
        positions: [],
    },
    {
        id: "christiano-p",
        name: "Christiano, P.",
        affiliations: ["Alignment Research Center", "OpenAI"],
        bio: "Researcher focusing on AI alignment and safety.",
        researchInterests: ["AI Safety", "Reinforcement Learning", "Alignment"],
        stats: { totalPapers: 35, totalCitations: 20000, hIndex: 22, i10Index: 25 },
        education: [],
        positions: [],
    },
    {
        id: "leike-j",
        name: "Leike, J.",
        affiliations: ["OpenAI", "DeepMind"],
        bio: "Head of Alignment at OpenAI.",
        researchInterests: ["AI Safety", "Reinforcement Learning"],
        stats: { totalPapers: 28, totalCitations: 15000, hIndex: 20, i10Index: 22 },
        education: [],
        positions: [],
    },
    {
        id: "brown-t",
        name: "Brown, T.",
        affiliations: ["OpenAI"],
        bio: "Lead author of GPT-3.",
        researchInterests: ["Large Language Models", "Scaling Laws"],
        stats: { totalPapers: 15, totalCitations: 80000, hIndex: 12, i10Index: 14 },
        education: [],
        positions: [],
    },
    {
        id: "rombach-r",
        name: "Rombach, R.",
        affiliations: ["Ludwig Maximilian University of Munich", "Stability AI"],
        bio: "Lead researcher on Stable Diffusion.",
        researchInterests: ["Generative Models", "Diffusion", "Deep Learning"],
        stats: { totalPapers: 22, totalCitations: 12000, hIndex: 18, i10Index: 20 },
        education: [],
        positions: [],
    },
    {
        id: "blattmann-a",
        name: "Blattmann, A.",
        affiliations: ["Ludwig Maximilian University of Munich", "Stability AI"],
        bio: "Researcher focusing on latent diffusion models.",
        researchInterests: ["Generative Models", "Computer Vision", "Diffusion"],
        stats: { totalPapers: 15, totalCitations: 8500, hIndex: 12, i10Index: 14 },
        education: [],
        positions: [],
    },
    {
        id: "lorenz-d",
        name: "Lorenz, D.",
        affiliations: ["High-Resolution Image Synthesis"],
        bio: "Researcher in computer vision.",
        researchInterests: ["Computer Vision", "Generative Models"],
        stats: { totalPapers: 10, totalCitations: 5000, hIndex: 8, i10Index: 10 },
        education: [],
        positions: [],
    },
    {
        id: "wei-j",
        name: "Wei, J.",
        affiliations: ["Google Brain"],
        bio: "Researcher known for Chain-of-Thought prompting.",
        researchInterests: ["NLP", "Reasoning", "Prompting"],
        stats: { totalPapers: 20, totalCitations: 25000, hIndex: 15, i10Index: 18 },
        education: [],
        positions: [],
    },
    {
        id: "wang-x",
        name: "Wang, X.",
        affiliations: ["Google Research"],
        bio: "Researcher in machine learning.",
        researchInterests: ["Machine Learning", "NLP"],
        stats: { totalPapers: 25, totalCitations: 10000, hIndex: 18, i10Index: 20 },
        education: [],
        positions: [],
    },
    {
        id: "schuurmans-d",
        name: "Schuurmans, D.",
        affiliations: ["Google Brain", "University of Alberta"],
        bio: "Professor and Research Scientist working on AI.",
        researchInterests: ["Machine Learning", "AI"],
        stats: { totalPapers: 150, totalCitations: 40000, hIndex: 60, i10Index: 150 },
        education: [],
        positions: [],
    },
    {
        id: "he-k",
        name: "He, K.",
        affiliations: ["Facebook AI Research (FAIR)"],
        bio: "Creator of ResNet and Mask R-CNN.",
        researchInterests: ["Computer Vision", "Deep Learning"],
        stats: { totalPapers: 80, totalCitations: 300000, hIndex: 90, i10Index: 100 },
        education: [],
        positions: [],
    },
    {
        id: "zhang-x",
        name: "Zhang, X.",
        affiliations: ["Megvii Technology"],
        bio: "Researcher in computer vision.",
        researchInterests: ["Computer Vision", "Deep Learning"],
        stats: { totalPapers: 50, totalCitations: 150000, hIndex: 55, i10Index: 60 },
        education: [],
        positions: [],
    },
    {
        id: "ren-s",
        name: "Ren, S.",
        affiliations: ["Facebook AI Research (FAIR)"],
        bio: "Researcher known for Faster R-CNN.",
        researchInterests: ["Object Detection", "Computer Vision"],
        stats: { totalPapers: 60, totalCitations: 180000, hIndex: 65, i10Index: 70 },
        education: [],
        positions: [],
    },
    {
        id: "bai-y",
        name: "Bai, Y.",
        affiliations: ["Anthropic"],
        bio: "Researcher at Anthropic working on Constitutional AI.",
        researchInterests: ["AI Safety", "Alignment", "LLMs"],
        stats: { totalPapers: 15, totalCitations: 5000, hIndex: 10, i10Index: 12 },
        education: [],
        positions: [],
    },
    {
        id: "kadavath-s",
        name: "Kadavath, S.",
        affiliations: ["Anthropic"],
        bio: "Researcher focusing on language models and honesty.",
        researchInterests: ["NLP", "AI Alignment"],
        stats: { totalPapers: 10, totalCitations: 3000, hIndex: 8, i10Index: 10 },
        education: [],
        positions: [],
    },
    {
        id: "kundu-s",
        name: "Kundu, S.",
        affiliations: ["Anthropic"],
        bio: "Researcher working on AI safety.",
        researchInterests: ["AI Safety", "Machine Learning"],
        stats: { totalPapers: 5, totalCitations: 1000, hIndex: 4, i10Index: 5 },
        education: [],
        positions: [],
    },
    {
        id: "kirillov-a",
        name: "Kirillov, A.",
        affiliations: ["Meta AI"],
        bio: "Research Scientist at Meta AI, working on computer vision.",
        researchInterests: ["Computer Vision", "Segmentation"],
        stats: { totalPapers: 30, totalCitations: 20000, hIndex: 25, i10Index: 28 },
        education: [],
        positions: [],
    },
    {
        id: "mintun-e",
        name: "Mintun, E.",
        affiliations: ["Meta AI"],
        bio: "Software Engineer at Meta AI.",
        researchInterests: ["Computer Vision", "AI Systems"],
        stats: { totalPapers: 8, totalCitations: 5000, hIndex: 6, i10Index: 7 },
        education: [],
        positions: [],
    },
    {
        id: "ravi-n",
        name: "Ravi, N.",
        affiliations: ["Meta AI"],
        bio: "Research Engineer at Meta AI.",
        researchInterests: ["Computer Vision", "Machine Learning"],
        stats: { totalPapers: 12, totalCitations: 8000, hIndex: 10, i10Index: 12 },
        education: [],
        positions: [],
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
