var outputResult = 'INITIAL RESULT';
class App {
    run() {
    }
}
class SetupEvent {
    constructor() {
        this.editor = activeEditor;
    }
}
class BeforeSetContentEvent {
    set(content) {
        this.content = content;
    }
}
class TinyMceEditor {
    on(a, e) {
        if (a == 'BeforeSetContent') {
            this.BeforeSetContent = e;
        }
        if (a == 'SetContent') {
            this.SetContent = e;
        }
    }
    setContent(c) {
        this.content = c;
    }
    getContent() {
        return this.content;
    }
}
class TinyMce {
    constructor() {
        this.activeEditor = activeEditor;
    }
    on(a, e) {
        this.SetupEditor = e;
    }
}
var app = new App();
var activeEditor = new TinyMceEditor();
var tinymce = new TinyMce();