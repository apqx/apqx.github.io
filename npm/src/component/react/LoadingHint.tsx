import "./LoadingHint.scss"
import { Button } from "./Button"
import { ProgressCircular } from "./ProgressCircular"

export const ERROR_HINT: string = "重试加载"

interface Props {
    loading: boolean
    loadHint: string | null
    onClickHint: () => void
}

export function LoadingHint(props: Props) {
    return (
        <div className="loading-hint-wrapper center-items">
            {props.loading && <ProgressCircular loading={true} />}
            {(!props.loading && props.loadHint != null) &&
                <Button text={props.loadHint} onClick={props.onClickHint} classes={["loading-hint-btn"]} />
            }
        </div>
    )
}

export function getLoadHint(loadSize: number, resultSize: number): string | null {
    if (loadSize >= resultSize) return null
    return loadSize + "/" + resultSize + " MORE"
}

