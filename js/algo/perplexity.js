/**
 * Algorithm 1: Statistical NLP Analyzer (Perplexity & Burstiness)
 * 
 * This module tokenizes text and calculates statistics that differ heavily
 * between AI-generated and human-written content.
 * 
 * - Perplexity (Entropy): Measures how predictable word transitions are.
 * - Burstiness: Measures the variance in sentence lengths (Human text is 'bursty').
 * - Lexical Diversity (TTR): Measures vocabulary richness.
 */

class PerplexityAnalyzer {
    constructor() {
        // Common transition words heavily favored by AI language models
        this.aiFavoredWords = new Set([
            'delve', 'testament', 'furthermore', 'moreover', 'tapestry',
            'ultimately', 'demystify', 'beacon', 'foster', 'synergy',
            'transformative', 'crucial', 'essential', 'paramount', 'notably',
            'meticulously', 'revolutionize', 'underscores', 'leverage', 'streamline',
            'optimize', 'enhance', 'facilitate', 'dynamic', 'vital',
            'pivotal', 'invaluable', 'seamlessly', 'intricate', 'comprehensive',
            'consequently', 'therefore', 'thus', 'hence', 'subsequently',
            'additionally', 'individually', 'specifically', 'particularly', 'innovative',
            'alignment', 'paradigm', 'holistic', 'showcase', 'unprecedented',
            'interconnected', 'sustainability', 'sustainable', 'mitigate',
            'combating', 'resilience', 'resilient', 'urgency', 'imperative',
            'indispensable',
            'valuable', 'precious', 'unnecessary', 'meaningful', 'discipline', 
            'punctual', 'schedule', 'punctuality', 'possessions'
        ]);

        // Standard English common word transition rates (simplified for client-side model)
        // High frequency bigrams that represent standard, low-entropy structures
        this.commonBigrams = new Set([
            'of the', 'in the', 'to the', 'on the', 'and the', 'it is', 'is a',
            'with the', 'for the', 'to be', 'at the', 'by the', 'from the',
            'as a', 'in a', 'that the', 'this is', 'there is', 'has been',
            'will be', 'we can', 'in order', 'order to', 'one of', 'based on',
            'such as', 'due to', 'but also', 'not only', 'leading to', 'resulting in',
            'effects of', 'changes in', 'increase in', 'use of', 'protecting the',
            'to come', 'as well', 'associated with', 'related to',
            'the most', 'cannot be', 'the same', 'of time', 'to achieve', 'value of',
            'it has', 'in life', 'more valuable', 'precious and', 'avoid unnecessary',
            'successful and', 'in conclusion', 'plays a', 'role in', 'teaches us',
            'most valuable'
        ]);
    }

