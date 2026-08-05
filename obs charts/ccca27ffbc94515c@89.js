function _1(md){return(
md`# data`
)}

function _data(){return(
[
  { Area: "North", Sales: 5, Profit: 2 },
  { Area: "East", Sales: 25, Profit: 8 },
  { Area: "West", Sales: 15, Profit: 6 },
  { Area: "South", Sales: 20, Profit: 5 },
  { Area: "Central", Sales: 10, Profit: 3 }
]
)}

function _3(md){return(
md`## Common Theme`
)}

function _theme(){return(
{
  color: "#4F46E5",
  background: "#F8FAFC",
  text: "#374151",
  font: "Inter, sans-serif"
}
)}

function _5(md){return(
md`# level1 template- chart.js`
)}

async function _Chart(require){return(
await require("chart.js@4.4.1/dist/chart.umd.js")
)}

function _7(Chart,data,theme)
{
  const canvas = document.createElement("canvas")

  new Chart.Chart(canvas, {
    type: "scatter",
    data: {
      datasets: [{
        label: "Sales vs Profit",
        data: data.map(d => ({
          x: d.Sales,
          y: d.Profit
        })),
        backgroundColor: theme.color,
        pointRadius: 6
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Sales" } },
        y: { title: { display: true, text: "Profit" } }
      }
    }
  })

  return canvas
}


function _8(md){return(
md`# Level 2 // plot.hq`
)}

async function _MyPlot(){return(
await import("https://cdn.jsdelivr.net/npm/@observablehq/plot/+esm")
)}

function _10(MyPlot,theme,data){return(
MyPlot.plot({
  width: 600,
  height: 400,
  style: {
    background: theme.background,
    color: theme.text,
    fontFamily: theme.font
  },
  marks: [
    MyPlot.dot(data, {
      x: "Sales",
      y: "Profit",
      fill: theme.color,
      r: 6
    })
  ]
})
)}

function _11(md){return(
md`# Level 3 // d3.js
`
)}

async function _d3(){return(
await import("https://cdn.jsdelivr.net/npm/d3/+esm")
)}

function _13(d3,theme,data)
{
  const width = 600
  const height = 400
  const margin = 50

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", theme.background)

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Sales)])
    .range([margin, width - margin])

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Profit)])
    .range([height - margin, margin])

  svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.Sales))
    .attr("cy", d => y(d.Profit))
    .attr("r", 6)
    .attr("fill", theme.color)

  svg.append("g")
    .attr("transform", `translate(0,${height - margin})`)
    .call(d3.axisBottom(x))

  svg.append("g")
    .attr("transform", `translate(${margin},0)`)
    .call(d3.axisLeft(y))

  return svg.node()
}


function _14(md){return(
md`# Level 4 / p5.js`
)}

async function _p5(){return(
await import("https://cdn.jsdelivr.net/npm/p5/+esm")
)}

function _16(html,p5,theme,data)
{
  const div = html`<div></div>`

  new p5.default(p => {

    p.setup = () => {
      p.createCanvas(600, 400)
      p.background(theme.background)

      data.forEach(d => {
        const x = p.map(d.Sales, 0, 25, 60, 540)
        const y = p.map(d.Profit, 0, 8, 340, 60)

        p.fill(theme.color)
        p.noStroke()
        p.circle(x, y, 12)
      })
    }

  }, div)

  return div
}


export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("data")).define("data", _data);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer("theme")).define("theme", _theme);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer("Chart")).define("Chart", ["require"], _Chart);
  main.variable(observer()).define(["Chart","data","theme"], _7);
  main.variable(observer()).define(["md"], _8);
  main.variable(observer("MyPlot")).define("MyPlot", _MyPlot);
  main.variable(observer()).define(["MyPlot","theme","data"], _10);
  main.variable(observer()).define(["md"], _11);
  main.variable(observer("d3")).define("d3", _d3);
  main.variable(observer()).define(["d3","theme","data"], _13);
  main.variable(observer()).define(["md"], _14);
  main.variable(observer("p5")).define("p5", _p5);
  main.variable(observer()).define(["html","p5","theme","data"], _16);
  return main;
}
