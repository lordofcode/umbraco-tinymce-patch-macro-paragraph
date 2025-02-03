# umbraco-tinymce-patch-macro-paragraph
Inserting a macro in the tinymce editor of Umbraco adds an unwanted paragraph before and after the inserted HTML


This script removes the surrounding empty paragraphs.

Warning: although tested, there might be some edge cases which are not handled correctly!

So be extremely carefull, test it on your local development-environment.

This is version 0.1 - an Alpha version. 

We will continue to validate the processing of different input-values and update the code to handle these situations.



Place these files in the folder /App_Plugins/TinyMceParagraphForMacroRemover

This will "autoload" the plugin in the backoffice.