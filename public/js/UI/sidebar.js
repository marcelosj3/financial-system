export class Sidebar {
    SIDEBAR_UL_SELECTOR = "#sidebar ul"
    SIDEBAR_ITEMS = [
        { title: "Dashboard", iconPath: "../../assets/icons/gauge-high-solid.svg", href: "/" },
        { title: "Customers", iconPath: "../../assets/icons/users-solid.svg", href: "../../pages/customers.html" },
        { title: "Projects", iconPath: "../../assets/icons/clipboard-regular.svg", href: "../../pages/projects.html" },
        { title: "Orders", iconPath: "../../assets/icons/bag-shopping-solid.svg", href: "../../pages/orders.html" },
        { title: "Inventory", iconPath: "../../assets/icons/warehouse-solid.svg", href: "../../pages/inventory.html" },
        { title: "Accounts", iconPath: "../../assets/icons/user-regular.svg", href: "../../pages/accounts.html" },
        { title: "Tasks", iconPath: "../../assets/icons/list-check-solid.svg", href: "../../pages/tasks.html" },
    ]

    constructor() { }

    async injectItems() {
        const sidebarUL = document.querySelector(this.SIDEBAR_UL_SELECTOR)

        for (const item of this.SIDEBAR_ITEMS) {
            const { title, iconPath, href } = item

            const listItem = document.createElement("li")
            const anchor = document.createElement("a")
            const span = document.createElement("span")
            const svgContainer = document.createElement("div")

            const svg = await this.fetchSVG(iconPath)
            this.setActive(listItem, title, href)

            svgContainer.innerHTML = svg
            span.textContent = title
            listItem.title = title

            listItem.appendChild(svgContainer)
            listItem.appendChild(span)
            anchor.appendChild(listItem)
            anchor.href = href
            sidebarUL.appendChild(anchor)
        }
    }

    async fetchSVG(iconPath) {
        return await fetch(iconPath)
            .then(response => response.text())
            .then(svgData => svgData)
            .catch(error => console.error("Error loading SVG:", error));
    }

    setActive(listItem, title, href) {
        const pathName = window.location.pathname
        const hasHTML = pathName.includes("html")
        if (!hasHTML && pathName === href) return listItem.classList.add("active")
        if (pathName.includes(title.toLowerCase())) listItem.classList.add("active")
    }
}