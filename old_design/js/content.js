'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var pageSearch = document.getElementById('page-search'),
    mainMenuBtns = document.querySelector('.main-menu-btns'),
    submenu = document.querySelector('.submenu'),
    subsubmenu = document.querySelector('.subsubmenu'),
    zipSelect = document.querySelector('.zip-select'),
    mainHeader = document.querySelector('.main-header'),
    mainNav = document.getElementById('main-nav'),
    mainInfo = document.getElementById('main-info'),
    gallerySort = document.getElementById('gallery-sort'),
    content = document.getElementById('content'),
    filtersContainer = document.getElementById('filters-container'),
    filters = document.getElementById('filters'),
    menuFilters = document.getElementById('menu-filters'),
    gallery = document.getElementById('gallery'),
    manufTitle = document.getElementById('manuf-headers'),
    galleryNotice = document.getElementById('gallery-notice'),
    fullCardContainer = document.getElementById('full-card-container'),
    fullImgContainer = document.getElementById('full-img-container'),
    fullImg = document.getElementById('full-img'),
    imgLoader = document.getElementById('img-loader');

if (pageSearch) {
  var pageSearchInput = document.getElementById('page-search-input'),
      pageSearchInfo = document.getElementById('search-info'),
      searchCount = document.getElementById('search-count'),
      clearPageSearchBtn = pageSearch.querySelector('.clear-search-btn');
}
if (submenu) {
  var submenuItems = submenu.querySelector('.submenu-items');
}
if (zipSelect) {
  var zipFilters = document.getElementById('zip-filters'),
      selectMan = document.getElementById('select-man'),
      selectYears = document.getElementById('select-years'),
      selectModel = document.getElementById('select-model'),
      clearZipFilterBtn = zipFilters.querySelector('.close-btn'),
      oemSearch = document.getElementById('oem-search'),
      oemSearchInput = document.getElementById('oem-search-input'),
      oemDropdown =  document.getElementById('oem-dropdown'),
      oemList = document.getElementById('oem-list'),
      oemNotFound = document.getElementById('oem-not-found'),
      clearOemSearchBtn = oemSearch.querySelector('.clear-search-btn');
}

// Получение шаблонов из HTML:

var minCardTemplate = document.getElementById('min-card-#object_id#'),
    bigCardTemplate = document.getElementById('big-card-#object_id#'),
    fullCardTemplate = document.getElementById('full-card-#object_id#'),
    productCardTemplate = document.getElementById('product-card-#object_id#');

if (zipSelect) {
  var selectmanTemplate = selectMan.innerHTML,
      selectyearsTemplate = selectYears.innerHTML,
      selectmodelTemplate = selectModel.innerHTML,
      selectManufItemTemplate = selectMan.querySelector('.select-option').outerHTML,
      oemListTemplate = oemList.innerHTML;
}
if (mainNav) {
  var mainNavTemplate = mainNav.innerHTML,
      navItemTemplate = mainNav.querySelector('.nav-item').outerHTML;
}
if (menuFilters) {
  var filterTemplate = menuFilters.querySelector('.filter').outerHTML,
      filterItemTemplate = menuFilters.querySelector('.filter-item').outerHTML,
      filterSubitemTemplate = menuFilters.querySelector('.filter-item.subitem').outerHTML;
}
if (fullImg) {
  var fullImgTemplate = fullImg.innerHTML,
      carouselItemTemplate = fullImg.querySelector('.carousel-gallery').innerHTML;
}

// Получение свойств "#...#" из шаблонов HTML:

function extractProps(template) {
  return template.match(/#[^#]+#/gi).map(prop => prop = prop.replace(/#/g, ''));
}

// Динамически изменяемые переменные:

var items,
    view = document.body.dataset.view,
    cardTemplate,
    curItems,
    selectedItems = '',
    itemsForSearch,
    zipFilterData = {},
    pageUrl = pageId,
    pageFilter = null;

//=====================================================================================================
// Первоначальное заполнение контента на странице:
//=====================================================================================================

if (view != 'product') {
  convertItems();
}

if (cart) {
  window.addEventListener('focus', updateContent);
  if (view === 'product') {
    getProductInfo(location.search.replace('?',''))
    .then(
      result => {
        items = [result];
        convertItems();
        getCartInfo()
        .then(
          result => {
            showPage();
          },
          error => {
            showPage();
          }
        );
      },
      error => {
        gallery.style.display = 'none';
        galleryNotice.style.display = 'flex';
        pageLoader.style.display = 'none';
      }
    )
  } else {
    getCartInfo()
    .then(
      result => {
        showPage();
      },
      error => {
        showPage();
      }
    );
  }
} else {
  document.addEventListener('DOMContentLoaded', () => {
    showPage();
  });
}

//=====================================================================================================
// // Преобразование исходных данных:
//=====================================================================================================

// Преобразование:
// - данных о картинках в карточке товара из строки в массив;
// - данных о годах в укороченный формат
// - добавление пробелов
// Сортировка товаров по категориям (чтобы не отражались на сайте вразноброс):

function convertItems() {
  var manuf;
  items.forEach(item => {
    item.images = item.images.toString().split(';');
    item.price_cur = item.price_preorder1 == 0 ? item.price : item.price_preorder;
    item.price_cur1 = item.price_preorder1 == 0 ? item.price1 : item.price_preorder1;
    if (item.manuf) {
      try {
        manuf = JSON.parse(item.manuf);
      } catch(error) {
        item.manuf = 0;
        // console.log(error);
      }
      item.manuf = manuf;
    }
  });
  items.sort(dynamicSort(('catid')));
}

//=====================================================================================================
// Получение данных с сервера:
//=====================================================================================================

// Получение данных о товаре:

function getProductInfo(id) {
  return new Promise((resolve, reject) => {
    sendRequest(`http://80.234.34.212:2000/-aleksa-/TopSports/test/product${id}.txt`)
    .then(
      result => {
        var product = JSON.parse(result);
        // console.log(product);
        resolve(product);
      }
    )
    .catch(error => {
      // console.log(error);
      reject();
    })
  });
}

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Кастомные настройки каруселей:

// var bigCardCarousel = {
//   durationBtns: 600,
// };

var fullCardCarousel = {
  isNav: true,
  durationNav: 400,
  isLoupe: true
};

var fullImgCarousel = {
  durationNav: 400,
};

// Установка ширины галереи:

function setGalleryWidth() {
  gallery.style.width = (content.clientWidth - filters.clientWidth - 30) + 'px';
}

// Установка ширины малых карточек товаров:

function setMinCardWidth() {
  if (content.classList.contains('list')) {
    return;
  }
  var standartWidth = (13 * parseInt(getComputedStyle(gallery).fontSize, 10));
  var countCards = Math.floor(gallery.clientWidth / standartWidth);
  var restGallery = gallery.clientWidth - countCards * standartWidth;
  var changeMinCard = restGallery / countCards;
  var minCardWidth = 0;
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
    if (document.body.classList.contains('pred') && !submenuItems.classList.contains('open')) {
      submenuItems.classList.add('open');
      pageSearch.classList.remove('open');
    } else {
      submenu.classList.remove('open');
    }
  } else {
    submenu.classList.add('open');
    pageSearch.classList.remove('open');
    if (document.body.classList.contains('pred')) {
      submenuItems.classList.add('open');
    }
  }
}

