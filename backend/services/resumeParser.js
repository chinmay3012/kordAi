import mammoth from "mammoth";
import natural from "natural";

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

/**
 * Common tech skills and keywords to look for in resumes
 */
const TECH_SKILLS = new Set([
    // Programming Languages
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go", "golang",
    "rust", "swift", "kotlin", "scala", "php", "perl", "r", "matlab", "sql", "bash",
    "shell", "powershell", "objective-c", "dart", "elixir", "clojure", "haskell",

    // Frontend
    "react", "reactjs", "react.js", "vue", "vuejs", "vue.js", "angular", "angularjs",
    "svelte", "nextjs", "next.js", "nuxt", "gatsby", "html", "html5", "css", "css3",
    "sass", "scss", "less", "tailwind", "tailwindcss", "bootstrap", "material-ui",
    "chakra", "styled-components", "redux", "mobx", "webpack", "vite", "rollup",

    // Backend
    "node", "nodejs", "node.js", "express", "expressjs", "fastify", "koa", "nestjs",
    "django", "flask", "fastapi", "rails", "ruby on rails", "spring", "spring boot",
    "laravel", "asp.net", ".net", "dotnet", "graphql", "rest", "restful", "api",

    // Databases
    "mongodb", "mongoose", "postgresql", "postgres", "mysql", "mariadb", "sqlite",
    "redis", "elasticsearch", "cassandra", "dynamodb", "firebase", "firestore",
    "supabase", "prisma", "sequelize", "typeorm", "knex", "sql server", "oracle",

    // Cloud & DevOps
    "aws", "amazon web services", "azure", "gcp", "google cloud", "heroku", "vercel",
    "netlify", "digitalocean", "docker", "kubernetes", "k8s", "jenkins", "gitlab",
    "github actions", "ci/cd", "terraform", "ansible", "puppet", "chef", "nginx",
    "apache", "linux", "ubuntu", "centos", "serverless", "lambda", "cloudflare",

    // Data & ML
    "machine learning", "ml", "deep learning", "tensorflow", "pytorch", "keras",
    "scikit-learn", "pandas", "numpy", "jupyter", "data science", "data analysis",
    "data engineering", "etl", "spark", "hadoop", "kafka", "airflow", "dbt",
    "tableau", "power bi", "looker", "nlp", "computer vision", "ai", "llm", "gpt",

    // Mobile
    "ios", "android", "react native", "flutter", "xamarin", "ionic", "cordova",
    "mobile development", "swift ui", "jetpack compose",

    // Tools & Practices
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "agile", "scrum",
    "kanban", "tdd", "bdd", "testing", "jest", "mocha", "cypress", "selenium",
    "postman", "swagger", "openapi", "figma", "sketch", "adobe xd",

    // Concepts
    "microservices", "monolith", "architecture", "system design", "scalability",
    "performance", "optimization", "security", "authentication", "authorization",
    "oauth", "jwt", "cryptography", "blockchain", "web3", "solidity", "smart contracts",
]);

/**
 * Role-related keywords
 */
const ROLE_KEYWORDS = {
    "frontend": ["frontend", "front-end", "front end", "ui", "ux", "react", "vue", "angular", "css", "html"],
    "backend": ["backend", "back-end", "back end", "api", "server", "node", "python", "java", "database"],
    "fullstack": ["fullstack", "full-stack", "full stack"],
    "devops": ["devops", "sre", "infrastructure", "cloud", "kubernetes", "docker", "aws", "azure", "gcp"],
    "data": ["data", "analytics", "ml", "machine learning", "data science", "data engineer", "etl"],
    "mobile": ["mobile", "ios", "android", "react native", "flutter", "app development"],
    "design": ["design", "ui", "ux", "figma", "sketch", "user experience", "user interface"],
    "product": ["product", "product manager", "pm", "product management", "roadmap"],
    "qa": ["qa", "quality", "testing", "test", "automation", "selenium", "cypress"],
};

/**
 * Experience level keywords
 */
const EXPERIENCE_LEVELS = {
    "intern": ["intern", "internship", "trainee", "apprentice"],
    "entry": ["junior", "entry", "entry-level", "associate", "graduate", "fresher", "0-2 years"],
    "mid": ["mid", "mid-level", "intermediate", "2-5 years", "3-5 years"],
    "senior": ["senior", "sr", "lead", "principal", "staff", "5+ years", "5-10 years"],
    "executive": ["director", "vp", "vice president", "head of", "chief", "cto", "ceo", "cfo"],
};

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer) {
    try {
        const { default: pdfParse } = await import("pdf-parse");
        const data = await pdfParse(buffer);
        return data.text;
    } catch (err) {
        console.error("PDF parsing error:", err);
        throw new Error(`Failed to parse PDF: ${err.message}`);
    }
}

