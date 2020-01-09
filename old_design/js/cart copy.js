'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var headerPrice = headerCart.querySelector('.price span'),
    headerAmount = headerCart.querySelector('.amount span'),
    headerShortAmount = headerCart.querySelector('.short-amount'),
    headerCartName = headerCart.querySelector('.name'),
    cartContent = document.getElementById('cart');

if (cartContent) {
  var cartFull = document.getElementById('cart-full'),
      cartEmpty = document.getElementById('cart-empty'),
      cartLinks = document.getElementById('cart-links'),
      cartLinksList = document.getElementById('cart-links-list'),
/* !!! Фильтр чекбоксом */
      cartFilter = document.getElementById('cart-filter'),
      filterSelect = document.getElementById('filter-select'),
/* !!! Фильтр селектом */
      filterAction = document.getElementById('filter-action'),
      filterActionMenu = filterAction.querySelector('.menu-select'),
      filterAll = document.getElementById('filter-all'),
      cartInform = document.getElementById('cart-info'),
      cartAmount = cartInform.querySelector('.amount'),
      cartRetailPrice = cartInform.querySelector('.retail-price'),
      cartOrderPrice = cartInform.querySelector('.order-price'),
      cartDiscount = cartInform.querySelector('.cart-discount'),
      cartDiscountAmount = cartDiscount.querySelector('.discount-amount'),
      cartDiscountPercent = cartDiscount.querySelector('.discount-percent'),
      cartMakeOrder = cartContent.querySelector('.cart-make-order'),
      orderForm = document.getElementById('order-form'),
      paymentSelect = document.getElementById('payment-select'),
      partnerSelect = document.getElementById('partner-select'),
      deliverySelect = document.getElementById('delivery-select'),
      addressSelect = document.getElementById('address-select'),
      comment = document.getElementById('comment'),
      commentCounter = document.getElementById('comment-counter'),
      orderInfo = document.getElementById('order-info'),
      orderNames = document.getElementById('order-names'),
      copyResultContainer = document.getElementById('copy-result-container'),
      copyMessage = document.getElementById('copy-message'),
      checkAllBtn = document.getElementById('check-all'),
      cartRows = document.getElementById('cart-rows'),
      cartTable = document.getElementById('cart-table'),
      cartCopy = document.getElementById('cart-copy'),
      catalogLink = document.getElementById('catalog-link');

  // Получение шаблонов из HTML:

  var cartLinkTemplate = cartLinksList.innerHTML,
 /* !!! Фильтр чекбоксом */
      filterSelectTemplate = filterSelect.innerHTML,
      cartFilterTemplate =  filterSelect.querySelector('.filter-value').outerHTML,
 /* !!! Фильтр селектом */
      filterActionTemplate = filterActionMenu.innerHTML,
      itemFilterActionTemplate =  filterActionMenu.querySelector('.action').outerHTML,
      cartRowTemplate = cartRows.innerHTML,
      cartTableRowTemplate = cartTable.querySelector('tr').outerHTML;
}

// Динамически изменяемые переменные:

var curProduct,
    curArticul,
    cartTimer = null,
    cartTimeout = 300;

//=====================================================================================================
// Работа с данными о состоянии корзины:
//=====================================================================================================


// Сохранение данных о состоянии корзины:

function saveCartInfo(id, qty) {
  id = 'id_' + id;
  if (!cart[cartName]) {
    cart[cartName] = {};
  }
  if (qty == 0) {
    delete cart[cartName][id];
  } else {
    cart[cartName][id] = qty;
  }

  clearTimeout(cartTimer);
  cartTimer = setTimeout(function () {
    cartSentServer(id, qty, cartName);
  }, cartTimeout);
}

function cartSentServer(id, qty, cartName) {
  console.log(id, qty, cartName);
}

//=====================================================================================================
// Функции для работы с информацией о состоянии корзины в шапке сайта:
//=====================================================================================================

// Отображение информации о состоянии корзины в шапке сайта:

function changeHeaderCart() {
  if (headerCartName) {
    headerCartName.textContent = '(' + document.querySelector('.topmenu-item.active').textContent + ')';
  }
  var totals = countFromCart();
  headerAmount.textContent = totals.amount;
  headerPrice.textContent = totals.price.toLocaleString();
  if (totals.amount == 0) {
    headerShortAmount.style.visibility = 'hidden';
  } else {
    headerShortAmount.style.visibility = 'visible';
    if (totals.amount > 99) {
      headerShortAmount.textContent = '99';
    } else {
      headerShortAmount.textContent = totals.amount;
    }
  }
}

