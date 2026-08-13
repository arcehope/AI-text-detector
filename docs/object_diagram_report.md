# Sentinel AI Text Detector Object Diagram

This document describes the runtime objects, collaborations, and architectural layers of the **Sentinel AI Text Detector** project.

### Classic UML Style (Light Mode)
<img src="./object_diagram_classic.svg" alt="Sentinel AI Text Detector Object Diagram (Classic Style)" width="100%" />

### Premium Dark Mode Style
<img src="./object_diagram.svg" alt="Sentinel AI Text Detector Object Diagram (Dark Mode)" width="100%" />

> [!TIP]
> **Editable Draw.io Version Available**: You can view, customize, and edit this diagram directly in [draw.io](https://app.diagrams.net) or the Draw.io Desktop application by opening [object_diagram.drawio](./object_diagram.drawio).

---

## Architectural Breakdown

The project is structured into three primary layers, coordinated dynamically at runtime:

### 1. Presentation & Controller Layer
*   **[`app`](../js/app.js) (`Controller`)**: Instantiated on DOM load. It manages UI state, binds event handlers (inputs, buttons, tabs, drag-and-drop), and orchestrates the feature-extraction and classification flow.
*   **[`fileParser`](../js/utils/fileParser.js) ([`FileParser`](../js/utils/fileParser.js))**: Extracts raw text dynamically from uploaded file buffers (supporting docx, pdf, txt formats).
*   **[`chartEngine`](../js/utils/chartRenderer.js) ([`ChartRenderer`](../js/utils/chartRenderer.js))**: Dynamically renders real-time visualization widgets (gauge metrics, historical line/bar trends) directly into the DOM using inline SVG shapes.

### 2. Feature Extraction & Machine Learning Ensemble Layer
Upon receiving text, `app` triggers parallel pipelines across seven evaluation engines:
*   **[`perplexityEngine`](../js/algo/perplexity.js) ([`PerplexityAnalyzer`](../js/algo/perplexity.js))**: Evaluates text complexity, lexical diversity (Type-Token Ratio / TTR), and structural burstiness.
*   **[`knnClassifier`](../js/algo/knn.js) ([`KNNClassifier`](../js/algo/knn.js))**: Receives complexity vectors from the perplexity engine and projects them to determine class similarity against pre-mapped clusters.
*   **[`lrClassifier`](../js/algo/logistic_regression.js) ([`LogisticRegressionClassifier`](../js/algo/logistic_regression.js))**: Weighs inputs linearly, applying a sigmoid function to return logistic probabilities.
*   **[`trigramEngine`](../js/algo/trigram.js) ([`TrigramAnalyzer`](../js/algo/trigram.js))**: Matches character-level n-gram distributions against typical human and machine templates.
*   **[`posEngine`](../js/algo/pos.js) ([`PosClassifier`](../js/algo/pos.js))**: Examines syntactic layout distributions (verbs, nouns, adjectives).
*   **[`similarityEngine`](../js/algo/similarity.js) ([`CosineSimilarityAnalyzer`](../js/algo/similarity.js))**: Analyzes the cosine angle overlap.
*   **[`grammarEngine`](../js/algo/grammar.js) ([`GrammarStyleAnalyzer`](../js/algo/grammar.js))**: Scores structural typos/exceptions. A perfect score adds a +15% boost to the probability, while errors apply linear discount calibration.

### 3. Data & Sync Layer
*   **[`db`](../js/utils/db.js) ([`SentinelDB`](../js/utils/db.js))**: A dual-persistence system. By default, it writes to the browser's IndexedDB. If an active backend server connection is detected via `/api/health`, it seamlessly synchronizes records to the remote SQLite database.
*   **[`backend`](../server.py) (`SentinelServer` / `BaseHTTPRequestHandler`)**: Runs on Python at port 5000, managing persistent SQLite storage under `sentinel.db` and validating credentials.
