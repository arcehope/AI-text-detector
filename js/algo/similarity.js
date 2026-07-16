/**
 * Algorithm 3: Stylometric Cosine Similarity (Vector Space Model)
 * 
 * Compares the grammatical and stylistic structure of the document against
 * pre-calculated standard vector profiles of AI-generated text and Human-written text.
 * 
 * Vector Dimensions (Stylometric Features):
 * 1. First-Person Pronoun Ratio (I, me, my, we, our)
 * 2. Complex Conjunction Ratio (furthermore, consequently, nevertheless, etc.)
 * 3. Intensifier Density (deeply, extremely, highly, pivotal, crucial)
 * 4. Passive Voice Index (is/was/been + verb ending in -ed)
 * 5. Hapax Legomena Ratio (words occurring exactly once - high in humans)
 */

class CosineSimilarityAnalyzer {
    constructor() {
        // Prototype Profile Vectors [FirstPerson, Transitions, Intensifiers, PassiveVoice, HapaxRatio]
        // Standardized templates representing perfect AI text vs perfect human text
        this.prototypeAI = [0.08, 0.85, 0.80, 0.75, 0.35];
        this.prototypeHuman = [0.65, 0.20, 0.25, 0.28, 0.78];
        
        // Match expressions
        this.firstPersonWords = new Set(['i', 'me', 'my', 'myself', 'we', 'us', 'our', 'ours', 'ourselves']);
        
        this.complexTransitions = new Set([
            'furthermore', 'moreover', 'consequently', 'therefore', 'nevertheless', 
            'nonetheless', 'conversely', 'thus', 'accordingly', 'hence', 
            'subsequently', 'further', 'in contrast', 'in addition', 'alternatively',
            'however', 'additionally', 'typically', 'generally', 'standardly',
            'specifically', 'notably', 'particularly', 'as a result', 'for instance',
            'for example', 'indeed', 'besides', 'on the other hand', 'although',
            'especially', 'also', 'instead', 'meanwhile', 'though', 'while'
        ]);
        
        this.intensifiers = new Set([
            'deeply', 'extremely', 'highly', 'absolutely', 'crucial', 'essential', 
            'pivotal', 'invaluable', 'seamlessly', 'intricate', 'testament', 
            'revolutionary', 'foster', 'vital', 'profoundly', 'remarkably',
            'significantly', 'comprehensively', 'drastically', 'uniquely', 'key',
            'major', 'critical', 'transformative', 'dynamic', 'optimal',
            'optimized', 'streamlined', 'enhance', 'leverage', 'synergy',
            'beacon', 'paramount', 'meticulously', 'revolutionize', 'underscores',
            'paradigm', 'holistic', 'showcase', 'increasingly', 'substantially',
            'unprecedented', 'interconnected', 'sustainable', 'sustainability',
            'mitigate', 'combating', 'resilience', 'resilient', 'urgency',
            'imperative', 'indispensable',
            'valuable', 'precious', 'unnecessary', 'meaningful', 'discipline', 
            'punctual'
        ]);
    }

