import { BsShopWindow } from "react-icons/bs";

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
    <div className="p-6 bg-orange-50 border border-orange-100 rounded-3xl">
      <BsShopWindow className="h-12 w-12 text-[#E87722]" />
    </div>
    <h2 className="text-2xl font-black text-gray-900">{title}</h2>
    <p className="text-gray-400 text-sm max-w-xs">This section is coming soon. Stay tuned for updates!</p>
  </div>
);

export default Placeholder;
