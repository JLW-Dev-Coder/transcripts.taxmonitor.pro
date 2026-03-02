// Alphabetical keys (because you like rules)
async function loadTranscriptCodeGuide() {
  const res = await fetch('/magnets/guide.html', { cache: 'force-cache' });
  if (!res.ok) throw new Error('Failed to load guide.html: ' + res.status);

  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const cards = Array.from(doc.querySelectorAll('.code-card'));
  const guide = {};

  for (const card of cards) {
    const code = (card.querySelector('.code-number')?.textContent || '').trim();
    if (!code) continue;

    const title = (card.querySelector('.code-title')?.textContent || '').trim();

    const rows = Array.from(card.querySelectorAll('.code-row'));
    const rowMap = {};
    for (const row of rows) {
      const label = (row.querySelector('.code-label')?.textContent || '').trim().toLowerCase();
      const value = (row.querySelector('.code-value')?.textContent || '').trim();
      if (label) rowMap[label] = value;
    }

    const riskText = (card.querySelector('.risk-badge')?.textContent || '').trim();
    const risk =
      riskText.toLowerCase().includes('immediate') ? 'immediate' :
      riskText.toLowerCase().includes('moderate') ? 'moderate' :
      'low';

    guide[code] = {
      action: rowMap['required action'] || '',
      risk,
      title,
      triggeredBy: rowMap['what triggered it'] || '',
      whatItMeans: rowMap['what it means'] || '',
    };
  }

  return guide;
}

function enrichTransactions(transactions, guide) {
  const txs = Array.isArray(transactions) ? transactions : [];
  return txs.map((t) => {
    const code = String(t.code || '').trim();
    const g = guide && guide[code];

    return {
      ...t,
      guide: g ? {
        action: g.action,
        risk: g.risk,
        title: g.title,
        triggeredBy: g.triggeredBy,
        whatItMeans: g.whatItMeans,
      } : null,
    };
  });
}
