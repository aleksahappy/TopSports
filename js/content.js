'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var search = document.querySelector('.search'),
    searchInput = document.getElementById('search'),
    searchInfo = document.getElementById('search-info'),
    searchCount = document.getElementById('search-count'),
    clearSearchBtn = document.querySelector('.search .clear-search-btn'),
    submenu = document.querySelector('.submenu'),
    subsubmenu = document.querySelector('.subsubmenu'),
    zipUrl = document.getElementById('zip-url'),
    accUrl = document.getElementById('acc-url'),
    headerSelect = document.querySelector('.header-select'),
    mainHeader = document.querySelector('.main-header'),
    mainNav = document.getElementById('main-nav'),
    mainInfo = document.querySelector('.main-info'),
    gallerySort = document.getElementById('gallery-sort'),
    content = document.getElementById('content'),
    filtersContainer = document.getElementById('filters-container'),
    filters = document.querySelector('.filters'),
    menuFilters = document.getElementById('menu-filters'),
    manufTitle = document.querySelector('.manuf-headers'),
    gallery = document.getElementById('gallery'),
    galleryNotice = document.getElementById('gallery-notice'),
    fullCardContainer = document.getElementById('full-card-container'),
    fullImgContainer = document.getElementById('full-img-container'),
    fullImg = document.querySelector('.full-img'),
    loader = document.getElementById('loader');

// Получение шаблонов из HTML:

var mainNavTemplate = mainNav.innerHTML,
    navItemTemplate = mainNav.querySelector('.nav-item').outerHTML,
    filterTemplate = document.querySelector('.filter').outerHTML,
    filterItemTemplate = document.querySelector('.filter-item').outerHTML,
    filterSubitemTemplate = document.querySelector('.filter-item.subitem').outerHTML,
    minCardTemplate = document.getElementById('min-card-#object_id#'),
    bigCardTemplate = document.getElementById('big-card-#object_id#'),
    fullCardTemplate = document.getElementById('full-card-#object_id#'),
    fullImgTemplate = document.getElementById('full-img-container').innerHTML;

// Получение свойств #...# из шаблонов HTML:

var regExpTemplate =/#[^#]+#/gi;

