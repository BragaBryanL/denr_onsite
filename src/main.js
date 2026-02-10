document.addEventListener('DOMContentLoaded', async () => {
  // Fetch dashboard stats from API
  let stats = {
    totalRecords: 0,
    pendingApprovals: 0,
    depreciationItems: 0,
    coaForms: 0
  };

  let recentActivity = [];

  try {
    const statsRes = await fetch('http://localhost:3000/dashboard-stats');
    if (statsRes.ok) {
      stats = await statsRes.json();
    }
  } catch (err) {
    console.warn('Could not fetch dashboard stats:', err);
  }

  try {
    const activityRes = await fetch('http://localhost:3000/recent-activity');
    if (activityRes.ok) {
      recentActivity = await activityRes.json();
    }
  } catch (err) {
    console.warn('Could not fetch recent activity:', err);
  }

  // Update dashboard cards
  const totalRecordsEl = document.getElementById('totalRecords');
  const pendingApprovalsEl = document.getElementById('pendingApprovals');
  const depreciationItemsEl = document.getElementById('depreciationItems');
  const coaFormsEl = document.getElementById('coaForms');

  if (totalRecordsEl) totalRecordsEl.textContent = stats.totalRecords || 0;
  if (pendingApprovalsEl) pendingApprovalsEl.textContent = stats.pendingApprovals || 0;
  if (depreciationItemsEl) depreciationItemsEl.textContent = stats.depreciationItems || 0;
  if (coaFormsEl) coaFormsEl.textContent = stats.coaForms || 0;

  // Update Recent Activity table
  const activityBody = document.getElementById('activityBody');
  if (activityBody) {
    activityBody.innerHTML = '';
    recentActivity.forEach(activity => {
      activityBody.innerHTML += `
        <tr>
          <td>${activity.date || ''}</td>
          <td>${activity.property || ''}</td>
          <td>${activity.action || ''}</td>
        </tr>
      `;
    });
  }

  // Records Overview (Bar Chart) - use real data
  const ctx = document.getElementById('recordsChart');
  if (ctx) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Records', 'Approvals', 'Depreciation', 'COA Forms'],
        datasets: [{
          label: 'System Data',
          data: [
            stats.totalRecords || 0,
            stats.pendingApprovals || 0,
            stats.depreciationItems || 0,
            stats.coaForms || 0
          ],
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

  // Monthly Trends (Line Chart) - sample data
  const trendsCtx = document.getElementById('trendsChart');
  if (trendsCtx) {
    new Chart(trendsCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Records Added',
          data: [0, 0, 0, 0, 0, 0],
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
});
