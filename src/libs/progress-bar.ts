function focusRedraw(el: HTMLElement) {
  window.getComputedStyle(el, null).getPropertyValue('display');
}

export class ProgressBar {
  percentage = 0;
  el: HTMLElement;
  percentageEl: HTMLElement;
  duration = 0.5;
  constructor(el: HTMLElement) {
    this.el = el;
    this.hide();

    const percentageEl = document.createElement('div');
    percentageEl.classList.add('progressbar-percentage');
    el.appendChild(percentageEl);
    this.percentageEl = percentageEl;

    const position = window.getComputedStyle(el, null).getPropertyValue('position');
    if (position === 'static') {
      el.style.position = 'relative';
    }

    if (!document.querySelector('.progressbar-style')) {
      const styleEl = document.createElement('style');
      styleEl.classList.add('progressbar-style');
      styleEl.innerHTML = `
        .progressbar-percentage {
          transition: ${this.duration}s linear;
          height: 100%;
          background: rgb(20, 150, 200);
        }
      `;
      document.head.appendChild(styleEl);
    }
  }

  setPercentage(value: number) {
    this.percentage = value;
    const width = this.el.getBoundingClientRect().width;

    this.percentageEl.style.width = `${width * value}px`;
  }

  getPercentage() {
    return this.percentage;
  }

  start() {
    this.percentageEl.style.transitionDuration = `0s`;
    this.setPercentage(0);
    focusRedraw(this.percentageEl);
    this.percentageEl.style.transitionDuration = `${this.duration}s`;

    this.show();
  }

  done() {
    this.hide();
    setTimeout(() => {
      this.hide();
    }, this.duration * 1000);
  }

  show() {
    this.el.style.visibility = 'visible';
  }

  hide() {
    this.el.style.visibility = 'hidden';
  }
}
