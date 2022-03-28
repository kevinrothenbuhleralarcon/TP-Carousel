class Carousel {
    /**
     * @param {HTMLElement} element 
     * @param {Boolean} [infinite=false]
    */
    constructor(element, infinite = false) {
        this.mobileMinWidth = 800
        this.element = element

        // Allow to affect default values to slidesTO Scroll and SlidesVisible of not all of them are present
        this.options = {
            slidesToScroll: Number(this.element.getAttribute("data-slideToScroll")) || 1,
            slidesVisible: Number(this.element.getAttribute("data-nbSlide")) || 1,
            loop: this.element.getAttribute("data-loop") === "true" || false,
            pagination: this.element.getAttribute("data-pagination") === "true" || false,
            infinite: infinite
        }
        this.currentSlide = 0
        this.isMobile = false
        this.moveCallbacks = []
        //get all the children from the element and store them in an array because we want the current state (we don't want it modified when we add the carousel)
        const children = [...element.children] 

        // Change of DOM
        // Create the main element and the container for the carousel
        this.root = this.createDivWithClass("carousel")
        this.container = this.createDivWithClass("carousel__container")
        this.root.appendChild(this.container)
        this.element.appendChild(this.root)
        this.items = children.map(child => {
            const item = this.createDivWithClass("carousel__item")
            item.appendChild(child)
            return item
        })

        if (this.options.infinite) {
            const offset = this.options.slidesVisible * 2 - 1
            this.items = [
                ...this.items.slice(this.items.length - offset).map(item => item.cloneNode(true)),
                ...this.items,
                ...this.items.slice(0, offset).map(item => item.cloneNode(true))
            ]
            this.goToSlide(offset, false)
        }

        this.items.forEach(item => {
            this.container.appendChild(item)
        })

        this.setStyle()
        this.createNavigation()

        if (this.options.pagination) {
            this.createPagination()
        }

        // Events
        this.onWindowResize()
        window.addEventListener("resize", this.onWindowResize.bind(this))
    }

    /**
     * Apply needed sizes to the carousel items
     */
    setStyle () {
        const ratio = this.items.length / this.slidesToShow
        this.container.style.width = (ratio * 100) + "%"
        this.items.forEach(item => {
            item.style.width = ((100 / this.slidesToShow) / ratio) + "%"
        })
    }


    /**
     * Create the navigation with arrow button and keyboard keys
     */
    createNavigation() {
        const nextButton = this.createDivWithClass("carousel__next")
        const previousButton = this.createDivWithClass("carousel__previous")
        this.root.appendChild(nextButton)
        this.root.appendChild(previousButton)
        nextButton.addEventListener("click", this.next.bind(this)) // .bind(this) allow to reference the class with this inside the function instead of the button
        previousButton.addEventListener("click", this.previous.bind(this))
    
        // Create navigation with arrow key
        this.root.setAttribute("tabindex", "0") // Allow to select the element with tab, the 0 means that it will follow the html order
        this.root.addEventListener("keyup", (e) => {
            // The second condition is for IE compatibility
            if(e.key === "ArrowRight" || e.key === "Right") {
                this.next()
            } else if (e.key === "ArrowLeft" || e.key === "Left") {
                this.previous()
            }
        })
        
        // Set the callback to hide the arrows if the loop option is disable
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
                if (this.currentSlide + this.slidesToShow >= this.items.length) {
                    nextButton.classList.add("hidden")
                }
                else {
                    nextButton.classList.remove("hidden")
                }
            })
        } 
        this.fireOnMoveCallback(this.currentSlide) // Fire the callbacks to show or hide the navigation arrow based on the new style     
    }

    /**
     * Create pagination in DOM
     */
    createPagination() {
        const pagination = this.createDivWithClass("carousel__pagination")
        const buttons = []
        this.root.appendChild(pagination)
        for (let i = 0; i < this.items.length; i = i + this.options.slidesToScroll) {
            const btn = this.createDivWithClass("carousel__pagination__btn")
            btn.addEventListener("click", () => this.goToSlide(i))
            pagination.appendChild(btn)
            buttons.push(btn)
        }
        this.addOnMoveCallback(index => {
            const activeButton = buttons[Math.floor(index / this.options.slidesToScroll)]
            if (activeButton) {
                buttons.forEach(btn => {
                    btn.classList.remove("carousel__pagination__btn--active")
                })
                activeButton.classList.add("carousel__pagination__btn--active")
            }
        })
        this.fireOnMoveCallback(0)
    }


    next () {
        this.goToSlide(this.currentSlide + this.slidesToScroll)
    }

    previous() {
        this.goToSlide(this.currentSlide - this.slidesToScroll)
    }

    /**
     * Move the carousel to the target index
     * @param {number} index 
     * @param {boolean} [animation=true]
     */
    goToSlide(index, animation = true) {
        if (index < 0 && this.currentSlide <= 0) {
            if(this.options.loop)
            {
                index = this.items.length - this.slidesToShow
            } else {
                return
            }
            
        } else if (index >= this.items.length || (this.currentSlide + this.slidesToShow >= this.items.length && index > this.currentSlide)) {
            if (this.options.loop) {
                index = 0
            } else {
                return 
            }
        }
        const translateX = (-100 / this.items.length) * index
        if (!animation) {
            this.container.style.transition = "none"
        }
        this.container.style.transform = "translate3d(" + translateX + "%, 0, 0)"
        this.container.offsetHeight // Force repaint
        if (!animation) {
            this.container.style.transition = ""
        }
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

    /**
     * @returns {number}
     */
    get slidesToScroll() {
        return this.isMobile ? 1 : this.options.slidesToScroll
    }

    /**
     * @returns {number}
     */
    get slidesToShow() {
        return this.isMobile ? 1 : this.options.slidesVisible
    }

    onWindowResize() {
        const oldValue = this.isMobile
        this.isMobile = window.innerWidth < this.mobileMinWidth ? true : false
        // Check that we've changed to mobile view
        if (oldValue != this.isMobile) {
            this.setStyle() // Reset the style for the carousel
            this.fireOnMoveCallback(this.currentSlide) // Fire the callbacks to show or hide the navigation arrow based on the new style
        }
    }
}

new Carousel(document.querySelector("#carousel1"))

new Carousel(document.querySelector("#carousel2"), true)

new Carousel(document.querySelector("#carousel3"))