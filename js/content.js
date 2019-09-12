'use strict';

setPaddingToBody();

//=====================================================================================================
// // Преобразование исходных данных:
//=====================================================================================================

items.forEach(item => {
  item.images = item.images.toString().split(';');
});

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var pageId = document.body.id,
    cartAmount = document.querySelector('.cart-amount span'),
    cartPrice = document.querySelector('.cart-price span'),
    submenu = document.querySelector('.submenu'),
    headerSelect = document.querySelector('.header-select'),
    mainNav = document.getElementById('main-nav'),
    content = document.getElementById('content'),
    filtersContainer = document.querySelector('.filters-container'),
    filters = document.querySelector('.filters'),
    menuFilters = document.getElementById('menu-filters'),
    gallery = document.getElementById('gallery'),
    galleryNotice = document.getElementById('gallery-notice'),
    fullCardContainer = document.getElementById('full-card-container'),
    fullImgBox = document.getElementById('full-imgbox'),
    fullImg = document.getElementById('full-img'),
    manufTitle =document.getElementById('manuf-title');

// Получение шаблонов из HTML:

var mainNavTemplate = document.getElementById('main-nav').innerHTML,
    navItemTemplate = document.querySelector('.nav-item').outerHTML,
    filterTemplate = document.querySelector('.filter').outerHTML,
    filterItemTemplate = document.querySelector('.filter-item').outerHTML,
    filterSubitemTemplate = document.querySelector('.filter-item.subitem').outerHTML,
    minCardTemplate = document.getElementById('card-#object_id#'),
    bigCardTemplate = document.getElementById('big-card-#object_id#'),
    fullCardTemplate = document.getElementById('full-card-#object_id#');

// Получение свойств #...# из шаблонов HTML:

var re =/#[^#]+#/gi;

