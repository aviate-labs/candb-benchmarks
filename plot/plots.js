import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(zoomPlugin);

const main = document.getElementById("main");
const options = document.getElementById("options");
options.addEventListener('change', () => {
    let selectedGroup = null;
    let selectedOption = null;
    for (const group of options.children) {
        for (const option of group.children) {
            if (option.selected) {
                selectedGroup = group;
                selectedOption = option;
                break;
            }
        }
    }

    var done = false;
    while (!done) {
        done = true;
        for (const elem of main.children) {
            if (elem.className == "plots") {
                main.removeChild(elem);
                done = false;
                break;
            }
        }
    }
    if (selectedGroup && selectedOption) {
        switch (selectedGroup.label) {
            case "Small": {
                switch (selectedOption.label) {
                    case "Batch": {
                        return display({
                            title: "Small Insertion Batch",
                            id: "sib",
                            url: require("../out/sib.csv"),
                        });
                    }
                    case "Query": {
                        return displayQuery({
                            title: "Small Query Single",
                            id: "sib_q",
                            queryUrl: require("../out/sib_q.csv"),
                            scanUrl: require("../out/sib_s.csv"),
                        })
                    }
                    case "Single": {
                        display({
                            title: "Small Insertion Single",
                            id: "si1",
                            url: require("../out/si1.csv"),
                        });
                        display({
                            title: "Small Update Single",
                            id: "su1",
                            url: require("../out/su1.csv"),
                        });
                        return display({
                            title: "Small Deletion Single",
                            id: "sd1",
                            url: require("../out/sd1.csv"),
                        });
                    }
                    case "Parallel": {
                        return display({
                            title: "Small Insertion Parallel",
                            id: "sip",
                            url: require("../out/sip.csv"),
                        });
                    }
                }
                return;
            }
            case "Medium": {
                switch (selectedOption.label) {
                    case "Batch": {
                        return display({
                            title: "Medium Insertion Batch",
                            id: "mib",
                            url: require("../out/mib.csv"),
                        });
                    }
                    case "Query": {
                        return displayQuery({
                            title: "Medium Query Single",
                            id: "mib_q",
                            queryUrl: require("../out/mib_q.csv"),
                            scanUrl: require("../out/mib_s.csv"),
                        })
                    }
                    case "Single": {
                        display({
                            title: "Medium Insertion Single",
                            id: "mi1",
                            url: require("../out/mi1.csv"),
                        });
                        return display({
                            title: "Medium Deletion Single",
                            id: "md1",
                            url: require("../out/md1.csv"),
                        });
                    }
                }
                return;
            }
            case "Large": {
                switch (selectedOption.label) {
                    case "Batch": {
                        return display({
                            title: "Large Insertion Batch",
                            id: "lib",
                            url: require("../out/lib.csv"),
                        });
                    }
                    case "Query": {
                        return displayQuery({
                            title: "Large Query Single",
                            id: "lib_q",
                            queryUrl: require("../out/lib_q.csv"),
                            scanUrl: require("../out/lib_s.csv"),
                        })
                    }
                    case "Single": {
                        display({
                            title: "Large Insertion Single",
                            id: "li1",
                            url: require("../out/li1.csv"),
                        });
                        return display({
                            title: "Small Deletion Single",
                            id: "ld1",
                            url: require("../out/ld1.csv"),
                        });
                    }

                }
                return;
            }
        }
    }
});

function newCanvas(plots, id) {
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
                            mode: 'x',
                            modifierKey: 'shift',
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                                modifierKey: 'shift'
                            },
                            pinch: {
                                enabled: true,
                                modifierKey: 'shift'
                            },
                            mode: 'x',
                        }
                    }
                }
            }
        }
    );
}

function display(stat) {
    (async () => {
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

        const hr = document.createElement('hr');
        hr.className = 'plots';
        main.appendChild(hr);

        const h = document.createElement('h2');
        h.className = 'plots';
        h.innerText = stat.title;
        main.appendChild(h);

        const plots = document.createElement('div');
        plots.className = 'plots';
        main.appendChild(plots);

        newChart(newCanvas(plots, `${stat.id}HeapSize`), "Heap Size", data, data => data.map(row => row.heapSize));
        newChart(newCanvas(plots, `${stat.id}TotalHeapSize`), "Total Heap Size", data, data => data.map(row => row.totalHeapSize));
        newChart(newCanvas(plots, `${stat.id}Instructions`), "Instructions", data, data => data.map(row => row.instructions));
        newChart(newCanvas(plots, `${stat.id}Cycles`), "Cycles", data, data => data.map(row => row.cycles));
        // newChart(newCanvas(plots, `${stat.id}Time`), "Time", data, data => data.map(row => row.time / 1_000_000));
    }
    )()
}

function displayQuery(stat) {
    (async () => {
        const rawQueryData = await (await fetch(stat.queryUrl)).text();
        const queryData = rawQueryData.split("\n").slice(1, -1).map(row => {
            const [size, time, instructions] = row.split(",");
            return {
                size: parseInt(size),
                time: parseInt(time),
                instructions: parseInt(instructions),
            };
        });

        const rawScanData = await (await fetch(stat.scanUrl)).text();
        const scanData = rawScanData.split("\n").slice(1, -1).map(row => {
            const [size, time, instructions] = row.split(",");
            return {
                size: parseInt(size),
                time: parseInt(time),
                instructions: parseInt(instructions),
            };
        });

        const hr = document.createElement('hr');
        hr.className = 'plots';
        main.appendChild(hr);

        const h = document.createElement('h2');
        h.className = 'plots';
        h.innerText = stat.title;
        main.appendChild(h);

        const plots = document.createElement('div');
        plots.className = 'plots';
        main.appendChild(plots);

        newChart(newCanvas(plots, `${stat.id}QueryInstructions`), "Q Instructions", queryData, queryData => queryData.map(row => row.instructions));
        newChart(newCanvas(plots, `${stat.id}QueryInstructions`), "S Instructions", scanData, scanData => scanData.map(row => row.instructions));
    }
    )()
}
