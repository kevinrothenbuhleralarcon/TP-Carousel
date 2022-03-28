class Carousel {
    /**
     * @param {HTMLElement} element 
     * @param {Object} options 
     * @param {Number} options.slidesToScroll - Number of element to scroll
     * @param {Number} options.slidesVisible - Number of element visible in a slide
     * @param {boolean} options.loop - If set to false hide the arrows when there's no more item to display
     */
    constructor(element, options = {}) {
        this.element = element

        // Allow to affect default values to slidesTO Scroll and SlidesVisible of not all of them are present
        this.options = {
            slidesToScroll: Number(this.element.getAttribute("data-slideToScroll")) || 1,
            slidesVisible: Number(this.element.getAttribute("data-nbSlide")) || 1,
            loop: this.element.getAttribute("data-loop") === "true" || false
        }
        this.currentSlide = 0
        this.moveCallbacks = []
        //get all the children from the element and store them in an array because we want the current state (we don't want it modified when we add the carousel)
        const children = [...element.children] 
        

        // Create the main element and the container for the carousel (here it's for the example it would be easier to do it directly in html)
        this.root = this.createDivWithClass("carousel")
        this.container = this.createDivWithClass("carousel__container")
        this.root.appendChild(this.container)
        this.element.appendChild(this.root)
        this.items = children.map(child => {
            const item = this.createDivWithClass("carousel__item")
            item.appendChild(child)
            this.container.appendChild(item)
            return item
        })

        this.setStyle()
        this.createNavigation()
        this.fireOnMoveCallback(0)
    }

    /**
     * Apply needed sizes to the carousel items
     */
    setStyle () {
        const ratio = this.items.length / this.options.slidesVisible
        this.container.style.width = (ratio * 100) + "%"
        this.items.forEach(item => {
            item.style.width = ((100 / this.options.slidesVisible) / ratio) + "%"
        })
    }

    createNavigation() {
        const nextButton = this.createDivWithClass("carousel__next")
        const previousButton = this.createDivWithClass("carousel__previous")
        this.root.appendChild(nextButton)
        this.root.appendChild(previousButton)
        nextButton.addEventListener("click", this.next.bind(this)) // .bind(this) allow to reference the class with this inside the function instead of the button
        previousButton.addEventListener("click", this.previous.bind(this))
        if (!this.options.loop)
        {
            this.addOnMoveCallback(index => {
                if (index === 0) {
                    previousButton.classList.add("hidden")
                }
                else {
                    previousButton.classList.remove("hidden")
                }
            })
    
            this.addOnMoveCallback(index => {
                if (index >= this.items.length -1) {
                    nextButton.classList.add("hidden")
                }
                else {
                    nextButton.classList.remove("hidden")
                }
            })
        }      
    }

    next () {
        this.goToSlide(this.currentSlide + this.options.slidesToScroll)
    }

    previous() {
        this.goToSlide(this.currentSlide - this.options.slidesToScroll)
    }

    /**
     * Move the carousel to the target index
     * @param {number} index 
     */
    goToSlide(index) {
        if (index < 0 && this.currentSlide <= 0) {
            index = this.items.length - this.options.slidesVisible
        } else if (index >= this.items.length) {
            index = 0
        }
        const translateX = (-100 / this.items.length) * index
        this.container.style.transform = "translate3d(" + translateX + "%, 0, 0)"
        this.currentSlide = index
        this.fireOnMoveCallback(index)
    }

    addOnMoveCallback(cb) {
        this.moveCallbacks.push(cb)
    }

    fireOnMoveCallback(index) {
        this.moveCallbacks.forEach(cb => cb(index))
    }

    /**
     * 
     * @param {string} className 
     * @returns {HTMLELEMENT}
     */
    createDivWithClass (className) {
        const div = document.createElement("div")
        div.classList.add(className)
        return div
    }
}

new Carousel(document.querySelector("#carousel1"))

new Carousel(document.querySelector("#carousel2"))

new Carousel(document.querySelector("#carousel3"))