function extractProps(template) {
  return template.match(re).map(prop => prop = prop.replace(/#/g, ''));
}

function removeReplays(template, subTemplate) {
  template = template.filter(el => !subTemplate.indexOf(el) >= 0);
}

// Динамически изменяемые переменные:

var view = content.classList.item(0),
    cardTemplate,
    sortedItems,
    selecledCardList = '',
    countItems = 0,
    countItemsTo = 0,
    curItems;

//=====================================================================================================
// Заполнение контента страницы:
//=====================================================================================================

// Первоначальное заполнение контента на странице:

setCardTemplate();
initPage();
renderCart();

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Установка отступов документа:

window.addEventListener('resize', setPaddingToBody);

function setPaddingToBody() {
  var headerHeight = document.querySelector('.header').clientHeight;
  var footerHeight = document.querySelector('.footer').clientHeight;
  document.body.style.paddingTop = `${headerHeight}px`;
  document.body.style.paddingBottom = `${footerHeight + 20}px`;
}

// Установка ширины галереи и малых карточек товара:

window.addEventListener('resize', setGalleryWidth);

function setGalleryWidth() {
  gallery.style.width = (content.clientWidth - filters.clientWidth) + 'px';
}

// Установка ширины малых карточек товаров:

window.addEventListener('resize', setMinCardWidth);

function setMinCardWidth() {
  if (content.classList.contains('list')) {
    return;
  }
  var standartWidth = (13 * parseInt(getComputedStyle(gallery).fontSize, 10)),
      countCards = Math.floor(gallery.clientWidth / standartWidth),
      restGallery = gallery.clientWidth - countCards * standartWidth,
      changeMinCard = restGallery / countCards,
      minCardWidth = 0;
  if (changeMinCard <= 110) {
    minCardWidth = standartWidth + changeMinCard;
  } else {
    countCards = countCards + 1;
    minCardWidth = gallery.clientWidth / countCards;
  }
  document.querySelectorAll('.min-card').forEach(minCard => {
    minCard.style.width = minCardWidth + 'px';
  })
}

// Открытие и закрытие подменю на малых разрешениях:

function toggleSubmenu() {
  submenu.classList.toggle('open');
}

// Открытие и закрытие фильтрации ЗИП на малых разрешениях:

function toggleSelectMenu() {
  headerSelect.classList.toggle('open');
}

// Установка высоты меню фильтров:

window.addEventListener('scroll', setFiltersHeight);
window.addEventListener('resize', setFiltersHeight);

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
// Функции для работы с URL и данными страницы:
//=====================================================================================================

// Фильтрация исходных данных в зависимости от страницы:

function initPage() {
  if (pageId == 'r_zip' && !location.search) {
    window.history.pushState({'path': ['snegohod']},'', '?snegohod');
  }

  var path = location.search.split('?').map(element => {
    if (element == '') {
      return pageId;
    } else {
      return element;
    }
  });

  toggleMenuItems(path);
  createMainNav(path);
  renderContent(path);
  setGalleryWidth();
  setMinCardWidth();
}

// Изменение URL без перезагрузки страницы:

window.addEventListener('popstate', openPage);

function openPage() {
  event.preventDefault();
  var path;

  if (event.state) {
    path = event.state.path;
  } else {
    var levelNewUrl = event.currentTarget.dataset.level,
        newUrl = event.currentTarget.dataset.href;
    path = Array.from(document.querySelector('.header-menu').querySelectorAll('.activ'))
      .filter(element => element.dataset.level < levelNewUrl)
      .map(element => element.dataset.href);
    path.push(newUrl);

    var urlPath = path
      .map(element => {
        if (element == pageId) {
          return location.href.split('?')[0];
        } else {
          return '?' + element;
        }
      })
      .join('');

    window.history.pushState({'path': path},'', urlPath);
  }

  var pageUrl = path[path.length - 1],
      pageTitle = document.querySelector(`[data-href="${pageUrl}"]`).textContent;
  document.title = `ТОП СПОРТС - ${pageTitle}`;
  toggleMenuItems(path);
  createMainNav(path);
  renderContent(path);
}

// Изменение подсвечивания разделов меню:

function toggleMenuItems(path) {
  document.querySelector('.header-menu').querySelectorAll('.activ').forEach(item => item.classList.remove('activ'));
  for (var key of path) {
    var curMenuItem = document.querySelector(`[data-href="${key}"]`);
    if (curMenuItem) {
      curMenuItem.classList.add('activ');
    }
  }
}

// Изменение хлебных крошек:

function createMainNav(path) {
  var pageUrl,
      curMenuItem,
      listNavItems = '';

  for (var i = 0; i < path.length; i++) {
    pageUrl = path[i];
    curMenuItem = document.querySelector(`[data-href="${pageUrl}"]`);

    if (curMenuItem) {
      var newNavItem = navItemTemplate
      .replace('#isCurPage#', i == path.length - 1 ? 'cur-page' : '')
      .replace('#pageUrl#', pageUrl)
      .replace('#pageTitle#', curMenuItem.textContent);
      listNavItems += newNavItem;
    }
  }

  if (path[path.length - 1] == 'zip') {
    headerSelect.style.display = 'block';
    submenu.classList.add('zip');
  } else {
    if (headerSelect) {
      headerSelect.style.display = 'none';
      submenu.classList.remove('zip');
    }
  }
  setPaddingToBody();

  var newMainNav = mainNavTemplate.replace(navItemTemplate, listNavItems);
  mainNav.innerHTML = newMainNav;
}

// Изменение контента страницы:

function renderContent(path) {
  sortedItems = items;
  for (var key of path) {
    if (key != pageId) {
      sortedItems = sortedItems.filter(item => item[key] == 1);
    }
  }
  selecledCardList = '';
  initFilters(path[path.length - 1]);
  checkFilters();
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
//  Функции для отображения корзины на странице:
//=====================================================================================================

// Проверка сохраненных данных о корзине и их отображение:

function renderCart() {
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

//=====================================================================================================
//  Функции для отображения фильтров на странице:
//=====================================================================================================

// Подготовка данных для создания меню фильтров и отображение фильтров на странице:

function initFilters(urlPage) {
  var data = JSON.parse(JSON.stringify(dataForFilters));
  if (typeof catId != 'undefined' && Object.keys(catId).indexOf(urlPage) >= 0) {
    var newData = createNewData(catId[urlPage]);
    data.splice(1, 0, newData);
  }

  var isExsist = false;
  for (var filter of data) {
    for (var item in filter.items) {
      isExsist = sortedItems.find(card => {
        if (card[filter.key] == item || card[item] == 1) {
          return true;
        }
      });
      if (!isExsist) {
        delete filter.items[item];
      }
      if (typeof filter.items[item] == 'object') {
        for (var subItem in filter.items[item]) {
          isExsist = sortedItems.find(card => {
            if (card.subcat == [filter.items[item][subItem]]) {
              return true;
            }
          });
          if (!isExsist) {
            delete filter.items[item][subItem];
          }
        }
      }
    }
  }

  var createdFilters = createFilters(data);
  menuFilters.innerHTML = createdFilters;
  filtersContainer.style.display = 'block';
}

// Создание фильтра категорий в экипировке:

function createNewData(key) {
  var cat = {};
  for (var catName in cats) {
    if (cats[catName] == key) {
      cat[catName] = '1';
    }
  }
  var newFilter = {
    title: 'Категория',
    isShow: true,
    key: 'cat',
    items: cat
  }
  return newFilter;
}

// Создание меню фильтров:

function createFilters(data) {
  var listFilters = data.map(element => {
    if (Object.keys(element.items).length > 0) {
      return createFilter(element);
    }
  }).join('');
  return listFilters;
}

// Создание одного фильтра:

function createFilter(data) {
  var newFilter = filterTemplate,
      listItems = '',
      curTitle;
  for (var item in data.items) {
    var listSubItems = '',
        isHiddenOpenBtn = 'hidden';

    if (typeof data.items[item] === 'object') {
      for (var subitem in data.items[item]) {
        if (data.items[item][subitem] !== '') {
          isHiddenOpenBtn = '';
          var newSubitem = filterSubitemTemplate
          .replace('#key#', item)
          .replace('#value#', data.items[item][subitem])
          .replace('#title#', data.items[item][subitem])
        listSubItems += newSubitem;
        }
      }
    }

    if ((data.items[item] == 1) || (data.key == 'cat')) {
      curTitle = item;
    } else {
      curTitle = data.items[item];
    }

    var newItem = filterItemTemplate
      .replace(filterSubitemTemplate, listSubItems)
      .replace('#key#', data.key)
      .replace('#value#', item)
      .replace('#title#', curTitle)
      .replace('#isHiddenOpenBtn#', isHiddenOpenBtn);
    listItems += newItem;
  }
  newFilter = newFilter
    .replace(filterItemTemplate, listItems)
    .replace('#key#', data.key)
    .replace('#isShowFilter#', data.isShow ? 'open' : '')
    .replace('#title#', data.title);
  return newFilter;
}

// Проверка сохраненных значений фильтров и их визуальное отображение;

function checkFilters() {
  if (getInfo(`filtInfo_${pageId}`)) {
    if (Object.keys(getInfo(`filtInfo_${pageId}`)).length != 0) {
      var filtersInfo = getInfo(`filtInfo_${pageId}`);
      for (var k in filtersInfo) {
        var filter = document.querySelector(`#filter-${k}`);
        if (filter) {
          filter.classList.add('open');
        }
        for (var kk in filtersInfo[k]) {
          var el = document.querySelector(`[data-key="${k}"][data-value="${kk}"]`);
          if (el) {
            el.classList.add('checked');
            var filterItem = el.closest('.filter-item');
            if (filterItem) {
              filterItem.classList.add('open');
            }
          }
          for (var kkk in filtersInfo[k][kk]) {
            var el = document.querySelector(`[data-key="${kk}"][data-value="${kkk}"]`);
            if (el) {
              el.classList.add('checked');
              var filterItem = el.closest('.filter-item');
              if (filterItem) {
                filterItem.classList.add('open');
              }
            }
          }
        }
      }
      selectCards();
      return;
    }
  }
  showCards();
}

//=====================================================================================================
//  Функции для работы с фильтрами:
//=====================================================================================================

// Отображение/ скрытие фильтра:

function toggleFilter(event) {
  if (event.target.classList.contains('filter-title')) {
    event.currentTarget.classList.toggle('open');
    filters.scrollTop = event.currentTarget.offsetTop;
  }
}

// Отображение/ скрытие подфильтра:

function toggleFilterItem(event) {
  event.currentTarget.closest('.filter-item').classList.toggle('open');
}

// Выбор значений фильтра:

function selectValue(event) {
  event.stopPropagation();
  if (event.target.classList.contains('open-btn')) {
    return;
  }
  var curItem = event.currentTarget,
      type = curItem.dataset.type,
      key = curItem.dataset.key,
      value = curItem.dataset.value;

  if (curItem.classList.contains('checked')) {
    removeFiltersInfo(type, key, value);
    curItem.classList.remove('checked');
    curItem.classList.remove('open');

    var subItems = curItem.querySelectorAll('.filter-item.checked');
    subItems.forEach(subItem => subItem.classList.remove('checked'));
  } else {
    saveFiltersInfo(type, key, value);
    curItem.classList.add('checked');
    curItem.classList.add('open');

    var filterItem = curItem.closest('.filter-item.item');
    if (filterItem) {
      filterItem.classList.add('checked');
    }
  }
  if (Object.keys(getInfo(`filtInfo_${pageId}`)).length == 0) {
    selecledCardList = '';
    showCards();
  } else {
    selectCards();
  }
}

// Добавление данных о выбранных фильтрах:

function saveFiltersInfo(type, key, value) {
  var filtersInfo = getInfo(`filtInfo_${pageId}`) ? getInfo(`filtInfo_${pageId}`) : {};
  if (type == 'item') {
    if (!filtersInfo[key]) {
      filtersInfo[key] = {};
    }
    if (!filtersInfo[key][value]) {
      filtersInfo[key][value] = '';
    }
  }
  if (type == 'subitem') {
    if (!filtersInfo.cat) {
      filtersInfo.cat = {};
    }
    if (!filtersInfo.cat[key]) {
      filtersInfo.cat[key] = {};
    }
    filtersInfo.cat[key][value] = '';
  }
  saveInfo(`filtInfo_${pageId}`, filtersInfo);
}

// Удаление данных о выбранных фильтрах:

function removeFiltersInfo(type, key, value) {
  var filtersInfo = getInfo(`filtInfo_${pageId}`);
  if (type == 'item') {
    delete filtersInfo[key][value];
    if (Object.keys(filtersInfo[key]).length == 0) {
      delete filtersInfo[key];
    }
  }
  if (type == 'subitem') {
    delete filtersInfo.cat[key][value];
    if (filtersInfo.cat[key] && Object.keys(filtersInfo.cat[key]).length == 0) {
      filtersInfo.cat[key] = '';
    }
  }
  saveInfo(`filtInfo_${pageId}`, filtersInfo);
}

// Фильтрация карточек:

function selectCards() {
  var filtersInfo = getInfo(`filtInfo_${pageId}`);

  for (var k in filtersInfo) {
    for (var kk in filtersInfo[k]) {
      var el = document.querySelector(`[data-key="${k}"][data-value="${kk}"]`);
      if (!el) {
        delete filtersInfo[k][kk];
      }
      for (var kkk in filtersInfo[k][kk]) {
        var el = document.querySelector(`[data-key="${kk}"][data-value="${kkk}"]`);
        if (!el) {
          delete filtersInfo[k][kk][kkk];
        }
        if (Object.keys(filtersInfo[k][kk]).length == 0) {
          delete filtersInfo[k][kk];
        }
      }
      if (Object.keys(filtersInfo[k]).length == 0) {
        delete filtersInfo[k];
      }
    }
  }
  console.log(filtersInfo);

  selecledCardList = sortedItems.filter(card => {
    for (var k in filtersInfo) {
      var isFound = false;
      for (var kk in filtersInfo[k]) {
        if (filtersInfo[k][kk] && Object.keys(filtersInfo[k][kk]).length != 0) {
          for (var kkk in filtersInfo[k][kk]) {
            if (card.cat == kk && card.subcat == kkk) {
              isFound = true;
            }
          }
        } else {
          if (card[k] == kk || card[kk] == 1) {
            isFound = true;
          }
        }
      }
      if (!isFound) {
        return false;
      }
    }
    return true;
  });
  console.log(selecledCardList);
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
//  Функции для отображения карточек товаров на странице:
//=====================================================================================================

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
  setGalleryWidth();
  setMinCardWidth();
}

// Создание одной карточки товара :

function createCard(card) {
  var newCard = cardTemplate.outerHTML,
      props = extractProps(newCard),
      totalValue = 0;

  if (cardTemplate != minCardTemplate) {

    var manufData;
    if (card.manuf) {
      try {
        manufData = JSON.parse(card.manuf);
      }
      catch(error) {
        console.error(error);
      }
    }

    var listOptions = '',
        optionsTemplate = cardTemplate.querySelector('.card-options').innerHTML,
        propsOptions = extractProps(optionsTemplate);
    if (card.options && card.options != 0) {
      for (var option in card.options) {
        if ((option == 7 || option == 31 || option == 32 || option == 33) && manufData && Object.keys(manufData.man).length > 1) {
          continue;
        } else {
          var newOption = optionsTemplate
            .replace('#optitle#', optnames[option])
            .replace('#opinfo#', card.options[option]);
          listOptions += newOption;
        }
      }
    }
    removeReplays(props, propsOptions);
    newCard = newCard.replace(optionsTemplate, listOptions);

    if (manufData && Object.keys(manufData.man).length > 1) {
      var listManufInfo = '',
          manufRowTemplate = cardTemplate.querySelector('.manuf-info').outerHTML,
          manufcellTemplate = cardTemplate.querySelector('.manuf-info').innerHTML,
          propsManufInfo = extractProps(manufRowTemplate),
          manufListTitle = Array.from(manufTitle.querySelectorAll('th')).map(element => element.dataset.title);

      for (var man in manufData.man) {
        var newRow = manufRowTemplate;
        var listCells = '';

        for (var k of manufListTitle) {
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
          if (cell.length == 0) {
            cell.push('&ndash;');
          }
          cell = cell.join(', ');
          newCell = newCell.replace('#info#', cell);
          listCells += newCell;
        }
        newRow = newRow.replace(manufcellTemplate, listCells);
        listManufInfo += newRow;
      }
      removeReplays(props, propsManufInfo);
      newCard = newCard.replace(manufRowTemplate, listManufInfo);
    }

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
    } else if (prop == 'isHiddenRightBtn') {
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
      propCard = manufData && Object.keys(manufData.man).length > 1 ? '' : 'displayNone';
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

function closeBigCard(event) {
  var card = event.currentTarget.closest('.big-card');
  if (window.innerWidth < 768) {
    if (!(event.target.classList.contains('toggle-btn') || event.target.closest('.carousel') || event.target.closest('.card-size') || event.target.classList.contains('dealer-button'))) {
      card.classList.remove('open');
      setFiltersHeight();
    }
  }
}

// Отображение полной карточки товара:

function showFullCard(objectId) {
  cardTemplate = fullCardTemplate;
  var fullCard = createCard(items.find(item => item.object_id == objectId));
  fullCardContainer.innerHTML = fullCard;
  fullCardContainer.style.display = 'flex';
  setCardTemplate();

  var card = document.querySelector('.full-card');
  toggleDisplayBtns(card);
}

// Скрытие полной карточки товара:

function closeFullCard(event) {
  if (!(event.target.closest('.card-imgbox') || event.target.closest('.card-size') || event.target.classList.contains('dealer-button'))) {
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
      imgCounter = parseInt(carousel.dataset.imgcounter, 10),
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
  var objectId = parseInt(card.dataset.objectId, 10),
      images = items.find(item => item.object_id == objectId).images,
      carousel = card.querySelector('.carousel'),
      imageWidth = carousel.querySelector('.carousel-item').clientWidth,
      carouselWidth = carousel.querySelector('.carousel-gallery').clientWidth,
      carouselInner = carousel.querySelector('.carousel-inner'),
      leftBtn = carousel.querySelector('.left-btn'),
      rightBtn = carousel.querySelector('.right-btn'),
      imgCounter = parseInt(carousel.dataset.imgcounter, 10);

  if (carouselWidth >= imageWidth * images.length) {
    rightBtn.style.visibility = 'hidden';
    leftBtn.style.visibility = 'hidden';
  } else  {
    if (imgCounter == 0) {
      leftBtn.style.visibility = 'hidden';
    } else {
      leftBtn.style.visibility = 'visible';
    }

    if (-parseInt(carouselInner.style.marginLeft, 10) >= imageWidth * images.length - carouselWidth) {
      rightBtn.style.visibility = 'hidden';
    } else {
      rightBtn.style.visibility = 'visible';
    }
  }
}

// Переключение картинок в карусели при клике на миниатюру:

function toggleImg(imgNumb) {
  if (window.innerWidth < 768) {
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
      imgCounter = parseInt(carousel.dataset.imgcounter, 10),
      img = carousel.querySelector(`.carousel-item-${imgCounter} img`);

  carousel.querySelector('.img-active').classList.remove('img-active');
  carousel.querySelector(`.carousel-item-${imgCounter}`).classList.add('img-active');

  var curImg = document.getElementById('img');
  curImg.src = img.src;
}

//=====================================================================================================
//  Функции сортировки карточек товаров:
//=====================================================================================================

// Сортировка карточек товаров:

function sortItems() {
  var sort = document.getElementById('sort');
  var selectedOption = sort.options[sort.selectedIndex].value;
  sortedItems.sort(dynamicSort(selectedOption));
  if (selecledCardList !== '') {
    selecledCardList.sort(dynamicSort(selectedOption));
  }
  showCards();
}

// Сортировка массива объектов по указанному значению:

function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
  }

  if (property == 'price1') {
    return function (a, b) {
      var result = a[property] - b[property];
      return result * sortOrder;
    }
  } else {
    return function (a, b) {
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }
}
