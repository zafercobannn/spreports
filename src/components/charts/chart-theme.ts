// Linear-vibe chart theme. Uses CSS variables so it auto-swaps with [data-theme="dark"].
export const dashboardChartTheme = {
  text: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: 12,
    fill: 'var(--color-muted-foreground)',
  },
  axis: {
    domain: {
      line: { stroke: 'var(--color-border)', strokeWidth: 1 },
    },
    ticks: {
      text: {
        fontSize: 10,
        fill: 'var(--color-muted-foreground)',
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      },
      line: { stroke: 'var(--color-border)' },
    },
    legend: {
      text: {
        fontSize: 11,
        fontWeight: 600,
        fill: 'var(--color-foreground)',
      },
    },
  },
  grid: {
    line: { stroke: 'var(--color-border)', strokeDasharray: '2 4', strokeWidth: 1 },
  },
  legends: {
    text: { fontSize: 11, fill: 'var(--color-muted-foreground)' },
  },
  tooltip: {
    container: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '11px',
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      color: 'var(--color-foreground)',
      boxShadow: '0 8px 24px -12px rgba(0,0,0,0.15)',
    },
  },
  labels: {
    text: { fontSize: 10, fontWeight: 600, fill: 'var(--color-foreground)' },
  },
}

// Hardcoded fallbacks (for places where CSS var isn't supported, e.g. arrays)
export const chartColors = {
  primary: ['#3d8d86', '#71b5af', '#9bcf9f', '#b7ddbc', '#c8e3cb'],
  comparison: ['#9aa3a8', '#3d8d86'],
  segments: ['#3d8d86', '#71b5af', '#9bcf9f', '#e0ff40', '#c14557'],
  performance: ['#3d8d86', '#e0ff40', '#c14557'],
  heatmap: [
    '#fafff0', '#f0ffaa', '#e6ff80', '#deff5c',
    '#d2f547', '#bce035', '#a8c428', '#7d971c', '#4f5d10',
  ],
  heatmapDark: [
    '#16161c', '#1d2018', '#252a14', '#303716',
    '#404a18', '#52601a', '#677920', '#7d9326', '#a8c428',
  ],
}
