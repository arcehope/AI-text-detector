/**
 * Algorithm 7: Part-of-Speech (POS) Ratio Cosine Similarity
 * 
 * Computes frequency ratios of determiners, prepositions, pronouns, conjunctions, 
 * and auxiliary verbs, matching the input document against Human and AI centroids.
 */

class PosClassifier {
    constructor() {
        this.prototypeHuman = [0.10807, 0.12348, 0.06775, 0.05454, 0.07221];
        this.prototypeAI = [0.11683, 0.13593, 0.05679, 0.05927, 0.07961];
        
        this.determiners = new Set(['a', 'an', 'the', 'this', 'that', 'these', 'those']);
        this.prepositions = new Set(['of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'from', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 'without', 'before', 'under', 'around', 'among']);
        this.pronouns = new Set(['i', 'me', 'my', 'myself', 'you', 'your', 'yours', 'yourself', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'we', 'us', 'our', 'ours', 'ourselves', 'they', 'them', 'their', 'theirs', 'themselves']);
        this.conjunctions = new Set(['and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'although', 'because', 'since', 'unless', 'whereas', 'while']);
        this.auxiliaries = new Set(['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'shall', 'will', 'should', 'would', 'may', 'might', 'must', 'can', 'could']);
    }

    /**
     * Extract POS ratios for the document
     * @param {string} text 
     * @returns {number[]} Vector containing [Det, Prep, Pron, Conj, Aux] ratios
     */
    extractProfile(text) {
        const words = text.toLowerCase().replace(/[^\w\s-]/g, '').split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        if (wordCount === 0) return [0, 0, 0, 0, 0];

        let det = 0, prep = 0, pron = 0, conj = 0, aux = 0;
        words.forEach(w => {
            if (this.determiners.has(w)) det++;
            else if (this.prepositions.has(w)) prep++;
            else if (this.pronouns.has(w)) pron++;
            else if (this.conjunctions.has(w)) conj++;
            else if (this.auxiliaries.has(w)) aux++;
        });

        return [det / wordCount, prep / wordCount, pron / wordCount, conj / wordCount, aux / wordCount];
    }

    /**
     * Run comparative Cosine Similarity analysis on POS ratios
     * @param {string} text 
     * @returns {Object} Similarity scores and final percentage
     */
    analyze(text) {
        const vec = this.extractProfile(text);
        const simToAI = this.calculateCosine(vec, this.prototypeAI);
        const simToHuman = this.calculateCosine(vec, this.prototypeHuman);

        let score = 50;
        if (simToAI + simToHuman > 0) {
            const diff = simToAI - simToHuman; // Range: -1.0 to 1.0
            score = ((diff + 1) / 2) * 100;
        }

        return {
            score: Math.min(100, Math.max(0, score)),
            similarityToAI: parseFloat(simToAI.toFixed(4)),
            similarityToHuman: parseFloat(simToHuman.toFixed(4)),
            vector: vec
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

window.PosClassifier = PosClassifier;
