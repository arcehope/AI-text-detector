import pandas as pd
from collections import Counter
import os
import re

csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'dataset_sample.csv')
if not os.path.exists(csv_path):
    print("Error: dataset_sample.csv not found.")
    exit(1)

df = pd.read_csv(csv_path)

def get_trigrams(text):
    # Clean text to lowercase and replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text.lower())
    # Extract character trigrams
    return [text[i:i+3] for i in range(len(text)-2)]

print("Extracting trigrams for Human and AI texts...")
human_trigrams = Counter()
ai_trigrams = Counter()

human_count = 0
ai_count = 0

for idx, row in df.iterrows():
    text = str(row['text'])
    gen = int(row['generated'])
    trigrams = get_trigrams(text)
    
    if gen == 0:
        human_trigrams.update(trigrams)
        human_count += len(trigrams)
    else:
        ai_trigrams.update(trigrams)
        ai_count += len(trigrams)

# Convert to relative frequencies (ratios)
human_freqs = {tg: count / human_count for tg, count in human_trigrams.items()}
ai_freqs = {tg: count / ai_count for tg, count in ai_trigrams.items()}

# Find trigrams with the largest relative difference
# To avoid division by zero, we filter trigrams that occur at least a few times
all_tg = set(list(human_freqs.keys()) + list(ai_freqs.keys()))
significant_tg = []

for tg in all_tg:
    h_f = human_freqs.get(tg, 0)
    a_f = ai_freqs.get(tg, 0)
    
    # We want trigrams that have a high combined frequency but also a strong difference
    if h_f + a_f > 0.001:  # Must be somewhat common
        ratio = a_f / h_f if h_f > 0 else 999.0
        significant_tg.append({
            'trigram': tg,
            'human_freq': h_f,
            'ai_freq': a_f,
            'diff': abs(a_f - h_f),
            'ratio': ratio
        })

significant_tg.sort(key=lambda x: x['diff'], reverse=True)

# Print top 15 trigrams favored by AI, and top 15 favored by Human
print("\n=== TOP 15 TRIGRAMS WITH BIGGEST DIFFERENCE ===")
print(f"{'Trigram':<10} | {'Human Freq':<12} | {'AI Freq':<12} | {'Difference':<12} | {'AI/Human Ratio':<12}")
print("-" * 70)
for tg_info in significant_tg[:20]:
    repr_tg = tg_info['trigram'].replace(' ', '_')
    print(f"'{repr_tg}':{tg_info['trigram']:<6} | {tg_info['human_freq']:.6f}   | {tg_info['ai_freq']:.6f} | {tg_info['diff']:.6f}   | {tg_info['ratio']:.3f}")

# Let's extract a dictionary of these top 20 trigrams and their weights
top_20 = significant_tg[:20]
js_human_profile = {x['trigram']: round(x['human_freq'] * 10000, 2) for x in top_20}
js_ai_profile = {x['trigram']: round(x['ai_freq'] * 10000, 2) for x in top_20}

print("\n=== JAVASCRIPT PROFILE CODE ===")
print("const TRIGRAM_HUMAN_PROFILE = " + str(js_human_profile) + ";")
print("const TRIGRAM_AI_PROFILE = " + str(js_ai_profile) + ";")
