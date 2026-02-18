export function getSidebarStyles(): string {
  return `
    :root {
      color-scheme: var(--vscode-color-scheme);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      padding: 12px;
      background-color: var(--vscode-sideBar-background);
      color: var(--vscode-sideBar-foreground);
      overflow-x: hidden;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      border: none;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 120ms ease;
      text-align: center;
      width: 100%;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn--primary, .btn--secondary {
      box-shadow: 0 4px 1px rgba(0,0,0,0.4);
    }

    .btn--primary {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .btn--primary:hover {
      background-color: var(--vscode-button-hoverBackground);
      box-shadow: 0 6px 1px rgba(0,0,0,0.5);
      transform: transformY(2px);
    }

    .btn--secondary {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .btn--secondary:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
      box-shadow: 0 6px 1px rgba(0,0,0,0.5);
      transform: transformY(2px);
    }

    .btn svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .section {
      margin-bottom: 16px;
    }

    .section__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 4px 0;
    }

    .section__title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .section__title svg {
      width: 16px;
      height: 16px;
    }

    .section__badge {
      background-color: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
    }

    .totals-overview {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .stats-card {
      background-color: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
      text-align: center;
      width: 50%;
    }

    .stats-card__value {
      font-size: 28px;
      font-weight: 700;
      color: var(--vscode-textLink-foreground);
      line-height: 1;
      margin-bottom: 4px;
    }

    .stats-card__label {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }

    .label-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .label-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      background-color: var(--vscode-list-hoverBackground);
      border-radius: 4px;
      cursor: pointer;
      transition: all 120ms ease;
      border: 2px solid transparent;
      color: #e2e2e2;
    }

    .label-item:hover {
      background-color: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }

    .label-item--active {
      background-color: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
      border-color: var(--vscode-focusBorder);
      font-weight: 600;
    }

    .label-item--active .label-item__count {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .label-item__info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .label-item__icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .label-item__icon svg {
      width: 16px;
      height: 16px;
    }

    .label-item__name {
      font-size: 13px;
      font-weight: 500;
    }

    .label-item__count {
      font-size: 11px;
      font-weight: 600;
      background-color: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 2px 8px;
      border-radius: 10px;
      min-width: 24px;
      text-align: center;
    }

    .empty-state {
      text-align: center;
      padding: 24px 12px;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
    }

    .empty-state svg {
      width: 48px;
      height: 48px;
      opacity: 0.4;
      margin-bottom: 12px;
    }

    .divider {
      height: 1px;
      background-color: var(--vscode-widget-border);
      margin: 16px 0;
    }

    .text-orange {
      color: #FFA500;
    }

    .sticky-container {
      position: sticky;
      top: 0;
      background-color: var(--vscode-sideBar-background);
      padding-top: 12px;
      padding-bottom: 12px;
      z-index: 10;
    }
  `;
}
