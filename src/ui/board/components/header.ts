import { iconsSvg } from "@/ui/icons";

export function getHeaderComponent(activeView: "kanban" | "todo" | "bug" = "kanban"): string {
  const titles = {
    kanban: "Kanban Task Board",
    todo: "Todo Task Board",
    bug: "Bug Tracking Board"
  };
  const boardTitle = titles[activeView];
 
  return `
    <div class="header">
      <h1 id="mainBoardTitle">
          ${boardTitle}
      </h1>
      <div class="header-controls">
        <button 
          class="toggle-location-button" 
          id="toggleLocationButton" 
          title="Toggle file location visibility"
        >
          ${iconsSvg.location}
        </button>

        <button 
          class="view-btn ${activeView === "kanban" ? "active" : ""}" 
          id="viewKanban" 
          data-view="kanban" 
          title="Show Kanban Board"
        >
          Kanban
        </button>

        <button 
          class="view-btn ${activeView === "todo" ? "active" : ""}" 
          id="viewTodo" 
          data-view="todo" 
          title="Show Todo Board"
        >
          Todo
        </button>

        <button 
          class="view-btn ${activeView === "bug" ? "active" : ""}" 
          id="viewBug" 
          data-view="bug" 
          title="Show Bug Board"
        >
          Bugs
        </button>

        <div class="search-container">
          <button class="reset-filters-button" id="resetFiltersButton" title="Reset all filters">
            ${iconsSvg.funnelX}
          </button>
          <div class="filter-indicator" id="filterIndicator" style="display: none;">
            <span class="filter-labels" id="filterLabels"></span>
            <button class="filter-clear button-clear" id="clearFilterButton">
              ${iconsSvg.close}
            </button>
          </div>
          <div class="custom-search-input">
            <span class="search-icon">${iconsSvg.search}</span>
            <input type="text" class="search-input" id="searchInput" placeholder="Search..."/>
            <button class="search-clear button-clear" id="clearButton" disabled>${iconsSvg.close}</button>
          </div>
        </div>

        <div class="age-filter-container">
          <span class="age-filter-icon">${iconsSvg.clock}</span>
          <select class="age-filter-select" id="ageFilterSelect">
            <option value="all">All</option>
            <option value="fresh">New (≤7 days)</option>
            <option value="recent">Recent (≤30 days)</option>
            <option value="old">Old (≤90 days)</option>
            <option value="abandoned">Ancient (>90 days)</option>
          </select>
        </div>

        <button class="sort-button" id="sortButton" data-direction="desc">
          ${iconsSvg.sortDescending}
        </button>
      </div>
    </div>
  `;
}