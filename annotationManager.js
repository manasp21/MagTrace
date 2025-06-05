// annotationManager.js - Handles annotation creation and editing
const ANNOTATION_STORAGE_KEY = 'magtrace-annotations';

class AnnotationManager {
    constructor() {
        this.annotations = this._loadAnnotations();
    }

    _loadAnnotations() {
        const stored = localStorage.getItem(ANNOTATION_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    _saveAnnotations() {
        localStorage.setItem(ANNOTATION_STORAGE_KEY, JSON.stringify(this.annotations));
    }

    createAnnotation(startTime, endTime, labelId, confidence = 1.0, notes = '', source = 'user', modelId = null) {
        const newAnnotation = {
            id: `anno-${Date.now()}`,
            startTime,
            endTime,
            labelId,
            confidence,
            notes,
            source,
            modelId,
            createdAt: new Date().toISOString()
        };
        this.annotations.push(newAnnotation);
        this._saveAnnotations();
        return newAnnotation;
    }

    /**
     * Creates a model-generated annotation
     * @param {number} startTime - Start time of annotation
     * @param {number} endTime - End time of annotation
     * @param {string} labelId - Label ID
     * @param {string} modelId - Model ID that generated the annotation
     * @param {number} confidence - Confidence score (0-1)
     * @param {string} notes - Additional notes
     * @returns {Object} The created annotation
     */
    createModelAnnotation(startTime, endTime, labelId, modelId, confidence = 1.0, notes = '') {
        return this.createAnnotation(startTime, endTime, labelId, confidence, notes, 'model', modelId);
    }

    /**
     * Converts a model annotation to a verified annotation
     * @param {string} annotationId - ID of the annotation to convert
     * @returns {boolean} True if successful, false otherwise
     */
    convertToVerified(annotationId) {
        const annotation = this.annotations.find(a => a.id === annotationId);
        if (annotation && annotation.source === 'model') {
            annotation.source = 'user';
            annotation.updatedAt = new Date().toISOString();
            this._saveAnnotations();
            return true;
        }
        return false;
    }

    /**
     * Gets annotations filtered by source
     * @param {string} source - 'user' or 'model'
     * @returns {Array} Filtered annotations
     */
    getAnnotationsBySource(source) {
        return this.annotations.filter(a => a.source === source);
    }

    updateAnnotation(id, updates) {
        const annotation = this.annotations.find(a => a.id === id);
        if (annotation) {
            Object.assign(annotation, updates);
            annotation.updatedAt = new Date().toISOString();
            this._saveAnnotations();
            return true;
        }
        return false;
    }

    deleteAnnotation(id) {
        const index = this.annotations.findIndex(a => a.id === id);
        if (index !== -1) {
            this.annotations.splice(index, 1);
            this._saveAnnotations();
            return true;
        }
        return false;
    }

    getAnnotationsInRange(startTime, endTime) {
        return this.annotations.filter(anno => 
            anno.startTime <= endTime && anno.endTime >= startTime
        );
    }

    getAllAnnotations() {
        return [...this.annotations];
    }

    getAnnotationsGroupedByLabel() {
        const grouped = {};
        this.annotations.forEach(annotation => {
            const labelId = annotation.labelId;
            if (!grouped[labelId]) {
                grouped[labelId] = [];
            }
            grouped[labelId].push(annotation);
        });
        return grouped;
    }

    /**
     * Gets model annotations that haven't been verified yet
     * @returns {Array} Unverified model annotations
     */
    getUnverifiedModelAnnotations() {
        return this.annotations.filter(a => a.source === 'model');
    }
}

export default new AnnotationManager();