// Подсчет по корзине:

function countFromCart(idList) {
  var totalAmount = 0,
      totalPrice = 0,
      totalRetailPrice = 0,
      totalBonus = 0,
      totalSum = 0,
      totalDiscount = 0,
      discount,
      qty;

  cartInfo = cart[cartName];
  for (key in cartInfo) {
    qty = cartInfo[key];
    key = key.replace('id_', '');
    if (idList && (idList != key && idList.indexOf(key) === -1)) {
      continue;
    }
    findCurData(key);
    var price = curProduct.price_preorder1 == 0 ? curProduct.price1 : curProduct.price_preorder1,
        retailPrice = curProduct.price_user1;
    if (curProduct) {
      totalAmount += qty;
      totalRetailPrice += qty * retailPrice;

      discount = checkDiscount(key, qty);

      if (discount && discount.price) {
        totalPrice += discount.price;
      } else {
        totalPrice += qty * price;
      }

      if (discount && discount.bonus) {
        totalBonus += discount.bonus;
      }

      if (discount && discount.sum) {
        totalSum += qty * discount.sum;
      }
    }
  }

  if (totalSum > 0) {
    totalDiscount = sumLessProc(totalSum);
  }

  var result = {};
  result.amount = totalAmount;
  result.price = totalPrice;
  result.retailPrice = totalRetailPrice;
  result.bonus = totalBonus;
  result.discount = discount;
  result.totalDiscount = totalDiscount;
  return result;
}

//=====================================================================================================
// Функции для отображения контента корзины:
//=====================================================================================================

// Отображение контента корзины:

function renderCart() {
  window.removeEventListener('scroll', scrollGallery);
  window.removeEventListener('resize', scrollGallery);;
  submenu.style.display = 'none';
  search.style.visibility = 'hidden';
  mainMenuBtns.style.visibility = 'hidden';
  mainInfo.style.display = 'none';
  filtersContainer.style.display = 'none';
  gallery.style.display = 'none';
  galleryNotice.style.display = 'none';
  createCatalogLink();
  changeHeaderCart();
  if (createCartList()) {
    checkAllBtn.classList.add('checked');
    createCartLinks();
/* !!! Фильтр чекбоксом */
    createCartFilters();
/* !!! Фильтр селектом */
    createActionFilter();
    document.querySelectorAll('.cart-row').forEach(row => {
      changeCartRow(row);
    });
    changeCartInfo();
    cartFull.style.display = 'block';
    cartEmpty.style.display = 'none';
  }
  cartContent.style.display = 'block';
}

// Создание сслыки на каталог:

function createCatalogLink() {
  var curCatalog = document.querySelector('.topmenu-item.active');
  if (curCatalog) {
    catalogLink.dataset.href = curCatalog.dataset.href;
    catalogLink.href = curCatalog.href;
  }
}

// Создание ссылок на другие корзины:

function createCartLinks() {
  list = '';
  document.querySelectorAll('.topmenu-item:not(.active)').forEach(item => {
    newItem = cartLinkTemplate
      .replace('#href#', item.href + '?cart')
      .replace('#dataHref#', item.dataset.href + '?cart')
      .replace('#title#', item.textContent);
      list += newItem;
  });
  if (list != '') {
    cartLinksList.innerHTML = list;
    cartLinks.style.display = 'flex';
  }
}

/* !!! Фильтр чекбоксом */
// Создание фильтров корзины:

function createCartFilters() {
  list = '';
  var unique = [];
  for (item of discounts) {
    if (item.dtitle && unique.indexOf(item.did) === -1) {
      unique.push(item.did);
      newItem = cartFilterTemplate
        .replace('#actionId#', item.did)
        .replace('#actionTitle#', item.dtitle);
      list += newItem;
    }
  }
  filterSelect.innerHTML = filterSelectTemplate.replace(cartFilterTemplate, list);
  cartFilter.style.display = 'flex';
}

/* !!! Фильтр селектом */
// Создание фильтров по акциям:

