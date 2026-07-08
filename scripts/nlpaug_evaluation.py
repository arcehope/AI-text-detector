import math
import re
import nltk

# Proactively ensure nltk databases for nlpaug are downloaded
for resource in ['wordnet', 'omw-1.4', 'averaged_perceptron_tagger', 'averaged_perceptron_tagger_eng']:
    try:
        nltk.data.find(f'corpora/{resource}' if resource in ['wordnet', 'omw-1.4'] else f'taggers/{resource}')
    except LookupError:
        print(f"Downloading NLTK {resource}...")
        nltk.download(resource, quiet=True)

import nlpaug.augmenter.char as nac
import nlpaug.augmenter.word as naw

# Original ChatGPT Climate Change Essay
original_text = """Climate change is one of the most significant challenges facing the world today. It refers to long-term changes in global temperatures and weather patterns. Although climate variations occur naturally, human activities such as burning fossil fuels, deforestation, and industrial production have greatly accelerated the process. The increase in greenhouse gases like carbon dioxide and methane traps heat in the atmosphere, leading to global warming and environmental instability.

The effects of climate change are becoming increasingly visible across the globe. Rising temperatures have caused glaciers and polar ice caps to melt, resulting in higher sea levels and increased risks of coastal flooding. Extreme weather events such as hurricanes, droughts, heatwaves, and heavy rainfall have become more frequent and severe. These changes not only threaten ecosystems and wildlife but also impact agriculture, water resources, and human health. Many communities, especially those in vulnerable regions, face growing challenges due to climate-related disasters.

Addressing climate change requires collective action from governments, businesses, and individuals. The use of renewable energy sources, improved energy efficiency, and sustainable environmental practices can help reduce greenhouse gas emissions. Reforestation, conservation efforts, and public awareness campaigns also play important roles in protecting the environment. By working together and adopting responsible practices, humanity can slow the effects of climate change and create a healthier, more sustainable future for generations to come."""

# Setup words and sentences helper
def parse_text(text):
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
    words = [w.lower() for w in re.sub(r'[^\w\s-]', '', text).split() if w]
    return sentences, words

# ----------------- Simulated JS Classifier Core -----------------
ai_favored_words = {
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
    'indispensable', 'increasingly', 'significant', 'greatly', 'collective', 
    'various', 'solutions', 'challenges', 'effective'
}

common_bigrams = {
    'of the', 'in the', 'to the', 'on the', 'and the', 'it is', 'is a',
    'with the', 'for the', 'to be', 'at the', 'by the', 'from the',
    'as a', 'in a', 'that the', 'this is', 'there is', 'has been',
    'will be', 'we can', 'in order', 'order to', 'one of', 'based on',
    'such as', 'due to', 'but also', 'not only', 'leading to', 'resulting in',
    'effects of', 'changes in', 'increase in', 'use of', 'protecting the',
    'to come', 'as well', 'associated with', 'related to'
}

# Cosine sets
cos_transitions = {
    'furthermore', 'moreover', 'consequently', 'therefore', 'however',
    'moreover', 'besides', 'additionally', 'although', 'especially', 'also',
    'thus', 'hence', 'instead', 'meanwhile', 'though', 'while'
}
cos_intensifiers = {
    'extremely', 'completely', 'absolutely', 'highly', 'very', 'totally',
    'greatly', 'quite', 'fairly', 'increasingly', 'significantly', 'substantially',
    'unprecedented', 'interconnected', 'sustainable', 'sustainability',
    'mitigate', 'combating', 'resilience', 'resilient', 'urgency', 'imperative',
    'indispensable'
}

# KNN training Set
knn_training_set = [
    # AI CLASS
    { "vector": [0.85, 0.88, 0.82, 0.80, 0.85], "label": 1 },
    { "vector": [0.88, 0.84, 0.78, 0.82, 0.80], "label": 1 },
    { "vector": [0.80, 0.86, 0.90, 0.85, 0.82], "label": 1 },
    { "vector": [0.83, 0.90, 0.85, 0.78, 0.84], "label": 1 },
    { "vector": [0.90, 0.82, 0.70, 0.86, 0.80], "label": 1 },
    { "vector": [0.62, 0.58, 0.60, 0.85, 0.82], "label": 1 },
    { "vector": [0.55, 0.62, 0.68, 0.88, 0.80], "label": 1 },
    # HUMAN CLASS
    { "vector": [0.35, 0.20, 0.15, 0.45, 0.30], "label": 0 },
    { "vector": [0.42, 0.15, 0.10, 0.50, 0.35], "label": 0 },
    { "vector": [0.28, 0.32, 0.20, 0.38, 0.25], "label": 0 },
    { "vector": [0.55, 0.42, 0.12, 0.78, 0.68], "label": 0 },
    { "vector": [0.52, 0.38, 0.15, 0.74, 0.65], "label": 0 }
]

