/**
 * Algorithm 5: Stylometric Logistic Regression Classifier
 * 
 * Classifies documents based on a 5-dimensional stylometric feature vector.
 * The model was trained on a 1,000-sample balanced dataset of human-written and AI-generated essays.
 * 
 * Features:
 * 1. Lexical Diversity (Type-Token Ratio)
 * 2. Sentence Length Variance (Burstiness)
 * 3. AI Transition Word Density
 * 4. Coleman-Liau Readability Index
 * 5. Punctuation Density
 */

class LogisticRegressionClassifier {
    constructor() {
        this.intercept = -10.87000;
        this.weights = [6.79418, -0.17427, 0.58039, 5.29141, 2.93657];
    }

    /**
     * Predict the probability of text being AI-generated
     * @param {number[]} vector - 5D stylometric feature vector
     * @returns {number} Probability between 0.0 (strictly human) and 1.0 (strictly AI)
     */
    predict(vector) {
        let logit = this.intercept;
        for (let i = 0; i < vector.length; i++) {
            logit += vector[i] * this.weights[i];
        }
        // Sigmoid activation function
        return 1 / (1 + Math.exp(-logit));
    }
}

window.LogisticRegressionClassifier = LogisticRegressionClassifier;
