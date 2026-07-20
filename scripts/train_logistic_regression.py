import pandas as pd
import re
import math
import os

csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'dataset_sample.csv')
if not os.path.exists(csv_path):
    print("Error: dataset_sample.csv not found.")
    exit(1)

df = pd.read_csv(csv_path)

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

# Feature extraction with optimal parameters:
# ttr_a=8.0, ttr_b=0.08, ttr_m=5.0, burst_div=30.0, ai_div=0.012
def extract_vector(text):
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

print("Extracting features from 1000 samples...")
X = []
y = []
for idx, row in df.iterrows():
    text = row['text']
    label = int(row['generated'])
    X.append(extract_vector(text))
    y.append(label)

# Train a Logistic Regression model using scikit-learn
try:
    from sklearn.linear_model import LogisticRegression
    import numpy as np
    
    X_arr = np.array(X)
    y_arr = np.array(y)
    
    model = LogisticRegression(random_state=42)
    model.fit(X_arr, y_arr)
    
    acc = model.score(X_arr, y_arr) * 100
    intercept = model.intercept_[0]
    coefs = model.coef_[0]
    
    print("\n=== LOGISTIC REGRESSION MODEL TRAINED ===")
    print(f"Accuracy on training set: {acc:.2f}%")
    print(f"Intercept: {intercept:.5f}")
    print(f"Coefficients:")
    print(f"  w_lexical:     {coefs[0]:.5f}")
    print(f"  w_burstiness:  {coefs[1]:.5f}")
    print(f"  w_ai_density:  {coefs[2]:.5f}")
    print(f"  w_readability: {coefs[3]:.5f}")
    print(f"  w_punctuation: {coefs[4]:.5f}")
    
    print("\n=== JAVASCRIPT LOGISTIC REGRESSION CODE ===")
    print(f"class LogisticRegressionClassifier {{")
    print(f"    constructor() {{")
    print(f"        this.intercept = {intercept:.5f};")
    print(f"        this.weights = [{', '.join(f'{w:.5f}' for w in coefs)}];")
    print(f"    }}")
    print(f"")
    print(f"    predict(vector) {{")
    print(f"        let logit = this.intercept;")
    print(f"        for (let i = 0; i < vector.length; i++) {{")
    print(f"            logit += vector[i] * this.weights[i];")
    print(f"        }}")
    print(f"        return 1 / (1 + Math.exp(-logit));")
    print(f"    }}")
    print(f"}}")
except ImportError:
    print("Scikit-learn is not installed. Installing it via pip...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "scikit-learn"])
    print("Please run this script again after installation.")
