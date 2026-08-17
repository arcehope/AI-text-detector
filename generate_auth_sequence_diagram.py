import os

# UNIFIED SEQUENCE DIAGRAM WITH AUTHENTICATION & LOGIN (BLACK & WHITE)
DRAWIO_AUTH_BW_XML = '''<mxfile host="app.diagrams.net" modified="2026-08-17T20:57:00.000Z" agent="Antigravity" version="21.6.8" type="device">
  <diagram id="sentinel-sequence-auth-bw" name="Figure 3.6 Sequence Diagram with Auth (B&amp;W)">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="980" pageHeight="1020" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title Caption -->
        <mxCell id="title" value="&lt;b style=&quot;font-family: Georgia, 'Times New Roman', serif; font-size: 18px; color: #000000;&quot;&gt;Figure 3.6: Sequence Diagram for Sentinel AI Text Detector (With Auth &amp; Scanning)&lt;/b&gt;" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="190" y="20" width="600" height="35" as="geometry" />
        </mxCell>

        <!-- PARTICIPANT HEADERS -->
        <mxCell id="header_client" value="Client (UI)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=2;fontColor=#000000;fontStyle=1;fontSize=15;align=center;verticalAlign=middle;arcSize=20;" vertex="1" parent="1">
          <mxGeometry x="75" y="70" width="150" height="55" as="geometry" />
        </mxCell>

        <mxCell id="header_server" value="Server (Controller)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=2;fontColor=#000000;fontStyle=1;fontSize=15;align=center;verticalAlign=middle;arcSize=20;" vertex="1" parent="1">
          <mxGeometry x="305" y="70" width="150" height="55" as="geometry" />
        </mxCell>

        <mxCell id="header_engine" value="Scanner Engine" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=2;fontColor=#000000;fontStyle=1;fontSize=15;align=center;verticalAlign=middle;arcSize=20;" vertex="1" parent="1">
          <mxGeometry x="545" y="70" width="150" height="55" as="geometry" />
        </mxCell>

        <mxCell id="header_db" value="Database (sentinel.db)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=2;fontColor=#000000;fontStyle=1;fontSize=15;align=center;verticalAlign=middle;arcSize=20;" vertex="1" parent="1">
          <mxGeometry x="775" y="70" width="150" height="55" as="geometry" />
        </mxCell>

        <!-- LIFELINES -->
        <mxCell id="life_client" value="" style="endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.8;" edge="1" parent="1" source="header_client">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="150" y="125" as="sourcePoint" />
            <mxPoint x="150" y="970" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <mxCell id="life_server_line" value="" style="endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.8;" edge="1" parent="1" source="header_server">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="380" y="125" as="sourcePoint" />
            <mxPoint x="380" y="970" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <mxCell id="life_engine_line" value="" style="endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.8;" edge="1" parent="1" source="header_engine">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="620" y="125" as="sourcePoint" />
            <mxPoint x="620" y="970" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <mxCell id="life_db" value="" style="endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.8;" edge="1" parent="1" source="header_db">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="850" y="125" as="sourcePoint" />
            <mxPoint x="850" y="970" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- OPTIONAL AUTHENTICATION FRAGMENT FRAME -->
        <mxCell id="opt_auth_box" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#000000;strokeWidth=1.8;arcSize=6;" vertex="1" parent="1">
          <mxGeometry x="110" y="145" width="775" height="115" as="geometry" />
        </mxCell>
        <mxCell id="opt_tab" value="opt" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontStyle=1;fontSize=12;fontColor=#000000;align=center;verticalAlign=middle;" vertex="1" parent="1">
          <mxGeometry x="110" y="145" width="50" height="24" as="geometry" />
        </mxCell>
        <mxCell id="opt_title" value="User Login / Authentication (/api/auth/login)" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=12.5;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="170" y="145" width="350" height="24" as="geometry" />
        </mxCell>

        <!-- AUTH MESSAGES -->
        <!-- Auth Step A: Client -> Server -->
        <mxCell id="msg_auth1" value="Login request (username, password)" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=13;fontStyle=0;fontColor=#000000;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="150" y="185" as="sourcePoint" />
            <mxPoint x="371" y="185" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- Auth Step B: Server -> DB -->
        <mxCell id="msg_auth2" value="Verify user credentials" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=13;fontStyle=0;fontColor=#000000;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="389" y="210" as="sourcePoint" />
            <mxPoint x="850" y="210" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- Auth Step C: Server -> Client -->
        <mxCell id="msg_auth3" value="Auth response (Session / Token)" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=13;fontStyle=0;fontColor=#000000;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="371" y="235" as="sourcePoint" />
            <mxPoint x="150" y="235" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- ACTIVATION BARS -->
        <mxCell id="act_server" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;arcSize=10;" vertex="1" parent="1">
          <mxGeometry x="371" y="280" width="18" height="640" as="geometry" />
        </mxCell>

        <mxCell id="act_engine" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;arcSize=10;" vertex="1" parent="1">
          <mxGeometry x="611" y="340" width="18" height="510" as="geometry" />
        </mxCell>

        <!-- LOOP CONTAINER FRAGMENT -->
        <mxCell id="loop_box" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#000000;strokeWidth=1.8;arcSize=6;" vertex="1" parent="1">
          <mxGeometry x="335" y="460" width="470" height="195" as="geometry" />
        </mxCell>

        <mxCell id="loop_tab" value="loop" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontStyle=1;fontSize=12;fontColor=#000000;align=center;verticalAlign=middle;" vertex="1" parent="1">
          <mxGeometry x="335" y="460" width="55" height="24" as="geometry" />
        </mxCell>

        <mxCell id="loop_title" value="Scan all endpoints / AI evaluation engines" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=13;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="400" y="460" width="360" height="24" as="geometry" />
        </mxCell>

        <!-- MESSAGES & NUMBERED BADGES -->

        <!-- Step 1: Client -> Server -->
        <mxCell id="msg1" value="Scan request" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=13.5;fontStyle=0;fontColor=#000000;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="150" y="290" as="sourcePoint" />
            <mxPoint x="371" y="290" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge1" value="1" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontStyle=1;fontSize=11;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="139" y="279" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 2: Server -> Scanner Engine -->
        <mxCell id="msg2" value="Initiate scan" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=13.5;fontStyle=0;fontColor=#000000;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="389" y="350" as="sourcePoint" />
            <mxPoint x="611" y="350" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge2" value="2" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontStyle=1;fontSize=11;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="378" y="339" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 3: Scanner Engine -> Database -->
        <mxCell id="msg3" value="payloads / models" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=13.5;fontStyle=0;fontColor=#000000;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="629" y="410" as="sourcePoint" />
            <mxPoint x="850" y="410" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge3" value="3" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontStyle=1;fontSize=11;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="618" y="399" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 4: Self Loop on Scanner Engine -->
        <mxCell id="msg4" value="Test Perplexity, KNN,&lt;br&gt;Cosine, POS, Trigram, etc." style="endArrow=open;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=12.5;fontStyle=0;fontColor=#000000;edgeStyle=orthogonalEdgeStyle;curved=0;align=left;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="629" y="515" as="sourcePoint" />
            <mxPoint x="629" y="550" as="targetPoint" />
            <Array as="points">
              <mxPoint x="685" y="515" />
              <mxPoint x="685" y="550" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="badge4" value="4" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontStyle=1;fontSize=11;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="618" y="504" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 5: Scanner Engine -> Server -->
        <mxCell id="msg5" value="Return" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=13.5;fontStyle=0;fontColor=#000000;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="611" y="610" as="sourcePoint" />
            <mxPoint x="389" y="610" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge5" value="5" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontStyle=1;fontSize=11;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="600" y="599" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 6: Scanner Engine -> Database -->
        <mxCell id="msg6" value="Store results" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=13.5;fontStyle=0;fontColor=#000000;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="629" y="690" as="sourcePoint" />
            <mxPoint x="850" y="690" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge6" value="6" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontStyle=1;fontSize=11;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="618" y="679" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 7: Server -> Scanner Engine -->
        <mxCell id="msg7" value="Request report" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=13.5;fontStyle=0;fontColor=#000000;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="389" y="760" as="sourcePoint" />
            <mxPoint x="611" y="760" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge7" value="7" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontStyle=1;fontSize=11;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="378" y="749" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 8: Scanner Engine -> Server -->
        <mxCell id="msg8" value="Send report" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=13.5;fontStyle=0;fontColor=#000000;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="611" y="830" as="sourcePoint" />
            <mxPoint x="389" y="830" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge8" value="8" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontStyle=1;fontSize=11;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="600" y="819" width="22" height="22" as="geometry" />
        </mxCell>

        <!-- Step 9: Server -> Client -->
        <mxCell id="msg9" value="Return report" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.8;fontSize=13.5;fontStyle=0;fontColor=#000000;labelBackgroundColor=#FFFFFF;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="371" y="900" as="sourcePoint" />
            <mxPoint x="150" y="900" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="badge9" value="9" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontStyle=1;fontSize=11;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="360" y="889" width="22" height="22" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>'''

