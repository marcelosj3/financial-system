import { UI } from "./UI/index.js";
import { Backend } from './backend/index.js';

// Create a new instance of Backend and inject data
new Backend().injectData();

// Create a new instance of UI and inject UI changes
new UI().injectUI();
