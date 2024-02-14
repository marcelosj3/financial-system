import { Utils } from "../utils.js";

/**
 * Input class for handling filter inputs.
 */
export class Metrics {
    CONTAINER_SELECTOR = "";
    CARDS_CONTAINER_SELECTOR = "";
    METRICS_DATA = []

    utils = {};

    /**
     * Initializes the Input class with the specified options.
     */
    constructor({ containerSelector, cardsContainerSelector, data, utils }) {
        this.CONTAINER_SELECTOR = containerSelector;
        this.CARDS_CONTAINER_SELECTOR = cardsContainerSelector;
        this.METRICS_DATA = data;

        this.utils = utils || new Utils();
    }

    generateCard({ title, description, value, quantity }) {
        const container = document.createElement("section")
        const header = document.createElement("header")
        const body = document.createElement("main")
        const headerParagraph = document.createElement("p")
        const badge = document.createElement("span")
        const titleHeading = document.createElement("h5")
        const bodyParagraph = document.createElement("p")

        const containerClasses = ["card", "text-white", "m-0"]
        const headerClasses = ["card-header", "d-flex", "justify-content-between"]
        const headerParagraphClasses = ["m-0", "fw-bold"]
        const badgeClasses = ["badge", "bg-primary"]
        const bodyClasses = ["card-body"]
        const titleHeadingClasses = ["card-title", "text-center", "display-6", "fw-bold"]
        const bodyParagraphClasses = ["card-text", "text-center", "fs-6", "lh-1"]

        containerClasses.forEach(klass => container.classList.add(klass))
        headerClasses.forEach(klass => header.classList.add(klass))
        headerParagraphClasses.forEach(klass => headerParagraph.classList.add(klass))
        badgeClasses.forEach(klass => badge.classList.add(klass))
        bodyClasses.forEach(klass => body.classList.add(klass))
        titleHeadingClasses.forEach(klass => titleHeading.classList.add(klass))
        bodyParagraphClasses.forEach(klass => bodyParagraph.classList.add(klass))

        headerParagraph.textContent = title
        badge.textContent = quantity ?? 0
        titleHeading.textContent = this.utils.formatCurrency(value ?? 0)
        bodyParagraph.textContent = description

        header.appendChild(headerParagraph)
        header.appendChild(badge)
        body.appendChild(titleHeading)
        body.appendChild(bodyParagraph)
        container.appendChild(header)
        container.appendChild(body)
        return container
    }


    // span class="badge bg-secondary">New</span>

    injectCards({ container, data }) {
        const cardsContainer = container.querySelector(this.CARDS_CONTAINER_SELECTOR)

        if (!data) return

        data.forEach((values) => {
            const card = this.generateCard(values)
            cardsContainer.appendChild(card)
        })
    }

    injectData({ data }) {
        const container = document.querySelector(this.CONTAINER_SELECTOR)
        this.injectCards({ container, data })
    }
}