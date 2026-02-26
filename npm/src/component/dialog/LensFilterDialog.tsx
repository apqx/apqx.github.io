import "./LensFilterDialog.scss"
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { BaseDialog, LENS_FILTER_DIALOG_WRAPPER_ID, showDialog, type ActionBtn, type BaseDialogOpenProps } from "./BaseDialog";
import { LensFilterDialogViewModel } from "./LensFilterDialogViewModel";
import { SmoothCollapse } from "../animation/SmoothCollapse";
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
        viewModel.init()
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

    return (
        <BaseDialog openCount={props.openCount} fixedWidth={true} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} actions={actions}>
            <SmoothCollapse>
                <p className="lens-filter-dialog__title">选择搜索标签</p>
                <p className="lens-filter-dialog__hint">选中多个显示同时满足条件的结果，比如演员与剧目的组合，不选中则显示所有结果🕵🏻。</p>
                {state.tags != null && state.tags.length != 0 &&
                    <div className="btn-tag-container lens-filter-dialog__tag-container">
                        {state.tags.map(category =>
                            category.tags.map(tag =>
                                <CheckableTag key={tag.title} text={tag.title + " " + tag.count} checked={state.selectedTags.includes(tag.title)} onClick={() => onTagClick(tag.title)} />
                            )
                        )}
                    </div>
                }
                {(state.loading || state.loadingHint != null) &&
                    <LoadingHint loading={state.loading} loadHint={state.loadingHint} onClickHint={onClickHint} />
                }
            </SmoothCollapse>
        </BaseDialog>
    )
}

let openCount = 0
export function showLensFilterDialog() {
    consoleDebug("ShowLensFilterDialog")
    showDialog(<LensFilterDialog openCount={openCount++} />, LENS_FILTER_DIALOG_WRAPPER_ID)
}