// Simple rules for PPE useful life
const usefulLifeMap = {
  "Office Equipment": 10,
  "Information and Communication Technology Equipment": 5,
  "Buildings": 20,
  "Motor Vehicles": 7,
  "Furniture and Fixtures": 10
};

// Example account codes per PPE class
const accountCodeMap = {
  "Office Equipment": "10605020",
  "Information and Communication Technology Equipment": "10605030",
  "Buildings": "10601010",
  "Motor Vehicles": "10604010",
  "Furniture and Fixtures": "10606010"
};

const form = document.getElementById("depreciationForm");

// Timeline Chart setup
const timelineCtx = document.getElementById("timelineChart");
let timelineChart;

// Auto-calculation logic
form.addEventListener("input", () => {
  const ppeClass = document.getElementById("ppeClass").value;
  const cost = parseFloat(document.getElementById("cost").value) || 0;
  const dateAcquired = new Date(document.getElementById("dateAcquired").value);

  // Auto-fill account code
  document.getElementById("accountCode").value = accountCodeMap[ppeClass] || "";

  // Useful life
  const usefulLife = usefulLifeMap[ppeClass] || 5;
  document.getElementById("usefulLife").value = usefulLife;

  // Residual value (5% of cost)
  const residualValue = cost * 0.05;
  document.getElementById("residualValue").value = residualValue.toFixed(2);

  // Depreciable amount
  const depreciableAmount = cost - residualValue;
  document.getElementById("depreciableAmount").value = depreciableAmount.toFixed(2);

  // Annual depreciation
  const annualDep = depreciableAmount / usefulLife;
  document.getElementById("annualDep").value = annualDep.toFixed(2);

  // Accumulated depreciation (years since acquisition × annualDep)
  let accDep = 0;
  if (!isNaN(dateAcquired.getTime())) {
    const today = new Date();
    const yearsElapsed = Math.floor((today - dateAcquired) / (1000 * 60 * 60 * 24 * 365));
    accDep = annualDep * yearsElapsed;
  }
  document.getElementById("accDep").value = accDep.toFixed(2);

  // Net Book Value
  const netBookValue = cost - accDep;
  document.getElementById("netBookValue").value = netBookValue.toFixed(2);

  // ===========================
  // Update Timeline Chart
  // ===========================
  if (cost > 0 && usefulLife > 0) {
    const labels = [];
    const values = [];
    let nbv = cost;

    for (let year = 1; year <= usefulLife; year++) {
      nbv -= annualDep;
      labels.push("Year " + year);
      values.push(Math.max(nbv, residualValue)); // NBV should not drop below residual
    }

    if (timelineChart) timelineChart.destroy();
    timelineChart = new Chart(timelineCtx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Net Book Value",
          data: values,
          borderColor: "#006400",
          backgroundColor: "rgba(0,100,0,0.2)",
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

// ===========================
// Save form to backend
// ===========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const record = {
    property: document.getElementById("property").value,
    place: document.getElementById("place").value,
    description: document.getElementById("description").value,
    ppeClass: document.getElementById("ppeClass").value,
    accountCode: document.getElementById("accountCode").value,
    dateAcquired: document.getElementById("dateAcquired").value,
    cost: parseFloat(document.getElementById("cost").value),
    residual: parseFloat(document.getElementById("residualValue").value),
    usefulLife: parseInt(document.getElementById("usefulLife").value),
    annualDep: parseFloat(document.getElementById("annualDep").value),
    accDep: parseFloat(document.getElementById("accDep").value),
    netBookValue: parseFloat(document.getElementById("netBookValue").value),
    remarks: document.getElementById("remarks").value
  };

  try {
    const res = await fetch("http://localhost:3000/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    });

    if (res.ok) {
      alert("Record saved successfully!");
      form.reset();

      // clear auto-calculated fields
      document.getElementById("accountCode").value = "";
      document.getElementById("residualValue").value = "";
      document.getElementById("usefulLife").value = "";
      document.getElementById("depreciableAmount").value = "";
      document.getElementById("annualDep").value = "";
      document.getElementById("accDep").value = "";
      document.getElementById("netBookValue").value = "";

      if (timelineChart) {
        timelineChart.destroy();
        timelineChart = null;
      }
    } else {
      alert("Error saving record.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Could not save record.");
  }
});

// ===========================
// Clear form
// ===========================
const clearBtn = document.getElementById("clearBtn");
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    form.reset(); // clears manual inputs

    // clear auto-calculated fields
    document.getElementById("accountCode").value = "";
    document.getElementById("residualValue").value = "";
    document.getElementById("usefulLife").value = "";
    document.getElementById("depreciableAmount").value = "";
    document.getElementById("annualDep").value = "";
    document.getElementById("accDep").value = "";
    document.getElementById("netBookValue").value = "";

    // clear chart preview
    if (timelineChart) {
      timelineChart.destroy();
      timelineChart = null;
    }
  });
}
