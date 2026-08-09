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

    function getIEEEBlocks() {
        function S(n, t, indent) { return '<div class="ieee-step' + (indent ? ' ieee-indent-' + indent : '') + '"><span class="ieee-ln">' + n + ':</span> ' + t + '</div>'; }
        function K(t) { return '<span class="ieee-kw">' + t + '</span>'; }
        function V(t) { return '<em>' + t + '</em>'; }
        function C(t) { return '<span class="ieee-comment">// ' + t + '</span>'; }
        function IO(type, t) { return '<div><strong class="ieee-kw">' + type + ':</strong> ' + t + '</div>'; }
        function wrap(num, title, ios, steps) {
            return '<details class="ieee-details">' +
                '<summary><div class="ieee-toggle-btn"><span>\u25B8 IEEE Algorithm Specification</span><span class="ieee-chevron">\u25BE</span></div></summary>' +
                '<div class="ieee-algorithm"><div class="ieee-algo-header">' +
                '<span class="ieee-algo-number">Algorithm ' + num + '</span>' +
                '<span class="ieee-algo-title">' + title + '</span></div>' +
                '<div class="ieee-algo-body"><div class="ieee-io">' + ios + '</div>' +
                '<div class="ieee-steps">' + steps + '</div></div></div></details>';
        }

        return {
            perplexity: wrap(1, 'Perplexity &amp; Burstiness NLP Analysis',
                IO('Input', 'Document text ' + V('T')) + IO('Output', 'AI probability score ' + V('S') + ' \u2208 [0, 100], per-sentence heatmap'),
                S(1, V('sentences') + ' \u2190 SplitSentences(' + V('T') + ')') +
                S(2, V('words') + ' \u2190 Tokenize(lower(' + V('T') + '))') +
                S(3, K('if') + ' |' + V('words') + '| &lt; 5 ' + K('then return') + ' 50') +
                S(4, C('Phase 1: Burstiness (sentence length std dev)')) +
                S(5, V('\u03BC') + ' \u2190 mean of sentence lengths', 1) +
                S(6, V('\u03C3') + ' \u2190 \u221A(1/' + V('N') + ' \u00B7 \u03A3(L_i \u2212 ' + V('\u03BC') + ')\u00B2)', 1) +
                S(7, C('Phase 2: Lexical Diversity')) +
                S(8, V('TTR') + ' \u2190 |UniqueWords| / |' + V('words') + '|') +
                S(9, C('Phase 3: Shannon Entropy & Predictability')) +
                S(10, V('H(X)') + ' \u2190 \u2212\u03A3 P(w)\u00B7log\u2082P(w)') +
                S(11, V('penalty') + ' \u2190 bigramRatio \u00D7 50 + aiWordRatio \u00D7 250') +
                S(12, C('Phase 4: Normalize & combine')) +
                S(13, V('burstF') + ' \u2190 clamp(100 \u2212 ' + V('\u03C3') + ' \u00D7 9, 0, 100)', 1) +
                S(14, V('ttrF') + ' \u2190 clamp(50 + (TTR_exp \u2212 ' + V('TTR') + ') \u00D7 250, 0, 100)', 1) +
                S(15, V('predF') + ' \u2190 clamp((' + V('penalty') + ' / 18) \u00D7 100, 0, 100)', 1) +
                S(16, V('S') + ' \u2190 ' + V('burstF') + '\u00D70.30 + ' + V('ttrF') + '\u00D70.20 + ' + V('predF') + '\u00D70.50') +
                S(17, K('return') + ' ' + V('S'))
            ),

            knn: wrap(2, 'K-Nearest Neighbors Classification (K=5)',
                IO('Input', 'Document text ' + V('T') + ', training set ' + V('D') + ' of 43 labeled vectors') + IO('Output', 'AI probability score ' + V('S') + ' \u2208 [0, 100], K nearest neighbors'),
                S(1, C('Phase 1: Extract 5D normalized feature vector')) +
                S(2, V('f\u2080') + ' \u2190 clamp(0.5 + (TTR_exp \u2212 TTR) \u00D7 5.0, 0, 1)', 1) +
                S(3, V('f\u2081') + ' \u2190 clamp(1.0 \u2212 burstiness / 30.0, 0, 1)', 1) +
                S(4, V('f\u2082') + ' \u2190 clamp(aiWordCount / |words| / 0.012, 0, 1)', 1) +
                S(5, V('f\u2083') + ' \u2190 clamp(1 \u2212 |13 \u2212 CLI| / 12, 0, 1)', 1) +
                S(6, V('f\u2084') + ' \u2190 clamp(1 \u2212 |11 \u2212 punctPer100| / 12, 0, 1)', 1) +
                S(7, V('v') + ' \u2190 [' + V('f\u2080') + ', ' + V('f\u2081') + ', ' + V('f\u2082') + ', ' + V('f\u2083') + ', ' + V('f\u2084') + ']') +
                S(8, C('Phase 2: Weighted Euclidean distances')) +
                S(9, V('w') + ' \u2190 [2.5, 2.5, 1.5, 0.5, 0.5]') +
                S(10, K('for each') + ' (' + V('x_j') + ', ' + V('y_j') + ') \u2208 ' + V('D') + ' ' + K('do')) +
                S(11, V('d_j') + ' \u2190 \u221A(\u03A3_i w_i \u00B7 (v_i \u2212 x_ji)\u00B2)', 1) +
                S(12, K('end for')) +
                S(13, C('Phase 3: Vote among K nearest')) +
                S(14, V('N_K') + ' \u2190 K vectors from ' + V('D') + ' with smallest ' + V('d')) +
                S(15, V('aiVotes') + ' \u2190 |{n \u2208 ' + V('N_K') + ' : label(n) = AI}|') +
                S(16, V('S') + ' \u2190 (aiVotes / K) \u00D7 100') +
                S(17, K('return') + ' ' + V('S') + ', ' + V('N_K'))
            ),

            cosine: wrap(3, 'Stylometric Cosine Similarity Analysis',
                IO('Input', 'Document text ' + V('T') + ', prototypes ' + V('P_AI') + ', ' + V('P_Human') + ' \u2208 \u211D\u2075') + IO('Output', 'AI probability score ' + V('S') + ' \u2208 [0, 100]'),
                S(1, C('Phase 1: Extract stylometric features')) +
                S(2, V('v\u2080') + ' \u2190 min(1, firstPersonRatio / 0.04)', 1) +
                S(3, V('v\u2081') + ' \u2190 min(1, transitionRatio / 0.04)', 1) +
                S(4, V('v\u2082') + ' \u2190 min(1, intensifierRatio / 0.045)', 1) +
                S(5, V('v\u2083') + ' \u2190 min(1, passiveVoiceRatio / 0.015)', 1) +
                S(6, V('v\u2084') + ' \u2190 clamp(0.3 + (hapax_exp \u2212 hapaxRatio) \u00D7 2, 0, 1)', 1) +
                S(7, V('v') + ' \u2190 [' + V('v\u2080') + ', ' + V('v\u2081') + ', ' + V('v\u2082') + ', ' + V('v\u2083') + ', ' + V('v\u2084') + ']') +
                S(8, C('Phase 2: Cosine similarities')) +
                S(9, V('sim_AI') + ' \u2190 (' + V('v') + ' \u00B7 ' + V('P_AI') + ') / (\u2016' + V('v') + '\u2016 \u00B7 \u2016' + V('P_AI') + '\u2016)') +
                S(10, V('sim_Hum') + ' \u2190 (' + V('v') + ' \u00B7 ' + V('P_Hum') + ') / (\u2016' + V('v') + '\u2016 \u00B7 \u2016' + V('P_Hum') + '\u2016)') +
                S(11, C('Phase 3: Score mapping')) +
                S(12, V('S') + ' \u2190 clamp((' + V('sim_AI') + ' \u2212 ' + V('sim_Hum') + ' + 1) / 2 \u00D7 100, 0, 100)') +
                S(13, K('return') + ' ' + V('S'))
            ),

            grammar: wrap(4, 'Heuristic Grammar &amp; Typography Analysis',
                IO('Input', 'Document text ' + V('T') + ', rule set ' + V('R') + ' = {(regex_i, w_i)} of 9 weighted patterns') + IO('Output', 'Perfection score ' + V('G') + ' \u2208 [0, 100], issue list ' + V('I')),
                S(1, V('totalPenalty') + ' \u2190 0; ' + V('I') + ' \u2190 \u2205') +
                S(2, K('for each') + ' (regex_i, w_i, name_i) \u2208 ' + V('R') + ' ' + K('do')) +
                S(3, V('matches_i') + ' \u2190 FindAll(regex_i, ' + V('T') + ')', 1) +
                S(4, V('totalPenalty') + ' += |' + V('matches_i') + '| \u00D7 w_i', 1) +
                S(5, K('if') + ' |' + V('matches_i') + '| &gt; 0 ' + K('then') + ' ' + V('I') + ' \u2190 ' + V('I') + ' \u222A {(name_i, matches)}', 1) +
                S(6, K('end for')) +
                S(7, V('norm') + ' \u2190 (' + V('totalPenalty') + ' / max(10, |words|)) \u00D7 100') +
                S(8, V('G') + ' \u2190 clamp(100 \u2212 15 \u00D7 ' + V('norm') + ', 0, 100)') +
                S(9, K('return') + ' ' + V('G') + ', ' + V('I'))
            ),

            logistic: wrap(5, 'Binary Logistic Regression Classification',
                IO('Input', 'Feature vector ' + V('v') + ' \u2208 \u211D\u2075, learned weights ' + V('w') + ', bias ' + V('\u03B2\u2080')) + IO('Output', 'AI probability ' + V('P') + ' \u2208 [0, 1]'),
                S(1, C('Compute linear combination (logit)')) +
                S(2, V('z') + ' \u2190 ' + V('\u03B2\u2080') + ' + \u03A3_i ' + V('w_i') + ' \u00B7 ' + V('v_i')) +
                S(3, C('\u03B2\u2080 = \u221210.87, w = [6.794, \u22120.174, 0.580, 5.291, 2.937]')) +
                S(4, C('Apply sigmoid activation')) +
                S(5, V('P') + ' \u2190 \u03C3(' + V('z') + ') = 1 / (1 + e^(\u2212' + V('z') + '))') +
                S(6, K('return') + ' ' + V('P'))
            ),

            trigram: wrap(6, 'Character Trigram Cosine Similarity',
                IO('Input', 'Document text ' + V('T') + ', reference profiles ' + V('H_ref') + ', ' + V('AI_ref') + ' \u2208 \u211D\u00B2\u2070') + IO('Output', 'AI probability score ' + V('S') + ' \u2208 [0, 100]'),
                S(1, K('if') + ' |' + V('T') + '| &lt; 10 ' + K('then return') + ' 50') +
                S(2, V('T\'') + ' \u2190 lower(collapse_whitespace(' + V('T') + '))') +
                S(3, C('Build 20-dim trigram frequency vector')) +
                S(4, K('for') + ' i \u2190 0 ' + K('to') + ' |' + V('T\'') + '| \u2212 3 ' + K('do')) +
                S(5, V('tg') + ' \u2190 ' + V('T\'') + '[i : i+3]', 1) +
                S(6, K('if') + ' ' + V('tg') + ' \u2208 targetTrigrams ' + K('then') + ' counts[' + V('tg') + ']++', 1) +
                S(7, K('end for')) +
                S(8, K('for each') + ' ' + V('tg') + ' \u2208 targetTrigrams ' + K('do')) +
                S(9, V('V') + '[' + V('tg') + '] \u2190 (counts[' + V('tg') + '] / totalTrigrams) \u00D7 10000', 1) +
                S(10, K('end for')) +
                S(11, V('sim_AI') + ' \u2190 cos(' + V('V') + ', ' + V('AI_ref') + ')') +
                S(12, V('sim_Hum') + ' \u2190 cos(' + V('V') + ', ' + V('H_ref') + ')') +
                S(13, V('S') + ' \u2190 clamp((sim_AI \u2212 sim_Hum + 1) / 2 \u00D7 100, 0, 100)') +
                S(14, K('return') + ' ' + V('S'))
            ),

            pos: wrap(7, 'Part-of-Speech Syntax Ratio Classification',
                IO('Input', 'Document text ' + V('T') + ', centroids ' + V('C_AI') + ', ' + V('C_Hum') + ' \u2208 \u211D\u2075') + IO('Output', 'AI probability score ' + V('S') + ' \u2208 [0, 100]'),
                S(1, V('words') + ' \u2190 Tokenize(lower(' + V('T') + '))') +
                S(2, V('categories') + ' \u2190 {Det, Prep, Pron, Conj, Aux}') +
                S(3, K('for each') + ' ' + V('w') + ' \u2208 ' + V('words') + ' ' + K('do')) +
                S(4, K('for each') + ' cat \u2208 ' + V('categories') + ' ' + K('do'), 1) +
                S(5, K('if') + ' ' + V('w') + ' \u2208 lexicon(cat) ' + K('then') + ' counts[cat]++', 2) +
                S(6, K('end for'), 1) +
                S(7, K('end for')) +
                S(8, K('for each') + ' cat \u2208 ' + V('categories') + ' ' + K('do')) +
                S(9, V('v') + '[cat] \u2190 counts[cat] / |' + V('words') + '|', 1) +
                S(10, K('end for')) +
                S(11, V('sim_AI') + ' \u2190 cos(' + V('v') + ', ' + V('C_AI') + ')') +
                S(12, V('sim_Hum') + ' \u2190 cos(' + V('v') + ', ' + V('C_Hum') + ')') +
                S(13, V('S') + ' \u2190 clamp((sim_AI \u2212 sim_Hum + 1) / 2 \u00D7 100, 0, 100)') +
                S(14, K('return') + ' ' + V('S'))
            ),

            ensemble: wrap(8, 'Weighted Ensemble Resolution &amp; Grammar Calibration',
                IO('Input', 'Component scores {' + V('LR') + ', ' + V('Tri') + ', ' + V('KNN') + ', ' + V('POS') + ', ' + V('Cos') + ', ' + V('Perp') + '}, grammar score ' + V('G')) + IO('Output', 'Calibrated AI probability ' + V('P_final') + ' \u2208 [0, 100]'),
                S(1, C('Phase 1: Weighted ensemble sum')) +
                S(2, V('P_ens') + ' \u2190 LR\u00D70.25 + Tri\u00D70.25 + KNN\u00D70.20 + POS\u00D70.15 + Cos\u00D70.10 + Perp\u00D70.05') +
                S(3, C('Phase 2: Grammar calibration')) +
                S(4, V('factor') + ' \u2190 ' + V('G') + ' / 100') +
                S(5, K('if') + ' ' + V('G') + ' = 100 ' + K('then') + ' ' + V('boost') + ' \u2190 15') +
                S(6, K('else') + ' ' + V('boost') + ' \u2190 0') +
                S(7, K('end if')) +
                S(8, V('P_final') + ' \u2190 min(100, max(0, ' + V('P_ens') + ' \u00D7 ' + V('factor') + ' + ' + V('boost') + '))') +
                S(9, K('return') + ' ' + V('P_final'))
            )
        };
    }

    function renderMathFormulaBreakdown(result1, result2, featureExtraction, result3, grammarResult, lrScore, trigramResult, posResult, weightedScore, finalPercentage) {
        const docVector = featureExtraction.vector;
        const ieee = getIEEEBlocks();
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
                    ${ieee.perplexity}
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
                    ${ieee.knn}
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
                    ${ieee.cosine}
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
                    ${ieee.grammar}
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
                    <span class="math-badge">ALGO 5</span>
                    <h3>Binary Logistic Regression Classifier</h3>
                </div>
                <div class="math-body">
                    <p class="math-desc">
                        A pre-trained logistic regression model maps the 5D stylometric feature vector through learned weights and a sigmoid activation function to produce a binary AI-vs-Human probability. The model was trained on a 1,000-sample balanced dataset.
                    </p>
                    ${ieee.logistic}
                    <div class="formula-block">
                        <div class="formula-title">Sigmoid Output AI Probability</div>
                        <div class="math-value-box">
                            <div class="math-value pink">${formatEngNum(lrScore, 1)}% AI-characteristic</div>
                            <div class="math-formula">\\[\\sigma(z) = \\frac{1}{1 + e^{-z}}\\]\\[z = \\beta_0 + \\sum_{i=0}^{4} w_i f_i\\]</div>
                        </div>
                        <div class="formula-values" style="margin-top: 15px;">
                            <strong>Learned Model Parameters:</strong><br>
                            Intercept (\\(\\beta_0\\)) = \u221210.870<br>
                            Weights: \\(\\mathbf{w}\\) = [6.794, \u22120.174, 0.580, 5.291, 2.937]<br>
                            <strong>Input Feature Vector:</strong> [${docVector.join(', ')}]<br>
                            <strong>Output:</strong> <strong>${formatEngNum(lrScore, 1)}%</strong> AI probability.
                        </div>
                    </div>
                </div>
            </div>

            <div class="math-card">
                <div class="math-header">
                    <span class="math-badge">ALGO 6</span>
                    <h3>Character Trigram Frequency Analysis</h3>
                </div>
                <div class="math-body">
                    <p class="math-desc">
                        Character-level trigrams (3-character sequences) capture micro-level writing patterns like punctuation spacing, markdown syntax, and word suffixes. A 20-dimensional frequency profile is compared against known AI and Human reference centroids via cosine similarity.
                    </p>
                    ${ieee.trigram}
                    <div class="formula-block">
                        <div class="formula-title">Trigram Cosine Similarity Score</div>
                        <div class="math-value-box">
                            <div class="math-value pink">${formatEngNum(trigramResult.score, 1)}% AI-characteristic</div>
                            <div class="math-formula">\\[V_i = \\frac{\\text{count}(tg_i)}{\\text{totalTrigrams}} \\times 10{,}000\\]\\[\\text{Score} = \\text{clamp}\\left(\\frac{\\cos(V, AI_{ref}) - \\cos(V, H_{ref}) + 1}{2} \\times 100\\right)\\]</div>
                        </div>
                        <div class="comparison-grid">
                            <div class="comp-box">
                                <div class="comp-title cyan">Similarity to Human Profile</div>
                                <div class="comp-value">${(trigramResult.similarityToHuman * 100).toFixed(1)}%</div>
                                <div class="comp-sub">Cosine coefficient: ${trigramResult.similarityToHuman}</div>
                            </div>
                            <div class="comp-box">
                                <div class="comp-title pink">Similarity to AI Profile</div>
                                <div class="comp-value">${(trigramResult.similarityToAI * 100).toFixed(1)}%</div>
                                <div class="comp-sub">Cosine coefficient: ${trigramResult.similarityToAI}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="math-card">
                <div class="math-header">
                    <span class="math-badge">ALGO 7</span>
                    <h3>Part-of-Speech Syntax Ratio Classifier</h3>
                </div>
                <div class="math-body">
                    <p class="math-desc">
                        AI-generated text exhibits distinct patterns in functional word distributions. Frequency ratios for 5 POS categories (Determiners, Prepositions, Pronouns, Conjunctions, Auxiliary Verbs) are compared against AI and Human centroid vectors via cosine similarity.
                    </p>
                    ${ieee.pos}
                    <div class="formula-block">
                        <div class="formula-title">POS Ratio Cosine Similarity Score</div>
                        <div class="math-value-box">
                            <div class="math-value pink">${formatEngNum(posResult.score, 1)}% AI-characteristic</div>
                            <div class="math-formula">\\[\\cos(\\theta) = \\frac{\\mathbf{v} \\cdot \\mathbf{C}}{\\|\\mathbf{v}\\| \\|\\mathbf{C}\\|}\\]</div>
                        </div>
                        <div class="comparison-grid">
                            <div class="comp-box">
                                <div class="comp-title cyan">Similarity to Human Centroid</div>
                                <div class="comp-value">${(posResult.similarityToHuman * 100).toFixed(1)}%</div>
                                <div class="comp-sub">C_Hum = [0.108, 0.123, 0.068, 0.055, 0.072]</div>
                            </div>
                            <div class="comp-box">
                                <div class="comp-title pink">Similarity to AI Centroid</div>
                                <div class="comp-value">${(posResult.similarityToAI * 100).toFixed(1)}%</div>
                                <div class="comp-sub">C_AI = [0.117, 0.136, 0.057, 0.059, 0.080]</div>
                            </div>
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
                    ${ieee.ensemble}
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
