export default function Logo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="10" className="fill-brand-600 dark:fill-brand-500" />
      <path
        d="M12 24c0-2.5 1.5-4.5 4.5-5.5l-1.5-2.5c2-.5 3.5.5 4.5 2l4-6c1.5 2 2.5 4 3 6.5l-4.5 2c0 2.5-1.5 4.5-4.5 5.5l1.5 2.5c-2 .5-3.5-.5-4.5-2l-4 6c-1.5-2-2.5-4-3-6.5l4.5-2z"
        fill="white"
      />
      <circle cx="20" cy="20" r="3" fill="white" fillOpacity="0.3" />
      <path
        d="M28 14l-2 2m-12 8l-2 2"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
    </svg>
  )
}
