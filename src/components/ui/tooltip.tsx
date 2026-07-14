import { Tooltip as ReactTooltip, type PlacesType } from 'react-tooltip';

/**
 * Single source of truth for icon tooltip styling, so every hover label across
 * the app matches. Mirrors the platform's small bordered surfaces (sound/user
 * popovers): dark chip, thin neutral border, mono micro-text.
 *
 * Usage: put `data-tooltip-id` + `data-tooltip-content` on the trigger, and
 * render one <AppTooltip id={...} /> anywhere in the same tree. Multiple
 * triggers can share a single instance.
 */
export const TOOLTIP_CLASS =
  '!bg-neutral-800 !text-neutral-0 !text-xs !px-3 !py-1 !rounded-md !border !border-neutral-700 !font-mono';

type AppTooltipProps = {
  id: string;
  place?: PlacesType;
};

export const AppTooltip = ({ id, place = 'top' }: AppTooltipProps) => (
  <ReactTooltip id={id} place={place} className={TOOLTIP_CLASS} delayShow={150} />
);