// Открытие и закрытие поиска на малых разрешениях:

function toggleSearch() {
  if (pageSearch.classList.contains('open')) {
    pageSearch.classList.remove('open');
    if (document.body.classList.contains('pred')) {
      submenu.classList.remove('open');
    }
  } else {
    pageSearch.classList.add('open');
    if (document.body.classList.contains('pred')) {
      submenu.classList.add('open');
      submenuItems.classList.remove('open');
    } else {
      submenu.classList.remove('open');
    }
  }
}

// Изменение позиционирования меню фильтров:

function setFiltersPosition() {
  if (window.innerWidth > 767) {
    var filtersPosition = filters.style.position;
    if (filtersPosition == 'fixed') {
      if (menuFilters.clientHeight >= gallery.clientHeight) {
        filters.style.position = 'static';
        filters.style.top = '0px';
        filters.style.height = 'auto';
      } else {
        setFiltersHeight();
      }
    } else {
      if (menuFilters.clientHeight < gallery.clientHeight) {
        filters.style.position = 'fixed';
        setFiltersHeight();
      }
    }
  }
}

// Установка высоты меню фильтров:

function setFiltersHeight() {
  var scrolled = window.pageYOffset || document.documentElement.scrollTop;
  var headerHeight = document.querySelector('.header').clientHeight;
  var headerMainHeight = Math.max((document.querySelector('.main-header').clientHeight - scrolled), 20);
  var footerHeight = Math.max((window.innerHeight + scrolled - document.querySelector('.footer').offsetTop) + 20, 0);
  var filtersHeight = window.innerHeight - headerHeight - headerMainHeight - footerHeight;

  filters.style.top = `${headerHeight + headerMainHeight}px`;
  filters.style.height = `${filtersHeight}px`;
}

//=====================================================================================================
// Функции для работы с URL и данными страницы:
//=====================================================================================================

var path;

// Рендеринг страницы при загрузке:

function showPage() {
  pageLoader.style.display = 'none';
  setCardTemplate();
  initPage();
}

// Инициализация первой страницы при открытии сайта:

function initPage() {
  if (website == 'ts_r_zip' && !location.search) {
    window.history.pushState({'path': ['snegohod']},'', '?snegohod');
  }

  if (view === 'product') {
    path = [];
    if (items[0].snegohod || items[0].lodkimotor) {
      if (website == 'ts_com') {
        path.push('o_zip');
      }
      if (items[0].snegohod) {
        path.push('snegohod');
      }
      if (items[0].lodkimotor) {
        path.push('lodkimotor');
      }
      if (items[0].acc) {
        path.push('acc');
      }
      if (items[0].zip) {
        path.push('zip');
      }
    } else {
      if (website == 'ts_com') {
        path.push('o_ek');
      }
      for (key of catId) {
        if (items[0].catid == catId[key]) {
          path.push(key);
        }
      }
    }
  } else {
    path = location.search.split('?').map(el => {
      if (el == '') {
        return pageId;
      } else {
        return el;
      }
    });
  }

  renderContent();
}

// Изменение URL без перезагрузки страницы:

window.addEventListener('popstate', (event) => openPage(event));

