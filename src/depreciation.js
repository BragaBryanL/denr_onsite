// Load records from localStorage
let records = JSON.parse(localStorage.getItem("depreciationRecords")) || [];

let ascending = false; // default: newest first

// Render table
function renderTable(data = records) {
  const tbody = document.querySelector("#depreciationTable tbody");
  tbody.innerHTML = "";
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
document.getElementById("searchBar").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = records.filter(rec =>
    rec.property.toLowerCase().includes(query) ||
    rec.ppeClass.toLowerCase().includes(query) ||
    rec.accountCode.toLowerCase().includes(query)
  );
  renderTable(filtered);
});

// Edit record (currently redirects, can be replaced with modal logic later)
function editRecord(index) {
  localStorage.setItem("editIndex", index);
  window.location.href = "data.html";
}

// Delete record
function deleteRecord(index) {
  records.splice(index, 1);
  localStorage.setItem("depreciationRecords", JSON.stringify(records));
  renderTable();
}

// Update summary cards
function updateSummary() {
  document.getElementById("totalAssets").textContent = records.length;
  const totalCost = records.reduce((sum, rec) => sum + rec.cost, 0);
  const totalNBV = records.reduce((sum, rec) => sum + rec.netBookValue, 0);
  document.getElementById("totalCost").textContent = totalCost.toLocaleString();
  document.getElementById("totalNBV").textContent = totalNBV.toLocaleString();
}

// Sort function
function sortRecords() {
  const sortBy = document.getElementById("sortBy").value;
  records.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    // Handle numbers vs strings vs dates
    if (sortBy === "dateAcquired") {
      valA = new Date(valA);
      valB = new Date(valB);
      return ascending ? valA - valB : valB - valA;
    } else if (!isNaN(valA) && !isNaN(valB)) {
      return ascending ? valA - valB : valB - valA;
    } else {
      return ascending
        ? valA.toString().localeCompare(valB.toString())
        : valB.toString().localeCompare(valA.toString());
    }
  });
  renderTable();
}

// Event listeners for sort controls
document.getElementById("sortBy").addEventListener("change", sortRecords);
document.getElementById("sortOrder").addEventListener("click", () => {
  ascending = !ascending;
  document.getElementById("sortOrder").textContent = ascending ? "⬆ Asc" : "⬇ Desc";
  sortRecords();
});

// Initial render with default sort (newest date first)
function initialRender() {
  document.getElementById("sortBy").value = "dateAcquired"; // default sort by date
  ascending = false; // descending (newest first)
  sortRecords();
}
initialRender();

// Dummy data for testing
if (records.length === 0) {
  records = [
    {
      property: "Laptop Dell XPS",
      ppeClass: "Information and Communication Technology Equipment",
      accountCode: "10605030",
      dateAcquired: "2022-05-15",
      cost: 50000,
      residual: 2500,
      usefulLife: 5,
      annualDep: 9500,
      accDep: 19000,
      netBookValue: 31000
    },
    {
      property: "Toyota Hilux",
      ppeClass: "Motor Vehicles",
      accountCode: "10604010",
      dateAcquired: "2020-03-10",
      cost: 1200000,
      residual: 60000,
      usefulLife: 7,
      annualDep: 165714,
      accDep: 497142,
      netBookValue: 702858
    },
    {
      property: "Office Chairs",
      ppeClass: "Furniture and Fixtures",
      accountCode: "10606010",
      dateAcquired: "2021-01-01",
      cost: 100000,
      residual: 5000,
      usefulLife: 10,
      annualDep: 9500,
      accDep: 28500,
      netBookValue: 71500
    }
  ];
  localStorage.setItem("depreciationRecords", JSON.stringify(records));
  initialRender();
}


let editIndex = null;

// Fill dropdowns correctly when editing
function editRecord(index) {
  editIndex = index;
  const rec = records[index];

  document.getElementById("editProperty").value = rec.property || "";
  document.getElementById("editPlace").value = rec.place || "PENRO"; // default
  document.getElementById("editDescription").value = rec.description || "";
  document.getElementById("editPpeClass").value = rec.ppeClass || "Office Equipment"; // default
  document.getElementById("editAccountCode").value = rec.accountCode || "";
  document.getElementById("editDateAcquired").value = rec.dateAcquired || "";
  document.getElementById("editCost").value = rec.cost || "";
  document.getElementById("editResidual").value = rec.residual || "";
  document.getElementById("editUsefulLife").value = rec.usefulLife || "";
  document.getElementById("editDepAmount").value = rec.cost - rec.residual || "";
  document.getElementById("editAnnualDep").value = rec.annualDep || "";
  document.getElementById("editAccDep").value = rec.accDep || "";
  document.getElementById("editNBV").value = rec.netBookValue || "";
  document.getElementById("editRemarks").value = rec.remarks || "";

  document.getElementById("editModal").style.display = "block";
}

// Close modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("editModal").style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === document.getElementById("editModal")) {
    document.getElementById("editModal").style.display = "none";
  }
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("editModal").style.display = "none";
  }
});

// Save changes
document.getElementById("editForm").addEventListener("submit", (e) => {
  e.preventDefault();

  // Update record with editable fields only
  records[editIndex].property = document.getElementById("editProperty").value;
  records[editIndex].place = document.getElementById("editPlace").value;
  records[editIndex].description = document.getElementById("editDescription").value;
  records[editIndex].ppeClass = document.getElementById("editPpeClass").value;
  records[editIndex].dateAcquired = document.getElementById("editDateAcquired").value;
  records[editIndex].cost = parseFloat(document.getElementById("editCost").value);
  records[editIndex].remarks = document.getElementById("editRemarks").value;

  // Auto-calculate values
  const cost = records[editIndex].cost;
  const residual = cost * 0.05; // example: 5% residual
  const usefulLife = 5; // example: fixed 5 years
  const depAmount = cost - residual;
  const annualDep = depAmount / usefulLife;
  const accDep = annualDep * 2; // example: assume 2 years passed
  const nbv = cost - accDep;

  records[editIndex].residual = residual;
  records[editIndex].usefulLife = usefulLife;
  records[editIndex].annualDep = annualDep;
  records[editIndex].accDep = accDep;
  records[editIndex].netBookValue = nbv;

  // Save to localStorage
  localStorage.setItem("depreciationRecords", JSON.stringify(records));

  // Refresh table
  renderTable();

  // Close modal
  document.getElementById("editModal").style.display = "none";
});

// Clear form
document.getElementById("clearForm").addEventListener("click", () => {
  document.getElementById("editForm").reset();
});