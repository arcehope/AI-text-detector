import os
import xml.etree.ElementTree as ET

# 1. GENERATE DRAW.IO XML CONTENT
DRAWIO_XML = '''<mxfile host="app.diagrams.net" modified="2026-08-17T20:48:00.000Z" agent="Antigravity" version="21.6.8" type="device">
  <diagram id="sequence-diagram-fig36" name="Figure 3.6 Sequence Diagram">
    <mxGraphModel dx="1000" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="960" pageHeight="880" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Figure Title -->
        <mxCell id="title" value="&lt;b style=&quot;font-family: Georgia, 'Times New Roman', serif; font-size: 18px; color: #111111;&quot;&gt;Figure 3.6: Sequence Diagram for AI Text Detector&lt;/b&gt;" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="230" y="20" width="500" height="35" as="geometry" />
        </mxCell>

        <!-- PARTICIPANT HEADERS -->
        <!-- 1. Client Header -->
        <mxCell id="header_client" value="Client" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#404040;strokeColor=#262626;fontColor=#ffffff;fontStyle=1;fontSize=15;align=center;verticalAlign=middle;arcSize=20;" vertex="1" parent="1">
          <mxGeometry x="75" y="70" width="150" height="55" as="geometry" />
        </mxCell>

        <!-- 2. Server Header -->
        <mxCell id="header_server" value="Server" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#D6E4FF;strokeColor=#5B8FF9;fontColor=#1D2129;fontStyle=1;fontSize=15;align=center;verticalAlign=middle;arcSize=20;" vertex="1" parent="1">
          <mxGeometry x="305" y="70" width="150" height="55" as="geometry" />
        </mxCell>

        <!-- 3. Scanner Engine Header -->
        <mxCell id="header_engine" value="Scanner Engine" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FAD3D1;strokeColor=#E8684A;fontColor=#1D2129;fontStyle=1;fontSize=15;align=center;verticalAlign=middle;arcSize=20;" vertex="1" parent="1">
          <mxGeometry x="545" y="70" width="150" height="55" as="geometry" />
        </mxCell>

        <!-- 4. Database Header -->
        <mxCell id="header_db" value="Database" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#D3EECE;strokeColor=#52C41A;fontColor=#1D2129;fontStyle=1;fontSize=15;align=center;verticalAlign=middle;arcSize=20;" vertex="1" parent="1">
          <mxGeometry x="775" y="70" width="150" height="55" as="geometry" />
        </mxCell>

        <!-- LIFELINES -->
        <mxCell id="life_client" value="" style="endArrow=none;html=1;strokeColor=#8C8C8C;strokeWidth=2;" edge="1" parent="1" source="header_client">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="150" y="125" as="sourcePoint" />
            <mxPoint x="150" y="850" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <mxCell id="life_server_line" value="" style="endArrow=none;html=1;strokeColor=#5B8FF9;strokeWidth=2;" edge="1" parent="1" source="header_server">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="380" y="125" as="sourcePoint" />
            <mxPoint x="380" y="850" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <mxCell id="life_engine_line" value="" style="endArrow=none;html=1;strokeColor=#E8684A;strokeWidth=2;" edge="1" parent="1" source="header_engine">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="620" y="125" as="sourcePoint" />
            <mxPoint x="620" y="850" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <mxCell id="life_db" value="" style="endArrow=none;html=1;strokeColor=#52C41A;strokeWidth=2;" edge="1" parent="1" source="header_db">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="850" y="125" as="sourcePoint" />
            <mxPoint x="850" y="850" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- ACTIVATION BARS -->
        <mxCell id="act_server" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#D6E4FF;strokeColor=#5B8FF9;strokeWidth=1.5;arcSize=10;" vertex="1" parent="1">
          <mxGeometry x="371" y="160" width="18" height="630" as="geometry" />
        </mxCell>

        <mxCell id="act_engine" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FAD3D1;strokeColor=#E8684A;strokeWidth=1.5;arcSize=10;" vertex="1" parent="1">
          <mxGeometry x="611" y="220" width="18" height="500" as="geometry" />
        </mxCell>

        <!-- LOOP CONTAINER FRAGMENT -->
        <mxCell id="loop_box" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFBE6;fillOpacity=0.3;strokeColor=#E5C158;strokeWidth=1.8;arcSize=6;" vertex="1" parent="1">
          <mxGeometry x="335" y="340" width="470" height="195" as="geometry" />
        </mxCell>

        <mxCell id="loop_tab" value="loop" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#B37FEB;strokeColor=#9254DE;strokeWidth=1.5;fontStyle=1;fontSize=12;fontColor=#FFFFFF;align=center;verticalAlign=middle;" vertex="1" parent="1">
          <mxGeometry x="335" y="340" width="55" height="24" as="geometry" />
        </mxCell>

        <mxCell id="loop_title" value="Scan all endpoints / AI evaluation engines" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=13;fontColor=#333333;" vertex="1" parent="1">
          <mxGeometry x="400" y="340" width="360" height="24" as="geometry" />
        </mxCell>

        <!-- MESSAGES & NUMBERED BADGES -->

        <!-- Step 1: Client -> Server -->
        <mxCell id="msg1" value="Scan request" style="endArrow=open;dashed=1;html=1;strokeColor=#333333;strokeWidth=1.8;fontSize=13.5;fontStyle=0;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="150" y="170" as="sourcePoint" />
            <mxPoint x="371" y="170" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge1" value="1" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#555555;fontStyle=1;fontSize=11;fontColor=#333333;" vertex="1" parent="1">
          <mxGeometry x="139" y="159" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 2: Server -> Scanner Engine -->
        <mxCell id="msg2" value="Initiate scan" style="endArrow=open;dashed=1;html=1;strokeColor=#333333;strokeWidth=1.8;fontSize=13.5;fontStyle=0;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="389" y="230" as="sourcePoint" />
            <mxPoint x="611" y="230" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge2" value="2" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#555555;fontStyle=1;fontSize=11;fontColor=#333333;" vertex="1" parent="1">
          <mxGeometry x="378" y="219" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 3: Scanner Engine -> Database -->
        <mxCell id="msg3" value="payloads / models" style="endArrow=open;dashed=1;html=1;strokeColor=#333333;strokeWidth=1.8;fontSize=13.5;fontStyle=0;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="629" y="290" as="sourcePoint" />
            <mxPoint x="850" y="290" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge3" value="3" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#555555;fontStyle=1;fontSize=11;fontColor=#333333;" vertex="1" parent="1">
          <mxGeometry x="618" y="279" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 4: Self Loop on Scanner Engine -->
        <mxCell id="msg4" value="Test Perplexity, KNN,&lt;br&gt;Cosine, POS, Trigram, etc." style="endArrow=open;html=1;strokeColor=#333333;strokeWidth=1.8;fontSize=12.5;fontStyle=0;edgeStyle=orthogonalEdgeStyle;curved=0;align=left;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="629" y="395" as="sourcePoint" />
            <mxPoint x="629" y="430" as="targetPoint" />
            <Array as="points">
              <mxPoint x="685" y="395" />
              <mxPoint x="685" y="430" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="badge4" value="4" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#555555;fontStyle=1;fontSize=11;fontColor=#333333;" vertex="1" parent="1">
          <mxGeometry x="618" y="384" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 5: Scanner Engine -> Server -->
        <mxCell id="msg5" value="Return" style="endArrow=open;dashed=1;html=1;strokeColor=#333333;strokeWidth=1.8;fontSize=13.5;fontStyle=0;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="611" y="490" as="sourcePoint" />
            <mxPoint x="389" y="490" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge5" value="5" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#555555;fontStyle=1;fontSize=11;fontColor=#333333;" vertex="1" parent="1">
          <mxGeometry x="600" y="479" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 6: Scanner Engine -> Database -->
        <mxCell id="msg6" value="Store results" style="endArrow=open;dashed=1;html=1;strokeColor=#333333;strokeWidth=1.8;fontSize=13.5;fontStyle=0;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="629" y="570" as="sourcePoint" />
            <mxPoint x="850" y="570" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge6" value="6" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#555555;fontStyle=1;fontSize=11;fontColor=#333333;" vertex="1" parent="1">
          <mxGeometry x="618" y="559" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 7: Server -> Scanner Engine -->
        <mxCell id="msg7" value="Request report" style="endArrow=open;dashed=1;html=1;strokeColor=#333333;strokeWidth=1.8;fontSize=13.5;fontStyle=0;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="389" y="640" as="sourcePoint" />
            <mxPoint x="611" y="640" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge7" value="7" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#555555;fontStyle=1;fontSize=11;fontColor=#333333;" vertex="1" parent="1">
          <mxGeometry x="378" y="629" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 8: Scanner Engine -> Server -->
        <mxCell id="msg8" value="Send report" style="endArrow=open;dashed=1;html=1;strokeColor=#333333;strokeWidth=1.8;fontSize=13.5;fontStyle=0;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="611" y="710" as="sourcePoint" />
            <mxPoint x="389" y="710" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge8" value="8" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#555555;fontStyle=1;fontSize=11;fontColor=#333333;" vertex="1" parent="1">
          <mxGeometry x="600" y="699" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 9: Server -> Client -->
        <mxCell id="msg9" value="Return report" style="endArrow=open;dashed=1;html=1;strokeColor=#333333;strokeWidth=1.8;fontSize=13.5;fontStyle=0;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="371" y="780" as="sourcePoint" />
            <mxPoint x="150" y="780" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge9" value="9" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#555555;fontStyle=1;fontSize=11;fontColor=#333333;" vertex="1" parent="1">
          <mxGeometry x="360" y="769" width="22" height="22" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>'''

