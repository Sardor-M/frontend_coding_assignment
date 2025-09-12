import { Search } from "lucide-react";
import { useRecoilState } from "recoil";
import { Input } from "@/components/ui/Input";
import { searchQueryAtom } from "@/atoms/project";

export default function ProjectSearch() {
  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryAtom);

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        type="text"
        placeholder="Search project"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
