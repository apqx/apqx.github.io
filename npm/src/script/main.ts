import { runOnHtmlDone, runOnPageBackFromCache, runOnPageDone } from "./util/Tools";
import { initBasic } from "./part/basic";
import { initPost } from "./post";
import { checkJump } from "./part/jump";
import { initIndex } from "./index";
import { loadGoogleAnalytics } from "./gtag";
import { checkUserTheme } from "./part/theme";

runOnHtmlDone(() => {
    initBasic()
    initIndex()
    initPost()
})

runOnPageDone(() => {
    checkJump()
    loadGoogleAnalytics()
})

runOnPageBackFromCache(() => {
    checkUserTheme()
})