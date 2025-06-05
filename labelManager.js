// labelManager.js - Manages label definitions and colors
const LABEL_STORAGE_KEY = 'magtrace-labels';

class LabelManager {
    constructor() {
        this.labels = this._loadLabels();
        this.nextColorIndex = 0;
        this.colorPalette = [
            '#D9B08C', '#FFCB9A', '#D1E8E2', '#9CC3D5', '#A3C6C4',
            '#B7D7D8', '#E2D1C3', '#F7D9C4', '#C9E4DE', '#C0D6DF'
        ];
    }

    _loadLabels() {
        const stored = localStorage.getItem(LABEL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    _saveLabels() {
        localStorage.setItem(LABEL_STORAGE_KEY, JSON.stringify(this.labels));
    }

    createLabel(name, parentId = null) {
        const newLabel = {
            id: `label-${Date.now()}`,
            name,
            parentId,
            color: this.colorPalette[this.nextColorIndex % this.colorPalette.length]
        };
        this.nextColorIndex++;
        this.labels.push(newLabel);
        this._saveLabels();
        return newLabel;
    }

    updateLabel(id, updates) {
        const label = this.labels.find(l => l.id === id);
        if (label) {
            Object.assign(label, updates);
            this._saveLabels();
            return true;
        }
        return false;
    }

    deleteLabel(id) {
        const index = this.labels.findIndex(l => l.id === id);
        if (index !== -1) {
            this.labels.splice(index, 1);
            this._saveLabels();
            return true;
        }
        return false;
    }

    getChildLabels(parentId) {
        return this.labels.filter(l => l.parentId === parentId);
    }

    getAllLabels() {
        return [...this.labels];
    }
}

export default new LabelManager();