def calculate_knn_distance(vecA, vecB):
    weights = [2.5, 2.5, 1.5, 0.5, 0.5]
    total = 0
    for i in range(len(vecA)):
        total += weights[i] * (vecA[i] - vecB[i]) ** 2
    return math.sqrt(total)

def cosine_similarity(v1, v2):
    dot = sum(a*b for a, b in zip(v1, v2))
    normA = math.sqrt(sum(a*a for a in v1))
    normB = math.sqrt(sum(b*b for b in v2))
    if normA == 0 or normB == 0:
        return 0
    return dot / (normA * normB)

def run_detector_simulation(text, num_typos=0):
    sentences, words = parse_text(text)
    word_count = len(words)
    sentence_count = len(sentences)
    if word_count < 10:
        return {"final_prob": 0, "score1": 0, "score2": 0, "score3": 0}

    # 1. Perplexity Score (NLP)
    ttr = len(set(words)) / word_count
    mean_len = word_count / sentence_count
    variance = sum((len(s.split()) - mean_len)**2 for s in sentences) / sentence_count
    burstiness = math.sqrt(variance)

    ai_keyword_count = sum(1 for w in words if w in ai_favored_words)
    bigram_count = 0
    for i in range(word_count - 1):
        if f"{words[i]} {words[i+1]}" in common_bigrams:
            bigram_count += 1
    
    bigram_ratio = bigram_count / (word_count - 1)
    ai_word_ratio = ai_keyword_count / word_count
    penalty = (bigram_ratio * 50) + (ai_word_ratio * 250)

    burstiness_factor = min(100.0, max(0.0, 100.0 - (burstiness * 9.0)))
    expected_ttr = 0.86 - (word_count * 0.0003)
    ttr_diff = expected_ttr - ttr
    ttr_factor = min(100.0, max(0.0, 50.0 + ttr_diff * 250.0))
    predictability_factor = min(100.0, max(0.0, (penalty / 18.0) * 100.0))

    score1 = (burstiness_factor * 0.30) + (ttr_factor * 0.20) + (predictability_factor * 0.50)

    # 2. KNN Classifier Score
    feat_lexical = min(1.0, max(0.0, 0.5 + ttr_diff * 2.5))
    feat_burstiness = min(1.0, max(0.0, 1.0 - (burstiness / 12.0)))
    feat_ai_density = min(1.0, ai_word_ratio / 0.030)
    
    letters = len(re.sub(r'[^a-zA-Z]', '', text))
    L = (letters / word_count) * 100
    S = (sentence_count / word_count) * 100
    grade_level = min(20.0, max(0.0, 0.0588 * L - 0.296 * S - 15.8))
    feat_readability = min(1.0, max(0.0, 1.0 - abs(13.0 - grade_level) / 12.0))

    punctuation_count = len(re.findall(r'[.,\/#!$%\^&\*;:{}=\-_`~()?"\']', text))
    punct_density = (punctuation_count / word_count) * 100
    feat_punctuation = min(1.0, max(0.0, 1.0 - abs(11.0 - punct_density) / 12.0))

    vector = [feat_lexical, feat_burstiness, feat_ai_density, feat_readability, feat_punctuation]
    
    distances = []
    for item in knn_training_set:
        dist = calculate_knn_distance(vector, item["vector"])
        distances.append({"label": item["label"], "distance": dist})
    distances.sort(key=lambda x: x["distance"])
    
    ai_votes = sum(1 for item in distances[:5] if item["label"] == 1)
    score2 = (ai_votes / 5.0) * 100

    # 3. Cosine Similarity Score
    first_person_words = {'i', 'me', 'my', 'myself', 'we', 'us', 'our', 'ours', 'ourselves'}
    first_person_count = sum(1 for w in words if w in first_person_words)
    transition_count = sum(1 for w in words if w in cos_transitions)
    intensifier_count = sum(1 for w in words if w in cos_intensifiers)
    passive_matches = len(re.findall(r'\b(is|was|were|be|been|being)\s+(\w+ed|\w+en|made|built|kept|thought|set|left|felt|run|read|done|taken|known|written|given|shown)\b', text.lower()))

    v_first = min(1.0, (first_person_count / word_count) / 0.04)
    v_trans = min(1.0, (transition_count / word_count) / 0.04)
    v_int = min(1.0, (intensifier_count / word_count) / 0.045)
    v_pass = min(1.0, (passive_matches / word_count) / 0.015)
    
    # Calculate Hapax
    word_freq = {}
    for w in words:
        word_freq[w] = word_freq.get(w, 0) + 1
    hapax_count = sum(1 for w, c in word_freq.items() if c == 1)
    hapax_ratio = hapax_count / word_count
    
    expected_hapax = 0.85 - (word_count * 0.0003)
    hapax_diff = expected_hapax - hapax_ratio
    v_hapax = min(1.0, max(0.0, 0.3 + hapax_diff * 2))

    cos_vector = [v_first, v_trans, v_int, v_pass, v_hapax]
    
    p_ai = [0.08, 0.85, 0.80, 0.75, 0.35]
    p_human = [0.65, 0.20, 0.25, 0.28, 0.78]
    
    cos_ai = cosine_similarity(cos_vector, p_ai)
    cos_human = cosine_similarity(cos_vector, p_human)
    score3 = ((cos_ai - cos_human) + 1.0) / 2.0 * 100

    # 4. Grammar and Typo Discount Modifiers
    # A simple simulation of the JS Grammar style analyzer:
    # Perfection score decreases by 15% per normalized penalty unit.
    # Typos count towards rules matches.
    penalty_norm = (num_typos * 1.5) / max(10, word_count) * 100
    grammar_score = max(0.0, 100.0 - 15.0 * penalty_norm)

    weighted_score = (score1 * 0.35) + (score2 * 0.40) + (score3 * 0.25)
    final_prob = weighted_score * (grammar_score / 100.0)

    return {
        "final_prob": round(final_prob, 1),
        "score1": round(score1, 1),
        "score2": round(score2, 1),
        "score3": round(score3, 1),
        "grammar_score": round(grammar_score, 1),
        "vector": [round(v, 3) for v in vector]
    }

