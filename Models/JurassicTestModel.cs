using Jurassic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TinyMceParagraphForMacroRemover.Models
{
    internal class JurassicTestModel
    {
        private readonly ScriptEngine _engine = new ScriptEngine();
        private readonly StringBuilder _scriptBuilder = new StringBuilder();
        private readonly string _expectedContent;


        public JurassicTestModel(string script, string macro, string initialContent, string expectedContent)
        {
            _scriptBuilder.AppendLine($"var initialContent='{EscapeForJavascript(initialContent)}';");
            _scriptBuilder.AppendLine($"var ourMacroToInsert='{EscapeForJavascript(macro)}';");
            _scriptBuilder.Append(script);
            _expectedContent = expectedContent.Replace("##INSERTMACRO##", macro);
        }

        private string EscapeForJavascript(string input)
        {
            return input.Replace("\r", "\\r").Replace("\n", "\\n");
        }

        public bool Validate()
        {
            _engine.Execute(_scriptBuilder.ToString());
            var result = _engine.GetGlobalValue<string>("outputResult");
            if (result == _expectedContent)
            {
                return true;
            }
            System.Diagnostics.Debug.WriteLine($"===== GENERATED RESULT =====");
            System.Diagnostics.Debug.WriteLine(result.ToString());
            System.Diagnostics.Debug.WriteLine($"===== EXPECTED RESULT =====");
            System.Diagnostics.Debug.WriteLine(_expectedContent);
            System.Diagnostics.Debug.WriteLine($"===== SOMETHING WENT WRONG IN THIS CASE =====");
            return false;
        }
    }
}
