'use strict';

//=====================================================================================================
// Глобальные переменные для работы:
//=====================================================================================================

var changeTimeout,
    isAmimate = false,
    styleLeft,
    newStyleLeft,
    start,
    timer,
    elapsedTime,
    progress,
    value;

//=====================================================================================================
// Объект карусели для работы с ним:
//=====================================================================================================

var curCarousel = {
  // Элемент самой карусели:
  wrap: '',

  // Настройки работы карусели по умолчанию:
  isInfinitie: true,
  duration: 600,
  isMove: false,
  direction: 'right',
  delay: 6000,

  // Функции карусели:
  moveToLeft: function() {
    if (this.isInfinitie) {
      this.curPos--;
      if (this.curPos < 0) {
        var cloneElem = this.gallery.children[this.imgCount - 1].cloneNode(true);
        this.gallery.insertBefore(cloneElem, this.gallery.children[0]);
        this.gallery.removeChild(this.gallery.children[this.imgCount]);
        this.gallery.style.left = -this.imgWidth + 'px';
        this.curPos++;
      }
      this.curImg = this.curImg == 0 ? this.imgCount - 1 : this.curImg - 1;
    } else {
      this.curPos = this.curPos == 0 ? 0 : --this.curPos;
      this.curImg = this.curPos;
    }
  },
  moveToRight: function() {
    if (this.isInfinitie) {
      this.curPos++;
      if (this.curPos > this.imgCount - 1) {
        var cloneElem = this.gallery.children[0].cloneNode(true);
        this.gallery.appendChild(cloneElem);
        this.gallery.removeChild(this.gallery.children[0]);
        this.gallery.style.left = -(this.curPos - 2) * this.imgWidth + 'px';
        this.curPos--;
      }
      this.curImg = this.curImg == this.imgCount - 1 ? 0 : this.curImg + 1;
    } else {
      this.curPos = this.curPos == this.imgCount - 1 ? this.imgCount - 1 : ++this.curPos;
      this.curImg = this.curPos;
    }
  },
  moveToImg: function(obj) {
    this.curImg = obj.dataset.numb;
    this.imgsGallery.forEach((img, index) => {
      if (img.dataset.numb == this.curImg) {
        this.curPos = index;
      }
    });
  },
  toggleImg: function() {
    curCarousel.nav.querySelectorAll('.carousel-item').forEach(img => {
      if (img.dataset.numb == this.curImg) {
        img.classList.add('active');
      } else {
        img.classList.remove('active');
      }
    });
  },
  animateCarousel: function() {
    styleLeft = this.gallery.style.left ? parseInt(this.gallery.style.left) : 0;
    newStyleLeft = -(this.imgWidth * this.curPos);
    if (styleLeft == newStyleLeft) {
      isAmimate = false;
      return;
    }
    start = null;
    timer = null;

    function tick(timestamp) {
      start = start || timestamp;
      elapsedTime = timestamp - start;
      progress = elapsedTime / curCarousel.duration;
      value = styleLeft + (newStyleLeft - styleLeft) * progress;

      if (progress >= 1) {
        curCarousel.gallery.style.left = newStyleLeft + 'px';
        isAmimate = false;
        return cancelAnimationFrame(timer);
      }

      curCarousel.gallery.style.left = value + 'px';
      timer = requestAnimationFrame(tick);
    }
    timer = requestAnimationFrame(tick);
  }
}

//=====================================================================================================
// Запуск карусели при автоматической прокрутке:
//=====================================================================================================

function startCarouselMove(obj) {
  changeTimeout = setTimeout(() => moveCarousel(obj), obj.dataset.delay);
}

//=====================================================================================================
// Переключение слайдов:
//=====================================================================================================

