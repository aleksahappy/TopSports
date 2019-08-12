'use strict';

//=====================================================================================================
// Работа слайдера:
//=====================================================================================================

var imgListInit = document.querySelectorAll('.slider-item'),
    imgCount = document.querySelectorAll('.slider-item').length,
    curImg = 0,
    isInit = true,
    isCompleted = true,
    changeTimeout;

changeTimeout = setTimeout(() => moveSlider(), 6000);

function throttle(callback, delay) {
  let isWaiting = false;
  return function () {
    if (!isWaiting) {
      callback.apply(this, arguments);
      isWaiting = true;
      setTimeout(() => {
        isWaiting = false;
      }, delay);
    }
  }
}

// Анимация слайдера:

const moveSlider = throttle((action) => {
  var imgWidth = document.querySelector('.slider-item').clientWidth;
  var slider = document.querySelector('.slider-inner');

  if (action == 'prev') {
    curImg--;
    if (curImg < 0) {
      slider.style.transition = null;
      var cloneElem = slider.children[imgCount - 1].cloneNode(true);
      slider.insertBefore(cloneElem, slider.children[0]);
      slider.removeChild(slider.children[imgCount]);
      slider.style.left = -imgWidth + 'px';
      curImg++;
    }
  } else {
    curImg++;
    if (curImg > imgCount - 1) {
      slider.style.transition = null;
      var cloneElem = slider.children[0].cloneNode(true);
      slider.appendChild(cloneElem);
      slider.removeChild(slider.children[0]);
      slider.style.left = -(curImg - 2) * imgWidth + 'px';
      curImg--;
    }
  }

  setTimeout(function() {
    slider.style.left = -(imgWidth * curImg) + 'px';
    slider.style.transition = 'left 0.6s ease-in-out';
  }, 100);

  clearTimeout(changeTimeout);
  changeTimeout = setTimeout(() => moveSlider(), 6000);
}, 700);
