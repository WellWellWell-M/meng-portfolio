class ImageSlider {
    constructor(container) {
        this.container = container;
        this.slider = container.querySelector('.slider');
        this.track = container.querySelector('.slider-track');
        this.prevButton = container.querySelector('.prev');
        this.nextButton = container.querySelector('.next');
        this.images = container.querySelectorAll('.slider-image');
        this.currentIndex = 0;
        this.autoPlayTimer = null;
        
        this.init();
        // 移除这里的自动播放，不再在构造函数中调用 startAutoPlay
    }

    init() {
        this.updateButtons();
        
        this.prevButton?.addEventListener('click', () => this.prev());
        this.nextButton?.addEventListener('click', () => this.next());
        
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    // 新增重置和播放方法
    resetAndPlay() {
        this.currentIndex = 0;
        this.updateSlider();
        this.startAutoPlay();
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateSlider();
        }
    }

    next() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.updateSlider();
        }
    }

    updateSlider() {
        const containerWidth = this.container.offsetWidth;  // 获取当前容器宽度
        const offset = -this.currentIndex * containerWidth;
        this.track.style.transform = `translateX(${offset}px)`;
        this.updateButtons();
    }

    updateButtons() {
        if (this.prevButton) {
            this.prevButton.classList.toggle('hidden', this.currentIndex === 0);
        }
        
        if (this.nextButton) {
            this.nextButton.classList.toggle('hidden', this.currentIndex === this.images.length - 1);
        }
    }

    startAutoPlay() {
        this.stopAutoPlay();
        
        if (this.currentIndex < this.images.length - 1) {
            this.autoPlayTimer = setInterval(() => {
                if (this.currentIndex < this.images.length - 1) {
                    this.next();
                } else {
                    this.stopAutoPlay();
                }
            }, 3000);
        }
    }

    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.slider-container');
    sliders.forEach(slider => {
        // 将实例存储在DOM元素上
        slider.sliderInstance = new ImageSlider(slider);
    });
});