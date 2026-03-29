import * as React from "react";
import { CaretDown, MagnifyingGlass, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PLATFORM_ICONS, getPlatformIcon } from "@/lib/platform-icons";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string;
  onChange: (id: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selected = getPlatformIcon(value);
  const SelectedIcon = selected.Icon;

  const filteredIcons = PLATFORM_ICONS.filter((icon) =>
    icon.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 px-3 font-normal"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <SelectedIcon size={14} weight="fill" />
            </div>
            <span className="truncate">{selected.label}</span>
          </div>
          <CaretDown size={14} className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="flex items-center border-b px-3 h-10">
          <MagnifyingGlass size={14} className="mr-2 shrink-0 opacity-50" />
          <input
            className="flex h-full w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Buscar plataforma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
          {filteredIcons.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No se encontraron resultados
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1 p-1">
              {filteredIcons.map((icon) => {
                const Icon = icon.Icon;
                const isSelected = value === icon.id;
                return (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() => {
                      onChange(icon.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "group relative flex flex-col items-center justify-center gap-1 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-primary/10 text-primary ring-1 ring-primary/20"
                    )}
                    title={icon.label}
                  >
                    <Icon
                      size={20}
                      weight={isSelected ? "fill" : "regular"}
                      className={cn(
                        "transition-transform group-hover:scale-110",
                        isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span className="w-full truncate text-[10px] text-center opacity-70 group-hover:opacity-100">
                      {icon.label}
                    </span>
                    {isSelected && (
                      <div className="absolute right-1 top-1">
                        <Check size={8} weight="bold" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
