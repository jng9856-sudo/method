from http.server import BaseHTTPRequestHandler
import json, io, base64, zipfile, re, os

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'template.docx')


def modify_docx(d):
    import re as RE

    fc = d.get('flowConditions', {})
    materials = d.get('materials', [])
    specs = d.get('specs', [])
    qa_specs = d.get('qaSpecs', [])

    STYLE = '<w:b/><w:i/><w:u w:val="single"/>'

    def rx_all(content, target, new):
        pattern = r'(<w:t[^>]*>)(' + RE.escape(target) + r')(</w:t>)'
        return RE.sub(pattern, lambda m: m.group(1) + new + m.group(3), content)

    def rx_nth(content, target, new, n=0):
        pattern = r'(<w:t[^>]*>)(' + RE.escape(target) + r')(</w:t>)'
        count = [0]
        def rep(m):
            if count[0] == n:
                count[0] += 1
                return m.group(1) + new + m.group(3)
            count[0] += 1
            return m.group(0)
        return RE.sub(pattern, rep, content)

    def add_style(content, text):
        style = STYLE
        pat = r'(<w:r[^>]*>)(<w:rPr>)(.*?)(</w:rPr>)(<w:t[^>]*>' + RE.escape(text) + r'</w:t></w:r>)'
        result = RE.sub(pat, lambda m: m.group(1)+m.group(2)+m.group(3)+style+m.group(4)+m.group(5), content, flags=RE.DOTALL)
        if result == content:
            pat2 = r'(<w:r[^>]*>)(<w:t[^>]*>' + RE.escape(text) + r'</w:t></w:r>)'
            result = RE.sub(pat2, lambda m: m.group(1)+'<w:rPr>'+style+'</w:rPr>'+m.group(2), content, flags=RE.DOTALL)
        return result

    with open(TEMPLATE_PATH, 'rb') as f:
        docx_bytes = f.read()

    zin = zipfile.ZipFile(io.BytesIO(docx_bytes))
    zout_buf = io.BytesIO()
    zout = zipfile.ZipFile(zout_buf, 'w', zipfile.ZIP_DEFLATED)

    for item in zin.infolist():
        data = zin.read(item.filename)

        if item.filename == 'word/document.xml':
            c = data.decode('utf-8')

            # 문서유형
            doc_type = d.get('docType', 'Be품')
            if doc_type == '일반':
                be_pat = r'<w:t xml:space="preserve"> </w:t></w:r><w:r[^>]*>.*?<w:t>\(Be</w:t></w:r><w:r[^>]*>.*?<w:t>품\)</w:t></w:r>'
                c = RE.sub(be_pat, '<w:t></w:t></w:r>', c, flags=RE.DOTALL)

            # 문서번호
            doc_no = d.get('docNo', 'KPXGC-R41-1057')
            c = rx_all(c, 'KPXGC-R41-1057', doc_no)
            c = rx_all(c, 'KPXGC-R32-1057', doc_no.replace('R41','R32'))

            # 제품명 (PEG-400 + B + e 3run 패턴)
            product = d.get('productName', 'PEG-400Be')
            peg_pat = r'PEG-400</w:t></w:r><w:r[^>]*><w:rPr>.*?</w:rPr><w:t>B</w:t></w:r><w:r[^>]*>.*?<w:t>e</w:t></w:r>'
            c = RE.sub(peg_pat, product+'</w:t></w:r><w:r><w:t></w:t></w:r><w:r><w:t></w:t></w:r>', c, flags=RE.DOTALL)
            c = rx_all(c, 'KONION PEG-400Be', 'KONION '+product)
            c = rx_all(c, 'PEG-400Be', product)

            # 제정일자
            c = rx_all(c, '2009년 01월 15일', d.get('establishDate','2009년 01월 15일'))

            # 개정일자
            rev_date = d.get('revisionDate','')
            if rev_date:
                date_pat = r'<w:t>2</w:t></w:r>\s*<w:r[^>]*><w:rPr>.*?</w:rPr><w:t xml:space="preserve">026년</w:t></w:r>\s*<w:r[^>]*><w:rPr>.*?</w:rPr><w:t xml:space="preserve"> </w:t></w:r>\s*<w:r[^>]*><w:rPr>.*?</w:rPr><w:t xml:space="preserve">04월</w:t></w:r>\s*<w:r[^>]*><w:rPr>.*?</w:rPr><w:t xml:space="preserve"> </w:t></w:r>\s*<w:r[^>]*><w:rPr>.*?</w:rPr><w:t>03일</w:t>'
                repl = '<w:t>'+rev_date+'</w:t></w:r><w:r><w:t></w:t></w:r><w:r><w:t></w:t></w:r><w:r><w:t></w:t></w:r><w:r><w:t></w:t></w:r><w:r><w:t></w:t'
                c = RE.sub(date_pat, repl, c, flags=RE.DOTALL)

            # 개정번호
            rev_no = str(d.get('revisionNo','1'))
            c = RE.sub(r'(개정번호</w:t>.*?<w:t[^>]*>)1(</w:t>)', lambda m: m.group(1)+rev_no+m.group(2), c, flags=RE.DOTALL)

            # 원료 교체
            old_amts = ['214.7', '0.76', '785.3']
            for i, mat in enumerate(materials[:3]):
                new_name = mat.get('name','') or ''
                new_amt = mat.get('amount','') or old_amts[i]
                changed = mat.get('changed', False)

                if i == 0:
                    # 앞 <w:r> 태그까지 포함해서 교체 (XML 구조 유지)
                    eg_pat = r'<w:r><w:rPr><w:rFonts w:ascii="굴림체"[^<]*</w:rPr><w:t>Ethylene glycol\(</w:t></w:r><w:r[^>]*><w:rPr>.*?</w:rPr><w:t>EG</w:t></w:r><w:r[^>]*><w:rPr>.*?</w:rPr><w:t>\)</w:t></w:r>'
                    style_str = STYLE if changed else ''
                    repl_run = '<w:r><w:rPr><w:rFonts w:ascii="굴림체" w:hAnsi="굴림체"/>'+style_str+'</w:rPr><w:t>'+new_name+'</w:t></w:r>'
                    c = RE.sub(eg_pat, repl_run, c, count=1, flags=RE.DOTALL)
                elif i == 1:
                    c = rx_nth(c, 'KOH(96%)', new_name, 0)
                    if changed: c = add_style(c, new_name)
                elif i == 2:
                    c = rx_nth(c, 'EO', new_name, 0)
                    if changed: c = add_style(c, new_name)

                c = rx_nth(c, old_amts[i], new_amt, 0)
                if changed: c = add_style(c, new_amt)

            # TOTAL
            total = d.get('totalAmount','1000.76')
            if total:
                c = rx_all(c, '1000.76', total)

            # 제품규격
            spec_map = {s.get('item','').strip(): s for s in specs if s.get('item')}

            color_s = spec_map.get('색       상', {})
            if color_s.get('spec') and color_s['spec'] != '20 이하':
                c = rx_all(c, '20 이하', color_s['spec'])
                if color_s.get('changed'): c = add_style(c, color_s['spec'])

            mw_s = spec_map.get('평균분자량', {})
            new_mw = mw_s.get('spec','270 ~ 300') if mw_s else '270 ~ 300'
            c = rx_all(c, '270 ~ 300', new_mw)
            if mw_s and mw_s.get('changed'): c = add_style(c, new_mw)

            # 공정조건
            starter = fc.get('starter','EG')
            catalyst = fc.get('catalyst','KOH(96%)')
            reactant = fc.get('reactant','EO')
            react_temp = fc.get('reactionTemp','140')
            react_pres = fc.get('reactionPressure','4')
            aging_temp = fc.get('agingTemp','140')
            aging_pres = fc.get('agingPressure','4')
            deodor_temp = fc.get('deodorTemp','80')
            packing_temp = fc.get('packingTemp','60')
            reactor_no = fc.get('reactorNo','V-302')
            hazardous = fc.get('hazardous','해당없음')
            pkg_type = fc.get('packageType','Steel Drum (Net.Wt. : 230 kg)')
            storage = fc.get('storage','')
            handling = fc.get('handling','')
            disposal = fc.get('disposal','')

            c = c.replace('>EG    KOH(96%)<', '>'+starter+'    '+catalyst+'<')
            c = c.replace('>EG<', '>'+starter+'<')
            c = c.replace('>    KOH(96%)<', '>    '+catalyst+'<')
            c = c.replace('>, KOH(96%)를 <', '>, '+catalyst+'를 <')
            c = c.replace('>EO<', '>'+reactant+'<')
            c = c.replace('반응온도까지 승온한다.(140', '반응온도까지 승온한다.('+react_temp)
            c = c.replace('반응온도 : 140 ± 5', '반응온도 : '+react_temp+' ± 5')
            c = c.replace('반응압력 : 4 kg/cm', '반응압력 : '+react_pres+' kg/cm')
            c = c.replace('반응시간 : 지시량의 EO 사입 종료까지', '반응시간 : 지시량의 '+reactant+' 사입 종료까지')
            c = c.replace('지시량의 EO 사입이 종료되면 아래의 조건에서 숙성을 실시한다.', '지시량의 '+reactant+' 사입이 종료되면 아래의 조건에서 숙성을 실시한다.')
            c = c.replace('숙성온도 : 140 ± 5', '숙성온도 : '+aging_temp+' ± 5')
            c = c.replace('숙성압력 : 4 kg/cm', '숙성압력 : '+aging_pres+' kg/cm')
            c = c.replace('탈취온도(80\u00b15\u2103)에서', '탈취온도('+deodor_temp+'\u00b15\u2103)에서')
            c = c.replace(': 60\u2103 이하', ': '+packing_temp+'\u2103 이하')
            c = c.replace('    V-302 Reactor Type', '    '+reactor_no+' Reactor Type')
            c = c.replace('    해당없음', '    '+hazardous)
            c = c.replace('    Steel Drum (Net.Wt. : 230 kg)', '    '+pkg_type)

            if storage:
                st_pat = r'옥내외에 저장하고 보존기간은 생산일로부터 </w:t></w:r><w:r[^>]*><w:rPr>.*?</w:rPr><w:t>1</w:t></w:r><w:r[^>]*><w:rPr>.*?</w:rPr><w:t>년으로 하며, 선입선출을 원칙으로 한다.</w:t>'
                c = RE.sub(st_pat, storage+'</w:t>', c, flags=RE.DOTALL)
            if handling:
                c = c.replace('     피부나 눈에 접촉시 약간의 자극을 줄 수 있으므로 보호구 및 안전장갑을 착용, 취급한다.', '     '+handling)
            if disposal:
                c = c.replace('     폐기물관리법 제 25 조에 준한다.', '     '+disposal)

            # 개정내용
            rev_note = d.get('revisionNote','')
            if rev_note:
                c = c.replace('원단위 및 제품규격 평균분자량 개정', rev_note)

            # 배포처
            if d.get('distributionMfg'): c = c.replace('케미칼생산팀 사본 1부', d['distributionMfg'])
            if d.get('distributionQuality'): c = c.replace('케미칼품질팀 사본 2부', d['distributionQuality'])
            if d.get('qaDistribution'): c = c.replace('케미칼 품질팀 사본 1부', d['qaDistribution'])

            # 품질보증 개정일자
            qa_rev = d.get('qaRevisionDate','') or d.get('revisionDate','')
            if qa_rev:
                c = c.replace('>03월<', '>'+qa_rev+'<').replace('>25일<', '><')

            # 품질보증 규격 changed 스타일
            for qs in qa_specs:
                if qs.get('spec') and qs.get('changed'):
                    c = add_style(c, qs['spec'])

            # 보존기간
            preservation = d.get('qaPreservation','2 년')
            if preservation != '2 년':
                c = rx_all(c, '2 년', preservation)

            data = c.encode('utf-8')

        zout.writestr(item, data)

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
