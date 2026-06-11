/**
 * Algorithm 4: Heuristic Grammar & Typography Analyzer
 * 
 * Analyzes the text for common grammatical slip-ups, double negatives, 
 * punctuation spacing issues, capitalization errors, and duplicate words.
 * 
 * - Perfect Grammar (100% Score): Highly characteristic of AI generation.
 * - Lower Grammar Score (under 95%): Typographical and grammatical errors 
 *   are a strong signal of human origin.
 */

class GrammarStyleAnalyzer {
    constructor() {
        this.rules = [
            {
                id: 'duplicate_words',
                name: 'Duplicate Words',
                description: 'Consecutive duplicate words (e.g., "the the").',
                regex: /\b(\w+)\s+\1\b/gi,
                weight: 1.5
            },
            {
                id: 'lowercase_i',
                name: 'Lowercase "i" Pronoun',
                description: 'Lowercase pronoun "i" instead of "I".',
                regex: /\bi\b/g,
                weight: 1.0
            },
            {
                id: 'spacing_before_punct',
                name: 'Punctuation Spacing Error',
                description: 'Space before punctuation marks (e.g., "word ,").',
                regex: /\s+[.,!?]/g,
                weight: 0.8
            },
            {
                id: 'no_spacing_after_punct',
                name: 'Missing Space after Punctuation',
                description: 'No space after a period or comma.',
                regex: /[.,!?][a-zA-Z]/g,
                weight: 1.0
            },
            {
                id: 'lowercase_sentence_start',
                name: 'Lowercase Sentence Start',
                description: 'Sentence starting with a lowercase letter.',
                regex: /(?:^[a-z]|\b[.!?]\s+[a-z])/g,
                weight: 1.2
            },
            {
                id: 'subject_verb_mismatch_singular',
                name: 'Subject-Verb Mismatch (Singular)',
                description: 'Third-person singular pronoun with a plural verb (e.g., "he go", "it have").',
                regex: /\b(he|she|it|this|that)\s+(have|go|run|like|want|do|take|make|come|say|think|see)\b/gi,
                weight: 1.5
            },
            {
                id: 'subject_verb_mismatch_plural',
                name: 'Subject-Verb Mismatch (Plural)',
                description: 'Plural pronoun with a singular verb (e.g., "they has", "we goes").',
                regex: /\b(they|we|you)\s+(has|goes|runs|likes|wants|does|takes|makes|comes|says|thinks|sees)\b/gi,
                weight: 1.5
            },
            {
                id: 'clunky_preposition',
                name: 'Clunky Prepositional auxiliary',
                description: 'Incorrect auxiliary construction (e.g., "should of", "could of").',
                regex: /\b(should|could|would)\s+of\b/gi,
                weight: 1.5
            },
            {
                id: 'double_negative',
                name: 'Double Negative',
                description: 'Incorrect double negative construct (e.g., "don\'t no").',
                regex: /\b(dont|don\'t|cannot|can\'t|won\'t|wont)\s+(no|never)\b/gi,
                weight: 1.2
            }
        ];
    }

    analyze(text) {
        if (!text) {
            return {
                issueCount: 0,
                perfectionScore: 100,
                issues: []
            };
        }

        const issues = [];
        let totalPenalty = 0;

        this.rules.forEach(rule => {
            // Reset regex lastIndex
            rule.regex.lastIndex = 0;
            
            const regexCopy = new RegExp(rule.regex.source, rule.regex.flags);
            const matches = text.match(regexCopy) || [];
            
            if (matches.length > 0) {
                totalPenalty += matches.length * rule.weight;
                issues.push({
                    ruleId: rule.id,
                    name: rule.name,
                    description: rule.description,
                    count: matches.length,
                    occurrences: matches.slice(0, 5)
                });
            }
        });

        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
        // Calculate penalty per 100 words
        const normalizedPenalty = (totalPenalty / Math.max(10, wordCount)) * 100;
        
        let perfectionScore = 100 - (normalizedPenalty * 15);
        perfectionScore = Math.min(100, Math.max(0, parseFloat(perfectionScore.toFixed(1))));

        return {
            issueCount: issues.reduce((sum, i) => sum + i.count, 0),
            perfectionScore,
            issues
        };
    }
}

// Export for browser global context
window.GrammarStyleAnalyzer = GrammarStyleAnalyzer;