/**
 * Extract text from DOCX buffer
 */
export async function extractTextFromDOCX(buffer) {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (err) {
        console.error("DOCX parsing error:", err.message);
        throw new Error("Failed to parse DOCX");
    }
}

/**
 * Parse resume from buffer based on file type
 */
export async function parseResumeBuffer(buffer, mimeType) {
    let text = "";

    if (mimeType === "application/pdf") {
        text = await extractTextFromPDF(buffer);
    } else if (
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimeType === "application/msword"
    ) {
        text = await extractTextFromDOCX(buffer);
    } else if (mimeType === "text/plain") {
        text = buffer.toString("utf-8");
    } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
    }

    return analyzeResumeText(text);
}

/**
 * Analyze resume text and extract structured information
 */
export function analyzeResumeText(text) {
    const normalizedText = text.toLowerCase();
    const words = tokenizer.tokenize(normalizedText);

    // Extract skills
    const skills = new Set();
    const skillMatches = [];

    // Single word skills
    words.forEach(word => {
        if (TECH_SKILLS.has(word)) {
            skills.add(word);
            skillMatches.push(word);
        }
    });

    // Multi-word skills (check in original text)
    TECH_SKILLS.forEach(skill => {
        if (skill.includes(" ") && normalizedText.includes(skill)) {
            skills.add(skill);
            skillMatches.push(skill);
        }
    });

    // Detect preferred roles
    const detectedRoles = [];
    for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
        const matchCount = keywords.filter(kw => normalizedText.includes(kw)).length;
        if (matchCount >= 2) {
            detectedRoles.push({ role, score: matchCount });
        }
    }
    detectedRoles.sort((a, b) => b.score - a.score);

    // Detect experience level
    let experienceLevel = "mid"; // default
    for (const [level, keywords] of Object.entries(EXPERIENCE_LEVELS)) {
        if (keywords.some(kw => normalizedText.includes(kw))) {
            experienceLevel = level;
            break;
        }
    }

    // Extract years of experience (pattern matching)
    const yearsMatch = normalizedText.match(/(\d+)\+?\s*years?\s*(of)?\s*(experience|exp)/i);
    const yearsOfExperience = yearsMatch ? parseInt(yearsMatch[1], 10) : null;

    // Adjust experience level based on years
    if (yearsOfExperience !== null) {
        if (yearsOfExperience < 1) experienceLevel = "intern";
        else if (yearsOfExperience < 3) experienceLevel = "entry";
        else if (yearsOfExperience < 5) experienceLevel = "mid";
        else if (yearsOfExperience < 10) experienceLevel = "senior";
        else experienceLevel = "executive";
    }

    // Use TF-IDF to find important keywords
    const tfidf = new TfIdf();
    tfidf.addDocument(normalizedText);

    const importantKeywords = [];
    tfidf.listTerms(0).slice(0, 50).forEach(item => {
        if (item.term.length > 2 && TECH_SKILLS.has(item.term)) {
            importantKeywords.push({ term: item.term, score: item.tfidf });
        }
    });

    // Extract potential job titles from resume
    const titlePatterns = [
        /(?:^|\n)\s*([\w\s]+(?:developer|engineer|designer|manager|analyst|scientist|architect|lead|admin|administrator|specialist|consultant))/gi,
    ];

    const potentialTitles = [];
    titlePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const title = match[1].trim();
            if (title.length > 5 && title.length < 50) {
                potentialTitles.push(title);
            }
        }
    });

    return {
        skills: Array.from(skills),
        skillCount: skills.size,
        preferredRoles: detectedRoles.slice(0, 3).map(r => r.role),
        experienceLevel,
        yearsOfExperience,
        importantKeywords: importantKeywords.slice(0, 20),
        potentialTitles: [...new Set(potentialTitles)].slice(0, 5),
        rawTextLength: text.length,
        wordCount: words.length,
    };
}

/**
 * Generate search keywords from resume analysis
 */
export function generateSearchKeywords(resumeAnalysis) {
    const keywords = new Set();

    // Add all detected skills
    resumeAnalysis.skills.forEach(skill => keywords.add(skill));

    // Add preferred roles
    resumeAnalysis.preferredRoles.forEach(role => keywords.add(role));

    // Add important keywords
    resumeAnalysis.importantKeywords.forEach(kw => keywords.add(kw.term));

    return Array.from(keywords);
}

export default {
    parseResumeBuffer,
    analyzeResumeText,
    extractTextFromPDF,
    extractTextFromDOCX,
    generateSearchKeywords,
};
