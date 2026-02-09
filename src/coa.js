// Dummy records
const dummyRecords = [
  {
    property: "Laptop Dell XPS",
    ppeClass: "Other Land Improvements",
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

// Render records list
function renderRecords(data = dummyRecords) {
  const tbody = document.getElementById("recordsBody");
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
        <td><button onclick="generateCOA(${index})">Generate COA</button></td>
      </tr>
    `;
  });
}
renderRecords();

// Search filter
document.getElementById("coaSearchBar").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = dummyRecords.filter(rec =>
    rec.property.toLowerCase().includes(query) ||
    rec.ppeClass.toLowerCase().includes(query) ||
    rec.accountCode.toLowerCase().includes(query)
  );
  renderRecords(filtered);
});

// Generate COA Form
function generateCOA(index) {
  const rec = dummyRecords[index];

  document.getElementById("coaProperty").value = rec.property;
  document.getElementById("coaPpeClass").value = rec.ppeClass;
  document.getElementById("coaAccountCode").value = rec.accountCode;
  document.getElementById("coaDateAcquired").value = rec.dateAcquired;
  document.getElementById("coaCost").value = rec.cost;
  document.getElementById("coaResidual").value = rec.residual;
  document.getElementById("coaUsefulLife").value = rec.usefulLife;
  document.getElementById("coaAnnualDep").value = rec.annualDep;
  document.getElementById("coaAccDep").value = rec.accDep;
  document.getElementById("coaNBV").value = rec.netBookValue;

  document.getElementById("coaModal").style.display = "block";
}

// Close modal
document.getElementById("closeCoaModal").addEventListener("click", () => {
  document.getElementById("coaModal").style.display = "none";
});
window.addEventListener("click", (event) => {
  if (event.target === document.getElementById("coaModal")) {
    document.getElementById("coaModal").style.display = "none";
  }
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.getElementById("coaModal").style.display = "none";
  }
});

// Export button placeholder
document.getElementById("exportBtn").addEventListener("click", () => {
  alert("Export to PDF coming soon!");
});