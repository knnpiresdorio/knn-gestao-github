export interface SystemMessage {
    id: string;
    type: 'error' | 'warning' | 'info' | 'success';
    title: string;
    description: string;
    details?: string;
    actionLabel?: string;
    onAction?: () => void;
}
