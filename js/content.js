'use strict';

setPaddingBody();

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var pageId = document.body.id,
    cartAmount = document.querySelector('.cart-amount span'),
    cartPrice = document.querySelector('.cart-price span'),
    submenu = document.querySelector('.submenu'),
    filtersContainer = document.querySelector('.filters-container'),
    filters = document.querySelector('.filters'),
    menuFilters = document.getElementById('menu-filters'),
    gallery = document.getElementById('gallery'),
    galleryNotice = document.getElementById('gallery-notice'),
    fullCardContainer = document.getElementById('full-card-container'),
    fullImgBox = document.getElementById('full-imgbox'),
    fullImg = document.getElementById('full-img');

// Получение шаблонов из HTML:

var filterTemplate = document.querySelector('.filter').outerHTML,
    itemsTemplate = document.querySelector('.filter-items').innerHTML,
    minCardTemplate = document.getElementById('card-#object_id#'),
    bigCardTemplate = document.getElementById('big-card-#object_id#'),
    fullCardTemplate = document.getElementById('full-card-#object_id#');

// Получение свойств #...# из шаблонов HTML:

var re =/#[^#]+#/gi;

function extractProps(template) {
  return template.match(re).map(prop => prop = prop.replace(/#/g, ''));
}

function removeReplays(template, subTemplate) {
  template = template.filter(el => !subTemplate.includes(el));
}

// Динамически изменяемые переменные:

var view = 'list',
    cardTemplate,
    selecledCardList = '',
    countItems = 0,
    countItemsTo = 0,
    curItems;

//=====================================================================================================
// Заполнение контента страницы:
//=====================================================================================================

// Первоначальное заполнение контента на странице:

setCardTemplate();
initFilters();
checkFilters();
changeCart();

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Открытие и закрытие подменю на малых разрешениях:

function toggleSubmenu() {
  submenu.classList.toggle('open');
}

// Установка отступов документа:

window.addEventListener('resize', setPaddingBody);

function setPaddingBody() {
  var headerHeight = document.querySelector('.header').clientHeight;
  var footerHeight = document.querySelector('.footer').clientHeight;
  document.body.style.paddingTop = `${headerHeight}px`;
  document.body.style.paddingBottom = `${footerHeight + 20}px`;
}

// Установка высоты меню опций:

window.addEventListener('scroll', setFiltersHeight);
window.addEventListener('resize', setFiltersHeight);

// function setFiltersHeight() {
//   filtersContainer.style.minHeight = filters.clientHeight + 'px';
// }

function setFiltersHeight() {
  if (window.getComputedStyle(filters).position == 'fixed') {
    var scrolled = window.pageYOffset || document.documentElement.scrollTop,
        headerHeight = document.querySelector('.header').clientHeight,
        headerMainHeight = Math.max((document.querySelector('.main-header').clientHeight - scrolled), 20),
        footerHeight = Math.max((window.innerHeight + scrolled - document.querySelector('.footer').offsetTop) + 20, 0),
        filtersHeight = window.innerHeight - headerHeight - headerMainHeight - footerHeight;
    filters.style.top = `${headerHeight + headerMainHeight}px`;
    filters.style.height = `${filtersHeight}px`;
  }
}

// Функция преобразования цены к формату с пробелами:

function convertPrice(price) {
  return (price + '').replace(/(\d{1,3})(?=((\d{3})*)$)/g, " $1");
}

//=====================================================================================================
// Работа с локальным хранилищем и cookie:
//=====================================================================================================

function storageAvailable(type) {
	try {
		var storage = window[type],
        x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(error) {
		return false;
	}
}

// Сохранение данныx:

function saveInfo(key, data) {
  var stringData = JSON.stringify(data);
  if (storageAvailable('localStorage')) {
    localStorage[key] = stringData;
  }
  else {
    if (getCookie(key)) {
      deleteCookie(key);
    }
    setCookie(key, stringData, {expires: getDateExpires(30)});
  }
}

// Получение данных:

function getInfo(key) {
  if (storageAvailable('localStorage')) {
    if (localStorage[key]) {
      return JSON.parse(localStorage[key]);
    } else {
      return undefined;
    }
  }
  else {
    if (getCookie(key)) {
      return JSON.parse(getCookie(key));
    } else {
      return undefined;
    }
  }
}

// Сохранение данных в cookie:

function setCookie(key, value, options) {
  options = options || {};
  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);
  var updatedCookie = key + '=' + value;

  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }
  document.cookie = updatedCookie;
}

// Функция для установки срока хранения cookie:

function getDateExpires(days) {
  var date = new Date;
  date.setDate(date.getDate() + days);
  return date;
}

// Получение данных из cookie:

function getCookie(key) {
  var matches = document.cookie.match(new RegExp(
    '(?:^|; )' + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Удаление данных из cookie:

function deleteCookie(key) {
  setCookie(key, '', {expires: -1});
}

//=====================================================================================================
//  Функции заполняющие контент на странице:
//=====================================================================================================

// Проверка сохраненных данных о корзине и их отображение:

function changeCart() {
  if (getInfo(`cartInfo_${pageId}`) && cartAmount) {
    var cartInfo = getInfo(`cartInfo_${pageId}`),
        totalAmountCart = 0,
        totalPriceCart = 0;

    for (var articul in cartInfo) {
      var objectId = cartInfo[articul].objectId,
          obj = items.find(item => item.object_id == objectId),
          value = cartInfo[articul].qty,
          curPrice = obj.price_preorder1 == 0 ? obj.price1 : obj.price_preorder1,
          sizes = obj.sizes;
      for (var key in sizes) {
        if (sizes[key].articul == articul) {
          value = value > sizes[key].free_qty ? sizes[key].free_qty : value;
        }
      }
      var articulPrice = value * curPrice;
      totalAmountCart += value;
      totalPriceCart += articulPrice;
    }
    cartAmount.textContent = totalAmountCart;
    cartPrice.textContent = convertPrice(totalPriceCart);
  }
}

// Создание меню фильтров:

function createFilters(dataArray) {
  var listFilters = dataArray.map(data => createFilter(data)).join('');
  return listFilters;
}

function initFilters() {
  var createdFilters = createFilters(dataForFilters);
  menuFilters.innerHTML = createdFilters;
  filtersContainer.style.display = 'block';
}

// Создание одного фильтра:

function createFilter(data) {
  var newFilter = filterTemplate;
  var listItem = '';
  for (var item in data.items) {
    var value = data.items[item] == 1 ? item : data.items[item];
    var newItem = itemsTemplate
      .replace('#key#', data.key)
      .replace('#value#', value)
      .replace('#item#', item);
    listItem += newItem;
  }
  newFilter = newFilter
  .replace('#key#', data.key)
  .replace(itemsTemplate, listItem);

  var classFilter = data.isShow ? 'open' : '';
  newFilter = newFilter
    .replace('#isShow#', classFilter)
    .replace('#title#', data.title);
  return newFilter;
}

// Проверка сохраненных значений фильтров и их визуальное отображение;

function checkFilters() {
  if (getInfo(`filtInfo_${pageId}`)) {
    if (Object.keys(getInfo(`filtInfo_${pageId}`)).length != 0) {
      var filtersInfo = getInfo(`filtInfo_${pageId}`);
      for (var key in filtersInfo) {
        var filter = document.querySelector(`#filter-${key}`);
        if (filter) {
          filter.classList.add('open');
        }
        filtersInfo[key].forEach(value => {
          var el = document.querySelector(`.filter-item[data-key="${key}"][data-value="${value}"]`);
          if (el) {
            el.classList.add('checked');
          }
        })
      }
      selectCards();
      return;
    }
  }
  showCards();
}

// Создание карточек товаров из массива:

function loadCards(cards) {
	if (cards){
    countItems = 0;
    curItems = cards;
	}
	else {
    countItems = countItemsTo;
  }

  var incr;
  if (window.innerWidth > 2000) {
    incr = 60;
  } else if (window.innerWidth < 1000) {
    incr = 20;
  } else {
    incr = 40;
  }
  countItemsTo = countItems + incr;
  if (countItemsTo > curItems.length) {
    countItemsTo = curItems.length;
  }

  var listCard = '';
  for (var i = countItems; i < countItemsTo; i++) {
    var card = createCard(curItems[i]);
    listCard += card;
  }

  if (countItems == 0) {
    gallery.innerHTML = listCard;
    window.scrollTo(0,0);
  } else {
    gallery.insertAdjacentHTML('beforeend', listCard);
  }
  setFiltersHeight();
}

// Создание одной карточки товара :

function createCard(card) {
  var newCard = cardTemplate.outerHTML,
      props = extractProps(newCard),
      totalValue = 0;

  if (cardTemplate != minCardTemplate) {

    var listOptions = '',
        optionsTemplate = cardTemplate.querySelector('.card-options').innerHTML,
        propsOptions = extractProps(optionsTemplate);
    if (card.options && card.options != 0) {
      for (var option in card.options) {
        console.log(option);
        if (option != 7 && option != 31 && option != 32 && option != 33) {
          var newOption = optionsTemplate
          .replace('#optitle#', optnames[option])
          .replace('#opinfo#', card.options[option]);
        listOptions += newOption;
        }
      }
    }
    removeReplays(props, propsOptions);
    newCard = newCard.replace(optionsTemplate, listOptions);

    var listSizes ='',
        sizesTemplate = cardTemplate.querySelector('.card-sizes').innerHTML,
        propsSizes = extractProps(sizesTemplate);
    if (card.sizes && card.sizes != 0) {
      for (var item in card.sizes) {
        createSizeInfo(card.sizes[item]);
      }
    } else {
      createSizeInfo(card);
    }
    removeReplays(props, propsSizes);
    newCard = newCard.replace(sizesTemplate, listSizes);

    function createSizeInfo(info) {
      var cartInfo = getInfo(`cartInfo_${pageId}`),
          size = info.size ? info.size : 'В корзину',
          savedValue = cartInfo && cartInfo[info.articul] ? cartInfo[info.articul].qty : 0,
          freeQty = info.free_qty,
          value = (savedValue > freeQty) ? freeQty : savedValue,
          inCart = value == 0 ? '' : 'in-cart',
          qtyClass = info.free_qty != 0 ? '' : 'grey-gty',
          gtyTitle = info.free_qty != 0 ? 'В наличии' : 'Ожидается';

      var newSize = sizesTemplate
        .replace('#inCart#', inCart)
        .replace('#articul#', info.articul)
        .replace('#size#', size)
        .replace(/#value#/gi, value)
        .replace('#isAvalible#', qtyClass)
        .replace('#qtyTitle#', gtyTitle)
        .replace('#free_qty#', info.free_qty)
      listSizes += newSize;
      totalValue += value;
    }

    var listCarousel = '',
        carouselTemplate = cardTemplate.querySelector('.carousel-inner').innerHTML,
        propsCarousel = extractProps(carouselTemplate);
    for (var i = 0; i < card.images.length; i++) {
      var newCarouselItem = carouselTemplate
        .replace(/#imgNumb#/gi, i)
        .replace('#isActiv#', i == 0 ? 'img-active' : '')
        .replace('#image#', `http://b2b.topsports.ru/c/productpage/${card.images[i]}.jpg`);
      listCarousel += newCarouselItem;
    }
    removeReplays(props, propsCarousel);
    newCard = newCard.replace(carouselTemplate, listCarousel);

    if (card.manuf) {
      var listManufInfo = '',
          manufRowTemplate = cardTemplate.querySelector('.manuf-info').outerHTML,
          manufcellTemplate = cardTemplate.querySelector('.manuf-info').innerHTML,
          propsManufInfo = extractProps(manufRowTemplate);
      removeReplays(props, propsManufInfo);

      var manufData;
      try {
        manufData = JSON.parse(card.manuf);
      }
      catch(error) {
        console.error(error);
      }
      for (var man in manufData.man) {
        var newRow = manufRowTemplate;
        var listCells = '';
        for (var k in manufData) {
          var newCell = manufcellTemplate;
          var cell = [];
          for (var kk in manufData[k]) {
            if (kk == man) {
              cell.push(kk);
            } else {
              for (var kkk in manufData[k][kk]) {
                if (kkk == man) {
                  cell.push(kk);
                }
              }
            }
          }
          cell = cell.join(', ');
          newCell = newCell.replace('#info#', cell);
          listCells += newCell;
        }
        newRow = newRow.replace(manufcellTemplate, listCells);
        listManufInfo += newRow;
      }
      newCard = newCard.replace(manufRowTemplate, listManufInfo);
    }
  }

  for (var prop of props) {
    var propRegExp = new RegExp('#' + prop + '#', 'gi');
    var propCard;
    if (prop == 'images') {
      propCard = `http://b2b.topsports.ru/c/productpage/${card.images[0]}.jpg`;
    } else if (prop == 'price_preorder' && card.price_preorder1 == 0) {
      newCard = newCard.replace('#price_preorder#⁠.-', '');
    } else if (prop == 'isHiddenCarousel') {
      propCard = card.images.length > 1 ? '' : 'displayNone';
    } else if (prop == 'isHiddenBtn') {
      propCard = card.images.length > 1 ? '' : 'hidden'
    } else if (prop == 'isHiddenPromo') {
      propCard = card.actiontitle == undefined ? 'displayNone' : '';
    } else if (prop == 'curPrice') {
      var curPrice = card.price_preorder1 < 1 ? card.price1 : card.price_preorder1;
      propCard = curPrice;
    } else if (prop == 'isAvaliable') {
      propCard = card.free_qty != 0 ? '' : 'grey-gty';
    } else if (prop == "qtyTitle") {
      propCard = card.free_qty != 0 ? 'В наличии' : 'Ожидается';
    } else if (prop == 'isHiddenInfo') {
      propCard = totalValue == 0 ? 'hidden' : '';
    } else if (prop == 'totalAmount') {
      propCard = totalValue;
    } else if (prop == 'totalPrice') {
      propCard = convertPrice(totalValue * (card.price_preorder1 == 0 ? card.price1 : card.price_preorder1));
    } else if (prop == 'notice') {
      propCard = card.free_qty != 0 ? 'Товар резервируется в момент подтверждения заказа!' : 'Товара нет в наличии!';
    } else if (prop == 'isHiddenManuf') {
      propCard = card.manuf ? '' : 'displayNone';
    } else if (prop == 'isHiddenDesc') {
      propCard = card.desc == '' ? 'displayNone' : '';
    } else if (card[prop] == undefined) {
      propCard = '';
    } else {
      propCard = card[prop];
    }
    newCard = newCard.replace(propRegExp, propCard);
  }
  return newCard;
}

//=====================================================================================================
//  Функции для работы с фильтрами:
//=====================================================================================================

// Отображение/ скрытие подменю опций:

function toggleFilter(event) {
  if (event.target.classList.contains('filter-title')) {
    event.currentTarget.classList.toggle('open');
    filters.scrollTop = event.currentTarget.offsetTop;
  }
}

// Выбор значений фильтра:

function selectValue(event) {
  var filterItem = event.currentTarget;
  var key = filterItem.dataset.key;
  var value = filterItem.dataset.value;
  if (filterItem.classList.contains('checked')) {
    removeFiltersInfo(key, value);
    filterItem.classList.remove('checked');
  } else {
    saveFiltersInfo(key, value);
    filterItem.classList.add('checked');
  }
  if (Object.keys(getInfo(`filtInfo_${pageId}`)).length == 0) {
    selecledCardList = '';
    showCards();
  } else {
    selectCards();
  }
}

// Добавление данных о выбранных фильтрах:

function saveFiltersInfo(key, value) {
  var filtersInfo = getInfo(`filtInfo_${pageId}`) ? getInfo(`filtInfo_${pageId}`) : {};
  if (!filtersInfo[key]) {
    filtersInfo[key] = [value];
  } else if (!filtersInfo[key].includes(value)) {
    filtersInfo[key].push(value);
  }
  saveInfo(`filtInfo_${pageId}`, filtersInfo);
}

// Удаление данных о выбранных фильтрах:

function removeFiltersInfo(key, value) {
  var filtersInfo = getInfo(`filtInfo_${pageId}`);
  if (filtersInfo[key]) {
    var index = filtersInfo[key].indexOf(value);
    if (index !== -1) {
      filtersInfo[key].splice(index, 1);
    }
    if (filtersInfo[key].length == 0) {
      delete filtersInfo[key];
    }
    saveInfo(`filtInfo_${pageId}`, filtersInfo);
  }
}

// Фильтрация карточек:

function selectCards() {
  var filtersInfo = getInfo(`filtInfo_${pageId}`);
  for (var key in filtersInfo) {
    filtersInfo[key] = filtersInfo[key].filter(value => {
      var el = document.querySelector(`.filter-item[data-key="${key}"][data-value="${value}"]`);
      if (el) {
        return true;
      }
    });
    if (filtersInfo[key].length == 0) {
      delete filtersInfo[key];
    }
  }
  selecledCardList = sortedItems.filter(card => {
    for (var key in filtersInfo) {
      var isFound = false;
      for (var value of filtersInfo[key]) {
        if (card[key] == value || card[value] == 1) {
          isFound = true;
        }
      }
      if (!isFound) {
        return false;
      }
    }
    return true;
  });
  showCards();
}

// Очистка всех фильтров:

function clearFilters() {
  saveInfo(`filtInfo_${pageId}`, {});
  selecledCardList = '';
  showCards();
  var activeElements = menuFilters.getElementsByClassName('checked');
  Array.from(activeElements).forEach(element => element.classList.remove('checked'));
  setFiltersHeight();
}

//=====================================================================================================
//  Функции для работы с карточками товаров:
//=====================================================================================================

// Отображение карточек на странице:

function showCards() {
  if (selecledCardList === '') {
    gallery.style.display = 'flex';
    galleryNotice.style.display = 'none';
    loadCards(sortedItems);
  } else {
    if (selecledCardList.length == 0) {
      galleryNotice.style.display = 'flex';
      gallery.style.display = 'none';
      setFiltersHeight();
    } else {
      gallery.style.display = 'flex';
      galleryNotice.style.display = 'none';
      loadCards(selecledCardList);
    }
  }
}

// Добавление новых карточек при скролле страницы:

window.addEventListener('scroll', scrollGallery);
window.addEventListener('resize', scrollGallery);

function scrollGallery() {
  var scrolled = window.pageYOffset || document.documentElement.scrollTop;
  if (scrolled * 2 + window.innerHeight >= document.body.clientHeight) {
    loadCards();
  }
}

// Переключение вида отображения карточек на странице:

function toggleView(newView) {
  if (view != newView) {
    document.querySelector(`.view-${view}`).classList.remove('activ');
    event.currentTarget.classList.add('activ');
    var content = document.querySelector('.content');
    content.classList.remove(`${view}`);
    content.classList.add(`${newView}`);
    view = newView;
    setCardTemplate();
    showCards();
  }
}

function setCardTemplate() {
  if (view == 'blocks') {
    cardTemplate = minCardTemplate;
  }
  if (view == 'list') {
    cardTemplate = bigCardTemplate;
  }
}

// Раскрытие в полный размер большой карточки:

function openBigCard(event) {
  var card = event.currentTarget.closest('.big-card');
  card.classList.toggle('open');
  setFiltersHeight();
}

// Отображение полной карточки товара:

function showFullCard(objectId) {
  cardTemplate = fullCardTemplate;
  var fullCard = createCard(items.find(item => item.object_id == objectId));
  fullCardContainer.innerHTML = fullCard;
  fullCardContainer.style.display = 'block';
  setCardTemplate();

  var card = document.querySelector('.full-card');
  toggleDisplayBtns(card);
}

// Скрытие полной карточки товара:

function closeFullCard(event) {
  if (!(event.target.closest('.card-imgbox') || (event.target.closest('.card-sizes')))) {
    fullCardContainer.style.display = 'none';
  }
}

// Отображение картинки полного размера на экране:

function showFullImg(event) {
  var imgPath = event.currentTarget.querySelector('img').src.replace('productpage', 'source');
  fullImg.src = imgPath;
  fullImgBox.style.display = 'block';
}

// Скрытие картинки полного размера:

function closeFullImg() {
  fullImgBox.style.display = 'none';
}

// Переключение картинок в карусели с помощью кнопок управления:

function moveCarousel(objectId) {
  var card = event.currentTarget.closest('.card'),
      carousel = card.querySelector('.carousel'),
      imgCounter = parseInt(carousel.dataset.imgcounter),
      images = items.find(item => item.object_id == objectId).images,
      lastImg = images.length - 1,
      imageWidth = carousel.querySelector('.carousel-item').clientWidth,
      carouselInner = carousel.querySelector('.carousel-inner');

  if (event.currentTarget.classList.contains('left-btn')) {
    imgCounter = imgCounter == 0 ? 0 : --imgCounter;
  } else {
    imgCounter = imgCounter == lastImg ? lastImg : ++imgCounter;
  }
  carousel.dataset.imgcounter = imgCounter;
  carouselInner.style.marginLeft = `-${imgCounter * imageWidth}px`;

  if (card.classList.contains('full-card')) {
    showImg(event);
  }
  toggleDisplayBtns(card);
}

// Переключение отображения кнопок карусели:

window.addEventListener('resize', () => {
  if (fullCardContainer.style.display == 'block') {
    var card = document.querySelector('.full-card');
    toggleDisplayBtns(card);
  }
});

function toggleDisplayBtns(card) {
  var objectId = parseInt(card.dataset.objectId),
      images = items.find(item => item.object_id == objectId).images,
      carousel = card.querySelector('.carousel'),
      imageWidth = carousel.querySelector('.carousel-item').clientWidth,
      carouselWidth = carousel.querySelector('.carousel-gallery').clientWidth,
      carouselInner = carousel.querySelector('.carousel-inner'),
      leftBtn = carousel.querySelector('.left-btn'),
      rightBtn = carousel.querySelector('.right-btn'),
      imgCounter = parseInt(carousel.dataset.imgcounter);

  if (carouselWidth >= imageWidth * images.length) {
    rightBtn.style.visibility = 'hidden';
    leftBtn.style.visibility = 'hidden';
  } else  {
    if (imgCounter == 0) {
      leftBtn.style.visibility = 'hidden';
    } else {
      leftBtn.style.visibility = 'visible';
    }

    if (-parseInt(carouselInner.style.marginLeft) >= imageWidth * images.length - carouselWidth) {
      rightBtn.style.visibility = 'hidden';
    } else {
      rightBtn.style.visibility = 'visible';
    }
  }
}

// Переключение картинок в карусели при клике на миниатюру:

function toggleImg(imgNumb) {
  if (window.innerWidth < 769) {
    showFullImg(event);
  } else {
    var carousel = event.currentTarget.closest('.carousel');
    carousel.dataset.imgcounter = imgNumb;
    showImg(event);
  }
}

// Изменение основной картинки в карусели и выделение миниатюры:

function showImg(event) {
  var carousel = event.currentTarget.closest('.carousel'),
      imgCounter = parseInt(carousel.dataset.imgcounter),
      img = carousel.querySelector(`.carousel-item-${imgCounter} img`);

  carousel.querySelector('.img-active').classList.remove('img-active');
  carousel.querySelector(`.carousel-item-${imgCounter}`).classList.add('img-active');

  var curImg = document.getElementById('img');
  curImg.src = img.src;
}
