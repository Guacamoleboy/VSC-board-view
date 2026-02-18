import { iconsSvg } from "@/ui/icons";

export function getHeaderComponent(): string {
  return `
    <div class="header">
      <h1>
        ${iconsSvg.activityBar}
        Kanban Task Board
      </h1>
      <div class="header-controls">

        <button 
          class="toggle-location-button" 
          id="toggleLocationButton" 
          title="Toggle file location visibility"
        >
          ${iconsSvg.location}
        </button>

        <div class="search-container">
          <button
            class="reset-filters-button"
            id="resetFiltersButton"
            title="Reset all filters and sorting"
          >
            ${iconsSvg.funnelX}
          </button>
          <div class="filter-indicator" id="filterIndicator" style="display: none;">
            <span class="filter-labels" id="filterLabels"></span>
            <button
              class="filter-clear button-clear"
              id="clearFilterButton"
              title="Clear filter"
            >
              ${iconsSvg.close}
            </button>
          </div>
          <div class="custom-search-input">
            <span class="search-icon" aria-hidden="true">
              ${iconsSvg.search}
            </span>
            <input
              type="text"
              class="search-input"
              id="searchInput"
              placeholder="Search..."
              autocomplete="off"
            />
            <button
              class="search-clear button-clear"
              id="clearButton"
              title="Clear search"
              disabled
            >
              ${iconsSvg.close}
            </button>
          </div>
        </div>
        <div class="age-filter-container">
          <span class="age-filter-icon" aria-hidden="true">
            ${iconsSvg.clock}
          </span>
          <select
            class="age-filter-select"
            id="ageFilterSelect"
            title="Filter by age"
          >
            <option value="all">All</option>
            <option value="fresh">New (≤7 days)</option>
            <option value="recent">Recent (≤30 days)</option>
            <option value="old">Old (≤90 days)</option>
            <option value="abandoned">Ancient (>90 days)</option>
          </select>
        </div>
        <button
          class="sort-button"
          id="sortButton"
          title="Sort by date (descending)"
          data-direction="desc"
        >
          ${iconsSvg.sortDescending}
        </button>
      </div>
    </div>
  `;
}
