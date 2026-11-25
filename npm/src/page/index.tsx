import "./index.scss"
import { runOnHtmlDone } from "../util/tools"
import { consoleInfo } from "../util/log"
import { createRoot } from "react-dom/client"
import { IndexLinearPosts } from "../component/react/IndexLinearPosts"
import { getSectionTypeByPath, SECTION_TYPE_OTHER } from "../base/constant"
import { IndexGridLens } from "../component/react/IndexGridLens"
import { IndexGridPosts } from "../component/react/IndexGridPosts"
import { StrictMode } from "react"

export function initIndex() {
    runOnHtmlDone(() => {
        initIndexList()
    })
}

function initIndexList() {
    const wrapperE = document.querySelector("#index-list-wrapper") as HTMLElement
    if (wrapperE == null) {
        return
    }

    const root = createRoot(wrapperE)
    const category = getSectionTypeByPath(window.location.pathname).identifier
    consoleInfo("Index category = " + category + ", path = " + window.location.pathname)
    if (category == SECTION_TYPE_OTHER.identifier) return

    if (wrapperE.classList.contains("index-list-wrapper")) {
        // 随笔、诗词、转载
        const cover = getLinearLoadedCover(wrapperE)
        root.render(
            <StrictMode>
                <IndexLinearPosts pageCover={cover?.cover} pageCoverDescription={cover?.coverDescription} pageTitle={cover?.pageTitle}
                    tag={""} category={category} />
            </StrictMode>
        )
    } else if (wrapperE.classList.contains("grid-index-list-wrapper")) {
        // 看剧
        // 读取描述，为 card 的内容
        const descriptionE = document.querySelector(".grid-index-li--description .grid-index-card")
        let descriptionHtml = ""
        if (descriptionE != null)
            descriptionHtml = descriptionE.innerHTML
        root.render(
            <StrictMode>
                <IndexGridPosts tag={""} category={category} pageDescriptionHtml={descriptionHtml} />
            </StrictMode>
        )
    } else if (wrapperE.classList.contains("lens-index-list-wrapper")) {
        // 透镜
        root.render(
            <StrictMode>
                <IndexGridLens tag={""} category={category} />
            </StrictMode>
        )
    }
}

function getLinearLoadedCover(wrapperE: HTMLElement) {
    const coverE = wrapperE.querySelector(".index-top-cover") as HTMLImageElement
    if (coverE != null) {
        const cover = coverE.src
        const coverDescription = coverE.alt
        const pageTitleE = wrapperE.querySelector(".index-top-card-text") as HTMLElement
        const pageTitle = pageTitleE?.textContent || ""
        return { cover, coverDescription, pageTitle }
    }
    return null
}