function extractProps(template) {
  return template.match(regExpTemplate).map(prop => prop = prop.replace(/#/g, ''));
}

function removeReplays(template, subTemplate) {
  template = template.filter(el => !subTemplate.indexOf(el) >= 0);
}

// Динамически изменяемые переменные:

var pageUrl = pageId,
    view = content.classList.item(0),
    cardTemplate,
    curItems,
    dataForPageFilters,
    itemsForSearch,
    selecledCardList = '',
    searchedCardList = [],
    curItemsArray,
    filtersInfo;

//=====================================================================================================
// // Преобразование исходных данных:
//=====================================================================================================

// Преобразование:
// - данных о картинках в карточке товара из строки в массив;
// - данных о годах в укороченный формат
// - добавление пробелов

items.forEach(item => {
  item.images = item.images.toString().split(';');
  if (item.options && item.options != 0) {
    for (key in item.options) {
      if (key == 32) {
        item.options[key] = convertYears(item.options[key]);
      } else {
        item.options[key] = item.options[key]
          .replace(/\,/gi, ', ')
          .replace(/\//gi, '/ ')
      }
    }
  }
});

// Сортировка товаров по категориям (чтобы не отражались на сайте вразноброс):

items.sort(dynamicSort(('catid')));

//=====================================================================================================
// Заполнение контента страницы:
//=====================================================================================================

// Первоначальное заполнение контента на странице:

document.addEventListener('DOMContentLoaded', () => loader.style.display = 'none');
setCardTemplate();
initPage();

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Кастомные настройки каруселей:

var bigCardCarousel = {
  durationBtns: 400,
};

var fullCardCarousel = {
  isNav: true,
  durationNav: 400,
  isLoupe: true
};

var fullImgCarousel = {
  durationNav: 400,
};

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
  if (submenu.classList.contains('open')) {
    submenu.classList.remove('open');
  } else {
    submenu.classList.add('open');
    search.classList.remove('open');
  }
}

// Открытие и закрытие поиска на малых разрешениях:

function toggleSearch() {
  if (search.classList.contains('open')) {
    search.classList.remove('open');
  } else {
    search.classList.add('open');
    submenu.classList.remove('open');
  }
}

// Изменение позиционирования меню фильтров:

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

// Установка высоты меню фильтров:

function setFiltersHeight() {
  scrolled = window.pageYOffset || document.documentElement.scrollTop;
  headerHeight = document.querySelector('.header').clientHeight;
  headerMainHeight = Math.max((document.querySelector('.main-header').clientHeight - scrolled), 20);
  footerHeight = Math.max((window.innerHeight + scrolled - document.querySelector('.footer').offsetTop) + 20, 0);
  filtersHeight = window.innerHeight - headerHeight - headerMainHeight - footerHeight;

  filters.style.top = `${headerHeight + headerMainHeight}px`;
  filters.style.height = `${filtersHeight}px`;
}

//=====================================================================================================
// Функции для работы с URL и данными страницы:
//=====================================================================================================

var path,
    oldPath;

// Инициализация первой страницы при открытии сайта:

function initPage() {
  if (website == 'ts_r_zip' && !location.search) {
    window.history.pushState({'path': ['snegohod']},'', '?snegohod');
  }

  path = location.search.split('?').map(element => {
    if (element == '') {
      return pageId;
    } else {
      return element;
    }
  });

  renderContent();
  setGalleryWidth();
  setMinCardWidth();
}

// Изменение URL без перезагрузки страницы:

window.addEventListener('popstate', openPage);

function openPage() {
  event.preventDefault();

  if (event.type == 'popstate') {
    if (event.state) {
      path = event.state.path;
    } else {
      return;
    }
  } else {
    oldPath = path;

    var levelNewUrl = event.currentTarget.dataset.level,
        newUrl = event.currentTarget.dataset.href;
    path = Array.from(document.querySelector('.header-menu').querySelectorAll('.active'))
      .filter(element => element.dataset.level < levelNewUrl)
      .map(element => element.dataset.href);
    path.push(newUrl);

    if (path[path.length - 1] == oldPath[oldPath.length - 1]) {
      return;
    }

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
  renderContent();
}

// Изменение контента страницы:

function renderContent() {
  if (path[path.length - 1] == 'snegohod' || path[path.length - 1] == 'lodkimotor') {
    zipUrl.href = location.href + '?zip';
    accUrl.href = location.href + '?acc';
  }
  if (location.search) {
    changePageTitle(path);
  }
  toggleMenuItems(path);
  createMainNav(path);
  if (path[path.length - 1] == 'cart') {
    renderCart();
  } else {
    renderGallery(path);
  }
  setPaddingToBody();
}

// Изменение заголовка страницы:

function changePageTitle() {
  var curEl = document.querySelector(`[data-href="${path[path.length - 1]}"]`);
  document.title = `ТОП СПОРТС - ${curEl.dataset.title ? curEl.dataset.title : curEl.textContent}`;
}

// Изменение разделов меню:

function toggleMenuItems() {
  document.querySelectorAll('.header-menu .active').forEach(item => item.classList.remove('active'));
  for (key of path) {
    var curMenuItem = document.querySelector(`[data-href="${key}"]`);
    if (curMenuItem) {
      curMenuItem.classList.add('active');
    }
  }
}

// Изменение хлебных крошек:

function createMainNav() {
  var curMenuItem,
      listNavItems = '';

  path.forEach((curUrl, i) => {
    curMenuItem = document.querySelector(`[data-href="${curUrl}"]`);
    if (curMenuItem) {
      var newNavItem = navItemTemplate
      .replace('#isCurPage#', i == path.length - 1 ? 'cur-page' : '')
      .replace('#pageUrl#', curUrl)
      .replace('#pageTitle#', curMenuItem.dataset.title ? curMenuItem.dataset.title : curMenuItem.textContent);
      listNavItems += newNavItem;
    }
  });
  var newMainNav = mainNavTemplate.replace(navItemTemplate, listNavItems);
  mainNav.innerHTML = newMainNav;
  if (mainHeader.style.display != 'flex') {
    mainHeader.style.display = 'flex';
  }
}

// Создание контента галереи:

function renderGallery() {
  window.removeEventListener('scroll', scrollGallery);
  window.removeEventListener('resize', scrollGallery);
  window.addEventListener('scroll', scrollGallery);
  window.addEventListener('resize', scrollGallery);

  if (headerCart) {
    submenu.style.display = '';
    search.style.visibility = 'visible';
    mainInfo.style.display = '';
    cart.style.display = 'none';
    changeHeaderCart();
  }
  if (subsubmenu) {
    if (document.querySelector(`[data-href="${path[path.length - 1]}"]`).dataset.level >= 2) {
      subsubmenu.style.display = 'block';
    } else {
      subsubmenu.style.display = 'none';
    }
  }
  if (headerSelect) {
    if (path[path.length - 1] == 'zip') {
      headerSelect.style.display = 'block';
    } else {
      headerSelect.style.display = 'none';
    }
  }
  curItems = items;
  for (key of path) {
    if (key != pageId) {
      curItems = curItems.filter(item => item[key] == 1);
    }
  }
  prepeareForSearch(curItems);
  if (searchInfo.style.visibility == 'visible') {
    clearSearch();
  }
  pageUrl = location.search ? pageId + location.search : pageId;

  dataForPageFilters = JSON.parse(JSON.stringify(dataForFilters));
  if (typeof catId != 'undefined' && Object.keys(catId).indexOf(path[path.length - 1]) >= 0) {
    var dataCats = createDataCats(catId[path[path.length - 1]]);
    dataForPageFilters.splice(1, 1, dataCats);
  }
  selecledCardList = '';
  initFilters();
  checkFilters();
}

//=====================================================================================================
//  Функции для создания фильтров на странице:
//=====================================================================================================

// Создание фильтра категорий в экипировке:

function createDataCats(id) {
  var cat = {};
  for (key in cats) {
    if (cats[key] == id) {
      cat[key] = '1';
    }
  }
  var newFilter = {
    title: 'Категория',
    isShow: true,
    key: 'cat',
    items: sortObjByKey(cat)
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

  for (item of data) {
    for (k in item.items) {
      isExsist = curItemsArray.find(card => {
        if (card[item.key] == k || card[k] == 1) {
          return true;
        }
      });
      if (!isExsist) {
        delete item.items[k];
      }
      if (typeof item.items[k] == 'object') {
        for (kk in item.items[k]) {
          isExsist = curItemsArray.find(card => {
            if (card[item.key] == k && card.subcat == item.items[k][kk]) {
              return true;
            }
          });
          if (!isExsist) {
            delete item.items[k][kk];
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
  for (k in data.items) {
    var listSubItems = '',
        isHiddenOpenBtn = 'hidden';

    if (typeof data.items[k] === 'object') {
      for (kk in data.items[k]) {
        if (data.items[k][kk] !== '') {
          isHiddenOpenBtn = '';
          var newSubitem = filterSubitemTemplate
          .replace('#key#', k)
          .replace('#value#', data.items[k][kk])
          .replace('#title#', data.items[k][kk])
        listSubItems += newSubitem;
        }
      }
    }

    if ((data.items[k] == 1) || (data.key == 'cat')) {
      curTitle = k;
    } else {
      curTitle = data.items[k];
    }

    var newItem = filterItemTemplate
      .replace(filterSubitemTemplate, listSubItems)
      .replace('#key#', data.key)
      .replace('#value#', k)
      .replace('#title#', curTitle)
      .replace('#isHiddenOpenBtn#', isHiddenOpenBtn);
    listItems += newItem;
  }
  newFilter = newFilter
    .replace(filterItemTemplate, listItems)
    .replace('#key#', data.key)
    .replace('#isShowFilter#', data.isShow && window.innerWidth > 767 ? 'open default-open' : '')
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

function selectFilterValue(event) {
  event.stopPropagation();
  if (event.target.classList.contains('open-btn') || event.currentTarget.classList.contains('disabled')) {
    return;
  }

  getDocumentScroll();
  var curItem = event.currentTarget;

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
  filtersInfo = getInfo('filters')[pageUrl];
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
      setDocumentScroll();
    }
  } else {
    setDocumentScroll();
  }
}

// Добавление данных в хранилище о выбранных фильтрах:

function saveFiltersInfo(curItem) {
  var type = curItem.dataset.type,
      key = curItem.dataset.key,
      value = curItem.dataset.value;
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
      value = curItem.dataset.value;
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
  filtersInfo = getInfo('filters')[pageUrl];
  if (!filtersInfo) {
    return;
  }

  // for (k in filtersInfo) {
  //   for (kk in filtersInfo[k]) {
  //     var el = document.querySelector(`[data-key="${k}"][data-value="${kk}"]`);
  //     if (!el) {
  //       delete filtersInfo[k][kk];
  //     }
  //     for (kkk in filtersInfo[k][kk]) {
  //       var el = document.querySelector(`[data-key="${kk}"][data-value="${kkk}"]`);
  //       if (!el) {
  //         delete filtersInfo[k][kk][kkk];
  //       }
  //       if (Object.keys(filtersInfo[k][kk]).length == 0) {
  //         delete filtersInfo[k][kk];
  //       }
  //     }
  //     if (Object.keys(filtersInfo[k]).length == 0) {
  //       delete filtersInfo[k];
  //     }
  //   }
  // }

  selecledCardList = curItems.filter(card => {
    for (k in filtersInfo) {
      var isFound = false;
      for (kk in filtersInfo[k]) {
        if (filtersInfo[k][kk] && Object.keys(filtersInfo[k][kk]).length != 0) {
          for (kkk in filtersInfo[k][kk]) {
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
  var value,
      items;

  curItemsArray = curItems;
  isExsist =  false;

  if (selecledCardList != '') {
    curItemsArray = selecledCardList;
  }

  var filters = menuFilters.querySelectorAll(`.filter-item.item.checked[data-key="${filter.dataset.key}"]`),
      checked = menuFilters.querySelectorAll(`.filter-item.item.checked`);

  if (filters.length != 0) {
    items = menuFilters.querySelectorAll(`.filter-item.item:not([data-key="${filter.dataset.key}"])`);
  } else {
    items = menuFilters.querySelectorAll(`.filter-item.item`);
  }

  for (item of items) {
    key = item.dataset.key;
    value = item.dataset.value;

    if (checked.length == 1 && key == checked[0].dataset.key) {
      item.classList.remove('disabled');
    } else {
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
}

// Очистка всех фильтров:

function clearFilters() {
  getDocumentScroll();
  filtersInfo = getInfo('filters');
  filtersInfo[pageUrl] = {};
  saveInfo(`filters`, filtersInfo);

  menuFilters.querySelectorAll('.checked').forEach(el => el.classList.remove('checked'));
  menuFilters.querySelectorAll('.disabled').forEach(el => el.classList.remove('disabled'));
  menuFilters.querySelectorAll('.open:not(.default-open)').forEach(el => el.classList.remove('open'));

  if (searchInfo.style.visibility == 'visible') {
    return;
  }
  selecledCardList = '';
  showCards();
  setDocumentScroll();
}

// Проверка сохраненных значений фильтров:

function checkFilters() {
  filtersInfo = getInfo('filters')[pageUrl];
  if (!filtersInfo || Object.keys(filtersInfo).length == 0){
    showCards();
  } else {
    selectCards();
    selectFilters(filtersInfo);
  }
}

// Визуальное отображение выбранных фильтров:

function selectFilters(filtersInfo) {
  for (k in filtersInfo) {
    var filter = document.querySelector(`#filter-${k}`);
    if (filter) {
      filter.classList.add('open');
    }
    for (kk in filtersInfo[k]) {
      changeFilterClass(k, kk);
      for (kkk in filtersInfo[k][kk]) {
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

var countItems = 0,
    countItemsTo = 0,
    itemsToLoad,
    incr;

function loadCards(cards) {
	if (cards){
    countItems = 0;
    itemsToLoad = cards;
	}
	else {
    countItems = countItemsTo;
  }

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

  if (view == 'list') {
    var curCarousels = gallery.querySelectorAll('.carousel');
    for (var i = countItems; i < countItemsTo; i++) {
      startCarouselInit(curCarousels[i]);
    }
  }
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
        propsOptions = extractProps(optionsTemplate),
        option;
    if (card.options && card.options != 0) {
      for (option in card.options) {
        if ((option == 7 || option == 31 || option == 32 || option == 33) && manufData && Object.keys(manufData.man).length > 1) {
          continue;
        } else {
          var newOption = optionsTemplate
            .replace('#optitle#', optnames[option])
            .replace('#option#', card.options[option]);
          listOptions += newOption;
        }
      }
    }
    removeReplays(props, propsOptions);
    newCard = newCard.replace(optionsTemplate, listOptions);

    if (manufData && Object.keys(manufData.man).length > 1) {
      var listManufInfo = '',
          manufRowTemplate = cardTemplate.querySelector('.manuf-row').outerHTML,
          manufcellTemplate = cardTemplate.querySelector('.manuf-row').innerHTML,
          propsManufInfo = extractProps(manufRowTemplate),
          manufListTitle = Array.from(manufTitle.querySelectorAll('div')).map(element => element.dataset.title);

      for (item in manufData.man) {
        var newRow = manufRowTemplate;
        var listCells = '';

        for (k of manufListTitle) {
          var newCell = manufcellTemplate;
          var cell = [];
          for (kk in manufData[k]) {
            if (kk == item) {
              cell.push(kk);
            } else {
              for (kkk in manufData[k][kk]) {
                if (kkk == item) {
                  cell.push(kk);
                }
              }
            }
          }
          if (cell.length == 0) {
            cell.push('&ndash;');
            cell = cell.join(', ');
          } else {
            cell = cell.join(', ');
            if (k == 'years') {
              cell = convertYears(cell);
            }
          }

          newCell = newCell
            .replace('#cat#', k)
            .replace('#info#', cell);
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
      for (key in card.sizes) {
        createSizeInfo(card.sizes[key]);
      }
    } else {
      createSizeInfo(card);
    }
    removeReplays(props, propsSizes);
    newCard = newCard.replace(sizesTemplate, listSizes);

    function createSizeInfo(info) {
      if (headerCart) {
        cartInfo = getInfo('cart');
      }
      var size = info.size ? info.size : 'В корзину',
          savedValue = headerCart && cartInfo[info.articul] ? cartInfo[info.articul].qty : 0,
          freeQty = info.free_qty,
          value = (savedValue > freeQty) ? freeQty : savedValue,
          inCart = value == 0 ? '' : 'in-cart',
          qtyClass = info.free_qty > 0 ? '' : 'not-available',
          gtyTitle = info.free_qty > 0 ? 'В наличии' : 'Ожидается';

      var newSize = sizesTemplate
        .replace('#inCart#', inCart)
        .replace('#articul#', info.articul)
        .replace('#size#', size)
        .replace('#value#', value)
        .replace('#isAvailable#', qtyClass)
        .replace('#qtyTitle#', gtyTitle)
        .replace('#free_qty#', info.free_qty)
      listSizes += newSize;
      totalValue += value;
    }

    var listCarousel = '',
        carouselTemplate = cardTemplate.querySelector('.carousel').innerHTML,
        carouselItemTemplate = cardTemplate.querySelector('.carousel-gallery').innerHTML,
        propsCarousel = extractProps(carouselTemplate);

    for (i = 0; i < card.images.length; i++) {
      var newCarouselItem = carouselItemTemplate
        .replace('#imgNumb#', i)
        .replace('#image#', `http://b2b.topsports.ru/c/productpage/${card.images[i]}.jpg`)
        .replace('#full-image#', `http://b2b.topsports.ru/c/source/${card.images[i]}.jpg`);
      listCarousel += newCarouselItem;
    }
    newCard = newCard.replace(carouselItemTemplate, listCarousel);
    removeReplays(props, propsCarousel);
  }

  for (key of props) {
    var propRegExp = new RegExp('#' + key + '#', 'gi');
    var propCard;
    if (key == 'images') {
      propCard = `http://b2b.topsports.ru/c/productpage/${card.images[0]}.jpg`;
    } else if (key == 'price_preorder' && card.price_preorder1 == 0) {
      newCard = newCard.replace('#price_preorder#⁠.-', '');
    } else if (key == 'isHiddenPromo') {
      propCard = card.actiontitle == undefined ? 'displayNone' : '';
    } else if (key == 'curPrice') {
      var curPrice = card.price_preorder1 < 1 ? card.price1 : card.price_preorder1;
      propCard = curPrice;
    } else if (key == 'isAvailable') {
      propCard = card.free_qty > 0 ? '' : 'not-available';
    } else if (key == "qtyTitle") {
      propCard = card.free_qty > 0 ? 'В наличии' : 'Ожидается';
    } else if (key == 'isHiddenInfo') {
      propCard = totalValue == 0 ? 'hidden' : '';
    } else if (key == 'totalAmount') {
      propCard = totalValue;
    } else if (key == 'totalPrice') {
      propCard = convertPrice(totalValue * (card.price_preorder1 == 0 ? card.price1 : card.price_preorder1));
    } else if (key == 'notice') {
      propCard = card.free_qty > 0 ? 'Товар резервируется в момент подтверждения заказа!' : 'Товара нет в наличии!';
    } else if (key == 'isHiddenManuf') {
      propCard = manufData && Object.keys(manufData.man).length > 1 ? '' : 'displayNone';
    } else if (key == 'isHiddenDesc') {
      propCard = card.desc == '' ? 'displayNone' : '';
    } else if (card[key] == undefined) {
      propCard = '';
    } else {
      propCard = card[key];
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

function scrollGallery() {
  console.log('scroll');
  var scrolled = window.pageYOffset || document.documentElement.scrollTop;
  if (scrolled * 2 + window.innerHeight >= document.body.clientHeight) {
    loadCards();
  }
}

// Переключение вида отображения карточек на странице:

function toggleView(newView) {
  if (view != newView) {
    document.querySelector(`.view-${view}`).classList.remove('active');
    event.currentTarget.classList.add('active');
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

var curCard,
    curCarousel,
    curImg;

function showFullCard(objectId) {
  getDocumentScroll();
  cardTemplate = fullCardTemplate;
  curCard = createCard(items.find(item => item.object_id == objectId));
  fullCardContainer.innerHTML = curCard;
  fullCardContainer.style.display = 'flex';
  curCarousel = fullCardContainer.querySelector('.carousel');
  startCarouselInit(curCarousel);

  curCarousel.querySelector('.carousel-gallery-wrap').addEventListener('click', () => showFullImg(objectId));
  curCarousel.querySelector('.search-btn').addEventListener('click', () => showFullImg(objectId));

  document.body.classList.add('no-scroll');
  setCardTemplate();
}

// Скрытие полной карточки товара:

function closeFullCard(event) {
  if (!(event.target.closest('.carousel') || event.target.closest('.card-size') || event.target.classList.contains('dealer-button'))) {
    fullCardContainer.style.display = 'none';
    document.body.classList.remove('no-scroll');
    setDocumentScroll();
  }
}

// Отображение картинки полного размера на экране:

function showFullImg(objectId) {
  if (event.target.classList.contains('btn')) {
    return;
  }
  getDocumentScroll();
  loader.style.backgroundColor = 'rgba(43, 46, 56, 0.9)';
  loader.style.display = 'block';
  var listCarousel = '',
      imgs = curItems.find(item => item.object_id == objectId).images,
      newFullImg = fullImgTemplate,
      carouselItemTemplate = fullImg.querySelector('.carousel-gallery').innerHTML;

  for (i = 0; i < imgs.length; i++) {
    var newCarouselItem = carouselItemTemplate
      .replace('#imgNumb#', i)
    if (window.innerWidth > 400) {
      newCarouselItem = newCarouselItem.replace('#image#', `http://b2b.topsports.ru/c/source/${imgs[i]}.jpg`);
    } else {
      newCarouselItem = newCarouselItem.replace('#image#', `http://b2b.topsports.ru/c/productpage/${imgs[i]}.jpg`);
    }
    listCarousel += newCarouselItem;
  }
  newFullImg = newFullImg.replace(carouselItemTemplate, listCarousel);
  fullImgContainer.innerHTML = newFullImg;

  curCarousel = fullImgContainer.querySelector('.carousel');
  curImg = event.currentTarget.closest('.carousel').dataset.img;
  if (curImg != 0) {
    curCarousel.dataset.img = curImg;
  }
  setTimeout(() => startCarouselInit(curCarousel), 200);
  fullImgContainer.querySelectorAll('img')[curImg].addEventListener('load', () => {
    loader.style.display = 'none';
    fullImgContainer.style.visibility = 'visible';
    fullImgContainer.style.opacity = '1';
  });
  document.body.classList.add('no-scroll');
}

// Скрытие картинки полного размера:

function closeFullImg() {
  if (event.target.classList.contains('btn')) {
    return;
  }
  fullImgContainer.style.visibility = 'hidden';
  fullImgContainer.style.opacity = '0';
  curCarousel.style.visibility = 'hidden';
  document.body.classList.remove('no-scroll');
  setDocumentScroll();
}

//=====================================================================================================
//  Сортировка карточек товаров:
//=====================================================================================================

// Сортировка карточек товаров на странице:

function sortItems() {
  var selectedOption = gallerySort.options[gallerySort.selectedIndex].value;
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
  itemsForSearch = JSON.parse(JSON.stringify(data)).map(el => {
      delete el.desc;
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
    for (k in obj) {
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
  textToFind = searchInput.value
    .trim()
    .replace(/\, /gi, ',')
    .replace(/\/ /gi, '/')
  if (textToFind == '') {
    return;
  }
  regExpSearch = new RegExp(textToFind, 'i');
  selecledCardList = [];
  itemsForSearch.filter(el => el.value.search(regExpSearch) >= 0).forEach(el => selecledCardList.push(curItems.find(item => item.object_id == el.object_id)));
  showCards();
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
  search.classList.remove('open');
  clearSearchBtn.style.display = 'none';
  searchInfo.style.visibility = 'hidden';
  searchInput.value = '';
}
