import { For, Show, createSignal } from 'solid-js';
import { Button } from "@/components/ui/button";
import { Grid, Filter, ChevronsUpDown, Search, Maximize2 } from "lucide-solid";
import { JsonTable } from "./JsonTable";

// Recursive Component
const JsonNode = (props: { value: any, name?: string, isLast: boolean }) => {
    const [collapsed, setCollapsed] = createSignal(false);

    const isObject = typeof props.value === 'object' && props.value !== null;
    const isArray = Array.isArray(props.value);

    // Primitive rendering
    if (!isObject) {
        let colorClass = 'text-gray-300';
        if (typeof props.value === 'string') colorClass = 'text-yellow-300';
        if (typeof props.value === 'number') colorClass = 'text-green-400';
        if (typeof props.value === 'boolean') colorClass = 'text-blue-400';
        if (props.value === null) colorClass = 'text-gray-500';

        const displayValue = typeof props.value === 'string' ? `"${props.value}"` : String(props.value);

        return (
            <div class="hover:bg-white/5 px-1 py-0.5 rounded">
                <Show when={props.name}>
                    <span class="text-purple-400 mr-1">"{props.name}":</span>
                </Show>
                <span class={colorClass}>{displayValue}</span>
                <Show when={!props.isLast}>
                    <span class="text-gray-500">,</span>
                </Show>
            </div>
        );
    }

    // Object/Array rendering
    const keys = Object.keys(props.value);
    const isEmpty = keys.length === 0;
    const openChar = isArray ? '[' : '{';
    const closeChar = isArray ? ']' : '}';

    if (isEmpty) {
        return (
            <div class="hover:bg-white/5 px-1 py-0.5 rounded">
                <Show when={props.name}>
                    <span class="text-purple-400 mr-1">"{props.name}":</span>
                </Show>
                <span class="text-gray-500">{openChar}{closeChar}</span>
                <Show when={!props.isLast}>
                    <span class="text-gray-500">,</span>
                </Show>
            </div>
        )
    }

    return (
        <div class="py-0.5">
            <div class="flex items-center hover:bg-white/5 px-1 rounded cursor-pointer" onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed()) }}>
                <span class="text-gray-500 mr-1 w-4 text-center select-none">{collapsed() ? '▶' : '▼'}</span>
                <Show when={props.name}>
                    <span class="text-purple-400 mr-1">"{props.name}":</span>
                </Show>
                <span class="text-gray-400">{openChar}</span>
                <Show when={collapsed()}>
                    <span class="text-gray-500 mx-1">...</span>
                    <span class="text-gray-400">{closeChar}</span>
                    <Show when={!props.isLast}>
                        <span class="text-gray-500">,</span>
                    </Show>
                </Show>
            </div>

            <Show when={!collapsed()}>
                <div class="pl-6 border-l border-gray-700 ml-2">
                    <For each={keys}>
                        {(key, i) => (
                            <JsonNode
                                value={props.value[key]}
                                name={isArray ? undefined : key}
                                isLast={i() === keys.length - 1}
                            />
                        )}
                    </For>
                </div>
                <div class="pl-2 hover:bg-white/5 rounded">
                    <span class="text-gray-400">{closeChar}</span>
                    <Show when={!props.isLast}>
                        <span class="text-gray-500">,</span>
                    </Show>
                </div>
            </Show>
        </div>
    );
}

export function JsonGrid(props: { data: any }) {
    const isArray = () => Array.isArray(props.data);
    const isObject = () => typeof props.data === 'object' && props.data !== null && !isArray();

    // Transform Object to Key-Value array for table view
    const keyValueData = () => {
        if (isObject()) {
            return Object.entries(props.data).map(([k, v]) => ({ key: k, value: v }));
        }
        return [];
    };

    return (
        <div class="flex flex-col h-full w-full bg-[#1e1e1e] border-l border-[#333]">
            <div class="flex-1 overflow-hidden bg-[#1e1e1e]">
                <Show when={props.data !== undefined} fallback={
                    <div class="flex flex-col items-center justify-center h-full text-gray-500">
                        <div class="text-sm">Invalid JSON or Empty</div>
                    </div>
                }>
                    <Show
                        when={isArray()}
                        fallback={
                            <Show when={isObject()} fallback={<div class="p-4 font-mono text-sm text-foreground"><JsonNode value={props.data} isLast={true} /></div>}>
                                <JsonTable data={keyValueData()} />
                            </Show>
                        }
                    >
                        <JsonTable data={props.data} />
                    </Show>
                </Show>
            </div>
        </div>
    );
}
