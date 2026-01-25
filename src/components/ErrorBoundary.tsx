import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4">
                    <h2 className="text-xl font-bold font-display">오류가 발생했습니다</h2>
                    <p className="text-muted-foreground text-sm max-w-md">
                        페이지를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
                    </p>
                    {process.env.NODE_ENV === "development" && this.state.error && (
                        <div className="bg-destructive/10 text-destructive text-xs p-4 rounded-md text-left w-full max-w-lg overflow-auto max-h-40">
                            {this.state.error.message}
                        </div>
                    )}
                    <Button onClick={() => window.location.reload()}>새로고침</Button>
                </div>
            );
        }

        return this.props.children;
    }
}
