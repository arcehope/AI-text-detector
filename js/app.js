/**
 * Unified Core Application Controller - Text AI Classifier (Dedicated Version)
 * 
 * Manages local text NLP classifiers, file parser, and SVG dashboard charts.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Helper to force English ASCII digits 0-9 and prevent browser/system locale translation to Nepali
    function formatEngNum(num, decimals = 0) {
        if (num === null || num === undefined || isNaN(num)) return '0';
        let val = (typeof num === 'number') ? num : parseFloat(num);
        if (isNaN(val)) return '0';
        let str = val.toFixed(decimals);
        const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        nepaliDigits.forEach((d, i) => { str = str.replaceAll(d, String(i)); });
        return str;
    }

    // ==========================================
    // 1. INITIALIZE ENGINES & UTILITIES
    // ==========================================
    const perplexityEngine = new window.PerplexityAnalyzer();
    const knnClassifier = new window.KNNClassifier();
    const similarityEngine = new window.CosineSimilarityAnalyzer();
    const grammarEngine = new window.GrammarStyleAnalyzer();
    const trigramEngine = new window.TrigramAnalyzer();
    const posEngine = new window.PosClassifier();
    const lrClassifier = new window.LogisticRegressionClassifier();
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
    const statGrammarScore = document.getElementById('stat-grammar-score');

    const highlightedTextPanel = document.getElementById('highlighted-text-panel');
    const sentenceMetricsCard = document.getElementById('sentence-metrics-card');
    const formulaContainer = document.getElementById('formula-container');

    const sampleAiBtn = document.getElementById('sample-ai-btn');
    const sampleHumanBtn = document.getElementById('sample-human-btn');

    // Text Tab Navigation
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetTab = trigger.getAttribute('data-tab');
            if (targetTab === 'tab-history') {
                const currentUser = window.SentinelDB ? window.SentinelDB.getCurrentUser() : null;
                if (!currentUser) {
                    if (window.showAuthModal) {
                        window.showAuthModal("Guests do not have access to history. Please log in or register an account to view saved records.", "login-form");
                    }
                    return;
                }
            }
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
        if (statGrammarScore) {
            statGrammarScore.textContent = '100%';
        }
        const verdictBanner = document.getElementById('verdict-banner');
        const verdictIcon = document.getElementById('verdict-icon');
        const verdictStatement = document.getElementById('verdict-statement');
        if (verdictBanner && verdictStatement) {
            verdictBanner.className = 'verdict-banner';
            verdictStatement.textContent = 'Awaiting Analysis';
            if (verdictIcon) {
                verdictIcon.setAttribute('data-lucide', 'shield-alert');
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        }
    });

    // Sample loading
    sampleAiBtn.addEventListener('click', () => {
        const text = `In today's fast-paced digital world, artificial intelligence is playing an increasingly crucial role across various industries. Furthermore, the implementation of complex machine learning systems has revolutionized how organizations analyze big data, fostering a synergy between automation and efficiency. It is important to note that these transformative models not only streamline complicated operations but also provide invaluable predictive intelligence. Consequently, companies must delve into the intricate layers of deep learning algorithms in order to remain competitive. In conclusion, the adaptation of generative frameworks stands as a testament to the remarkable capabilities of modern computer science, paving the way for a highly integrated future.`;
        editorArea.value = text;
        updateEditorStats(text);
        runAnalysis(text);
    });

    sampleHumanBtn.addEventListener('click', () => {
        const text = `“This is most likely a customs classification issue. We believe that the majority of these imports are silver granules that have been classified under the Harmonised System (HS) code for silver powder,” Adarsh Diwe, a Mumbai-based consultant at Metals Focus who tracks South Asian bullion markets, told the Post over the phone.
`;
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
            const grammarResult = grammarEngine.analyze(text);

            const lrScore = lrClassifier.predict(featureExtraction.vector) * 100;
            const trigramResult = trigramEngine.analyze(text);
            const posResult = posEngine.analyze(text);
            const knnScore = result2.score;

            // Combined weighted ensemble
            // 25% Logistic Regression, 20% KNN, 25% Trigrams, 15% POS Ratios, 10% Cosine Similarity, 5% Perplexity
            const weightedScore = (lrScore * 0.25) + (knnScore * 0.20) + (trigramResult.score * 0.25) + (posResult.score * 0.15) + (result3.score * 0.10) + (result1.score * 0.05);
            // Apply grammar calibration:
            // 1. Perfect grammar (100% score) gives a +15% boost to the final AI probability
            // 2. Typos (imperfect grammar) discount/reduce the AI probability
            const grammarFactor = grammarResult.perfectionScore / 100;
            const perfectBoost = (grammarResult.perfectionScore === 100) ? 15.0 : 0.0;
            const finalPercentage = Math.min(100, Math.max(0, (weightedScore * grammarFactor) + perfectBoost));

            // Display
            statWordCount.textContent = formatEngNum(result1.wordCount, 0);
            statSentenceCount.textContent = formatEngNum(result1.sentenceCount, 0);
            statBurstiness.textContent = formatEngNum(result1.burstiness, 2);
            statTtr.textContent = formatEngNum(result1.ttr, 3);
            if (statGrammarScore) {
                statGrammarScore.textContent = formatEngNum(grammarResult.perfectionScore, 0) + '%';
            }

            // Determine verdict statement, icon, and class
            let statement = '';
            let iconName = '';
            let className = '';

            if (finalPercentage > 60) {
                statement = 'Most probably written by AI';
                iconName = 'shield-alert';
                className = 'verdict-ai';
            } else if (finalPercentage > 35) {
                statement = 'Most probably written by a Mix of AI & Human';
                iconName = 'help-circle';
                className = 'verdict-mixed';
            } else {
                statement = 'Most probably written by a Human';
                iconName = 'shield-check';
                className = 'verdict-human';
            }

            // Update verdict banner
            const verdictBanner = document.getElementById('verdict-banner');
            const verdictIcon = document.getElementById('verdict-icon');
            const verdictStatement = document.getElementById('verdict-statement');

            if (verdictBanner && verdictStatement) {
                verdictBanner.className = 'verdict-banner';
                verdictStatement.textContent = statement;
                verdictBanner.classList.add(className);
                if (verdictIcon) {
                    verdictIcon.setAttribute('data-lucide', iconName);
                    if (window.lucide) {
                        window.lucide.createIcons();
                    }
                }
            }

            chartEngine.renderGauge('gauge-chart-container', finalPercentage);

            // Populate ensemble breakdown metrics dynamically
            const breakdownContainer = document.getElementById('ensemble-breakdown-container');
            if (breakdownContainer) {
                breakdownContainer.innerHTML = `
                    <div class="ensemble-item" translate="no" lang="en-US">
                        <span class="ensemble-name">Logistic Regression (25% wt)</span>
                        <div class="ensemble-bar-container">
                            <div class="ensemble-bar pink" style="width: ${formatEngNum(lrScore, 0)}%"></div>
                        </div>
                        <span class="ensemble-val" translate="no" lang="en-US">${formatEngNum(lrScore, 0)}%</span>
                    </div>
                    <div class="ensemble-item" translate="no" lang="en-US">
                        <span class="ensemble-name">KNN Classifier (20% wt)</span>
                        <div class="ensemble-bar-container">
                            <div class="ensemble-bar purple" style="width: ${formatEngNum(knnScore, 0)}%"></div>
                        </div>
                        <span class="ensemble-val" translate="no" lang="en-US">${formatEngNum(knnScore, 0)}%</span>
                    </div>
                    <div class="ensemble-item" translate="no" lang="en-US">
                        <span class="ensemble-name">Character Trigram Sim (25% wt)</span>
                        <div class="ensemble-bar-container">
                            <div class="ensemble-bar cyan" style="width: ${formatEngNum(trigramResult.score, 0)}%"></div>
                        </div>
                        <span class="ensemble-val" translate="no" lang="en-US">${formatEngNum(trigramResult.score, 0)}%</span>
                    </div>
                    <div class="ensemble-item" translate="no" lang="en-US">
                        <span class="ensemble-name">POS Syntax Ratios (15% wt)</span>
                        <div class="ensemble-bar-container">
                            <div class="ensemble-bar pink" style="width: ${formatEngNum(posResult.score, 0)}%"></div>
                        </div>
                        <span class="ensemble-val" translate="no" lang="en-US">${formatEngNum(posResult.score, 0)}%</span>
                    </div>
                    <div class="ensemble-item" translate="no" lang="en-US">
                        <span class="ensemble-name">Cosine Style Sim (10% wt)</span>
                        <div class="ensemble-bar-container">
                            <div class="ensemble-bar purple" style="width: ${formatEngNum(result3.score, 0)}%"></div>
                        </div>
                        <span class="ensemble-val" translate="no" lang="en-US">${formatEngNum(result3.score, 0)}%</span>
                    </div>
                    <div class="ensemble-item" translate="no" lang="en-US">
                        <span class="ensemble-name">Statistical Perplexity (5% wt)</span>
                        <div class="ensemble-bar-container">
                            <div class="ensemble-bar cyan" style="width: ${formatEngNum(result1.score, 0)}%"></div>
                        </div>
                        <span class="ensemble-val" translate="no" lang="en-US">${formatEngNum(result1.score, 0)}%</span>
                    </div>
                `;
            }

            chartEngine.renderScatterPlot('scatter-chart-container', result2, featureExtraction.vector);
            chartEngine.renderRadarChart('radar-chart-container', result3.vector);

            renderHighlighting(result1.sentenceDetails, finalPercentage);
            renderMathFormulaBreakdown(result1, result2, featureExtraction, result3, grammarResult, lrScore, trigramResult, posResult, weightedScore, finalPercentage);

            emptyResultsState.style.display = 'none';
            activeResultsPanel.style.display = 'grid';

            if (isSilent) {
                const charCount = text.length;
                document.getElementById('char-word-count').innerHTML =
                    `<span style="color: var(--neon-cyan); font-weight: 500;">✓ Live Analysis Updated</span> | ${result1.wordCount} words | ${charCount} characters`;
            } else if (window.SentinelDB) {
                // Automatically save non-silent analysis to Database
                window.SentinelDB.saveAnalysis({
                    title: text.slice(0, 60).trim() + (text.length > 60 ? '...' : ''),
                    text: text,
                    aiScore: finalPercentage,
                    verdict: statement,
                    verdictClass: className,
                    wordCount: result1.wordCount,
                    sentenceCount: result1.sentenceCount,
                    burstiness: result1.burstiness,
                    ttr: result1.ttr,
                    grammarScore: grammarResult.perfectionScore,
                    lrScore: lrScore,
                    knnScore: knnScore,
                    trigramScore: trigramResult.score,
                    posScore: posResult.score,
                    similarityScore: result3.score,
                    perplexityScore: result1.score
                }).then(() => {
                    if (window.refreshHistoryList) window.refreshHistoryList();
                }).catch(err => console.warn("Failed to save analysis to DB:", err));
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
        if (window.SentinelDB) {
            const quota = window.SentinelDB.checkAnalysisAllowed();
            if (!quota.allowed) {
                if (window.showAuthModal) {
                    window.showAuthModal(quota.message, 'register-form');
                } else {
                    alert(quota.message);
                }
                return false;
            }
        }

        showLoader(true, "Analyzing text stylometrics...");
        setTimeout(() => {
            const result = executeAnalysisCore(text, false);
            showLoader(false);
            if (result !== false && window.SentinelDB) {
                window.SentinelDB.recordAnalysisUsage();
                updateQuotaUI();
            }
        }, 800);
    }

    function updateQuotaUI() {
        const quotaBadge = document.getElementById('quota-status-badge');
        if (!quotaBadge || !window.SentinelDB) return;
        
        const status = window.SentinelDB.checkAnalysisAllowed();
        if (status.userType === 'guest') {
            quotaBadge.style.display = 'inline-flex';
            if (status.allowed) {
                quotaBadge.textContent = "1 Free Daily Analysis (Guest)";
                quotaBadge.className = "quota-badge quota-available";
            } else {
                quotaBadge.textContent = "Daily Limit Reached (0 Left)";
                quotaBadge.className = "quota-badge quota-exhausted";
            }
        } else {
            quotaBadge.style.display = 'none';
        }
    }
    window.updateQuotaUI = updateQuotaUI;

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

    function renderHighlighting(sentenceDetails, docAiScore = 50) {
        highlightedTextPanel.innerHTML = '';
        sentenceMetricsCard.style.display = 'none';

        sentenceDetails.forEach(detail => {
            const span = document.createElement('span');
            span.textContent = detail.text + ' ';
            span.className = 'highlighted-sentence';

            // Anchor sentence score with overall document AI probability
            const rawLocal = (detail.localAiScore !== undefined) ? detail.localAiScore : detail.aiScore;
            let score = (docAiScore * 0.70) + (rawLocal * 0.30);
            score = Math.min(100, Math.max(0, score));

            if (score > 70) {
                span.classList.add('ai-heavy');
            } else if (score > 40) {
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
                document.getElementById('sel-ai-score').textContent = `${formatEngNum(score, 0)}%`;

                const indicator = document.getElementById('sel-classification');
                indicator.textContent = score > 70 ? 'AI Generated' : (score > 40 ? 'Mixed Signature' : 'Human Written');
                indicator.className = 'indicator ' + (score > 70 ? 'red' : (score > 40 ? 'orange' : 'green'));
            });

            highlightedTextPanel.appendChild(span);
        });
    }

    function renderMathFormulaBreakdown(result1, result2, featureExtraction, result3, grammarResult, lrScore, trigramResult, posResult, weightedScore, finalPercentage) {
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
                        <div class="formula-title">Sentence Length Variance (Burstiness)</div>
                        <div class="math-value-box">
                            <div class="math-value cyan">${result1.burstiness} <span style="font-size: 13px; font-weight: normal; color: var(--text-muted);">vs Expected (Human: 8.0 - 15.0 | AI: 1.0 - 5.0)</span></div>
                            <div class="math-formula">\\[\\sigma = \\sqrt{\\frac{1}{N} \\sum_{i=1}^{N} (L_i - \\mu)^2}\\]</div>
                        </div>
                        <div class="formula-values">
                            <strong>Your values:</strong> Sentences \\((N)\\) = ${result1.sentenceCount}, 
                            Average Length \\((\\mu)\\) = ${(result1.wordCount / Math.max(1, result1.sentenceCount)).toFixed(1)} words.
                        </div>
                    </div>
                    <div class="formula-block">
                        <div class="formula-title">Length-Adjusted Lexical Diversity (TTR)</div>
                        <div class="math-value-box">
                            <div class="math-value cyan">${result1.ttr} <span style="font-size: 13px; font-weight: normal; color: var(--text-muted);">vs Expected (Human: ${(0.86 - result1.wordCount * 0.0003).toFixed(3)} | AI: ${(0.78 - result1.wordCount * 0.0003).toFixed(3)})</span></div>
                            <div class="math-formula">\\[\\text{TTR} = \\frac{\\text{Unique Words}}{\\text{Total Words}}\\]\\[\\text{Expected}_{\\text{Human}} = 0.86 - (W \\times 0.0003) \\qquad \\text{Expected}_{\\text{AI}} = 0.78 - (W \\times 0.0003)\\]</div>
                        </div>
                        <div class="formula-values">
                            <strong>Your values:</strong> Unique Words = ${Math.round(result1.ttr * result1.wordCount)}, Total Words (\\(W\\)) = ${result1.wordCount}.
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
                        <div class="formula-title">KNN Classifier AI Probability</div>
                        <div class="math-value-box">
                            <div class="math-value pink">${result2.score}% AI-characteristic</div>
                            <div class="math-formula">\\[d(\\mathbf{p}, \\mathbf{q}) = \\sqrt{\\sum_{i=1}^{5} (p_i - q_i)^2}\\]</div>
                        </div>
                        <div class="formula-title" style="margin-top: 15px;">5 Nearest Neighbors in Feature Space:</div>
                        <table class="math-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Neighbor Reference Type</th>
                                    <th>Class Classify</th>
                                    <th>Euclidean Distance (\\(d\\))</th>
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
                        <div class="formula-title">Cosine Vector Space Similarity</div>
                        <div class="math-value-box">
                            <div class="math-value pink">${result3.score}% AI-characteristic</div>
                            <div class="math-formula">\\[\\cos(\\theta) = \\frac{\\mathbf{A} \\cdot \\mathbf{B}}{\\|\\mathbf{A}\\| \\|\\mathbf{B}\\|} = \\frac{\\displaystyle\\sum_{i=1}^{5} A_i B_i}{\\displaystyle\\sqrt{\\sum_{i=1}^{5} A_i^2}\\;\\sqrt{\\sum_{i=1}^{5} B_i^2}}\\]</div>
                        </div>
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

            <div class="math-card">
                <div class="math-header">
                    <span class="math-badge">ALGO 4</span>
                    <h3>Heuristic Grammar & Typography Analyzer</h3>
                </div>
                <div class="math-body">
                    <p class="math-desc">
                        Typos and grammatical slips are a strong indicator of human authorship, as AI models output grammatically perfect text. We evaluate punctuation spacing, duplicate words, subject-verb agreement, lowercase pronouns, and common double negatives to compute a <strong>Grammar Perfection Score</strong>.
                    </p>
                    <div class="formula-block">
                        <div class="formula-title">Grammar Perfection Score</div>
                        <div class="math-value-box">
                            <div class="math-value cyan">${grammarResult.perfectionScore}% Perfect</div>
                            <div class="math-formula">\\[\\text{Score}_{\\text{grammar}} = \\max\\left(0,\\; 100 - 15 \\times \\text{Penalty}_{\\text{norm}}\\right)\\]\\[\\text{Penalty}_{\\text{norm}} = \\frac{\\displaystyle\\sum \\text{Matches}_i \\times w_i}{\\max(10,\\;\\text{Word Count})} \\times 100\\]</div>
                        </div>
                        <div class="formula-values" style="margin-top: 15px;">
                            <strong>Detected Grammar/Typo Issues:</strong>
                            ${grammarResult.issues.length === 0 ?
                '<div style="color: var(--neon-cyan); margin-top: 5px;">✓ No issues detected (100% perfect grammar - AI characteristic).</div>' :
                `<ul style="margin: 8px 0 0 20px; color: var(--text-muted); font-size: 11px;">
                                    ${grammarResult.issues.map(issue => `
                                        <li><strong>${issue.name}:</strong> ${issue.count} occurrence${issue.count > 1 ? 's' : ''} (${issue.description}). Found: <code>${issue.occurrences.join(', ')}</code></li>
                                    `).join('')}
                                </ul>`
            }
                        </div>
                    </div>
                </div>
            </div>

            <div class="math-card">
                <div class="math-header">
                    <span class="math-badge">FINAL ENSEMBLE</span>
                    <h3>Ensemble Resolution & Grammar Calibration</h3>
                </div>
                <div class="math-body">
                    <p class="math-desc">
                        The overall AI detection probability is calculated as a weighted ensemble of the five specialized algorithms (Logistic Regression, Character Trigrams, POS Syntax, Cosine Similarity, and Perplexity), then calibrated by the Grammar Perfection Factor.
                    </p>
                    <div class="formula-block">
                        <div class="formula-title">Calibrated AI Probability</div>
                        <div class="math-value-box">
                            <div class="math-value pink notranslate" translate="no" lang="en-US" style="font-size: 28px;">${formatEngNum(finalPercentage, 1)}%</div>
                            <div class="math-formula">\\[P_{\\text{final}} = \\min\\!\\left(100,\\; P_{\\text{ensemble}} \\times \\frac{\\text{Score}_{\\text{grammar}}}{100} + \\text{Boost}_{\\text{perfect}}\\right)\\]</div>
                        </div>
                        <div class="formula-values notranslate" translate="no" lang="en-US" style="margin-top: 15px;">
                            <strong>1. Logistic Regression (25% Weight):</strong> ${formatEngNum(lrScore, 1)}% (Weighted: ${formatEngNum(lrScore * 0.25, 1)}%)<br>
                            <strong>2. KNN Classifier (20% Weight):</strong> ${formatEngNum(result2.score, 1)}% (Weighted: ${formatEngNum(result2.score * 0.20, 1)}%)<br>
                            <strong>3. Character Trigrams (25% Weight):</strong> ${formatEngNum(trigramResult.score, 1)}% (Weighted: ${formatEngNum(trigramResult.score * 0.25, 1)}%)<br>
                            <strong>4. POS Syntax Ratios (15% Weight):</strong> ${formatEngNum(posResult.score, 1)}% (Weighted: ${formatEngNum(posResult.score * 0.15, 1)}%)<br>
                            <strong>5. Cosine Similarity (10% Weight):</strong> ${formatEngNum(result3.score, 1)}% (Weighted: ${formatEngNum(result3.score * 0.10, 1)}%)<br>
                            <strong>6. Perplexity Engine (5% Weight):</strong> ${formatEngNum(result1.score, 1)}% (Weighted: ${formatEngNum(result1.score * 0.05, 1)}%)<br>
                            <div style="margin: 8px 0; border-top: 1px solid var(--border-color); padding-top: 8px;">
                                <strong>Raw Ensemble Probability (Weighted Sum):</strong> ${formatEngNum(weightedScore, 1)}%
                            </div>
                            <strong>Grammar Perfection Discount:</strong> ${formatEngNum(grammarResult.perfectionScore, 0)}% (Factor: ${formatEngNum(grammarResult.perfectionScore / 100, 3)})<br>
                            <strong>Perfect Grammar Boost (100% Score):</strong> ${grammarResult.perfectionScore === 100 ? '+15%' : '+0%'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        formulaContainer.innerHTML = html;
        if (window.MathJax) {
            window.MathJax.typesetPromise([formulaContainer]).catch(err => console.warn('MathJax error:', err));
        }
    }

    // ==========================================
    // 3. ANALYSIS HISTORY DATABASE MANAGEMENT & DRAWER
    // ==========================================
    const historyListContainer = document.getElementById('history-list-container');
    const historySearchInput = document.getElementById('history-search-input');
    const historyVerdictFilter = document.getElementById('history-verdict-filter');
    const histTotalCount = document.getElementById('hist-total-count');
    const histAvgScore = document.getElementById('hist-avg-score');
    const exportHistoryBtn = document.getElementById('export-history-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Drawer Elements
    const historyDrawer = document.getElementById('history-drawer');
    const historyDrawerOverlay = document.getElementById('history-drawer-overlay');
    const openHistoryDrawerBtn = document.getElementById('open-history-drawer-btn');
    const openGuestHistoryBtn = document.getElementById('open-guest-history-btn');
    const closeHistoryDrawerBtn = document.getElementById('close-history-drawer');
    const drawerHistoryListContainer = document.getElementById('drawer-history-list-container');
    const drawerSearchInput = document.getElementById('drawer-search-input');
    const drawerVerdictFilter = document.getElementById('drawer-verdict-filter');
    const drawerHistCount = document.getElementById('drawer-hist-count');
    const drawerHistAvg = document.getElementById('drawer-hist-avg');
    const drawerExportBtn = document.getElementById('drawer-export-btn');
    const drawerClearBtn = document.getElementById('drawer-clear-btn');

    let historyRecords = [];

    function openDrawer() {
        const currentUser = window.SentinelDB ? window.SentinelDB.getCurrentUser() : null;
        if (!currentUser) {
            if (window.showAuthModal) {
                window.showAuthModal("Guests do not have access to history. Please log in or register an account to view saved records.", "login-form");
            }
            return;
        }
        if (historyDrawer && historyDrawerOverlay) {
            historyDrawer.classList.add('active');
            historyDrawerOverlay.classList.add('active');
            refreshHistoryList();
        }
    }

    function closeDrawer() {
        if (historyDrawer && historyDrawerOverlay) {
            historyDrawer.classList.remove('active');
            historyDrawerOverlay.classList.remove('active');
        }
    }

    if (openHistoryDrawerBtn) openHistoryDrawerBtn.addEventListener('click', openDrawer);
    if (openGuestHistoryBtn) openGuestHistoryBtn.addEventListener('click', openDrawer);
    if (closeHistoryDrawerBtn) closeHistoryDrawerBtn.addEventListener('click', closeDrawer);
    if (historyDrawerOverlay) historyDrawerOverlay.addEventListener('click', closeDrawer);

    async function refreshHistoryList() {
        if (!window.SentinelDB) return;
        try {
            historyRecords = await window.SentinelDB.getHistory();
            renderHistoryList();
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    }

    function renderHistoryList() {
        const currentUser = window.SentinelDB ? window.SentinelDB.getCurrentUser() : null;
        if (!currentUser) {
            if (historyListContainer) {
                historyListContainer.innerHTML = `
                    <div class="empty-history-state">
                        <i data-lucide="lock"></i>
                        <h4>History Access Restricted</h4>
                        <p>Guests do not have access to history. Please log in or register an account to view saved records.</p>
                        <button class="btn btn-primary btn-sm" style="margin-top: 12px;" onclick="if(window.showAuthModal) window.showAuthModal('Log in or create an account to access history', 'login-form')">Log In / Sign Up</button>
                    </div>
                `;
            }
            if (drawerHistoryListContainer) {
                drawerHistoryListContainer.innerHTML = `
                    <div class="empty-history-state">
                        <i data-lucide="lock"></i>
                        <h4>History Locked</h4>
                        <p>Guests do not have access to history. Please log in to view records.</p>
                    </div>
                `;
            }
            if (histTotalCount) histTotalCount.textContent = '0';
            if (histAvgScore) histAvgScore.textContent = '0%';
            if (drawerHistCount) drawerHistCount.textContent = '0';
            if (drawerHistAvg) drawerHistAvg.textContent = '0%';
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        // Tab Filtering
        const searchQuery = historySearchInput ? historySearchInput.value.toLowerCase().trim() : '';
        const verdictFilter = historyVerdictFilter ? historyVerdictFilter.value : 'all';

        let filteredTab = historyRecords.filter(rec => {
            const titleStr = String(rec.title || '').toLowerCase();
            const textStr = String(rec.text || '').toLowerCase();
            const verdictStr = String(rec.verdict || '').toLowerCase();
            const userStr = String(rec.username || '').toLowerCase();

            const matchesSearch = !searchQuery || 
                titleStr.includes(searchQuery) || 
                textStr.includes(searchQuery) ||
                verdictStr.includes(searchQuery) ||
                userStr.includes(searchQuery);

            const matchesVerdict = (verdictFilter === 'all') || (rec.verdictClass === verdictFilter);
            return matchesSearch && matchesVerdict;
        });

        // Drawer Filtering
        const drawerSearchQuery = drawerSearchInput ? drawerSearchInput.value.toLowerCase().trim() : '';
        const drawerVerdict = drawerVerdictFilter ? drawerVerdictFilter.value : 'all';

        let filteredDrawer = historyRecords.filter(rec => {
            const titleStr = String(rec.title || '').toLowerCase();
            const textStr = String(rec.text || '').toLowerCase();
            const verdictStr = String(rec.verdict || '').toLowerCase();
            const userStr = String(rec.username || '').toLowerCase();

            const matchesSearch = !drawerSearchQuery || 
                titleStr.includes(drawerSearchQuery) || 
                textStr.includes(drawerSearchQuery) ||
                verdictStr.includes(drawerSearchQuery) ||
                userStr.includes(drawerSearchQuery);

            const matchesVerdict = (drawerVerdict === 'all') || (rec.verdictClass === drawerVerdict);
            return matchesSearch && matchesVerdict;
        });

        // Summary stats - Tab
        if (histTotalCount) histTotalCount.textContent = formatEngNum(filteredTab.length, 0);
        if (histAvgScore) {
            const avg = filteredTab.length > 0 ? (filteredTab.reduce((sum, r) => sum + (parseFloat(r.aiScore) || 0), 0) / filteredTab.length) : 0;
            histAvgScore.textContent = formatEngNum(avg, 1) + '%';
        }

        // Summary stats - Drawer
        if (drawerHistCount) drawerHistCount.textContent = formatEngNum(filteredDrawer.length, 0);
        if (drawerHistAvg) {
            const avg = filteredDrawer.length > 0 ? (filteredDrawer.reduce((sum, r) => sum + (parseFloat(r.aiScore) || 0), 0) / filteredDrawer.length) : 0;
            drawerHistAvg.textContent = formatEngNum(avg, 1) + '%';
        }

        // Render Tab List
        if (historyListContainer) {
            if (filteredTab.length === 0) {
                historyListContainer.innerHTML = `
                    <div class="empty-history-state">
                        <i data-lucide="database"></i>
                        <h4>No Analysis Records Found</h4>
                        <p>${searchQuery || verdictFilter !== 'all' ? 'No records match your search filter.' : 'Run an analysis above to automatically save records to the database.'}</p>
                    </div>
                `;
            } else {
                historyListContainer.innerHTML = filteredTab.map(rec => generateCardHTML(rec)).join('');
            }
        }

        // Render Drawer List
        if (drawerHistoryListContainer) {
            if (filteredDrawer.length === 0) {
                drawerHistoryListContainer.innerHTML = `
                    <div class="empty-history-state">
                        <i data-lucide="database"></i>
                        <h4>No Analysis Records</h4>
                        <p>${drawerSearchQuery || drawerVerdict !== 'all' ? 'No records match filter.' : 'Run an analysis to save records.'}</p>
                    </div>
                `;
            } else {
                drawerHistoryListContainer.innerHTML = filteredDrawer.map(rec => generateCardHTML(rec)).join('');
            }
        }

        if (window.lucide) window.lucide.createIcons();

        // Attach event listeners for reload and delete buttons
        document.querySelectorAll('.reload-history-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recId = e.currentTarget.getAttribute('data-id');
                const rec = historyRecords.find(r => r.id === recId);
                if (rec) {
                    closeDrawer();
                    editorArea.value = rec.text;
                    updateEditorStats(rec.text);
                    const dashTabBtn = document.querySelector('.tab-trigger[data-tab="tab-dashboard"]');
                    if (dashTabBtn) dashTabBtn.click();
                    runAnalysis(rec.text);
                }
            });
        });

        document.querySelectorAll('.delete-history-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const recId = e.currentTarget.getAttribute('data-id');
                if (confirm("Are you sure you want to delete this analysis record from the database?")) {
                    await window.SentinelDB.deleteHistoryItem(recId);
                    refreshHistoryList();
                }
            });
        });
    }

    function generateCardHTML(rec) {
        const dateStr = new Date(rec.timestamp).toLocaleString();
        const badgeClass = rec.verdictClass || (rec.aiScore > 60 ? 'verdict-ai' : (rec.aiScore > 35 ? 'verdict-mixed' : 'verdict-human'));
        return `
            <div class="history-card" data-id="${rec.id}">
                <div class="history-card-header">
                    <div>
                        <div class="history-card-title">${escapeHtml(rec.title || rec.text.slice(0, 60))}</div>
                        <div class="history-card-date">${dateStr} • User: ${escapeHtml(rec.username || 'guest')}</div>
                    </div>
                    <span class="history-badge ${badgeClass}">
                        ${formatEngNum(rec.aiScore, 1)}% AI
                    </span>
                </div>
                <div class="history-meta-grid">
                    <div class="history-meta-item">
                        <span class="lbl">Words</span>
                        <span class="val">${formatEngNum(rec.wordCount, 0)}</span>
                    </div>
                    <div class="history-meta-item">
                        <span class="lbl">Burstiness</span>
                        <span class="val">${formatEngNum(rec.burstiness, 2)}</span>
                    </div>
                    <div class="history-meta-item">
                        <span class="lbl">TTR</span>
                        <span class="val">${formatEngNum(rec.ttr, 3)}</span>
                    </div>
                    <div class="history-meta-item">
                        <span class="lbl">Grammar</span>
                        <span class="val">${formatEngNum(rec.grammarScore, 0)}%</span>
                    </div>
                </div>
                <div class="history-card-footer">
                    <div class="history-card-date" style="font-style: italic;">Verdict: ${escapeHtml(rec.verdict || '')}</div>
                    <div class="history-actions">
                        <button class="btn btn-secondary btn-sm reload-history-btn" data-id="${rec.id}" title="View / Reload Analysis">
                            <i data-lucide="external-link"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-history-btn" data-id="${rec.id}" title="Delete Record">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    if (historySearchInput) {
        ['input', 'keyup', 'change'].forEach(evt => historySearchInput.addEventListener(evt, renderHistoryList));
    }
    if (historyVerdictFilter) historyVerdictFilter.addEventListener('change', renderHistoryList);

    if (drawerSearchInput) {
        ['input', 'keyup', 'change'].forEach(evt => drawerSearchInput.addEventListener(evt, renderHistoryList));
    }
    if (drawerVerdictFilter) drawerVerdictFilter.addEventListener('change', renderHistoryList);

    async function triggerClear() {
        if (confirm("Clear all your saved analysis history from the database?")) {
            await window.SentinelDB.clearAllHistory();
            refreshHistoryList();
        }
    }

    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', triggerClear);
    if (drawerClearBtn) drawerClearBtn.addEventListener('click', triggerClear);

    window.refreshHistoryList = refreshHistoryList;
    // Initial fetch on app load
    setTimeout(() => {
        refreshHistoryList();
        updateQuotaUI();
    }, 500);
});
