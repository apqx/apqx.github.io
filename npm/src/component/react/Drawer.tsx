import { useCallback, useEffect, useMemo, useRef } from "react"
import { IconButton } from "./Button"
import "./Drawer.scss"
import { Scrim, type ScrimController } from "./Scrim"
import type { IAnimationController } from "../animation/IAnimationController"
import { AnimationController } from "../animation/AnimationController"
import { createRoot } from "react-dom/client"
import { setupRipple } from "../ripple"
import { showSearchDialog } from "../dialog/SearchDialog"
import { showPreferenceDialog } from "../dialog/PreferenceDialog"
import { showAboutMeDialog } from "../dialog/AboutMeDialog"
import { clearFocusListener, toggleElementClass } from "../../util/tools"
import { getSectionTypeByPath, isNavigationSection, SECTION_TYPE_LENS, SECTION_TYPE_OPERA, SECTION_TYPE_ORIGINAL, SECTION_TYPE_POETRY, SECTION_TYPE_REPOST, SECTION_TYPE_TAGS } from "../../base/constant"
import { showInfoDialogAsync, showShareDialogAsync } from "../dialog/AsyncDialogTrigger"
import { DelayToTimeGap } from "../base/DelayToTimeGap"
import { consoleInfo } from "../../util/log"

export interface DrawerProps {
    drawerControllerRef: React.RefObject<DrawerController | null>
    toggleListener?: (open: boolean) => void
}

export interface DrawerController {
    open: () => void,
    close: () => void,
    opened: () => boolean
}

export interface DrawerControllerRef {
    current: DrawerController | null
}

export function Drawer(props: DrawerProps) {
    const containerRef = useRef<HTMLElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const scrimControllerRef = useRef<ScrimController>(null)
    const animationControllerRef = useRef<IAnimationController>(null)
    // const delayTask = useRef<DelayToNextFrame>(new DelayToNextFrame())
    const delayTaskRef = useRef<DelayToTimeGap>(new DelayToTimeGap(50))
    const toggleListenerRef = useRef<(open: boolean) => void>(props.toggleListener)

    useEffect(() => {
        toggleListenerRef.current = props.toggleListener
    }, [props.toggleListener])

    // 此操作不要频繁变化，所用到的闭包变量以 Ref 规避
    const toggleOpen = useCallback((open: boolean) => {
        if (open) {
            animationControllerRef.current?.toggleOpen(true)
            scrimControllerRef.current?.open()
            toggleElementClass(document.body, "drawer-scroll-lock", true)
        } else {
            animationControllerRef.current?.toggleOpen(false)
            scrimControllerRef.current?.close()
            toggleElementClass(document.body, "drawer-scroll-lock", false)
        }
        if (toggleListenerRef.current) {
            toggleListenerRef.current(open)
        }
    }, [])

    useEffect(() => {
        animationControllerRef.current = new AnimationController(containerRef.current, "drawer-slide")
        // 挂载时打开 drawer，之后由外部通过 controller 控制
        toggleOpen(true)
        const onDoubleClickListener = (_event: any) => {
            showInfoDialogAsync(() => {
                toggleOpen(false)
            })
        }
        headerRef.current?.addEventListener("dblclick", onDoubleClickListener)

        return () => {
            delayTaskRef.current.cancelPendingAction()
            animationControllerRef.current?.destroy()
            headerRef.current?.removeEventListener("dblclick", onDoubleClickListener)
        }
    }, [toggleOpen])

    useEffect(() => {
        props.drawerControllerRef.current = {
            open: () => {
                toggleOpen(true)
            },
            close: () => {
                toggleOpen(false)
            },
            opened: () => {
                return animationControllerRef.current?.isOpened() ?? false
            }
        }
        return () => {
            props.drawerControllerRef.current = null
        }
    }, [props.drawerControllerRef, toggleOpen])

    const sectionList: DrawerListItemProps[] = useMemo(() => {
        const section = getSectionTypeByPath(window.location.pathname)
        consoleInfo(`Drawer section is ${section.identifier}`)
        const list: DrawerListItemProps[] = [
            {
                text: SECTION_TYPE_ORIGINAL.name,
                icon: "palette",
                url: SECTION_TYPE_ORIGINAL.indexPath,
                selected: SECTION_TYPE_ORIGINAL.identifier == section.identifier || !isNavigationSection(section),
                onClick: undefined
            },
            {
                text: SECTION_TYPE_REPOST.name,
                icon: "auto_awesome",
                url: SECTION_TYPE_REPOST.indexPath,
                selected: SECTION_TYPE_REPOST.identifier == section.identifier,
                onClick: undefined
            },
            {
                text: SECTION_TYPE_POETRY.name,
                icon: "translate",
                url: SECTION_TYPE_POETRY.indexPath,
                selected: SECTION_TYPE_POETRY.identifier == section.identifier,
                onClick: undefined
            },
            {
                text: SECTION_TYPE_OPERA.name,
                icon: "photo_camera",
                url: SECTION_TYPE_OPERA.indexPath,
                selected: SECTION_TYPE_OPERA.identifier == section.identifier,
                onClick: undefined
            },
            {
                text: SECTION_TYPE_LENS.name,
                icon: "vrpano",
                url: SECTION_TYPE_LENS.indexPath,
                selected: SECTION_TYPE_LENS.identifier == section.identifier,
                onClick: undefined
            },
            {
                text: SECTION_TYPE_TAGS.name,
                icon: "local_offer",
                url: SECTION_TYPE_TAGS.indexPath,
                selected: SECTION_TYPE_TAGS.identifier == section.identifier,
                onClick: undefined
            },
        ]
        list.push(...[
            {
                text: "搜索",
                icon: "search",
                url: undefined,
                selected: false,
                onClick: () => {
                    showSearchDialog()
                    delayTaskRef.current.delay(() => {
                        toggleOpen(false)
                    })
                }
            },
            {
                text: "偏好",
                icon: "manage_accounts",
                url: undefined,
                selected: false,
                onClick: () => {
                    showPreferenceDialog()
                    delayTaskRef.current.delay(() => {
                        toggleOpen(false)
                    })
                }
            },
            {
                text: "关于我",
                icon: "face",
                url: undefined,
                selected: false,
                onClick: () => {
                    showAboutMeDialog()
                    delayTaskRef.current.delay(() => {
                        toggleOpen(false)
                    })
                }
            }
        ])
        return list
    }, [toggleOpen])

    const onClick = useCallback(() => {
        toggleOpen(false)
    }, [toggleOpen])


    const onCLickQrCodeIcon = useCallback(() => {
        showShareDialogAsync(() => {
            delayTaskRef.current.delay(() => {
                toggleOpen(false)
            })
        })
    }, [toggleOpen])

    const onClickNavigationIcon = useCallback(() => {
        delayTaskRef.current.delay(() => {
            toggleOpen(false)
        })
    }, [toggleOpen])

    return (
        <>
            <aside ref={containerRef} className="mdm-drawer drawer-slide">
                <div className="mdm-drawer__wrapper">
                    <div ref={headerRef} className="mdm-drawer__header">
                        <div className="mdm-drawer__header-text-container">
                            <span className="mdm-drawer__title">立泉的写字板</span>
                            <span className="mdm-drawer__subtitle">https://mudan.me</span>
                        </div>

                        <IconButton icon="qr_code" onClick={onCLickQrCodeIcon} />
                        <IconButton icon="side_navigation" onClick={onClickNavigationIcon} />
                    </div>
                    <div className="mdm-drawer__content">
                        <DrawerList items={sectionList} />
                    </div>
                </div>
            </aside>
            <Scrim controllerRef={scrimControllerRef} onClick={onClick} />
        </>
    )
}


