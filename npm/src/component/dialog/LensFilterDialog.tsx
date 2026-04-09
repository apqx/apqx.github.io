import "./LensFilterDialog.scss"
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { BaseDialog, LENS_FILTER_DIALOG_WRAPPER_ID, showDialog, type ActionBtn, type BaseDialogOpenProps } from "./BaseDialog";
import { LensFilterDialogViewModel, type Category, type Tag } from "./LensFilterDialogViewModel";
import { SmoothCollapse } from "../react/SmoothCollapse";
import { CheckableTag } from "../react/CheckableTag";
import { LoadingHint } from "../react/LoadingHint";
import { consoleDebug } from "../../util/log";
import { getEventEmitter } from "../base/EventBus";

export function LensFilterDialog(props: BaseDialogOpenProps) {
    const viewModel = useMemo(() => new LensFilterDialogViewModel(), [])

    const state = useSyncExternalStore(viewModel.subscribe, () => viewModel.state)

    useEffect(() => {
        consoleDebug("LensFilterDialog useEffect")
        viewModel.init()

        return () => {
            consoleDebug("LensFilterDialog clearup")
            viewModel.abort()
        }
    }, [])

    const onDialogOpen = useCallback(() => {
        if (state.tags.length == 0) {
            viewModel.init()
        } else {
            // dialog 弹出时恢复已确认的选中
            viewModel.restoreSelection()
        }
    }, [state.tags.length])

    const onDialogClose = useCallback(() => {
        viewModel.abort()
    }, [])

    const onTagClick = useCallback((tag: string) => {
        viewModel.onTagClick(tag)
    }, [])

    const onClickHint = useCallback(() => {
        viewModel.init(true)
    }, [])

    const actions = useMemo<ActionBtn[]>(() => {
        return [
            {
                text: "关闭", closeOnClick: true, onClick: () => {
                }
            }, {
                text: "搜索", closeOnClick: true, onClick: () => {
                    viewModel.confirmSelection()
                    // 通知执行搜索
                    consoleDebug("LensFilterDialog selected tags = " + state.selectedTags.toString())
                    getEventEmitter().emit("lensFilterChange", {
                        selectedTags: state.selectedTags
                    })
                }
            }]
    }, [state.selectedTags])

    // 将模版中的 category 排列成适合展示的结构
    const categoriesArray = useMemo(() => {
        const commonCategories: Category[] = []
        const actorCategories: Category[] = []
        const repertoireCategories: Category[] = []
        const otherCategories: Category[] = []
        state.tags.forEach(category => {
            switch (category.id) {
                // 剧种
                case "genre":
                // 剧团
                case "company":
                // 演出城市
                case "location_city":
                // 演出剧院
                case "location_theater": {
                    commonCategories.push(category)
                    break
                }
                // 演员
                case "actor": {
                    actorCategories.push(category)
                    break
                }
                // 剧目
                case "repertoire": {
                    repertoireCategories.push(category)
                    break
                }
                // 其它，包括模版中的 other 和未在模版中配置的标签
                default: {
                    otherCategories.push(category)
                    break
                }
            }
        })
        return [commonCategories, actorCategories, repertoireCategories, otherCategories]
    }, [state.tags])

    return (
        <BaseDialog openCount={props.openCount} fixedWidth={true} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} actions={actions}>
            <SmoothCollapse>
                <p className="lens-filter-dialog__title">选择搜索标签</p>
                <p className="lens-filter-dialog__hint">多选会显示同时满足条件的结果，比如演员与剧目的组合，若无选中则显示所有结果🕵🏻。</p>
                {
                    categoriesArray.length > 0 && categoriesArray.map((categories, index) =>
                        <Categories key={index} categories={categories} selectedTags={state.selectedTags} onTagClick={onTagClick} />
                    )
                }
                {(state.loading || state.loadingHint != null) &&
                    <LoadingHint loading={state.loading} loadHint={state.loadingHint} onClickHint={onClickHint} />
                }
            </SmoothCollapse>
        </BaseDialog>
    )
}

interface CategoriesProps {
    categories: Array<Category>
    selectedTags: Array<string>
    onTagClick: (tag: string) => void
}

/**
 * 一组 category 的 tag 合并显示
 */
function Categories(props: CategoriesProps) {
    const tagsCount = useMemo(() => {
        let count = 0
        props.categories.forEach(category => {
            count += category.tags.length
        })
        return count
    }, [props.categories])
    
    return (
        <>
            {
                tagsCount > 0 &&
                <div className="btn-tag-container lens-filter-dialog__tag-container">
                    {
                        props.categories.map(category => 
                            category.tags.map(tag =>
                                <CheckableTag key={tag.title} text={getTagTitle(tag)} checked={props.selectedTags.includes(tag.title)} onClick={() => props.onTagClick(tag.title)} />
                            )
                        )
                    }
                </div>
            }
        </>
    )
}

function getTagTitle(tag: Tag) {
    if (tag.count >= 0) {
        return tag.title + " " + tag.count
    } else {
        return tag.title
    }
}

let openCount = 0
export function showLensFilterDialog() {
    consoleDebug("ShowLensFilterDialog")
    showDialog(<LensFilterDialog openCount={openCount++} />, LENS_FILTER_DIALOG_WRAPPER_ID)
}