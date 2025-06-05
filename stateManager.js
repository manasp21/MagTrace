class StateManager {
    constructor() {
        this.history = [];
        this.currentStateIndex = -1;
        this.maxHistory = 20; // Limit history to prevent memory issues
        this.currentAnnotation = null; // Tracks active annotation
    }

    saveState(data) {
        // Clone data to avoid reference issues
        const state = JSON.parse(JSON.stringify(data));
        
        // If we're not at the end of history, remove future states
        if (this.currentStateIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentStateIndex + 1);
        }
        
        // Add new state
        this.history.push(state);
        this.currentStateIndex = this.history.length - 1;
        
        // Trim history if it exceeds max length
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.currentStateIndex--;
        }
        
        this.updateButtonStates();
    }

    undo() {
        if (this.currentStateIndex > 0) {
            this.currentStateIndex--;
            this.applyCurrentState();
            return true;
        }
        return false;
    }

    redo() {
        if (this.currentStateIndex < this.history.length - 1) {
            this.currentStateIndex++;
            this.applyCurrentState();
            return true;
        }
        return false;
    }

    applyCurrentState() {
        if (this.currentStateIndex >= 0 && this.currentStateIndex < this.history.length) {
            const state = this.history[this.currentStateIndex];
            window.chartManager.updateData(state);
            this.updateButtonStates();
        }
    }

    updateButtonStates() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) undoBtn.disabled = this.currentStateIndex <= 0;
        if (redoBtn) redoBtn.disabled = this.currentStateIndex >= this.history.length - 1;
    }

    // Annotation state management
    startAnnotation(labelId, confidence) {
        this.currentAnnotation = {
            labelId,
            confidence,
            startTime: null,
            endTime: null
        };
        // Store current mouse position as start time
        // Actual implementation will capture this from chart events
    }

    setAnnotationStart(time) {
        if (this.currentAnnotation) {
            this.currentAnnotation.startTime = time;
        }
    }

    setAnnotationEnd(time) {
        if (this.currentAnnotation) {
            this.currentAnnotation.endTime = time;
            this.completeAnnotation();
        }
    }

    completeAnnotation() {
        if (!this.currentAnnotation) return;
        
        const { labelId, confidence, startTime, endTime } = this.currentAnnotation;
        if (startTime !== null && endTime !== null) {
            window.annotationManager.createAnnotation(startTime, endTime, labelId, confidence);
            
            // Update annotation display
            const visibleRange = window.chartManager.getVisibleRange();
            window.annotationRenderer.renderAnnotations(visibleRange);
            this.updateAnnotationList();
        }
        
        this.currentAnnotation = null;
    }

    cancelAnnotation() {
        this.currentAnnotation = null;
    }

    updateAnnotationList() {
        const listContainer = document.getElementById('annotationList');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        const annotations = window.annotationManager.getAllAnnotations();
        
        annotations.forEach(anno => {
            const label = window.labelManager.getAllLabels().find(l => l.id === anno.labelId);
            if (!label) return;
            
            const item = document.createElement('div');
            item.className = 'annotation-item p-2 mb-2 border-b border-stone-200 cursor-pointer';
            item.innerHTML = `
                <div class="flex justify-between">
                    <span class="font-medium" style="color: ${label.color}">${label.name}</span>
                    <span>${anno.confidence.toFixed(1)}</span>
                </div>
                <div class="text-sm">${new Date(anno.startTime).toLocaleTimeString()} - ${new Date(anno.endTime).toLocaleTimeString()}</div>
            `;
            
            item.addEventListener('click', () => {
                window.annotationRenderer.highlightAnnotation(anno.id);
            });
            
            listContainer.appendChild(item);
        });
    }
}

// Setup event listeners for undo/redo buttons (called from index.html)
document.getElementById('undoBtn')?.addEventListener('click', () => window.stateManager.undo());
document.getElementById('redoBtn')?.addEventListener('click', () => window.stateManager.redo());