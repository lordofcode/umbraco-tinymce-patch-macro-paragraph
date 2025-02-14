tinyMcePatchMacroMonitor = new TinyMcePatchMacroMonitor();
tinyMcePatchMacroMonitor.useTimeout = false;
tinyMcePatchMacroMonitor.MonitorTinyMceEditors();
var setupEvent = new SetupEvent();
tinymce.SetupEditor(setupEvent);
var beforeSetContentEvent = new BeforeSetContentEvent();
beforeSetContentEvent.set(ourMacroToInsert);
setupEvent.editor.BeforeSetContent(beforeSetContentEvent);
while (initialContent.indexOf('##INSERTMACRO##') > 0) {
    initialContent = initialContent.replace('##INSERTMACRO##', beforeSetContentEvent.content);
}
tinymce.activeEditor.setContent(initialContent);
var contentBefore = tinymce.activeEditor.getContent();
tinymce.activeEditor.SetContent(beforeSetContentEvent);
var contentAfter = tinymce.activeEditor.getContent();
while (contentBefore != contentAfter) {
    contentBefore = contentAfter;
    tinymce.activeEditor.SetContent(beforeSetContentEvent);
    var contentAfter = tinymce.activeEditor.getContent();
}
outputResult = tinymce.activeEditor.getContent();