let listOfSlices = [];

const container = document.getElementById("container");
const sorter = document.getElementById("sorter");
const submission = document.getElementById("submission");
const exportBox = document.getElementById("exportBox");

const submitButton = document.getElementById("submitButton");
const clearButton = document.getElementById("clearButton");
const sizeButton = document.getElementById("sizeForm");
const copyButton = document.getElementById("copyButton");

const exportPiechartDiv = document.getElementById("exportPiechartDivWrapper");

//autoAnimate(sorter);
//autoAnimate(exportPiechartDiv);

let exportPieChartSize = 300;
let divideOffset = 25;
const divideValue = document.getElementById("dividePoint");
const colorSlice = document.getElementById("colorSlice");

submitButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (!divideValue.value) {
    alert("enter a dividing value");
    return;
  }

  const divideNum = parseFloat(divideValue.value);

  if (divideNum < 1 || divideNum > 100) {
    alert("keep value within 1 and 100!");
    divideValue.value = "";
    return;
  }

  if (listOfSlices.find((slice) => slice.divideValue === divideNum)) {
    alert("the chart is already divided at that point");
    divideValue.value = "";
    return;
  }

  const imageUrl = document.getElementById("sliceImageUrl").value || null;

  const newSlice = new Slice(divideNum, colorSlice.value, imageUrl);
  addSlice(newSlice);

  divideValue.value = "";
  document.getElementById("sliceImageUrl").value = "";
});

clearButton.addEventListener("click", (e) => {
  e.preventDefault();
  clearSlices();
});

sizeButton.addEventListener("submit", (e) => {
  e.preventDefault();

  const newSize = document.getElementById("exportPieChartSize").value;
  if (newSize) {
    exportPieChartSize = newSize;
    resizeAllSlices();
  }
});

copyButton.addEventListener("click", (e) => {
  let exporttext = exportBox.textContent;

  navigator.clipboard
    .writeText(exporttext)
    .then(() => {
      const originalColor = copyButton.style.backgroundColor;
      copyButton.style.backgroundColor = "green";
      copyButton.textContent = "copied!";
      setTimeout(() => {
        copyButton.style.backgroundColor = originalColor;
        copyButton.textContent = "copy :3";
      }, 1000);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
});

class Slice {
  constructor(divideValue, color = "#FF0000", imageUrl = null) {
    this.divideValue = divideValue;
    this.color = color;
    this.imageUrl = imageUrl;
    this.div = null;
  }

  getPrev() {
    const index = listOfSlices.indexOf(this);
    return listOfSlices[index - 1] || null;
  }

  calculatePolarCoords() {
    const points = [];
    const prevSlice = this.getPrev();
    const startPercent = prevSlice
      ? prevSlice.divideValue + divideOffset
      : divideOffset;
    const endPercent = divideOffset + this.divideValue;

    const numPoints = 50;
    for (let i = 0; i <= numPoints; i++) {
      const percent =
        startPercent + ((endPercent - startPercent) * i) / numPoints;
      const theta = (2 * Math.PI * percent) / 100;
      const x = 50 + 50 * Math.cos(theta);
      const y = 50 + 50 * Math.sin(theta);
      points.push(`${x}% ${y}%`);
    }

    points.push("50% 50%");

    return points;
  }

  applyClipPath() {
    if (!this.div) return;
    const points = this.calculatePolarCoords();
    this.div.style.clipPath = `polygon(${points.join(", ")})`;
  }
}

function addSlice(slice) {
  listOfSlices.push(slice);
  createSliceDiv(slice);

  sortSlices();
  updateSliceListUI();
  refreshAllSlices();
  updateExportBox();
}

function removeSlice(index) {
  const slice = listOfSlices.splice(index, 1)[0];
  if (slice.div) slice.div.remove();

  sortSlices();
  updateSliceListUI();
  refreshAllSlices();
  updateExportBox();
}

function clearSlices() {
  listOfSlices.forEach((slice) => {
    if (slice.div) slice.div.remove();
  });
  listOfSlices = [];

  updateSliceListUI();
  updateExportBox();
}

function sortSlices() {
  listOfSlices.sort((a, b) => a.divideValue - b.divideValue);
}

function updateSliceListUI() {
  while (sorter.firstChild) sorter.removeChild(sorter.firstChild);

  listOfSlices.forEach((slice, index) => { 
    const cardDiv = document.createElement("div");
    cardDiv.className = "slice-item";
    cardDiv.className = "card mb-2 p-2";  

    const flexDiv = document.createElement("div");
    flexDiv.className = "d-flex justify-content-between align-items-center";
 
    const infoDiv = document.createElement("div");
    infoDiv.textContent = `#${index + 1} | divide: ${slice.divideValue}`;
 
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Remove";
    deleteButton.className = "btn btn-sm btn-danger";
    deleteButton.addEventListener("click", () => removeSlice(index));
 
    flexDiv.appendChild(infoDiv);
    flexDiv.appendChild(deleteButton);
    cardDiv.appendChild(flexDiv);
    sorter.appendChild(cardDiv);
  });
}


function createSliceDiv(slice) {
  exportPiechartDiv.style.width = `${exportPieChartSize}px`;
  exportPiechartDiv.style.height = `${exportPieChartSize}px`;

  const div = document.createElement("div");
  div.className = "pieSlice";

  if (slice.imageUrl) {
    div.style.backgroundImage = `url('${slice.imageUrl}')`;
    div.style.backgroundSize = "cover";
    div.style.backgroundPosition = "center";
  } else {
    div.style.backgroundColor = slice.color || "#FF0000";
  }

  div.style.minWidth = `${exportPieChartSize / 2}px`;
  div.style.minHeight = `${exportPieChartSize / 2}px`;
  div.style.width = `${exportPieChartSize}px`;
  div.style.height = `${exportPieChartSize}px`;
  div.style.position = "absolute";

  slice.div = div;

  exportPiechartDiv.appendChild(div);
}

function resizeAllSlices() {
  exportPiechartDiv.style.width = `${exportPieChartSize}px`;
  exportPiechartDiv.style.height = `${exportPieChartSize}px`;

  listOfSlices.forEach((slice) => {
    if (slice.div) {
      slice.div.style.minWidth = `${exportPieChartSize / 2}px`;
      slice.div.style.minHeight = `${exportPieChartSize / 2}px`;
      slice.div.style.width = `${exportPieChartSize}px`;
      slice.div.style.height = `${exportPieChartSize}px`;
    }
  });

  refreshAllSlices();
}

function refreshAllSlices() {
  listOfSlices.forEach((slice) => slice.applyClipPath());
  updateExportBox();
}

function updateExportBox() {
  exportBox.textContent = "";
  exportBox.textContent = setup.innerHTML;
}

Coloris({
  theme: "pill",
  themeMode: "auto",
  formatToggle: true,
  swatches: [
    "DarkSlateGray",
    "#2a9d8f",
    "#e9c46a",
    "coral",
    "rgb(231, 111, 81)",
    "Crimson",
    "#023e8a",
    "#0077b6",
    "hsl(194, 100%, 39%)",
    "#00b4d8",
    "#48cae4",
  ],
  onChange: (color, inputEl) => {
    console.log(`The new color is ${color}`);
  },
});
