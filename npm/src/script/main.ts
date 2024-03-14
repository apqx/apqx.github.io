import {runOnHtmlDone, runOnPageDone} from "./util/Tools";
import {initBasic} from "./part/basic";
import {initPost} from "./post";
import {checkJump} from "./part/jump";
import {initIndex} from "./index";

runOnHtmlDone(() => {
    initBasic()
    initIndex()
    initPost()
})

runOnPageDone(() => {
    checkJump()
})