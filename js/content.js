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
    searchInput = document.getElementById('search'),
    searchBtn = document.querySelector('.search .search-btn'),
    searchInfo = document.getElementById('search-info'),
    searchCount = document.getElementById('search-count'),
    clearSearchBtn = document.querySelector('.search .clear-search-btn'),
    submenu = document.querySelector('.submenu'),
    headerSelect = document.querySelector('.header-select'),
    mainHeader = document.querySelector('.main-header'),
    mainNav = document.getElementById('main-nav'),
    content = document.getElementById('content'),
    filtersContainer = document.querySelector('.filters-container'),
    filters = document.querySelector('.filters'),
    menuFilters = document.getElementById('menu-filters'),
    manufTitle =document.getElementById('manuf-title'),
    gallery = document.getElementById('gallery'),
    galleryNotice = document.getElementById('gallery-notice'),
    fullCardContainer = document.getElementById('full-card-container'),
    fullImgBox = document.getElementById('full-imgbox'),
    fullImgBoxContent = document.querySelector('.full-imgbox-content'),
    loader = document.getElementById('loader');

// Получение шаблонов из HTML:

var mainNavTemplate = document.getElementById('main-nav').innerHTML,
    navItemTemplate = document.querySelector('.nav-item').outerHTML,
    filterTemplate = document.querySelector('.filter').outerHTML,
    filterItemTemplate = document.querySelector('.filter-item').outerHTML,
    filterSubitemTemplate = document.querySelector('.filter-item.subitem').outerHTML,
    minCardTemplate = document.getElementById('min-card-#object_id#'),
    bigCardTemplate = document.getElementById('big-card-#object_id#'),
    fullCardTemplate = document.getElementById('full-card-#object_id#'),
    fullImgBoxTemplate = document.getElementById('full-imgbox').innerHTML,
    fullImgBoxContentTemplate = document.querySelector('.full-imgbox-content').outerHTML;

// Получение свойств #...# из шаблонов HTML:

var regExpTemplate =/#[^#]+#/gi;