function openPage(event) {
  event.preventDefault();
  if (event.type == 'popstate') {
    if (event.state) {
      path = event.state.path;
    } else {
      return;
    }
  } else {
    var oldPath = path;
    var newUrl = event.currentTarget.dataset.href.split('?');
    path = Array.from(document.querySelector('.header-menu').querySelectorAll('.active'))
      .filter(element => element.dataset.level < event.currentTarget.dataset.level)
      .map(element => element.dataset.href);
    path = path.concat(newUrl);

    if (path.length === oldPath.length && JSON.stringify(oldPath) === JSON.stringify(path)) {
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
  pageFilter = null;
  if (path[path.length - 1].indexOf('=') >= 0) {
    pageFilter = path[path.length - 1];
    path.pop();
  }
  changePageTitle();
  toggleMenuItems();
  createDinamicLinks();
  createMainNav();
  if (cart) {
    cartId = document.querySelector('.topmenu-item.active').dataset.id;
    checkCartRelevance();
    changeHeaderCart();
  }
  curItems = items;
  if (path[path.length - 1] == 'cart') {
    renderCart();
  } else if (view === 'product') {
    renderProductPage();
  } else {
    renderGallery();
  }
  setDocumentScroll(0);
  setPaddingToBody();
}

// Скрытие неактуальных частей страницы:

function hideContent(name) {
  window.removeEventListener('scroll', scrollGallery);
  window.removeEventListener('resize', scrollGallery);
  window.removeEventListener('resize', setGalleryWidth);
  window.removeEventListener('resize', setMinCardWidth);
  window.removeEventListener('scroll', setFiltersPosition);
  window.removeEventListener('resize', setFiltersPosition);

  if (name === 'gallery') {
    window.addEventListener('scroll', scrollGallery);
    window.addEventListener('resize', scrollGallery);
    window.addEventListener('resize', setGalleryWidth);
    window.addEventListener('resize', setMinCardWidth);
    window.addEventListener('scroll', setFiltersPosition);
    window.addEventListener('resize', setFiltersPosition);
    if (cart) {
      pageSearch.style.visibility = 'visible';
      submenu.style.display = '';
      mainInfo.style.display = '';
      cartContent.style.display = 'none';
      if (mainMenuBtns) {
        mainMenuBtns.style.visibility = 'visible';
      }
    }
    if (subsubmenu) {
      if (document.querySelector(`[data-href="${path[path.length - 1]}"]`).dataset.level >= 2) {
        subsubmenu.style.display = 'block';
      } else {
        subsubmenu.style.display = 'none';
      }
    }
    if (zipSelect) {
      if (path[path.length - 1] == 'zip') {
        zipSelect.style.display = 'block';
      } else {
        zipSelect.style.display = 'none';
      }
    }
  }

  if (name === 'cart') {
    pageSearch.style.visibility = 'hidden';
    submenu.style.display = 'none';
    mainInfo.style.display = 'none';
    if (mainMenuBtns) {
      mainMenuBtns.style.visibility = 'hidden';
    }
    filtersContainer.style.display = 'none';
    gallery.style.display = 'none';
    galleryNotice.style.display = 'none';
  }
}

// Обновление данных страницы при возвращении на неё:

function updateContent() {
  cartId = document.querySelector('.topmenu-item.active').dataset.id;
  getCartInfo()
  .then(
    result => {
      // console.log('обновляю корзину');
      changeHeaderCart();
      if (path[path.length - 1] == 'cart') {
        renderCart();
      } else {
        var cards;
        if (view === 'list') {
          cards = document.querySelectorAll('.big-card');
        }
        if (view === 'blocks') {
          cards = document.querySelectorAll('.min-card');
        }
        cards.forEach(card => checkCart(card));
      }
    },
    error => {
      return;
    }
  );
}

// Изменение заголовка страницы:

function changePageTitle() {
  var documentTitle = 'ТОП СПОРТС - ';
  var curTitle = document.querySelector(`[data-href="${path[path.length - 1]}"]`);
  if (view === 'product') {
    documentTitle += items[0].title;
  } else if (curTitle) {
    documentTitle += curTitle.dataset.title;
  }
  document.title = documentTitle;
}

// Изменение активных разделов меню:

function toggleMenuItems() {
  document.querySelectorAll('.header-menu .active').forEach(item => item.classList.remove('active'));
  for (key of path) {
   var curTitle = document.querySelector(`[data-href="${key}"]`);
    if (curTitle) {
      curTitle.classList.add('active');
    }
  }
}

// Добавление ссылок в разделы меню:

function createDinamicLinks() {
  document.querySelectorAll('.dinamic').forEach(item => {
    var curTitle = document.querySelector(`.header-menu .active[data-level="${item.dataset.level - 1}"]`);
    if (curTitle) {
      item.href = curTitle.href + '?' + item.dataset.href;
    }
  });
}

// Изменение хлебных крошек:

function createMainNav() {
  var list = '',
      curTitle,
      newItem;

  path.forEach((item, i) => {
    curTitle = document.querySelector(`[data-href="${item}"]`);
    if (curTitle) {
      newItem = navItemTemplate
      .replace('#isCur#', view != 'product' && i == path.length - 1 ? 'cur-page' : '')
      .replace('#href#', curTitle.href)
      .replace('#dataHref#', item)
      .replace('#level#', curTitle.dataset.level)
      .replace('#title#', curTitle.dataset.title);
      list += newItem;
    }
  });
  if (view === 'product') {
    newItem = navItemTemplate
      .replace('#isCur#', 'cur-page')
      .replace('#href#', '#')
      .replace('#title#', items[0].title);
      list += newItem;
  }
  mainNav.innerHTML = mainNavTemplate.replace(navItemTemplate, list);
  mainHeader.style.visibility = 'visible';
}

// Создание контента страницы товара:

function renderProductPage() {
  gallery.innerHTML = createCard(items[0]);
  var card = document.querySelector('.product-card');
  if (cart) {
    checkAction(card);
    checkCart(card);
  }
  renderCarousel(card.querySelector('.carousel'))
  .then(
    result => {
      card.style.opacity = '1';
    }
  )
}

// Создание контента галереи:

function renderGallery() {
  var local = location.search;
  if (location.search && location.search.indexOf('=') >= 0) {
    local = location.search.split('?');
    local.pop();
    local = local.join('?');
  }
  pageUrl = local ? pageId + local : pageId;

  hideContent('gallery');
  for (key of path) {
    if (key != pageId) {
      curItems = curItems.filter(item => item[key] == 1);
    }
  }

  prepareForSearch(curItems);
  clearAllSearch();

  if (zipSelect) {
    initZipFilter('man');
    initOemSearch();
  }

  selectedItems = '';
  initFilters(dataFilters);
  if (pageFilter) {
    setFilterOnPage(pageFilter);
  }
  checkFiltersPosition();
  checkFilters();
  setGalleryWidth();
  setMinCardWidth();
}

// Добавление фильтра при загрузке страницы:

function setFilterOnPage(pageFilter) {
  var key, value;
  removeAllFiltersInfo();
  menuFilters.querySelectorAll('.filter-item').forEach(el => {
    key = el.dataset.key;
    value = el.dataset.value;
    var filterData = pageFilter.toLowerCase().split('=');
    if (key.toLowerCase() === filterData[0] && value.toLowerCase() === filterData[1]) {
      saveFiltersInfo(key, value);
    }
  });;
}

// Сброс данных поиска :

function clearSearch() {
  selectedItems = '';
  checkFilters();
}

// Очистка всех видов поиска:

function clearAllSearch(params) {
  clearSearch();
  if (pageSearch) {
    clearPageSearch();
  }
  if (oemSearch) {
    clearZipFilters();
    clearOemSearch();
  }
}

//=====================================================================================================
//  Функции для создания фильтров каталога:
//=====================================================================================================

// Отображение фильтров на странице:

function initFilters(dataFilters) {
  var data = JSON.parse(JSON.stringify(dataFilters));
  isExsist = false;

  for (item of data) {
    for (k in item.items) {
      isExsist = curItems.find(card => {
        if (card[item.key] == k || card[k] == 1) {
          return true;
        }
      });
      if (!isExsist) {
        delete item.items[k];
      }
      if (typeof item.items[k] == 'object') {
        for (kk in item.items[k]) {
          isExsist = curItems.find(card => {
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

  menuFilters.innerHTML = createFilters(data);
  filtersContainer.style.display = 'block';
  // setMaxHeight();
  addTooltips('color');
}

// Установка максимальной высоты фильтров для их анимации:

function setMaxHeight() {
  var totalHeight;
  document.querySelectorAll('.filter-items').forEach(el => {
    totalHeight = 0
    el.querySelectorAll('.filter-item').forEach(item => {
      totalHeight += item.clientHeight;
    });
    if (totalHeight > 0) {
      el.style.maxHeight = totalHeight + 'px';
    }
  })
}

// Создание меню фильтров:

function createFilters(data) {
  var list = data.map(el => {
    if (document.body.classList.contains('ekipirovka') && !location.search) {
      if (el.key == 'cat') {
        return;
      }
      if (el.key == 'brand') {
        el.isOpen = 'true';
      }
    }
    if (Object.keys(el.items).length > 0) {
      return createFilter(el);
    }
  }).join('');
  return list;
}

// Создание одного фильтра:

function createFilter(data) {
  var curTitle,
      isHiddenOpenBtn,
      newItem = filterTemplate,
      newSubItem,
      list = '',
      subList;

  for (k in data.items) {
    subList = '';
    isHiddenOpenBtn = 'hidden';

    if (typeof data.items[k] === 'object') {
      for (kk in data.items[k]) {
        if (data.items[k][kk] !== '') {
          isHiddenOpenBtn = '';
          newSubItem = filterSubitemTemplate
          .replace('#key#', data.key)
          .replace('#subkey#', k)
          .replace('#value#', data.items[k][kk])
          .replace('#title#', data.items[k][kk])
          subList += newSubItem;
        }
      }
    }

    if ((data.items[k] == 1) || (data.key == 'cat')) {
      curTitle = k;
    } else {
      curTitle = data.items[k];
    }

    if (curTitle == 'SpyOptic') {
      curTitle = 'Spy Optic';
    }
    if (curTitle == 'TroyLeeDesigns') {
      curTitle = 'Troy Lee Designs';
    }
    if (curTitle == 'KingDolphin') {
      curTitle = 'King Dolphin';
    }

    newSubItem = filterItemTemplate
      .replace(filterSubitemTemplate, subList)
      .replace('#key#', data.key)
      .replace('#value#', k)
      .replace('#title#', curTitle)
      .replace('#isHiddenOpenBtn#', isHiddenOpenBtn);
    list += newSubItem;
  }

  newItem = newItem
    .replace(filterItemTemplate, list)
    .replace('#key#', data.key)
    .replace('#isOpen#', data.isOpen && window.innerWidth >= 767 ? 'default-open' : 'close')
    .replace('#title#', data.title);
  return newItem;
}

//=====================================================================================================
//  Функции для работы с фильтрами каталога:
//=====================================================================================================

// Свернуть/развернуть фильтр:

function toggleFilter(event) {
  var curFilter;
  if (event.target.classList.contains('filter-title')) {
    curFilter = event.currentTarget;
    if (curFilter.classList.contains('close')) {
      curFilter.classList.remove('close');
      saveFilterPosition(curFilter.id, 'open');
    } else {
      curFilter.classList.add('close');
      saveFilterPosition(curFilter.id, 'close');
    }
    // filters.scrollTop = event.currentTarget.offsetTop;
  }
}

// Свернуть/развернуть подфильтр:

function toggleFilterItem(event) {
  var filterItem = event.currentTarget.closest('.filter-item');
  if (filterItem.classList.contains('disabled')) {
    return;
  }
  filterItem.classList.toggle('close');
}

// Выбор значения фильтра:

function selectFilterValue(event) {
  event.stopPropagation();
  if (event.target.classList.contains('open-btn') || event.currentTarget.classList.contains('disabled')) {
    return;
  }

  getDocumentScroll();
  var curEl = event.currentTarget,
      key = curEl.dataset.key,
      value = curEl.dataset.value,
      subkey = curEl.dataset.subkey;

  if (curEl.classList.contains('checked')) {
    curEl.classList.remove('checked');
    curEl.classList.add('close');
    var subItems = curEl.querySelectorAll('.filter-item.checked');
    if (subItems) {
      subItems.forEach(subItem => subItem.classList.remove('checked'));
    }
    removeFiltersInfo(key, value, subkey);
  } else {
    curEl.classList.add('checked');
    curEl.classList.remove('close');
    var filterItem = curEl.closest('.filter-item.item');
    if (filterItem) {
      filterItem.classList.add('checked');
    }
    saveFiltersInfo(key, value, subkey);
  }
  var filtersInfo = getInfo('filters')[pageUrl];
  if (filtersInfo && Object.keys(filtersInfo).length == 0) {
    selectedItems = '';
  } else {
    selectCards(filtersInfo);
  }
  showCards();
  clearAllSearch();
  toggleToActualFilters(event.currentTarget);

  if (window.innerWidth >= 767) {
    if (filters.style.position === 'static') {
      setDocumentScroll();
    }
  } else {
    setDocumentScroll();
  }
}

// Добавление данных в хранилище о выбранных фильтрах:

function saveFiltersInfo(key, value, subkey) {
  var filtersInfo = getInfo('filters');
  if (!filtersInfo[pageUrl]) {
    filtersInfo[pageUrl] = {};
  }
  if (!filtersInfo[pageUrl][key]) {
    filtersInfo[pageUrl][key] = {};
  }
  if (subkey) {
    if (!filtersInfo[pageUrl][key][subkey]) {
      filtersInfo[pageUrl][key][subkey] = {};
    }
    if (!filtersInfo[pageUrl][key][subkey][value]) {
      filtersInfo[pageUrl][key][subkey][value] = {};
    }
  } else {
    if (!filtersInfo[pageUrl][key][value]) {
      filtersInfo[pageUrl][key][value] = {};
    }
  }
  saveInfo('filters', filtersInfo);
}

// Удаление данных из хранилища о выбранных фильтрах:

function removeFiltersInfo(key, value, subkey) {
  var filtersInfo = getInfo('filters');
  if (!subkey) {
    delete filtersInfo[pageUrl][key][value];
    if (Object.keys(filtersInfo[pageUrl][key]).length == 0) {
      delete filtersInfo[pageUrl][key];
    }
  } else {
    delete filtersInfo[pageUrl][key][subkey][value];
    if (filtersInfo[pageUrl][key][subkey] && Object.keys(filtersInfo[pageUrl][key][subkey]).length == 0) {
      filtersInfo[pageUrl][key][subkey] = {};
    }
  }
  saveInfo('filters', filtersInfo);
}

// Удаление данных из хранилища обо всех фильтрах:

function removeAllFiltersInfo() {
  var filtersInfo = getInfo('filters');
  filtersInfo[pageUrl] = {};
  saveInfo(`filters`, filtersInfo);
}

// Сохранение данных в хранилище о состоянии фильтров (открыт/закрыт):

function saveFilterPosition(key, value) {
  var info = getInfo('positions');
  if (!info[pageUrl]) {
    info[pageUrl] = {};
  }
  if (value) {
    info[pageUrl][key] = value;
  }
  saveInfo('positions', info);
}

// Отбор карточек фильтром каталога:

function selectCards(filtersInfo) {
  if (!filtersInfo) {
    return;
  }

  selectedItems = curItems.filter(card => {
    for (k in filtersInfo) {
      isFound = false;
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
}

// Блокировка лишних фильтров:

function toggleToActualFilters(filter) {
  var curItemsArray = curItems;
  isExsist =  false;

  if (selectedItems !== '') {
    curItemsArray = selectedItems;
  }
  var curFilters = menuFilters.querySelectorAll(`.filter-item.item.checked[data-key="${filter.dataset.key}"]`);
  var checked = menuFilters.querySelectorAll(`.filter-item.item.checked`);
  var filterItems;

  if (checked.length == 0) {
    menuFilters.querySelectorAll(`.filter-item.item`).forEach(item => {
      item.classList.remove('disabled');
    });
    return;
  }

  if (curFilters.length != 0) {
    filterItems = menuFilters.querySelectorAll(`.filter-item.item:not([data-key="${filter.dataset.key}"])`);
  } else {
    filterItems = menuFilters.querySelectorAll(`.filter-item.item`);
  }

  var key, value;
  for (item of filterItems) {
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
        item.classList.add('close');
        if (item.classList.contains('checked')) {
          item.classList.remove('checked');
          item.querySelectorAll('.subitem').forEach(subitem => {
            subitem.classList.remove('checked');
          });
          removeFiltersInfo(item.dataset.key, item.dataset.value);
        }
      }
      item.querySelectorAll('.subitem').forEach(subitem => {
        isFound = false;
        isFound = curItemsArray.find(card => {
          if (card.cat == value && card.subcat == subitem.dataset.value) {
            return true;
          }
        });
        if (!isFound) {
          subitem.classList.add('disabled');
        } else {
          subitem.classList.remove('disabled');
        }
      });
    }
  }
}

// Очистка фильтров каталога:

function clearFilters() {
  if (!menuFilters.querySelector('.checked')) {
    return;
  }
  getDocumentScroll();
  removeAllFiltersInfo();

  menuFilters.querySelectorAll('.filter-item').forEach(el => {
    el.classList.remove('checked', 'disabled');
    if (el.classList.contains('default-open')) {
      el.classList.remove('close');
    } else {
      el.classList.add('close');
    }
  });

  if (isSearch) {
    return;
  }

  selectedItems = '';
  showCards();
  setDocumentScroll();
}

// Проверка сохраненных положений фильтров:

function checkFiltersPosition() {
  var info = getInfo('positions')[pageUrl],
      curEl;
  if (info) {
    for (key in info) {
      curEl = document.getElementById(key);
      if (curEl) {
        if (info[key] == 'close') {
          curEl.classList.add('close');
        } else {
          curEl.classList.remove('close');
        }
      }
    }
  }
}

// Проверка сохраненных значений фильтров:

function checkFilters() {
  var filtersInfo = getInfo('filters')[pageUrl];
  if (filtersInfo && Object.keys(filtersInfo).length > 0){
    checkFilterExist(filtersInfo);
    selectFilters(filtersInfo);
  }
  showCards();
}

// Удаление сохраненных фильтров, если их больше нет на странице:

function checkFilterExist(filtersInfo) {
  var curEl;
  for (k in filtersInfo) {
    for (kk in filtersInfo[k]) {
      curEl = document.querySelector(`[data-key="${k}"][data-value="${kk}"]`);
      if (!curEl) {
        delete filtersInfo[k][kk];
      }
      for (kkk in filtersInfo[k][kk]) {
        curEl = document.querySelector(`[data-subkey="${kk}"][data-value="${kkk}"]`);
        if (!curEl) {
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
}

// Визуальное отображение сохраненных фильтров:

function selectFilters(filtersInfo) {
  var filters = {};
  var filterItem;
  for (i in filtersInfo) {
    filters[i] = {};
    filterItem = document.getElementById(`filter-${i}`);
    if (filterItem) {
      filterItem.classList.remove('close');
    }
    for (ii in filtersInfo[i]) {
      filters[i][ii] = {};
      selectCards(filters);
      changeFilterClass(i, ii);
      for (iii in filtersInfo[i][ii]) {
        filters[i][ii][iii] = {};
        selectCards(filters);
        changeFilterClass(i, iii, ii);
      }
    }
  }
}

// Изменение классов сохраненных фильтров:

function changeFilterClass(key, value, subkey) {
  var curEl;
  if (subkey) {
    curEl = document.querySelector(`[data-subkey="${subkey}"][data-value="${value}"]`);
  } else {
    curEl = document.querySelector(`[data-key="${key}"][data-value="${value}"]`);
  }
  if (curEl) {
    curEl.classList.add('checked');
    var filterItem = curEl.closest('.filter-item');
    if (filterItem) {
      filterItem.classList.remove('close');
    }
    toggleToActualFilters(curEl);
  }
}

//=====================================================================================================
//  Функции для создания фильтров запчастей и поиска по запчастям:
//=====================================================================================================

// Запуск создания фильтров запчастей:

function initZipFilter(filter) {
  createZipFilterData(filter);
  if (zipFilterData[filter].length === 0) {
    if (filter == 'years') {
      initZipFilter('model');
    }
    return;
  }
  createZipFilters(filter);
  unlockZipFilter(filter);
}

// Подготовка данных для фильтров запчастей:

function createZipFilterData(filter) {
  var curItemsArray = curItems;
  if (filter != 'man' && filter != 'oem') {
    curItemsArray = selectedItems;
  }
  zipFilterData[filter] = [];

  curItemsArray.forEach(item => {
    if (item.manuf) {
      for (k in item.manuf[filter]) {
        if (filter == 'man' || filter == 'oem') {
          if (zipFilterData[filter].indexOf(k.trim()) === -1) {
            zipFilterData[filter].push(k);
          }
        } else {
          for (kk in item.manuf[filter][k]) {
            if (kk == selectMan.value && zipFilterData[filter].indexOf(k.trim()) === -1) {
              zipFilterData[filter].push(k);
            }
          }
        }
      }
    }
  });
  zipFilterData[filter].sort();
}

// Создание фильтров запчастей:

function createZipFilters(filter) {
  var curSelect = document.getElementById(`select-${filter}`);
  curSelect.innerHTML = createZipFilter(window[`select${filter}Template`], filter);
}

// Создание одного фильтра запчастей:

function createZipFilter(template, filter) {
  var list = '', newItem;
  for (item of zipFilterData[filter]) {
    newItem = selectManufItemTemplate
      .replace(/#item#/gi, item)
    list += newItem;
  }
  return template.replace(selectManufItemTemplate, list);
}

// Создание подсказок в поиске по OEM:

function initOemSearch() {
  createZipFilterData('oem');
  var list = '', newItem;
  for (item of zipFilterData.oem) {
    newItem = oemListTemplate
      .replace(/#item#/gi, item)
    list += newItem;
  }
  oemList.innerHTML = list;
}

//=====================================================================================================
//  Функции для работы с фильтрами запчастей и поиском по запчастям:
//=====================================================================================================

// Отбор карточек фильтром запчастей:

function selectCardsZipFilter(event) {
  if (isSearch) {
    clearPageSearch();
    clearOemSearch();
  }
  var filter = event.currentTarget.dataset.filter;
  selectedItems = curItems.filter(item => {
    if (item.manuf) {
      isFound = false;
      for (k in item.manuf.man) {
        if (k == selectMan.value) {
          isFound = true;
        }
      }
      if (filter != 'man' && isFound && zipFilterData.years.length != 0) {
        isFound = false;
        for (k in item.manuf.years) {
          if (k == selectYears.value) {
            for (kk in item.manuf.years[k]) {
              if (kk == selectMan.value) {
                isFound = true;
              }
            }
          }
        }
      }
      if (filter == 'model' && isFound && zipFilterData.model.length != 0) {
        isFound = false;
        for (k in item.manuf.model) {
          if (k == selectModel.value) {
            for (kk in item.manuf.model[k]) {
              if (kk == selectMan.value) {
                isFound = true;
              }
            }
          }
        }
      }
      if (isFound) {
        return true;
      }
    }
  });
  showCards();
  isSearch = true;

  if (filter == 'man') {
    clearZipFilterBtn.classList.add('active');
    lockZipFilter('years');
    lockZipFilter('model');
    initZipFilter('years');
  } else if (filter == 'years') {
    lockZipFilter('model');
    initZipFilter('model');
  }
}

// Блокировка фильтров запчастей:

function lockZipFilter(filter) {
  var curSelect = document.getElementById(`select-${filter}`);
  curSelect.value = 'default';
  curSelect.setAttribute('disabled', 'disabled');
}

// Разблокировка фильтров запчастей:

function unlockZipFilter(filter) {
  var curSelect = document.getElementById(`select-${filter}`);
  curSelect.removeAttribute('disabled');
}

// Очистка фильтров запчастей:

function startClearZipFilters(btn) {
  if (btn.classList.contains('active')) {
    clearSearch();
    clearZipFilters();
  }
}

function clearZipFilters() {
  isSearch = false;
  clearZipFilterBtn.classList.remove('active');
  selectMan.value = 'default';
  lockZipFilter('years');
  lockZipFilter('model');
}

// Отображение текущего списка OEM:

function showOemList() {
  var oemToFind = oemSearchInput.value.trim();
  if (oemToFind == '') {
    closeOemHints();
    return;
  }
  oemDropdown.style.display = 'block';

  var regExpSearch = RegExp(oemToFind, 'i'),
      allOem = Array.from(document.querySelectorAll('#oem-list .oem'));

  allOem.forEach(el => el.style.display = 'none');
  var curOemList = allOem.filter(el => el.dataset.oem.search(regExpSearch) >= 0);

  if (curOemList.length > 0) {
    oemList.style.display = 'block';
    oemNotFound.style.display = 'none';
    curOemList.forEach(el => el.style.display = 'block');
  } else {
    oemList.style.display = 'none';
    oemNotFound.style.display = 'block';
  }
}

// Выбор OEM из списка:

function selectOem(event) {
  oemSearchInput.value = event.currentTarget.dataset.oem;
  findOem();
}

// Поиск по OEM:

function findOem() {
  event.preventDefault();
  if (isSearch) {
    clearPageSearch();
    clearZipFilters();
  }
  var oemToFind = oemSearchInput.value.trim();
  if (oemToFind == '') {
    return;
  }
  oemSearchInput.dataset.value = oemSearchInput.value;
  selectCardsOemSearch(oemToFind);
  showCards();
  isSearch = true;
  clearOemSearchBtn.style.display = 'block';
}

// Отбор карточек по OEM:

function selectCardsOemSearch(oem) {
  selectedItems = curItems.filter(item => {
    if (item.manuf) {
      for (k in item.manuf.oem) {
        if (k == oem) {
          return true;
        }
      }
    }
  });
}

// Запуск очиски поиска по OEM:

function startClearOemSearch() {
  clearSearch();
  clearOemSearch();
}

// Очистка поиска по OEM:

function clearOemSearch() {
  isSearch = false;
  oemDropdown.style.display = 'none';
  oemList.style.display = 'none';
  oemNotFound.style.display = 'none';
  clearOemSearchBtn.style.display = 'none';
  oemSearchInput.dataset.value = '';
  oemSearchInput.value = '';
}

// Удаление значения из поиска OEM при его фокусе и скрытие подсказок:

function onFocusOemInput(input) {
  onFocusInput(input);
  closeOemHints();
}

// Скрытие подсказок поиска OEM:

function closeOemHints() {
  oemDropdown.style.display = 'none';
  oemList.style.display = 'none';
  oemNotFound.style.display = 'none';
}

function onBlurOemInput(input) {
  setTimeout(() => {
    onBlurInput(input);
    closeOemHints();
  }, 100);
}

//=====================================================================================================
//  Функции для отображения карточек товаров на странице:
//=====================================================================================================

// Создание карточек товаров из массива:

var countItems = 0,
    countItemsTo = 0,
    itemsToLoad;

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
    if (view === 'list') {
      incr = 30;
    } else {
      incr = 60;
    }
  } else if (window.innerWidth < 1080) {
    if (view === 'list') {
      incr = 10;
    } else {
      incr = 20;
    }
  } else {
    if (view === 'list') {
      incr = 20;
    } else {
      incr = 40;
    }
  }
  countItemsTo = countItems + incr;
  if (countItemsTo > itemsToLoad.length) {
    countItemsTo = itemsToLoad.length;
  }

  var list = '', card;
  for (var i = countItems; i < countItemsTo; i++) {
    card = createCard(itemsToLoad[i]);
    list += card;
  }

  if (countItems === 0) {
    gallery.innerHTML = list;
  } else {
    gallery.insertAdjacentHTML('beforeend', list);
  }
  setFiltersPosition();
  setGalleryWidth();
  setMinCardWidth();

  if (view === 'list') {
    document.querySelectorAll('.big-card').forEach(card => {
      renderCarousel(card.querySelector('.carousel'));
      if (cart) {
        checkAction(card);
        checkCart(card);
      }
    });
  }
  if (view === 'blocks') {
    document.querySelectorAll('.min-card').forEach(card => {
      checkImg(card);
      if (cart) {
        checkAction(card);
      }
    });
  }
}

// Проверка загружено ли изображение и вставка заглушки при отсутствии изображения:

function checkImg(element) {
  element.querySelector('img').addEventListener('error', (event) => {
    event.currentTarget.src = '../../img/content/no_img.jpg';
  });
}

// Создание одной карточки товара :

function createCard(card) {
  var template,
      list,
      newCard = cardTemplate.outerHTML;

  if (cardTemplate != minCardTemplate) {
    template = cardTemplate.querySelector('.card-options').innerHTML;
    list = createOptions(template, card, card.manuf);
    newCard = newCard.replace(template, list);

    if (card.manuf && Object.keys(card.manuf.man).length > 1) {
      template = cardTemplate.querySelector('.manuf-row').outerHTML;
      list = createManufTable(template, card.manuf);
      newCard = newCard.replace(template, list);
    }

    template = cardTemplate.querySelector('.card-sizes').innerHTML;
    list = createSizes(template, card);
    newCard = newCard.replace(template, list);

    template = cardTemplate.querySelector('.carousel-gallery').innerHTML;
    list = createCarousel(template, card);
    newCard = newCard.replace(template, list);
  }

  var props = extractProps(newCard);
  var propRegExp, propCard;
  for (key of props) {
    propRegExp = new RegExp('#' + key + '#', 'gi');
    if (key == 'images') {
      propCard = `http://b2b.topsports.ru/c/productpage/${card.images[0]}.jpg`;
    } else if (key == 'isHiddenPrice' && card.price_preorder1 == 0) {
      propCard = 'displayNone';
    } else if (key == 'isHiddenAction') {
      propCard = card.actiontitle == undefined ? 'hidden' : '';
    } else if (key == 'isAvailable') {
      propCard = card.free_qty > 0 ? '' : 'not-available';
    } else if (key == "qtyTitle") {
      propCard = card.free_qty > 0 ? 'В наличии' : 'Ожидается';
    } else if (key == 'notice') {
      propCard = card.free_qty > 0 ? 'Товар резервируется в момент подтверждения заказа!' : 'Товара нет в наличии!';
    } else if (key == 'isHiddenManuf') {
      propCard = card.manuf && Object.keys(card.manuf.man).length > 1 ? '' : 'displayNone';
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

// Создание описания опций в карточке товара:

function createOptions(template, card, data) {
  var list = '', newItem;
  if (card.options && card.options != 0) {
    var option;
    for (key in card.options) {
      option = card.options[key];
      if (key == 32) {
        option = convertYears(card.options[key]);
      } else {
        option = option
          .replace(/\,/gi, ', ')
          .replace(/\//gi, '/ ')
      }
      if ((key == 7 || key == 31 || key == 32 || key == 33) && data && Object.keys(data.man).length > 1) {
        continue;
      } else {
        newItem = template
          .replace('#optitle#', optnames[key])
          .replace('#option#', option);
        list += newItem;
      }
    }
  }
  return list;
}

// Создание таблицы с данными о производителе:

function createManufTable(template, data) {
  var list = '',
      subList,
      newItem,
      subTemplate = cardTemplate.querySelector('.manuf-row').innerHTML,
      titles = Array.from(manufTitle.querySelectorAll('div')).map(element => element.dataset.title),
      newCell,
      cell;

  for (item in data.man) {
    newItem = template;
    subList = '';

    for (k of titles) {
      newCell = subTemplate;
      cell = [];
      for (kk in data[k]) {
        if (kk == item) {
          cell.push(kk);
        } else {
          for (kkk in data[k][kk]) {
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
      subList += newCell;
    }
    newItem = newItem.replace(subTemplate, subList);
    list += newItem;
  }
  return list;
}

// Создание информации о размерах:

function createSizes(template, card) {
  var list = '', newItem;
  if (card.sizes && card.sizes != 0) {
    for (key in card.sizes) {
      createSize(card.sizes[key]);
    }
  } else {
    createSize(card);
  }
  function createSize(sizeInfo) {
    newItem = template
    .replace(/#id#/gi, sizeInfo.object_id)
    .replace(/#free_qty#/gi, sizeInfo.free_qty)
    .replace('#articul#', sizeInfo.articul)
    .replace('#isClick#', sizeInfo.size ? '' : 'click')
    .replace('#size#', sizeInfo.size ? sizeInfo.size : 'В корзину')
    .replace('#qtyTitle#', sizeInfo.free_qty > 0 ? 'В наличии' : 'Ожидается')
    .replace('#isAvailable#', sizeInfo.free_qty > 0 ? '' : 'not-available')
  list += newItem;
  }
  return list;
}

// Создание карусели:

function createCarousel(template, card) {
  var list = '', newItem;
  for (i = 0; i < card.images.length; i++) {
    var newItem = template
      .replace('#image#', `http://b2b.topsports.ru/c/productpage/${card.images[i]}.jpg`)
      .replace('#full-image#', `http://b2b.topsports.ru/c/source/${card.images[i]}.jpg`);
    list += newItem;
  }
  return list;
}

// Проверка загруженности всех изображений карусели и отображение карусели:

function renderCarousel(carousel, curImg = 0) {
  return new Promise((resolve, reject) => {
    var imgs = carousel.querySelectorAll('img');

    imgs.forEach((img, index) => {
      if (index === imgs.length - 1) {
        img.addEventListener('load', () => {
          setTimeout(() => render(carousel), 100);
        });
        img.addEventListener('error', () => {
          img.parentElement.remove();
          setTimeout(() => render(carousel), 100);
        });
      } else {
        img.addEventListener('error', () => {
          img.parentElement.remove();
        });
      }
    });

    function render(carousel) {
      if (carousel.querySelectorAll('img').length === 0) {
        carousel.querySelector('.carousel-gallery').insertAdjacentHTML('beforeend', '<div class="carousel-item"><img src="../../img/content/no_img.jpg"></div>');
        startCarouselInit(carousel, curImg);
      }
      startCarouselInit(carousel, curImg);
      resolve('карусель готова');
    }
  });
}

// Проверка наличия акции на товар:

function findDiscount(id) {
  if (!discounts) {
    return 0;
  }
  var discount = discounts.find(item => {
    if (item.diart) {
      for (key of item.diart) {
        return key == id ? true : false;
      }
    }
  });
  if (!discount) {
    discount = discounts.find(item => !item.diart && checkCondition(item.dcondition));
  }
  if (!discount) {
    return 0;
  }
  var relevance = true;
  if (discount.ddatestart && discount.ddateend) {
    relevance = checkDate(discount.ddatestart, discount.ddateend)
  }
  if (relevance) {
    return discount;
  }
}

// Проверка условия скидки:

function checkCondition(condition) {
  if (condition.razdel == cartId) {
    return true;
  }
  return false;
}

// Добавление информации об акции в карточку товара:

function checkAction(card) {
  var action = findDiscount(card.dataset.id);
  if (!action || !action.dtitle) {
    return;
  }
  card.dataset.actionId = action.did;
  card.querySelector('.card-action').classList.remove('hidden');

  var title = card.querySelector('.action-title');
  title.textContent = action.dtitle;
  title.style.backgroundColor = action.dcolor;

  var date = card.querySelector('.action-date');
  if (date && action.ddateend) {
    date.querySelector('span').textContent = action.ddateend;
    date.style.display = 'block';
  }

  var desc = card.querySelector('.action-desc');
  if (desc) {
    desc.querySelector('.card-text').textContent = action.ddesc;
    desc.style.display = 'block';
  }
}

//=====================================================================================================
//  Функции для работы с карточками товаров:
//=====================================================================================================

// Отображение карточек на странице:

function showCards() {
  if (selectedItems === '') {
    gallery.style.display = 'flex';
    galleryNotice.style.display = 'none';
    loadCards(curItems);
    // if (curItemsSorted) {
    //   loadCards(curItemsSorted);
    // } else {
    //   loadCards(curItems);
    // }
  } else {
    if (selectedItems.length == 0) {
      galleryNotice.style.display = 'flex';
      gallery.style.display = 'none';
      setFiltersPosition();
    } else {
      gallery.style.display = 'flex';
      galleryNotice.style.display = 'none';
      loadCards(selectedItems);
      // if (selectedItemsSorted) {
      //   loadCards(selectedItemsSorted);
      // } else {
      //   loadCards(selectedItems);
      // }
    }
  }
}

// Добавление новых карточек при скролле страницы:

function scrollGallery() {
  var scrolled = window.pageYOffset || document.documentElement.scrollTop;
  if (scrolled * 2 + window.innerHeight >= document.body.clientHeight) {
    loadCards();
  }
}

// Переключение вида отображения карточек на странице:

function toggleView(event, newView) {
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
  if (view === 'list') {
    cardTemplate = bigCardTemplate;
  }
  if (view === 'blocks') {
    cardTemplate = minCardTemplate;
  }
  if (view === 'product') {
    cardTemplate = productCardTemplate;
  }
}

// Раскрытие в полный размер большой карточки:

function openBigCard(event) {
  var curCard = event.currentTarget.closest('.big-card');
  curCard.classList.toggle('open');
  if (curCard.classList.contains('open')) {
    event.currentTarget.setAttribute('tooltip', 'Свернуть');
  } else {
    event.currentTarget.setAttribute('tooltip', 'Раскрыть');
  }
  setFiltersPosition();
}

function closeBigCard(event) {
  var curCard = event.currentTarget.closest('.big-card');
  if (window.innerWidth < 767) {
    if (!(event.target.classList.contains('toggle-btn') || event.target.closest('.carousel') || event.target.closest('.card-size') || event.target.classList.contains('dealer-button'))) {
      curCard.classList.remove('open');
      curCard.querySelector('.toggle-btn').setAttribute('tooltip', 'Раскрыть');
      setFiltersPosition();
    }
  }
}

// Отображение полной карточки товара:

function showFullCard(id) {
  getDocumentScroll();

  pageLoader.style.display = 'block';
  fullCardContainer.style.display = 'flex';

  cardTemplate = fullCardTemplate;
  fullCardContainer.innerHTML = createCard(items.find(item => item.object_id == id));

  var curCard = document.querySelector('.full-card');
  if (cart) {
    checkAction(curCard);
    checkCart(curCard);
  }
  var curCarousel = fullCardContainer.querySelector('.carousel');
  setCardTemplate();
  renderCarousel(curCarousel)
  .then(
    result => {
      if (curCarousel.querySelector('img').src.indexOf('/no_img.jpg') === -1) {
        curCarousel.querySelector('.carousel-gallery-wrap').addEventListener('click', (event) => showFullImg(event, id));
        curCarousel.querySelector('.search-btn').addEventListener('click', (event) => showFullImg(event, id));
      }
      document.body.classList.add('no-scroll');
      pageLoader.style.display = 'none';
      curCard.style.opacity = '1';
    }
  );
}

// Скрытие полной карточки товара:

function closeFullCard(event) {
  if (!(event.target.closest('.carousel') || event.target.closest('.card-size') || event.target.classList.contains('dealer-button'))) {
    fullCardContainer.style.display = 'none';
    document.querySelector('.full-card').style.opacity = '0';
    document.body.classList.remove('no-scroll');
    setDocumentScroll();
  }
}

// Отображение картинки полного размера на экране:

function showFullImg(event, id) {
  if (event.target.classList.contains('btn')) {
    return;
  }
  if (fullCardContainer && (!fullCardContainer.style.display || fullCardContainer.style.display === 'none')) {
    getDocumentScroll();
  }
  fullImgContainer.style.display = 'block';
  imgLoader.style.visibility = 'visible';
  fullImg.style.opacity = 0;

  var list = '',
      newItem,
      imgs = curItems.find(item => item.object_id == id).images;

  for (i = 0; i < imgs.length; i++) {
    newItem = carouselItemTemplate.replace('#imgNumb#', i);
    if (window.innerWidth > 400) {
      newItem = newItem.replace('#image#', `http://b2b.topsports.ru/c/source/${imgs[i]}.jpg`);
    } else {
      newItem = newItem.replace('#image#', `http://b2b.topsports.ru/c/productpage/${imgs[i]}.jpg`);
    }
    list += newItem;
  }
  fullImg.innerHTML = fullImgTemplate.replace(carouselItemTemplate, list);

  var curCarousel = fullImgContainer.querySelector('.carousel');
  var curImg = event.currentTarget.closest('.carousel').dataset.img;

  renderCarousel(curCarousel, curImg)
  .then(
    result => {
      fullImg.style.opacity = 1;
      imgLoader.style.visibility = 'hidden';
    }
  );
  document.body.classList.add('no-scroll');
}

// Скрытие картинки полного размера:

function closeFullImg(event) {
  if (event.target.classList.contains('btn')) {
    return;
  }
  fullImgContainer.style.display = 'none';
  if (!fullCardContainer.style.display || fullCardContainer.style.display === 'none') {
    document.body.classList.remove('no-scroll');
  }
  setDocumentScroll();
}

//=====================================================================================================
//  Сортировка карточек товаров:
//=====================================================================================================

// Сортировка карточек товаров на странице:

function sortItems() {
  var selectedOption = gallerySort.value;
  curItems.sort(dynamicSort(selectedOption));
  if (selectedItems !== '') {
    selectedItems.sort(dynamicSort(selectedOption));
  }
  showCards();
}

// Сортировка массива объектов по указанному значению:

function dynamicSort(property) {
  var sortOrder = 1;
  var result;
  if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
  }
  if (property == 'price1') {
    return function (a, b) {
      result = a[property] - b[property];
      return result * sortOrder;
    }
  } else {
    return function (a, b) {
      result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }
}

//=====================================================================================================
// Поиск на странице:
//=====================================================================================================

// Подготовка данных для поиска на странице:

function prepareForSearch(data) {
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

function findOnPage(event) {
  event.preventDefault();
  if (isSearch) {
    clearZipFilters();
    clearOemSearch();
  }
  var textToFind = pageSearchInput.value.trim();
  if (textToFind == '') {
    return;
  }
  var regExpSearch = new RegExp(textToFind, 'i');
  selectedItems = [];
  itemsForSearch
    .filter(el => el.value.search(regExpSearch) >= 0)
    .forEach(el => selectedItems.push(curItems.find(item => item.object_id == el.object_id)));
  showCards();
  isSearch = true;
  clearPageSearchBtn.style.display = 'block';
  searchCount.textContent = selectedItems.length;
  pageSearchInfo.style.visibility = 'visible';
}

// Очистка поиска по странице:

function startClearPageSearch() {
  clearSearch();
  clearPageSearch();
}

function clearPageSearch(params) {
  isSearch = false;
  pageSearch.classList.remove('open');
  clearPageSearchBtn.style.display = 'none';
  pageSearchInfo.style.visibility = 'hidden';
  pageSearchInput.value = '';
}
