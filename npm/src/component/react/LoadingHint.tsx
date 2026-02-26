import "./LoadingHint.scss"
import { Button } from "./Button"
import { ProgressCircular } from "./ProgressCircular"

export const ERROR_HINT: string = "重试加载"

interface Props {
    loading: boolean
    loadHint?: string
    onClickHint: () => void
}


export function LoadingHint(props: Props) {

    return (
        <div className="loading-hint-wrapper center-inline-items">
            <ProgressCircular loading={props.loading} classes={props.loading ? ["show"] : []} />
            <Button text={props.loadHint ?? ""} onClick={props.loading ? undefined : props.onClickHint} tabIndex={-1} classes={!props.loading && props.loadHint != null ? ["show"] : []} />
        </div>
    )
}

export function getLoadHint(loadSize: number, resultSize: number): string | undefined {
    if (loadSize >= resultSize) return undefined
    return loadSize + "/" + resultSize + " MORE"
}

