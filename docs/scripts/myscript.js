// myscripts.js

// Data configuration provided
const dataConfig = {
  "Banking": {
    "BAC": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/Banking/GS%20Historical%20Data_modified.csv",
    "GS": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/Banking/GS%20Historical%20Data_modified.csv",
    "MS": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/Banking/MS%20Historical%20Data_modified.csv",
    "JPM": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/Banking/JPM%20Historical%20Data_modified.csv",
    "WFC": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/Banking/WFC%20Historical%20Data_modified.csv"
  },
  "Healthcare and Pharma": {
    "AZN": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/Healthcare%20and%20Pharma/AZN%20Historical%20Data_modified.csv",
    "JNJ": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/Healthcare%20and%20Pharma/JNJ%20Historical%20data_modified.csv",
    "LLY": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/Healthcare%20and%20Pharma/LLY%20Historical%20Data_modified.csv",
    "MRK": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/Healthcare%20and%20Pharma/MRK%20Historical%20Data_modified.csv",
    "PFE": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/Healthcare%20and%20Pharma/PFE%20Historical%20Data_modified.csv"
  },
  "TECH": {
    "AAPL": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/TECH/AAPL%20Historical%20data_modified.csv",
    "GOOG": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/TECH/GOOG%20class%20C%20Historical%20data_modified.csv",
    "META": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/TECH/META%20CLASS%20A%20Historical%20data_modified.csv",
    "MSFT": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/TECH/MSFT%20Historical%20Data_modified.csv",
    "NVDA": "https://raw.githubusercontent.com/Saravanan1999/EDAVFinalProject/refs/heads/ResultsDataAnalysis/Datasets/TECH/NVDA%20historical%20data_modified.csv"
  }
};

const sectorSelect = document.getElementById('sector-select');
const stockSelect = document.getElementById('stock-select');

Object.keys(dataConfig).forEach(sector => {
  const opt = document.createElement('option');
  opt.value = sector;
  opt.text = sector;
  sectorSelect.appendChild(opt);
});

sectorSelect.addEventListener('change', () => {
  const sector = sectorSelect.value;
  stockSelect.innerHTML = "";
  Object.keys(dataConfig[sector]).forEach(stock => {
    const opt = document.createElement('option');
    opt.value = stock;
    opt.text = stock;
    stockSelect.appendChild(opt);
  });
  if (stockSelect.options.length > 0) {
    stockSelect.value = stockSelect.options[0].value;
    loadData();
  }
});

stockSelect.addEventListener('change', () => {
  loadData();
});

sectorSelect.value = Object.keys(dataConfig)[0];
sectorSelect.dispatchEvent(new Event('change'));

let currentData = [];
let eventsData = [];
let locked = false; 

function loadData() {
  const sector = sectorSelect.value;
  const stock = stockSelect.value;
  const url = dataConfig[sector][stock];

  d3.csv(url, d3.autoType).then(data => {

    data.sort((a,b) => a.Date - b.Date);

    currentData = data;
    drawLineChart(data);
    drawScatterplot(currentData);
    drawRecoveryAnalysis(currentData);
  });
}

