using System.Text;
using TinyMceParagraphForMacroRemover.Models;

namespace TinyMceParagraphForMacroRemover
{
    public class TinyMceMacroPatcherTest
    {
        private readonly StringBuilder _scriptBuilder = new StringBuilder();

        const string macro = "<div class=\"umb-macro-holder InsertProduct umb-macro-mce_1 mceNonEditable\"><!-- <?UMBRACO_MACRO macroAlias=\"InsertProduct\" /> --><ins><p> </p><div>Hier gaan we een product tonen!</div><p> </p></ins></div>";

        public TinyMceMacroPatcherTest()
        {
            _scriptBuilder.AppendLine(File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "scripts", "script-pre.js")));
            _scriptBuilder.AppendLine(File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "tinymce.paragraphformacro.remover.js")));
            _scriptBuilder.AppendLine(File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "scripts", "script-post.js")));
        }

        [Fact]
        public void InsertAtStartTest()
        {
            var model = new JurassicTestModel(_scriptBuilder.ToString(), macro, "<p>##INSERTMACRO##</p><p>Here is our text!</p>\r\n<p> </p>", "##INSERTMACRO##<p>Here is our text!</p>\r\n<p> </p>");
            Assert.True(model.Validate());
        }

        [Fact]
        public void InsertAtTheMiddle()
        {
            var model = new JurassicTestModel(_scriptBuilder.ToString(), macro, $"<p>Here is our text!</p>\r\n<p> </p><p>##INSERTMACRO##</p><p>Some more text here!</p>{macro}<p>That is all.</p>", $"<p>Here is our text!</p>\r\n<p> </p>##INSERTMACRO##<p>Some more text here!</p>{macro}<p>That is all.</p>");
            Assert.True(model.Validate());
        }


        [Fact]
        public void InsertAtEndTest()
        {
            var model = new JurassicTestModel(_scriptBuilder.ToString(), macro, "<p>Here is our text!</p>\r\n<p> </p><p>##INSERTMACRO##</p>", "<p>Here is our text!</p>\r\n<p> </p>##INSERTMACRO##");
            Assert.True(model.Validate());
        }


        [Fact]
        public void OnlyTextNoMacroTest()
        {
            var model = new JurassicTestModel(_scriptBuilder.ToString(), macro, "<p>Here is our text!</p>\r\n<p> </p><p> No Macro!</p>", "<p>Here is our text!</p>\r\n<p> </p><p> No Macro!</p>");
            Assert.True(model.Validate());
        }

        [Fact]
        public void EmptyContentTest()
        {
            var model = new JurassicTestModel(_scriptBuilder.ToString(), macro, "", "");
            Assert.True(model.Validate());
        }

        [Fact]
        public void MultipleMacrosTest()
        {
            var model = new JurassicTestModel(_scriptBuilder.ToString(), macro, "<p>##INSERTMACRO##</p><p>Here is our text!</p>\r\n<p> </p><p>##INSERTMACRO##</p>", "##INSERTMACRO##<p>Here is our text!</p>\r\n<p> </p>##INSERTMACRO##");
            Assert.True(model.Validate());
        }
    }
}