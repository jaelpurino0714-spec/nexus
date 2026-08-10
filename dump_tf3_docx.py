import os
import sys
import zipfile
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

docx_path = r'd:\Nexus 2.0\Assets\T-or-F-term-3.docx'
out_txt_path = r'd:\Nexus 2.0\dump_T-or-F-term-3.docx.txt'

def read_docx(path):
    with zipfile.ZipFile(path, 'r') as zip_ref:
        xml_content = zip_ref.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    
    # WordprocessingML namespace
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    paragraphs = []
    for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        texts = [node.text for node in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
        if texts:
            paragraphs.append(''.join(texts))
    return '\n'.join(paragraphs)

content = read_docx(docx_path)
with open(out_txt_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully extracted text from {docx_path} to {out_txt_path} ({len(content)} characters, {len(content.splitlines())} lines)")