function createActionFilter() {
  list = '';
  var unique = [];
  for (item of discounts) {
    if (item.dtitle && unique.indexOf(item.did) === -1) {
      unique.push(item.did);
      newItem = itemFilterActionTemplate
        .replace('#actionId#', item.did)
        .replace('#actionTitle#', item.dtitle);
      list += newItem;
    }
  }
  filterActionMenu.innerHTML = filterActionTemplate.replace(itemFilterActionTemplate, list);
  filterAction.style.display = 'flex';
}


// Создание списка товаров корзины:

function createCartList() {
  var cartList = '',
      cartTableList = '',
      qty;

  cartInfo = cart[cartName];
  for (key in cartInfo) {
    qty = cartInfo[key];
    key = key.replace('id_', '');
    findCurData(key);
    if (curProduct) {
      newItem = createCartRow(qty);
      cartList += newItem;
      newItem = createCartTableRow(qty);
      cartTableList += newItem;
    } else {
      // если нужно удалить не найденный артикул:
      // removeCartInfo(key);
    }
  }
  if (!cartList) {
    cartEmpty.style.display = 'block';
    cartFull.style.display = 'none';
  } else {
    cartRows.innerHTML = cartList;
    cartTable.innerHTML = cartTableList;
  }
  return cartList;
}

// Получение данных о текущем артикле:

function findCurData(id) {
  curArticul = null;
  curProduct = items.find(item => {
    if (item.sizes && item.sizes != 0) {
      for (key in item.sizes) {
        if (item.sizes[key].object_id == id) {
          curArticul = item.sizes[key];
          return true;
        }
      }
    } else {
      if (item.object_id == id) {
        curArticul = item;
        return true;
      }
    }
  });
}

// Создание одной строки корзины:

