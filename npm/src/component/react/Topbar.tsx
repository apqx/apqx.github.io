import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { IconButton, ToggleIconButton } from "./Button"
import "./Topbar.scss"
import type { IAnimationController } from "../animation/IAnimationController"
import { AnimationController } from "../animation/AnimationController"
import { getSectionTypeByPath, isIndexPage, SECTION_TYPE_LENS, SECTION_TYPE_OPERA, SECTION_TYPE_ORIGINAL, SECTION_TYPE_POETRY, SECTION_TYPE_PRINT, SECTION_TYPE_REPOST, SECTION_TYPE_SHARE, SECTION_TYPE_TAGS } from "../../base/constant"
import { createRoot, type Root } from "react-dom/client"
import { consoleInfo } from "../../util/log"
import { addDrawerToggleListener, removeDrawerToggleListener, toggleDrawer } from "./Drawer"
import { showAboutMeDialog } from "../dialog/AboutMeDialog"
import { isDarkThemeFromDocument, isDarkThemeFromSysAndUserSettings, toggleTheme } from "../theme"
import { getEventEmitter, type Events } from "../base/EventBus"
import { getLocalRepository } from "../../repository/LocalDb"
import { toggleElementClass } from "../../util/tools"

export function Topbar() {
    const headerRef = useRef<HTMLHeadElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const statusBarProtectorRef = useRef<HTMLDivElement>(null)
    const animationControllerRef = useRef<IAnimationController>(null)
    const [menuOpened, setMenuOpened] = useState<boolean>(false)
    const [darkThemeOn, setDarkThemeOn] = useState<boolean>(isDarkThemeFromDocument())

    const checkAndSetFixedTopbar = useCallback(() => {
        const fixedTopbar = getLocalRepository().getFixedTopbar()
        toggleElementClass(headerRef.current, "mdm-topbar-fixed", fixedTopbar)
    }, [])

    const checkAndSetTopbarBlur = useCallback(() => {
        // TODO: 根据是否启用 edge-to-edge 设置
        const blur = true

        toggleElementClass(headerRef.current, "mdm-topbar-blur", blur)
    }, [])

    const checkStatusBarProtector = useCallback(() => {
        const show = !getLocalRepository().getHideStatusBarBg()
        toggleElementClass(statusBarProtectorRef.current, "status-bar-protector--show", show)
    }, [])

    useEffect(() => {
        consoleInfo("Topbar useEffect init")
        animationControllerRef.current = new AnimationController(headerRef.current, "fade")
        animationControllerRef.current.toggleOpen(true)

        checkAndSetFixedTopbar()
        checkAndSetTopbarBlur()
        checkStatusBarProtector()

        const drawerToggleListener = {
            toggle: (opened: boolean) => {
                setMenuOpened(opened)
            }
        }
        addDrawerToggleListener(drawerToggleListener)

        const themeChangeHandler = (_data: Events["themeChanged"]) => {
            const isThemeDark = isDarkThemeFromSysAndUserSettings()
            setDarkThemeOn(isThemeDark)
        }

        const topbarFixedChangeHandler = (_data: Events["applyTopbarFixedChange"]) => {
            checkAndSetFixedTopbar()
        }

        const statusBarBgChangeHandler = (_data: Events["applyStatusBarBgChange"]) => {
            checkStatusBarProtector()
        }

        getEventEmitter().on("themeChanged", themeChangeHandler)
        getEventEmitter().on("applyTopbarFixedChange", topbarFixedChangeHandler)
        getEventEmitter().on("applyStatusBarBgChange", statusBarBgChangeHandler)

        return () => {
            console.info("Topbar useEffect cleanup")
            animationControllerRef.current?.destroy()
            removeDrawerToggleListener(drawerToggleListener)
            getEventEmitter().off("themeChanged", themeChangeHandler)
            getEventEmitter().off("applyTopbarFixedChange", topbarFixedChangeHandler)
            getEventEmitter().off("applyStatusBarBgChange", statusBarBgChangeHandler)
        }
    }, [checkAndSetFixedTopbar, checkAndSetTopbarBlur, checkStatusBarProtector])

    const titleMeta = useMemo(() => {
        const path = window.location.pathname
        const section = getSectionTypeByPath(path)
        const isIndex = isIndexPage(path)
        const classes = ["mdm-topbar__title"]
        let href = ""
        let title = ""
        switch (section.identifier) {
            case SECTION_TYPE_ORIGINAL.identifier: {
                classes.push("mdm-topbar__title-home")
                title = "ʕ•ᴥ•ʔ"
                href = "/"
                break
            }
            case SECTION_TYPE_REPOST.identifier: {
                title = "Repost"
                href = isIndex ? "/" : section.indexPath
                break
            }
            case SECTION_TYPE_POETRY.identifier: {
                title = "Poetry"
                href = isIndex ? "/" : section.indexPath
                break
            }
            case SECTION_TYPE_OPERA.identifier: {
                title = "Opera"
                href = isIndex ? "/" : section.indexPath
                break
            }
            case SECTION_TYPE_LENS.identifier: {
                title = "Lens"
                href = isIndex ? "/" : section.indexPath
                break
            }
            case SECTION_TYPE_TAGS.identifier: {
                title = "Tags"
                href = "/"
                break
            }
            case SECTION_TYPE_SHARE.identifier: {
                title = "Share"
                href = "/"
                break
            }
            case SECTION_TYPE_PRINT.identifier: {
                title = "Print"
                href = "/"
                break
            }
            default: {
                title = "Other"
                href = "/"
                break
            }
        }
        return {
            url: href,
            title: title,
            titleClasses: classes.join(" ")
        }
    }, [])

    const onClickMenu = useCallback(() => {
        toggleDrawer()
    }, [])

    const onClickTheme = useCallback(() => {
        toggleTheme()
    }, [])

    const onClickAboutMe = useCallback(() => {
        showAboutMeDialog()
    }, [])

    return (
        <>
            <header ref={headerRef} className="mdm-topbar fade fade--opening">
                <div ref={containerRef} className="mdm-topbar__container">
                    <div className="mdm-topbar__left">
                        <ToggleIconButton iconOff="menu" iconOn="menu_open" on={menuOpened} onClick={onClickMenu} classes={["mdm-topbar-icon"]} />
                        <a className={titleMeta.titleClasses} href={titleMeta.url}>{titleMeta.title}</a>
                    </div>
                    <div className="mdm-topbar__right">
                        <ToggleIconButton iconOff="dark_mode" iconOn="light_mode" on={darkThemeOn} onClick={onClickTheme} classes={["mdm-topbar-icon"]} />
                        <IconButton icon="face" onClick={onClickAboutMe} classes={["mdm-topbar-icon"]} />
                    </div>
                </div>
            </header>
            <div ref={statusBarProtectorRef} className="status-bar-protector"></div>
        </>
    )
}

let headerContainerE: HTMLDivElement | null = null
let root: Root | null = null

export function initHeader() {
    // 如果此时 html 还未加载完成，确实可能出现为 null 的情况
    if (document.readyState === "loading") return
    if (headerContainerE == null) {
        headerContainerE = document.querySelector("#header_container")
    }
    if (headerContainerE == null) return
    if (root == null) {
        root = createRoot(headerContainerE!)
        root.render(<Topbar />)
    }
}
