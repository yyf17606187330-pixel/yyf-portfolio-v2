export function ArrowIcon({ direction = 'up-right' }: { direction?: 'up-right' | 'down-right' | 'down-left' | 'right' }) {
  const angle = { 'up-right': 0, 'down-right': 90, 'down-left': 180, right: 45 }[direction];
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="1em" height="1em"
    fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: '-0.12em', flexShrink: 0 }}>
    <path d="M5 19 19 5M5 5h14v14" transform={`rotate(${angle} 12 12)`} />
  </svg>;
}
