'use strict';

//=====================================================================================================
// Глобальные переменные для работы:
//=====================================================================================================

var curCarousel,
    carouselType,
    changeTimeout,
    isMoveSlide = false,
    itemNav,
    oldStyle,
    newStyle,
    start,
    timer,
    elapsedTime,
    progress,
    value;

//=====================================================================================================
// Конструктор карусели с настройками по умолчанию:
//=====================================================================================================

function Carousel() {
  this.obj = '';
  // Настройки работы карусели по умолчанию:
  this.isAnimate = true;
  this.isInfinitie = true;
  this.isWait = true;
  this.duration = 600;
  this.isMove = false;
  this.delay = 6000;
  this.direction = 'next';

  // Функции карусели:
  this.moveToPrev = function() {
    if (this.isInfinitie) {
      this.targetImg = this.curImg == 0 ? this.imgCount - 1 : this.curImg - 1;
      this.position--;
      if (this.position < 0) {
        var el = this.styles.shift();
        this.styles.push(el);
        this.imgsGallery.forEach((img, index) => img.style.left = this.styles[index]);
        this.gallery.style.left = '-100%';
        this.position++;
      }
    } else {
      this.targetImg = this.curImg == 0 ? 0 : this.curImg - 1;
      this.position = this.targetImg;
    }
  };
  this.moveToNext = function() {
    if (this.isInfinitie) {
      this.targetImg = this.curImg == this.imgCount - 1 ? 0 : this.curImg + 1;
      this.position++;
      if (this.position > this.imgCount - 1) {
        var el = this.styles.pop();
        this.styles.unshift(el);
        this.imgsGallery.forEach((img, index) => img.style.left = this.styles[index]);
        this.gallery.style.left = -(this.position - 2) * 100 + '%';
        this.position--;
      }
    } else {
      this.targetImg = this.curImg == this.imgCount - 1 ? this.imgCount - 1 : this.curImg + 1;
      this.position = this.targetImg;
    }
  };
  this.moveToImg = function(numb) {
    this.targetImg = numb;
    this.position = parseInt(this.styles[this.targetImg]) / 100;
  };
  this.toggleNav = function() {
    this.imgsNav[this.curImg].classList.remove('active');
    this.imgsNav[this.targetImg].classList.add('active');
  };
  this.toggleImg = function() {
    this.gallery.style.left = -(this.position * 100) + '%';
    isMoveSlide = false;
  };
  this.animateToggleImg = function() {
    oldStyle = this.gallery.style.left ? parseInt(this.gallery.style.left) : 0;
    newStyle = -(this.position * 100);
    if (oldStyle == newStyle) {
      isMoveSlide = false;
      return;
    }
    start = null;
    timer = null;
    var curCarousel = this;

    function tick(timestamp) {
      start = start || timestamp;
      elapsedTime = timestamp - start;
      progress = elapsedTime / curCarousel.duration;
      value = oldStyle + (newStyle - oldStyle) * progress;

      if (progress >= 1) {
        curCarousel.gallery.style.left = newStyle + '%';
        isMoveSlide = false;
        return cancelAnimationFrame(timer);
      }

      curCarousel.gallery.style.left = value + '%';
      timer = requestAnimationFrame(tick);
    }
    timer = requestAnimationFrame(tick);
  };
  this.toggleDisplayBtns = function() {
    if (this.curPos == 0) {
      this.leftBtn.style.visibility = 'hidden';
    } else {
      this.leftBtn.style.visibility = 'visible';
    }
    if (this.curPos == this.imgCount - 1) {
      this.rightBtn.style.visibility = 'hidden';
    } else {
      this.rightBtn.style.visibility = 'visible';
    }
  }
}

//=====================================================================================================
// // Проверка и установка кастомных настроек карусели:
//=====================================================================================================

function checkSettings(obj) {
  carouselType = obj.dataset.type;
  if (carouselType && window[carouselType + 'Carousel']) {
    curCarousel = window[carouselType + 'Carousel'];
  } else {
    curCarousel = new Carousel();
  }
}

//=====================================================================================================
// Запуск карусели для автоматической прокрутки:
//=====================================================================================================

function startCarouselMove(obj) {
  if (curCarousel.isInfinitie) {
    changeTimeout = setTimeout(() => moveCarousel(obj), curCarousel.delay);
  }
}

//=====================================================================================================
// Переключение слайдов:
//=====================================================================================================

function moveCarousel(obj) {
  if (event !== undefined && !event.target.classList.contains('btn') && !event.target.parentElement.classList.contains('item-nav')) {
    return;
  }

  checkSettings(obj);

  if (obj != curCarousel.obj) {
    curCarousel.obj = obj;
    curCarousel.gallery = obj.querySelector('.carousel-gallery');
    curCarousel.imgsGallery = curCarousel.gallery.querySelectorAll('.carousel-item');
    curCarousel.nav = obj.querySelector('.carousel-nav');
    if (curCarousel.nav) {
      curCarousel.imgsNav = curCarousel.nav.querySelectorAll('.carousel-item');
    }
    curCarousel.imgCount = curCarousel.imgsGallery.length;
    curCarousel.styles = Array.from(curCarousel.imgsGallery).map(el => el.style.left);
    curCarousel.leftBtn = obj.querySelector('.left-btn');
    curCarousel.rightBtn = obj.querySelector('.right-btn');
  }
  curCarousel.position = parseInt(obj.dataset.pos, 10);
  curCarousel.curImg = parseInt(obj.dataset.curImg, 10);

  if (event && event.target.classList.contains('btn') && curCarousel.isWait) {
    if (isMoveSlide) {
      return;
    }
    isMoveSlide = true;
  }

  if ((event && event.target.classList.contains('left-btn')) ||
      (event === undefined && curCarousel.isMove === true && curCarousel.direction === 'prev')) {
    curCarousel.moveToPrev();
  } else if ((event && event.target.classList.contains('right-btn')) ||
      (event === undefined && curCarousel.isMove === true && curCarousel.direction === 'next')) {
    curCarousel.moveToNext();
  } else if (event && event.target.parentElement.classList.contains('item-nav')) {
    curCarousel.moveToImg(event.target.parentElement.dataset.numb);
  }

  if (curCarousel.isAnimate) {
    curCarousel.animateToggleImg();
  } else {
    curCarousel.toggleImg();
  }

  if (curCarousel.nav) {
    curCarousel.toggleNav();
  }

  if (!curCarousel.isInfinitie) {
    curCarousel.toggleDisplayBtns();
  }

  obj.dataset.pos = curCarousel.position;
  obj.dataset.curImg = curCarousel.targetImg;

  if (curCarousel.isMove) {
    clearTimeout(changeTimeout);
    startCarouselMove(obj);
  }
}
