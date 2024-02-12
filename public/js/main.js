import { UI } from "./UI/index.js";
import { Backend } from './backend/index.js';

// Injects backend data
new Backend().injectData();
new UI().injectUI()