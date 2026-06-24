* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: '맑은 고딕', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; background: #f0f2f5; color: #222; }

@media print {
  body { background: white; margin: 0; }
  .no-print { display: none !important; }
  #root > div { display: block !important; }
  
  .print-page {
    page-break-after: always;
    width: 190mm !important;
    min-height: 270mm !important;
    margin: 0 !important;
    padding: 8mm 10mm !important;
    box-shadow: none !important;
    border: none !important;
  }
  .print-page:last-child { page-break-after: auto; }
  
  @page {
    size: A4;
    margin: 10mm;
  }
}

.changed-field {
  font-weight: bold;
  font-style: italic;
  text-decoration: underline;
}
