import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, VerticalAlign, AlignmentType,
  PageBreak, PageOrientation
} from 'docx';
import { saveAs } from 'file-saver';

const GRAY = 'D9D9D9';
const BLACK = '000000';
const border = { style: BorderStyle.SINGLE, size: 4, color: BLACK };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

const FONT = '맑은 고딕';
const PAGE_W = 11906; // A4 in DXA
const MARGIN = 1080;  // ~1.9cm
const CONTENT_W = PAGE_W - MARGIN * 2; // ~9746 DXA

function run(text, opts = {}) {
  return new TextRun({
    text: String(text ?? ''),
    font: FONT,
    size: (opts.size || 9) * 2,
    bold: opts.bold || false,
    italics: opts.italic || false,
    underline: opts.underline ? {} : undefined,
    color: BLACK,
  });
}

function cell(text, opts = {}) {
  const isGray = opts.gray || false;
  const align = opts.align || AlignmentType.CENTER;
  return new TableCell({
    borders,
    verticalAlign: VerticalAlign.CENTER,
    shading: isGray ? { fill: GRAY, type: ShadingType.CLEAR } : undefined,
    columnSpan: opts.span || 1,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: align,
        children: [run(text, { bold: isGray, size: opts.size || 9, ...opts })],
      }),
    ],
  });
}

function changedCell(text, changed, opts = {}) {
  return new TableCell({
    borders,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [run(text, { bold: changed, italic: changed, underline: changed, size: 9, ...opts })],
      }),
    ],
  });
}

function emptyCell(opts = {}) {
  return cell('', opts);
}

function grayCell(text, opts = {}) {
  return cell(text, { ...opts, gray: true });
}

function multilineCell(lines, opts = {}) {
  return new TableCell({
    borders,
    verticalAlign: opts.vAlign || VerticalAlign.TOP,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: lines.map(({ text, bold, size }) =>
      new Paragraph({
        alignment: opts.align || AlignmentType.LEFT,
        children: [run(text, { bold: bold || false, size: size || 8.5 })],
      })
    ),
  });
}

// 헤더 테이블 (8열)
function makeMainHeader(d, docLabel, pageStr) {
  // 열 너비: 문서번호(1400), 제품명(3400), 작성라벨(500), 서명(1100), 검토라벨(500), 서명(1100), 승인라벨(500), 서명(1100)
  const cols = [1400, 3400, 500, 1100, 500, 1100, 500, 946];
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({ children: [
        grayCell('문 서 번 호', { size: 8 }),
        grayCell(docLabel, { size: 8 }),
        grayCell('작\n성', { size: 7 }),
        emptyCell(),
        grayCell('검\n토', { size: 7 }),
        emptyCell(),
        grayCell('승\n인', { size: 7 }),
        emptyCell(),
      ]}),
      new TableRow({ children: [
        cell(d.docNo || '', { size: 7 }),
        cell(d.productName || '', { bold: true, size: 9 }),
        grayCell('작\n성', { size: 7 }),
        cell(`/ ${d.drafter || ''}`, { size: 7 }),
        grayCell('검\n토', { size: 7 }),
        cell(`/ ${d.reviewer || ''}`, { size: 7 }),
        grayCell('승\n인', { size: 7 }),
        cell(`/ ${d.approver || ''}`, { size: 7 }),
      ]}),
      new TableRow({ children: [
        grayCell('제정일자', { size: 7 }),
        cell(d.establishDate || '', { size: 7 }),
        grayCell('개정일자', { size: 7 }),
        cell(d.revisionDate || '', { size: 7, span: 2 }),
        grayCell('개정번호', { size: 7 }),
        cell(d.revisionNo || '', { size: 7 }),
        cell(pageStr, { size: 7 }),
      ]}),
    ],
  });
}

function makeSubHeader(d, docLabel, pageStr) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W / 2, CONTENT_W / 2],
    rows: [
      new TableRow({ children: [
        grayCell(docLabel, { size: 8 }),
        cell(d.productName || '', { bold: true, size: 9 }),
      ]}),
      new TableRow({ children: [
        grayCell('제정일자', { size: 7 }),
        cell(`${d.establishDate || ''}  개정일자 ${d.revisionDate || ''}  개정번호 ${d.revisionNo || ''}  페이지 ${pageStr}`, { size: 7, align: AlignmentType.LEFT }),
      ]}),
    ],
  });
}

