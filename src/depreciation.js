document.addEventListener('DOMContentLoaded', async () => {
  // Load records from API, fallback to localStorage
  let records = [];
  try {
    const res = await fetch('http://localhost:3000/assets');
    if (res.ok) {
      records = await res.json();
      localStorage.setItem('depreciationRecords', JSON.stringify(records));
    } else {
      records = JSON.parse(localStorage.getItem('depreciationRecords')) || [];
    }
  } catch (err) {
    console.warn('Could not fetch from API, using localStorage:', err);
    records = JSON.parse(localStorage.getItem('depreciationRecords')) || [];
  }

  let ascending = false; // default: newest first

  // Render table
  function renderTable(data = records) {
    const tbody = document.querySelector('#depreciationTable tbody');
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
        <td>
          <button onclick="editRecord(${index})">Edit</button>
          <button onclick="deleteRecord(${index})">Delete</button>
        </td>
      </tr>
    `;
    });
    updateSummary();
  }

  // Search filter
  const searchBar = document.getElementById('searchBar');
  if (searchBar) {
    searchBar.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = records.filter(rec =>
        (rec.property || '').toString().toLowerCase().includes(query) ||
        (rec.ppeClass || '').toString().toLowerCase().includes(query) ||
        (rec.accountCode || '').toString().toLowerCase().includes(query)
      );
      renderTable(filtered);
    });
  }

  // Delete record (exposed globally for inline onclick)
  window.deleteRecord = function(index) {
    const rec = records[index];
    if (!rec) return;
    
    // Delete from API if record has an ID
    if (rec.id) {
      fetch(`http://localhost:3000/assets/${rec.id}`, { method: 'DELETE' })
        .catch(err => console.error('Error deleting from API:', err));
    }
    
    records.splice(index, 1);
    localStorage.setItem('depreciationRecords', JSON.stringify(records));
    renderTable();
  };

  // Update summary cards
  function updateSummary() {
    const totalAssetsEl = document.getElementById('totalAssets');
    if (totalAssetsEl) totalAssetsEl.textContent = records.length;

    const totalCost = records.reduce((sum, rec) => sum + (parseFloat(rec.cost) || 0), 0);
    const totalNBV = records.reduce((sum, rec) => sum + (parseFloat(rec.netBookValue) || 0), 0);
    const totalCostEl = document.getElementById('totalCost');
    const totalNBVEl = document.getElementById('totalNBV');
    if (totalCostEl) totalCostEl.textContent = totalCost.toLocaleString();
    if (totalNBVEl) totalNBVEl.textContent = totalNBV.toLocaleString();
  }

  // Sort function
  function sortRecords() {
    const sortByEl = document.getElementById('sortBy');
    if (!sortByEl) return;
    const sortBy = sortByEl.value;
    records.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle numbers vs strings vs dates
      if (sortBy === 'dateAcquired') {
        valA = new Date(valA);
        valB = new Date(valB);
        return ascending ? valA - valB : valB - valA;
      } else if (!isNaN(valA) && !isNaN(valB)) {
        return ascending ? valA - valB : valB - valA;
      } else {
        return ascending
          ? (valA || '').toString().localeCompare((valB || '').toString())
          : (valB || '').toString().localeCompare((valA || '').toString());
      }
    });
    renderTable();
  }

  // Event listeners for sort controls
  const sortByEl = document.getElementById('sortBy');
  if (sortByEl) sortByEl.addEventListener('change', sortRecords);

  const sortOrderBtn = document.getElementById('sortOrder');
  if (sortOrderBtn) {
    sortOrderBtn.addEventListener('click', () => {
      ascending = !ascending;
      sortOrderBtn.textContent = ascending ? '⬆ Asc' : '⬇ Desc';
      sortRecords();
    });
  }

  // Initial render with default sort (newest date first)
  function initialRender() {
    if (sortByEl) sortByEl.value = 'dateAcquired'; // default sort by date
    ascending = false; // descending (newest first)
    sortRecords();
  }

  // Dummy data for testing
  if (records.length === 0) {
    records = [
      {
        property: 'Laptop Dell XPS',
        ppeClass: 'Information and Communication Technology Equipment',
        accountCode: '10605030',
        dateAcquired: '2022-05-15',
        cost: 50000,
        residual: 2500,
        usefulLife: 5,
        annualDep: 9500,
        accDep: 19000,
        netBookValue: 31000
      },
      {
        property: 'Toyota Hilux',
        ppeClass: 'Motor Vehicles',
        accountCode: '10604010',
        dateAcquired: '2020-03-10',
        cost: 1200000,
        residual: 60000,
        usefulLife: 7,
        annualDep: 165714,
        accDep: 497142,
        netBookValue: 702858
      },
      {
        property: 'Office Chairs',
        ppeClass: 'Furniture and Fixtures',
        accountCode: '10606010',
        dateAcquired: '2021-01-01',
        cost: 100000,
        residual: 5000,
        usefulLife: 10,
        annualDep: 9500,
        accDep: 28500,
        netBookValue: 71500
      }
    ];
    localStorage.setItem('depreciationRecords', JSON.stringify(records));
    initialRender();
  } else {
    initialRender();
  }


  let editIndex = null;

  // Fill dropdowns correctly when editing
  window.editRecord = function(index) {
    editIndex = index;
    const rec = records[index] || {};

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined ? val : '';
    };

    setVal('editProperty', rec.property || '');
    setVal('editPlace', rec.place || 'PENRO');
    setVal('editDescription', rec.description || '');
    setVal('editPpeClass', rec.ppeClass || 'Office Equipment');
    setVal('editAccountCode', rec.accountCode || '');
    setVal('editDateAcquired', rec.dateAcquired || '');
    setVal('editCost', rec.cost || '');
    setVal('editResidual', rec.residual || '');
    setVal('editUsefulLife', rec.usefulLife || '');
    setVal('editDepAmount', rec.cost - rec.residual || '');
    setVal('editAnnualDep', rec.annualDep || '');
    setVal('editAccDep', rec.accDep || '');
    setVal('editNBV', rec.netBookValue || '');
    setVal('editRemarks', rec.remarks || '');

    const editModal = document.getElementById('editModal');
    if (editModal) editModal.style.display = 'block';
  };

  // Close modal
  const closeModal = document.getElementById('closeModal');
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      const editModal = document.getElementById('editModal');
      if (editModal) editModal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    const editModal = document.getElementById('editModal');
    if (editModal && e.target === editModal) {
      editModal.style.display = 'none';
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const editModal = document.getElementById('editModal');
      if (editModal) editModal.style.display = 'none';
    }
  });

  // Save changes
  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Update record with editable fields only
      const propEl = document.getElementById('editProperty');
      const placeEl = document.getElementById('editPlace');
      const descEl = document.getElementById('editDescription');
      const ppeEl = document.getElementById('editPpeClass');
      const dateEl = document.getElementById('editDateAcquired');
      const costEl = document.getElementById('editCost');
      const remarksEl = document.getElementById('editRemarks');

      if (!records[editIndex]) return;

      records[editIndex].property = propEl ? propEl.value : records[editIndex].property;
      records[editIndex].place = placeEl ? placeEl.value : records[editIndex].place;
      records[editIndex].description = descEl ? descEl.value : records[editIndex].description;
      records[editIndex].ppeClass = ppeEl ? ppeEl.value : records[editIndex].ppeClass;
      records[editIndex].dateAcquired = dateEl ? dateEl.value : records[editIndex].dateAcquired;
      records[editIndex].cost = costEl ? parseFloat(costEl.value) || 0 : records[editIndex].cost;
      records[editIndex].remarks = remarksEl ? remarksEl.value : records[editIndex].remarks;

      // Auto-calculate values
      const cost = parseFloat(records[editIndex].cost) || 0;
      const residual = cost * 0.05; // example: 5% residual
      const usefulLife = 5; // example: fixed 5 years
      const depAmount = cost - residual;
      const annualDep = usefulLife > 0 ? depAmount / usefulLife : 0;
      const accDep = annualDep * 2; // example: assume 2 years passed
      const nbv = cost - accDep;

      records[editIndex].residual = residual;
      records[editIndex].usefulLife = usefulLife;
      records[editIndex].annualDep = annualDep;
      records[editIndex].accDep = accDep;
      records[editIndex].netBookValue = nbv;

      // Save to localStorage
      localStorage.setItem('depreciationRecords', JSON.stringify(records));

      // Refresh table
      renderTable();

      // Close modal
      const editModal = document.getElementById('editModal');
      if (editModal) editModal.style.display = 'none';
    });
  }

  // Clear form
  const clearFormBtn = document.getElementById('clearForm');
  if (clearFormBtn && editForm) {
    clearFormBtn.addEventListener('click', () => {
      editForm.reset();
    });
  }

});
