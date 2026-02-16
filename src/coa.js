document.addEventListener('DOMContentLoaded', async () => {
  let records = [];
  let coaTemplateFile = null;

  // Load records
  try {
    const res = await fetch('http://localhost:3000/assets');
    records = res.ok ? await res.json() : JSON.parse(localStorage.getItem('depreciationRecords')) || [];
  } catch {
    records = JSON.parse(localStorage.getItem('depreciationRecords')) || [];
  }

  // Render records
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
        </tr>`;
    });
  }
  renderRecords();

  // Search
  const searchBar = document.getElementById('coaSearchBar');
  if (searchBar) {
    searchBar.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      const filtered = records.filter(r =>
        (r.property || '').toLowerCase().includes(q) ||
        (r.ppeClass || '').toLowerCase().includes(q) ||
        (r.accountCode || '').toLowerCase().includes(q)
      );
      renderRecords(filtered);
    });
  }

  // Template upload
  const templateInput = document.getElementById("coaTemplate");
  if (templateInput) {
    templateInput.addEventListener("change", e => {
      coaTemplateFile = e.target.files[0];
      const preview = document.createElement("div");
      preview.className = "template-preview";
      preview.textContent = `Selected template: ${coaTemplateFile.name}`;
      templateInput.parentNode.appendChild(preview);
    });
  }

  // Export with ExcelJS
  async function exportToExcel(rec) {
    if (!coaTemplateFile) {
      alert("Please upload a COA Excel template first.");
      return;
    }

    const ExcelJS = window.ExcelJS;
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await coaTemplateFile.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const sheet = workbook.worksheets[0];

    // Header fields (adjust to your template)
    sheet.getCell('C2').value = "DENR-PENRO";
    sheet.getCell('C3').value = "General Fund";
    sheet.getCell('C4').value = rec.property;
    sheet.getCell('C5').value = rec.accountCode;
    sheet.getCell('C6').value = rec.usefulLife;
    sheet.getCell('C7').value = rec.annualDep;

    // Ledger row (row 12 example)
    sheet.getCell('A12').value = rec.dateAcquired;
    sheet.getCell('B12').value = "Ref-001";
    sheet.getCell('C12').value = 1;
    sheet.getCell('D12').value = rec.cost;
    sheet.getCell('E12').value = rec.cost;
    sheet.getCell('F12').value = rec.accDep;
    sheet.getCell('G12').value = 0;
    sheet.getCell('H12').value = rec.netBookValue;
    sheet.getCell('I12').value = "None";
    sheet.getCell('J12').value = 0;

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `COA_${rec.property}.xlsx`;
    link.click();
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

  window.addEventListener('click', e => {
    const coaModal = document.getElementById('coaModal');
    if (coaModal && e.target === coaModal) {
      coaModal.style.display = 'none';
    }
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const coaModal = document.getElementById('coaModal');
      if (coaModal) coaModal.style.display = 'none';
    }
  });

  // Export button
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const propertyName = document.getElementById("coaProperty").value;
      const rec = records.find(r => r.property === propertyName);
      if (rec) {
        exportToExcel(rec);
      } else {
        alert("No record selected to export.");
      }
    });
  }
});
