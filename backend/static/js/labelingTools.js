class LabelingTools {
    constructor() {
        this.currentTool = 'brush';
        this.currentLabelType = 'anomaly';
        this.labels = [];
        this.isLabeling = false;
        
        this.initializeTools();
        this.loadLabels();
    }

    initializeTools() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveTool(e.target.id.replace('Tool', ''));
            });
        });

        const labelTypeSelect = document.getElementById('labelType');
        labelTypeSelect.addEventListener('change', (e) => {
            this.currentLabelType = e.target.value;
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelLabeling();
            }
        });
    }

    setActiveTool(tool) {
        this.currentTool = tool;
        
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => btn.classList.remove('active'));
        
        document.getElementById(`${tool}Tool`).classList.add('active');
        
        this.updateCursor();
    }

    updateCursor() {
        const visualizationArea = document.getElementById('visualization');
        visualizationArea.style.cursor = this.getCursorForTool(this.currentTool);
    }

    getCursorForTool(tool) {
        const cursors = {
            'brush': 'crosshair',
            'lasso': 'grab',
            'polygon': 'cell'
        };
        return cursors[tool] || 'default';
    }

    async createLabel(startIndex, endIndex, labelType = null) {
        const dataset = dataLoader.getCurrentDataset();
        if (!dataset) {
            console.error('No dataset selected');
            return;
        }

        const labelData = {
            dataset: dataset.id,
            start_index: startIndex,
            end_index: endIndex,
            label_type: labelType || this.currentLabelType,
            confidence: 1.0,
            created_by: 'user',
            notes: ''
        };

        try {
            const label = await apiService.createLabel(labelData);
            this.labels.push(label);
            this.renderLabels();
            this.showLabelCreated(label);
            return label;
        } catch (error) {
            console.error('Failed to create label:', error);
            this.showError('Failed to create label');
            return null;
        }
    }

    async loadLabels() {
        const dataset = dataLoader.getCurrentDataset();
        if (!dataset) return;

        try {
            this.labels = await apiService.getLabels(dataset.id);
            this.renderLabels();
        } catch (error) {
            console.error('Failed to load labels:', error);
        }
    }

    renderLabels() {
        if (!window.visualizations || !window.visualizations.timeseriesChart) return;

        const svg = d3.select('#timeseriesChart svg');
        if (svg.empty()) return;

        svg.selectAll('.label-overlay').remove();

        const g = svg.select('g');
        const xScale = window.visualizations.timeseriesChart.xScale;
        const height = svg.attr('height') - window.visualizations.margin.top - window.visualizations.margin.bottom;

        if (!xScale) return;

        const data = dataLoader.getCurrentData();
        if (!data || data.length === 0) return;

        this.labels.forEach(label => {
            if (label.start_index >= 0 && label.end_index < data.length) {
                const startTime = new Date(data[label.start_index].timestamp_pc);
                const endTime = new Date(data[label.end_index].timestamp_pc);

                const labelGroup = g.append('g')
                    .attr('class', 'label-overlay')
                    .attr('data-label-id', label.id);

                labelGroup.append('rect')
                    .attr('x', xScale(startTime))
                    .attr('y', 0)
                    .attr('width', xScale(endTime) - xScale(startTime))
                    .attr('height', height)
                    .attr('class', `label-rect label-${label.label_type}`)
                    .attr('fill', this.getLabelColor(label.label_type))
                    .attr('opacity', 0.3)
                    .attr('stroke', this.getLabelColor(label.label_type))
                    .attr('stroke-width', 2);

                labelGroup.append('text')
                    .attr('x', xScale(startTime) + 5)
                    .attr('y', 15)
                    .text(`${label.label_type} (${label.confidence.toFixed(2)})`)
                    .attr('font-size', '12px')
                    .attr('fill', this.getLabelColor(label.label_type));

                labelGroup
                    .style('cursor', 'pointer')
                    .on('click', () => this.selectLabel(label))
                    .on('contextmenu', (event) => {
                        event.preventDefault();
                        this.showLabelContextMenu(event, label);
                    });
            }
        });
    }

    getLabelColor(labelType) {
        const colors = {
            'anomaly': '#ff6b6b',
            'normal': '#51cf66',
            'noise': '#ffd43b',
            'interference': '#ff922b'
        };
        return colors[labelType] || '#666';
    }

    selectLabel(label) {
        this.selectedLabel = label;
        this.highlightLabel(label);
        this.showLabelDetails(label);
    }

    highlightLabel(label) {
        d3.selectAll('.label-overlay').classed('selected', false);
        d3.select(`[data-label-id="${label.id}"]`).classed('selected', true);
    }

    showLabelDetails(label) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <h3>Label Details</h3>
            <div class="label-details">
                <div class="detail-row">
                    <label>Type:</label>
                    <select id="editLabelType">
                        <option value="anomaly" ${label.label_type === 'anomaly' ? 'selected' : ''}>Anomaly</option>
                        <option value="normal" ${label.label_type === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="noise" ${label.label_type === 'noise' ? 'selected' : ''}>Noise</option>
                        <option value="interference" ${label.label_type === 'interference' ? 'selected' : ''}>Interference</option>
                    </select>
                </div>
                <div class="detail-row">
                    <label>Confidence:</label>
                    <input type="number" id="editConfidence" value="${label.confidence}" min="0" max="1" step="0.1">
                </div>
                <div class="detail-row">
                    <label>Range:</label>
                    <span>${label.start_index} - ${label.end_index}</span>
                </div>
                <div class="detail-row">
                    <label>Created:</label>
                    <span>${new Date(label.created_at).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <label>Notes:</label>
                    <textarea id="editNotes" rows="3">${label.notes || ''}</textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="labelingTools.updateLabel(${label.id})">Update</button>
                    <button class="btn btn-secondary" onclick="labelingTools.deleteLabel(${label.id})">Delete</button>
                    <button class="btn" onclick="labelingTools.closeModal()">Cancel</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    showLabelContextMenu(event, label) {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.cssText = `
            position: fixed;
            top: ${event.clientY}px;
            left: ${event.clientX}px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            padding: 0.5rem 0;
        `;

        const menuItems = [
            { text: 'Edit Label', action: () => this.selectLabel(label) },
            { text: 'Delete Label', action: () => this.deleteLabel(label.id) },
            { text: 'Duplicate Label', action: () => this.duplicateLabel(label) }
        ];

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.text;
            menuItem.style.cssText = `
                padding: 0.5rem 1rem;
                cursor: pointer;
                border-bottom: 1px solid #eee;
            `;
            menuItem.addEventListener('click', () => {
                item.action();
                contextMenu.remove();
            });
            contextMenu.appendChild(menuItem);
        });

        document.body.appendChild(contextMenu);

        const closeMenu = () => {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 100);
    }

    async updateLabel(labelId) {
        const labelType = document.getElementById('editLabelType').value;
        const confidence = parseFloat(document.getElementById('editConfidence').value);
        const notes = document.getElementById('editNotes').value;

        try {
            const updatedLabel = await apiService.updateLabel(labelId, {
                label_type: labelType,
                confidence: confidence,
                notes: notes
            });

            const index = this.labels.findIndex(l => l.id === labelId);
            if (index !== -1) {
                this.labels[index] = updatedLabel;
            }

            this.renderLabels();
            this.closeModal();
            this.showSuccess('Label updated successfully');
        } catch (error) {
            console.error('Failed to update label:', error);
            this.showError('Failed to update label');
        }
    }

    async deleteLabel(labelId) {
        if (!confirm('Are you sure you want to delete this label?')) {
            return;
        }

        try {
            await apiService.deleteLabel(labelId);
            this.labels = this.labels.filter(l => l.id !== labelId);
            this.renderLabels();
            this.closeModal();
            this.showSuccess('Label deleted successfully');
        } catch (error) {
            console.error('Failed to delete label:', error);
            this.showError('Failed to delete label');
        }
    }

    async duplicateLabel(label) {
        const newLabel = {
            dataset: label.dataset,
            start_index: label.start_index,
            end_index: label.end_index,
            label_type: label.label_type,
            confidence: label.confidence,
            created_by: 'user',
            notes: `Copy of: ${label.notes || ''}`
        };

        try {
            const created = await apiService.createLabel(newLabel);
            this.labels.push(created);
            this.renderLabels();
            this.showSuccess('Label duplicated successfully');
        } catch (error) {
            console.error('Failed to duplicate label:', error);
            this.showError('Failed to duplicate label');
        }
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    cancelLabeling() {
        this.isLabeling = false;
        this.updateCursor();
    }

    showLabelCreated(label) {
        this.showSuccess(`${label.label_type} label created (${label.start_index}-${label.end_index})`);
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            background: #dc3545;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            background: #28a745;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    onDatasetChanged() {
        this.labels = [];
        this.selectedLabel = null;
        this.loadLabels();
    }
}

const labelingTools = new LabelingTools();
window.labelingTools = labelingTools;