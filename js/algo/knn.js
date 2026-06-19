/**
 * Algorithm 2: K-Nearest Neighbors (KNN) Stylometric Classifier
 * 
 * Extracts a 5-dimensional stylometric feature vector from text and computes
 * classification using Euclidean distance relative to a pre-defined training set
 * of AI-generated and Human-written documents.
 * 
 * Features:
 * 1. Lexical Diversity (Type-Token Ratio)
 * 2. Sentence Length Variance (Burstiness)
 * 3. AI Transition Word Density (delve, testament, etc.)
 * 4. Coleman-Liau Readability Index
 * 5. Punctuation Density (Commas, periods, semicolons per 100 words)
 */

class KNNClassifier {
    constructor() {
        this.k = 5; // Use 5 nearest neighbors

        // Training Dataset
        // Labeled feature vectors representing typical AI and Human writing.
        // Vector format: [LexicalDiversity, Burstiness, AiWordDensity, ReadabilityIndex, PunctuationDensity]
        // Normalization range for each index: 0.0 (strictly human signature) to 1.0 (strictly AI signature)
        this.trainingSet = [
            // --- AI CLASS (Label: 1) ---
            { vector: [0.85, 0.88, 0.82, 0.80, 0.85], label: 1, type: 'AI (GPT-4 Essay)' },
            { vector: [0.88, 0.84, 0.78, 0.82, 0.80], label: 1, type: 'AI (ChatGPT Report)' },
            { vector: [0.80, 0.86, 0.90, 0.85, 0.82], label: 1, type: 'AI (Claude 3.5 Blog)' },
            { vector: [0.83, 0.90, 0.85, 0.78, 0.84], label: 1, type: 'AI (Llama Explanation)' },
            { vector: [0.90, 0.82, 0.70, 0.86, 0.80], label: 1, type: 'AI (GPT-4o Summary)' },
            { vector: [0.78, 0.89, 0.88, 0.81, 0.83], label: 1, type: 'AI (Gemini Explainer)' },
            { vector: [0.82, 0.91, 0.82, 0.79, 0.86], label: 1, type: 'AI (Academic Assistant)' },
            { vector: [0.86, 0.86, 0.78, 0.83, 0.82], label: 1, type: 'AI (Tech Description)' },
            { vector: [0.89, 0.84, 0.81, 0.77, 0.85], label: 1, type: 'AI (Resume Builder)' },
            { vector: [0.81, 0.90, 0.87, 0.80, 0.80], label: 1, type: 'AI (Creative Draft)' },
            { vector: [0.84, 0.85, 0.76, 0.76, 0.77], label: 1, type: 'AI (Business Proposal)' },
            { vector: [0.87, 0.88, 0.84, 0.85, 0.83], label: 1, type: 'AI (Code Documentation)' },
            { vector: [0.79, 0.90, 0.89, 0.82, 0.84], label: 1, type: 'AI (Marketing Copy)' },
            { vector: [0.83, 0.86, 0.79, 0.78, 0.78], label: 1, type: 'AI (Short Essay)' },
            { vector: [0.88, 0.83, 0.83, 0.81, 0.80], label: 1, type: 'AI (Formal Letter)' },
            { vector: [0.62, 0.58, 0.60, 0.85, 0.82], label: 1, type: 'AI (Formal Essay - Climate)' },
            { vector: [0.55, 0.62, 0.68, 0.88, 0.80], label: 1, type: 'AI (Formal Essay - Science)' },
            { vector: [0.58, 0.54, 0.64, 0.84, 0.78], label: 1, type: 'AI (Academic - Humanities)' },
            { vector: [0.60, 0.60, 0.72, 0.86, 0.84], label: 1, type: 'AI (Polished Report - Policy)' },
            { vector: [0.54, 0.56, 0.62, 0.80, 0.76], label: 1, type: 'AI (Structured Blog - Tech)' },

            // --- HUMAN CLASS (Label: 0) ---
            { vector: [0.35, 0.20, 0.15, 0.45, 0.30], label: 0, type: 'Human (Journalism)' },
            { vector: [0.42, 0.15, 0.10, 0.50, 0.35], label: 0, type: 'Human (Personal Blog)' },
            { vector: [0.28, 0.32, 0.20, 0.38, 0.25], label: 0, type: 'Human (Novel Excerpt)' },
            { vector: [0.50, 0.18, 0.05, 0.60, 0.40], label: 0, type: 'Human (Academic Paper)' },
            { vector: [0.38, 0.25, 0.12, 0.42, 0.28], label: 0, type: 'Human (Opinion Piece)' },
            { vector: [0.45, 0.22, 0.18, 0.48, 0.33], label: 0, type: 'Human (Tech Article)' },
            { vector: [0.31, 0.35, 0.08, 0.35, 0.22], label: 0, type: 'Human (Diary Entry)' },
            { vector: [0.48, 0.12, 0.14, 0.55, 0.38], label: 0, type: 'Human (History Essay)' },
            { vector: [0.39, 0.28, 0.11, 0.41, 0.29], label: 0, type: 'Human (Book Review)' },
            { vector: [0.25, 0.40, 0.16, 0.30, 0.20], label: 0, type: 'Human (Creative Story)' },
            { vector: [0.44, 0.21, 0.13, 0.47, 0.31], label: 0, type: 'Human (Business Memo)' },
            { vector: [0.52, 0.16, 0.09, 0.62, 0.42], label: 0, type: 'Human (Research Draft)' },
            { vector: [0.36, 0.30, 0.17, 0.39, 0.27], label: 0, type: 'Human (Email Draft)' },
            { vector: [0.41, 0.26, 0.12, 0.46, 0.34], label: 0, type: 'Human (Feature Column)' },
            { vector: [0.30, 0.38, 0.07, 0.33, 0.24], label: 0, type: 'Human (Dialogue Story)' },
            { vector: [0.55, 0.42, 0.12, 0.78, 0.68], label: 0, type: 'Human (Formal Essay)' },
            { vector: [0.52, 0.38, 0.15, 0.74, 0.65], label: 0, type: 'Human (Academic - Science)' },
            { vector: [0.48, 0.45, 0.10, 0.70, 0.60], label: 0, type: 'Human (Policy Draft)' },
            { vector: [0.50, 0.40, 0.14, 0.72, 0.62], label: 0, type: 'Human (Philosophy Paper)' },
            { vector: [0.58, 0.35, 0.08, 0.80, 0.70], label: 0, type: 'Human (Literary Analysis)' }
        ];
    }

