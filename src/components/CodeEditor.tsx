import { createEffect, onCleanup, onMount, createSignal, Show } from 'solid-js';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { Button } from "@/components/ui/button";
import { FileJson, AlignLeft, Minimize, Play, Eraser, Copy, Clipboard } from "lucide-solid";

self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new jsonWorker();
        }
        return new editorWorker();
    },
};

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function CodeEditor(props: CodeEditorProps) {
    let containerRef: HTMLDivElement | undefined;
    let editor: monaco.editor.IStandaloneCodeEditor | undefined;
    const [isValid, setIsValid] = createSignal(true);

    onMount(() => {
        if (!containerRef) return;

        editor = monaco.editor.create(containerRef, {
            value: props.value,
            language: 'json',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            padding: { top: 16, bottom: 16 },
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            folding: true,
            formatOnPaste: true,
            formatOnType: true,
        });

        const subscription = editor.onDidChangeModelContent(() => {
            const val = editor?.getValue();
            if (val !== undefined) {
                // Check validity
                try {
                    JSON.parse(val);
                    setIsValid(true);
                } catch (e) {
                    setIsValid(false);
                }

                if (val !== props.value) {
                    props.onChange(val);
                }
            }
        });

        onCleanup(() => {
            subscription.dispose();
            editor?.dispose();
        });
    });

    createEffect(() => {
        if (editor && editor.getValue() !== props.value) {
            const pos = editor.getPosition();
            editor.setValue(props.value);
            if (pos) editor.setPosition(pos);
        }
    });

    const format = () => {
        editor?.getAction('editor.action.formatDocument')?.run();
    };

    const minify = () => {
        try {
            const val = editor?.getValue();
            if (val) {
                const minified = JSON.stringify(JSON.parse(val));
                editor?.setValue(minified);
            }
        } catch (e) { }
    };

    const clear = () => {
        editor?.setValue('');
        editor?.focus();
    };

    const copy = async () => {
        const val = editor?.getValue();
        if (val) {
            await navigator.clipboard.writeText(val);
        }
    };

    const paste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text && editor) {
                const selection = editor.getSelection();
                const range = selection ? new monaco.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn) : null;
                const id = { major: 1, minor: 1 };
                const op = { identifier: id, range: range!, text: text, forceMoveMarkers: true };
                editor.executeEdits("my-source", [op]);
                editor.focus();
            }
        } catch (e) {
            console.error("Failed to paste:", e);
        }
    }


    return (
        <div class="flex flex-col h-full w-full bg-[#1e1e1e] border-r border-[#333]">
            <div class="h-12 bg-[#252526] flex items-center px-4 space-x-2 border-b border-[#333] shrink-0">
                <div class="flex items-center mr-4">
                    <FileJson class="w-5 h-5 text-blue-500 mr-2" />
                    <span class="font-bold text-sm text-gray-200">JSON EDITOR</span>
                    <Show when={!isValid()}>
                        <span class="ml-2 text-xs text-red-500 font-mono">[Invalid]</span>
                    </Show>
                </div>

                <div class="flex-1" />

                <div class="flex gap-1">
                    <Button variant="ghost" size="sm" class="h-7 px-2 text-gray-400 hover:text-white hover:bg-[#333]" onClick={paste} title="Paste">
                        <Clipboard class="w-3.5 h-3.5 mr-1.5" />
                        <span class="text-xs">Paste</span>
                    </Button>
                    <Button variant="ghost" size="sm" class="h-7 px-2 text-gray-400 hover:text-white hover:bg-[#333]" onClick={copy} title="Copy">
                        <Copy class="w-3.5 h-3.5 mr-1.5" />
                        <span class="text-xs">Copy</span>
                    </Button>
                    <div class="w-[1px] h-4 bg-[#444] mx-1 my-auto" />
                    <Button variant="ghost" size="sm" class="h-7 px-2 text-gray-400 hover:text-white hover:bg-[#333]" onClick={format} title="Format">
                        <AlignLeft class="w-3.5 h-3.5 mr-1.5" />
                        <span class="text-xs">Format</span>
                    </Button>
                    <Button variant="ghost" size="sm" class="h-7 px-2 text-gray-400 hover:text-white hover:bg-[#333]" onClick={minify} title="Minify">
                        <Minimize class="w-3.5 h-3.5 mr-1.5" />
                        <span class="text-xs">Minify</span>
                    </Button>
                    <div class="w-[1px] h-4 bg-[#444] mx-1 my-auto" />
                    <Button variant="ghost" size="sm" class="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={clear} title="Clear">
                        <Eraser class="w-3.5 h-3.5 mr-1.5" />
                        <span class="text-xs">Clear</span>
                    </Button>
                </div>
            </div>
            <div ref={containerRef} class="flex-1 overflow-hidden" />
        </div>
    );
}
