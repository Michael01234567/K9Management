interface FitnessStatusBadgeProps {
  status: string | null | undefined;
  size?: 'sm' | 'md';
}

export function FitnessStatusBadge({ status, size = 'md' }: FitnessStatusBadgeProps) {
  if (!status) {
    return <span className="text-stone-400 text-sm">N/A</span>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fit':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Training Only':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sick':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Estrus':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'After Care':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${getStatusColor(status)} ${sizeClasses}`}
    >
      {status}
    </span>
  );
}
