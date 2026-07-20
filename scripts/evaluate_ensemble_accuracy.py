import pandas as pd
import re
import math
import os

csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'dataset_sample.csv')
if not os.path.exists(csv_path):
    print("Error: dataset_sample.csv not found.")
    exit(1)

df = pd.read_csv(csv_path)

# --- Feature lists ---
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
    'various', 'solutions', 'challenges', 'effective',
    'valuable', 'precious', 'unnecessary', 'meaningful', 'discipline', 
    'punctual', 'schedule', 'punctuality', 'possessions',
    'traditional', 'subterranean', 'cooperative', 'partnership', 'collaboration', 'isolation', 'mutual', 'superorganism',
    'remarkable', 'incredible', 'evolutionary', 'relationship', 'phenomenon', 'phenomena', 'effectively', 'literally', 'microscopic', 'clever',
    'possess', 'colleagues', 'long-term', 'temporary', 'dignity',
    'aspects', 'responsible', 'opportunities', 'empowers', 'tolerance', 'harmonious'
}

# --- POS Config ---
determiners = {'a', 'an', 'the', 'this', 'that', 'these', 'those'}
prepositions = {'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'from', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 'without', 'before', 'under', 'around', 'among'}
pronouns = {'i', 'me', 'my', 'myself', 'you', 'your', 'yours', 'yourself', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'we', 'us', 'our', 'ours', 'ourselves', 'they', 'them', 'their', 'theirs', 'themselves'}
conjunctions = {'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'although', 'because', 'since', 'unless', 'whereas', 'while'}
auxiliaries = {'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'shall', 'will', 'should', 'would', 'may', 'might', 'must', 'can', 'could'}

pos_human_prototype = [0.10807, 0.12348, 0.06775, 0.05454, 0.07221]
pos_ai_prototype = [0.11683, 0.13593, 0.05679, 0.05927, 0.07961]

# --- Trigram Config ---
trigram_human_profile = {' , ': 73.67, ' . ': 68.01, 's, ': 2.34, ' th': 183.58, ' in': 47.24, 'to ': 53.23, ' * ': 15.2, ' " ': 15.05, ' to': 56.08, 'ly ': 30.5, 's .': 13.72, 'you': 38.4, 's ,': 13.45, ' yo': 38.37, ' ) ': 12.7, 's. ': 2.35, ' ( ': 11.73, ' ca': 25.37, 'or ': 31.4, 'e .': 11.54}
trigram_ai_profile = {' , ': 0.01, ' . ': 0.02, 's, ': 21.66, ' th': 166.32, ' in': 64.25, 'to ': 69.06, ' * ': 0, ' " ': 0, ' to': 70.84, 'ly ': 16.29, 's .': 0.02, 'you': 52.01, 's ,': 0, ' yo': 51.6, ' ) ': 0, 's. ': 14.38, ' ( ': 0, ' ca': 37.09, 'or ': 43.08, 'e .': 0.02}
trigram_keys = list(trigram_human_profile.keys())

# --- Cosine Similarity Config ---
sim_prototype_ai = [0.08, 0.85, 0.80, 0.75, 0.35]
sim_prototype_human = [0.65, 0.20, 0.25, 0.28, 0.78]

# --- Logistic Regression coefficients ---
logreg_intercept = -10.87000
logreg_weights = [6.79418, -0.17427, 0.58039, 5.29141, 2.93657]

def parse_text(text):
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
    words = [w.lower() for w in re.sub(r'[^\w\s-]', '', text).split() if w]
    return sentences, words

def calculate_cli(text, word_count, sentence_count):
    if word_count == 0:
        return 0.0
    letters = len(re.sub(r'[^a-zA-Z]', '', text))
    L = (letters / word_count) * 100
    S = (sentence_count / word_count) * 100
    grade = 0.0588 * L - 0.296 * S - 15.8
    return min(20.0, max(0.0, grade))

def calculate_punctuation_density(text, word_count):
    if word_count == 0:
        return 0.0
    punct = len(re.findall(r'[.,\/#!$%\^&\*;:{}=\-_`~()?"\']', text))
    return (punct / word_count) * 100

def calculate_cosine(vecA, vecB):
    dot = sum(a * b for a, b in zip(vecA, vecB))
    magA = math.sqrt(sum(a * a for a in vecA))
    magB = math.sqrt(sum(b * b for b in vecB))
    if magA == 0 or magB == 0:
        return 0.0
    return dot / (magA * magB)

# --- Feature extraction ---
def extract_5d_vector(text):
    sentences, words = parse_text(text)
    word_count = len(words)
    sentence_count = len(sentences)
    if word_count < 10:
        return [0.5] * 5

    # 1. Lexical Diversity
    ttr = len(set(words)) / word_count
    expected_ttr = 8.0 / math.sqrt(word_count) + 0.08
    ttr_diff = expected_ttr - ttr
    feat_lexical = min(1.0, max(0.0, 0.5 + ttr_diff * 5.0))

    # 2. Burstiness
    sentence_lengths = [len([w for w in re.sub(r'[^\w\s-]', '', s).split() if w]) for s in sentences]
    mean_len = sum(sentence_lengths) / len(sentence_lengths) if sentence_lengths else 0
    variance = sum((l - mean_len) ** 2 for l in sentence_lengths) / len(sentence_lengths) if sentence_lengths else 0
    burstiness = math.sqrt(variance)
    feat_burstiness = min(1.0, max(0.0, 1.0 - (burstiness / 30.0)))

    # 3. AI Word Density
    ai_keyword_count = sum(1 for w in words if w in ai_favored_words)
    ai_density = ai_keyword_count / word_count
    feat_ai_density = min(1.0, ai_density / 0.012)

    # 4. Readability
    grade_level = calculate_cli(text, word_count, sentence_count)
    feat_readability = min(1.0, max(0.0, 1.0 - abs(13.0 - grade_level) / 12.0))

    # 5. Punctuation Density
    punct_density = calculate_punctuation_density(text, word_count)
    feat_punctuation = min(1.0, max(0.0, 1.0 - abs(11.0 - punct_density) / 12.0))

    return [feat_lexical, feat_burstiness, feat_ai_density, feat_readability, feat_punctuation]

# --- POS Analysis ---
def get_pos_score(text):
    words = [w.lower() for w in re.sub(r'[^\w\s-]', '', text).split() if w]
    word_count = len(words)
    if word_count == 0:
        return 50.0
        
    det = sum(1 for w in words if w in determiners) / word_count
    prep = sum(1 for w in words if w in prepositions) / word_count
    pron = sum(1 for w in words if w in pronouns) / word_count
    conj = sum(1 for w in words if w in conjunctions) / word_count
    aux = sum(1 for w in words if w in auxiliaries) / word_count
    
    vec = [det, prep, pron, conj, aux]
    simToAI = calculate_cosine(vec, pos_ai_prototype)
    simToHuman = calculate_cosine(vec, pos_human_prototype)
    
    diff = simToAI - simToHuman
    return ((diff + 1) / 2) * 100

# --- Trigram Analysis ---
def get_trigram_score(text):
    clean = re.sub(r'\s+', ' ', text.lower())
    counts = {tg: 0 for tg in trigram_keys}
    total = 0
    for i in range(len(clean)-2):
        tg = clean[i:i+3]
        if tg in counts:
            counts[tg] += 1
        total += 1
    if total == 0:
        return 50.0
        
    doc_vec = [(counts[tg] / total) * 10000 for tg in trigram_keys]
    h_vec = [trigram_human_profile[tg] for tg in trigram_keys]
    a_vec = [trigram_ai_profile[tg] for tg in trigram_keys]
    
    simToAI = calculate_cosine(doc_vec, a_vec)
    simToHuman = calculate_cosine(doc_vec, h_vec)
    
    diff = simToAI - simToHuman
    return ((diff + 1) / 2) * 100

# --- Cosine Similarity Analysis ---
def get_cosine_score(text):
    clean_text = text.lower()
    words = re.sub(r'[^\w\s]', '', clean_text).split()
    word_count = len(words)
    if word_count == 0:
        return 50.0
    
    # 1. Pronoun
    pronouns_set = {'i', 'me', 'my', 'myself', 'we', 'us', 'our', 'ours', 'ourselves'}
    pron_c = sum(1 for w in words if w in pronouns_set) / word_count
    val_pron = min(1.0, pron_c / 0.04)
    
    # 2. Conjunctions
    conjs = {'furthermore', 'moreover', 'consequently', 'therefore', 'nevertheless', 'nonetheless', 'conversely', 'thus', 'accordingly', 'hence', 'subsequently', 'further', 'in contrast', 'in addition', 'alternatively', 'however', 'additionally', 'typically', 'generally', 'standardly', 'specifically', 'notably', 'particularly', 'as a result', 'for instance', 'for example', 'indeed', 'besides', 'on the other hand'}
    conj_c = sum(1 for w in words if w in conjs) / word_count
    val_conj = min(1.0, conj_c / 0.04)
    
    # 3. Intensifiers
    intens = {'deeply', 'extremely', 'highly', 'absolutely', 'crucial', 'essential', 'pivotal', 'invaluable', 'seamlessly', 'intricate', 'testament', 'revolutionary', 'foster', 'vital', 'profoundly', 'remarkably', 'significantly', 'comprehensively', 'drastically', 'uniquely', 'key', 'major', 'critical', 'transformative', 'dynamic', 'optimal', 'optimized', 'streamlined', 'enhance', 'leverage', 'synergy', 'beacon', 'paramount', 'meticulously', 'revolutionize', 'underscores', 'paradigm', 'holistic', 'showcase'}
    int_c = sum(1 for w in words if w in intens) / word_count
    val_int = min(1.0, int_c / 0.045)
    
    # 4. Passive voice
    passives = len(re.findall(r'\b(is|was|were|be|been|being)\s+(\w+ed|\w+en|made|built|kept|thought|set|left|felt|run|read|done|taken|known|written|given|shown)\b', clean_text)) / word_count
    val_pass = min(1.0, passives / 0.015)
    
    # 5. Hapax Legomena
    counts = {}
    for w in words:
        counts[w] = counts.get(w, 0) + 1
    hapax = sum(1 for w in counts if counts[w] == 1) / word_count
    expected_hapax = 0.85 - (word_count * 0.0003)
    val_hapax = min(1.0, max(0.0, 0.3 + (expected_hapax - hapax) * 2.0))
    
    vec = [val_pron, val_conj, val_int, val_pass, val_hapax]
    simToAI = calculate_cosine(vec, sim_prototype_ai)
    simToHuman = calculate_cosine(vec, sim_prototype_human)
    
    diff = simToAI - simToHuman
    return ((diff + 1) / 2) * 100

# --- Perplexity Score (Dummy translation from standard) ---
def get_perplexity_score(text):
    sentences, words = parse_text(text)
    word_count = len(words)
    if word_count <= 1:
        return 50.0
    
    # Count AI favored words
    ai_keyword_count = sum(1 for w in words if w in ai_favored_words)
    
    # Simple predictability calculation
    bigrams = [' '.join(words[i:i+2]) for i in range(len(words)-1)]
    common_bigrams = {'of the', 'in the', 'to the', 'on the', 'and the', 'it is', 'is a', 'with the', 'for the', 'to be', 'at the', 'by the', 'from the', 'as a', 'in a', 'that the', 'this is', 'there is', 'has been', 'will be', 'we can', 'in order', 'order to', 'one of', 'based on'}
    common_count = sum(1 for bg in bigrams if bg in common_bigrams)
    
    penalty = (common_count / (len(words) - 1) * 50) + (ai_keyword_count / len(words) * 250)
    score = min(100.0, max(0.0, (penalty / 22.0) * 100))
    return score

# --- Logistic Regression Score ---
def get_logreg_score(text):
    vec = extract_5d_vector(text)
    logit = logreg_intercept + sum(v * w for v, w in zip(vec, logreg_weights))
    return (1 / (1 + math.exp(-logit))) * 100

# --- Evaluation loop ---
correct = 0
for idx, row in df.iterrows():
    text = str(row['text'])
    label = int(row['generated'])
    
    score_lr = get_logreg_score(text)
    score_pos = get_pos_score(text)
    score_tg = get_trigram_score(text)
    score_cos = get_cosine_score(text)
    score_perp = get_perplexity_score(text)
    
    # Unified Ensemble AI Probability:
    # 40% Logistic Regression, 25% Trigrams, 15% POS Ratios, 10% Cosine Similarity, 10% Perplexity
    ensemble_score = (score_lr * 0.40) + (score_tg * 0.25) + (score_pos * 0.15) + (score_cos * 0.10) + (score_perp * 0.10)
    
    pred = 1 if ensemble_score > 50 else 0
    if pred == label:
        correct += 1

print(f"Unified Ensemble Accuracy on 1,000 samples: {correct / len(df) * 100:.2f}%")
