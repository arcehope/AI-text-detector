/**
 * Custom SVG Chart Renderer
 * 
 * Generates and animates responsive, glowing, interactive SVG charts:
 * 1. AI Probability Gauge
 * 2. KNN Feature Space Scatter Plot (highlighting 5 nearest neighbors)
 * 3. 5-Axis Stylometric Radar Chart (Input Vector vs AI/Human prototypes)
 */

class ChartRenderer {
    constructor() {
        this.svgGlowFilter = `
            <defs>
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#00f0ff" />
                    <stop offset="50%" stop-color="#bc34fa" />
                    <stop offset="100%" stop-color="#ff007f" />
                </linearGradient>
            </defs>
        `;
    }

    /**
     * Renders the circular AI gauge chart
     */
    renderGauge(containerId, score) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const size = 220;
        const strokeWidth = 14;
        const radius = (size / 2) - strokeWidth;
        const center = size / 2;
        const circumference = 2 * Math.PI * radius;
        
        // Gauge is a 3/4 circle (from 135 deg to 405 deg)
        // Arc angle is 270 degrees
        const arcLength = circumference * 0.75;
        const strokeDashOffset = arcLength - (score / 100) * arcLength;
        const rotationAngle = -225; // Align start point to bottom left

        // Determine color theme based on score
        let glowColor = '#888888'; // Human
        let statusText = 'HUMAN WRITTEN';
        if (score > 40 && score <= 65) {
            glowColor = '#333333'; // Mixed
            statusText = 'MIXED SIGNATURE';
        } else if (score > 65) {
            glowColor = '#000000'; // AI
            statusText = 'AI GENERATED';
        }

        container.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 ${size} ${size}" class="gauge-svg">
                ${this.svgGlowFilter}
                <!-- Background track -->
                <circle cx="${center}" cy="${center}" r="${radius}"
                    fill="transparent"
                    stroke="#e2e8f0"
                    stroke-width="${strokeWidth}"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${circumference - arcLength}"
                    transform="rotate(${rotationAngle} ${center} ${center})"
                    stroke-linecap="round" />
                
                <!-- Active glowing gauge arc -->
                <circle cx="${center}" cy="${center}" r="${radius}"
                    fill="transparent"
                    stroke="${glowColor}"
                    stroke-width="${strokeWidth}"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${strokeDashOffset + (circumference - arcLength)}"
                    transform="rotate(${rotationAngle} ${center} ${center})"
                    stroke-linecap="round"
                    
                    style="transition: stroke-dashoffset 1.5s cubic-bezier(0.2, 0.8, 0.2, 1);" />

                <!-- Text info in center -->
                <text x="${center}" y="${center - 15}" text-anchor="middle" fill="#000000" font-family="'Outfit', sans-serif" font-size="12" font-weight="600" letter-spacing="1">AI DETECTED</text>
                <text x="${center}" y="${center + 25}" text-anchor="middle" fill="#000000" font-family="'Outfit', sans-serif" font-size="44" font-weight="800">${score.toFixed(0)}%</text>
                
                <!-- Status pill text -->
                <text x="${center}" y="${center + 58}" text-anchor="middle" fill="${glowColor}" font-family="'Outfit', sans-serif" font-size="10" font-weight="700" letter-spacing="1.5" >${statusText}</text>
            </svg>
        `;
    }

    /**
     * Renders the 2D KNN Feature Space Scatter Plot
     */
    renderScatterPlot(containerId, knnResult, inputVector) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = 450;
        const height = 300;
        const padding = 45;

        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        // X Axis: Lexical Diversity (TTR factor) -> [0, 1] range (0 = Diverse/Human, 1 = Predictable/AI)
        // Y Axis: Sentence Length Variance (Burstiness factor) -> [0, 1] range (0 = Variable/Human, 1 = Uniform/AI)
        
        // Mapping functions
        const getX = (val) => padding + val * chartWidth;
        const getY = (val) => padding + (1 - val) * chartHeight; // Invert Y coordinate

        // Build list of all training items and extract coordinates
        const knn = new window.KNNClassifier();
        const trainingItems = knn.trainingSet;
        const neighborsSet = new Set(knnResult.neighbors.map(n => n.type));

        // SVG lines, axes, grid
        let svgContent = `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" class="scatter-svg">
                ${this.svgGlowFilter}
                
                <!-- Grid Lines -->
                <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#000000" stroke-width="1.5" />
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#000000" stroke-width="1.5" />
                
                <line x1="${padding + chartWidth/2}" y1="${padding}" x2="${padding + chartWidth/2}" y2="${height - padding}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />
                <line x1="${padding}" y1="${padding + chartHeight/2}" x2="${width - padding}" y2="${padding + chartHeight/2}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />

                <!-- Axes Labels -->
                <text x="${width/2}" y="${height - 10}" text-anchor="middle" fill="#000000" font-family="'Outfit', sans-serif" font-size="11" font-weight="600">Lexical Predictability → (Low TTR)</text>
                