function createCartRow(qty, isBonus) {
  newItem = cartRowTemplate;
  var productOptions = '';
  if (curProduct.sizes && Object.keys(curProduct.sizes).length > 1) {
    productOptions = `(${curProduct.options[40]}, ${curArticul.size})`;
  }
  var productStatus = '';
  if (curArticul.free_qty <= 0) {
    productStatus = 'not-available';
  }
  if (isBonus) {
    productStatus = 'bonus';
  }

  newItem = newItem
    .replace('#status#', productStatus)
    .replace(/#id#/gi, curArticul.object_id)
    .replace('#image#', `http://b2b.topsports.ru/c/productpage/${curProduct.images[0]}.jpg`)
    .replace('#title#', curProduct.title)
    .replace('#options#', productOptions)
    .replace('#articul#', curArticul.articul)

  if (isBonus) {
    newItem = newItem
      .replace('#bonus#', qty)
      .replace('#price#', 'Подарок');
  } else if (productStatus === 'not-available') {
    newItem = newItem
      .replace('#price#', '0');
  } else {
    var price = curProduct.price_preorder1 == 0 ? curProduct.price1 : curProduct.price_preorder1;
    newItem = newItem
      .replace('#qty#', qty)
      .replace('#price#', price.toLocaleString())
      .replace('#free_qty#', curArticul.free_qty);
  }
  return newItem;
}

// Создание одной строки корзины для копирования:

function createCartTableRow(qty) {
  newItem = cartTableRowTemplate
    .replace('#id#', curArticul.object_id)
    .replace('#title#', curProduct.title)
    .replace('#articul#', curArticul.articul)
    .replace('#qty#', qty);
  return newItem;
}

//=====================================================================================================
//  Функции для изменения количества товаров:
//=====================================================================================================

// Удаление значения из инпута при его фокусе:

function onFocusInput(input) {
  if (input.value != '') {
    input.value = '';
  }
}

// Запрет на ввод в инпут любого значения кроме цифр:

function checkValue(event) {
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  var chr = getChar(event);
  if (chr == null) return;
  if (chr < '0' || chr > '9') {
    return false;
  }
}

// Кросс-браузерная функция для получения символа из события keypress:

function getChar(event) {
  if (event.which == null) { // IE
    if (event.keyCode < 32) return null; // спец. символ
    return String.fromCharCode(event.keyCode)
  }
  if (event.which != 0 && event.charCode != 0) { // все кроме IE
    if (event.which < 32) return null; // спец. символ
    return String.fromCharCode(event.which); // остальные
  }
  return null; // спец. символ
}

// Вывод информации о корзине:

function checkCart(card) {
  var input, id, qty, freeQty, clicable;

  cartInfo = cart[cartName];
  card.querySelectorAll('.card-size').forEach(size => {
    input = size.querySelector('.choiced-qty');
    id = input.dataset.id;
    if (cartInfo) {
      qty = cartInfo['id_' + id];
      if (qty) {
        freeQty = parseInt(size.querySelector('.available-qty').textContent, 10);
        input.value = qty > freeQty ? freeQty : qty;
        clicable = size.querySelector('.size-name.click');
        changeColors(size, qty);
        changeNameBtn(clicable, qty);
        changeCardInfo(card);
      }
    }
  });
}

// Изменение информации о корзине:

function changeCart(event, id, sign) {
  var curEl, input, qty, freeQty, qtyBox, clicable;

  curEl = event.currentTarget.closest('.card');
  if (curEl) {
    qtyBox = event.currentTarget.closest('.card-size');
  } else {
    curEl = event.currentTarget.closest('.cart-row');
    qtyBox = curEl.querySelector('.amount');
  }
  input = qtyBox.querySelector('.choiced-qty');
  qty = parseInt(input.value, 10);
  freeQty = parseInt(qtyBox.querySelector('.available-qty').textContent, 10);

  qty = changeValue(sign, qty, freeQty);
  if (input.value === qty) {
    return;
  }
  input.value = qty;

  saveCartInfo(id, qty);
  changeColors(qtyBox, qty);

  if (curEl.classList.contains('card')) {
    clicable = curEl.querySelector('.size-name.click');
    changeNameBtn(clicable, qty);
    changeCardInfo(curEl);
  } else {
    changeCartRow(curEl);
    changeCartInfo();
  }
  changeHeaderCart();
}

// Изменение количества выбранного товара:

function changeValue(sign, qty, freeQty) {
  if (sign) {
    if (sign == '-') {
      if (qty > 0) {
        qty--;
      }
    } else if (sign == '+') {
      if (qty < freeQty) {
        qty++;
      }
    } else if (sign == 'В корзину') {
      qty = 1;
    } else if (sign == 'Удалить') {
      qty = 0;
    }
  } else {
    if (isNaN(qty)) {
      qty = 0;
    }
    if (qty > freeQty) {
      qty = freeQty;
    }
  }
  return qty;
}

// Изменение цвета элементов панели выбора:

function changeColors(el, qty) {
  if (qty == 0) {
    el.classList.remove('in-cart');
  } else {
    el.classList.add('in-cart');
  }
}

// Изменение названия кнопки в панели выбора:

function changeNameBtn(el, qty) {
  if (el) {
    if (qty == 0) {
      el.textContent = 'В корзину';
    } else {
      el.textContent = 'Удалить';
    }
  }
}

// Изменение информации в карточке товара:

function changeCardInfo(card) {
  var selectInfo = card.querySelector('.select-info'),
      bonusRow = selectInfo.querySelector('.bonus'),
      idList = Array.from(card.querySelectorAll('.choiced-qty')).map(item => item.dataset.id),
      totals = countFromCart(idList);

  if (totals.bonus) {
    findCurData(totals.discount.articul);
    bonusRow.querySelector('.bonus-img').src = `http://b2b.topsports.ru/c/productpage/${curProduct.images[0]}.jpg`;
    bonusRow.style.display = 'flex';
  } else {
    bonusRow.style.display = 'none';
  }

  if (totals.amount > 0) {
    card.querySelector('.select-count').textContent = totals.amount;
    card.querySelector('.select-price').textContent = totals.price.toLocaleString();
    bonusRow.querySelector('.bonus-qty span').textContent = totals.bonus;
    selectInfo.style.visibility = 'visible';
  } else {
    selectInfo.style.visibility = 'hidden';
  }
}

// Изменение информации в корзине:

function changeCartRow(row) {
  if (row.classList.contains('not-available')) {
    return;
  }
  var input = row.querySelector('.choiced-qty'),
      id = input.dataset.id,
      tableRow = cartTable.querySelector(`:not(.bonus)[data-id="${id}"]`),
      totals = countFromCart(id);

  tableRow.querySelector('.qty').textContent = parseInt(input.value ,10);
  row.querySelector('.total .value').textContent = totals.price.toLocaleString();
  tableRow.querySelector('.total').textContent = totals.price;

  if (totals.discount && totals.discount.title) {
    var discount = totals.discount;

    var curFilter;
/* !!! Фильтр селектом */
    curFilter = filterSelect.querySelector(`[value="${discount.id}"]`);
    if (curFilter) {
      curFilter.style.display = 'block';
    }
/* !!! Фильтр чекбоксом */
    curFilter = filterAction.querySelector(`[data-id="${discount.id}"]`);
    if (curFilter) {
      curFilter.style.display = 'block';
    }
    row.classList.add('discount');
    row.dataset.action = discount.id;
    row.querySelector('.action .value').textContent = discount.title;

    if (discount.bonus >= 0) {
      var bonusRow = document.querySelector(`.cart-row.bonus[data-id="${discount.articul}"]`);

      if (discount.bonus > 0) {
        if (bonusRow) {
          bonusRow.querySelector('.amount .bonus span').textContent = discount.bonus;
          cartTable.querySelector(`[data-id="${discount.articul}"] .qty`).textContent = discount.bonus;
        } else {
          findCurData(discount.articul);
          var cartRow = createCartRow(discount.bonus, true);
          row.insertAdjacentHTML('afterend', cartRow);
          bonusRow = row.nextElementSibling;
          bonusRow.dataset.parentId = id;
          bonusRow.dataset.action = discount.id;
          bonusRow.querySelector('.action .value').textContent = discount.title;
          if (!row.classList.contains('checked')) {
            bonusRow.classList.remove('checked');
          }
          var cartTableRow = createCartTableRow(discount.bonus);
          tableRow.insertAdjacentHTML('afterend', cartTableRow);
          tableRow.nextElementSibling.classList.add('bonus');
        }
      } else {
        if (bonusRow) {
          cartRows.removeChild(bonusRow);
          cartTable.firstChild.removeChild(cartTable.querySelector(`.bonus[data-id="${bonusRow.dataset.id}"]`));
        }
      }
    }
  } else {
/* !!! Фильтр селектом */
    curFilter = filterSelect.querySelector(`[value="none"]`);
    if (curFilter) {
      curFilter.style.display = 'block';
    }
/* !!! Фильтр чекбоксом */
    curFilter = filterAction.querySelector(`[data-id="none"]`);
    if (curFilter) {
      curFilter.style.display = 'block';
    }
  }
}

// Изменение общей информации о корзине:

function changeCartInfo() {
  var selectedRows = cartRows.querySelectorAll('.cart-row.checked:not(.bonus)');
  if (!selectedRows) {
    return;
  }

  var idList = Array.from(selectedRows).map(item => item.dataset.id),
      totals = countFromCart(idList);

  cartAmount.textContent = totals.amount;
  if (totals.amount > 0) {
    cartOrderPrice.textContent = totals.price.toLocaleString();
    cartRetailPrice.textContent = totals.retailPrice.toLocaleString();

    if (totals.totalDiscount) {
      var  discount = totals.totalDiscount;
      cartDiscountAmount.textContent = discount.amount.toLocaleString();
      cartDiscountPercent.textContent = discount.percent;
      cartDiscount.style.display = 'block';
    } else {
      cartDiscount.style.display = 'none';
    }
    cartMakeOrder.style.display = 'flex';
  } else {
    cartOrderPrice.textContent = 0;
    cartRetailPrice.textContent = 0;
    cartDiscount.style.display = 'none';
    cartMakeOrder.style.display = 'none';
  }
}

//=====================================================================================================
//  Функции для подсчета скидок:
//=====================================================================================================

// Проверка актуальности скидки:

function checkDiscountDate(discount) {
  if (!discount.ddatestart || !discount.ddateend) {
    return true;
  }
  var curDate = new Date(),
      dateStart = discount.ddatestart.split('.'),
      dateEnd = discount.ddateend.split('.');
  dateStart = new Date(dateStart[2], dateStart[1] - 1, dateStart[0], 0, 0, 0, 0);
  dateEnd = new Date(dateEnd[2], dateEnd[1] - 1, dateEnd[0], 23, 59, 59, 999);
  if (curDate > dateStart && curDate < dateEnd) {
    return true;
  } else {
    return false;
  }
}

// Проверка условия скидки:

function checkCondition(condition) {
  if (condition.razdel == cartName) {
    return true;
  }
  return false;
}

// Проверка скидки на артикул:

var result;

function checkDiscount(id, qty) {
  var curDiscount = discounts.find(item => {
    if (item.diart) {
      for (item of item.diart) {
        return item == id ? true : false;
      }
    }
  });
  if (!curDiscount) {
    curDiscount = discounts.find(item => !item.diart && checkCondition(item.dcondition));
  }
  if (!curDiscount) {
    return undefined;
  }
  var relevance = checkDiscountDate(curDiscount);
  if (relevance) {
    result = {};
    result.id = curDiscount.did;
    result.title = curDiscount.dtitle;
    result.descr = curDiscount.ddesc;
    switch (curDiscount.dtype) {
      case 'numplusnum':
        numPlusNum(curDiscount, qty);
        break;
      case 'numplusart':
        numPlusArt(curDiscount, qty);
        break;
      case 'numminusproc':
        numMinusProc(curDiscount, qty);
        break;
      case 'numkorobkaskidka':
        numKorobka();
        break;
      case 'numupakovka':
        numUpakovka();
        break;
      case 'sumlessproc':
        result.sum = curProduct.price_user1;
        break;
    }
    return result;
  } else {
    return undefined;
  }
}

// Расчет скидки "покупаешь определенное кол-во - из него определенное кол-во в подарок":

function numPlusNum(discount, qty) {
  var price = curProduct.price_preorder1 == 0 ? curProduct.price1 : curProduct.price_preorder1;
  result.price = (qty - findBonus(discount, qty)) * price;
}

// Расчет скидки "покупаешь определенное кол-во - определенное кол-во другого артикула в подарок":

function numPlusArt(discount, qty) {
  result.bonus = findBonus(discount, qty);
  result.articul = discount.diartex;
}

// Расчет количества бонусов:

function findBonus(discount, qty) {
  return Math.floor(qty / discount.dnv) * discount.dnvex;
}

// Расчет скидки "покупаешь определенное кол-во - скидка в % от РРЦ":

function numMinusProc(discount, qty) {
  var rest = qty % discount.dnv,
      price = curProduct.price_preorder1 == 0 ? curProduct.price1 : curProduct.price_preorder1,
      retailPrice = curProduct.price_user1;
  result.price = (qty - rest) * (retailPrice - retailPrice * discount.dnvex / 100) + (rest * price);
}

// Расчет скидки типа "скидка при покупке коробки":

function numKorobka(params) {
}

// Расчет скидки типа "скидка при покупке упаковки":

function numUpakovka(params) {
}

// Расчет скидки "итоговая сумма заказа минус %":

function sumLessProc(sum) {
  var curDiscount = discounts.find(item => !item.diart && checkCondition(item.dcondition)),
      current = undefined;
  curDiscount.dnv.forEach((item, index) => {
    if (sum >= item) {
      current = index;
    }
  });
  if (current >= 0) {
    result = {};
    result.amount = sum * curDiscount.dnvex[current] / 100;
    result.percent = curDiscount.dnvex[current];
    return result;
  } else {
    return undefined;
  }
}

//=====================================================================================================
//  Функции для работы с корзиной:
//=====================================================================================================

 /* !!! Фильтр селектом */
// Фильтрация корзины:

function filterCart() {
  var selectedValue = filterSelect.value,
      allRows = cartRows.querySelectorAll('.cart-row');
  if (selectedValue === 'all') {
    allRows.forEach(row => {
      row.classList.add('checked');
      row.classList.remove('displayNone');
    });
  } else {
    allRows.forEach(row => {
      if (row.dataset.action === selectedValue) {
        row.classList.add('checked');
        row.classList.remove('displayNone');
      } else {
        row.classList.remove('checked');
        row.classList.add('displayNone');
      }
    });
  }
  checkAllBtn.classList.add('checked');
  changeCartInfo();
}

/* !!! Фильтр чекбоксом */
// Фильтрация корзины:

function filterCart1(event) {
  var allRows = cartRows.querySelectorAll('.cart-row'),
      menuTitle = filterAction.querySelector('.menu-title');
  if (event) {
    event.currentTarget.classList.toggle('checked');
  }
  var checked = filterAction.querySelectorAll('.item.checked');

  if (!event || checked.length === 0) {
    allRows.forEach(row => {
      row.classList.add('checked');
      row.classList.remove('displayNone');
    });
    menuTitle.textContent = 'Выберите из списка';
    checked.forEach(item => {
      item.classList.remove('checked');
    });
  } else {
    allRows.forEach(row => {
      row.classList.remove('checked');
      row.classList.add('displayNone');
    });
    menuTitle.textContent = 'Выбрано: ' + checked.length;
    allRows.forEach(row => {
      for (item of checked) {
        if (row.dataset.action === item.dataset.id) {
          row.classList.add('checked');
          row.classList.remove('displayNone');
        }
      }
    });
  }
  checkAllBtn.classList.add('checked');
  changeCartInfo();
}

// Копирование корзины:

function copyCart() {
  cartCopy.textContent = cartTable.outerHTML;
  cartCopy.focus();
  cartCopy.setSelectionRange(0, cartCopy.value.length);
  try {
    document.execCommand('copy');
    alert('Содержимое корзины скопировано в буфер обмена.');
    // copyMessage.textContent = 'Содержимое корзины скопировано в буфер обмена.';
    // copyResultContainer.style.display = 'flex';
  } catch (error) {
    console.error(error);
    alert('Не удалось скопировать cодержимое корзины.');
    // copyMessage.textContent = 'Не удалось скопировать cодержимое корзины.';
    // copyResultContainer.style.display = 'flex';
  }
  // setTimeout(() => closeCopyResult(), 2000);
}

// Закрытие сообщения о результате копирования корзины:

function closeCopyResult() {
  copyResultContainer.style.display = 'none';
}

// Выделение/снятие выделения всех пунктов корзины:

function toggleAllCart(event) {
  if (event.currentTarget.classList.contains('checked')) {
    event.currentTarget.classList.remove('checked');
    cartRows.querySelectorAll('.cart-row:not(.displayNone)').forEach(row => row.classList.remove('checked'));
    cartMakeOrder.style.display = 'none';
  } else {
    event.currentTarget.classList.add('checked');
    cartRows.querySelectorAll('.cart-row:not(.displayNone)').forEach(row => row.classList.add('checked'));
    cartMakeOrder.style.display = 'flex';
  }
  changeCartInfo();
}

// Выделение/снятие выделения одного пункта корзины:

function toggleInCart(event) {
  var curRow = event.currentTarget.parentElement;
  if (curRow.classList.contains('bonus')) {
    return;
  }
  curRow.classList.toggle('checked');
  var bonusRow = document.querySelector(`.cart-row[data-parent-id="${curRow.dataset.id}"]`);
  if (bonusRow) {
    bonusRow.classList.toggle('checked');
  }
  if (!cartRows.querySelector('.cart-row:not(.checked)')) {
    checkAllBtn.classList.add('checked');
  } else {
    checkAllBtn.classList.remove('checked');
  }
  changeCartInfo();
}

// Удаление выбранных пунктов:

function deleteSelected() {
  var curAction;
  if (confirm('Удалить выделенные товары из корзины?')) {
    cartRows.querySelectorAll('.cart-row.checked').forEach(row => {
      cartRows.removeChild(row);
      curAction = row.dataset.action;
      if (!cartRows.querySelector(`.cart-row.discount[data-action="${curAction}"]`)) {
/* !!! Фильтр селектом */
        filterSelect.querySelector(`[value="${curAction}"]`).style.display = 'none';
/* !!! Фильтр чекбоксом */
        filterAction.querySelector(`[data-id="${curAction}"]`).style.display = 'none';
      }
      if (row.classList.contains('bonus')) {
        cartTable.firstChild.removeChild(cartTable.querySelector(`.bonus[data-id="${row.dataset.id}"]`));
      } else {
        cartTable.firstChild.removeChild(cartTable.querySelector(`[data-id="${row.dataset.id}"]`));
        saveCartInfo(row.dataset.id, 0);
      }
    });
    checkAllBtn.classList.remove('checked');
    changeCartInfo();
    changeHeaderCart();
    if (cartRows.querySelectorAll('.cart-row').length == 0) {
      cartEmpty.style.display = 'block';
      cartFull.style.display = 'none';
    } else {
      if (!cartRows.querySelector('.cart-row:not(.displayNone)')) {
/* !!! Фильтр селектом */
        filterSelect.value = 'all';
        filterCart();
/* !!! Фильтр чекбоксом */
        filterCart1();
      }
    }
  }
}
