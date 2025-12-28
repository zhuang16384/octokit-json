import { For, Show, createSignal, createMemo } from 'solid-js';
import { createVirtualizer } from '@tanstack/solid-virtual';
import { cn } from "@/lib/utils";
import { Filter, ChevronUp, ChevronDown, Check, X } from 'lucide-solid';

const TableCell = (props: { value: any }) => {
    // Determine type for styling
    const type = typeof props.value;
    const isNull = props.value === null;

    if (isNull) return <div class="px-2 py-1.5 border-r border-[#333] text-gray-500 italic text-xs h-full flex items-center overflow-hidden">null</div>;

    if (type === 'boolean') {
        return (
            <div class={cn("px-2 py-1.5 border-r border-[#333] text-xs font-bold h-full flex items-center", props.value ? "text-green-500" : "text-red-500")}>
                <Show when={props.value} fallback={<X class="w-3 h-3 mr-1" />}>
                    <Check class="w-3 h-3 mr-1" />
                </Show>
                {String(props.value)}
            </div>
        );
    }

    if (type === 'number') {
        return <div class="px-2 py-1.5 border-r border-[#333] text-blue-400 text-xs text-right h-full flex items-center justify-end font-mono">{props.value}</div>;
    }

    if (type === 'object') {
        const isArray = Array.isArray(props.value);
        const label = isArray ? `[array(${props.value.length})]` : `{object}`;
        return (
            <div class="px-2 py-1.5 border-r border-[#333] text-purple-400 text-xs italic cursor-pointer hover:underline h-full flex items-center" title={JSON.stringify(props.value)}>
                {label}
            </div>
        );
    }

    // Default String
    return <div class="px-2 py-1.5 border-r border-[#333] text-gray-300 text-xs h-full flex items-center truncate" title={String(props.value)}>{String(props.value)}</div>;
}

