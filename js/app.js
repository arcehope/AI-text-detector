/**
 * Unified Core Application Controller - Text AI Classifier (Dedicated Version)
 * 
 * Manages local text NLP classifiers, file parser, and SVG dashboard charts.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. INITIALIZE ENGINES & UTILITIES
    // ==========================================
    const perplexityEngine = new window.PerplexityAnalyzer();
    const knnClassifier = new window.KNNClassifier();
    const similarityEngine = new window.CosineSimilarityAnalyzer();
    const chartEngine = new window.ChartRenderer();
    const fileParser = new window.FileParser();

    // ==========================================
    // 2. TEXT CLASSIFIER CONTROLLER
    // ==========================================
    // DOM Elements
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const editorArea = document.getElementById('editor-area');
    const analyzeBtn = document.getElementById('analyze-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const emptyResultsState = document.getElementById('empty-results-state');
    const activeResultsPanel = document.getElementById('active-results-panel');

    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabContents = document.querySelectorAll('.tab-content');

    const statWordCount = document.getElementById('stat-word-count');
    const statSentenceCount = document.getElementById('stat-sentence-count');
    const statBurstiness = document.getElementById('stat-burstiness');
    const statTtr = document.getElementById('stat-ttr');

    const highlightedTextPanel = document.getElementById('highlighted-text-panel');
    const sentenceMetricsCard = document.getElementById('sentence-metrics-card');
    const formulaContainer = document.getElementById('formula-container');

    const sampleAiBtn = document.getElementById('sample-ai-btn');
    const sampleHumanBtn = document.getElementById('sample-human-btn');

    // Text Tab Navigation
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetTab = trigger.getAttribute('data-tab');
            tabTriggers.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            trigger.classList.add('active');
            const targetElement = document.getElementById(targetTab);
            if (targetElement) targetElement.classList.add('active');
        });
    });

    let typingTimer;
    const doneTypingInterval = 1000; // 1 second debounce delay

    // Editor stats footer update helper
    function updateEditorStats(text) {
        const trimmed = text.trim();
        if (!trimmed) {
            document.getElementById('char-word-count').textContent = 'Ready for input';
            return;
        }
        const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;
        const charCount = text.length;
        document.getElementById('char-word-count').textContent = `${wordCount} words | ${charCount} characters`;
    }

    editorArea.addEventListener('input', () => {
        const text = editorArea.value;
        updateEditorStats(text);
        
        clearTimeout(typingTimer);
        
        const trimmed = text.trim();
        const words = trimmed.split(/\s+/).filter(w => w.length > 0);
        
        if (words.length >= 10) {
            document.getElementById('char-word-count').innerHTML = 
                `<span class="typing-indicator"><span class="dot-pulse"></span> Auto-analyzing when you pause...</span> | ${words.length} words`;
            
            typingTimer = setTimeout(() => {
                runSilentAnalysis(text);
            }, doneTypingInterval);
        } else {
            const wordsLeft = 10 - words.length;
            document.getElementById('char-word-count').textContent = `${words.length} words | Need ${wordsLeft} more word${wordsLeft > 1 ? 's' : ''} for analysis`;
        }
    });

    function runSilentAnalysis(text) {
        executeAnalysisCore(text, true);
    }

    // Text file drag and drop
    dropzone.addEventListener('click', () => fileInput.click());
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    async function handleFileUpload(file) {
        try {
            showLoader(true, "Reading file and extracting text...");
            const extractedText = await fileParser.extractText(file);
            editorArea.value = extractedText;
            updateEditorStats(extractedText);
            showLoader(false);
            runAnalysis(extractedText);
        } catch (error) {
            showLoader(false);
            alert(error.message);
        }
    }

    // Buttons actions
    analyzeBtn.addEventListener('click', () => {
        const text = editorArea.value.trim();
        if (!text) {
            alert("Please enter or upload some text to analyze.");
            return;
        }
        runAnalysis(text);
    });

    clearBtn.addEventListener('click', () => {
        editorArea.value = '';
        updateEditorStats('');
        emptyResultsState.style.display = 'flex';
        activeResultsPanel.style.display = 'none';
        sentenceMetricsCard.style.display = 'none';
    });

    // Sample loading
    sampleAiBtn.addEventListener('click', () => {
        const text = `In today's fast-paced digital world, artificial intelligence is playing an increasingly crucial role across various industries. Furthermore, the implementation of complex machine learning systems has revolutionized how organizations analyze big data, fostering a synergy between automation and efficiency. It is important to note that these transformative models not only streamline complicated operations but also provide invaluable predictive intelligence. Consequently, companies must delve into the intricate layers of deep learning algorithms in order to remain competitive. In conclusion, the adaptation of generative frameworks stands as a testament to the remarkable capabilities of modern computer science, paving the way for a highly integrated future.`;
        editorArea.value = text;
        updateEditorStats(text);
        runAnalysis(text);
    });

    sampleHumanBtn.addEventListener('click', () => {
        const text = `I was drinking coffee early this morning, staring out at the rain hitting my window. We don't get weather like this often in June, and it felt sort of peaceful, honestly. It got me thinking about my old college days—how we would pack up our cheap laptops and hike to the campus diner when the library got too stuffy. I remember writing a whole essay on historical politics on a napkin because my laptop's battery died in minutes. It wasn't the best work, sure, but it had character. The diner didn't have Wi-Fi, either. We just sat there, shared a greasy basket of fries, and talked for hours. Nowadays, everything is so streamlined and connected, which is fine, but I sometimes miss the messy unpredictability of those late-night diner runs.`;
        editorArea.value = text;
        updateEditorStats(text);
        runAnalysis(text);
    });

    // Core analysis logic
    function executeAnalysisCore(text, isSilent) {
        try {
            const result1 = perplexityEngine.analyze(text);
            if (result1.wordCount < 10) {
                return false;
            }

            const featureExtraction = knnClassifier.extractFeatures(text, result1);
            const result2 = knnClassifier.classify(featureExtraction.vector);
            const result3 = similarityEngine.analyze(text);

            // Combined weighted engine
            const weightedScore = (result1.score * 0.35) + (result2.score * 0.40) + (result3.score * 0.25);
            const finalPercentage = Math.min(100, Math.max(0, weightedScore));

            // Display
            statWordCount.textContent = result1.wordCount;
            statSentenceCount.textContent = result1.sentenceCount;
            statBurstiness.textContent = result1.burstiness;
            statTtr.textContent = result1.ttr.toFixed(3);

            chartEngine.renderGauge('gauge-chart-container', finalPercentage);
            chartEngine.renderScatterPlot('scatter-chart-container', result2, featureExtraction.vector);
            chartEngine.renderRadarChart('radar-chart-container', result3.vector);

            renderHighlighting(result1.sentenceDetails);
            renderMathFormulaBreakdown(result1, result2, featureExtraction, result3);

            emptyResultsState.style.display = 'none';
            activeResultsPanel.style.display = 'grid';
            
            if (isSilent) {
                const charCount = text.length;
                document.getElementById('char-word-count').innerHTML = 
                    `<span style="color: var(--neon-cyan); font-weight: 500;">✓ Live Analysis Updated</span> | ${result1.wordCount} words | ${charCount} characters`;
            }
            return true;
        } catch (err) {
            if (!isSilent) {
                alert(err.message);
            }
            return false;
        }
    }

    // Text Engine Runner (with progress loader UI)
    function runAnalysis(text) {
        showLoader(true, "Analyzing text stylometrics...");
        setTimeout(() => {
            executeAnalysisCore(text, false);
            showLoader(false);
        }, 800);
    }

    function showLoader(show, message = "") {
        if (show) {
            progressContainer.style.display = 'block';
            progressBar.style.width = '30%';
            let progress = 30;
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 15) + 5;
                if (progress >= 95) {
                    clearInterval(interval);
                    progress = 95;
                }
                progressBar.style.width = `${progress}%`;
            }, 150);
            progressContainer.dataset.intervalId = interval;
        } else {
            clearInterval(progressContainer.dataset.intervalId);
            progressBar.style.width = '100%';
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 300);
        }
    }

    function renderHighlighting(sentenceDetails) {
        highlightedTextPanel.innerHTML = '';
        sentenceMetricsCard.style.display = 'none';

        sentenceDetails.forEach(detail => {
            const span = document.createElement('span');
            span.textContent = detail.text + ' ';
            span.className = 'highlighted-sentence';
            
            if (detail.aiScore > 70) {
                span.classList.add('ai-heavy');
            } else if (detail.aiScore > 40) {
                span.classList.add('ai-medium');
            } else {
                span.classList.add('ai-light');
            }

            span.addEventListener('click', () => {
                document.querySelectorAll('.highlighted-sentence').forEach(el => el.classList.remove('selected'));
                span.classList.add('selected');
                sentenceMetricsCard.style.display = 'block';
                document.getElementById('sel-sentence-text').textContent = `"${detail.text}"`;
                document.getElementById('sel-word-count').textContent = detail.wordCount;
                document.getElementById('sel-ai-score').textContent = `${detail.aiScore.toFixed(0)}%`;
                
                const indicator = document.getElementById('sel-classification');
                indicator.textContent = detail.aiScore > 70 ? 'AI Generated' : (detail.aiScore > 40 ? 'Mixed Signature' : 'Human Written');
                indicator.className = 'indicator ' + (detail.aiScore > 70 ? 'pink' : (detail.aiScore > 40 ? 'purple' : 'cyan'));
            });

            highlightedTextPanel.appendChild(span);
        });
    }

    function renderMathFormulaBreakdown(result1, result2, featureExtraction, result3) {
        const docVector = featureExtraction.vector;
        let html = `
            <div class="math-card">
                <div class="math-header">
                    <span class="math-badge">ALGO 1</span>
                    <h3>Perplexity & Burstiness Calculation</h3>
                </div>
                <div class="math-body">
                    <p class="math-desc">
                        AI writers produce text with highly predictable patterns and uniform sentence lengths. 
                        We measure <strong>Burstiness</strong> (Standard Deviation of sentence lengths) and <strong>Vocabulary Diversity</strong> (Type-Token Ratio).
                    </p>
                    <div class="formula-block">
                        <div class="formula-title">Sentence Length Variance (Burstiness) Formula</div>
                        <div class="latex-eq">\\sigma = \\sqrt{\\frac{1}{N} \\sum_{i=1}^{N} (L_i - \\mu)^2}</div>
                        <div class="formula-values">
                            <strong>Your values:</strong> Sentences ($N$) = ${result1.sentenceCount}, 
                            Average Length ($\\mu$) = ${(result1.wordCount / Math.max(1, result1.sentenceCount)).toFixed(1)} words, 
                            Standard Deviation ($\\sigma$) = ${result1.burstiness}
                        </div>
                    </div>
                    <div class="formula-block">
                        <div class="formula-title">Length-Adjusted Lexical Diversity (Type-Token Ratio - TTR) Formula</div>
                        <div class="latex-eq">TTR = \\frac{\\text{Unique Words}}{\\text{Total Words}} \\quad \\text{and} \\quad \\text{Expected TTR} = 0.86 - (W \\times 0.0003)</div>
                        <div class="formula-values">
                            <strong>Your values:</strong> TTR = ${result1.ttr} 
                            (${Math.round(result1.ttr * result1.wordCount)} unique words out of ${result1.wordCount} words). 
                            Expected Human TTR for this document length is ${(0.86 - result1.wordCount * 0.0003).toFixed(3)}.
                        </div>
                    </div>
                </div>
            </div>

            <div class="math-card">
                <div class="math-header">
                    <span class="math-badge">ALGO 2</span>
                    <h3>K-Nearest Neighbors (KNN) Classifier Resolution</h3>
                </div>
                <div class="math-body">
                    <p class="math-desc">
                        We extract a 5D feature vector representing the document's structure, then measure the 
                        Euclidean distance to 40 pre-classified database articles ($K=5$).
                    </p>
                    <div class="formula-block">
                        <div class="formula-title">Document Feature Vector Profile: [${docVector.join(', ')}]</div>
                        <table class="math-table">
                            <thead>
                                <tr>
                                    <th>Dimension</th>
                                    <th>Feature Name</th>
                                    <th>Raw Metric Value</th>
                                    <th>Normalized (0-1) AI Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Dim 1</td>
                                    <td>Lexical Diversity (TTR)</td>
                                    <td>${featureExtraction.rawMetrics.ttr}</td>
                                    <td class="cell-val">${docVector[0]}</td>
                                </tr>
                                <tr>
                                    <td>Dim 2</td>
                                    <td>Sentence Length Burstiness</td>
                                    <td>${featureExtraction.rawMetrics.burstiness}</td>
                                    <td class="cell-val">${docVector[1]}</td>
                                </tr>
                                <tr>
                                    <td>Dim 3</td>
                                    <td>AI Transition Density</td>
                                    <td>${featureExtraction.rawMetrics.aiDensity}%</td>
                                    <td class="cell-val">${docVector[2]}</td>
                                </tr>
                                <tr>
                                    <td>Dim 4</td>
                                    <td>Coleman-Liau Readability Grade</td>
                                    <td>Grade ${featureExtraction.rawMetrics.gradeLevel}</td>
                                    <td class="cell-val">${docVector[3]}</td>
                                </tr>
                                <tr>
                                    <td>Dim 5</td>
                                    <td>Punctuation Density</td>
                                    <td>${featureExtraction.rawMetrics.punctuationPer100} / 100 words</td>
                                    <td class="cell-val">${docVector[4]}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="formula-block">
                        <div class="formula-title">Euclidean Distance Equation</div>
                        <div class="latex-eq">d(\\mathbf{p}, \\mathbf{q}) = \\sqrt{\\sum_{i=1}^{5} (p_i - q_i)^2}</div>
                        <div class="formula-title">5 Nearest Neighbors in Feature Space:</div>
                        <table class="math-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Neighbor Reference Type</th>
                                    <th>Class Classify</th>
                                    <th>Euclidean Distance ($d$)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${result2.neighbors.map((n, idx) => `
                                    <tr class="${n.label === 1 ? 'neigh-ai' : 'neigh-human'}">
                                        <td>#${idx + 1}</td>
                                        <td>${n.type}</td>
                                        <td><strong>${n.label === 1 ? 'AI' : 'Human'}</strong></td>
                                        <td>${n.distance}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="formula-values" style="margin-top: 10px;">
                            <strong>Classification Vote:</strong> ${result2.aiVotes} AI votes, ${result2.humanVotes} Human votes. 
                            AI Probability = (${result2.aiVotes} / 5) * 100 = <strong>${result2.score}%</strong>.
                        </div>
                    </div>
                </div>
            </div>

            <div class="math-card">
                <div class="math-header">
                    <span class="math-badge">ALGO 3</span>
                    <h3>Stylometric Cosine Similarity (Vector Space Model)</h3>
                </div>
                <div class="math-body">
                    <p class="math-desc">
                        We map the relative frequencies of complex syntactic markers (like first-person pronoun drop, 
                        passive voice frequency, intensifiers) and compute the vector angles against standard profiles.
                    </p>
                    <div class="formula-block">
                        <div class="formula-title">Cosine Similarity Equation</div>
                        <div class="latex-eq">\\cos(\\theta) = \\frac{\\mathbf{A} \\cdot \\mathbf{B}}{\\|\\mathbf{A}\\| \\|\\mathbf{B}\\|} = \\frac{\\sum_{i=1}^{5} A_i B_i}{\\sqrt{\\sum_{i=1}^{5} A_i^2} \\sqrt{\\sum_{i=1}^{5} B_i^2}}</div>
                        <div class="comparison-grid">
                            <div class="comp-box">
                                <div class="comp-title cyan">Similarity to Human Prototype</div>
                                <div class="comp-value">${(result3.similarityToHuman * 100).toFixed(1)}%</div>
                                <div class="comp-sub">Cosine similarity coefficient: ${result3.similarityToHuman}</div>
                            </div>
                            <div class="comp-box">
                                <div class="comp-title pink">Similarity to AI Prototype</div>
                                <div class="comp-value">${(result3.similarityToAI * 100).toFixed(1)}%</div>
                                <div class="comp-sub">Cosine similarity coefficient: ${result3.similarityToAI}</div>
                            </div>
                        </div>
                        <div class="formula-values" style="margin-top: 15px;">
                            <strong>Cosine Difference Verdict:</strong> Since the document is closer to the AI prototype vector 
                            (Similarity = ${result3.similarityToAI}) than the Human prototype vector (Similarity = ${result3.similarityToHuman}), 
                            the Cosine Similarity algorithm score resolves to: <strong>${result3.score}% AI-characteristic</strong>.
                        </div>
                    </div>
                </div>
            </div>
        `;
        formulaContainer.innerHTML = html;
        if (window.MathJax) {
            window.MathJax.typesetPromise();
        }
    }
});