                <text x="12" y="${height/2}" text-anchor="middle" fill="#000000" font-family="'Outfit', sans-serif" font-size="11" font-weight="600" transform="rotate(-90 12 ${height/2})">Uniformity of Sentence Length → (Low Burstiness)</text>

                <!-- Scale Labels -->
                <text x="${padding}" y="${height - padding + 15}" text-anchor="middle" fill="#4d5375" font-family="'Outfit', sans-serif" font-size="9">Diverse</text>
                <text x="${width - padding}" y="${height - padding + 15}" text-anchor="middle" fill="#4d5375" font-family="'Outfit', sans-serif" font-size="9">Uniform</text>
                <text x="${padding - 10}" y="${padding + 5}" text-anchor="end" fill="#4d5375" font-family="'Outfit', sans-serif" font-size="9">Uniform</text>
                <text x="${padding - 10}" y="${height - padding + 3}" text-anchor="end" fill="#4d5375" font-family="'Outfit', sans-serif" font-size="9">Variable</text>
        `;

        // Highlight nearest neighbor boundary links
        const inputX = getX(inputVector[0]);
        const inputY = getY(inputVector[1]);

        knnResult.neighbors.forEach(neighbor => {
            const nx = getX(neighbor.vector[0]);
            const ny = getY(neighbor.vector[1]);
            svgContent += `
                <!-- Connection line to nearest neighbor -->
                <line x1="${inputX}" y1="${inputY}" x2="${nx}" y2="${ny}" 
                    stroke="${neighbor.label === 1 ? '#ff007f' : '#00f0ff'}" 
                    stroke-width="1.5" stroke-dasharray="3,3" opacity="0.2" />
            `;
        });

        // Plot Training Points
        trainingItems.forEach(item => {
            const cx = getX(item.vector[0]);
            const cy = getY(item.vector[1]);
            const isNeighbor = neighborsSet.has(item.type);
            const color = item.label === 1 ? '#000000' : '#888888';
            const radius = isNeighbor ? 6 : 4;
            const opacity = isNeighbor ? 1.0 : 0.45;

            svgContent += `
                <circle cx="${cx}" cy="${cy}" r="${radius}" 
                    fill="${color}" 
                    opacity="${opacity}" 
                    stroke="${isNeighbor ? '#000000' : 'none'}" 
                    stroke-width="${isNeighbor ? 1.5 : 0}"
                    class="scatter-point"
                    data-type="${item.type}"
                    data-coords="(${item.vector[0]}, ${item.vector[1]})"
                    style="cursor: pointer;">
                    <title>${item.type} [Predictability: ${item.vector[0]}, Uniformity: ${item.vector[1]}]${isNeighbor ? ' (NEIGHBOR)' : ''}</title>
                </circle>
            `;
        });

        // Plot User Document Point (Blinking target crosshair)
        svgContent += `
            <!-- Pulse ring -->
            <circle cx="${inputX}" cy="${inputY}" r="12" fill="transparent" stroke="#000000" stroke-width="1.5" opacity="0.8" >
                <animate attributeName="r" values="6;16;6" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite" />
            </circle>
            
            <!-- Core target node -->
            <polygon points="${inputX},${inputY-8} ${inputX+2},${inputY-2} ${inputX+8},${inputY} ${inputX+2},${inputY+2} ${inputX},${inputY+8} ${inputX-2},${inputY+2} ${inputX-8},${inputY} ${inputX-2},${inputY-2}"
                fill="#000000" stroke="#bc34fa" stroke-width="2"  class="user-document-point">
                <title>Your Document [X: ${inputVector[0].toFixed(2)}, Y: ${inputVector[1].toFixed(2)}]</title>
            </polygon>
        `;

        // Render Legend inside SVG
        svgContent += `
            <!-- Legend -->
            <g transform="translate(${width - 120}, ${padding - 20})">
                <rect width="110" height="65" fill="#08090f" stroke="#e2e8f0" stroke-width="1" rx="4" opacity="0.9" />
                
                <circle cx="12" cy="15" r="4" fill="#888888" />
                <text x="24" y="19" fill="#000000" font-family="'Outfit', sans-serif" font-size="9" font-weight="600">Human Profile</text>
                
                <circle cx="12" cy="32" r="4" fill="#000000" />
                <text x="24" y="36" fill="#000000" font-family="'Outfit', sans-serif" font-size="9" font-weight="600">AI Profile</text>
                