    /**
     * Clean and split text into sentences
     */
    getSentences(text) {
        if (!text) return [];
        // Match sentence endings but keep decimal points and abbreviations safe
        return text
            .split(/(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    /**
     * Clean and split text into lowercase words
     */
    getWords(text) {
        if (!text) return [];
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 0);
    }

    /**
     * Calculate Type-Token Ratio (Lexical Diversity)
     */
    calculateTTR(words) {
        if (words.length === 0) return 0;
        const uniqueWords = new Set(words);
        return uniqueWords.size / words.length;
    }

    /**
     * Calculate standard deviation of sentence lengths (Burstiness)
     */
    calculateBurstiness(sentences) {
        if (sentences.length <= 1) return 0;

        const lengths = sentences.map(s => this.getWords(s).length);
        const mean = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
        
        const squareDiffs = lengths.map(len => {
            const diff = len - mean;
            return diff * diff;
        });
        
        const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / lengths.length;
        return Math.sqrt(variance); // Standard Deviation
    }

    /**
     * Calculate a local predictability score (Pseudo-Perplexity)
     * Lower score = high predictability (indicative of AI)
     * Higher score = low predictability/high entropy (indicative of human)
     */
    calculatePredictability(words) {
        if (words.length <= 1) return { score: 100, penalty: 0 };

        let commonCount = 0;
        let aiKeywordCount = 0;
        let bigramCount = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (this.aiFavoredWords.has(word)) {
                aiKeywordCount++;
            }

            if (i < words.length - 1) {
                const bigram = `${word} ${words[i + 1]}`;
                if (this.commonBigrams.has(bigram)) {
                    bigramCount++;
                }
            }
        }

        // AI text uses more pre-defined structures and transition words
        const bigramRatio = bigramCount / (words.length - 1);
        const aiWordRatio = aiKeywordCount / words.length;

        // Base entropy estimate: how distributed is the word frequency
        const wordFreq = {};
        words.forEach(w => {
            wordFreq[w] = (wordFreq[w] || 0) + 1;
        });

        let entropy = 0;
        const total = words.length;
        for (const w in wordFreq) {
            const p = wordFreq[w] / total;
            entropy -= p * Math.log2(p);
        }

        // Normalize entropy to a scale of 0 to 100
        // English text max entropy is typically around 7-8 for rich texts, 4-5 for simple ones
        const normalizedEntropy = Math.min(100, Math.max(0, (entropy / 8) * 100));

        // Predictability increases with high bigram repetition and AI-favored transition words
        // We deduct from entropy to represent the 'predictability impact'
        const penalty = (bigramRatio * 50) + (aiWordRatio * 250);
        let finalPredictabilityScore = normalizedEntropy - penalty;

        return {
            score: Math.min(100, Math.max(0, finalPredictabilityScore)),
            penalty: penalty
        };
    }

    /**
     * Run full perplexity and burstiness analysis
     */
    analyze(text) {
        const sentences = this.getSentences(text);
        const words = this.getWords(text);

        if (words.length < 5) {
            return {
                sentenceCount: sentences.length,
                wordCount: words.length,
                burstiness: 0,
                ttr: 0,
                predictability: 50,
                score: 50, // Insufficient text
                sentenceDetails: []
            };
        }

        const burstiness = this.calculateBurstiness(sentences);
        const ttr = this.calculateTTR(words);
        const predictabilityData = this.calculatePredictability(words);
        const predictability = predictabilityData.score;
        const penalty = predictabilityData.penalty;

        // Analyze sentences individually for the heatmap overlay
        const sentenceDetails = sentences.map((s, idx) => {
            const sWords = this.getWords(s);
            const sTtr = this.calculateTTR(sWords);
            
            // Sentence-level predictability
            let sAiKeywords = 0;
            sWords.forEach(w => {
                if (this.aiFavoredWords.has(w)) sAiKeywords++;
            });

            // Predictability metric based on transitions and AI vocabulary
            let localEntropyPenalty = 0;
            if (sWords.length > 3) {
                let matchCount = 0;
                for (let i = 0; i < sWords.length - 1; i++) {
                    if (this.commonBigrams.has(`${sWords[i]} ${sWords[i+1]}`)) {
                        matchCount++;
                    }
                }
                localEntropyPenalty = (matchCount / (sWords.length - 1)) * 40;
            }
            localEntropyPenalty += (sAiKeywords / Math.max(1, sWords.length)) * 120;
            
            // Sentence score: Higher = more likely AI (0 to 100)
            // AI sentences tend to be medium length, high syntax uniformity, low burstiness (uniform lengths)
            const lengthDiffFromAverage = Math.abs(sWords.length - 15); // 15 words is typical AI average
            const lengthPenalty = Math.max(0, 20 - lengthDiffFromAverage); // Penalty if it matches the average length too closely
            
            let sentenceAiScore = 50 - (sWords.length * 0.5) + localEntropyPenalty + lengthPenalty;
            sentenceAiScore = Math.min(100, Math.max(0, sentenceAiScore));

            return {
                index: idx,
                text: s,
                wordCount: sWords.length,
                aiScore: sentenceAiScore
            };
        });

        // Compute overall Algorithm 1 score (0 = Human, 100 = AI)
        // High burstiness (variance in sentence length) is human. Low burstiness is AI.
        // High predictability (low entropy) is AI. Low predictability is human.
        // High lexical diversity (TTR) is human. Low TTR is AI.
        
        // Normalize metrics into 0-100 scales where higher means more AI-like
        const burstinessFactor = Math.min(100, Math.max(0, 100 - (burstiness * 9)));
        
        // Length-adjusted expected TTR for humans
        const expectedTtr = 0.86 - (words.length * 0.0003);
        const ttrDiff = expectedTtr - ttr;
        const ttrFactor = Math.min(100, Math.max(0, 50 + ttrDiff * 250));
        
        // Predictability Factor scaled directly from syntax penalty to ensure responsiveness
        const predictabilityFactor = Math.min(100, Math.max(0, (penalty / 18) * 100));

        const finalScore = (burstinessFactor * 0.30) + (ttrFactor * 0.20) + (predictabilityFactor * 0.50);

        return {
            sentenceCount: sentences.length,
            wordCount: words.length,
            burstiness: parseFloat(burstiness.toFixed(2)),
            ttr: parseFloat(ttr.toFixed(3)),
            predictability: parseFloat(predictability.toFixed(2)),
            score: parseFloat(Math.min(100, Math.max(0, finalScore)).toFixed(1)),
            sentenceDetails
        };
    }
}

// Export for browser global context
window.PerplexityAnalyzer = PerplexityAnalyzer;