# STANDALONE SVG WITH AUTHENTICATION & LOGIN (BLACK & WHITE)
SVG_AUTH_BW_CONTENT = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 1000" width="100%" height="100%" style="background-color: #ffffff;">
  <defs>
    <marker id="arrow-open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </marker>
    <marker id="arrow-solid" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 1 1 L 9 5 L 1 9 z" fill="#000000" stroke="#000000" stroke-width="1" />
    </marker>
  </defs>

  <style>
    .diagram-title { font-family: 'Times New Roman', Georgia, serif; font-size: 19px; font-weight: bold; fill: #000000; text-anchor: middle; }
    .header-box-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14.5px; font-weight: bold; fill: #000000; text-anchor: middle; }
    .msg-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13.5px; font-weight: 500; fill: #000000; text-anchor: middle; }
    .msg-line { stroke: #000000; stroke-width: 1.8; stroke-dasharray: 6,4; fill: none; }
    .msg-line-solid { stroke: #000000; stroke-width: 1.8; fill: none; }
    .num-circle { fill: #ffffff; stroke: #000000; stroke-width: 1.5; }
    .num-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #000000; text-anchor: middle; dominant-baseline: central; }
    .opt-box { fill: none; stroke: #000000; stroke-width: 1.8; rx: 6px; }
    .opt-badge { fill: #ffffff; stroke: #000000; stroke-width: 1.5; rx: 4px; }
    .opt-badge-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #000000; text-anchor: middle; dominant-baseline: central; }
    .opt-header-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12.5px; font-weight: bold; fill: #000000; dominant-baseline: central; }
    .loop-box { fill: none; stroke: #000000; stroke-width: 1.8; rx: 6px; }
    .loop-badge { fill: #ffffff; stroke: #000000; stroke-width: 1.5; rx: 4px; }
    .loop-badge-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #000000; text-anchor: middle; dominant-baseline: central; }
    .loop-header-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #000000; dominant-baseline: central; }
  </style>

  <!-- Title -->
  <text x="480" y="38" class="diagram-title">Figure 3.6: Sequence Diagram for Sentinel AI Text Detector (With Auth &amp; Scan)</text>

  <!-- Lifeline Extension Lines -->
  <line x1="150" y1="125" x2="150" y2="960" stroke="#000000" stroke-width="1.8" />
  <line x1="380" y1="125" x2="380" y2="960" stroke="#000000" stroke-width="1.8" />
  <line x1="620" y1="125" x2="620" y2="960" stroke="#000000" stroke-width="1.8" />
  <line x1="850" y1="125" x2="850" y2="960" stroke="#000000" stroke-width="1.8" />

  <!-- Participant Headers -->
  <rect x="75" y="70" width="150" height="55" rx="10" ry="10" fill="#ffffff" stroke="#000000" stroke-width="2" />
  <text x="150" y="103" class="header-box-text">Client (UI)</text>

  <rect x="305" y="70" width="150" height="55" rx="10" ry="10" fill="#ffffff" stroke="#000000" stroke-width="2" />
  <text x="380" y="103" class="header-box-text">Server (Controller)</text>

  <rect x="545" y="70" width="150" height="55" rx="10" ry="10" fill="#ffffff" stroke="#000000" stroke-width="2" />
  <text x="620" y="103" class="header-box-text">Scanner Engine</text>

  <rect x="775" y="70" width="150" height="55" rx="10" ry="10" fill="#ffffff" stroke="#000000" stroke-width="2" />
  <text x="850" y="103" class="header-box-text">Database (sentinel.db)</text>

  <!-- OPTIONAL AUTHENTICATION FRAGMENT -->
  <g>
    <rect x="110" y="145" width="775" height="115" class="opt-box" />
    <rect x="110" y="145" width="50" height="24" class="opt-badge" />
    <text x="135" y="157" class="opt-badge-text">opt</text>
    <text x="175" y="157" class="opt-header-text">User Login / Authentication (/api/auth/login)</text>
  </g>

  <!-- Auth Step 1: Login Request -->
  <path d="M 150 185 L 369 185" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="260" y="177" class="msg-text">Login request (username, password)</text>

  <!-- Auth Step 2: Verify DB -->
  <path d="M 389 210 L 848 210" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="620" y="202" class="msg-text">Verify credentials (users table)</text>

  <!-- Auth Step 3: Auth Response -->
  <path d="M 371 235 L 152 235" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="260" y="227" class="msg-text">Auth response (Success / Token)</text>

  <!-- Activation Bars -->
  <rect x="371" y="280" width="18" height="640" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
  <rect x="611" y="340" width="18" height="510" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1.5" />

  <!-- Step 1: Client -> Server -->
  <path d="M 150 290 L 369 290" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="260" y="282" class="msg-text">Scan request</text>
  <circle cx="150" cy="290" r="11" class="num-circle" />
  <text x="150" y="290" class="num-text">1</text>

  <!-- Step 2: Server -> Scanner Engine -->
  <path d="M 389 350 L 609 350" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="500" y="342" class="msg-text">Initiate scan</text>
  <circle cx="389" cy="350" r="11" class="num-circle" />
  <text x="389" y="350" class="num-text">2</text>

  <!-- Step 3: Scanner Engine -> Database -->
  <path d="M 629 410 L 848 410" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="740" y="402" class="msg-text">payloads / models</text>
  <circle cx="629" cy="410" r="11" class="num-circle" />
  <text x="629" y="410" class="num-text">3</text>

  <!-- Loop Container Box -->
  <g>
    <rect x="335" y="460" width="470" height="195" class="loop-box" />
    <rect x="335" y="460" width="55" height="24" class="loop-badge" />
    <text x="362.5" y="472" class="loop-badge-text">loop</text>
    <text x="400" y="472" class="loop-header-text">Scan all endpoints / AI evaluation engines</text>
  </g>

  <!-- Step 4: Self Call (Scanner Engine) -->
  <path d="M 629 515 L 685 515 L 685 550 L 631 550" class="msg-line-solid" marker-end="url(#arrow-solid)" />
  <text x="695" y="527" class="msg-text" text-anchor="start">Test Perplexity, KNN,</text>
  <text x="695" y="543" class="msg-text" text-anchor="start">Cosine, POS, Trigram, etc.</text>
  <circle cx="629" cy="515" r="11" class="num-circle" />
  <text x="629" y="515" class="num-text">4</text>

  <!-- Step 5: Scanner Engine -> Server -->
  <path d="M 611 610 L 391 610" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="500" y="602" class="msg-text">Return</text>
  <circle cx="611" cy="610" r="11" class="num-circle" />
  <text x="611" y="610" class="num-text">5</text>

  <!-- Step 6: Scanner Engine -> Database -->
  <path d="M 629 690 L 848 690" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="740" y="682" class="msg-text">Store results</text>
  <circle cx="629" cy="690" r="11" class="num-circle" />
  <text x="629" y="690" class="num-text">6</text>

  <!-- Step 7: Server -> Scanner Engine -->
  <path d="M 389 760 L 609 760" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="500" y="752" class="msg-text">Request report</text>
  <circle cx="389" cy="760" r="11" class="num-circle" />
  <text x="389" y="760" class="num-text">7</text>

  <!-- Step 8: Scanner Engine -> Server -->
  <path d="M 611 830 L 391 830" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="500" y="822" class="msg-text">Send report</text>
  <circle cx="611" cy="830" r="11" class="num-circle" />
  <text x="611" y="830" class="num-text">8</text>

  <!-- Step 9: Server -> Client -->
  <path d="M 371 900 L 152 900" class="msg-line" marker-end="url(#arrow-open)" />
  <text x="260" y="892" class="msg-text">Return report</text>
  <circle cx="371" cy="900" r="11" class="num-circle" />
  <text x="371" y="900" class="num-text">9</text>
</svg>'''

def main():
    target_dirs = [
        'docs',
        'images',
        r'C:\Users\pc\.gemini\antigravity\brain\9f62aa6b-6e42-408b-844e-1f6f09259710'
    ]

    for d in target_dirs:
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, 'sequence_diagram_with_auth.drawio'), 'w', encoding='utf-8') as f:
            f.write(DRAWIO_AUTH_BW_XML)
        with open(os.path.join(d, 'sequence_diagram_with_auth.svg'), 'w', encoding='utf-8') as f:
            f.write(SVG_AUTH_BW_CONTENT)
        print(f"Generated Auth sequence diagram in {d}")

if __name__ == '__main__':
    main()
