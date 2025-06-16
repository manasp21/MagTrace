class Visualizations {
    constructor() {
        this.data = [];
        this.currentChart = 'timeseries';
        this.margin = { top: 20, right: 80, bottom: 30, left: 70 };
        this.selectedIndices = [];
        this.brush = null;
        this.scales = {};
        
        this.initializeCharts();
        this.setupTabSwitching();
    }

    initializeCharts() {
        this.timeseriesChart = new TimeSeriesChart('timeseriesChart', this.margin);
        this.geographicChart = new GeographicChart('geographicChart', this.margin);
        this.threeDChart = new ThreeDChart('3dChart', this.margin);
        this.statisticsChart = new StatisticsChart('statisticsChart', this.margin);
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartType = e.target.dataset.chart;
                this.switchChart(chartType);
            });
        });
    }

    switchChart(chartType) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const chartContainers = document.querySelectorAll('.chart-container');

        tabButtons.forEach(btn => btn.classList.remove('active'));
        chartContainers.forEach(container => container.classList.remove('active'));

        document.querySelector(`[data-chart="${chartType}"]`).classList.add('active');
        document.getElementById(`${chartType}Chart`).classList.add('active');

        this.currentChart = chartType;
        this.renderCurrentChart();
    }

    updateData(data) {
        this.data = data;
        this.renderCurrentChart();
    }

    renderCurrentChart() {
        if (!this.data || this.data.length === 0) return;

        switch (this.currentChart) {
            case 'timeseries':
                this.timeseriesChart.render(this.data);
                break;
            case 'geographic':
                this.geographicChart.render(this.data);
                break;
            case '3d':
                this.threeDChart.render(this.data);
                break;
            case 'statistics':
                this.statisticsChart.render(this.data);
                break;
        }
    }

    getSelectedData() {
        if (this.selectedIndices.length === 0) return [];
        return this.data.filter((d, i) => 
            i >= this.selectedIndices[0] && i <= this.selectedIndices[1]
        );
    }

    setSelection(startIndex, endIndex) {
        this.selectedIndices = [startIndex, endIndex];
        this.updateSelectionInfo();
    }

    updateSelectionInfo() {
        const selectionInfo = document.getElementById('selectionInfo');
        
        if (this.selectedIndices.length === 0) {
            selectionInfo.innerHTML = '<p>No selection made</p>';
            return;
        }

        const selectedData = this.getSelectedData();
        const stats = this.calculateSelectionStats(selectedData);

        selectionInfo.innerHTML = `
            <div class="selection-details">
                <div class="stat-item">
                    <span class="stat-label">Selected Points:</span>
                    <span class="stat-value">${selectedData.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Time Range:</span>
                    <span class="stat-value">${selectedData[0].timestamp_pc} - ${selectedData[selectedData.length-1].timestamp_pc}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">B-field Stats:</span>
                    <span class="stat-value">
                        X: ${stats.bx.min.toFixed(1)} - ${stats.bx.max.toFixed(1)} nT<br>
                        Y: ${stats.by.min.toFixed(1)} - ${stats.by.max.toFixed(1)} nT<br>
                        Z: ${stats.bz.min.toFixed(1)} - ${stats.bz.max.toFixed(1)} nT
                    </span>
                </div>
            </div>
        `;
    }

    calculateSelectionStats(data) {
        const bx = data.map(d => d.b_x);
        const by = data.map(d => d.b_y);
        const bz = data.map(d => d.b_z);

        return {
            bx: { min: Math.min(...bx), max: Math.max(...bx), mean: bx.reduce((a, b) => a + b, 0) / bx.length },
            by: { min: Math.min(...by), max: Math.max(...by), mean: by.reduce((a, b) => a + b, 0) / by.length },
            bz: { min: Math.min(...bz), max: Math.max(...bz), mean: bz.reduce((a, b) => a + b, 0) / bz.length }
        };
    }
}

class TimeSeriesChart {
    constructor(containerId, margin) {
        this.containerId = containerId;
        this.margin = margin;
        this.svg = null;
        this.xScale = null;
        this.yScale = null;
        this.line = null;
        this.brush = null;
    }