export interface DrawerListProps {
    items: DrawerListItemProps[]
}

export function DrawerList(props: DrawerListProps) {
    return (
        <ul className="mdm-list mdm-drawer-list">
            {props.items.map((item, _index) => (
                <DrawerListItem key={item.text} text={item.text} icon={item.icon} url={item.url} selected={item.selected} onClick={item.onClick} />
            ))
            }
        </ul>
    )
}

export interface DrawerListItemProps {
    icon: string,
    text: string,
    url?: string,
    selected: boolean,
    onClick?: () => void
}

function DrawerListItem(props: DrawerListItemProps) {
    const linkRef = useRef<HTMLAnchorElement>(null)

    useEffect(() => {
        setupRipple(linkRef.current)
        linkRef.current?.addEventListener("focus", clearFocusListener)
        return () => {
            linkRef.current?.removeEventListener("focus", clearFocusListener)
        }
    }, [])

    const classes = useMemo(() => {
        const base = ["mdm-list-item mdm-drawer-list-item"]
        if (props.selected) {
            base.push("mdm-drawer-list-item-selected")
        }
        if (props.url == null || props.url.trim().length == 0) {
            base.push("clickable-empty-link")
        }
        return base.join(" ")
    }, [props.selected, props.url])

    return (
        <li>
            <a ref={linkRef} className={classes} href={props.url} onClick={props.onClick} tabIndex={-1}>
                <div>
                    <i className="material-symbols-rounded-variable mdm-list-item__icon">{props.icon}</i>
                    <span className="mdm-list-item__primary-text">{props.text}</span>
                </div>
            </a>
        </li>
    )
}

let drawerContainerE: HTMLDivElement | null = null
let drawerControllerRef: DrawerControllerRef | null = null

export interface DrawerToggleListener {
    toggle(open: boolean): void
}

const toggleListeners: Set<DrawerToggleListener> = new Set()

export function addDrawerToggleListener(listener: DrawerToggleListener) {
    toggleListeners.add(listener)
}

export function removeDrawerToggleListener(listener: DrawerToggleListener) {
    toggleListeners.delete(listener)
}


export function toggleDrawer() {
    // 如果此时 html 还未加载完成，确实可能出现为 null 的情况
    if (document.readyState === "loading") return
    if (drawerContainerE == null) {
        drawerContainerE = document.querySelector("#drawer_container")
    }
    if (drawerContainerE == null) return
    if (drawerControllerRef == null) {
        drawerControllerRef = { current: null } as DrawerControllerRef
        const root = createRoot(drawerContainerE!)
        root.render(<Drawer drawerControllerRef={drawerControllerRef} toggleListener={(open) => {
            toggleListeners.forEach(listener => {
                listener.toggle(open)
            })
        }} />)
    } else {
        if (drawerControllerRef.current?.opened()) {
            drawerControllerRef.current.close()
        } else {
            drawerControllerRef.current?.open()
        }
    }
}