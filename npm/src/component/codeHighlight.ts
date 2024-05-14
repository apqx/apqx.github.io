import "./codeHighlight.scss"
import highlight from "highlight.js/lib/core"

export function init() {
    highlight.registerLanguage("bash", require("highlight.js/lib/languages/bash"))
    highlight.registerLanguage("c", require("highlight.js/lib/languages/c"))
    highlight.registerLanguage("csharp", require("highlight.js/lib/languages/csharp"))
    highlight.registerLanguage("cpp", require("highlight.js/lib/languages/cpp"))
    highlight.registerLanguage("css", require("highlight.js/lib/languages/css"))
    highlight.registerLanguage("xml", require("highlight.js/lib/languages/xml"))
    highlight.registerLanguage("json", require("highlight.js/lib/languages/json"))
    highlight.registerLanguage("java", require("highlight.js/lib/languages/java"))
    highlight.registerLanguage("javascript", require("highlight.js/lib/languages/javascript"))
    highlight.registerLanguage("kotlin", require("highlight.js/lib/languages/kotlin"))
    highlight.registerLanguage("markdown", require("highlight.js/lib/languages/markdown"))
    highlight.registerLanguage("python", require("highlight.js/lib/languages/python"))
    highlight.registerLanguage("ruby", require("highlight.js/lib/languages/ruby"))
    highlight.registerLanguage("rust", require("highlight.js/lib/languages/rust"))
    highlight.registerLanguage("scss", require("highlight.js/lib/languages/scss"))
    highlight.registerLanguage("sql", require("highlight.js/lib/languages/sql"))
    highlight.registerLanguage("shell", require("highlight.js/lib/languages/shell"))
    highlight.registerLanguage("swift", require("highlight.js/lib/languages/swift"))
    highlight.registerLanguage("typescript", require("highlight.js/lib/languages/typescript"))
    highlight.registerLanguage("yaml", require("highlight.js/lib/languages/yaml"))
    highlight.registerLanguage("groovy", require("highlight.js/lib/languages/groovy"))
    highlight.registerLanguage("gradle", require("highlight.js/lib/languages/gradle"))
    highlight.registerLanguage("http", require("highlight.js/lib/languages/http"))
    highlight.registerLanguage("dart", require("highlight.js/lib/languages/dart"))

    highlight.highlightAll()
}
