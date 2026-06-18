type StatCardProps = {
  label: string;
  value: React.ReactNode;
};

export const StatCard = ({ label, value }: StatCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 min-w-[100px] px-6 py-2">
      <p className="font-mono text-xs text-neutral-500 uppercase tracking-wider">{label}</p>
      <div className="mt-1 flex gap-2 items-baseline">{value}</div>
    </div>
  );
};