    /**
     * Compute Cosine Similarity between vector A and vector B
     * Formula: dotProduct(A, B) / (magnitude(A) * magnitude(B))
     */
    calculateCosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) return 0;

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

    /**
     * Parse text and extract the document's 5D Stylometric Vector
     */
    extractStylometricProfile(text) {
        const cleanText = text.toLowerCase();
        // Extract words, removing punctuation
        const words = cleanText.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;

        if (wordCount === 0) {
            return [0, 0, 0, 0, 0];
        }

        // 1. First-Person Pronouns Density
        let firstPersonCount = 0;
        words.forEach(w => {
            if (this.firstPersonWords.has(w)) firstPersonCount++;
        });
        const firstPersonRatio = firstPersonCount / wordCount;
        // Normalize: mapping 0% to 0.0, and 4%+ to 1.0
        const valFirstPerson = Math.min(1.0, firstPersonRatio / 0.04);

        // 2. Complex Conjunctions Density
        let transitionCount = 0;
        words.forEach(w => {
            if (this.complexTransitions.has(w)) transitionCount++;
        });
        const transitionRatio = transitionCount / wordCount;
        // Normalize: mapping 0% to 0.0, and 4%+ to 1.0
        const valTransitions = Math.min(1.0, transitionRatio / 0.04);

        // 3. Intensifiers and AI Buzzwords Density
        let intensifierCount = 0;
        words.forEach(w => {
            if (this.intensifiers.has(w)) intensifierCount++;
        });
        const intensifierRatio = intensifierCount / wordCount;
        // Normalize: mapping 0% to 0.0, and 4.5%+ to 1.0
        const valIntensifiers = Math.min(1.0, intensifierRatio / 0.045);

        // 4. Passive Voice Index (approximated via regex match for auxiliary verbs + past participle)
        // Match structures like: "is defined", "was executed", "have been completed", "can be seen"
        const passiveMatches = cleanText.match(/\b(is|was|were|be|been|being)\s+(\w+ed|\w+en|made|built|kept|thought|set|left|felt|run|read|done|taken|known|written|given|shown)\b/g) || [];
        const passiveRatio = passiveMatches.length / wordCount;
        // Normalize: mapping 0% to 0.0, and 1.5%+ to 1.0
        const valPassive = Math.min(1.0, passiveRatio / 0.015);

        // 5. Hapax Legomena Ratio (Vocabulary uniqueness density - length adjusted)
        const wordCounts = {};
        words.forEach(w => {
            wordCounts[w] = (wordCounts[w] || 0) + 1;
        });
        let hapaxCount = 0;
        for (const w in wordCounts) {
            if (wordCounts[w] === 1) hapaxCount++;
        }
        const hapaxRatio = hapaxCount / wordCount;
        
        // Expected human hapax ratio is high, length-dependent
        const expectedHapax = 0.85 - (wordCount * 0.0003);
        const hapaxDiff = expectedHapax - hapaxRatio;
        const valHapax = Math.min(1.0, Math.max(0.0, 0.3 + hapaxDiff * 2));

        return [
            parseFloat(valFirstPerson.toFixed(3)),
            parseFloat(valTransitions.toFixed(3)),
            parseFloat(valIntensifiers.toFixed(3)),
            parseFloat(valPassive.toFixed(3)),
            parseFloat(valHapax.toFixed(3))
        ];
    }

    /**
     * Run comparative Cosine Similarity analysis
     */
    analyze(text) {
        const docVector = this.extractStylometricProfile(text);
        
        const simToAI = this.calculateCosineSimilarity(docVector, this.prototypeAI);
        const simToHuman = this.calculateCosineSimilarity(docVector, this.prototypeHuman);

        // Calculate a score from 0 (completely human similarity match) to 100 (completely AI similarity match)
        // Formula balances similarity magnitudes
        let finalScore = 50;
        if (simToAI + simToHuman > 0) {
            // Mapping score relative to the distance difference
            const diff = simToAI - simToHuman; // Range: -1.0 to 1.0
            finalScore = ((diff + 1) / 2) * 100; // Map to 0 - 100
        }

        // Clamp values
        finalScore = Math.min(100, Math.max(0, finalScore));

        return {
            vector: docVector,
            similarityToAI: parseFloat(simToAI.toFixed(4)),
            similarityToHuman: parseFloat(simToHuman.toFixed(4)),
            score: parseFloat(finalScore.toFixed(1)),
            radarMetrics: {
                firstPerson: docVector[0],
                transitions: docVector[1],
                intensifiers: docVector[2],
                passiveVoice: docVector[3],
                hapaxRatio: docVector[4]
            }
        };
    }
}

// Export for browser global context
window.CosineSimilarityAnalyzer = CosineSimilarityAnalyzer;
