// Records Overview (Bar Chart) - start with zero
const ctx = document.getElementById('recordsChart');
if (ctx) {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Records', 'Approvals', 'Depreciation', 'COA Forms'],
      datasets: [{
        label: 'System Data',
        data: [0, 0, 0, 0], // all zero initially
        backgroundColor: ['#006400', '#228B22', '#32CD32', '#90EE90']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Monthly Trends (Line Chart) - start with zero
const trendsCtx = document.getElementById('trendsChart');
if (trendsCtx) {
  new Chart(trendsCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Records Added',
        data: [0, 0, 0, 0, 0, 0], // all zero initially
        borderColor: '#006400',
        backgroundColor: 'rgba(0,100,0,0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true } }
    }
  });
}
