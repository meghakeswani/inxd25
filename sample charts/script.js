const datasetPath = 'camera_dataset.csv';

const fallbackData = [
  { model: 'Canon PowerShot 600', releaseDate: 1996, maxResolution: 832 },
  { model: 'Canon PowerShot A10', releaseDate: 2001, maxResolution: 1280 },
  { model: 'Canon PowerShot A300', releaseDate: 2003, maxResolution: 2048 },
  { model: 'Canon PowerShot A420', releaseDate: 2006, maxResolution: 2272 },
  { model: 'Canon PowerShot A650 IS', releaseDate: 2007, maxResolution: 4000 },
  { model: 'Canon EOS 10D', releaseDate: 2003, maxResolution: 3072 },
  { model: 'Canon EOS 20D', releaseDate: 2004, maxResolution: 3504 },
  { model: 'Canon EOS 5D', releaseDate: 2005, maxResolution: 4368 },
  { model: 'Canon EOS-1Ds', releaseDate: 2002, maxResolution: 4064 },
  { model: 'Canon EOS-1Ds Mark III', releaseDate: 2007, maxResolution: 5616 },
  { model: 'Canon PowerShot G1', releaseDate: 2000, maxResolution: 2048 },
  { model: 'Canon PowerShot G9', releaseDate: 2007, maxResolution: 4000 }
];

function parseCsv(text) {
  const rows = text.trim().split('\n').slice(1);
  return rows.map((row) => {
    const [model, releaseDate, maxResolution] = row.split(',');
    return {
      model,
      releaseDate: Number(releaseDate),
      maxResolution: Number(maxResolution),
    };
  });
}

async function loadData() {
  try {
    const response = await fetch(datasetPath);
    if (!response.ok) throw new Error('CSV not available');
    const text = await response.text();
    return parseCsv(text);
  } catch (error) {
    return fallbackData;
  }
}

function createChartJs(data) {
  const ctx = document.getElementById('chartjs-chart').getContext('2d');
  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Camera Max Resolution',
        data: data.map((d) => ({ x: d.releaseDate, y: d.maxResolution, label: d.model })),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        pointRadius: 3,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'Release Date' } },
        y: { title: { display: true, text: 'Max Resolution' } }
      }
    }
  });
}

function createPlotly(data) {
  const traces = [{
    type: 'scatter',
    mode: 'markers',
    x: data.map((d) => d.releaseDate),
    y: data.map((d) => d.maxResolution),
    text: data.map((d) => d.model),
    marker: { size: 6, color: '#ff7f0e' }
  }];

  Plotly.newPlot('plotly-chart', traces, {
    title: 'Release Date vs Max Resolution',
    xaxis: { title: 'Release Date' },
    yaxis: { title: 'Max Resolution' }
  });
}

function createD3(data) {
  const svg = d3.select('#d3-chart');
  const width = 500;
  const height = 320;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  svg.selectAll('*').remove();
  const chart = svg
    .attr('viewBox', `0 0 ${width} ${height}`)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([d3.min(data, d => d.releaseDate) - 1, d3.max(data, d => d.releaseDate) + 1])
    .range([0, width - margin.left - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.maxResolution) + 200])
    .range([height - margin.top - margin.bottom, 0]);

  chart.append('g')
    .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(8));

  chart.append('g').call(d3.axisLeft(y).ticks(6));

  chart.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => x(d.releaseDate))
    .attr('cy', d => y(d.maxResolution))
    .attr('r', 3)
    .attr('fill', '#2ca02c');

  chart.append('text')
    .attr('x', (width - margin.left - margin.right) / 2)
    .attr('y', height - margin.top - margin.bottom + 35)
    .attr('text-anchor', 'middle')
    .text('Release Date');

  chart.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -((height - margin.top - margin.bottom) / 2))
    .attr('y', -35)
    .attr('text-anchor', 'middle')
    .text('Max Resolution');
}

function createP5(data) {
  const sketch = (p) => {
    p.setup = () => {
      p.createCanvas(500, 320);
      p.noLoop();
    };

    p.draw = () => {
      p.background(255);
      p.stroke(140);
      p.strokeWeight(1);
      p.line(40, 280, 460, 280);
      p.line(40, 280, 40, 40);

      const minYear = d3.min(data, (d) => d.releaseDate);
      const maxYear = d3.max(data, (d) => d.releaseDate);
      const minRes = 0;
      const maxRes = d3.max(data, (d) => d.maxResolution) + 200;

      data.forEach((point) => {
        const x = p.map(point.releaseDate, minYear, maxYear, 40, 460);
        const y = p.map(point.maxResolution, minRes, maxRes, 280, 40);
        p.fill(200, 100, 100);
        p.noStroke();
        p.circle(x, y, 5);
      });
    };
  };

  new p5(sketch, 'p5-chart');
}

loadData().then((data) => {
  createChartJs(data);
  createPlotly(data);
  createD3(data);
  createP5(data);
});
