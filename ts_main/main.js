'use strict';

var carousel = document.getElementById('carousel'),
    carouselIsMove = carousel.dataset.move;

if (carouselIsMove && carouselIsMove == 'true') {
  startCarouselMove(carousel);
}
