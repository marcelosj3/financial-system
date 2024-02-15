import { Utils } from "../utils.js";

export class Metrics {
    CONTAINER_SELECTOR = "";
    CARDS_CONTAINER_SELECTOR = "";
    CHART_CONTAINER_SELECTOR = ""
    CHART_SELECTOR = ""
    CHART_STATE_MANAGER_SELECTOR = ""
    DATA = []

    utils = {};

    /**
     * Initializes the Input class with the specified options.
     */
    constructor({ containerSelector, cardsContainerSelector, chartContainerSelector, chartSelector, chartStateManagerSelector, data, utils }) {
        this.CONTAINER_SELECTOR = containerSelector;
        this.CARDS_CONTAINER_SELECTOR = cardsContainerSelector;
        this.CHART_CONTAINER_SELECTOR = chartContainerSelector;
        this.CHART_SELECTOR = chartSelector;
        this.CHART_STATE_MANAGER_SELECTOR = chartStateManagerSelector
        this.DATA = data;

        this.utils = utils || new Utils();
    }

    /**
     * Generates an HTML card and implements data via dependency injection.
     */
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

    /**
     * Injects cards into the DOM using the provided data.
     */
    injectCards({ container, data }) {
        const cardsContainer = container.querySelector(this.CARDS_CONTAINER_SELECTOR)
        cardsContainer.innerHTML = ""

        if (!data) return

        data.forEach((values) => {
            const card = this.generateCard(values)
            cardsContainer.appendChild(card)
        })
    }


    isEmptyChart({ data } = {}) {
        return !data?.datasets.map(dataset => dataset?.data?.length).reduce((acc, val) => acc += val)
    }

    injectEmptyChartState({ stateManager } = {}) {
        const section = document.createElement("section")
        const heading = document.createElement("h6")
        const paragraph = document.createElement("p")

        heading.textContent = "No results found for these filters! "
        paragraph.textContent = "Let's try something else."

        const stateManagerClasses = ["position-absolute", "top-0", "left-0", "bottom-0", "right-0", "bg-danger", "h-100", "w-100"]
        const sectionClasses = ["not-found", "d-flex", "flex-column", "flex-fill", "align-items-center", "justify-content-center", "h-100"]
        const headingClasses = ["m-0"]

        container.classList.add("position-relative")
        stateManagerClasses.forEach(klass => stateManager.classList.add(klass))
        sectionClasses.forEach(klass => section.classList.add(klass))
        headingClasses.forEach(klass => heading.classList.add(klass))

        stateManager.setAttribute("style", "--bs-bg-opacity: .5;")

        section.appendChild(heading)
        section.appendChild(paragraph)
        stateManager.appendChild(section)
    }

    /**
     * Injects data into the chart using the provided information.
     */
    injectChartData({ data }) {
        const container = document.querySelector(this.CHART_CONTAINER_SELECTOR);
        const stateManager = container.querySelector(this.CHART_STATE_MANAGER_SELECTOR)
        const ctx = container.querySelector(this.CHART_SELECTOR);

        stateManager.innerHTML = ""
        stateManager.classList = "metrics-chart-state-manager"

        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
            existingChart.destroy();
        }

        ctx.setAttribute("height", 750)

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data?.labels || [],
                datasets: data?.datasets || []
            },
            options: {
                showTooltips: true,
                responsive: true,
                maintainAspectRatio: false,
                spanGaps: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        if (this.isEmptyChart({ data })) this.injectEmptyChartState({ stateManager })
    }

    /**
    * Injects data into both cards and chart using the provided information.
    */
    injectData({ cardsData, chartData }) {
        const container = document.querySelector(this.CONTAINER_SELECTOR)
        this.injectCards({ container, data: cardsData })
        this.injectChartData({ data: chartData })
    }
}