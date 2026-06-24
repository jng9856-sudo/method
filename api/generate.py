from http.server import BaseHTTPRequestHandler
import json, io, base64, zipfile, re, copy, os, shutil, tempfile

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'template.docx')

def replace_text_at_index(content, target_text, new_text, occurrence=0):
    """XML에서 특정 텍스트를 새 텍스트로 교체 (n번째 발생)"""
    pattern = r'(<w:t[^>]*>)(' + re.escape(target_text) + r')(</w:t>)'
    count = [0]
    def replacer(m):
        if count[0] == occurrence:
            count[0] += 1
            return m.group(1) + new_text + m.group(3)
        count[0] += 1
        return m.group(0)
    return re.sub(pattern, replacer, content)

def replace_all(content, target_text, new_text):
    """XML에서 특정 텍스트 모두 교체"""
    pattern = r'(<w:t[^>]*>)(' + re.escape(target_text) + r')(</w:t>)'
    return re.sub(pattern, lambda m: m.group(1) + new_text + m.group(3), content)

def set_changed_style(content, target_text, occurrence=0):
    """특정 텍스트의 run에 bold+italic+underline 스타일 추가"""
    # 해당 텍스트를 찾아 그 run에 rPr 추가
    pattern = r'(<w:r>(?:<w:rPr>.*?</w:rPr>)?<w:t[^>]*>)(' + re.escape(target_text) + r')(</w:t></w:r>)'
    new_rpr = '<w:rPr><w:b/><w:i/><w:u w:val="single"/></w:rPr>'
    count = [0]
    def replacer(m):
        if count[0] == occurrence:
            count[0] += 1
            return '<w:r>' + new_rpr + '<w:t>' + m.group(2) + '</w:t></w:r>'
        count[0] += 1
        return m.group(0)
    return re.sub(pattern, replacer, content, flags=re.DOTALL)