function extractProps(template) {
  return template.match(regExpTemplate).map(prop => prop = prop.replace(/#/g, ''));
}

function removeReplays(template, subTemplate) {
  template = template.filter(el => !subTemplate.indexOf(el) >= 0);
}

// Динамически изменяемые переменные:

var pageUrl =  pageId,
    view = content.classList.item(0),
    cardTemplate,
    curItems,
    dataForPageFilters,
    itemsForSearch,
    selecledCardList = '',
    searchedCardList = [],
    countItems = 0,
    countItemsTo = 0,
    itemsToLoad,
    curItemsArray,
    isExsist;

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

// Кастомные настройки каруселей:

window.bigCardCarousel = new Carousel();
window.bigCardCarousel.duration = 400;

window.fullCardCarousel = new Carousel();
window.fullCardCarousel.duration = 500;

// Ограничение частоты вызова функций:

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

// Установка отступов документа:

window.addEventListener('resize', setPaddingToBody);

function setPaddingToBody() {
  var headerHeight = document.querySelector('.header').clientHeight;
  var footerHeight = document.querySelector('.footer').clientHeight;
  document.body.style.paddingTop = `${headerHeight}px`;
  document.body.style.paddingBottom = `${footerHeight + 20}px`;
}

// Установка ширины галереи:

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

window.addEventListener('scroll', setFiltersPosition);
window.addEventListener('resize', setFiltersPosition);

var filtersPosition,
    scrolled,
    headerHeight,
    headerMainHeight,
    footerHeight,
    filtersHeight;

function setFiltersPosition() {
  if (window.innerWidth > 767) {
    filtersPosition = filters.style.position;
    if (filtersPosition == 'fixed') {
      if (filters.clientHeight >= gallery.clientHeight) {
        filters.style.position = 'static';
        filters.style.top = '0px';
        filters.style.height = 'auto';
      } else {
        setFiltersHeight();
      }
    } else {
      if (filters.clientHeight < gallery.clientHeight) {
        filters.style.position = 'fixed';
        setFiltersHeight();
      }
    }
  }
}

function setFiltersHeight() {
  scrolled = window.pageYOffset || document.documentElement.scrollTop;
  headerHeight = document.querySelector('.header').clientHeight;
  headerMainHeight = Math.max((document.querySelector('.main-header').clientHeight - scrolled), 20);
  footerHeight = Math.max((window.innerHeight + scrolled - document.querySelector('.footer').offsetTop) + 20, 0);
  filtersHeight = window.innerHeight - headerHeight - headerMainHeight - footerHeight;

  filters.style.top = `${headerHeight + headerMainHeight}px`;
  filters.style.height = `${filtersHeight}px`;
}

// Добавление всплывающих подсказок:

function addTooltips(key) {
  var elements = document.querySelectorAll(`[data-key=${key}]`);
  elements.forEach(el => {
    var tooltipText = el.textContent.trim();
    el.setAttribute('tooltip', tooltipText);
  });
}

// Функция преобразования цены к формату с пробелами:

function convertPrice(price) {
  return (price + '').replace(/(\d{1,3})(?=((\d{3})*)$)/g, " $1");
}

// Функция преобразования строки с годами к укороченному формату:

var years,
    reduceYears,
    resultYears;

function convertYears(stringYears) {
  years = stringYears.split(',');
  reduceYears = [];
  resultYears = [];
  for (var i = 0; i < years.length; i++) {
    if ((parseInt(years[i], 10) - 1 != parseInt(years[i - 1], 10)) || (parseInt(years[i], 10) + 1 != parseInt(years[i + 1], 10))) {
      reduceYears.push(years[i]);
    }
  }
  for (var i = 0; i < reduceYears.length; i++) {
    if (i != reduceYears.length - 1 && (parseInt(reduceYears[i], 10) + 1 != parseInt(reduceYears[i + 1], 10))) {
      resultYears.push(reduceYears[i] + '&ndash;');
    } else {
      resultYears.push(reduceYears[i]);
    }
  }
  return resultYears = resultYears.join('');
}

//=====================================================================================================
// Сохранение и извлечение данных на компьютере пользователя:
//=====================================================================================================

// Проверка доступности storage:

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

// Сохранение данныx в storage или cookie:

function saveInLocal(key, data) {
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

// Получение данных из storage или cookie:

function getFromLocal(key) {
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

// Получение данных о странице по ключу:

function getInfo(key) {
  var pageInfo = getFromLocal(pageId) ? getFromLocal(pageId) : {};
  if (!pageInfo[key]) {
    pageInfo[key] = {};
  }
  return pageInfo[key];
}

// Сохранение данных о странице по ключу:

function saveInfo(key, data) {
  var pageInfo = getFromLocal(pageId) ? getFromLocal(pageId) : {};
  if (!pageInfo[key]) {
    pageInfo[key] = {};
  }
  pageInfo[key] = data;
  saveInLocal(pageId, pageInfo);
}

//=====================================================================================================
// Функции для работы с URL и данными страницы:
//=====================================================================================================

// Запуск отрисовки новой страницы:

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

  var curUrl = path[path.length - 1],
      pageTitle = document.querySelector(`[data-href="${curUrl}"]`).textContent;
  document.title = `ТОП СПОРТС - ${pageTitle}`;
  renderContent(path);
}

// Изменение разделов меню:

function toggleMenuItems(path) {
  document.querySelector('.header-menu').querySelectorAll('.activ').forEach(item => item.classList.remove('activ'));
  for (var key of path) {
    var curMenuItem = document.querySelector(`[data-href="${key}"]`);
    if (curMenuItem) {
      curMenuItem.classList.add('activ');
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
}

// Изменение хлебных крошек:

function createMainNav(path) {
  var curUrl,
      curMenuItem,
      listNavItems = '';

  for (var i = 0; i < path.length; i++) {
    curUrl = path[i];
    curMenuItem = document.querySelector(`[data-href="${curUrl}"]`);

    if (curMenuItem) {
      var newNavItem = navItemTemplate
      .replace('#isCurPage#', i == path.length - 1 ? 'cur-page' : '')
      .replace('#pageUrl#', curUrl)
      .replace('#pageTitle#', curMenuItem.textContent);
      listNavItems += newNavItem;
    }
  }
  var newMainNav = mainNavTemplate.replace(navItemTemplate, listNavItems);
  mainNav.innerHTML = newMainNav;
}

// Изменение контента страницы:

function renderContent(path) {
  toggleMenuItems(path);
  createMainNav(path);
  if (mainHeader.style.display != 'flex') {
    mainHeader.style.display = 'flex';
  }

  curItems = items;
  for (var key of path) {
    if (key != pageId) {
      curItems = curItems.filter(item => item[key] == 1);
    }
  }
  prepeareForSearch(curItems);
  if (searchInfo.style.visibility == 'visible') {
    clearSearch();
  }
  pageUrl = location.search;

  dataForPageFilters = JSON.parse(JSON.stringify(dataForFilters));
  if (typeof catId != 'undefined' && Object.keys(catId).indexOf(path[path.length - 1]) >= 0) {
    var dataCats = createDataCats(catId[path[path.length - 1]]);
    dataForPageFilters.splice(1, 0, dataCats);
  }
  selecledCardList = '';
  initFilters();
  checkFilters();
}

//=====================================================================================================
//  Функции для отображения корзины на странице:
//=====================================================================================================

// Проверка сохраненных данных о корзине и их отображение:

function renderCart() {
  if (cartAmount) {
    var cartInfo = getInfo('cart'),
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
//  Функции для создания фильтров на странице:
//=====================================================================================================

// Создание фильтра категорий в экипировке:

function createDataCats(key) {
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

// Отображение фильтров на странице:

function initFilters() {
  console.log('initFilters');
  var data =  JSON.parse(JSON.stringify(dataForPageFilters));
  curItemsArray = curItems;
  isExsist = false;

  if (selecledCardList != '') {
    curItemsArray = selecledCardList;
  }

  for (var filter of data) {
    for (var item in filter.items) {
      isExsist = curItemsArray.find(card => {
        if (card[filter.key] == item || card[item] == 1) {
          return true;
        }
      });
      if (!isExsist) {
        delete filter.items[item];
      }
      if (typeof filter.items[item] == 'object') {
        for (var subItem in filter.items[item]) {
          isExsist = curItemsArray.find(card => {
            if (card.subcat == filter.items[item][subItem]) {
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
  addTooltips('color');
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

// Выбор значения фильтра:

function selectValue(event) {
  event.stopPropagation();
  if (event.target.classList.contains('open-btn') || event.currentTarget.classList.contains('disabled')) {
    return;
  }

  var scrollTop = window.pageYOffset || document.documentElement.scrollTop,
      curItem = event.currentTarget;

  if (curItem.classList.contains('checked')) {
    curItem.classList.remove('checked', 'open');
    var subItems = curItem.querySelectorAll('.filter-item.checked');
    if (subItems) {
      subItems.forEach(subItem => subItem.classList.remove('checked'));
    }
    removeFiltersInfo(curItem);
  } else {
    curItem.classList.add('checked', 'open');
    var filterItem = curItem.closest('.filter-item.item');
    if (filterItem) {
      filterItem.classList.add('checked');
    }
    saveFiltersInfo(curItem);
  }
  var filtersInfo = getInfo('filters')[pageUrl];
  if (filtersInfo && Object.keys(filtersInfo).length == 0) {
    selecledCardList = '';
    showCards();
  } else {
    selectCards();
  }
  if (searchInfo.style.visibility == 'visible') {
    clearSearchInfo();
  }
  toggleToActualFilters(event.currentTarget);

  if (window.innerWidth > 767) {
    if (filters.style.position != 'fixed') {
      document.documentElement.scrollTop = scrollTop;
      document.body.scrollTop = scrollTop;
    }
  } else {
    document.documentElement.scrollTop = scrollTop;
    document.body.scrollTop = scrollTop;
  }
}

// Добавление данных в хранилище о выбранных фильтрах:

function saveFiltersInfo(curItem) {
  var type = curItem.dataset.type,
      key = curItem.dataset.key,
      value = curItem.dataset.value,
      filtersInfo = getInfo('filters');

  if (!filtersInfo[pageUrl]) {
    filtersInfo[pageUrl] = {};
  }
  if (type == 'item') {
    if (!filtersInfo[pageUrl][key]) {
      filtersInfo[pageUrl][key] = {};
    }
    if (!filtersInfo[pageUrl][key][value]) {
      filtersInfo[pageUrl][key][value] = '';
    }
  }
  if (type == 'subitem') {
    if (!filtersInfo[pageUrl].cat) {
      filtersInfo[pageUrl].cat = {};
    }
    if (!filtersInfo[pageUrl].cat[key]) {
      filtersInfo[pageUrl].cat[key] = {};
    }
    filtersInfo[pageUrl].cat[key][value] = '';
  }
  saveInfo('filters', filtersInfo);
}

// Удаление данных из хранилища о выбранных фильтрах:

function removeFiltersInfo(curItem) {
  var type = curItem.dataset.type,
      key = curItem.dataset.key,
      value = curItem.dataset.value,
      filtersInfo = getInfo('filters');

  if (type == 'item') {
    delete filtersInfo[pageUrl][key][value];
    if (Object.keys(filtersInfo[pageUrl][key]).length == 0) {
      delete filtersInfo[pageUrl][key];
    }
  }
  if (type == 'subitem') {
    delete filtersInfo[pageUrl].cat[key][value];
    if (filtersInfo[pageUrl].cat[key] && Object.keys(filtersInfo[pageUrl].cat[key]).length == 0) {
      filtersInfo[pageUrl].cat[key] = '';
    }
  }
  saveInfo('filters', filtersInfo);
}

// Фильтрация карточек:

function selectCards() {
  var filtersInfo = getInfo('filters')[pageUrl];
  if (!filtersInfo) {
    return;
  }

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

  selecledCardList = curItems.filter(card => {
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
  showCards();
}

// Блокировка лишних фильтров:

function toggleToActualFilters(filter) {
  var key,
      value,
      items;

  curItemsArray = curItems;
  isExsist =  false;

  if (selecledCardList != '') {
    curItemsArray = selecledCardList;
  }

  var filters = menuFilters.querySelectorAll(`.filter-item.item.checked[data-key="${filter.dataset.key}"]`);
  if (filters.length != 0) {
    items = menuFilters.querySelectorAll(`.filter-item.item:not([data-key="${filter.dataset.key}"])`);
  } else {
    items = menuFilters.querySelectorAll(`.filter-item.item`);
  }

  for (var item of items) {
    key = item.dataset.key;
    value = item.dataset.value;
    isExsist = curItemsArray.find(card => {
      if (card[key] == value || card[value] == 1) {
        item.classList.remove('disabled');
        return true;
      }
    });
    if (!isExsist) {
      item.classList.add('disabled');
      if (item.classList.contains('checked')) {
        item.classList.remove('checked', 'open');
        removeFiltersInfo(item);
      }
    }
  }
}

// Очистка всех фильтров:

function clearFilters() {
  var filtersInfo = getInfo('filters');
  filtersInfo[pageUrl] = {};
  saveInfo(`filters`, filtersInfo);

  menuFilters.querySelectorAll('.checked').forEach(el => el.classList.remove('checked'));
  menuFilters.querySelectorAll('.disabled').forEach(el => el.classList.remove('disabled'));

  if (searchInfo.style.visibility == 'visible') {
    return;
  }
  selecledCardList = '';
  showCards();
}

// Проверка сохраненных значений фильтров:

function checkFilters() {
  var filtersInfo = getInfo('filters')[pageUrl];
  if (!filtersInfo || Object.keys(filtersInfo).length == 0){
    showCards();
  } else {
    selectCards();
    selectFilters(filtersInfo);
  }
}

// Визуальное отображение выбранных фильтров:

function selectFilters(filtersInfo) {
  for (var k in filtersInfo) {
    var filter = document.querySelector(`#filter-${k}`);
    if (filter) {
      filter.classList.add('open');
    }
    for (var kk in filtersInfo[k]) {
      changeFilterClass(k, kk);
      for (var kkk in filtersInfo[k][kk]) {
        changeFilterClass(kk, kkk);
      }
    }
  }
}

// Изменение классов выбранных фильтров:

function changeFilterClass(key, value) {
  var el = document.querySelector(`[data-key="${key}"][data-value="${value}"]`);
  if (el) {
    el.classList.add('checked');
    var filterItem = el.closest('.filter-item');
    if (filterItem) {
      filterItem.classList.add('open');
    }
    toggleToActualFilters(el);
  }
}

//=====================================================================================================
//  Функции для отображения карточек товаров на странице:
//=====================================================================================================

// Создание карточек товаров из массива:

function loadCards(cards) {
	if (cards){
    countItems = 0;
    itemsToLoad = cards;
	}
	else {
    countItems = countItemsTo;
  }

  var incr;
  if (window.innerWidth > 2000) {
    if (view == 'list') {
      incr = 30;
    } else {
      incr = 60;
    }
  } else if (window.innerWidth < 1080) {
    if (view == 'list') {
      incr = 10;
    } else {
      incr = 20;
    }
  } else {
    if (view == 'list') {
      incr = 20;
    } else {
      incr = 40;
    }
  }
  countItemsTo = countItems + incr;
  if (countItemsTo > itemsToLoad.length) {
    countItemsTo = itemsToLoad.length;
  }

  var listCard = '';
  for (var i = countItems; i < countItemsTo; i++) {
    var card = createCard(itemsToLoad[i]);
    listCard += card;
  }

  if (countItems == 0) {
    gallery.innerHTML = listCard;
    window.scrollTo(0,0);
  } else {
    gallery.insertAdjacentHTML('beforeend', listCard);
  }
  setFiltersPosition();
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
          var opinfo;
          if (option == 32) {
            opinfo = convertYears(card.options[option]);
          } else {
            opinfo = card.options[option]
              .replace(/\,/gi, ', ')
              .replace(/\//gi, '/ ')
          }
          var newOption = optionsTemplate
            .replace('#optitle#', optnames[option])
            .replace('#opinfo#', opinfo);
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
          cell = convertYears(cell);
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
      var cartInfo = getInfo('cart'),
          size = info.size ? info.size : 'В корзину',
          savedValue = cartInfo[info.articul] ? cartInfo[info.articul].qty : 0,
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
        carouselTemplate = cardTemplate.querySelector('.carousel').innerHTML,
        propsCarousel = extractProps(carouselTemplate),
        carouselItemTemplate = cardTemplate.querySelector('.carousel-gallery').innerHTML,
        carouselItemNavTemplate;

    if (cardTemplate.querySelector('.carousel-nav')) {
      carouselItemNavTemplate = cardTemplate.querySelector('.carousel-nav').innerHTML;
    }
    for (var i = 0; i < card.images.length; i++) {
      var newCarouselItem = carouselItemTemplate
        .replace('#style#', i * 100 + '%')
        .replace('#imgNumb#', i)
        .replace('#image#', `http://b2b.topsports.ru/c/productpage/${card.images[i]}.jpg`);
      listCarousel += newCarouselItem;
    }
    newCard = newCard.replace(carouselItemTemplate, listCarousel);
    if (carouselItemNavTemplate) {
      listCarousel = '';
      for (var i = 0; i < card.images.length; i++) {

        var newCarouselItem = carouselItemNavTemplate
          .replace('#isActive#', i == 0 ? 'active' : '')
          .replace('#imgNumb#', i)
          .replace('#image#', `http://b2b.topsports.ru/c/productpage/${card.images[i]}.jpg`);
        listCarousel += newCarouselItem;
      }
      newCard = newCard.replace(carouselItemNavTemplate, listCarousel)
    }
    removeReplays(props, propsCarousel);
  }

  for (var prop of props) {
    var propRegExp = new RegExp('#' + prop + '#', 'gi');
    var propCard;
    if (prop == 'images') {
      propCard = `http://b2b.topsports.ru/c/productpage/${card.images[0]}.jpg`;
    } else if (prop == 'price_preorder' && card.price_preorder1 == 0) {
      newCard = newCard.replace('#price_preorder#⁠.-', '');
    } else if (prop == 'isHiddenCarouselNav') {
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
    loadCards(curItems);
  } else {
    if (selecledCardList.length == 0) {
      galleryNotice.style.display = 'flex';
      gallery.style.display = 'none';
      setFiltersPosition();
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
  if (card.classList.contains('open')) {
    event.currentTarget.setAttribute('tooltip', 'Свернуть');
  } else {
    event.currentTarget.setAttribute('tooltip', 'Раскрыть');
  }
  setFiltersPosition();
}

function closeBigCard(event) {
  var card = event.currentTarget.closest('.big-card');
  if (window.innerWidth < 767) {
    if (!(event.target.classList.contains('toggle-btn') || event.target.closest('.carousel') || event.target.closest('.card-size') || event.target.classList.contains('dealer-button'))) {
      card.classList.remove('open');
      card.querySelector('.toggle-btn').setAttribute('tooltip', 'Раскрыть');
      setFiltersPosition();
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
  document.body.style.overflow = "hidden";
}

// Скрытие полной карточки товара:

function closeFullCard(event) {
  if (!(event.target.closest('.carousel') || event.target.closest('.card-size') || event.target.classList.contains('dealer-button'))) {
    fullCardContainer.style.display = 'none';
    document.body.style.overflow = "visible";
  }
}

// Отображение картинки полного размера на экране:

function showFullImg(objectId) {
  loader.style.display = 'block';
  var listCarousel = '',
      imgs = curItems.find(item => item.object_id == objectId).images,
      newFullImgBox = fullImgBoxTemplate,
      carouselItemTemplate = fullImgBoxContent.querySelector('.carousel-gallery').innerHTML;

  for (var i = 0; i < imgs.length; i++) {
    var newCarouselItem = carouselItemTemplate
      .replace('#style#', i * 100 + '%')
      .replace('#imgNumb#', i)
      .replace('#image#', `http://b2b.topsports.ru/c/source/${imgs[i]}.jpg`);
    listCarousel += newCarouselItem;
  }

  newFullImgBox = newFullImgBox
    .replace(/#isHiddenBtn#/gi, imgs.length > 1 ? '' : 'hidden')
    .replace(carouselItemTemplate, listCarousel);
  fullImgBox.innerHTML = newFullImgBox;

  var curImg = event.currentTarget.closest('.carousel').dataset.curImg;

  if (curImg != 0) {
    var carousel = fullImgBox.querySelector('.carousel'),
        gallery = carousel.querySelector('.carousel-gallery');
    carousel.dataset.pos = curImg;
    carousel.dataset.curImg = curImg;
    gallery.style.left = -(curImg * 100) + '%';
  }

  fullImgBox.querySelectorAll('img')[curImg].addEventListener('load', () => {
    loader.style.display = 'none';
    fullImgBox.style.visibility = 'visible';
  });
}

// Скрытие картинки полного размера:

function closeFullImg() {
  if (event.target.classList.contains('btn')) {
    return;
  }
  fullImgBox.style.visibility = 'hidden';
}

//=====================================================================================================
//  Сортировка карточек товаров:
//=====================================================================================================

// Сортировка карточек товаров:

function sortItems() {
  var sort = document.getElementById('sort');
  var selectedOption = sort.options[sort.selectedIndex].value;
  curItems.sort(dynamicSort(selectedOption));
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

//=====================================================================================================
// Поиск на странице:
//=====================================================================================================

// Подготовка данных для поиска на странице:

function prepeareForSearch(data) {
  itemsForSearch = data.map(el => {
    return {object_id: el.object_id, value: convertToString(el)};
  });
}

// Конвертация всей вложенности свойств объекта в строку:

function convertToString(obj) {
  var objProps = '';
  crossObj(obj);
  return objProps;

  function crossObj(obj) {
    var prop;
    for (var k in obj) {
      prop = obj[k];
      if (typeof prop === 'string') {
        objProps += prop + ',';
      } else if (typeof prop === 'object') {
        crossObj(prop);
      }
    }
  }
}

// Поиск совпадений с введенным текстом:

var textToFind,
    regExpSearch,
    checkedText;

function findOnPage(event) {
  event.preventDefault();
  textToFind = searchInput.value.trim();
  if (textToFind == '') {
    return;
  }
  regExpSearch = new RegExp(textToFind, 'i');
  selecledCardList = [];
  itemsForSearch.filter(el => el.value.search(regExpSearch) >= 0).forEach(el => selecledCardList.push(curItems.find(item => item.object_id == el.object_id)));
  showCards();

  searchBtn.style.display = 'none';
  clearSearchBtn.style.display = 'block';
  searchCount.textContent = selecledCardList.length;
  searchInfo.style.visibility = 'visible';
}

// Очистка поиска:

function clearSearch() {
  clearSearchInfo();
  selecledCardList = '';
  checkFilters();
}

// Очистка поля поиска и поля вывода результата:

function clearSearchInfo() {
  searchBtn.style.display = 'block';
  clearSearchBtn.style.display = 'none';
  searchInfo.style.visibility = 'hidden';
  search.value = '';
}


// 27 сентября:
// - Исправлены ошибки в функционале по блокировке тех фильтров, которые не участвуют в выборке
// - Исправлены "скачки" в прокрутке страницы при выборе/ снятии фильтров
// - Добавлен запрет на прокрутку страницы, когда открыто окно с полной карточкой товаров

// Текущие задачи к выполнению:
// - Реализовать функционал по акциям и скидкам