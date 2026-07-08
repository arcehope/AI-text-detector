import os
import math
import re
import pandas as pd
from datasets import load_dataset

# Setup output path
output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
os.makedirs(output_dir, exist_ok=True)
csv_output_path = os.path.join(output_dir, 'dataset_sample.csv')

print("Streaming dataset 'silentone0725/ai-human-text-detection-v1' from Hugging Face...")
# We use streaming=True to load rows on-demand
dataset = load_dataset("silentone0725/ai-human-text-detection-v1", split="train", streaming=True)

print("Extracting 50 Human essays and 50 AI-generated essays...")
human_samples = []
ai_samples = []

for record in dataset:
    label_str = record['label'].lower().strip()
    text = record['text']
    
    # Filter out short samples to select actual essays
    if len(text.split()) < 250:
        continue
        
    if label_str == 'human' and len(human_samples) < 50:
        human_samples.append({'text': text, 'generated': 0})
    elif label_str == 'ai' and len(ai_samples) < 50:
        ai_samples.append({'text': text, 'generated': 1})
        
    if len(human_samples) >= 50 and len(ai_samples) >= 50:
        break

# Combine and save as local CSV file
all_samples = human_samples + ai_samples
df = pd.DataFrame(all_samples)
df.to_csv(csv_output_path, index=False, encoding='utf-8')
print(f"Successfully saved {len(df)} samples to local CSV at: {csv_output_path}")

# --- STYLOMETRIC VECTOR EXTRACTION ---
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

def extract_5d_vector(text):
    sentences, words = parse_text(text)
    word_count = len(words)
    sentence_count = len(sentences)
    if word_count < 10:
        return [0.0] * 5

    # 1. Lexical Diversity
    ttr = len(set(words)) / word_count
    expected_ttr = 0.86 - (word_count * 0.0003)
    ttr_diff = expected_ttr - ttr
    feat_lexical = min(1.0, max(0.0, 0.5 + ttr_diff * 2.5))

    # 2. Burstiness
    sentence_lengths = [len([w for w in re.sub(r'[^\w\s-]', '', s).split() if w]) for s in sentences]
    mean_len = sum(sentence_lengths) / len(sentence_lengths) if sentence_lengths else 0
    variance = sum((l - mean_len) ** 2 for l in sentence_lengths) / len(sentence_lengths) if sentence_lengths else 0
    burstiness = math.sqrt(variance)
    feat_burstiness = min(1.0, max(0.0, 1.0 - (burstiness / 12.0)))

    # 3. AI Word Density
    ai_keyword_count = sum(1 for w in words if w in ai_favored_words)
    ai_density = ai_keyword_count / word_count
    feat_ai_density = min(1.0, ai_density / 0.030)

    # 4. Readability
    grade_level = calculate_cli(text, word_count, sentence_count)
    feat_readability = min(1.0, max(0.0, 1.0 - abs(13.0 - grade_level) / 12.0))

    # 5. Punctuation Density
    punct_density = calculate_punctuation_density(text, word_count)
    feat_punctuation = min(1.0, max(0.0, 1.0 - abs(11.0 - punct_density) / 12.0))

    return [feat_lexical, feat_burstiness, feat_ai_density, feat_readability, feat_punctuation]

print("\nProcessing stylometric vectors for Human samples...")
human_vectors = []
for item in human_samples:
    vec = extract_5d_vector(item['text'])
    human_vectors.append(vec)

print("Processing stylometric vectors for AI samples...")
ai_vectors = []
for item in ai_samples:
    vec = extract_5d_vector(item['text'])
    ai_vectors.append(vec)

# Calculate centroids (average vectors)
def get_centroid(vectors):
    n = len(vectors)
    centroid = [0.0] * 5
    for vec in vectors:
        for d in range(5):
            centroid[d] += vec[d]
    return [round(val / n, 3) for val in centroid]

human_centroid = get_centroid(human_vectors)
ai_centroid = get_centroid(ai_vectors)

print("\n=== COMPUTED CENTROIDS FROM DATASET SPLIT ===")
print(f"Human Writing Centroid Profile: {human_centroid}")
print(f"AI Writing Centroid Profile:    {ai_centroid}")

print("\n=== JAVASCRIPT KNN REPRESENTATION CODE ===")
print("// Copy and paste these lines into the trainingSet array in js/algo/knn.js:")
print(f"{{ vector: {ai_centroid}, label: 1, type: 'AI (HuggingFace Centroid)' }},")
print(f"{{ vector: {human_centroid}, label: 0, type: 'Human (HuggingFace Centroid)' }},")
print("==========================================")
