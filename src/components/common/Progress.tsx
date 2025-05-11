interface ProgressProps {
  //@ts-expect-error ignore warning
  icon: JSX.Element;
  symbol?: string;
  text: string;
}

const Progress: React.FC<ProgressProps> = ({ icon, symbol, text }) => {
  return (
    <li className="py-1 flex items-start gap-3">
      <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
        {icon}
      </span>
      <div className="content text-xs text-gray-400">
        <p className="m-0">{text} {symbol}</p>
      </div>
    </li>
  );
};

export default Progress