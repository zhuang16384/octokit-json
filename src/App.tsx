import { createSignal, onMount } from 'solid-js';
import Split from 'split.js';
import { CodeEditor } from './components/CodeEditor';
import { JsonGrid } from './components/JsonGrid';

function App() {
    const [jsonText, setJsonText] = createSignal('[\n  { "id": 1, "name": "Alice", "active": true, "role": "Admin", "details": { "login": "2024-01-01" } },\n  { "id": 2, "name": "Bob", "active": false, "role": "User", "details": { "login": "2024-01-02" } },\n  { "id": 3, "name": "Charlie", "active": true, "role": "User", "details": { "login": "2024-01-03" } }\n]');
    const [parsedData, setParsedData] = createSignal<any>(null);

    // Parse JSON derived from text, handle errors silently or expose them
    createSignal(() => {
        try {
            const parsed = JSON.parse(jsonText());
            setParsedData(parsed);
        } catch (e) {
            setParsedData(undefined);
        }
    });

    // Actually we can just use a memo or effect.
    // Ideally we parse on every change of jsonText
    const data = () => {
        try {
            return JSON.parse(jsonText());
        } catch (e) {
            return undefined;
        }
    }

    onMount(() => {
        Split(['#split-0', '#split-1'], {
            sizes: [50, 50],
            minSize: 200,
            gutterSize: 10,
            cursor: 'col-resize',
        });
    });

    return (
        <div class="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden">
            {/* Header (Optional) */}

            <div class="flex flex-1 overflow-hidden relative">
                <div id="split-0" class="flex flex-col h-full overflow-hidden">
                    <CodeEditor value={jsonText()} onChange={setJsonText} />
                </div>

                <div id="split-1" class="flex flex-col h-full overflow-hidden">
                    <JsonGrid data={data()} />
                </div>
            </div>
        </div>
    );
}

export default App;