    render(data) {
        const container = document.getElementById(this.containerId);
        container.innerHTML = '';

        const width = container.clientWidth - this.margin.left - this.margin.right;
        const height = container.clientHeight - this.margin.top - this.margin.bottom;

        this.svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', width + this.margin.left + this.margin.right)
            .attr('height', height + this.margin.top + this.margin.bottom);

        const g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        const parseTime = d3.timeParse('%M:%S.%L');
        const processedData = data.map((d, i) => ({
            ...d,
            index: i,
            time: parseTime(d.timestamp_pc) || new Date(i * 100)
        }));

        this.xScale = d3.scaleTime()
            .domain(d3.extent(processedData, d => d.time))
            .range([0, width]);

        this.yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => Math.max(d.b_x, d.b_y, d.b_z)))
            .range([height, 0]);

        const xAxis = d3.axisBottom(this.xScale);
        const yAxis = d3.axisLeft(this.yScale);

        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);

        g.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Magnetic Field (nT)');

        g.append('text')
            .attr('transform', `translate(${width / 2}, ${height + this.margin.bottom})`)
            .style('text-anchor', 'middle')
            .text('Time');

        this.line = d3.line()
            .x(d => this.xScale(d.time))
            .y(d => this.yScale(d.value))
            .curve(d3.curveLinear);

        const fields = [
            { key: 'b_x', class: 'line-bx', label: 'B_x' },
            { key: 'b_y', class: 'line-by', label: 'B_y' },
            { key: 'b_z', class: 'line-bz', label: 'B_z' }
        ];

        fields.forEach(field => {
            const lineData = processedData.map(d => ({
                time: d.time,
                value: d[field.key],
                index: d.index
            }));

            g.append('path')
                .datum(lineData)
                .attr('class', `line ${field.class}`)
                .attr('d', this.line);
        });

        const legend = g.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width - 100}, 20)`);

        fields.forEach((field, i) => {
            const legendItem = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            legendItem.append('line')
                .attr('x1', 0)
                .attr('x2', 15)
                .attr('class', `line ${field.class}`);

            legendItem.append('text')
                .attr('x', 20)
                .attr('y', 3)
                .text(field.label)
                .style('font-size', '12px');
        });

        this.brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on('brush end', (event) => {
                if (!event.selection) return;
                
                const [x0, x1] = event.selection;
                const startTime = this.xScale.invert(x0);
                const endTime = this.xScale.invert(x1);
                
                const startIndex = d3.bisector(d => d.time).left(processedData, startTime);
                const endIndex = d3.bisector(d => d.time).right(processedData, endTime);
                
                if (window.visualizations) {
                    window.visualizations.setSelection(startIndex, endIndex);
                }
            });

        g.append('g')
            .attr('class', 'brush')
            .call(this.brush);
    }
}

class GeographicChart {
    constructor(containerId, margin) {
        this.containerId = containerId;
        this.margin = margin;
    }

    render(data) {
        const container = document.getElementById(this.containerId);
        container.innerHTML = '';

        const width = container.clientWidth - this.margin.left - this.margin.right;
        const height = container.clientHeight - this.margin.top - this.margin.bottom;

        const svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', width + this.margin.left + this.margin.right)
            .attr('height', height + this.margin.top + this.margin.bottom);

        const g = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.lon))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.lat))
            .range([height, 0]);

        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain(d3.extent(data, d => Math.sqrt(d.b_x * d.b_x + d.b_y * d.b_y + d.b_z * d.b_z)));

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);

        g.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Latitude');

        g.append('text')
            .attr('transform', `translate(${width / 2}, ${height + this.margin.bottom})`)
            .style('text-anchor', 'middle')
            .text('Longitude');

        g.selectAll('.data-point')
            .data(data)
            .enter().append('circle')
            .attr('class', 'data-point')
            .attr('cx', d => xScale(d.lon))
            .attr('cy', d => yScale(d.lat))
            .attr('r', 2)
            .attr('fill', d => colorScale(Math.sqrt(d.b_x * d.b_x + d.b_y * d.b_y + d.b_z * d.b_z)))
            .attr('opacity', 0.7);
    }
}

class ThreeDChart {
    constructor(containerId, margin) {
        this.containerId = containerId;
        this.margin = margin;
    }

    render(data) {
        const container = document.getElementById(this.containerId);
        container.innerHTML = '<div class="chart-placeholder"><h4>3D Magnetic Field Visualization</h4><p>3D visualization would be implemented here using WebGL or Three.js</p></div>';
    }
}

class StatisticsChart {
    constructor(containerId, margin) {
        this.containerId = containerId;
        this.margin = margin;
    }

    render(data) {
        const container = document.getElementById(this.containerId);
        container.innerHTML = '';

        const stats = this.calculateStatistics(data);
        
        container.innerHTML = `
            <div class="statistics-panel">
                <h4>Dataset Statistics</h4>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h5>Magnetic Field Components</h5>
                        <table class="stats-table">
                            <tr><th></th><th>Min</th><th>Max</th><th>Mean</th><th>Std Dev</th></tr>
                            <tr><td>B_x</td><td>${stats.bx.min.toFixed(2)}</td><td>${stats.bx.max.toFixed(2)}</td><td>${stats.bx.mean.toFixed(2)}</td><td>${stats.bx.std.toFixed(2)}</td></tr>
                            <tr><td>B_y</td><td>${stats.by.min.toFixed(2)}</td><td>${stats.by.max.toFixed(2)}</td><td>${stats.by.mean.toFixed(2)}</td><td>${stats.by.std.toFixed(2)}</td></tr>
                            <tr><td>B_z</td><td>${stats.bz.min.toFixed(2)}</td><td>${stats.bz.max.toFixed(2)}</td><td>${stats.bz.mean.toFixed(2)}</td><td>${stats.bz.std.toFixed(2)}</td></tr>
                        </table>
                    </div>
                    <div class="stat-card">
                        <h5>Location</h5>
                        <table class="stats-table">
                            <tr><th></th><th>Min</th><th>Max</th><th>Range</th></tr>
                            <tr><td>Latitude</td><td>${stats.lat.min.toFixed(6)}</td><td>${stats.lat.max.toFixed(6)}</td><td>${(stats.lat.max - stats.lat.min).toFixed(6)}</td></tr>
                            <tr><td>Longitude</td><td>${stats.lon.min.toFixed(6)}</td><td>${stats.lon.max.toFixed(6)}</td><td>${(stats.lon.max - stats.lon.min).toFixed(6)}</td></tr>
                            <tr><td>Altitude</td><td>${stats.alt.min.toFixed(1)}</td><td>${stats.alt.max.toFixed(1)}</td><td>${(stats.alt.max - stats.alt.min).toFixed(1)}</td></tr>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    calculateStatistics(data) {
        const fields = ['b_x', 'b_y', 'b_z', 'lat', 'lon', 'altitude'];
        const stats = {};

        fields.forEach(field => {
            const values = data.map(d => d[field]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
            
            stats[field === 'altitude' ? 'alt' : field.replace('_', '')] = {
                min: Math.min(...values),
                max: Math.max(...values),
                mean: mean,
                std: Math.sqrt(variance)
            };
        });

        return stats;
    }
}

const visualizations = new Visualizations();
window.visualizations = visualizations;