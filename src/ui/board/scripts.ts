import { iconsSvg } from "@/ui/icons";

export function getBoardScripts(): string {
  return `
    const vscode = acquireVsCodeApi();

    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearButton');
    const filterIndicator = document.getElementById('filterIndicator');
    const filterLabels = document.getElementById('filterLabels');
    const clearFilterButton = document.getElementById('clearFilterButton');
    const sortButton = document.getElementById('sortButton');
    const ageFilterSelect = document.getElementById('ageFilterSelect');
    const resetFiltersButton = document.getElementById('resetFiltersButton');
    const cards = document.querySelectorAll('[data-card="true"]');
    const kebabMenus = document.querySelectorAll('.card__menu');
    const labelBadges = document.querySelectorAll('[data-label]');
    const issueModal = document.getElementById('issueModal');
    const issueForm = document.getElementById('issueForm');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const issueProjectSelect = document.getElementById('issueProject');
    const issueTypeSelect = document.getElementById('issueType');
    const issueSummaryInput = document.getElementById('issueSummary');
    const issueDescriptionInput = document.getElementById('issueDescription');
    const issueLocationInput = document.getElementById('issueLocation');
    const toggleLocationBtn = document.getElementById('toggleLocationButton');
    const locationIcon = \`${iconsSvg.location}\`;
    const locationOffIcon = \`${iconsSvg.locationOff}\`;

    let activeLabels = []; // Array of active label filters
    let sortDirection = 'desc'; // Default: most recent first
    let ageFilter = 'all'; // Default: show all ages
    let currentIssueData = null; // Dados da issue sendo criada
    let jiraProjects = []; // Lista de projetos do Jira
    let jiraIssueTypes = []; // Lista de tipos de issue do Jira

    // Handle card clicks (agora só no card, não no rodapé)
    cards.forEach((element) => {
      element.addEventListener('click', (e) => {
        // Não aciona se clicar no botão de criar issue ou em label
        if (e.target.hasAttribute('data-label') || e.target.hasAttribute('data-create-issue')) {
          return;
        }
        const file = element.getAttribute('data-file');
        const line = Number(element.getAttribute('data-line') ?? '0');
        vscode.postMessage({ type: 'open', file, line });
      });
    });

    // Location visibilty
    if (toggleLocationBtn) {
        toggleLocationBtn.addEventListener('click', () => {
            const isHidden = document.body.classList.toggle('hide-locations');
            // Skift mellem location og locationOff ikonerne
            toggleLocationBtn.innerHTML = isHidden ? locationOffIcon : locationIcon;
            toggleLocationBtn.title = isHidden ? "Show location" : "Hide location";
        });
    }

    // Board View
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        vscode.postMessage({ type: 'switchView', view: btn.dataset.view });
      });
    });

    // Kebab menu: abrir/fechar e ação de criar issue
    kebabMenus.forEach((menu) => {
      const btn = menu.querySelector('.card__menu-btn');
      const list = menu.querySelector('.card__menu-list');
      if (!btn || !list) return;

      // Toggle menu
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Fecha outros menus abertos
        document.querySelectorAll('.card__menu-list').forEach((el) => {
          if (el !== list) el.setAttribute('hidden', '');
        });
        list.toggleAttribute('hidden');
      });

      // Fecha menu ao clicar fora
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
          list.setAttribute('hidden', '');
        }
      });

      // Ação: abrir modal para criar issue
      const createIssueItem = list.querySelector('[data-menu-create-issue]');
      if (createIssueItem) {
        createIssueItem.addEventListener('click', (e) => {
          e.stopPropagation();
          list.setAttribute('hidden', '');
          const card = menu.closest('[data-card="true"]');
          if (!card) return;
          const filePath = card.getAttribute('data-file');
          const location = card.getAttribute('data-location');
          const line = Number(card.getAttribute('data-line') ?? '0');
          const daysOld = Number(card.getAttribute('data-days-old') ?? '0');
          const description = card.querySelector('.card__description')?.textContent || '';

          // Verifica autenticação antes de abrir modal
          vscode.postMessage({
            type: 'checkAuthBeforeCreateIssue',
            data: {
              filePath,
              location,
              line,
              daysOld,
              description
            }
          });
        });
      }

      // Ação: abrir issue no Jira
      const viewIssueItem = list.querySelector('[data-menu-view-issue]');
      if (viewIssueItem) {
        viewIssueItem.addEventListener('click', (e) => {
          e.stopPropagation();
          list.setAttribute('hidden', '');
          const card = menu.closest('[data-card="true"]');
          if (!card) return;
          const issueLink = card.getAttribute('data-issue-link');
          if (issueLink) {
            vscode.postMessage({ type: 'openExternal', url: issueLink });
          }
        });
      }
    });

    // Handle label badge clicks
    labelBadges.forEach((badge) => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click
        const label = badge.getAttribute('data-label');
        if (label) {
          filterByLabelFromClick(label);
        }
      });
    });

    // Handle issue badge clicks (para badges que já existem no load)
    const issueBadges = document.querySelectorAll('.issue-badge');
    issueBadges.forEach((badge) => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const issueLink = badge.getAttribute('data-issue-link');
        if (issueLink) {
          vscode.postMessage({ type: 'openExternal', url: issueLink });
        }
      });
    });

    // Filter by label
    function filterByLabel(label) {
      // Toggle label in activeLabels array
      const index = activeLabels.indexOf(label);
      if (index === -1) {
        activeLabels.push(label);
      } else {
        activeLabels.splice(index, 1);
      }

      updateFilterIndicator();
      updateResetButtonVisibility();
      searchInput.value = '';
      applyFilters();
    }

    // Filter by label from user click (sends message to extension)
    function filterByLabelFromClick(label) {
      filterByLabel(label);
      vscode.postMessage({ type: 'setFilter', label });
    }

    // Remove a specific label from filter
    function removeLabel(label) {
      const index = activeLabels.indexOf(label);
      if (index !== -1) {
        activeLabels.splice(index, 1);
      }

      updateFilterIndicator();
      applyFilters();

      // Notify extension to remove label
      vscode.postMessage({ type: 'removeLabel', label });
    }

    // Update filter indicator to show active labels
    function updateFilterIndicator() {
      if (activeLabels.length > 0) {
        const labelsText = activeLabels.join(', ');
        filterLabels.textContent = 'Labels: ' + activeLabels.join(', ');
        filterLabels.setAttribute('title', labelsText);
        filterIndicator.style.display = 'flex';
      } else {
        filterIndicator.style.display = 'none';
      }

      // Update visual state of all label badges
      for (const badge of labelBadges) {
        const label = badge.getAttribute('data-label');
        if (activeLabels.includes(label)) {
          badge.classList.add('badge--active');
        } else {
          badge.classList.remove('badge--active');
        }
      }
    }

    // Clear label filter
    function clearLabelFilter() {
      activeLabels = [];
      updateFilterIndicator();
      updateResetButtonVisibility();
      applyFilters();

      vscode.postMessage({ type: 'clearLabels' });
    }

    // Apply all filters (search + labels + age) and sorting
    function applyFilters() {
      const searchQuery = searchInput.value.toLowerCase().trim();
      let visibleCards = [];

      cards.forEach((card) => {
        let shouldShow = true;

        // Apply label filter (OR logic: show if matches ANY active label)
        if (activeLabels.length > 0) {
          const cardLabels = Array.from(card.querySelectorAll('[data-label]'))
            .map(badge => badge.getAttribute('data-label'));
          shouldShow = activeLabels.some(label => cardLabels.includes(label));
        }

        // Apply age filter
        if (shouldShow && ageFilter !== 'all') {
          const daysOld = parseInt(card.getAttribute('data-days-old') || '0', 10);
          shouldShow = matchesAgeFilter(daysOld, ageFilter);
        }

        // Apply search filter
        if (shouldShow && searchQuery) {
          const description = card.querySelector('.card__description')?.textContent?.toLowerCase() || '';
          const location = card.querySelector('.card__meta')?.textContent?.toLowerCase() || '';
          const labels = Array.from(card.querySelectorAll('.card__labels .badge'))
            .map(badge => badge.textContent?.toLowerCase() || '')
            .join(' ');

          const searchableText = \`\${description} \${location} \${labels}\`;
          shouldShow = searchableText.includes(searchQuery);
        }

        if (shouldShow) {
          card.classList.remove('hidden');
          visibleCards.push(card);
        } else {
          card.classList.add('hidden');
        }
      });

      // Apply sorting to visible cards
      sortCards(visibleCards);

      // Update clear button state
      clearButton.disabled = !searchQuery;

      // Show/hide empty state for each column
      updateEmptyStates();
    }

    // Check if days old matches age filter
    function matchesAgeFilter(daysOld, filter) {
      switch (filter) {
        case 'fresh':
          return daysOld <= 7;
        case 'recent':
          return daysOld <= 30;
        case 'old':
          return daysOld <= 90;
        case 'abandoned':
          return daysOld > 90;
        default:
          return true;
      }
    }

    // Sort visible cards by date
    function sortCards(visibleCards) {
      const columns = document.querySelectorAll('.column__content');

      visibleCards.sort((a, b) => {
        const daysA = parseInt(a.getAttribute('data-days-old') || '0', 10);
        const daysB = parseInt(b.getAttribute('data-days-old') || '0', 10);

        if (sortDirection === 'desc') {
          return daysA - daysB; // Most recent first (lower daysOld)
        } else {
          return daysB - daysA; // Oldest first (higher daysOld)
        }
      });

      // Re-append cards in sorted order within their columns
      for (const card of visibleCards) {
        const priority = card.getAttribute('data-priority');
        const column = document.querySelector(\`[data-priority="\${priority}"] .column__content\`);
        if (column) {
          column.appendChild(card);
        }
      }
    }

    // Update empty state messages for columns
    function updateEmptyStates() {
      const columns = document.querySelectorAll('.column');

      columns.forEach((column) => {
        const columnContent = column.querySelector('.column__content');
        const cardsInColumn = columnContent.querySelectorAll('[data-card="true"]');
        const visibleCardsInColumn = Array.from(cardsInColumn).filter(card => !card.classList.contains('hidden'));

        // Remove existing empty state if present
        let emptyState = columnContent.querySelector('.empty');

        if (visibleCardsInColumn.length === 0) {
          // Show empty state
          if (!emptyState) {
            emptyState = document.createElement('p');
            emptyState.className = 'empty';
            emptyState.textContent = 'No TODOs found.';
            columnContent.appendChild(emptyState);
          }
        } else {
          // Remove empty state
          if (emptyState) {
            emptyState.remove();
          }
        }
      });
    }

    // Search input event
    searchInput.addEventListener('input', () => {
      applyFilters();
    });

    // Clear button event
    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      applyFilters();
      searchInput.focus();
    });

    // Clear filter button event
    clearFilterButton.addEventListener('click', () => {
      clearLabelFilter();
    });

    // Allow clearing with Escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        applyFilters();
      }
    });

    // Sort button event
    sortButton.addEventListener('click', () => {
      sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
      updateSortButton();
      updateResetButtonVisibility();
      applyFilters();

      vscode.postMessage({ type: 'toggleSort', direction: sortDirection });
    });

    // Age filter dropdown event
    ageFilterSelect.addEventListener('change', (e) => {
      ageFilter = e.target.value;
      updateResetButtonVisibility();
      applyFilters();

      vscode.postMessage({ type: 'setAgeFilter', ageFilter });
    });

    // Reset all filters button event
    resetFiltersButton.addEventListener('click', () => {
      resetAllFilters();
    });

    // Reset all filters and sorting to defaults
    function resetAllFilters() {
      activeLabels = [];
      ageFilter = 'all';
      sortDirection = 'desc';
      searchInput.value = '';

      ageFilterSelect.value = 'all';
      updateSortButton();
      updateFilterIndicator();
      updateResetButtonVisibility();
      applyFilters();

      vscode.postMessage({ type: 'resetFilters' });
    }

    // Update reset button visibility based on active filters
    function updateResetButtonVisibility() {
      const hasActiveFilters =
        activeLabels.length > 0 ||
        ageFilter !== 'all' ||
        sortDirection !== 'desc';

      resetFiltersButton.style.display = hasActiveFilters ? 'flex' : 'none';
    }

    // Update sort button icon and title
    function updateSortButton() {
      const iconsSvg = {
        sortAscending: \`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M128,128a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16h72A8,8,0,0,1,128,128ZM48,72H184a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16Zm56,112H48a8,8,0,0,0,0,16h56a8,8,0,0,0,0-16Zm125.66-21.66a8,8,0,0,0-11.32,0L192,188.69V112a8,8,0,0,0-16,0v76.69l-26.34-26.35a8,8,0,0,0-11.32,11.32l40,40a8,8,0,0,0,11.32,0l40-40A8,8,0,0,0,229.66,162.34Z"></path></svg>\`,
        sortDescending: \`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M128,128a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16h72A8,8,0,0,1,128,128ZM48,72H184a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16Zm56,112H48a8,8,0,0,0,0,16h56a8,8,0,0,0,0-16Zm125.66-90.34-40-40a8,8,0,0,0-11.32,0l-40,40a8,8,0,0,0,11.32,11.32L176,77.31V144a8,8,0,0,0,16,0V77.31l26.34,26.35a8,8,0,0,0,11.32-11.32Z"></path></svg>\`,
      };

      const icon = sortDirection === 'desc' ? iconsSvg.sortDescending : iconsSvg.sortAscending;
      const title = sortDirection === 'desc' ? 'Sort by date (descending)' : 'Sort by date (ascending)';

      sortButton.innerHTML = icon;
      sortButton.setAttribute('title', title);
      sortButton.setAttribute('data-direction', sortDirection);
    }

    // Listen for messages from extension
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'filterByLabel') {
        filterByLabel(message.label);
      } else if (message.type === 'projectsLoaded') {
        populateProjectSelect(message.projects);
      } else if (message.type === 'issueTypesLoaded') {
        populateIssueTypeSelect(message.issueTypes);
      } else if (message.type === 'issueCreated') {
        updateCardWithIssue(message.issueData);
      } else if (message.type === 'openIssueModal') {
        openIssueModal(message.data);
      }
    });

    // Função para buscar projetos do Jira
    async function fetchJiraProjects() {
      try {
        vscode.postMessage({ type: 'fetchProjects' });
      } catch (err) {
        console.error('[TODO Board] Erro ao buscar projetos:', err);
        issueProjectSelect.innerHTML = '<option value="">Erro ao carregar projetos</option>';
      }
    }

    // Função para buscar tipos de issue do Jira
    async function fetchJiraIssueTypes(projectId) {
      try {
        vscode.postMessage({ type: 'fetchIssueTypes', projectId });
      } catch (err) {
        console.error('[TODO Board] Erro ao buscar tipos de issue:', err);
        issueTypeSelect.innerHTML = '<option value="">Erro ao carregar tipos</option>';
      }
    }

    // Função para popular o select de projetos
    function populateProjectSelect(projects) {
      jiraProjects = projects;
      issueProjectSelect.innerHTML = '';

      if (projects.length === 0) {
        issueProjectSelect.innerHTML = '<option value="">Nenhum projeto disponível</option>';
        return;
      }

      projects.forEach((project, index) => {
        const option = document.createElement('option');
        option.value = project.key;
        option.setAttribute('data-project-id', project.id);
        option.textContent = \`\${project.key} - \${project.name}\`;
        // Seleciona o primeiro item automaticamente
        if (index === 0) {
          option.selected = true;
        }
        issueProjectSelect.appendChild(option);
      });

      // Busca issue types do primeiro projeto automaticamente
      if (projects.length > 0) {
        fetchJiraIssueTypes(projects[0].id);
      }
    }

    // Listener para mudança de projeto - atualiza tipos de issue
    if (issueProjectSelect) {
      issueProjectSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const projectId = selectedOption.getAttribute('data-project-id');
        if (projectId) {
          issueTypeSelect.innerHTML = '<option value="">Carregando tipos...</option>';
          fetchJiraIssueTypes(projectId);
        }
      });
    }

    // Função para popular o select de tipos de issue
    function populateIssueTypeSelect(issueTypes) {
      jiraIssueTypes = issueTypes;
      issueTypeSelect.innerHTML = '';

      // Filtra tipos que não são subtasks
      const nonSubtaskTypes = issueTypes.filter(type => !type.subtask);

      if (nonSubtaskTypes.length === 0) {
        issueTypeSelect.innerHTML = '<option value="">Nenhum tipo disponível</option>';
        return;
      }

      nonSubtaskTypes.forEach((type, index) => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        // Seleciona o primeiro item automaticamente
        if (index === 0) {
          option.selected = true;
        }
        issueTypeSelect.appendChild(option);
      });
    }

    // Função para atualizar card com informações da issue criada
    function updateCardWithIssue(issueData) {
      // Encontra o card pela localização e linha
      const targetCard = Array.from(cards).find(card => {
        const cardLocation = card.getAttribute('data-location');
        const cardLine = Number(card.getAttribute('data-line'));
        return cardLocation === issueData.location && cardLine === issueData.line;
      });

      if (!targetCard) return;

      // Atualiza data attributes com informações da issue
      targetCard.setAttribute('data-issue-id', issueData.id);
      targetCard.setAttribute('data-issue-key', issueData.key);
      targetCard.setAttribute('data-issue-link', issueData.link);

      // Atualiza menu do card
      const createIssueOption = targetCard.querySelector('[data-menu-create-issue]');
      const viewIssueOption = targetCard.querySelector('[data-menu-view-issue]');

      if (createIssueOption) {
        createIssueOption.setAttribute('hidden', '');
      }
      if (viewIssueOption) {
        viewIssueOption.removeAttribute('hidden');
      }

      // Adiciona badge visual no card
      const header = targetCard.querySelector('.card__header');
      if (header && !header.querySelector('.issue-badge')) {
        const badge = document.createElement('span');
        badge.className = 'issue-badge';
        badge.textContent = issueData.key;
        badge.title = 'Clique para abrir a issue no Jira';
        badge.addEventListener('click', (e) => {
          e.stopPropagation();
          vscode.postMessage({ type: 'openExternal', url: issueData.link });
        });
        header.insertBefore(badge, header.firstChild);
      }
    }

    // Função para abrir o modal de criação de issue
    async function openIssueModal(data) {
      currentIssueData = data;
      issueSummaryInput.value = data.description || '';
      issueDescriptionInput.value = data.description || '';
      issueLocationInput.value = data.location || '';
      issueModal.removeAttribute('hidden');

      // Busca projetos se ainda não foram carregados
      // Issue types serão carregados automaticamente quando o projeto for selecionado
      if (jiraProjects.length === 0) {
        await fetchJiraProjects();
      } else if (issueProjectSelect.selectedIndex >= 0) {
        // Se já tem projetos carregados, busca tipos do projeto selecionado
        const selectedOption = issueProjectSelect.options[issueProjectSelect.selectedIndex];
        const projectId = selectedOption.getAttribute('data-project-id');
        if (projectId) {
          fetchJiraIssueTypes(projectId);
        }
      }

      issueSummaryInput.focus();
      issueSummaryInput.select();
    }

    // Função para fechar o modal
    function closeIssueModal() {
      issueModal.setAttribute('hidden', '');
      issueForm.reset();
      currentIssueData = null;
    }

    // Eventos do modal
    modalClose.addEventListener('click', closeIssueModal);
    modalCancel.addEventListener('click', closeIssueModal);

    // Fechar modal ao clicar no overlay
    issueModal.querySelector('.modal__overlay').addEventListener('click', closeIssueModal);

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !issueModal.hasAttribute('hidden')) {
        closeIssueModal();
      }
    });

    // Submit do formulário
    issueForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!currentIssueData) return;

      const formData = new FormData(issueForm);
      const summary = formData.get('summary');
      const description = formData.get('description');
      const projectKey = formData.get('project');
      const issueTypeId = formData.get('issueType');

      if (!projectKey) {
        alert('Por favor, selecione um projeto');
        return;
      }

      if (!issueTypeId) {
        alert('Por favor, selecione um tipo de issue');
        return;
      }

      // Envia mensagem para criar issue
      vscode.postMessage({
        type: 'createIssue',
        filePath: currentIssueData.filePath,
        location: currentIssueData.location,
        line: currentIssueData.line,
        daysOld: currentIssueData.daysOld,
        description: description ?? summary,
        summary,
        projectKey,
        issueTypeId,
      });

      closeIssueModal();
    });

    // Initialize
    updateResetButtonVisibility();
  `;
}