function moveCarousel(obj) {
  if (event !== undefined && !event.target.classList.contains('btn') && !event.target.classList.contains('item-nav')) {
    return;
  }
  curCarousel.gallery = obj.querySelector('.carousel-gallery');
  curCarousel.imgsGallery = curCarousel.gallery.querySelectorAll('.carousel-item');
  curCarousel.imgWidth = curCarousel.imgsGallery[0].clientWidth;
  curCarousel.curPos = parseInt(obj.dataset.curPos, 10);
  curCarousel.curImg = parseInt(obj.dataset.curImg, 10);

  if (obj !== curCarousel.wrap) {
    curCarousel.wrap = obj;
    if (obj.dataset.infinitie && obj.dataset.infinitie == 'false') {
      curCarousel.isInfinitie = false;
    }
    if (obj.dataset.duration && !isNaN(parseInt(obj.dataset.duration))) {
      curCarousel.duration = obj.dataset.duration;
    }
    if (obj.dataset.move && obj.dataset.move == 'true') {
      curCarousel.isMove = true;
    }
    if (obj.dataset.direction && obj.dataset.direction == 'left') {
      curCarousel.direction = 'left';
    }
    if (obj.dataset.delay && !isNaN(parseInt(obj.dataset.delay))) {
      curCarousel.delay = obj.dataset.delay;
    }
    curCarousel.nav = obj.querySelector('.carousel-nav');
    curCarousel.imgCount = curCarousel.imgsGallery.length;
  }

  if (event && event.target.dataset.wait && event.target.dataset.wait == 'true') {
    if (isAmimate) {
      return;
    }
    isAmimate = true;
  }

  if ((event && event.target.classList.contains('left-btn')) ||
      (event === undefined && curCarousel.isMove === true && curCarousel.direction === 'left')) {
    curCarousel.moveToLeft();
  }
  if ((event && event.target.classList.contains('right-btn')) ||
      (event === undefined && curCarousel.isMove === true && curCarousel.direction === 'right')) {
    curCarousel.moveToRight();
  }
  if (event && event.target.classList.contains('item-nav')) {
    curCarousel.moveToImg(event.target);
  }
  obj.dataset.curPos = curCarousel.curPos;
  obj.dataset.curImg = curCarousel.curImg;

  if (curCarousel.nav) {
    curCarousel.toggleImg();
  }
  curCarousel.animateCarousel();

  if (curCarousel.isInfinitie && curCarousel.isMove) {
    clearTimeout(changeTimeout);
    startCarouselMove(obj);
  }
}

// =====================================================================================================
// Старые функции для доработки:
// =====================================================================================================

// Переключение отображения кнопок карусели:

// window.addEventListener('resize', () => {
//   if (fullCardContainer.style.display == 'block') {
//     var card = document.querySelector('.full-card');
//     toggleDisplayBtns(card);
//   }
// });

// function toggleDisplayBtns(card) {
//   var objectId = parseInt(card.dataset.objectId, 10),
//       images = items.find(item => item.object_id == objectId).images,
//       carousel = card.querySelector('.carousel'),
//       imageWidth = carousel.querySelector('.carousel-item').clientWidth,
//       carouselWidth = carousel.querySelector('.carousel-gallery').clientWidth,
//       carouselInner = carousel.querySelector('.carousel-inner'),
//       leftBtn = carousel.querySelector('.left-btn'),
//       rightBtn = carousel.querySelector('.right-btn'),
//       imgCounter = parseInt(carousel.dataset.imgcounter, 10);

//   if (carouselWidth >= imageWidth * images.length) {
//     rightBtn.style.visibility = 'hidden';
//     leftBtn.style.visibility = 'hidden';
//   } else  {
//     if (imgCounter == 0) {
//       leftBtn.style.visibility = 'hidden';
//     } else {
//       leftBtn.style.visibility = 'visible';
//     }

//     if (-parseInt(carouselInner.style.marginLeft, 10) >= imageWidth * images.length - carouselWidth) {
//       rightBtn.style.visibility = 'hidden';
//     } else {
//       rightBtn.style.visibility = 'visible';
//     }
//   }
// }

// // Переключение картинок в карусели при клике на миниатюру:

// function toggleImg(imgNumb) {
//   if (window.innerWidth < 768) {
//     showFullImg(event);
//   } else {
//     var carousel = event.currentTarget.closest('.carousel');
//     carousel.dataset.imgcounter = imgNumb;
//     showImg(event);
//   }
// }

// // Изменение основной картинки в карусели и выделение миниатюры:

// function showImg(event) {
//   var carousel = event.currentTarget.closest('.carousel'),
//       imgCounter = parseInt(carousel.dataset.imgcounter, 10),
//       img = carousel.querySelector(`.carousel-item-${imgCounter} img`);

//   carousel.querySelector('.img-active').classList.remove('img-active');
//   carousel.querySelector(`.carousel-item-${imgCounter}`).classList.add('img-active');

//   var curImg = document.getElementById('img');
//   curImg.src = img.src;
// }
