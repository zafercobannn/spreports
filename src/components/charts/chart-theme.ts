export const dashboardChartTheme = {
  text: {
    fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
    fontSize: 12,
    fill: '#5a7480',
  },
  axis: {
    ticks: {
      text: { fontSize: 11, fill: '#5a7480' },
      line: { stroke: '#c9dbe1' },
    },
    legend: {
      text: { fontSize: 12, fontWeight: 600, fill: '#173039' },
    },
  },
  grid: {
    line: { stroke: '#e4eff2', strokeWidth: 1 },
  },
  tooltip: {
    container: {
      background: '#ffffff',
      border: '1px solid #c9dbe1',
      borderRadius: '12px',
      padding: '8px 12px',
      fontSize: '12px',
      boxShadow: '0 14px 28px -20px rgb(23 48 57 / 0.6)',
    },
  },
  labels: {
    text: { fontSize: 11, fontWeight: 600 },
  },
}

export const chartColors = {
  primary: ['#2a6373', '#3d8d86', '#77bc8a', '#9bcf9f', '#b7ddbc'],
  comparison: ['#2a6373', '#7997a3'],
  segments: ['#3d8d86', '#2a6373', '#77bc8a', '#f0ae57', '#db6f6f'],
  performance: ['#3d8d86', '#f0ae57', '#db6f6f'],
  heatmap: [
    '#eff8f7', '#d8ece9', '#bfdfda', '#9dcec5',
    '#75b9ac', '#509f91', '#2d7f77', '#20635d', '#184d49',
  ],
}
