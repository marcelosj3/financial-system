import { Sidebar } from "./sidebar.js"

export class UI {
    sidebar = {}

    constructor({ sidebar } = {}) {
        this.sidebar = sidebar || new Sidebar()
    }

    injectUI() {
        this.sidebar.injectItems()
    }
}