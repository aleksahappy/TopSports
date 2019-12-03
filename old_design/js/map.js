'use strict';

//=====================================================================================================
// Работа карты дилеров:
//=====================================================================================================

var dealersList = document.getElementById('dealers_list');
mapResize();

// Изменение размера карты дилеров:

window.addEventListener('resize', mapResize);

function mapResize() {
  var windowHeight = window.innerHeight,
      headerHeight = document.querySelector('.header-main').clientHeight,
      listTitleHeight = document.querySelector('#dealers_list .dealers_title').clientHeight,
      height = windowHeight - headerHeight - listTitleHeight,
      map = document.getElementById('map'),
      dealersList = document.querySelector('#dealers_list .list');
  map.style.height = height + 'px';
  dealersList.style.height = height + 'px';
}

// Отображение карты дилеров на странице:

var fullCard;

function showDealersList(event) {
  event.preventDefault();
  dealersList.style.display = 'block';
  fullCard = document.getElementById('full-card-container');
  if (fullCard) {
    fullCard.style.zIndex = 0;
  }
  mapResize();
}

// Скрытие карты дилеров на странице:

function hideDealersList() {
  dealersList.style.display = 'none';
  fullCard = document.getElementById('full-card-container');
  if (fullCard) {
    fullCard.style.zIndex = 30;
  }
}
