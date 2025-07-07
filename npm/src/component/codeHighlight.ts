// import "./codeHighlight.scss"
import highlight from "highlight.js/lib/core"
import bash from "highlight.js/lib/languages/bash"
import c from "highlight.js/lib/languages/c"
import csharp from "highlight.js/lib/languages/csharp"
import cpp from "highlight.js/lib/languages/cpp"
import css from "highlight.js/lib/languages/css"
import scss from "highlight.js/lib/languages/scss"
import xml from "highlight.js/lib/languages/xml"
import json from "highlight.js/lib/languages/json"
import java from "highlight.js/lib/languages/java"
import javascript from "highlight.js/lib/languages/javascript"
import kotlin from "highlight.js/lib/languages/kotlin"
import markdown from "highlight.js/lib/languages/markdown"
import python from "highlight.js/lib/languages/python"
import ruby from "highlight.js/lib/languages/ruby"
import rust from "highlight.js/lib/languages/rust"
import sql from "highlight.js/lib/languages/sql"
import shell from "highlight.js/lib/languages/shell"
import swift from "highlight.js/lib/languages/swift"
import typescript from "highlight.js/lib/languages/typescript"
import yaml from "highlight.js/lib/languages/yaml"
import groovy from "highlight.js/lib/languages/groovy"
import gradle from "highlight.js/lib/languages/gradle"
import http from "highlight.js/lib/languages/http"
import dart from "highlight.js/lib/languages/dart"

export function init() {
    highlight.registerLanguage("bash", bash)
    highlight.registerLanguage("c", c)
    highlight.registerLanguage("csharp", csharp)
    highlight.registerLanguage("cpp", cpp)
    highlight.registerLanguage("css", css)
    highlight.registerLanguage("xml", xml)
    highlight.registerLanguage("json", json)
    highlight.registerLanguage("java", java)
    highlight.registerLanguage("javascript", javascript)
    highlight.registerLanguage("kotlin", kotlin)
    highlight.registerLanguage("markdown", markdown)
    highlight.registerLanguage("python", python)
    highlight.registerLanguage("ruby", ruby)
    highlight.registerLanguage("rust", rust)
    highlight.registerLanguage("scss", scss)
    highlight.registerLanguage("sql", sql)
    highlight.registerLanguage("shell", shell)
    highlight.registerLanguage("swift", swift)
    highlight.registerLanguage("typescript", typescript)
    highlight.registerLanguage("yaml", yaml)
    highlight.registerLanguage("groovy", groovy)
    highlight.registerLanguage("gradle", gradle)
    highlight.registerLanguage("http", http)
    highlight.registerLanguage("dart", dart)

    highlight.highlightAll()
}
