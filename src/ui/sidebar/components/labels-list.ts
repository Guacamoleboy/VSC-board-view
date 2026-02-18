import { iconsSvg } from "@/ui/icons";
import { getLabelIconSvg } from "@/utils/label";

export function renderLabelsList(
  labelCounts: Map<string, number>,
  activeLabels: string[] = [],
): string {
  if (labelCounts.size === 0) {
    return `
      <div class="empty-state">
        ${iconsSvg.sparkle}
        <p>No labels found yet.<br>Start adding labels to your KanBan Tasks!</p>
      </div>
    `;
  }

  return Array.from(labelCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => {
      const isActive = activeLabels.includes(label);
      const activeClass = isActive ? " label-item--active" : "";

      return `
          <div
            class="label-item ${activeClass}"
            data-label="${label}"
            title="Click to filter by '${label}'"
          >
            <div class="label-item__info">
              <div class="label-item__icon">
                ${getLabelIconSvg(label)}
              </div>
              <span class="label-item__name">${label}</span>
            </div>
            <span class="label-item__count">${count}</span>
          </div>
        `;
    })
    .join("");
}
