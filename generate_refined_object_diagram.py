import os

# REFINED OBJECT DIAGRAM (BLACK & WHITE DRAW.IO XML)
DRAWIO_REFINED_OBJECT_BW_XML = '''<mxfile host="app.diagrams.net" modified="2026-08-17T22:16:00.000Z" agent="Antigravity" version="21.6.8" type="device">
  <diagram id="sentinel-refined-object-bw" name="Figure 3.8 Refinement of Object Diagram (B&amp;W)">
    <mxGraphModel dx="1200" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title Header -->
        <mxCell id="ref_title" value="&lt;b style=&quot;font-family: Georgia, 'Times New Roman', serif; font-size: 19px; color: #000000;&quot;&gt;Figure 3.8: Refinement of Object Diagram for Sentinel AI Text Detector&lt;/b&gt;" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="350" y="20" width="500" height="35" as="geometry" />
        </mxCell>

        <!-- OBJECT 1: currentUser : User -->
        <mxCell id="obj_user" value="&lt;u style=&quot;font-size:15px; font-weight:bold;&quot;&gt;currentUser : User&lt;/u&gt;&lt;hr style=&quot;border:1px solid #000;&quot;&gt;&lt;div style=&quot;text-align:left; font-family:Courier New; font-size:12.5px; padding-left:5px;&quot;&gt;username = &quot;john_doe&quot;&lt;br&gt;email = &quot;john@example.com&quot;&lt;br&gt;authStatus = &quot;Authenticated&quot;&lt;br&gt;dailyQuota = &quot;Unlimited&quot;&lt;/div&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=2;fontColor=#000000;verticalAlign=top;spacingTop=6;" vertex="1" parent="1">
          <mxGeometry x="50" y="80" width="280" height="135" as="geometry" />
        </mxCell>

        <!-- OBJECT 2: currentTask : DetectionTask -->
        <mxCell id="obj_task" value="&lt;u style=&quot;font-size:15px; font-weight:bold;&quot;&gt;currentTask : DetectionTask&lt;/u&gt;&lt;hr style=&quot;border:1px solid #000;&quot;&gt;&lt;div style=&quot;text-align:left; font-family:Courier New; font-size:12.5px; padding-left:5px;&quot;&gt;id = &quot;REC-98214&quot;&lt;br&gt;document = &quot;sample_essay.docx&quot;&lt;br&gt;wordCount = 450 words&lt;br&gt;sentenceCount = 22&lt;br&gt;aiScore = 91.5%&lt;br&gt;verdict = &quot;AI-Generated Text&quot;&lt;/div&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=2;fontColor=#000000;verticalAlign=top;spacingTop=6;" vertex="1" parent="1">
          <mxGeometry x="440" y="80" width="320" height="160" as="geometry" />
        </mxCell>

        <!-- OBJECT 3: dbSync : SentinelDB -->
        <mxCell id="obj_db" value="&lt;u style=&quot;font-size:15px; font-weight:bold;&quot;&gt;dbSync : SentinelDB&lt;/u&gt;&lt;hr style=&quot;border:1px solid #000;&quot;&gt;&lt;div style=&quot;text-align:left; font-family:Courier New; font-size:12.5px; padding-left:5px;&quot;&gt;dbFile = &quot;sentinel.db&quot;&lt;br&gt;table = &quot;analysis_history&quot;&lt;br&gt;metricsJson = &quot;{lr:92,knn:90,...}&quot;&lt;br&gt;persistence = &quot;SQLite Persistent&quot;&lt;/div&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=2;fontColor=#000000;verticalAlign=top;spacingTop=6;" vertex="1" parent="1">
          <mxGeometry x="870" y="80" width="280" height="135" as="geometry" />
        </mxCell>

        <!-- OBJECT 4: detectorEngine : DetectorEngine (Center Orchestrator) -->
        <mxCell id="obj_engine" value="&lt;u style=&quot;font-size:15px; font-weight:bold;&quot;&gt;detectorEngine : DetectorEngine&lt;/u&gt;&lt;hr style=&quot;border:1px solid #000;&quot;&gt;&lt;div style=&quot;text-align:left; font-family:Courier New; font-size:12.5px; padding-left:5px;&quot;&gt;minWordCount = 10&lt;br&gt;ensembleWeights = &quot;LR:25%, Tri:25%, KNN:20%, POS:15%, Cos:10%, Ppl:5%&quot;&lt;br&gt;grammarCalibration = &quot;+15% Perfect Boost Applied&quot;&lt;br&gt;calculatedFinalScore = 91.5%&lt;/div&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=2;fontColor=#000000;verticalAlign=top;spacingTop=6;" vertex="1" parent="1">
          <mxGeometry x="360" y="290" width="480" height="145" as="geometry" />
        </mxCell>

        <!-- THE 7 ENSEMBLE EVALUATION ENGINE INSTANCES (Middle & Lower Grid) -->

        <!-- 1. pplEngine : PerplexityAnalyzer -->
        <mxCell id="obj_ppl" value="&lt;u style=&quot;font-size:13.5px; font-weight:bold;&quot;&gt;pplEngine : PerplexityAnalyzer&lt;/u&gt;&lt;hr style=&quot;border:1px solid #000;&quot;&gt;&lt;div style=&quot;text-align:left; font-family:Courier New; font-size:11.5px;&quot;&gt;perplexity = 24.8&lt;br&gt;burstiness = 0.18&lt;br&gt;ttr = 0.42&lt;br&gt;score = 88%&lt;/div&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;verticalAlign=top;spacingTop=4;" vertex="1" parent="1">
          <mxGeometry x="40" y="490" width="240" height="120" as="geometry" />
        </mxCell>

        <!-- 2. knnEngine : KNNClassifier -->
        <mxCell id="obj_knn" value="&lt;u style=&quot;font-size:13.5px; font-weight:bold;&quot;&gt;knnEngine : KNNClassifier&lt;/u&gt;&lt;hr style=&quot;border:1px solid #000;&quot;&gt;&lt;div style=&quot;text-align:left; font-family:Courier New; font-size:11.5px;&quot;&gt;k = 5&lt;br&gt;neighborVotes = &quot;4 AI, 1 Human&quot;&lt;br&gt;euclideanDistance = 0.142&lt;br&gt;score = 90%&lt;/div&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;verticalAlign=top;spacingTop=4;" vertex="1" parent="1">
          <mxGeometry x="310" y="490" width="260" height="120" as="geometry" />
        </mxCell>

        <!-- 3. lrEngine : LogisticRegressionClassifier -->
        <mxCell id="obj_lr" value="&lt;u style=&quot;font-size:13.5px; font-weight:bold;&quot;&gt;lrEngine : LogisticRegression&lt;/u&gt;&lt;hr style=&quot;border:1px solid #000;&quot;&gt;&lt;div style=&quot;text-align:left; font-family:Courier New; font-size:11.5px;&quot;&gt;features = 6&lt;br&gt;sigmoidOutput = 0.92&lt;br&gt;score = 92%&lt;/div&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;verticalAlign=top;spacingTop=4;" vertex="1" parent="1">
          <mxGeometry x="600" y="490" width="260" height="120" as="geometry" />
        </mxCell>

        <!-- 4. trigramEngine : TrigramAnalyzer -->
        <mxCell id="obj_tri" value="&lt;u style=&quot;font-size:13.5px; font-weight:bold;&quot;&gt;trigramEngine : TrigramAnalyzer&lt;/u&gt;&lt;hr style=&quot;border:1px solid #000;&quot;&gt;&lt;div style=&quot;text-align:left; font-family:Courier New; font-size:11.5px;&quot;&gt;ngramMatch = 0.84&lt;br&gt;score = 94%&lt;/div&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;verticalAlign=top;spacingTop=4;" vertex="1" parent="1">
          <mxGeometry x="890" y="490" width="260" height="120" as="geometry" />
        </mxCell>

        <!-- 5. posEngine : PosClassifier -->
        <mxCell id="obj_pos" value="&lt;u style=&quot;font-size:13.5px; font-weight:bold;&quot;&gt;posEngine : PosClassifier&lt;/u&gt;&lt;hr style=&quot;border:1px solid #000;&quot;&gt;&lt;div style=&quot;text-align:left; font-family:Courier New; font-size:11.5px;&quot;&gt;nounRatio = 0.38&lt;br&gt;verbRatio = 0.12&lt;br&gt;score = 88%&lt;/div&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;verticalAlign=top;spacingTop=4;" vertex="1" parent="1">
          <mxGeometry x="170" y="660" width="250" height="115" as="geometry" />
        </mxCell>

        <!-- 6. simEngine : CosineSimilarityAnalyzer -->
        <mxCell id="obj_sim" value="&lt;u style=&quot;font-size:13.5px; font-weight:bold;&quot;&gt;simEngine : CosineSimilarity&lt;/u&gt;&lt;hr style=&quot;border:1px solid #000;&quot;&gt;&lt;div style=&quot;text-align:left; font-family:Courier New; font-size:11.5px;&quot;&gt;cosineDistance = 0.152&lt;br&gt;prototypeMatch = &quot;AI Pattern&quot;&lt;br&gt;score = 85%&lt;/div&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;verticalAlign=top;spacingTop=4;" vertex="1" parent="1">
          <mxGeometry x="460" y="660" width="260" height="115" as="geometry" />
        </mxCell>

        <!-- 7. grammarEngine : GrammarStyleAnalyzer -->
        <mxCell id="obj_gram" value="&lt;u style=&quot;font-size:13.5px; font-weight:bold;&quot;&gt;grammarEngine : GrammarStyle&lt;/u&gt;&lt;hr style=&quot;border:1px solid #000;&quot;&gt;&lt;div style=&quot;text-align:left; font-family:Courier New; font-size:11.5px;&quot;&gt;perfectionScore = 100%&lt;br&gt;grammarFactor = 1.0&lt;br&gt;perfectBoost = +15.0%&lt;/div&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;verticalAlign=top;spacingTop=4;" vertex="1" parent="1">
          <mxGeometry x="760" y="660" width="260" height="115" as="geometry" />
        </mxCell>

        <!-- OBJECT 5: visualizer : ChartRenderer -->
        <mxCell id="obj_vis" value="&lt;u style=&quot;font-size:15px; font-weight:bold;&quot;&gt;visualizer : ChartRenderer&lt;/u&gt;&lt;hr style=&quot;border:1px solid #000;&quot;&gt;&lt;div style=&quot;text-align:left; font-family:Courier New; font-size:12.5px; padding-left:5px;&quot;&gt;gaugeScore = 91.5%&lt;br&gt;verdictBanner = &quot;Most probably written by AI&quot;&lt;br&gt;scatterPlot = &quot;KNN 5-Neighbors Projected&quot;&lt;br&gt;sentenceHeatmap = &quot;Rendered Highlights&quot;&lt;/div&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=2;fontColor=#000000;verticalAlign=top;spacingTop=6;" vertex="1" parent="1">
          <mxGeometry x="380" y="830" width="440" height="135" as="geometry" />
        </mxCell>

        <!-- LINKS AND ASSOCIATIONS -->
        <!-- User -> DetectionTask -->
        <mxCell id="link1" value="1 initiates 1..*" style="endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=12;fontStyle=1;" edge="1" parent="1" source="obj_user" target="obj_task">
          <mxGeometry width="50" height="50" relative="1" as="geometry" />
        </mxCell>

        <!-- DetectionTask -> SentinelDB -->
        <mxCell id="link2" value="1 persists to 1" style="endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=12;fontStyle=1;" edge="1" parent="1" source="obj_task" target="obj_db">
          <mxGeometry width="50" height="50" relative="1" as="geometry" />
        </mxCell>

        <!-- DetectionTask -> DetectorEngine -->
        <mxCell id="link3" value="1 triggers 1" style="endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=12;fontStyle=1;" edge="1" parent="1" source="obj_task" target="obj_engine">
          <mxGeometry width="50" height="50" relative="1" as="geometry" />
        </mxCell>

        <!-- DetectorEngine -> Sub Engines -->
        <mxCell id="l_ppl" value="" style="endArrow=none;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.5;" edge="1" parent="1" source="obj_engine" target="obj_ppl">
          <mxGeometry width="50" height="50" relative="1" as="geometry" />
        </mxCell>
        <mxCell id="l_knn" value="" style="endArrow=none;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.5;" edge="1" parent="1" source="obj_engine" target="obj_knn">
          <mxGeometry width="50" height="50" relative="1" as="geometry" />
        </mxCell>
        <mxCell id="l_lr" value="" style="endArrow=none;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.5;" edge="1" parent="1" source="obj_engine" target="obj_lr">
          <mxGeometry width="50" height="50" relative="1" as="geometry" />
        </mxCell>
        <mxCell id="l_tri" value="" style="endArrow=none;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.5;" edge="1" parent="1" source="obj_engine" target="obj_tri">
          <mxGeometry width="50" height="50" relative="1" as="geometry" />
        </mxCell>
        <mxCell id="l_pos" value="" style="endArrow=none;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.5;" edge="1" parent="1" source="obj_engine" target="obj_pos">
          <mxGeometry width="50" height="50" relative="1" as="geometry" />
        </mxCell>
        <mxCell id="l_sim" value="" style="endArrow=none;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.5;" edge="1" parent="1" source="obj_engine" target="obj_sim">
          <mxGeometry width="50" height="50" relative="1" as="geometry" />
        </mxCell>
        <mxCell id="l_gram" value="" style="endArrow=none;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.5;" edge="1" parent="1" source="obj_engine" target="obj_gram">
          <mxGeometry width="50" height="50" relative="1" as="geometry" />
        </mxCell>

        <!-- DetectorEngine -> Visualizer -->
        <mxCell id="link_vis" value="1 passes scores to 1" style="endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=12;fontStyle=1;" edge="1" parent="1" source="obj_engine" target="obj_vis">
          <mxGeometry width="50" height="50" relative="1" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>'''

