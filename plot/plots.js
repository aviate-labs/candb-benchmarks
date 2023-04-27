import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(zoomPlugin);

const plots = document.getElementById("plots");

function newCanvas(id) {
    const plot = document.createElement('div');
    plot.className = 'plot';
    plot.style.width = '50%';
    plots.appendChild(plot);

    const canvas = document.createElement('canvas');
    plot.appendChild(canvas);
    canvas.id = id;
    return canvas;
}

function newChart(element, label, data, map) {
    new Chart(
        element,
        {
            type: 'line',
            data: {
                labels: data.map(row => row.size),
                datasets: [
                    {
                        label,
                        data: map(data)
                    }
                ]
            },
            options: {
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x'
                        },
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x'
                        }
                    }
                }
            }
        }
    );
}

const stats = [
    {
        id: "sib",
        url: require("../out/sib.csv"),
        query: true,
    }
];

(async function () {
    for (const stat of stats) {
        const rawData = await (await fetch(stat.url)).text();
        const data = rawData.split("\n").slice(1, -1).map(row => {
            const [size, time, cycles, price, instructions, heapSize, totalHeapSize] = row.split(",");
            return {
                size: parseInt(size),
                time: parseInt(time),
                cycles: parseInt(cycles),
                price: parseInt(price),
                instructions: parseInt(instructions),
                heapSize: parseInt(heapSize),
                totalHeapSize: parseInt(totalHeapSize)
            };
        });

        newChart(newCanvas(`${stat.id}HeapSize`), "Heap Size", data, data => data.map(row => row.heapSize));
        newChart(newCanvas(`${stat.id}TotalHeapSize`), "Total Heap Size", data, data => data.map(row => row.totalHeapSize));
        newChart(newCanvas(`${stat.id}Instructions`), "Instructions", data, data => data.map(row => row.instructions));
        newChart(newCanvas(`${stat.id}Cycles`), "Cycles", data, data => data.map(row => row.cycles));
    }
})();
