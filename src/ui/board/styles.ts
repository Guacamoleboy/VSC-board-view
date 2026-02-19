export function getBoardStyles(): string {
  return `
    :root {
      color-scheme: var(--vscode-color-scheme);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }

    body {
      margin: 0;
      padding: 16px;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-foreground);
    }

    body.hide-locations .card__meta,
    body.hide-locations .badge--location {
        display: none !important;
    }

    body * {
      box-sizing: border-box;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 16px;
      position: sticky;
      top: 0;
      background-color: var(--vscode-editor-background);
      z-index: 2;
      padding-top: 10px;
      padding-bottom: 10px;
    }

    h1 {
      font-size: 18px;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h1 svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    h1 svg line,
    h1 svg polyline {
      stroke: var(--vscode-foreground);
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      justify-content: flex-end;
    }

    .search-container {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      flex: 1;
      flex-wrap: wrap;
    }

    .custom-search-input {
      display: flex;
      align-items: center;
      flex: 1;
      width: 60px;
      height: 40px;
      padding: 4px;
      max-width: 230px;

      background-color: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      overflow: hidden;
    }

    .filter-indicator {
      display: none;
      align-items: center;
      gap: 6px;
      padding: 6px;
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      height: 40px;
    }

    .filter-labels {
      display: block;
      align-items: center;
      max-width: 200px;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .search-icon {
      height: 32px;
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      opacity: 0.6;
    }

    .search-icon svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .search-input {
      background: transparent;
      color: var(--vscode-input-foreground);
      flex: 1;
      padding: 8px 4px;
      font-size: 14px;
      outline: none;
      height: 40px;
      border: none;
      transition: border-color 120ms ease;
    }

    .search-input:focus {
      border-color: var(--vscode-focusBorder);
    }

    .search-input::placeholder {
      color: var(--vscode-input-placeholderForeground);
    }

    .button-clear {
      height: 32px;
      width: 32px;
      background-color: transparent;
      color: var(--vscode-input-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 300ms ease-in-out, background-color 120ms ease;
      flex-shrink: 0;
      z-index: 100;
    }

    .button-clear svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .button-clear:hover:not(:disabled) {
      background-color: var(--vscode-toolbar-hoverBackground);
    }

    .button-clear:disabled {
      opacity: 0;
    }

    .sort-button {
      height: 40px;
      width: 40px;
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 120ms ease;
      flex-shrink: 0;
    }

    .sort-button svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .sort-button:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    .sort-button:active {
      transform: scale(0.95);
    }

    .reset-filters-button {
      height: 40px;
      width: 40px;
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 120ms ease;
      flex-shrink: 0;
    }

    .reset-filters-button svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .reset-filters-button:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    .reset-filters-button:active {
      transform: scale(0.95);
    }

    .age-filter-container {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 4px 0 8px;
      background-color: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      gap: 4px;
      flex-shrink: 0;
      min-width: 160px;
    }

    .age-filter-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      opacity: 0.7;
    }

    .age-filter-icon svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .age-filter-select {
      flex: 1;
      background: transparent;
      color: var(--vscode-input-foreground);
      border: none;
      outline: none;
      font-size: 13px;
      cursor: pointer;
      padding: 4px;
      min-width: 0;
    }

    .age-filter-select:focus {
      outline: none;
    }

    .age-filter-select option {
      background-color: var(--vscode-dropdown-background);
      color: var(--vscode-dropdown-foreground);
    }

    .board {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }

    .column {
      background-color: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .column__header {
      padding: 12px 16px;
      border: 1px solid var(--vscode-widget-border);
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 60px;
      border-radius: 8px 8px 0 0;
      background-color: var(--vscode-sideBar-background);
      z-index: 1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .column__content {
      flex: 1;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card {
      border-radius: 6px;
      border: 2px solid rgba(255,255,255,0.15);
      padding: 1rem;
      background: var(--vscode-editorWidget-background);
      box-shadow: 0 5px 1px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      transition: border-color 120ms ease, transform 120ms ease, box-shadow 120ms ease;
      display: flex;
      flex-direction: column;
      word-break: break-word;
      overflow-wrap: break-word;
      transform: translateY(0);
    }

    .card:hover {
        transform: translateY(2px); 
        box-shadow: 0 3px 1px rgba(0, 0, 0, 0.5); 
        border-color: rgba(255,255,255,0.3); 
    }

    .card__labels {
      margin-top: 0.5rem !important;
    }

    .card.hidden {
      display: none;
    }

    .card__header {
        display: flex;
        justify-content: space-between; 
        align-items: center;         
        width: 100%;                  
        gap: 1rem;                    
        margin-bottom: 0.25rem;  
        opacity: 0.70 !important;         
    }

    .card__header__alignment {
        display: flex;
        justify-content: space-between; 
        align-items: center;         
        width: 100%;                  
        gap: 12px;                    
        margin-bottom: 1.25rem; 
        position: relative;     
    }

    .card__header__alignment::after {
        content: "";
        position: absolute;
        bottom: -0.75rem;       
        left: 0;
        width: 15%;             
        height: 2px;           
        background-color: rgba(255, 255, 255, 0.25);
    }
    
    .assignee-avatar {
        width: 2.4em;
        height: 2.4em;
        flex-shrink: 0;
        transition: transform 0.1s ease-in-out, z-index 0.1s;
        cursor: pointer;
    }

    .assignee-avatar:hover {
      transform: scale(1.1);
      z-index: 100;
    }

    .card__priority-badge {
        display: inline-block; 
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
        padding: 3px 6px; 
        
        border-radius: 4px;
        background: var(--vscode-badge-background); 
        color: var(--vscode-badge-foreground);
        white-space: nowrap;
        line-height: 1.2; 
        vertical-align: middle; 
        margin-top: -1px;
    }

    .card__priority-badge[data-priority="high"] {
      background: #ef4444;
      color: #ffffff;
    }

    .card__priority-badge[data-priority="medium"] {
      background: #f59e0b; 
      color: #000000;
    }

    .card__priority-badge[data-priority="low"] {
      background: #1c753e; 
      color: #bbf7d0;      
    }

    .card__priority-badge[data-priority="critical"] {
      background: #450a0a; 
      color: #fca5a5;     
      border: 1px solid #991b1b;
    }

    .card__priority-badge[data-priority="urgent"] {
      background: #dc2626; 
      color: #ffffff;      
      border: 1px solid #fecaca;
    }

    .card__status-tag {
      background-color: #FFF;
      color: #4d4d4d;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      line-height: 1.2;
      transition: filter 0.2s ease;
    }

    .card__status-tag--idea {
      background-color: #f1f0ff;
      color: #6c5ce7;
    }

    .card__status-tag--to-be-done {
      background-color: #f5f5f5;
      color: #636e72;
    }

    .card__status-tag--in-progress {
      background-color: #e3f2fd;
      color: #007acc;
    }

    .card__status-tag--in-review {
      background-color: #fff3e0;
      color: #e67e22;
    }

    .card__status-tag--done {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .card__status-tag:hover {
      filter: brightness(0.95);
    }

    .card__header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 1rem;
    }

    .card__title {
        margin: 0 !important;      
        padding: 0 !important;     
        line-height: 1.2;         
        display: flex;         
        align-items: center;
    }

    .issue-badge {
      display: inline-flex;
      align-items: center;
      padding: 5px;
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .issue-badge:hover {
      opacity: 0.8;
    }

    .card__description {
      position: relative;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0.25 0.5rem;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .card__meta {
        text-decoration: none !important;
        display: flex;
        flex-direction: column; 
        gap: 4px;          
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        margin-bottom: 8px;   
    }

    .card__meta span, 
    .card__meta .badge {
        align-self: flex-start; 
    }

    .card__meta:hover {
      text-decoration: none !important;
      color: var(--vscode-foreground);
    }

    .card__labels {
      margin-top: 8px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .header__assignees {
        display: flex;
        flex-direction: row; 
        align-items: center;
        padding-left: 10px; 
    }

    .assignee-container {
        position: relative;
        width: 24px;
        height: 24px;
        border-radius: 12px;
        background: #444;    
        margin-left: -8px;
        border: 2px solid #585858;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;   
        transition: width 0.3s ease, padding 0.3s ease;
        cursor: pointer;
    }

    .assignee-full-name {
        display: none;
        white-space: nowrap;
        font-size: 10px;
        font-weight: 700;
        color: white;
        padding: 0 8px;
    }

    .assignee-container:first-child {
        margin-left: 0;
    }

    .assignee-container:hover {
        width: auto;       
        min-width: 32px;    
        z-index: 100;
        background: #555; 
    }

    .assignee-container:hover .assignee-avatar,
    .assignee-container:hover .assignee-initial {
        display: none !important;
    }

    .assignee-container:hover .assignee-full-name {
        display: block;
    }

    .assignee-container:hover .assignee-full-name {
        opacity: 1;
    }

    .assignee-container:hover .assignee-initial {
        display: none; 
    }

    .assignee-initial {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 10px;
        font-weight: 800;
        color: #ffffff;
        text-shadow: 0 1px 3px rgba(0,0,0,0.9);
        pointer-events: none;
    }

    .card__labels .badge {
      margin-top: 4px;
      padding: 4px 10px;
      border-radius: 1rem;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      box-shadow: 0 4px 1px rgba(0, 0, 0, 0.3);
    }

    .badge--clickable {
      cursor: pointer;
      transition: opacity 120ms ease, transform 120ms ease;
    }

    .badge--clickable:hover {
      opacity: 0.9;
      transform: scale(1.025);
    }

    .badge--clickable:active {
      transform: scale(0.98);
    }

    .badge--active {
      border-color: currentColor;
    }

    .badge {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 12px;
    }

    /* Age badges */
    .age-badge {
      padding: 4px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.3px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      background: transparent;
      color: var(--vscode-foreground);
    }

    .age-badge svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    .age-fresh {
      border: 1px solid #10b981;
    }

    .age-recent {
      border: 1px solid #3b82f6;
    }

    .age-old {
      border: 1px solid #f59e0b;
    }

    .age-abandoned {
      border: 1px solid #ef4444;
    }

    .badge--location {
      display: inline-flex;
      align-items: center;
      text-decoration: none !important;
      margin-bottom: 0.25rem !important;
      margin-top: 0.5rem !important;
      background-color: rgba(0, 0, 0, 0.1); 
      color: #808080;                          
      padding: 0.22rem 0.6rem;
      border-radius: 0.22rem;   
      font-size: 0.82rem;        
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.2);  
      transition: all 0.2s ease-in-out;      
      cursor: pointer;
    }

    .badge--location:hover {
      background-color: #eec50d;             
      color: #2b2b2b;                       
      border-color: #d3a81a;
      box-shadow: 0 2.5px 1px rgba(211, 168, 26, 0.55); 
      transform: translateY(-1px);         
    }

    .empty {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
      text-align: center;
      padding: 20px;
      margin: 0;
    }

    .card__menu {
      position: relative;
      margin-left: auto;
      cursor: pointer;
    }

    .card__menu-btn {
      background: transparent;
      border: 1px solid var(--vscode-foreground);
      border-radius: 50px;
      font-size: 16px;
      font-weight: bold;
      color: var(--vscode-foreground);
      width: 24px;
      height: 24px;
      cursor: pointer;
    }

    .card__menu-list {
      position: absolute;
      top: 100%;
      right: 0;
      background-color: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-foreground);
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 10;
      min-width: 160px;
      list-style: none;
      margin-top: 2px;
      padding: 0;
      overflow: hidden;
    }

    .card__menu-item {
      padding: 8px 12px;
      font-size: 13px;
      color: var(--vscode-foreground);
      cursor: pointer;
      transition: background-color 120ms ease;
    }

    .card__menu-item:hover {
      background-color: var(--vscode-list-hoverBackground);
    }

    .card__menu-item:active {
      background-color: var(--vscode-list-activeSelectionBackground);
    }

    /* Modal de criação de issue */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal[hidden] {
      display: none;
    }

    .modal__overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(2px);
    }

    .modal__content {
      position: relative;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-editorWidget-border);
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 90%;
      max-height: 85vh;
      overflow: auto;
      z-index: 1001;
    }

    .modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--vscode-editorWidget-border);
    }

    .modal__title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--vscode-foreground);
    }

    .modal__close {
      background: none;
      border: none;
      font-size: 28px;
      line-height: 1;
      cursor: pointer;
      color: var(--vscode-foreground);
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.15s;
    }

    .modal__close:hover {
      background: var(--vscode-toolbar-hoverBackground);
    }

    .modal__form {
      padding: 24px;
    }

    .form-group-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group:last-of-type {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 14px;
      color: var(--vscode-foreground);
    }

    .form-group input[type="text"],
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      font-size: 14px;
      font-family: var(--vscode-font-family);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      outline: none;
      transition: border-color 0.15s;
    }

    .form-group input[type="text"]:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      border-color: var(--vscode-focusBorder);
    }

    .form-group input[type="text"][readonly] {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 100px;
    }

    .modal__actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--vscode-editorWidget-border);
    }

    .button {
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      font-family: var(--vscode-font-family);
    }

    .button:active {
      transform: scale(0.98);
    }

    .button--primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .button--primary:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .button--secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .button--secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .toggle-location-button,
    .view-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      color: var(--vscode-foreground);
      cursor: pointer;
      height: 32px;
      padding: 0 8px;
      margin-right: 8px;
      font-size: 12px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .toggle-location-button {
      width: 32px;
      padding: 0;
    }

    .toggle-location-button:hover,
    .view-btn:hover {
      background-color: var(--vscode-toolbar-hoverBackground);
      border-color: var(--vscode-focusBorder);
    }

    .toggle-location-button.active,
    .view-btn.active {
      color: var(--vscode-button-foreground);
      background-color: var(--vscode-button-background);
      border-color: #e2e2e2;
    }

    .view-btn:active {
      opacity: 0.8;
      transform: translateY(1px);
    }

  `;
}
