document.addEventListener('DOMContentLoaded', async () => {
  // Load records from API, fallback to localStorage
  let records = [];
  try {
    const res = await fetch('http://localhost:3000/assets');
    if (res.ok) {
      records = await res.json();
    } else {
      records = JSON.parse(localStorage.getItem('depreciationRecords')) || [];
    }
  } catch (err) {
    console.warn('Could not fetch from API, using localStorage:', err);
    records = JSON.parse(localStorage.getItem('depreciationRecords')) || [];
  }

  // Render records list
  function renderRecords(data = records) {
    const tbody = document.getElementById('recordsBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach((rec, index) => {
      tbody.innerHTML += `
      <tr>
        <td>${rec.property}</td>
        <td>${rec.ppeClass}</td>
        <td>${rec.accountCode}</td>
        <td>${rec.dateAcquired}</td>
        <td>${rec.cost}</td>
        <td>${rec.residual}</td>
        <td>${rec.usefulLife}</td>
        <td>${rec.annualDep}</td>
        <td>${rec.accDep}</td>
        <td>${rec.netBookValue}</td>
        <td><button onclick="generateCOA(${index})">Generate COA</button></td>
      </tr>
    `;
    });
  }
  renderRecords();

  // Search filter
  const searchBar = document.getElementById('coaSearchBar');
  if (searchBar) {
    searchBar.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = records.filter(rec =>
        (rec.property || '').toString().toLowerCase().includes(query) ||
        (rec.ppeClass || '').toString().toLowerCase().includes(query) ||
        (rec.accountCode || '').toString().toLowerCase().includes(query)
      );
      renderRecords(filtered);
    });
  }

  // Generate COA Form
  window.generateCOA = function(index) {
    const rec = records[index];
    if (!rec) return;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('coaProperty', rec.property);
    setVal('coaPpeClass', rec.ppeClass);
    setVal('coaAccountCode', rec.accountCode);
    setVal('coaDateAcquired', rec.dateAcquired);
    setVal('coaCost', rec.cost);
    setVal('coaResidual', rec.residual);
    setVal('coaUsefulLife', rec.usefulLife);
    setVal('coaAnnualDep', rec.annualDep);
    setVal('coaAccDep', rec.accDep);
    setVal('coaNBV', rec.netBookValue);

    // Mark COA as generated in the backend
    if (rec.id) {
      fetch(`http://localhost:3000/assets/${rec.id}/mark-coa`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }).catch(err => console.warn('Could not mark COA as generated:', err));
    }

    const coaModal = document.getElementById('coaModal');
    if (coaModal) coaModal.style.display = 'block';
  };

  // Close modal
  const closeCoaModal = document.getElementById('closeCoaModal');
  if (closeCoaModal) {
    closeCoaModal.addEventListener('click', () => {
      const coaModal = document.getElementById('coaModal');
      if (coaModal) coaModal.style.display = 'none';
    });
  }

  window.addEventListener('click', (event) => {
    const coaModal = document.getElementById('coaModal');
    if (coaModal && event.target === coaModal) {
      coaModal.style.display = 'none';
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const coaModal = document.getElementById('coaModal');
      if (coaModal) coaModal.style.display = 'none';
    }
  });

  // Export button placeholder
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      alert('Export to PDF coming soon!');
    });
  }
});