    /**
     * Compute Coleman-Liau Readability Index
     * Formula: CLI = 0.0588 * L - 0.296 * S - 15.8
     * L = average number of letters per 100 words
     * S = average number of sentences per 100 words
     */
    calculateColemanLiauIndex(text, wordCount, sentenceCount) {
        if (wordCount === 0) return 0;
        const letters = text.replace(/[^A-Za-z]/g, '').length;
        const L = (letters / wordCount) * 100;
        const S = (sentenceCount / wordCount) * 100;
        const cli = 0.0588 * L - 0.296 * S - 15.8;
        return Math.min(20, Math.max(0, cli)); // Cap index at 0-20 grade levels
    }

    /**
     * Calculate punctuation frequency per 100 words
     */
    calculatePunctuationDensity(text, wordCount) {
        if (wordCount === 0) return 0;
        const punctuationCount = (text.match(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g) || []).length;
        return (punctuationCount / wordCount) * 100;
    }

    /**
     * Extract 5D stylometric vector normalized to [0, 1] range for matching
     */
    extractFeatures(text, analysis1Result) {
        const { wordCount, sentenceCount, ttr, burstiness } = analysis1Result;

        // 1. Lexical Diversity feature (Lower diversity relative to text length = AI pattern)
        const expectedTtr = 0.86 - (wordCount * 0.0003);
        const ttrDiff = expectedTtr - ttr;
        const featLexicalDiversity = Math.min(1.0, Math.max(0.0, 0.5 + ttrDiff * 2.5));

        // 2. Burstiness feature (Lower variance in sentence length = AI pattern)
        const featBurstiness = Math.min(1.0, Math.max(0.0, 1.0 - (burstiness / 12)));

        // 3. AI word density (AI-favored words count)
        const words = text.toLowerCase().split(/\s+/);
        let aiWordCount = 0;
        const analyzer = new window.PerplexityAnalyzer();
        words.forEach(w => {
            const cleanWord = w.replace(/[^\w]/g, '');
            if (analyzer.aiFavoredWords.has(cleanWord)) {
                aiWordCount++;
            }
        });
        const aiDensity = aiWordCount / Math.max(1, wordCount);
        const featAiWordDensity = Math.min(1.0, aiDensity / 0.030);

        // 4. Readability consistency (Coleman-Liau grade level)
        const gradeLevel = this.calculateColemanLiauIndex(text, wordCount, sentenceCount);
        const featReadability = Math.min(1.0, Math.max(0.0, 1 - Math.abs(13 - gradeLevel) / 12));

        // 5. Punctuation density (AI sentence structures are clean and standard)
        const punct = this.calculatePunctuationDensity(text, wordCount);
        const featPunctuation = Math.min(1.0, Math.max(0.0, 1 - Math.abs(11 - punct) / 12));

        return {
            vector: [
                parseFloat(featLexicalDiversity.toFixed(3)),
                parseFloat(featBurstiness.toFixed(3)),
                parseFloat(featAiWordDensity.toFixed(3)),
                parseFloat(featReadability.toFixed(3)),
                parseFloat(featPunctuation.toFixed(3))
            ],
            rawMetrics: {
                ttr,
                burstiness,
                aiDensity: parseFloat((aiDensity * 100).toFixed(2)),
                gradeLevel: parseFloat(gradeLevel.toFixed(1)),
                punctuationPer100: parseFloat(punct.toFixed(1))
            }
        };
    }

