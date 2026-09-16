import { Building2, TrainFront } from "lucide-react";
import type { AutocompleteItem } from "../services/autocompleteService";

interface SearchAutocompleteDropdownProps {
  suggestions: AutocompleteItem[];
  selectedIndex: number;
  onSelect: (item: AutocompleteItem) => void;
  visible: boolean;
}

export function SearchAutocompleteDropdown({
  suggestions,
  selectedIndex,
  onSelect,
  visible,
}: SearchAutocompleteDropdownProps) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div
      role="listbox"
      className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-[#164B5A] bg-[#071A33] p-1.5 text-left shadow-2xl backdrop-blur-md"
    >
      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
        Matching Stations & Trains
      </div>
      <div className="space-y-0.5">
        {suggestions.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          const isStation = item.type === "station";

          return (
            <div
              key={item.id}
              role="option"
              aria-selected={isSelected}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevents blur before click registers
                onSelect(item);
              }}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition cursor-pointer ${
                isSelected
                  ? "bg-[#0E5961] text-white"
                  : "text-[#D7E5EC] hover:bg-[#08383D] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                    isStation
                      ? "bg-[#071A33] text-[#0E7C86] border border-[#164B5A]"
                      : "bg-[#071A33] text-[#F59E0B] border border-[#164B5A]"
                  }`}
                >
                  {isStation ? <Building2 size={14} /> : <TrainFront size={14} />}
                </div>

                <div className="truncate">
                  <div className="font-semibold text-white truncate">
                    {item.title}
                  </div>
                  {item.secondaryInfo && (
                    <div className="text-[10px] text-[#9FB8BE] truncate">
                      {item.secondaryInfo}
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-3 shrink-0 text-right font-mono">
                <span className="rounded bg-[#071A33] border border-[#164B5A] px-1.5 py-0.5 text-[10px] font-bold text-[#F59E0B]">
                  {item.codeOrNumber}
                </span>
                <div className="text-[9px] uppercase tracking-wider text-[#9FB8BE] mt-0.5">
                  {isStation ? "Station" : "Train"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
