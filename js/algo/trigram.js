/**
 * Algorithm 6: Character Trigram Cosine Similarity Analyzer
 * 
 * Extracts relative frequencies of character trigrams that strongly distinguish
 * human writing (such as space-comma spacing typos or parenthesis usage)
 * from grammatically structured AI outputs.
 */

class TrigramAnalyzer {
    constructor() {
        // Top 20 character trigrams distinguishing Human vs AI (scaled to 10000x for precision)
        this.humanProfile = {
            ' , ': 73.67, ' . ': 68.01, 's, ': 2.34, ' th': 183.58, ' in': 47.24, 
            'to ': 53.23, ' * ': 15.20, ' " ': 15.05, ' to': 56.08, 'ly ': 30.50, 
            's .': 13.72, 'you': 38.40, 's ,': 13.45, ' yo': 38.37, ' ) ': 12.70, 
            's. ': 2.35,  ' ( ': 11.73, ' ca': 25.37, 'or ': 31.40, 'e .': 11.54
        };
        this.aiProfile = {
            ' , ': 0.01,  ' . ': 0.02,  's, ': 21.66, ' th': 166.32, ' in': 64.25, 
            'to ': 69.06, ' * ': 0.00,  ' " ': 0.00,  ' to': 70.84, 'ly ': 16.29, 
            's .': 0.02,  'you': 52.01, 's ,': 0.00,  ' yo': 51.60, ' ) ': 0.00, 
            's. ': 14.38, ' ( ': 0.00,  ' ca': 37.09, 'or ': 43.08, 'e .': 0.02
        };
        this.trigrams = Object.keys(this.humanProfile);
    }

    /**
     * Compute Cosine Similarity between document trigram counts and Human/AI profiles
     * @param {string} text - The input text
     * @returns {Object} Similarity scores and final percentage
     */
    analyze(text) {
        if (!text || text.length < 10) {
            return { score: 50, similarityToAI: 0.5, similarityToHuman: 0.5 };
        }
        
        // Clean text to lowercase and compress whitespace
        const cleanText = text.toLowerCase().replace(/\s+/g, ' ');
        const counts = {};
        this.trigrams.forEach(tg => counts[tg] = 0);
        
        let totalTrigrams = 0;
        for (let i = 0; i < cleanText.length - 2; i++) {
            const tg = cleanText.substring(i, i + 3);
            if (counts.hasOwnProperty(tg)) {
                counts[tg]++;
            }
            totalTrigrams++;
        }
        
        if (totalTrigrams === 0) {
            return { score: 50, similarityToAI: 0, similarityToHuman: 0 };
        }
        
        // Build document vector (relative frequencies scaled to match centroids)
        const docVector = this.trigrams.map(tg => (counts[tg] / totalTrigrams) * 10000);
        
        // Profiles as vectors
        const humanVec = this.trigrams.map(tg => this.humanProfile[tg]);
        const aiVec = this.trigrams.map(tg => this.aiProfile[tg]);
        
        const simToAI = this.calculateCosine(docVector, aiVec);
        const simToHuman = this.calculateCosine(docVector, humanVec);
        
        let score = 50;
        if (simToAI + simToHuman > 0) {
            const diff = simToAI - simToHuman; // Range: -1.0 to 1.0
            score = ((diff + 1) / 2) * 100;    // Map to 0 - 100%
        }
        
        return {
            score: Math.min(100, Math.max(0, score)),
            similarityToAI: parseFloat(simToAI.toFixed(4)),
            similarityToHuman: parseFloat(simToHuman.toFixed(4)),
            vector: docVector
        };
    }

    calculateCosine(vecA, vecB) {
        let dotProduct = 0;
        let sumSquareA = 0;
        let sumSquareB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            sumSquareA += vecA[i] * vecA[i];
            sumSquareB += vecB[i] * vecB[i];
        }
        
        const magnitudeA = Math.sqrt(sumSquareA);
        const magnitudeB = Math.sqrt(sumSquareB);
        
        if (magnitudeA === 0 || magnitudeB === 0) return 0;
        return dotProduct / (magnitudeA * magnitudeB);
    }
}

window.TrigramAnalyzer = TrigramAnalyzer;