# 2. GENERATE PURE STANDALONE SVG CONTENT
SVG_CONTENT = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 880" width="100%" height="100%" style="background-color: #ffffff;">
  <defs>
    <!-- Open Arrow Marker for dashed message lines -->
    <marker id="arrow-open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#333333" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </marker>
    <!-- Solid Arrow Marker for self call loop -->
    <marker id="arrow-solid" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 1 1 L 9 5 L 1 9 z" fill="#333333" stroke="#333333" stroke-width="1" />
    </marker>
  </defs>

  <style>
    .diagram-title { font-family: 'Times New Roman', Georgia, serif; font-size: 19px; font-weight: bold; fill: #111111; text-anchor: middle; }
    .header-box-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: bold; text-anchor: middle; }
    .msg-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13.5px; font-weight: 500; fill: #222222; text-anchor: middle; }
    .msg-line { stroke: #333333; stroke-width: 1.8; stroke-dasharray: 6,4; fill: none; }
    .msg-line-solid { stroke: #333333; stroke-width: 1.8; fill: none; }
    .num-circle { fill: #ffffff; stroke: #444444; stroke-width: 1.5; }
    .num-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #333333; text-anchor: middle; dominant-baseline: central; }
    .loop-box { fill: #fffbe6; fill-opacity: 0.3; stroke: #e5c158; stroke-width: 1.8; rx: 6px; }
    .loop-badge { fill: #b37feb; stroke: #9254de; stroke-width: 1.2; rx: 4px; }
    .loop-badge-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #ffffff; text-anchor: middle; dominant-baseline: central; }
    .loop-header-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #333333; dominant-baseline: central; }
  </style>

  <!-- Title -->
  <text x="480" y="38" class="diagram-title">Figure 3.6: Sequence Diagram for AI Text Detector</text>

  <!-- Lifeline Extension Lines -->
  <!-- Client Lifeline (X=150) -->
  <line x1="150" y1="125" x2="150" y2="840" stroke="#8c8c8c" stroke-width="2" />
  <!-- Server Lifeline (X=380) -->
  <line x1="380" y1="125" x2="380" y2="840" stroke="#5b8ff9" stroke-width="2" />
  <!-- Scanner Engine Lifeline (X=620) -->
  <line x1="620" y1="125" x2="620" y2="840" stroke="#e8684a" stroke-width="2" />
  <!-- Database Lifeline (X=850) -->
  <line x1="850" y1="125" x2="850" y2="840" stroke="#52c41a" stroke-width="2" />

  <!-- Activation Bars -->
  <!-- Server Activation Bar (X=371, Width=18, Y=160..790) -->
  <rect x="371" y="160" width="18" height="630" rx="3" fill="#d6e4ff" stroke="#5b8ff9" stroke-width="1.5" />
  <!-- Scanner Engine Activation Bar (X=611, Width=18, Y=220..720) -->
  <rect x="611" y="220" width="18" height="500" rx="3" fill="#fad3d1" stroke="#e8684a" stroke-width="1.5" />

  <!-- Participant Headers -->
  <!-- 1. Client -->
  <rect x="75" y="70" width="150" height="55" rx="10" ry="10" fill="#404040" stroke="#262626" stroke-width="1.5" />
  <text x="150" y="103" class="header-box-text" fill="#ffffff">Client</text>

  <!-- 2. Server -->
  <rect x="305" y="70" width="150" height="55" rx="10" ry="10" fill="#d6e4ff" stroke="#5b8ff9" stroke-width="1.5" />
  <text x="380" y="103" class="header-box-text" fill="#1d2129">Server</text>

  <!-- 3. Scanner Engine -->
  <rect x="545" y="70" width="150" height="55" rx="10" ry="10" fill="#fad3d1" stroke="#e8684a" stroke-width="1.5" />
  <text x="620" y="103" class="header-box-text" fill="#1d2129">Scanner Engine</text>

  <!-- 4. Database -->
  <rect x="775" y="70" width="150" height="55" rx="10" ry="10" fill="#d3eece" stroke="#52c41a" stroke-width="1.5" />
  <text x="850" y="103" class="header-box-text" fill="#1d2129">Database</text>

  <!-- Step 1: Client -> Server -->
  <path d="M 150 170 L 369 170" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="260" y="162" class="msg-text">Scan request</text>
  <circle cx="150" cy="170" r="11" class="num-circle" />
  <text x="150" y="170" class="num-text">1</text>

  <!-- Step 2: Server -> Scanner Engine -->
  <path d="M 389 230 L 609 230" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="500" y="222" class="msg-text">Initiate scan</text>
  <circle cx="389" cy="230" r="11" class="num-circle" />
  <text x="389" y="230" class="num-text">2</text>

  <!-- Step 3: Scanner Engine -> Database -->
  <path d="M 629 290 L 848 290" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="740" y="282" class="msg-text">payloads / models</text>
  <circle cx="629" cy="290" r="11" class="num-circle" />
  <text x="629" y="290" class="num-text">3</text>

  <!-- Loop Container Box -->
  <g>
    <rect x="335" y="340" width="470" height="195" class="loop-box" />
    <rect x="335" y="340" width="55" height="24" class="loop-badge" />
    <text x="362.5" y="352" class="loop-badge-text">loop</text>
    <text x="400" y="352" class="loop-header-text">Scan all endpoints / AI evaluation engines</text>
  </g>

  <!-- Step 4: Self Call (Scanner Engine) -->
  <path d="M 629 395 L 685 395 L 685 430 L 631 430" class="msg-line-solid" marker-end="url(#arrow-solid)" />
  <text x="695" y="407" class="msg-text" text-anchor="start">Test Perplexity, KNN,</text>
  <text x="695" y="423" class="msg-text" text-anchor="start">Cosine, POS, Trigram, etc.</text>
  <circle cx="629" cy="395" r="11" class="num-circle" />
  <text x="629" y="395" class="num-text">4</text>

  <!-- Step 5: Scanner Engine -> Server -->
  <path d="M 611 490 L 391 490" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="500" y="482" class="msg-text">Return</text>
  <circle cx="611" cy="490" r="11" class="num-circle" />
  <text x="611" y="490" class="num-text">5</text>

  <!-- Step 6: Scanner Engine -> Database -->
  <path d="M 629 570 L 848 570" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="740" y="562" class="msg-text">Store results</text>
  <circle cx="629" cy="570" r="11" class="num-circle" />
  <text x="629" y="570" class="num-text">6</text>

  <!-- Step 7: Server -> Scanner Engine -->
  <path d="M 389 640 L 609 640" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="500" y="632" class="msg-text">Request report</text>
  <circle cx="389" cy="640" r="11" class="num-circle" />
  <text x="389" y="640" class="num-text">7</text>

  <!-- Step 8: Scanner Engine -> Server -->
  <path d="M 611 710 L 391 710" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="500" y="702" class="msg-text">Send report</text>
  <circle cx="611" cy="710" r="11" class="num-circle" />
  <text x="611" y="710" class="num-text">8</text>

  <!-- Step 9: Server -> Client -->
  <path d="M 371 780 L 152 780" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="260" y="772" class="msg-text">Return report</text>
  <circle cx="371" cy="780" r="11" class="num-circle" />
  <text x="371" y="780" class="num-text">9</text>

</svg>'''

def main():
    target_dirs = [
        'docs',
        'images',
        r'C:\Users\pc\.gemini\antigravity\brain\9f62aa6b-6e42-408b-844e-1f6f09259710'
    ]

    for d in target_dirs:
        os.makedirs(d, exist_ok=True)
        # Write .drawio XML
        drawio_path = os.path.join(d, 'sequence_diagram.drawio')
        with open(drawio_path, 'w', encoding='utf-8') as f:
            f.write(DRAWIO_XML)

        # Write standalone .svg
        svg_path = os.path.join(d, 'sequence_diagram.svg')
        with open(svg_path, 'w', encoding='utf-8') as f:
            f.write(SVG_CONTENT)
            
        print(f"Written assets to: {d}")

if __name__ == '__main__':
    main()