                <polygon points="12,45 15,48 18,45 15,52" fill="#000000" stroke="#bc34fa" stroke-width="1" />
                <text x="24" y="53" fill="#000000" font-family="'Outfit', sans-serif" font-size="9" font-weight="700">User Document</text>
            </g>
            </svg>
        `;

        container.innerHTML = svgContent;
    }

    /**
     * Renders the 5-Axis Stylometric Radar Chart
     */
    renderRadarChart(containerId, docVector) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const size = 320;
        const center = size / 2;
        const radius = size * 0.38;
        const axesCount = 5;
        const labels = ['First Person', 'Transitions', 'Intensifiers', 'Passive Voice', 'Hapax Ratio'];
        
        // Radar coordinate converter
        const getCoordinates = (axisIndex, value) => {
            const angle = (2 * Math.PI / axesCount) * axisIndex - (Math.PI / 2); // Shift by 90deg to start at top
            const x = center + radius * value * Math.cos(angle);
            const y = center + radius * value * Math.sin(angle);
            return { x, y };
        };

        // Reference prototype profiles
        const analyzer = new window.CosineSimilarityAnalyzer();
        const aiProto = analyzer.prototypeAI;
        const humanProto = analyzer.prototypeHuman;

        // Base web lines
        let svgContent = `
            <svg width="100%" height="100%" viewBox="0 0 ${size} ${size}" class="radar-svg">
                ${this.svgGlowFilter}
        `;

        // Render Concentric Pentagon levels (25%, 50%, 75%, 100%)
        const levels = [0.25, 0.5, 0.75, 1.0];
        levels.forEach(level => {
            let points = [];
            for (let i = 0; i < axesCount; i++) {
                const { x, y } = getCoordinates(i, level);
                points.push(`${x},${y}`);
            }
            svgContent += `
                <polygon points="${points.join(' ')}" fill="transparent" stroke="#e2e8f0" stroke-width="1" />
                <!-- Level labels -->
                <text x="${center}" y="${center - radius * level + 10}" fill="#888888" font-family="'JetBrains Mono', monospace" font-size="7" text-anchor="middle">${(level * 100)}%</text>
            `;
        });

        // Draw Spoke Lines and Labels at vertices
        for (let i = 0; i < axesCount; i++) {
            const edge = getCoordinates(i, 1.0);
            svgContent += `
                <line x1="${center}" y1="${center}" x2="${edge.x}" y2="${edge.y}" stroke="#000000" stroke-width="1.5" />
            `;
            
            // Label offset calculation
            const angle = (2 * Math.PI / axesCount) * i - (Math.PI / 2);
            const textOffsetMultiplier = 1.15;
            const labelX = center + radius * textOffsetMultiplier * Math.cos(angle);
            const labelY = center + radius * textOffsetMultiplier * Math.sin(angle) + 4; // Add slight vertical alignment offset
            
            let anchor = 'middle';
            if (Math.cos(angle) > 0.2) anchor = 'start';
            if (Math.cos(angle) < -0.2) anchor = 'end';

            svgContent += `
                <text x="${labelX}" y="${labelY}" fill="#000000" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="700" text-anchor="${anchor}">${labels[i]}</text>
            `;
        }

        // Generate polygon path coordinates for Human Prototype
        const humanPoints = [];
        for (let i = 0; i < axesCount; i++) {
            const { x, y } = getCoordinates(i, humanProto[i]);
            humanPoints.push(`${x},${y}`);
        }
        svgContent += `
            <!-- Human prototype shape -->
            <polygon points="${humanPoints.join(' ')}" fill="#888888" fill-opacity="0.1" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.75" />
        `;

        // Generate polygon path coordinates for AI Prototype
        const aiPoints = [];
        for (let i = 0; i < axesCount; i++) {
            const { x, y } = getCoordinates(i, aiProto[i]);
            aiPoints.push(`${x},${y}`);
        }
        svgContent += `
            <!-- AI prototype shape -->
            <polygon points="${aiPoints.join(' ')}" fill="#000000" fill-opacity="0.1" stroke="#ff007f" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.75" />
        `;

        // Generate polygon path coordinates for User Input Vector
        const docPoints = [];
        for (let i = 0; i < axesCount; i++) {
            const { x, y } = getCoordinates(i, docVector[i]);
            docPoints.push(`${x},${y}`);
        }
        svgContent += `
            <!-- User document shape -->
            <polygon points="${docPoints.join(' ')}" fill="#000000" fill-opacity="0.15" stroke="#000000" stroke-width="2.5"  style="transition: all 1.5s ease-in-out;" />
        `;

        // Draw points on User shape for interactive tooltip
        for (let i = 0; i < axesCount; i++) {
            const { x, y } = getCoordinates(i, docVector[i]);
            svgContent += `
                <circle cx="${x}" cy="${y}" r="4.5" fill="#000000" stroke="#bc34fa" stroke-width="1.5"  style="transition: all 1.5s ease-in-out;">
                    <title>${labels[i]}: ${(docVector[i] * 100).toFixed(0)}% Match</title>
                </circle>
            `;
        }

        svgContent += `</svg>`;
        container.innerHTML = svgContent;
    }
}

// Export for browser global context
window.ChartRenderer = ChartRenderer;
