import os
import subprocess

def create_class_diagram_svg():
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 960" width="1400" height="960" style="background-color: #ffffff;">
  <style>
    .cls-box { fill: #ffffff; stroke: #000000; stroke-width: 2; }
    .cls-header { font-family: 'Consolas', 'Courier New', monospace; font-size: 18px; font-weight: bold; text-anchor: middle; fill: #000000; }
    .cls-section-title { font-family: 'Consolas', 'Courier New', monospace; font-size: 15px; font-weight: bold; fill: #000000; }
    .cls-text { font-family: 'Consolas', 'Courier New', monospace; font-size: 14px; fill: #000000; }
    .line { stroke: #000000; stroke-width: 2; fill: none; }
    .caption { font-family: 'Times New Roman', Times, serif; font-size: 20px; font-weight: bold; text-anchor: middle; fill: #000000; }
  </style>

  <!-- Title/Caption at Top -->
  <text x="700" y="30" class="caption">Figure 3.3: Class Diagram for AI Text Detector</text>

  <!-- 1. Top Box: Parses -->
  <g transform="translate(460, 50)">
    <rect class="cls-box" x="0" y="0" width="480" height="190" />
    <text x="240" y="28" class="cls-header">Parses</text>
    <line x1="0" y1="38" x2="480" y2="38" class="line" />
    <!-- Attributes -->
    <text x="15" y="58" class="cls-text">- document: string</text>
    <text x="15" y="78" class="cls-text">- status: string</text>
    <text x="15" y="98" class="cls-text">- wordCount: int</text>
    <text x="15" y="118" class="cls-text">- format: string</text>
    <line x1="0" y1="128" x2="480" y2="128" class="line" />
    <!-- Methods -->
    <text x="15" y="148" class="cls-text">+ extractText(file: File): string</text>
    <text x="15" y="168" class="cls-text">+ readAsDocx(file: File): string</text>
    <text x="15" y="184" class="cls-text">+ getWordCount(): int</text>
  </g>

  <!-- 2. Middle Left Box: Sentence Perplexity -->
  <g transform="translate(30, 310)">
    <rect class="cls-box" x="0" y="0" width="420" height="310" />
    <text x="210" y="28" class="cls-header">Sentence Perplexity</text>
    <line x1="0" y1="38" x2="420" y2="38" class="line" />
    <!-- Attributes -->
    <text x="15" y="58" class="cls-text">- perplexityLevel: string</text>
    <text x="15" y="78" class="cls-text">- burstinessValue: string</text>
    <text x="15" y="98" class="cls-text">- avgSentenceLength: float</text>
    <text x="15" y="118" class="cls-text">- aiLikelihood: string</text>
    <line x1="0" y1="128" x2="420" y2="128" class="line" />
    <!-- Methods -->
    <text x="15" y="148" class="cls-text">+ calculatePerplexity(text: string): float</text>
    <text x="15" y="170" class="cls-text">+ calculateBurstiness(sents: list): float</text>
    <text x="15" y="192" class="cls-text">+ computeTTR(tokens: list): float</text>
    <text x="15" y="214" class="cls-text">+ getAiWordDensity(text: string): float</text>
    <text x="15" y="236" class="cls-text">+ getSentenceLengthVariance(): float</text>
    <text x="15" y="258" class="cls-text">+ getPerplexityVerdict(): string</text>
  </g>

  <!-- 3. Middle Center Box: Instance Based Classification -->
  <g transform="translate(490, 310)">
    <rect class="cls-box" x="0" y="0" width="420" height="310" />
    <text x="210" y="28" class="cls-header">Instance Based Classification</text>
    <line x1="0" y1="38" x2="420" y2="38" class="line" />
    <!-- Attributes -->
    <text x="15" y="58" class="cls-text">- algorithm: string</text>
    <text x="15" y="78" class="cls-text">- neighborVotes: string</text>
    <text x="15" y="98" class="cls-text">- predictedClass: string</text>
    <text x="15" y="118" class="cls-text">- confidenceScore: float</text>
    <line x1="0" y1="128" x2="420" y2="128" class="line" />
    <!-- Methods -->
    <text x="15" y="148" class="cls-text">+ classify(featureVector: object): object</text>
    <text x="15" y="170" class="cls-text">+ computeEuclideanDistance(v1, v2): float</text>
    <text x="15" y="192" class="cls-text">+ getNearestNeighbors(vec, k: int): list</text>
    <text x="15" y="214" class="cls-text">+ getVerdictSummary(): object</text>
    <text x="15" y="236" class="cls-text">+ updateTrainingSet(sample: object): void</text>
  </g>

  <!-- 4. Middle Right Box: Vector Similarities -->
  <g transform="translate(950, 310)">
    <rect class="cls-box" x="0" y="0" width="420" height="310" />
    <text x="210" y="28" class="cls-header">Vector Similarities</text>
    <line x1="0" y1="38" x2="420" y2="38" class="line" />
    <!-- Attributes -->
    <text x="15" y="58" class="cls-text">- aiModelMatch: string</text>
    <text x="15" y="78" class="cls-text">- humanModelMatch: string</text>
    <text x="15" y="98" class="cls-text">- vectorCluster: string</text>
    <text x="15" y="118" class="cls-text">- cosineDistance: float</text>
    <line x1="0" y1="128" x2="420" y2="128" class="line" />
    <!-- Methods -->
    <text x="15" y="148" class="cls-text">+ computeCosineSimilarity(v1, v2): float</text>
    <text x="15" y="170" class="cls-text">+ extractNgramFrequency(text): list</text>
    <text x="15" y="192" class="cls-text">+ comparePrototypes(vector): object</text>
    <text x="15" y="214" class="cls-text">+ getFeatureVector(): list</text>
    <text x="15" y="236" class="cls-text">+ normalizeVector(vector: list): list</text>
    <text x="15" y="258" class="cls-text">+ getSimilarityIndex(): float</text>
  </g>

  <!-- 5. Bottom Center Box: Render SVG visualization -->
  <g transform="translate(490, 670)">
    <rect class="cls-box" x="0" y="0" width="420" height="260" />
    <text x="210" y="28" class="cls-header">Render SVG visualization</text>
    <line x1="0" y1="38" x2="420" y2="38" class="line" />
    <!-- Attributes -->
    <text x="15" y="58" class="cls-text">- chartType: string</text>
    <text x="15" y="78" class="cls-text">- verdictBanner: string</text>
    <text x="15" y="98" class="cls-text">- colorIndicator: string</text>
    <text x="15" y="118" class="cls-text">- renderMode: string</text>
    <line x1="0" y1="128" x2="420" y2="128" class="line" />
    <!-- Methods -->
    <text x="15" y="148" class="cls-text">+ renderGaugeChart(score): Element</text>
    <text x="15" y="170" class="cls-text">+ renderScatterPlot(neighbors): Element</text>
    <text x="15" y="192" class="cls-text">+ renderRadarChart(features): Element</text>
    <text x="15" y="214" class="cls-text">+ animateGaugePointer(angle): void</text>
    <text x="15" y="236" class="cls-text">+ updateVerdictDisplay(text): void</text>
  </g>

  <!-- CONNECTIONS -->
  <!-- Top tree connection from Parses down to middle row -->
  <path d="M 700 240 L 700 275 L 240 275 L 240 310" class="line" />
  <path d="M 700 275 L 700 310" class="line" />
  <path d="M 700 275 L 1160 275 L 1160 310" class="line" />

  <!-- Horizontal connections across middle row -->
  <line x1="450" y1="465" x2="490" y2="465" class="line" />
  <line x1="910" y1="465" x2="950" y2="465" class="line" />

  <!-- Vertical connection from Instance Based Classification down to Render SVG visualization -->
  <line x1="700" y1="620" x2="700" y2="670" class="line" />

</svg>'''
    return svg


def create_object_diagram_svg():
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 960" width="1400" height="960" style="background-color: #ffffff;">
  <style>
    .cls-box { fill: #ffffff; stroke: #000000; stroke-width: 2; }
    .cls-header { font-family: 'Consolas', 'Courier New', monospace; font-size: 17px; font-weight: bold; text-anchor: middle; fill: #000000; text-decoration: underline; }
    .cls-text { font-family: 'Consolas', 'Courier New', monospace; font-size: 13.5px; fill: #000000; }
    .line { stroke: #000000; stroke-width: 2; fill: none; }
    .caption { font-family: 'Times New Roman', Times, serif; font-size: 20px; font-weight: bold; text-anchor: middle; fill: #000000; }
  </style>

  <!-- Title/Caption at Top -->
  <text x="700" y="30" class="caption">Figure 3.4: Object Diagram for AI Text Detector</text>

  <!-- 1. Top Box: docParser : Parses -->
  <g transform="translate(460, 50)">
    <rect class="cls-box" x="0" y="0" width="480" height="190" />
    <text x="240" y="28" class="cls-header">docParser : Parses</text>
    <line x1="0" y1="38" x2="480" y2="38" class="line" />
    <!-- Slot values -->
    <text x="15" y="58" class="cls-text">document = "sample_essay.docx"</text>
    <text x="15" y="78" class="cls-text">status = "Text Extracted Successfully"</text>
    <text x="15" y="98" class="cls-text">wordCount = 450 words</text>
    <text x="15" y="118" class="cls-text">format = "Plain Text Buffer"</text>
    <line x1="0" y1="128" x2="480" y2="128" class="line" />
    <!-- Operations -->
    <text x="15" y="148" class="cls-text">+ extractText(file): string</text>
    <text x="15" y="168" class="cls-text">+ readAsDocx(file): string</text>
    <text x="15" y="184" class="cls-text">+ getWordCount(): int</text>
  </g>

  <!-- 2. Middle Left Box: sentencePerplexity : Sentence Perplexity -->
  <g transform="translate(30, 310)">
    <rect class="cls-box" x="0" y="0" width="420" height="310" />
    <text x="210" y="28" class="cls-header">sentencePerplexity : Sentence Perplexity</text>
    <line x1="0" y1="38" x2="420" y2="38" class="line" />
    <!-- Slot values -->
    <text x="15" y="58" class="cls-text">perplexityLevel = "High (Uniform Pattern)"</text>
    <text x="15" y="78" class="cls-text">burstinessValue = "Low Sentence Variation"</text>
    <text x="15" y="98" class="cls-text">avgSentenceLength = 20.4 words</text>
    <text x="15" y="118" class="cls-text">aiLikelihood = "88% AI-like rhythm"</text>
    <line x1="0" y1="128" x2="420" y2="128" class="line" />
    <!-- Operations -->
    <text x="15" y="148" class="cls-text">+ calculatePerplexity(text): float</text>
    <text x="15" y="170" class="cls-text">+ calculateBurstiness(sentences): float</text>
    <text x="15" y="192" class="cls-text">+ computeTTR(tokens): float</text>
    <text x="15" y="214" class="cls-text">+ getAiWordDensity(text): float</text>
    <text x="15" y="236" class="cls-text">+ getSentenceLengthVariance(): float</text>
    <text x="15" y="258" class="cls-text">+ getPerplexityVerdict(): string</text>
  </g>

  <!-- 3. Middle Center Box: classifier : Instance Based Classification -->
  <g transform="translate(490, 310)">
    <rect class="cls-box" x="0" y="0" width="420" height="310" />
    <text x="210" y="28" class="cls-header">classifier : Instance Based Classification</text>
    <line x1="0" y1="38" x2="420" y2="38" class="line" />
    <!-- Slot values -->
    <text x="15" y="58" class="cls-text">algorithm = "K-Nearest Neighbors (K=5)"</text>
    <text x="15" y="78" class="cls-text">neighborVotes = "4 AI Matches, 1 Human"</text>
    <text x="15" y="98" class="cls-text">predictedClass = "AI Generated Text"</text>
    <text x="15" y="118" class="cls-text">confidenceScore = 91.5%</text>
    <line x1="0" y1="128" x2="420" y2="128" class="line" />
    <!-- Operations -->
    <text x="15" y="148" class="cls-text">+ classify(featureVector): object</text>
    <text x="15" y="170" class="cls-text">+ computeEuclideanDistance(v1, v2): float</text>
    <text x="15" y="192" class="cls-text">+ getNearestNeighbors(vector, k): list</text>
    <text x="15" y="214" class="cls-text">+ getVerdictSummary(): object</text>
    <text x="15" y="236" class="cls-text">+ updateTrainingSet(sample): void</text>
  </g>

  <!-- 4. Middle Right Box: vectorSimilarity : Vector Similarities -->
  <g transform="translate(950, 310)">
    <rect class="cls-box" x="0" y="0" width="420" height="310" />
    <text x="210" y="28" class="cls-header">vectorSimilarity : Vector Similarities</text>
    <line x1="0" y1="38" x2="420" y2="38" class="line" />
    <!-- Slot values -->
    <text x="15" y="58" class="cls-text">aiModelMatch = "85% Similarity"</text>
    <text x="15" y="78" class="cls-text">humanModelMatch = "25% Similarity"</text>
    <text x="15" y="98" class="cls-text">vectorCluster = "AI Language Patterns"</text>
    <text x="15" y="118" class="cls-text">cosineDistance = 0.152</text>
    <line x1="0" y1="128" x2="420" y2="128" class="line" />
    <!-- Operations -->
    <text x="15" y="148" class="cls-text">+ computeCosineSimilarity(v1, v2): float</text>
    <text x="15" y="170" class="cls-text">+ extractNgramFrequency(text): list</text>
    <text x="15" y="192" class="cls-text">+ comparePrototypes(vector): object</text>
    <text x="15" y="214" class="cls-text">+ getFeatureVector(): list</text>
    <text x="15" y="236" class="cls-text">+ normalizeVector(vector): list</text>
    <text x="15" y="258" class="cls-text">+ getSimilarityIndex(): float</text>
  </g>

  <!-- 5. Bottom Center Box: visualizer : Render SVG visualization -->
  <g transform="translate(490, 670)">
    <rect class="cls-box" x="0" y="0" width="420" height="260" />
    <text x="210" y="28" class="cls-header">visualizer : Render SVG visualization</text>
    <line x1="0" y1="38" x2="420" y2="38" class="line" />
    <!-- Slot values -->
    <text x="15" y="58" class="cls-text">chartType = "Radial Speedometer Gauge"</text>
    <text x="15" y="78" class="cls-text">verdictBanner = "AI-GENERATED (91.5%)"</text>
    <text x="15" y="98" class="cls-text">colorIndicator = "Red / Warning Accent"</text>
    <text x="15" y="118" class="cls-text">renderMode = "Vector Graphic Display"</text>
    <line x1="0" y1="128" x2="420" y2="128" class="line" />
    <!-- Operations -->
    <text x="15" y="148" class="cls-text">+ renderGaugeChart(score): Element</text>
    <text x="15" y="170" class="cls-text">+ renderScatterPlot(neighbors): Element</text>
    <text x="15" y="192" class="cls-text">+ renderRadarChart(features): Element</text>
    <text x="15" y="214" class="cls-text">+ animateGaugePointer(angle): void</text>
    <text x="15" y="236" class="cls-text">+ updateVerdictDisplay(text): void</text>
  </g>

  <!-- CONNECTIONS -->
  <!-- Top tree connection from docParser down to middle row -->
  <path d="M 700 240 L 700 275 L 240 275 L 240 310" class="line" />
  <path d="M 700 275 L 700 310" class="line" />
  <path d="M 700 275 L 1160 275 L 1160 310" class="line" />

  <!-- Horizontal connections across middle row -->
  <line x1="450" y1="465" x2="490" y2="465" class="line" />
  <line x1="910" y1="465" x2="950" y2="465" class="line" />

  <!-- Vertical connection from classifier down to visualizer -->
  <line x1="700" y1="620" x2="700" y2="670" class="line" />

</svg>'''
    return svg

def main():
    svg_class = create_class_diagram_svg()
    svg_object = create_object_diagram_svg()

    with open('docs/figure_3_3_class_diagram.svg', 'w', encoding='utf-8') as f:
        f.write(svg_class)
    with open('images/figure_3_3_class_diagram.svg', 'w', encoding='utf-8') as f:
        f.write(svg_class)

    with open('docs/figure_3_4_object_diagram.svg', 'w', encoding='utf-8') as f:
        f.write(svg_object)
    with open('images/figure_3_4_object_diagram.svg', 'w', encoding='utf-8') as f:
        f.write(svg_object)

    print("SVG files written successfully!")

    # Render PNGs using MS Edge
    msedge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

    for name in ['figure_3_3_class_diagram', 'figure_3_4_object_diagram']:
        svg_path = os.path.abspath(f'docs/{name}.svg')
        png_path = os.path.abspath(f'docs/{name}.png')
        cmd = [
            msedge,
            '--headless',
            '--disable-gpu',
            f'--screenshot={png_path}',
            '--window-size=1400,980',
            f'file:///{svg_path}'
        ]
        subprocess.run(cmd, check=True)
        print(f'Rendered {png_path}, size: {os.path.getsize(png_path)} bytes')

if __name__ == '__main__':
    main()