def modify_docx(data):
    d = data
    fc = d.get('flowConditions', {})
    materials = d.get('materials', [])
    specs = d.get('specs', [])
    qa_specs = d.get('qaSpecs', [])

    # 원본 docx 읽기
    with open(TEMPLATE_PATH, 'rb') as f:
        docx_bytes = f.read()
    
    # zip으로 열기
    zin = zipfile.ZipFile(io.BytesIO(docx_bytes))
    zout_buf = io.BytesIO()
    zout = zipfile.ZipFile(zout_buf, 'w', zipfile.ZIP_DEFLATED)
    
    for item in zin.infolist():
        data_bytes = zin.read(item.filename)
        
        if item.filename == 'word/document.xml':
            content = data_bytes.decode('utf-8')
            
            # ── 문서번호 교체 (3곳: 제조법1/4, 제품보증규격) ──
            doc_no = d.get('docNo', 'KPXGC-R41-1057')
            content = replace_all(content, 'KPXGC-R41-1057', doc_no)
            qa_doc_no = doc_no.replace('R41', 'R32')
            content = replace_all(content, 'KPXGC-R32-1057', qa_doc_no)
            
            # ── 제품명 교체 ──
            product = d.get('productName', 'PEG-400Be')
            content = replace_all(content, 'PEG-400Be', product)
            # KONION 품질보증규격용
            content = replace_all(content, 'KONION PEG-400Be', f'KONION {product}')
            
            # ── 제정일자 교체 ──
            est_date = d.get('establishDate', '2009년 01월 15일')
            content = replace_all(content, '2009년 01월 15일', est_date)
            
            # ── 개정일자: '2' + '026년' + ' ' + '04월' + ' ' + '03일' 패턴 처리 ──
            # 개정일자가 '2026년 04월 03일'처럼 쪼개져 있음
            rev_date = d.get('revisionDate', '')
            if rev_date:
                # '2' -> 연도 앞자리, '026년' -> 뒷자리 등으로 쪼개진 날짜 처리
                # 가장 간단한 방법: 통째로 교체
                # 패턴: <w:t>2</w:t>...<w:t>026년</w:t>...<w:t> </w:t>...<w:t>04월</w:t>
                # '2026년 04월 03일' → rev_date 로 교체 (첫번째 run만 교체, 나머지 run 빈값으로)
                content = content.replace(
                    '<w:t>2</w:t>\n            </w:r>\n            <w:r>\n              <w:rPr>\n                <w:rFonts w:hint="eastAsia"/>\n              </w:rPr>\n              <w:t xml:space="preserve">026년</w:t>\n            </w:r>\n            <w:r>\n              <w:rPr>\n                <w:rFonts w:hint="eastAsia"/>\n              </w:rPr>\n              <w:t xml:space="preserve"> </w:t>\n            </w:r>\n            <w:r>\n              <w:rPr>\n                <w:rFonts w:hint="eastAsia"/>\n              </w:rPr>\n              <w:t xml:space="preserve">04월</w:t>\n            </w:r>\n            <w:r>\n              <w:rPr>\n                <w:rFonts w:hint="eastAsia"/>\n              </w:rPr>\n              <w:t xml:space="preserve"> </w:t>\n            </w:r>\n            <w:r>\n              <w:rPr>\n                <w:rFonts w:hint="eastAsia"/>\n              </w:rPr>\n              <w:t>03일</w:t>',
                    f'<w:t>{rev_date}</w:t>\n            </w:r>\n            <w:r><w:t></w:t>\n            </w:r>\n            <w:r><w:t></w:t>\n            </w:r>\n            <w:r><w:t></w:t>\n            </w:r>\n            <w:r><w:t></w:t>\n            </w:r>\n            <w:r><w:t></w:t>'
                )
            
            # ── 개정번호 교체 ──
            rev_no = d.get('revisionNo', '1')
            # '1'은 너무 많으니 맥락으로 찾기 - 개정번호 라벨 다음의 '1'
            content = re.sub(
                r'(개정번호</w:t>.*?<w:t[^>]*>)1(</w:t>)',
                lambda m: m.group(1) + str(rev_no) + m.group(2),
                content, flags=re.DOTALL
            )
            
            # ── 원료 교체 (Material Balance) ──
            # 기존 원료: C=Ethylene glycol(EG)/214.7, B=KOH(96%)/0.76, A=EO/785.3
            old_materials = [
                ('Ethylene glycol(EG)', '214.7'),
                ('KOH(96%)', '0.76'),
                ('EO', '785.3'),
            ]
            for i, mat in enumerate(materials[:3]):
                if i < len(old_materials):
                    old_name, old_amt = old_materials[i]
                    new_name = mat.get('name', '')
                    new_amt = mat.get('amount', '')
                    if new_name and new_name != old_name:
                        content = replace_text_at_index(content, old_name, new_name, 0)
                    if new_amt and new_amt != old_amt:
                        content = replace_text_at_index(content, old_amt, new_amt, 0)
            
            # ── TOTAL 교체 ──
            total = d.get('totalAmount', '1000.76')
            if total and total != '1000.76':
                content = replace_all(content, '1000.76', total)
            
            # ── 제품규격 교체 ──
            # 색상: '20 이하' -> 새 값
            # 수분: '0' + '.1 이하' 패턴
            # 평균분자량: '270 ~ 300'
            spec_map = {s.get('item', '').strip(): s for s in specs if s.get('item')}
            
            # 색상 규격
            color_spec = spec_map.get('색       상', {})
            if color_spec and color_spec.get('spec') and color_spec['spec'] != '20 이하':
                content = replace_all(content, '20 이하', color_spec['spec'])
            
            # 수분 규격 (0 + .1 이하 = '0.1 이하')  
            water_spec = spec_map.get('수   분 (%)', {})
            if water_spec and water_spec.get('spec') and water_spec['spec'] != '0.1 이하':
                # 패턴 처리
                content = content.replace(
                    '<w:t>0</w:t>\n            </w:r>\n            <w:r>\n              <w:t>.1 이하</w:t>',
                    f'<w:t>{water_spec["spec"]}</w:t>\n            </w:r>\n            <w:r>\n              <w:t></w:t>'
                )
            
            # 평균분자량 규격 (여러 곳에 있음)
            mw_spec = spec_map.get('평균분자량', {})
            new_mw = mw_spec.get('spec', '270 ~ 300') if mw_spec else '270 ~ 300'
            changed_mw = mw_spec.get('changed', False) if mw_spec else False
            content = replace_all(content, '270 ~ 300', new_mw)
            
            # ── 개정내용 교체 ──
            rev_note = d.get('revisionNote', '')
            if rev_note:
                content = replace_all(content, '원단위 및 제품규격 평균분자량 개정', rev_note)
                content = replace_all(content, '원단위 ', rev_note[:10])
                
            # ── 배포처 교체 ──
            dist_mfg = d.get('distributionMfg', '')
            if dist_mfg:
                content = replace_all(content, '케미칼생산팀 사본 1부', dist_mfg)
            dist_qa = d.get('distributionQuality', '')
            if dist_qa:
                content = replace_all(content, '케미칼품질팀 사본 2부', dist_qa)
            dist_qb = d.get('qaDistribution', '')
            if dist_qb:
                content = replace_all(content, '케미칼 품질팀 사본 1부', dist_qb)
            
            # ── 품질보증규격 개정일자 (03월 25일) ──
            qa_rev_date = d.get('qaRevisionDate', '') or d.get('revisionDate', '')
            if qa_rev_date:
                content = content.replace(
                    '>03월<', f'>{qa_rev_date}<'
                ).replace('>25일<', '><')
            
            # ── 품질보증 보존기간 ──
            preservation = d.get('qaPreservation', '2 년')
            content = replace_all(content, '2 년', preservation)
            
            # ── 작성/검토/승인은 서명란이라 비워져 있으므로 생략 ──
            
            data_bytes = content.encode('utf-8')
        
        zout.writestr(item, data_bytes)
    
    zout.close()
    return zout_buf.getvalue()


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        data = json.loads(body)
        
        try:
            docx_bytes = modify_docx(data)
            b64 = base64.b64encode(docx_bytes).decode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'file': b64}).encode())
        except Exception as e:
            import traceback
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e), 'trace': traceback.format_exc()}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
