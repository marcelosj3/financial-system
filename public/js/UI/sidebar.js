export class Sidebar {
    SIDEBAR_UL_SELECTOR = "#sidebar ul"
    SIDEBAR_ITEMS = [
        { title: "Dashboard", href: "/" },
        { title: "Customers", href: "../../pages/customers.html" },
        { title: "Projects", href: "../../pages/projects.html" },
        { title: "Orders", href: "../../pages/orders.html" },
        { title: "Inventory", href: "../../pages/inventory.html" },
        { title: "Accounts", href: "../../pages/accounts.html" },
        { title: "Tasks", href: "../../pages/tasks.html" },
    ]

    constructor() { }

    injectItems() {
        const sidebarUL = document.querySelector(this.SIDEBAR_UL_SELECTOR)

        this.SIDEBAR_ITEMS.forEach(({ title, href }, index) => {
            const listItem = document.createElement("li")
            const anchor = document.createElement("a")
            const span = document.createElement("span")

            this.setActive(listItem, title, href)

            span.textContent = title
            listItem.appendChild(span)
            anchor.appendChild(listItem)
            anchor.href = href
            sidebarUL.appendChild(anchor)
        })
    }

    setActive(listItem, title, href) {
        const pathName = window.location.pathname
        const hasHTML = pathName.includes("html")
        if (!hasHTML && pathName === href) return listItem.classList.add("active")
        if (pathName.includes(title.toLowerCase())) listItem.classList.add("active")
    }
}