export function JsonTable(props: { data: any[] }) {
    let parentRef: HTMLDivElement | undefined;

    const [sortCol, setSortCol] = createSignal<string | null>(null);
    const [sortDesc, setSortDesc] = createSignal(false);
    const [filterText, setFilterText] = createSignal("");

    // 1. Schema Inference: Gather all unique keys
    const columns = createMemo(() => {
        const keys = new Set<string>();
        props.data.forEach(item => {
            if (typeof item === 'object' && item !== null) {
                Object.keys(item).forEach(k => keys.add(k));
            } else {
                keys.add("value");
            }
        });
        return Array.from(keys);
    });

    // 2. Process Data: Filter -> Sort
    const sortedData = createMemo(() => {
        let d = props.data;

        // Filter
        if (filterText()) {
            const lowerFilter = filterText().toLowerCase();
            d = d.filter(item => {
                const s = JSON.stringify(item).toLowerCase();
                return s.includes(lowerFilter);
            });
        }

        // Sort
        if (sortCol()) {
            const col = sortCol()!;
            d = [...d].sort((a, b) => {
                const valA = (col === "value") ? a : a[col];
                const valB = (col === "value") ? b : b[col];

                if (valA === valB) return 0;
                if (valA === undefined) return 1;
                if (valB === undefined) return -1;

                const comp = valA < valB ? -1 : 1;
                return sortDesc() ? -comp : comp;
            });
        }

        return d;
    });

    // 3. Virtualizer
    const rowVirtualizer = createVirtualizer({
        get count() { return sortedData().length },
        getScrollElement: () => parentRef || null,
        estimateSize: () => 35, // Row height
        overscan: 5,
    });

    const toggleSort = (col: string) => {
        if (sortCol() === col) {
            if (sortDesc()) {
                setSortCol(null);
                setSortDesc(false);
            } else {
                setSortDesc(true);
            }
        } else {
            setSortCol(col);
            setSortDesc(false);
        }
    };

    return (
        <div class="flex flex-col h-full w-full bg-[#1e1e1e]">
            {/* Toolbar / Global Filter */}
            <div class="h-12 bg-[#252526] border-b border-[#333] flex items-center px-4 space-x-2 shrink-0">
                <div class="flex items-center mr-4">
                    <div class="w-5 h-5 text-green-500 mr-2 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" /></svg>
                    </div>
                    {/* Using hardcoded SVG or Grid icon if available in scope. The user has 'Grid' from lucide-solid imported in JsonGrid, but generic Table icon here is fine or we can import Grid */}
                    <span class="font-bold text-sm text-gray-200">SMART GRID</span>
                </div>

                <div class="flex-1" />

                <div class="relative flex items-center group">
                    <Filter class="w-3.5 h-3.5 text-gray-400 absolute left-2 pointer-events-none group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter data..."
                        class="bg-[#1e1e1e] border border-[#333] text-xs text-gray-300 pl-8 pr-2 py-1 h-7 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-48 transition-all"
                        value={filterText()}
                        onInput={(e) => setFilterText(e.currentTarget.value)}
                    />
                    <Show when={filterText()}>
                        <button onClick={() => setFilterText('')} class="absolute right-2 text-gray-500 hover:text-white">
                            <X class="w-3 h-3" />
                        </button>
                    </Show>
                </div>

                <div class="w-[1px] h-4 bg-[#444] mx-2" />

                <div class="text-xs text-gray-500 font-mono">
                    {sortedData().length} <span class="hidden sm:inline">rows</span>
                </div>
            </div>

            {/* Grid Header */}
            <div class="flex bg-[#2d2d2d] border-b border-[#333] overflow-hidden shrink-0" style={{ "padding-right": "15px" }}> {/* padding for scrollbar */}
                {/* Index Header */}
                <div class="flex-shrink-0 w-12 border-r border-[#333] px-2 py-2 text-xs font-bold text-gray-400 bg-[#2d2d2d] truncate">#</div>

                <For each={columns()}>
                    {(col) => (
                        <div
                            class="flex-1 min-w-[150px] border-r border-[#333] px-2 py-2 text-xs font-bold text-gray-300 bg-[#2d2d2d] cursor-pointer hover:bg-[#383838] flex items-center justify-between select-none"
                            onClick={() => toggleSort(col)}
                        >
                            <span class="truncate">{col}</span>
                            <div class="flex flex-col">
                                <Show when={sortCol() === col}>
                                    <Show when={!sortDesc()} fallback={<ChevronDown class="w-3 h-3 text-blue-400" />}>
                                        <ChevronUp class="w-3 h-3 text-blue-400" />
                                    </Show>
                                </Show>
                                <Show when={sortCol() !== col}>
                                    <div class="w-3 h-3" />
                                </Show>
                            </div>
                        </div>
                    )}
                </For>
            </div>


            {/* Virtualized Body */}
            <div
                ref={parentRef}
                class="flex-1 overflow-auto"
            >
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    <For each={rowVirtualizer.getVirtualItems()}>
                        {(virtualRow) => {
                            const row = sortedData()[virtualRow.index];
                            return (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                    class={cn("flex hover:bg-[#2a2d2e] transition-colors border-b border-[#333] box-border", virtualRow.index % 2 === 0 ? "bg-[#1e1e1e]" : "bg-[#1e1e1e]")}
                                >
                                    {/* Index Column */}
                                    <div class="flex-shrink-0 w-12 border-r border-[#333] px-2 py-1.5 text-xs text-gray-500 text-center bg-[#252526] h-full flex items-center justify-center">
                                        {virtualRow.index + 1}
                                    </div>

                                    <For each={columns()}>
                                        {(col) => {
                                            let val;
                                            if (col === 'value' && (typeof row !== 'object' || row === null)) {
                                                val = row;
                                            } else {
                                                val = row[col];
                                            }
                                            return (
                                                <div class="flex-1 min-w-[150px] overflow-hidden h-full">
                                                    <Show when={val !== undefined} fallback={<div class="h-full border-r border-[#333] bg-[#252526]/50"></div>}>
                                                        <TableCell value={val} />
                                                    </Show>
                                                </div>
                                            )
                                        }}
                                    </For>
                                </div>
                            );
                        }}
                    </For>
                </div>
            </div>
        </div>
    );
}
