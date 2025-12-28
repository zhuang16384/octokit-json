/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';
import './style.css';

const root = document.getElementById('app');

if (root instanceof HTMLElement) {
    render(() => <App />, root);
}
