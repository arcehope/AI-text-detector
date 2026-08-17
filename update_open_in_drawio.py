import re

def main():
    with open('docs/figure_3_6_sequence_diagram.drawio', 'r', encoding='utf-8') as f:
        seq_xml = f.read()

    with open('open_in_drawio.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Escape tick marks and backslashes if any for JS template string
    seq_xml_escaped = seq_xml.replace('`', '\\`').replace('${', '\\${')

    pattern = r"(document\.getElementById\('seqXml'\)\.value = `).*?(`;)"
    replacement = rf"\1{seq_xml_escaped}\2"

    new_html = re.sub(pattern, replacement, html, flags=re.DOTALL)

    with open('open_in_drawio.html', 'w', encoding='utf-8') as f:
        f.write(new_html)

    print("Updated open_in_drawio.html with new Sequence Diagram XML!")

if __name__ == '__main__':
    main()