# ----------------- Run Experiments -----------------

print("=== NLP_AUG DATA AUGMENTATION & ROBUSTNESS TESTS ===")

# --- Experiment 1: Synonym Swapping (Adversarial Robustness) ---
print("\n--- EXPERIMENT 1: Synonym Swapping (Word-Level Substitution) ---")
print("Replacing words in the AI Climate Change essay with WordNet synonyms...")

for rate in [0.0, 0.1, 0.2, 0.3]:
    if rate == 0.0:
        aug_text = original_text
    else:
        aug = naw.SynonymAug(aug_src='wordnet', aug_p=rate)
        aug_text = aug.augment(original_text)[0]
    
    res = run_detector_simulation(aug_text)
    print(f"Substitution Rate: {rate*100:.0f}% | AI Probability: {res['final_prob']}% | NLP: {res['score1']}% | KNN: {res['score2']}% | Cosine: {res['score3']}%")

# --- Experiment 2: Keyboard Typos (Grammar Discount Calibration) ---
print("\n--- EXPERIMENT 2: Typo Injection (Character-Level Perturbation) ---")
print("Injecting keyboard typos (QWERTY layout distance) to evaluate Grammar Discount factor...")

for typo_count in [0, 2, 4, 8, 12]:
    if typo_count == 0:
        aug_text = original_text
    else:
        # Injects typo_count character-level errors
        aug = nac.KeyboardAug(aug_char_p=0.1, aug_word_p=0.2, aug_char_max=typo_count)
        aug_text = aug.augment(original_text)[0]
    
    res = run_detector_simulation(aug_text, num_typos=typo_count)
    print(f"Typos Injected: {typo_count} | Grammar Perfection: {res['grammar_score']}% | Calibrated AI Prob: {res['final_prob']}%")

# --- Experiment 3: KNN Feature Centroid Extraction ---
print("\n--- EXPERIMENT 3: Offline Data Augmentation for KNN Centroid Generation ---")
print("Generating 5 synthetic variations of the AI Climate Change essay and calculating the centroid vector...")

variations = []
aug_syn = naw.SynonymAug(aug_src='wordnet', aug_p=0.15)
for i in range(5):
    var = aug_syn.augment(original_text)[0]
    res = run_detector_simulation(var)
    variations.append(res["vector"])
    print(f"  Variation {i+1} Feature Vector: {res['vector']}")

# Calculate average feature centroid
avg_vector = [0.0] * 5
for vec in variations:
    for d in range(5):
        avg_vector[d] += vec[d]
avg_vector = [round(v / len(variations), 3) for v in avg_vector]
print(f"\n=> Computed Centroid for 'AI Formal Essay' profile: {avg_vector}")
print("This vector can be added directly to the KNN classifier library to represent formal AI articles.")
