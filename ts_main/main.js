'use strict';

var carousel = document.getElementById('carousel');

// Кастомные настройки карусели:
window.mainCarousel = new Carousel();
window.mainCarousel.isMove = true;

checkSettings(carousel);
startCarouselMove(carousel);