function rightPara(text) {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [run(text, { bold: true, size: 10 })],
  });
}

function centerPara(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [run(text, { bold: true, size: 10 })],
  });
}

function smallPara(text) {
  return new Paragraph({
    children: [run(text, { size: 7 })],
  });
}

function sectionTitle(text) {
  return new Paragraph({
    children: [run(text, { bold: true, size: 9 })],
  });
}

export async function generateAndDownload(data) {
  const d = data;
  const fc = d.flowConditions || {};
  const docLabel = d.docType === 'Be품' ? '제조법 문서 (Be품)' : '제조법 문서';

  const materials = d.materials || [];
  const specs = d.specs || [];
  const qaSpecs = d.qaSpecs || [];

  // Material Balance 빈행 채우기
  const matRows = [...materials];
  while (matRows.length < 10) matRows.push({ order: '', name: '', amount: '', note: '', changed: false });

  // 제품규격 빈행 채우기
  const specRows = [...specs];
  while (specRows.length < 8) specRows.push({ order: '', item: '', spec: '', method: '', changed: false });

  // 분석 항목 (6단계용)
  const specForAnalysis = specs.filter(s => s.item && s.spec);

  const matColWidths = [700, 4500, 2500, 2046];
  const specColWidths = [700, 4500, 2500, 2046];

  // ── 섹션 1: 제조법 1/4 ──
  const sec1 = [
    rightPara('그린케미칼(주)'),
    makeMainHeader(d, docLabel, '1/4'),
    new Paragraph({}),
    sectionTitle(' 1.0 Material Balance '),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: matColWidths,
      rows: [
        new TableRow({ children: [
          grayCell('', { size: 8 }),
          grayCell('원       료       명', { size: 8 }),
          grayCell('투   입   량 (kg)', { size: 8 }),
          grayCell('비      고', { size: 8 }),
        ]}),
        ...matRows.map(r => new TableRow({ children: [
          cell(r.order || '', { size: 9 }),
          changedCell(r.name || '', r.changed),
          changedCell(r.amount || '', r.changed),
          cell(r.note || '', { size: 9 }),
        ]})),
        new TableRow({ children: [
          emptyCell(),
          cell('TOTAL', { bold: true, size: 9 }),
          changedCell(d.totalAmount || '', true),
          emptyCell(),
        ]}),
      ],
    }),
    new Paragraph({}),
    sectionTitle(' 2.0 제품규격'),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: specColWidths,
      rows: [
        new TableRow({ children: [
          grayCell('', { size: 8 }),
          grayCell('항          목', { size: 8 }),
          grayCell('규          격', { size: 8 }),
          grayCell('시   험   법', { size: 8 }),
        ]}),
        ...specRows.map(r => new TableRow({ children: [
          cell(r.order || '', { size: 9 }),
          cell(r.item || '', { size: 9 }),
          changedCell(r.spec || '', r.changed),
          cell(r.method || '', { size: 9 }),
        ]})),
      ],
    }),
    new Paragraph({}),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [900, CONTENT_W - 900],
      rows: [
        new TableRow({ children: [ grayCell('개  정', { size: 8 }), cell(d.revisionNote || '', { align: AlignmentType.LEFT, size: 9 }) ] }),
        new TableRow({ children: [ grayCell('배포처', { size: 8 }), cell(d.distributionMfg || '', { align: AlignmentType.LEFT, size: 9 }) ] }),
      ],
    }),
    smallPara('FB01-06(1)'),
    centerPara('그린케미칼(주)'),
  ];

  // ── 섹션 2: 제조법 2/4 ──
  const flowText1 = [
    { text: `${fc.starter || 'Starter'}  ${fc.catalyst || '촉매'}` },
    { text: '↓' }, { text: '1  원료사입' }, { text: '↓' }, { text: '2  치   환' },
    { text: '↓' }, { text: '3  승   온' }, { text: fc.reactant || 'Reactant' },
    { text: '↓' }, { text: '4  반   응' }, { text: '↓' }, { text: '5  숙    성' },
  ];

  const condText1 = [
    { text: '<준 비> : 사용할 중합조가 충분히 세척, 건조되어 있는가를 확인한다.' },
    { text: '' },
    { text: '1. 원료사입', bold: true },
    { text: `    지시량의 ${fc.starter || 'Starter'}, ${fc.catalyst || '촉매'}를 사입한 후 교반을 실시한다.` },
    { text: '' },
    { text: '2. 치   환', bold: true },
    { text: '    0 kg/cm²G  ↔  -1 kg/cm²G 로 질소감압치환을 3회 실시한 후 최종압력은 -1.0 kg/cm²G 로 한다' },
    { text: '' },
    { text: '3. 승  온', bold: true },
    { text: `    반응온도까지 승온한다.(${fc.reactionTemp || 140}℃)` },
    { text: '' },
    { text: '4. 반   응', bold: true },
    { text: `    * 반응온도 : ${fc.reactionTemp || 140} ± 5℃` },
    { text: `    * 반응압력 : ${fc.reactionPressure || 4} kg/cm²G 이하` },
    { text: `    * 반응시간 : 지시량의 ${fc.reactant || 'Reactant'} 사입 종료까지` },
    { text: '' },
    { text: '5. 숙   성', bold: true },
    { text: `    * 숙성온도 : ${fc.agingTemp || 140} ± 5℃` },
    { text: `    * 숙성압력 : ${fc.agingPressure || 4} kg/cm²G 이하` },
    { text: '    * 숙성시간 : 동일온도에서 압력평형상태가 30분간 지속될 때 까지' },
  ];

  const sec2 = [
    makeSubHeader(d, docLabel, '2/4'),
    new Paragraph({}),
    sectionTitle(' 3.0 작업개요'),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [2000, CONTENT_W - 2000],
      rows: [
        new TableRow({ children: [
          grayCell('FLOW SHEET', { size: 8 }),
          grayCell('제    조    조    건', { size: 8 }),
        ]}),
        new TableRow({ children: [
          multilineCell(flowText1, { vAlign: VerticalAlign.TOP, align: AlignmentType.CENTER }),
          multilineCell(condText1, { vAlign: VerticalAlign.TOP, align: AlignmentType.LEFT }),
        ]}),
      ],
    }),
    smallPara('FB01-06(1)'),
    centerPara('그린케미칼(주)'),
  ];

  // ── 섹션 3: 제조법 3/4 ──
  const flowText2 = [
    { text: '6  분   석' }, { text: '↓' }, { text: '7  냉   각' },
    { text: '↓' }, { text: '8  탈   취' }, { text: '↓' }, { text: '9  포  장' },
  ];

  const condText2 = [
    { text: '6. 분   석', bold: true },
    { text: '    숙성이 종료되면 다음 항목을 분석한다.' },
    ...specForAnalysis.map(s => ({ text: `       ${(s.item || '').trim()}    : ${s.spec || ''}` })),
    { text: '' },
    { text: '7. 냉   각', bold: true },
    { text: '    분석치가 규격내인 것을 확인한 후 탈취온도까지 냉각한다.' },
    { text: '' },
    { text: '8. 탈   취', bold: true },
    { text: `    탈취온도(${fc.deodorTemp || 80}±5℃)에서 30분간 질소로 탈취한다.` },
    { text: '' },
    { text: '9. 포  장', bold: true },
    { text: '    본 제품은 Be품이므로 제품의 변질을 방지하기 위하여 질소를 충진하여' },
    { text: `    포장한다.(포장온도 : ${fc.packingTemp || 60}℃ 이하)` },
  ];

  const sec3 = [
    makeSubHeader(d, docLabel, '3/4'),
    new Paragraph({}),
    sectionTitle(' 3.0 작업개요'),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [2000, CONTENT_W - 2000],
      rows: [
        new TableRow({ children: [
          grayCell('FLOW SHEET', { size: 8 }),
          grayCell('제    조    조    건', { size: 8 }),
        ]}),
        new TableRow({ children: [
          multilineCell(flowText2, { vAlign: VerticalAlign.TOP, align: AlignmentType.CENTER }),
          multilineCell(condText2, { vAlign: VerticalAlign.TOP, align: AlignmentType.LEFT }),
        ]}),
      ],
    }),
    smallPara('FB01-06(1)'),
    centerPara('그린케미칼(주)'),
  ];

  // ── 섹션 4: 제조법 4/4 ──
  const infoLines = [
    { text: '4.0 제조기계', bold: true },
    { text: `    ${fc.reactorNo || 'V-302'} Reactor Type` },
    { text: '' },
    { text: '5.0 유해물질명', bold: true },
    { text: `    ${fc.hazardous || '해당없음'}` },
    { text: '' },
    { text: '6.0 포장용기', bold: true },
    { text: `    ${fc.packageType || 'Steel Drum (Net.Wt. : 230 kg)'}` },
    { text: '' },
    { text: '7.0 저장, 보존, 취급, 폐기에 관한 사항', bold: true },
    { text: '  7.1 저장 및 보존', bold: true },
    { text: `      ${fc.storage || ''}` },
    { text: '  7.2 취  급', bold: true },
    { text: `      ${fc.handling || ''}` },
    { text: '  7.3 폐  기', bold: true },
    { text: `      ${fc.disposal || ''}` },
  ];

  const sec4 = [
    makeSubHeader(d, docLabel, '4/4'),
    new Paragraph({}),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [CONTENT_W],
      rows: [
        new TableRow({ children: [
          multilineCell(infoLines, { vAlign: VerticalAlign.TOP, align: AlignmentType.LEFT }),
        ]}),
      ],
    }),
    smallPara('FB01-06(1)'),
    centerPara('그린케미칼(주)'),
  ];

  // ── 섹션 5: 제품보증규격 ──
  const qaDocNo = (d.docNo || '').replace('R41', 'R32');

  const sec5 = [
    rightPara('그린케미칼(주)'),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [1400, 3400, 500, 1100, 500, 1100, 500, 946],
      rows: [
        new TableRow({ children: [
          grayCell('문 서 번 호', { size: 8 }), grayCell('제품규격 (Be품)', { size: 8 }),
          grayCell('작\n성', { size: 7 }), emptyCell(),
          grayCell('검\n토', { size: 7 }), emptyCell(),
          grayCell('승\n인', { size: 7 }), emptyCell(),
        ]}),
        new TableRow({ children: [
          cell(qaDocNo, { size: 7 }), cell(d.productName || '', { bold: true }),
          grayCell('작\n성', { size: 7 }), cell(`/ ${d.drafter || ''}`, { size: 7 }),
          grayCell('검\n토', { size: 7 }), cell(`/ ${d.reviewer || ''}`, { size: 7 }),
          grayCell('승\n인', { size: 7 }), cell(`/ ${d.approver || ''}`, { size: 7 }),
        ]}),
        new TableRow({ children: [
          grayCell('제정일자', { size: 7 }), cell(d.establishDate || '', { size: 7 }),
          grayCell('개정일자', { size: 7 }), cell(d.revisionDate || '', { size: 7, span: 2 }),
          grayCell('개정번호', { size: 7 }), cell(d.revisionNo || '', { size: 7 }),
          cell('1/1', { size: 7 }),
        ]}),
      ],
    }),
    new Paragraph({}),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [2100, 1050, 1600, 1600, 1600, 1796],
      rows: [
        new TableRow({ children: [
          grayCell('공  정  도', { size: 8 }), grayCell('분 석 점', { size: 8 }),
          grayCell('분 석 항 목', { size: 8 }), grayCell('분 석 법', { size: 8 }),
          grayCell('규    격', { size: 8 }), grayCell('비    고', { size: 8 }),
        ]}),
        new TableRow({ children: [
          multilineCell([
            '1  원료사입','2  치    환','3  승    온','4  반    응',
            '5  숙    성','6  분    석','7  냉    각','8  탈    취','9  포    장'
          ].map(t => ({ text: t })), { vAlign: VerticalAlign.MIDDLE, align: AlignmentType.CENTER }),
          cell('6', { bold: true, size: 11 }),
          multilineCell(specs.filter(s=>s.item).map(s=>({ text: s.item })), { vAlign: VerticalAlign.TOP }),
          multilineCell(specs.filter(s=>s.method).map(s=>({ text: s.method })), { vAlign: VerticalAlign.TOP }),
          new TableCell({
            borders, verticalAlign: VerticalAlign.TOP,
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: specs.filter(s=>s.spec).map(s => new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [run(s.spec, { bold: s.changed, italic: s.changed, underline: s.changed, size: 9 })],
            })),
          }),
          emptyCell(),
        ]}),
      ],
    }),
    new Paragraph({}),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [900, CONTENT_W - 900],
      rows: [
        new TableRow({ children: [ grayCell('개  정', { size: 8 }), cell(d.revisionNote || '', { align: AlignmentType.LEFT, size: 9 }) ] }),
        new TableRow({ children: [ grayCell('배포처', { size: 8 }), cell(d.distributionQuality || '', { align: AlignmentType.LEFT, size: 9 }) ] }),
      ],
    }),
    smallPara('FB01-07(1)'),
    centerPara('그린케미칼(주)'),
  ];

  // ── 섹션 6: 품질보증규격 ──
  const sec6 = [
    rightPara('그린케미칼(주)'),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [1400, 3400, 500, 1100, 500, 1100, 500, 946],
      rows: [
        new TableRow({ children: [
          grayCell('문 서 번 호', { size: 8 }), grayCell('품질보증규격', { size: 8 }),
          grayCell('작\n성', { size: 7 }), emptyCell(),
          grayCell('검\n토', { size: 7 }), emptyCell(),
          grayCell('승\n인', { size: 7 }), emptyCell(),
        ]}),
        new TableRow({ children: [
          cell(d.qaDocNo || '', { size: 7 }), cell(`KONION ${d.productName || ''}`, { bold: true }),
          grayCell('작\n성', { size: 7 }), cell(`/ ${d.drafter || ''}`, { size: 7 }),
          grayCell('검\n토', { size: 7 }), cell(`/ ${d.reviewer || ''}`, { size: 7 }),
          grayCell('승\n인', { size: 7 }), cell(`/ ${d.approver || ''}`, { size: 7 }),
        ]}),
        new TableRow({ children: [
          grayCell('제정일자', { size: 7 }), cell(d.establishDate || '', { size: 7 }),
          grayCell('개정일자', { size: 7 }),
          cell(d.qaRevisionDate || d.revisionDate || '', { size: 7, span: 2 }),
          grayCell('개정번호', { size: 7 }),
          cell(d.qaRevisionNo || d.revisionNo || '', { size: 7 }),
          cell('1/1', { size: 7 }),
        ]}),
      ],
    }),
    new Paragraph({}),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [2400, CONTENT_W - 2400],
      rows: [
        new TableRow({ children: [
          grayCell('구 분 / 분석항목', { size: 8 }),
          grayCell(d.productName || '', { size: 8 }),
        ]}),
        ...qaSpecs.map(s => new TableRow({ children: [
          cell(s.item || '', { size: 9 }),
          changedCell(s.spec || '', s.changed),
        ]})),
      ],
    }),
    new Paragraph({}),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [CONTENT_W],
      rows: [
        new TableRow({ children: [
          new TableCell({
            borders,
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [
              new Paragraph({ children: [run('특기사항', { bold: true, size: 9 })] }),
              new Paragraph({ children: [run(`* 제품보존기간 : ${d.qaPreservation || '2 년'}`, { size: 9 })] }),
            ],
          }),
        ]}),
      ],
    }),
    new Paragraph({}),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [1100, CONTENT_W - 1100],
      rows: [
        new TableRow({ children: [
          grayCell('배 포 처', { size: 8 }),
          cell(d.qaDistribution || '', { align: AlignmentType.LEFT, size: 9 }),
        ]}),
      ],
    }),
  ];

  function withBreak(items) {
    return [
      ...items,
      new Paragraph({ children: [new PageBreak()] }),
    ];
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        },
      },
      children: [
        ...withBreak(sec1),
        ...withBreak(sec2),
        ...withBreak(sec3),
        ...withBreak(sec4),
        ...withBreak(sec5),
        ...sec6,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${d.productName || '제조법'}_제조법.docx`);
}
