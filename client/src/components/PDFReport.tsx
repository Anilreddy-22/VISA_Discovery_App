import { UIUseCase, UIPainPoint } from "@/lib/dataAdapter";

export interface PDFReportData {
  painPoints: UIPainPoint[];
  useCases: UIUseCase[];
  cumulativeROI: { revenue: number; savings: number; efficiency: number };
  companyName?: string;
}

/**
 * Render PDF Report as HTML for print-to-PDF conversion
 * Creates a 4-page professional report
 */
export function PDFReportComponent({ data }: { data: PDFReportData }) {
  // Debug logging
  console.log('📄 PDFReportComponent received data:', {
    painPointsCount: data.painPoints.length,
    painPointsByQuadrant: {
      'Quick Wins': data.painPoints.filter(p => p.quadrant === 'Quick Wins').map(p => p.response),
      'Major Projects': data.painPoints.filter(p => p.quadrant === 'Major Projects').map(p => p.response),
      'Fill-in': data.painPoints.filter(p => p.quadrant === 'Fill-in').map(p => p.response),
      'Money Pit': data.painPoints.filter(p => p.quadrant === 'Money Pit').map(p => p.response),
    },
    useCasesCount: data.useCases.length,
    useCaseQuadrants: data.useCases.map(uc => ({ name: uc.name, quadrant: uc.quadrant })),
    roi: data.cumulativeROI,
    firstPainPoint: data.painPoints[0],
    firstUseCase: data.useCases[0]
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  // Group pain points by theme
  const themesMap = new Map<string, UIPainPoint[]>();
  data.painPoints.forEach(pp => {
    if (pp.theme) {
      if (!themesMap.has(pp.theme)) {
        themesMap.set(pp.theme, []);
      }
      themesMap.get(pp.theme)!.push(pp);
    }
  });

  // Group use cases by quadrant
  const quadrants = ["Quick Wins", "Major Projects", "Fill-in", "Money Pit"];
  const quadrantMap = new Map(quadrants.map(q => [q, data.useCases.filter(uc => uc.quadrant === q)]));

  // Top use cases by revenue
  const topUseCases = [...data.useCases]
    .sort((a, b) => (b.calculatedRevenue || 0) - (a.calculatedRevenue || 0))
    .slice(0, 10);

  return (
    <>
      <style>{`
        @media print {
          html, body {
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .pdf-report-container {
            width: 100%;
            display: block;
          }
          .pdf-page {
            page-break-after: always;
            page-break-inside: avoid;
            padding: 40px 35px !important;
            margin: 0 !important;
          }
          .pdf-page:last-child {
            page-break-after: avoid;
          }
          @page {
            margin: 15mm;
            size: auto;
          }
        }
        
        .pdf-report-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #374151;
          line-height: 1.4;
        }

        .pdf-page {
          page-break-after: always;
          page-break-inside: avoid;
          padding: 40px 35px;
          background: white;
          margin: 0;
          position: relative;
          min-height: auto;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 15px;
          border-bottom: 3px solid #dc2626;
          padding-bottom: 10px;
        }

        .page-number {
          position: absolute;
          bottom: 20px;
          right: 30px;
          font-size: 11px;
          color: #9CA3AF;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 42px;
          border-bottom: 2px solid #dc2626;
          padding-bottom: 12px;
        }

        .page-number {
          display: none;
        }

        h2 {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-top: 15px;
          margin-bottom: 8px;
          border-left: 4px solid #dc2626;
          padding-left: 10px;
        }

        .theme-section {
          margin-bottom: 12px;
          padding: 12px 0 14px 0;
          background: transparent;
          border: 0;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 0;
          box-shadow: none;
        }

        .theme-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: 0.2px;
          margin-bottom: 12px;
        }

        .pain-point-list {
          margin-left: 0;
        }

        .pain-point-item {
          font-size: 13px;
          margin-bottom: 8px;
          color: #111827;
          line-height: 1.4;
        }

        .quadrant-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 28px;
        }

        .quadrant-section {
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 3px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.04);
          overflow: hidden;
        }

        .quadrant-title {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: 0.2px;
          padding: 10px 12px;
          background: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
        }

        .usecase-list {
          margin: 0;
          padding: 10px 12px;
        }

        .usecase-item {
          font-size: 11px;
          margin: 0;
          padding: 8px 0;
          color: #111827;
          line-height: 1.35;
          border-bottom: 1px solid #e5e7eb;
        }

        .usecase-item:last-child {
          border-bottom: 0;
        }

        .usecase-list {
          margin-left: 0;
        }

        .usecase-item {
          font-size: 11px;
          margin-bottom: 6px;
          color: #111827;
          line-height: 1.3;
        }

        .projected-result-box {
          border: 2px solid #dc2626;
          padding: 40px 50px;
          margin: 70px 0 35px 0;
          text-align: center;
          background: white;
          position: relative;
        }

        .projected-result-title {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 0 15px;
          font-size: 12px;
          font-weight: 700;
          color: #dc2626;
          letter-spacing: 3px;
        }

        .projected-metric {
          margin-bottom: 20px;
        }

        .projected-metric:last-of-type {
          margin-bottom: 0;
        }

        .projected-value {
          font-size: 40px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 6px;
          line-height: 1;
        }

        .projected-label {
          font-size: 10px;
          color: #9ca3af;
          font-weight: 600;
          letter-spacing: 1.5px;
        }

        .based-on-text {
          font-size: 10px;
          color: #9ca3af;
          font-style: italic;
          margin-top: 25px;
        }

        .breakdown-container {
          border: 1px solid #e5e7eb;
          background: white;
          padding: 32px 25px 25px;
          margin-top: 30px;
        }

        .breakdown-header {
          font-size: 10px;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: 3px;
          margin-bottom: 20px;
          text-align: center;
        }

        .roi-table, .use-cases-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0;
          font-size: 12px;
          background: white;
        }

        .roi-table th, .use-cases-table th {
          background: #f3f4f6;
          padding: 8px 12px;
          text-align: left;
          font-weight: 600;
          color: #1f2937;
          border: 1px solid #e5e7eb;
        }

        .roi-table td {
          padding: 14px 0;
          color: #111827;
          border: none;
          border-bottom: 1px solid #f3f4f6;
        }

        .roi-table tbody tr:last-child td {
          border-bottom: none;
        }

        .roi-table tbody tr:nth-child(odd) td {
          background: white;
        }

        .roi-table tbody tr:nth-child(even) td {
          background: #f9fafb;
        }

        .roi-table tbody tr:last-child td {
          border-bottom: none;
        }

        .use-cases-table td {
          padding: 8px 6px;
          color: #111827;
          border: 1px solid #e5e7eb;
        }

        .use-cases-table tr:nth-child(even) {
          background: #f9fafb;
        }

        .row-number {
          font-weight: 600;
          color: #1f2937;
          width: 25px;
        }

        .category {
          background: #dbeafe;
          color: #1e40af;
          padding: 1px 4px;
          border-radius: 2px;
          font-size: 8px;
          display: inline-block;
        }

        .priority-h1 {
          background: #fee2e2;
          color: #991b1b;
          padding: 1px 4px;
          border-radius: 2px;
          font-size: 8px;
          font-weight: 600;
        }
      `}</style>

      <div className="pdf-report-container">
        {/* PAGE 1: Pain Points to Themes */}
        <div className="pdf-page">
          <h1 className="page-title">Pain Points to Themes Connection</h1>
          <div className="page-number">Page 1</div>

          {themesMap.size > 0 ? (
            Array.from(themesMap.entries()).map(([theme, painPoints]) => (
                <div key={theme} className="theme-section">
                  <div className="theme-title">{theme}</div>
                <div className="pain-point-list">
                  {painPoints.map((pp, idx) => (
                    <div key={idx} className="pain-point-item">
                      {idx + 1}. {pp.response}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '11px', color: '#6b7280' }}>No pain points with themes found.</p>
          )}
        </div>

        {/* PAGE 2: Prioritize Impact */}
        <div className="pdf-page">
          <h1 className="page-title">Prioritize Impact</h1>
          <div className="page-number">Page 2</div>

          <div className="quadrant-grid">
            {quadrants.map(quadrant => {
              const items = data.painPoints.filter(pp => pp.quadrant === quadrant) || [];
              return (
                <div key={quadrant} className="quadrant-section">
                  <div className="quadrant-title">{quadrant}</div>
                  {items.length > 0 ? (
                    <div className="usecase-list">
                      {items.map((item, idx) => (
                        <div key={idx} className="usecase-item">
                          {idx + 1}. {item.response}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="usecase-item" style={{ color: '#9CA3AF', fontSize: '9px' }}>No items</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* PAGE 3: ROI Projection - Exact match to Step 5 */}
        <div className="pdf-page">
          <h1 className="page-title">ROI Projection</h1>
          <div className="page-number">Page 3</div>

          {/* Projected Result Box */}
          <div className="projected-result-box">
            <div className="projected-result-title">PROJECTED RESULT</div>
            
            <div className="projected-metric">
              <div className="projected-value">${data.cumulativeROI.revenue.toLocaleString()}</div>
              <div className="projected-label">REVENUE UPLIFT</div>
            </div>

            <div className="projected-metric">
              <div className="projected-value">${data.cumulativeROI.savings.toLocaleString()}</div>
              <div className="projected-label">COST SAVINGS</div>
            </div>

            <div className="based-on-text">
              Based on {data.useCases.length} prioritized use cases
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="breakdown-container">
            <div className="breakdown-header">CALCULATION BREAKDOWN</div>
            <table className="roi-table">
              <tbody>
                {data.useCases.map((uc, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'left', fontWeight: '400', fontSize: '13px', color: '#111827' }}>{uc.name}</td>
                    <td style={{ fontWeight: '700', color: '#1f2937', textAlign: 'right', width: '150px', fontSize: '13px' }}>
                      ${((uc.calculatedRevenue || 0) + (uc.calculatedSavings || 0)).toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #e5e7eb' }}>
                  <td style={{ fontWeight: '700', color: '#1f2937', paddingTop: '16px', paddingBottom: '0', fontSize: '13px' }}>
                    TOTAL ANNUAL ROI
                  </td>
                  <td style={{ fontWeight: '700', color: '#dc2626', fontSize: '15px', textAlign: 'right', width: '150px', paddingTop: '16px', paddingBottom: '0' }}>
                    ${(data.cumulativeROI.revenue + data.cumulativeROI.savings).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGE 4: Use Case Backlog */}
        <div className="pdf-page">
          <h1 className="page-title">The Use Case Backlog</h1>
          <div className="page-number">Page 4</div>

          <div style={{ marginTop: '28px', marginBottom: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '28px 20px 32px', backgroundColor: '#ffffff' }}>
            {/* P1 Quick Wins Section */}
            {(() => {
              const p1Cases = data.useCases.filter(uc => uc.backlogPriority === 'P1');
              const p1Impact = p1Cases.reduce((sum, uc) => sum + (uc.calculatedRevenue || 0) + (uc.calculatedSavings || 0), 0);
              return p1Cases.length > 0 ? (
                <div style={{ marginBottom: '72px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', marginBottom: '6px', letterSpacing: '0.5px' }}>JAN 31ST - APRIL 30TH</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>P1 Quick Wins</div>
                    </div>
                  </div>
                  <div style={{ paddingLeft: '8px', marginBottom: '12px' }}>
                    {p1Cases.map((uc, idx) => (
                      <div key={idx} style={{ marginBottom: '10px', fontSize: '13px', color: '#111827', lineHeight: '1.5' }}>
                        {uc.name}
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'right', paddingTop: '12px', borderTop: '2px solid #e5e7eb' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Projected Impact</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>${p1Impact.toLocaleString()}</div>
                  </div>
                  <div style={{ marginTop: '16px', borderBottom: '1px solid #e5e7eb' }} />
                </div>
              ) : null;
            })()}

            {/* P2 Strategic Section */}
            {(() => {
              const p2Cases = data.useCases.filter(uc => uc.backlogPriority === 'P2');
              const p2Impact = p2Cases.reduce((sum, uc) => sum + (uc.calculatedRevenue || 0) + (uc.calculatedSavings || 0), 0);
              return p2Cases.length > 0 ? (
                <div style={{ marginBottom: '72px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', marginBottom: '6px', letterSpacing: '0.5px' }}>H2 / TBD</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>P2 Strategic</div>
                    </div>
                  </div>
                  <div style={{ paddingLeft: '8px', marginBottom: '12px' }}>
                    {p2Cases.map((uc, idx) => (
                      <div key={idx} style={{ marginBottom: '10px', fontSize: '13px', color: '#111827', lineHeight: '1.5' }}>
                        {uc.name}
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'right', paddingTop: '12px', borderTop: '2px solid #e5e7eb' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Projected Impact</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>${p2Impact.toLocaleString()}</div>
                  </div>
                  <div style={{ marginTop: '16px', borderBottom: '1px solid #e5e7eb' }} />
                </div>
              ) : null;
            })()}

            {/* P3 Future Section */}
            {(() => {
              const p3Cases = data.useCases.filter(uc => uc.backlogPriority === 'P3');
              const p3Impact = p3Cases.reduce((sum, uc) => sum + (uc.calculatedRevenue || 0) + (uc.calculatedSavings || 0), 0);
              return p3Cases.length > 0 ? (
                <div style={{ marginBottom: '60px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', marginBottom: '6px', letterSpacing: '0.5px' }}>TBD</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>P3 Future</div>
                    </div>
                  </div>
                  <div style={{ paddingLeft: '8px', marginBottom: '12px' }}>
                    {p3Cases.map((uc, idx) => (
                      <div key={idx} style={{ marginBottom: '10px', fontSize: '13px', color: '#111827', lineHeight: '1.5' }}>
                        {uc.name}
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'right', paddingTop: '12px', borderTop: '2px solid #e5e7eb' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Projected Impact</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>${p3Impact.toLocaleString()}</div>
                  </div>
                  <div style={{ marginTop: '16px', borderBottom: '1px solid #e5e7eb' }} />
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    </>
  );
}