# STANDALONE SVG REFINED OBJECT DIAGRAM (BLACK & WHITE)
SVG_REFINED_OBJECT_BW_CONTENT = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1020" width="100%" height="100%" style="background-color: #ffffff;">
  <style>
    .title { font-family: 'Times New Roman', Georgia, serif; font-size: 19px; font-weight: bold; fill: #000000; text-anchor: middle; }
    .obj-header { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14.5px; font-weight: bold; fill: #000000; text-anchor: middle; text-decoration: underline; }
    .obj-subhead { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13.5px; font-weight: bold; fill: #000000; text-anchor: middle; text-decoration: underline; }
    .slot-text { font-family: 'Consolas', 'Courier New', monospace; font-size: 12.5px; fill: #000000; }
    .slot-subtext { font-family: 'Consolas', 'Courier New', monospace; font-size: 11.5px; fill: #000000; }
    .obj-box { fill: #ffffff; stroke: #000000; stroke-width: 2; rx: 6px; }
    .sub-obj-box { fill: #ffffff; stroke: #000000; stroke-width: 1.5; rx: 5px; }
    .line-divider { stroke: #000000; stroke-width: 1.2; }
    .link-line { stroke: #000000; stroke-width: 1.8; fill: none; }
    .link-dash { stroke: #000000; stroke-width: 1.5; stroke-dasharray: 4,4; fill: none; }
    .link-label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #000000; text-anchor: middle; }
  </style>

  <!-- Title -->
  <text x="600" y="38" class="title">Figure 3.8: Refinement of Object Diagram for Sentinel AI Text Detector</text>

  <!-- OBJECT 1: currentUser : User -->
  <g transform="translate(50, 75)">
    <rect class="obj-box" x="0" y="0" width="280" height="135" />
    <text x="140" y="24" class="obj-header">currentUser : User</text>
    <line x1="0" y1="34" x2="280" y2="34" class="line-divider" />
    <text x="12" y="54" class="slot-text">username = "john_doe"</text>
    <text x="12" y="74" class="slot-text">email = "john@example.com"</text>
    <text x="12" y="94" class="slot-text">authStatus = "Authenticated"</text>
    <text x="12" y="114" class="slot-text">dailyQuota = "Unlimited"</text>
  </g>

  <!-- OBJECT 2: currentTask : DetectionTask -->
  <g transform="translate(440, 75)">
    <rect class="obj-box" x="0" y="0" width="320" height="160" />
    <text x="160" y="24" class="obj-header">currentTask : DetectionTask</text>
    <line x1="0" y1="34" x2="320" y2="34" class="line-divider" />
    <text x="12" y="54" class="slot-text">id = "REC-98214"</text>
    <text x="12" y="74" class="slot-text">document = "sample_essay.docx"</text>
    <text x="12" y="94" class="slot-text">wordCount = 450 words</text>
    <text x="12" y="114" class="slot-text">sentenceCount = 22</text>
    <text x="12" y="134" class="slot-text">aiScore = 91.5%</text>
    <text x="12" y="150" class="slot-text">verdict = "AI-Generated Text"</text>
  </g>

  <!-- OBJECT 3: dbSync : SentinelDB -->
  <g transform="translate(870, 75)">
    <rect class="obj-box" x="0" y="0" width="280" height="135" />
    <text x="140" y="24" class="obj-header">dbSync : SentinelDB</text>
    <line x1="0" y1="34" x2="280" y2="34" class="line-divider" />
    <text x="12" y="54" class="slot-text">dbFile = "sentinel.db"</text>
    <text x="12" y="74" class="slot-text">table = "analysis_history"</text>
    <text x="12" y="94" class="slot-text">metricsJson = "{lr:92,knn:90,...}"</text>
    <text x="12" y="114" class="slot-text">persistence = "SQLite Persistent"</text>
  </g>

  <!-- OBJECT 4: detectorEngine : DetectorEngine -->
  <g transform="translate(360, 285)">
    <rect class="obj-box" x="0" y="0" width="480" height="145" />
    <text x="240" y="24" class="obj-header">detectorEngine : DetectorEngine</text>
    <line x1="0" y1="34" x2="480" y2="34" class="line-divider" />
    <text x="12" y="54" class="slot-text">minWordCount = 10</text>
    <text x="12" y="74" class="slot-text">ensembleWeights = "LR:25%, Tri:25%, KNN:20%, POS:15%, Cos:10%, Ppl:5%"</text>
    <text x="12" y="94" class="slot-text">grammarCalibration = "+15% Perfect Boost Applied"</text>
    <text x="12" y="114" class="slot-text">calculatedFinalScore = 91.5%</text>
  </g>

  <!-- THE 7 ENSEMBLE EVALUATION ENGINES -->
  <!-- 1. pplEngine -->
  <g transform="translate(40, 485)">
    <rect class="sub-obj-box" x="0" y="0" width="240" height="120" />
    <text x="120" y="22" class="obj-subhead">pplEngine : PerplexityAnalyzer</text>
    <line x1="0" y1="30" x2="240" y2="30" class="line-divider" />
    <text x="10" y="48" class="slot-subtext">perplexity = 24.8</text>
    <text x="10" y="66" class="slot-subtext">burstiness = 0.18</text>
    <text x="10" y="84" class="slot-subtext">ttr = 0.42</text>
    <text x="10" y="102" class="slot-subtext">score = 88%</text>
  </g>

  <!-- 2. knnEngine -->
  <g transform="translate(310, 485)">
    <rect class="sub-obj-box" x="0" y="0" width="260" height="120" />
    <text x="130" y="22" class="obj-subhead">knnEngine : KNNClassifier</text>
    <line x1="0" y1="30" x2="260" y2="30" class="line-divider" />
    <text x="10" y="48" class="slot-subtext">k = 5</text>
    <text x="10" y="66" class="slot-subtext">neighborVotes = "4 AI, 1 Human"</text>
    <text x="10" y="84" class="slot-subtext">euclideanDistance = 0.142</text>
    <text x="10" y="102" class="slot-subtext">score = 90%</text>
  </g>

  <!-- 3. lrEngine -->
  <g transform="translate(600, 485)">
    <rect class="sub-obj-box" x="0" y="0" width="260" height="120" />
    <text x="130" y="22" class="obj-subhead">lrEngine : LogisticRegression</text>
    <line x1="0" y1="30" x2="260" y2="30" class="line-divider" />
    <text x="10" y="48" class="slot-subtext">features = 6</text>
    <text x="10" y="66" class="slot-subtext">sigmoidOutput = 0.92</text>
    <text x="10" y="84" class="slot-subtext">score = 92%</text>
  </g>

  <!-- 4. trigramEngine -->
  <g transform="translate(890, 485)">
    <rect class="sub-obj-box" x="0" y="0" width="260" height="120" />
    <text x="130" y="22" class="obj-subhead">trigramEngine : TrigramAnalyzer</text>
    <line x1="0" y1="30" x2="260" y2="30" class="line-divider" />
    <text x="10" y="48" class="slot-subtext">ngramMatch = 0.84</text>
    <text x="10" y="66" class="slot-subtext">score = 94%</text>
  </g>

  <!-- 5. posEngine -->
  <g transform="translate(170, 655)">
    <rect class="sub-obj-box" x="0" y="0" width="250" height="115" />
    <text x="125" y="22" class="obj-subhead">posEngine : PosClassifier</text>
    <line x1="0" y1="30" x2="250" y2="30" class="line-divider" />
    <text x="10" y="48" class="slot-subtext">nounRatio = 0.38</text>
    <text x="10" y="66" class="slot-subtext">verbRatio = 0.12</text>
    <text x="10" y="84" class="slot-subtext">score = 88%</text>
  </g>

  <!-- 6. simEngine -->
  <g transform="translate(460, 655)">
    <rect class="sub-obj-box" x="0" y="0" width="260" height="115" />
    <text x="130" y="22" class="obj-subhead">simEngine : CosineSimilarity</text>
    <line x1="0" y1="30" x2="260" y2="30" class="line-divider" />
    <text x="10" y="48" class="slot-subtext">cosineDistance = 0.152</text>
    <text x="10" y="66" class="slot-subtext">prototypeMatch = "AI Pattern"</text>
    <text x="10" y="84" class="slot-subtext">score = 85%</text>
  </g>

  <!-- 7. grammarEngine -->
  <g transform="translate(760, 655)">
    <rect class="sub-obj-box" x="0" y="0" width="260" height="115" />
    <text x="130" y="22" class="obj-subhead">grammarEngine : GrammarStyle</text>
    <line x1="0" y1="30" x2="260" y2="30" class="line-divider" />
    <text x="10" y="48" class="slot-subtext">perfectionScore = 100%</text>
    <text x="10" y="66" class="slot-subtext">grammarFactor = 1.0</text>
    <text x="10" y="84" class="slot-subtext">perfectBoost = +15.0%</text>
  </g>

  <!-- OBJECT 5: visualizer : ChartRenderer -->
  <g transform="translate(380, 825)">
    <rect class="obj-box" x="0" y="0" width="440" height="135" />
    <text x="220" y="24" class="obj-header">visualizer : ChartRenderer</text>
    <line x1="0" y1="34" x2="440" y2="34" class="line-divider" />
    <text x="12" y="54" class="slot-text">gaugeScore = 91.5%</text>
    <text x="12" y="74" class="slot-text">verdictBanner = "Most probably written by AI"</text>
    <text x="12" y="94" class="slot-text">scatterPlot = "KNN 5-Neighbors Projected"</text>
    <text x="12" y="114" class="slot-text">sentenceHeatmap = "Rendered Highlights"</text>
  </g>

  <!-- CONNECTIONS -->
  <!-- User to Task -->
  <line x1="330" y1="145" x2="440" y2="145" class="link-line" />
  <text x="385" y="137" class="link-label">1 initiates 1..*</text>

  <!-- Task to DB -->
  <line x1="760" y1="145" x2="870" y2="145" class="link-line" />
  <text x="815" y="137" class="link-label">persists to</text>

  <!-- Task to DetectorEngine -->
  <line x1="600" y1="235" x2="600" y2="285" class="link-line" />
  <text x="635" y="260" class="link-label">triggers</text>

  <!-- DetectorEngine to sub engines (Dashed lines) -->
  <path d="M 600 430 L 600 460 L 160 460 L 160 485" class="link-dash" />
  <path d="M 600 430 L 600 460 L 440 460 L 440 485" class="link-dash" />
  <path d="M 600 430 L 600 485" class="link-dash" />
  <path d="M 600 430 L 600 460 L 1020 460 L 1020 485" class="link-dash" />
  <path d="M 600 430 L 600 630 L 295 630 L 295 655" class="link-dash" />
  <path d="M 600 430 L 600 630 L 590 630 L 590 655" class="link-dash" />
  <path d="M 600 430 L 600 630 L 890 630 L 890 655" class="link-dash" />

  <!-- DetectorEngine to Visualizer -->
  <line x1="600" y1="430" x2="600" y2="825" class="link-line" />
  <text x="660" y="805" class="link-label">passes scores to</text>

</svg>'''

def main():
    target_dirs = [
        'docs',
        'images',
        r'C:\Users\pc\.gemini\antigravity\brain\9f62aa6b-6e42-408b-844e-1f6f09259710'
    ]

    for d in target_dirs:
        os.makedirs(d, exist_ok=True)
        # Write .drawio
        with open(os.path.join(d, 'refined_object_diagram.drawio'), 'w', encoding='utf-8') as f:
            f.write(DRAWIO_REFINED_OBJECT_BW_XML)
        with open(os.path.join(d, 'figure_3_8_refinement_diagram.drawio'), 'w', encoding='utf-8') as f:
            f.write(DRAWIO_REFINED_OBJECT_BW_XML)

        # Write .svg
        with open(os.path.join(d, 'refined_object_diagram.svg'), 'w', encoding='utf-8') as f:
            f.write(SVG_REFINED_OBJECT_BW_CONTENT)
        with open(os.path.join(d, 'figure_3_8_refinement_diagram.svg'), 'w', encoding='utf-8') as f:
            f.write(SVG_REFINED_OBJECT_BW_CONTENT)

        print(f"Generated Refined Object Diagram in {d}")

if __name__ == '__main__':
    main()
