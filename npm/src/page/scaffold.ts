// import "./scaffold.scss"
import {runOnHtmlDone, runOnPageBackFromCache, runOnPageDone} from "../util/tools"
import {initTopbar} from "../component/topbar"
import {initDrawer} from "../component/drawer"
import {checkUserTheme} from "../component/theme"
import {initLocalRepository} from "../repository/LocalRepository"
import {initHandwritingFont} from "../component/font/font"
import {initFab} from "../component/fab"
import {initTag, initTagTriggers} from "../component/tag"
import {initButton} from "../component/button"
import {initTable} from "../component/table";
import {initList} from "../component/list";
import {initText} from "../component/text";
import {loadGoogleAnalytics} from "../util/gtag";

runOnHtmlDone(() => {
    initLocalRepository()
    initHandwritingFont()
    initTopbar()
    checkUserTheme();
    initDrawer()
    initFab()
    initTag()
    initButton()
    initTable()
    initList()
    initText()
    initTagTriggers()
})

runOnPageDone(() => {
    loadGoogleAnalytics()
})

runOnPageBackFromCache(() => {
    checkUserTheme()
})
