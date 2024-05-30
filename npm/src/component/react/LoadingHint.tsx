import React from "react"
import { Button } from "./Button"
import { ProgressCircular } from "./ProgressCircular"

export const ERROR_HINT: string = "加载错误，点击重试"

interface Props {
    loading: boolean
    loadHint: string
    onClickHint: () => void
}

export class LoadingHint extends React.Component<Props, any> {
    constructor(props: Props) {
        super(props)
    }
    render() {
        return (
            <div className="loading-hint-wrapper">
                {this.props.loading && <ProgressCircular loading={true} />}
                {(!this.props.loading && this.props.loadHint != null) &&
                    <Button text={this.props.loadHint} onClick={this.props.onClickHint} className="loading-hint-btn" />
                }
            </div>
        )
    }
}

export function getLoadHint(loadSize: number, resultSize: number): string {
    if (loadSize >= resultSize) return null
    return loadSize + "/" + resultSize + " MORE"
}

