import pandas as pd
import re
import os

csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'dataset_sample.csv')
if not os.path.exists(csv_path):
    print("Error: dataset_sample.csv not found.")
    exit(1)

df = pd.read_csv(csv_path)

# POS lists
determiners = {'a', 'an', 'the', 'this', 'that', 'these', 'those'}
prepositions = {'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'from', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 'without', 'before', 'under', 'around', 'among'}
pronouns = {'i', 'me', 'my', 'myself', 'you', 'your', 'yours', 'yourself', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'we', 'us', 'our', 'ours', 'ourselves', 'they', 'them', 'their', 'theirs', 'themselves'}
conjunctions = {'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'although', 'because', 'since', 'unless', 'whereas', 'while'}
auxiliaries = {'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'shall', 'will', 'should', 'would', 'may', 'might', 'must', 'can', 'could'}

def get_pos_ratios(text):
    words = [w.lower() for w in re.sub(r'[^\w\s-]', '', text).split() if w]
    word_count = len(words)
    if word_count == 0:
        return [0, 0, 0, 0, 0]
        
    det_c = sum(1 for w in words if w in determiners)
    prep_c = sum(1 for w in words if w in prepositions)
    pron_c = sum(1 for w in words if w in pronouns)
    conj_c = sum(1 for w in words if w in conjunctions)
    aux_c = sum(1 for w in words if w in auxiliaries)
    
    return [det_c / word_count, prep_c / word_count, pron_c / word_count, conj_c / word_count, aux_c / word_count]

human_vectors = []
ai_vectors = []

for idx, row in df.iterrows():
    text = str(row['text'])
    gen = int(row['generated'])
    vec = get_pos_ratios(text)
    if gen == 0:
        human_vectors.append(vec)
    else:
        ai_vectors.append(vec)

def get_centroid(vecs):
    n = len(vecs)
    centroid = [0.0] * 5
    for vec in vecs:
        for d in range(5):
            centroid[d] += vec[d]
    return [val / n for val in centroid]

h_cent = get_centroid(human_vectors)
a_cent = get_centroid(ai_vectors)

print("=== POS RATIO CENTROIDS ===")
print(f"Human: Det={h_cent[0]:.4f}, Prep={h_cent[1]:.4f}, Pron={h_cent[2]:.4f}, Conj={h_cent[3]:.4f}, Aux={h_cent[4]:.4f}")
print(f"AI:    Det={a_cent[0]:.4f}, Prep={a_cent[1]:.4f}, Pron={a_cent[2]:.4f}, Conj={a_cent[3]:.4f}, Aux={a_cent[4]:.4f}")

# Let's print JavaScript representation
print("\n=== JAVASCRIPT POS CODE ===")
print(f"""
class PosClassifier {{
    constructor() {{
        this.prototypeHuman = [{', '.join(f'{x:.5f}' for x in h_cent)}];
        this.prototypeAI = [{', '.join(f'{x:.5f}' for x in a_cent)}];
        
        this.determiners = new Set(['a', 'an', 'the', 'this', 'that', 'these', 'those']);
        this.prepositions = new Set(['of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'from', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 'without', 'before', 'under', 'around', 'among']);
        this.pronouns = new Set(['i', 'me', 'my', 'myself', 'you', 'your', 'yours', 'yourself', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'we', 'us', 'our', 'ours', 'ourselves', 'they', 'them', 'their', 'theirs', 'themselves']);
        this.conjunctions = new Set(['and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'although', 'because', 'since', 'unless', 'whereas', 'while']);
        this.auxiliaries = new Set(['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'shall', 'will', 'should', 'would', 'may', 'might', 'must', 'can', 'could']);
    }}

    extractProfile(text) {{
        const words = text.toLowerCase().replace(/[^\\w\\s-]/g, '').split(/\\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        if (wordCount === 0) return [0, 0, 0, 0, 0];

        let det = 0, prep = 0, pron = 0, conj = 0, aux = 0;
        words.forEach(w => {{
            if (this.determiners.has(w)) det++;
            else if (this.prepositions.has(w)) prep++;
            else if (this.pronouns.has(w)) pron++;
            else if (this.conjunctions.has(w)) conj++;
            else if (this.auxiliaries.has(w)) aux++;
        }});

        return [det / wordCount, prep / wordCount, pron / wordCount, conj / wordCount, aux / wordCount];
    }}

    analyze(text) {{
        const vec = this.extractProfile(text);
        const simToAI = this.calculateCosine(vec, this.prototypeAI);
        const simToHuman = this.calculateCosine(vec, this.prototypeHuman);

        let score = 50;
        if (simToAI + simToHuman > 0) {{
            const diff = simToAI - simToHuman;
            score = ((diff + 1) / 2) * 100;
        }}

        return {{
            score: Math.min(100, Math.max(0, score)),
            similarityToAI: simToAI,
            similarityToHuman: simToHuman,
            vector: vec
        }};
    }}

    calculateCosine(vecA, vecB) {{
        let dot = 0, sumA = 0, sumB = 0;
        for (let i = 0; i < vecA.length; i++) {{
            dot += vecA[i] * vecB[i];
            sumA += vecA[i] * vecA[i];
            sumB += vecB[i] * vecB[i];
        }}
        const magA = Math.sqrt(sumA);
        const magB = Math.sqrt(sumB);
        if (magA === 0 || magB === 0) return 0;
        return dot / (magA * magB);
    }}
}}
""")