function drawLineChart(data) {
    // Clear any existing SVG
    d3.select("#line-chart").html("");

    // Set up margins and dimensions
    const margin = { top: 20, right: 150, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Create a group element for margins
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define Events
    const events = [
        { name: "Notre-Dame Fire", start: "2019-04-15", end: "2019-04-16" },
        { name: "Covid-19 Declared Pandemic", start: "2020-03-11", end: "2023-05-05" },
        { name: "Vaccine Rollout Begins", start: "2020-12-14", end: "Ongoing" },
        { name: "Capitol Riot", start: "2021-01-06", end: "2021-01-06" },
        { name: "Russia Invades Ukraine", start: "2022-02-24", end: "Ongoing" },
        { name: "Israel-Hamas Conflict", start: "2023-10-07", end: "Ongoing" }
    ];

    // Parse event dates and handle "Ongoing" events
    events.forEach(e => {
        e.start = new Date(e.start);
        if (e.end === "Ongoing") {
            e.end = d3.max(data, d => d.Date);
        } else {
            e.end = new Date(e.end);
        }
    });

    // Determine the overall date range
    const dataMinDate = d3.min(data, d => d.Date);
    const dataMaxDate = d3.max(data, d => d.Date);
    const eventMaxDate = d3.max(events, e => e.end);
    const overallMinDate = d3.min([dataMinDate, d3.min(events, e => e.start)]);
    const overallMaxDate = d3.max([dataMaxDate, eventMaxDate]);

    // Add padding to the date domain
    const datePadding = (overallMaxDate - overallMinDate) * 0.05;
    const extendedMinDate = new Date(overallMinDate.getTime() - datePadding);
    const extendedMaxDate = new Date(overallMaxDate.getTime() + datePadding);

    // Define Scales
    const x = d3.scaleUtc()
        .domain([extendedMinDate, extendedMaxDate])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([
            d3.min(data, d => d.close) * 0.9,
            d3.max(data, d => d.close) * 1.1
        ])
        .range([height, 0]);

    // Define Color Scale for Events
    const eventColor = d3.scaleOrdinal()
        .domain(events.map(e => e.name))
        .range(d3.schemeCategory10);

    // Create Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("text-align", "left")
        .style("width", "200px")
        .style("padding", "8px")
        .style("font", "12px sans-serif")
        .style("background", "lightsteelblue")
        .style("border", "0px")
        .style("border-radius", "8px")
        .style("pointer-events", "none")
        .style("display", "none");

    // Add clip path
    const clipPath = svg.append("defs")
        .append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    // Create a group for clipped elements
    const chartGroup = g.append("g")
        .attr("clip-path", "url(#chart-area)");

    // Draw Event Overlays
    chartGroup.selectAll(".event-region")
        .data(events)
        .enter()
        .append("rect")
        .attr("class", "event-region")
        .attr("x", e => x(e.start))
        .attr("y", 0)
        .attr("width", e => x(e.end) - x(e.start))
        .attr("height", height)
        .attr("fill", e => eventColor(e.name))
        .attr("opacity", 0.3)
        .attr("pointer-events", "all")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 0.5);
            tooltip.style("display", "block")
                .html(`<strong>${d.name}</strong><br>${d.start.toDateString()} - ${d.end.toDateString()}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.3);
            tooltip.style("display", "none");
        });

    // Draw the line
    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.close));

    const path = chartGroup.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#007acc")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add data points with enhanced tooltips
    const dots = chartGroup.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 3)
        .attr("cx", d => x(d.Date))
        .attr("cy", d => y(d.close))
        .attr("fill", "#007acc")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("r", 5)
                .attr("fill", "red");
            
            tooltip.style("display", "block")
                .html(`
                    <strong>Date:</strong> ${d.Date.toDateString()}<br>
                    <strong>Open:</strong> $${d.open.toFixed(2)}<br>
                    <strong>Close:</strong> $${d.close.toFixed(2)}<br>
                    <strong>High:</strong> $${d.high.toFixed(2)}<br>
                    <strong>Low:</strong> $${d.low.toFixed(2)}<br>
                    <strong>Volume:</strong> ${d.volume.toLocaleString()}<br>
                    <strong>Daily Return:</strong> ${d.daily_return.toFixed(2)}%<br>
                    <strong>RSI:</strong> ${d.RSI.toFixed(2)}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("r", 3)
                .attr("fill", "#007acc");
            tooltip.style("display", "none");
        });

    // Add Axes
    const xAxis = g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    const yAxis = g.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    // Add Axis Labels
    svg.append("text")
        .attr("transform", `translate(${margin.left + width / 2}, ${height + margin.top + 40})`)
        .style("text-anchor", "middle")
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left - 50)
        .attr("x", 0 - (margin.top + height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Stock Close Price");

    // Add Legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + margin.left + 20}, ${margin.top})`);

    events.forEach((e, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`)
            .style("cursor", "pointer")
            .on("click", function() {
                const selectedEvent = e.name;
                const isVisible = d3.selectAll(`.event-region`).filter(d => d.name === selectedEvent).style("opacity") == 0.3;
                d3.selectAll(`.event-region`).filter(d => d.name === selectedEvent)
                    .transition()
                    .style("opacity", isVisible ? 0 : 0.3);
            });

        legendRow.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", eventColor(e.name))
            .attr("opacity", 0.3);

        legendRow.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(e.name)
            .style("font-size", "12px")
            .attr("text-anchor", "start");
    });

    // Add Zoom with modified behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .extent([[0, 0], [width, height]])
        .on("zoom", (event) => {
            const transform = event.transform;
            const newX = transform.rescaleX(x);
            const newY = transform.rescaleY(y);

            xAxis.call(d3.axisBottom(newX));
            yAxis.call(d3.axisLeft(newY));

            path.attr("d", d3.line()
                .x(d => newX(d.Date))
                .y(d => newY(d.close))
            );

            dots
                .attr("cx", d => newX(d.Date))
                .attr("cy", d => newY(d.close));

            chartGroup.selectAll(".event-region")
                .attr("x", e => newX(e.start))
                .attr("width", e => newX(e.end) - newX(e.start));
        });

    // Add zoom behavior to SVG
    svg.call(zoom);
}

function drawScatterplot(data) {
  d3.select("#scatterplot").html("");

  const margin = {top: 20, right: 20, bottom: 30, left: 50};
  const width = 800 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // For scatterplot, we might consider daily_return vs volatility
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d=>d.volatility)).nice()
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d=>d.daily_return)).nice()
    .range([height, 0]);

  g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
  g.append("g").call(d3.axisLeft(y));

  // Animate bubbles appearing
  const circles = g.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cx", d => x(d.volatility))
    .attr("cy", d => y(d.daily_return))
    .attr("r", 0)
    .attr("fill", "#69b3a2")
    .attr("opacity", 0.6)
    .transition()
    .duration(1000)
    .attr("r", 4);

  // Interaction: click on a bubble to trace its historical trajectory?
  // We'll add a tooltip and on-click highlight circle
  const tooltip = d3.select("body").append("div")
    .style("position","absolute")
    .style("background","#fff")
    .style("padding","5px")
    .style("border","1px solid #ccc")
    .style("display","none");

  g.selectAll("circle")
    .on("mouseover", (event,d) => {
      tooltip.style("display","inline")
        .html(`Date: ${d.Date.toDateString()}<br>Volatility: ${d.volatility.toFixed(2)}<br>Return: ${d.daily_return.toFixed(2)}%`);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX+10)+"px")
             .style("top", (event.pageY-20)+"px");
    })
    .on("mouseout", () => {
      tooltip.style("display","none");
    })
    .on("click", (event,d) => {
      // On click highlight historical trajectory in time
      highlightTrajectory(d.Date);
    });

  function highlightTrajectory(date) {
    // This is a mock function, for demonstration let's just highlight points after 'date'
    const filtered = data.filter(d => d.Date >= date);

    g.append("path")
      .datum(filtered)
      .attr("fill","none")
      .attr("stroke","red")
      .attr("stroke-width",2)
      .attr("d", d3.line()
        .x(d=>x(d.volatility))
        .y(d=>y(d.daily_return))
      );
  }
}

function drawRecoveryAnalysis(data) {
  d3.select("#recovery-analysis").html("");

  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const svg = d3.select("#recovery-analysis")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  data = data.sort((a, b) => a.Date - b.Date);

  const x = d3.scaleUtc()
    .domain(d3.extent(data, d => d.Date))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.close) * 0.9,
      d3.max(data, d => d.close) * 1.1
    ])
    .range([height, 0]);

  g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
  g.append("g").call(d3.axisLeft(y));

  const dayThreshold = 20;     
  const dropThreshold = 0.1;   

  let dips = [];
  let currentPeak = { Date: data[0].Date, close: data[0].close, index: 0 };

  for (let i = 1; i < data.length; i++) {
    if (data[i].close > currentPeak.close) {
      currentPeak = { Date: data[i].Date, close: data[i].close, index: i };
    }

    let daysSincePeak = (data[i].Date - currentPeak.Date) / (1000 * 60 * 60 * 24);
    let dropRatio = (currentPeak.close - data[i].close) / currentPeak.close;

    if (daysSincePeak > dayThreshold && dropRatio > dropThreshold) {

      let troughIndex = i;
      while (troughIndex < data.length - 1 && data[troughIndex + 1].close < data[troughIndex].close) {
        troughIndex++;
      }
      let troughPoint = data[troughIndex];

      let recoveryPoint = data.slice(troughIndex).find(d => d.close >= currentPeak.close);
      
      if (troughPoint && (troughPoint.close < currentPeak.close)) {
        dips.push({
          peak: currentPeak,
          trough: troughPoint,
          recovery: recoveryPoint || null
        });

        if (recoveryPoint) {
          currentPeak = { Date: recoveryPoint.Date, close: recoveryPoint.close, index: data.indexOf(recoveryPoint) };
          i = data.indexOf(recoveryPoint);
        } else {
          currentPeak = { Date: troughPoint.Date, close: troughPoint.close, index: troughIndex };
          i = troughIndex;
        }
      }
    }
  }

  dips.forEach(dip => {
    const eventDate = dip.trough.Date;
    const troughClose = dip.trough.close;
    const peakClose = dip.peak.close;

    g.append("line")
      .attr("x1", x(eventDate))
      .attr("x2", x(eventDate))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "red");

      if (dip.recovery) {
        const recoveryDate = dip.recovery.Date;
        const recoveryX = x(recoveryDate); 
        const textAnchor = recoveryX > width - 50 ? "end" : "start"; 
        const textOffsetX = recoveryX > width - 50 ? -5 : 5;
      
        g.append("line")
          .attr("x1", recoveryX)
          .attr("x2", recoveryX)
          .attr("y1", 0)
          .attr("y2", height)
          .attr("stroke", "green")
          .attr("stroke-width", 1.5); 
      
        const recoveryDays = (recoveryDate - eventDate) / (1000 * 60 * 60 * 24);
      
        g.append("text")
          .attr("x", recoveryX + textOffsetX) 
          .attr("y", y(peakClose))
          .attr("fill", "green")
          .attr("text-anchor", textAnchor) 
          .attr("dy", -5)
          .style("font-size", "10px") 
          .text(`Recovered in ${Math.round(recoveryDays)} days`);
      }
  });

  const line = d3.line()
    .x(d => x(d.Date))
    .y(d => y(d.close));

  const path = g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 2)
    .attr("d", line);

  const totalLength = path.node().getTotalLength();
  path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(3000)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);
}


