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

    createAnnotation(startTime, endTime, labelId, confidence = 1.0, notes = '') {
        const newAnnotation = {
            id: `anno-${Date.now()}`,
            startTime,
            endTime,
            labelId,
            confidence,
            notes,
            createdAt: new Date().toISOString()
        };
        this.annotations.push(newAnnotation);
        this._saveAnnotations();
        return newAnnotation;
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
}

export default new AnnotationManager();