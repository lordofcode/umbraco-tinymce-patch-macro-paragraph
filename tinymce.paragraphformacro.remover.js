// Author:      ing. Dirk Hornstra
// Date:        2025-02-13
// Version:     1.0
// Description: Inserting a macro in tinyMCE in Umbraco causes the <div>..</div> to become a child of <p>..</p>
//              Which is invalid and resolved by adding an empty paragraph before and after the inserted macro (HTML)
//              This script removes the surrounding <p>..</p> tags
// Disclaimer:  Tested with some cases, so use at your own risk. Code may be used and modified for tinetuning for your project(s).
class TinyMcePatchMacroFromSurroundingParagraphs {
    constructor() {
        this.startTagOfMacro = '<div class="umb-macro-holder';
        this.endTagOfMacro = '</ins></div>';
        this.startParagraph = '<p>';
        this.endParagraph = '</p>';
        this.macroPreFix = '';
        this.macroPostFix = '';
    }
    handleBeforeSetContent(content) {
        if (!this.isMacro(content)) {
            this.macroPreFix = ''; this.macroPostFix = '';
            return content;
        }
        var timeStamp = Date.now();
        this.macroPreFix = '<!-- INSERT MACRO ' + timeStamp + ':START -->'; this.macroPostFix = '<!-- INSERT MACRO ' + timeStamp + ':END -->';
        return this.macroPreFix + content + this.macroPostFix;
    }
    setModifiedContent(modifiedContent) { this.ModifiedContent = modifiedContent; }
    getPatchedContent() {
        if (this.macroPreFix == '' || this.macroPostFix == '') {
            return this.ModifiedContent;
        }
        if (this.ModifiedContent.indexOf(this.macroPreFix) < 0 || this.ModifiedContent.indexOf(this.macroPostFix) < 0) {
            return this.ModifiedContent;
        }
        // first: get the position where the macro is inserted (start)
        var insertStartPosition = this.ModifiedContent.indexOf(this.macroPreFix) + this.macroPreFix.length;
        // second: get the position where the macro starts
        var macroStartPosition = insertStartPosition + this.ModifiedContent.substring(insertStartPosition).indexOf(this.startTagOfMacro);
        // third: get the position where the insertion stops
        var insertEndPosition = this.ModifiedContent.indexOf(this.macroPostFix);
        // fourth: get the position of the preceding <p> tag
        var paragraphPrePosition = this.getParagraphPosition(true, insertStartPosition - this.macroPreFix.length);
        // fifth: get the position of the appended </p> tag
        var paragraphPostPosition = this.getParagraphPosition(false, insertEndPosition + this.macroPostFix.length);

        // patch the content. 
        var patchedContent = '';
        if (paragraphPrePosition > 0) {
            patchedContent = this.ModifiedContent.substring(0, paragraphPrePosition);
        }
        patchedContent += this.ModifiedContent.substring(macroStartPosition, insertEndPosition);
        if (paragraphPostPosition < this.ModifiedContent.length) {
            patchedContent += this.ModifiedContent.substring(paragraphPostPosition);
        }
        if (patchedContent == '') {
            return this.ModifiedContent;
        }
        return patchedContent;
    }
    getParagraphPosition(prePosition, position) {
        if (prePosition) {
            if (position - this.startParagraph.length < 0) {
                return position;
            }
            var startPosition = position - this.startParagraph.length;
            var selectedPart = this.ModifiedContent.substring(startPosition, startPosition + this.startParagraph.length).toString();
            if (selectedPart == this.startParagraph) {
                return startPosition;
            }
            return position;
        }
        var aftertPartIndex = this.ModifiedContent.substring(position).indexOf(this.endParagraph);
        if (aftertPartIndex < 0) {
            return position;
        }
        return position + aftertPartIndex + this.endParagraph.length;
    }
    isMacro(content) { return content.length >= (this.startTagOfMacro.length + this.endTagOfMacro.length) && content.substring(0, this.startTagOfMacro.length) == this.startTagOfMacro && content.substring(content.length - this.endTagOfMacro.length) == this.endTagOfMacro && content.indexOf(this.startTagOfMacro) == content.lastIndexOf(this.startTagOfMacro); }
}
class TinyMcePatchMacroMonitor {
    constructor() {
        this.hasConnectedSetup = false;
        this.patcher = new TinyMcePatchMacroFromSurroundingParagraphs();
        this.useTimeout = true;
    }
    MonitorTinyMceEditors() {
        try {
            if (!tinymce || this.hasConnectedSetup) {
                return "no tinymce or already connected";
            }
            this.hasConnectedSetup = true;
            tinymce.on('SetupEditor', function (event) {
                tinyMcePatchMacroMonitor.MonitorBeforeSetContentEvent(event.editor);
            });
        } catch (e) {
            /* this is a patch-script. so we don't want to break other things. if something goes wrong here, suppress the error. */
        }
    }
    MonitorBeforeSetContentEvent(editor) {
        editor.on('BeforeSetContent', function (e) {
            var content = tinyMcePatchMacroMonitor.patcher.handleBeforeSetContent(e.content);
            if (content == e.content) {
                return;
            }
            e.content = content;
            tinymce.activeEditor.on('SetContent', function (e) {
                if (tinyMcePatchMacroMonitor.useTimeout) {
                    setTimeout(function () {
                        tinyMcePatchMacroMonitor.HandleContentPatching();
                    }, 1000);
                }
                else {
                    tinyMcePatchMacroMonitor.HandleContentPatching();
                }
            });            
        });
    }
    HandleContentPatching() {
        var currentContent = tinymce.activeEditor.getContent();
        tinyMcePatchMacroMonitor.patcher.setModifiedContent(currentContent);
        var patchedContent = tinyMcePatchMacroMonitor.patcher.getPatchedContent();
        if (patchedContent == currentContent) { return; }
        tinymce.activeEditor.setContent(patchedContent);
    }
}
var tinyMcePatchMacroMonitor = new TinyMcePatchMacroMonitor();
app.run(function (eventsService) {
    eventsService.on("editorState.changed", function (event, args) {
        tinyMcePatchMacroMonitor.MonitorTinyMceEditors();
    });
});