    /**
     * Calculate Euclidean distance between two vectors
     */
    calculateDistance(vecA, vecB) {
        // Weighted Euclidean Distance: prioritize TTR, Burstiness, and AI Word Density
        const weights = [2.5, 2.5, 1.5, 0.5, 0.5];
        let sum = 0;
        for (let i = 0; i < vecA.length; i++) {
            const diff = vecA[i] - vecB[i];
            sum += weights[i] * diff * diff;
        }
        return Math.sqrt(sum);
    }

    /**
     * Classify input vector using KNN
     */
    classify(inputVector) {
        // Calculate distance to all training items
        const distances = this.trainingSet.map(item => {
            const dist = this.calculateDistance(inputVector, item.vector);
            return {
                ...item,
                distance: parseFloat(dist.toFixed(4))
            };
        });

        // Sort by distance ascending
        distances.sort((a, b) => a.distance - b.distance);

        // Take K nearest neighbors
        const nearestNeighbors = distances.slice(0, this.k);

        // Count votes
        let aiVotes = 0;
        let humanVotes = 0;
        
        nearestNeighbors.forEach(n => {
            if (n.label === 1) aiVotes++;
            else humanVotes++;
        });

        // Compute AI percentage based on votes
        const aiScore = (aiVotes / this.k) * 100;

        return {
            neighbors: nearestNeighbors,
            aiVotes,
            humanVotes,
            score: aiScore,
            prediction: aiScore >= 60 ? 'AI-Generated' : (aiScore <= 40 ? 'Human-Written' : 'Mixed/Undetermined')
        };
    }
}

// Export for browser global context
window.KNNClassifier = KNNClassifier;
