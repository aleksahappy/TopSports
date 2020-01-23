'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

if (headerCart) {
  var headerPrice = headerCart.querySelector('.amount span'),
      headerAmount = headerCart.querySelector('.count'),
      cartName = document.getElementById('cart-name');
}

var cartContent = document.getElementById('cart');

if (cartContent) {
  var cartFull = document.getElementById('cart-full'),
      cartEmpty = document.getElementById('cart-empty'),
      cartLinks = document.getElementById('cart-links'),
      cartLinksList = document.getElementById('cart-links-list'),
/* !!! Фильтр селектом */
      // cartFilters = document.getElementById('cart-filters'),
      // filterSelect = document.getElementById('filter-select'),
/* !!! Фильтр чекбоксом */
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
      deleteBtn = document.getElementById('delete-btn'),
      orderBtn = document.getElementById('order-btn'),
      warningBtn = document.getElementById('warning-btn'),
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
      catalogLink = document.getElementById('catalog-link'),
      loadText = document.getElementById('load-text');

  // Получение шаблонов из HTML:

  var cartLinkTemplate = cartLinksList.innerHTML,
 /* !!! Фильтр селектом */
      // filterSelectTemplate = filterSelect.innerHTML,
      // cartFiltersTemplate =  filterSelect.querySelector('.filter-value').outerHTML,
 /* !!! Фильтр чекбоксом */
      filterActionTemplate = filterActionMenu.innerHTML,
      itemFilterActionTemplate =  filterActionMenu.querySelector('.action').outerHTML,

      cartRowTemplate = cartRows.innerHTML,
      cartTableRowTemplate = cartTable.querySelector('tr').outerHTML;
}

// Динамически изменяемые переменные:

var curProduct,
    curArticul,
    cartTimer = null,
    cartTimeout = 1000;

//=====================================================================================================
// Работа с данными о состоянии корзины:
//=====================================================================================================

// Проверка актуальности данных в корзине:

function checkCartRelevance() {
  var id, freeQty, price, retailPrice, actionId, discount, curActionId,
      cartInfo = cart[cartId];

  for (id in cartInfo) {
    freeQty = cartInfo[id].freeQty;
    price = cartInfo[id].price;
    retailPrice = cartInfo[id].retailPrice;
    actionId = cartInfo[id].actionId;
    id = cartInfo[id].id;
    findCurData(id);
    if (curProduct) {
      curActionId = 0;
      discount = findDiscount(id);
      if (discount && discount.dtitle) {
        curActionId = discount.did;
      }
      if (freeQty != curProduct.free_qty || price != curProduct.price_cur1 || retailPrice != curProduct.price_user1 || actionId != curActionId) {
        saveCartInfo(id, {freeQty: curProduct.free_qty, price: curProduct.price_cur1, retailPrice: curProduct.price_user1, actionId: curActionId});
      }
    }
  }
}

// Сохранение данных о состоянии корзины:

function saveCartInfo(id, options) {
  id = 'id_' + id;
  if (!cart[cartId]) {
    cart[cartId] = {};
  }
  if (options.qty == 0 && !cart[cartId][id]) {
    return;
  }
  if (!cart[cartId][id]) {
    cart[cartId][id] = {};
  }
  cart[cartId][id].cartId = cartId;
  cart[cartId][id].id = id.replace('id_', '');
  for (key in options) {
    cart[cartId][id][key] = options[key];
  }
  cartChanges[id] = cart[cartId][id];
  cartSentServer();

  if (options.qty == 0) {
    delete cart[cartId][id];
  }
  // console.log(cart);
}

// Отправка корзины на сервер:

function cartSentServer() {
  clearTimeout(cartTimer);
  cartTimer = setTimeout(function () {
    console.log(cartChanges);
    var data = JSON.stringify(cartChanges);
    sendRequest(url + 'cart.txt', data)
      .then(response => {
        cartChanges = {};
        // console.log(response);
      })
      .catch(err => {
        // cartChanges = {};
        // cartSentServer();
        // console.log(err);
      })
  }, cartTimeout);
}

// Отправка данных о заказе на сервер:

function orderSentServer() {
  var idList = getIdList();
  if (!idList) {
    showError('Не выбрано ни одного товара');
    return;
  }
  var cartInfo = cart[cartId],
      data = {};
  idList.forEach(id => {
    data['id_' + id] = cartInfo['id_' + id];
  });
  console.log(data);
  var data = JSON.stringify(data);
  sendRequest(url + 'cart.txt', data)
  .then(response => {
    // console.log(response);
  })
  .catch(err => {
    // console.log(err);
  })
}

//=====================================================================================================
// Функции для подсчета корзины:
//=====================================================================================================

// Подсчет по корзине:

function countFromCart(idList) {
  var amount = 0,
      price = 0,
      discountPrice = 0,
      retailPrice = 0,
      bonus = 0,
      sum = 0,
      orderDiscount = 0,
      discount,
      id,
      qty,
      freeQty,
      curPrice,
      curRetailPrice,
      cartInfo = cart[cartId];

  for (key in cartInfo) {
    id = cartInfo[key].id;
    freeQty = cartInfo[key].freeQty;
    if (idList && (idList != id && idList.indexOf(id) === -1) || freeQty <= 0) {
      continue;
    }
    qty = cartInfo[key].qty > freeQty ? freeQty : cartInfo[key].qty;
    curPrice = cartInfo[key].price;
    curRetailPrice = cartInfo[key].retailPrice;

    amount += qty;
    price += qty * curPrice;
    retailPrice += qty * curRetailPrice;

    discount = checkDiscount(id, qty, curPrice, curRetailPrice);

    if (discount && discount.price) {
      discountPrice += discount.price;
    } else {
      discountPrice += qty * curPrice;
    }

    if (discount && discount.bonus) {
      bonus += discount.bonus;
    }

    if (discount && discount.sum) {
      sum += qty * discount.sum;
    }
  }

  if (sum > 0) {
    orderDiscount = sumLessProc(sum);
  }

  var result = {};
  result.amount = amount;
  result.price = price;
  result.discountPrice = discountPrice;
  result.retailPrice = retailPrice;
  result.bonus = bonus;
  result.orderDiscount = orderDiscount;
  result.discount = discount;

  return result;
}

//=====================================================================================================
//  Функции для подсчета скидок:
//=====================================================================================================

// Проверка скидки на артикул:

var result;

function checkDiscount(id, qty, price, retailPrice) {
  var discount = findDiscount(id);
  if (discount) {
    result = {};
    result.id = discount.did;
    result.title = discount.dtitle;
    result.descr = discount.ddesc;
    switch (discount.dtype) {
      case 'numplusnum':
        numPlusNum(discount, qty, price);
        break;
      case 'numplusart':
        numPlusArt(discount, qty);
        break;
      case 'numminusproc':
        numMinusProc(discount, qty, price, retailPrice);
        break;
      case 'numkorobkaskidka':
        numKorobka();
        break;
      case 'numupakovka':
        numUpakovka();
        break;
      case 'sumlessproc':
        result.sum = retailPrice;
        break;
    }
    return result;
  } else {
    return undefined;
  }
}

// Расчет скидки "покупаешь определенное кол-во - из него определенное кол-во в подарок":

function numPlusNum(discount, qty, price) {
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

function numMinusProc(discount, qty, price, retailPrice) {
  var rest = qty % discount.dnv;
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
  var discount = discounts.find(item => !item.diart && checkCondition(item.dcondition));
  if (!discount) {
    return undefined;
  }
  var current;
  discount.dnv.forEach((item, index) => {
    if (sum >= item) {
      current = index;
    }
  });
  if (current >= 0) {
    result = {};
    result.amount = sum * discount.dnvex[current] / 100;
    result.percent = discount.dnvex[current];
    return result;
  } else {
    return undefined;
  }
}

//=====================================================================================================
// Функции для работы с корзиной в шапке сайта:
//=====================================================================================================

// Отображение информации о состоянии корзины в шапке сайта:

function changeHeaderCart() {
  var totals = countFromCart();
  headerPrice.textContent = totals.discountPrice.toLocaleString();
  headerAmount.textContent = totals.amount;
  if (location.search == '?cart') {
    cartName.textContent = ': ' + document.querySelector('.topmenu-item.active').textContent + ' - ' + totals.amount + ' товаров';
    cartName.style.display = 'block';
  }
  if (totals.amount == 0) {
    headerAmount.style.visibility = 'hidden';
  } else {
    headerAmount.style.visibility = 'visible';
    if (totals.amount > 99) {
      headerShortAmount.textContent = '99';
    } else {
      headerShortAmount.textContent = totals.amount;
    }
  }
}

//=====================================================================================================
// Функции для отображения контента корзины:
//=====================================================================================================

// Отображение контента корзины:

function renderCart() {
  hideContent('cart');
  createCatalogLink();
  if (createCartList()) {
    checkAllBtn.classList.add('checked');
    createCartLinks();
/* !!! Фильтр селектом */
    // createCartFilters();
/* !!! Фильтр чекбоксом */
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
  catalogLink.dataset.href = curCatalog.dataset.href;
  catalogLink.href = curCatalog.href;
}

// Создание ссылок на другие корзины:

function createCartLinks() {
  var list = '', newItem;
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

/* !!! Фильтр селектом */
// Создание фильтров корзины:

function createCartFilters() {
  var list = '',
      newItem,
      unique = [];
  for (item of discounts) {
    if (item.dtitle && unique.indexOf(item.did) === -1) {
      unique.push(item.did);
      newItem = cartFiltersTemplate
        .replace('#actionId#', item.did)
        .replace('#actionTitle#', item.dtitle);
      list += newItem;
    }
  }
  if (list) {
    filterSelect.innerHTML = filterSelectTemplate.replace(cartFiltersTemplate, list);
    cartFilters.style.display = 'flex';
  }
}

/* !!! Фильтр чекбоксом */
// Создание фильтров по акциям:

function createActionFilter() {
  var list = '',
      newItem,
      unique = [];
  for (item of discounts) {
    if (item.dtitle && unique.indexOf(item.did) === -1) {
      unique.push(item.did);
      newItem = itemFilterActionTemplate
        .replace('#actionId#', item.did)
        .replace('#actionTitle#', item.dtitle);
      list += newItem;
    }
  }
  if (list) {
    filterActionMenu.innerHTML = filterActionTemplate.replace(itemFilterActionTemplate, list);
    filterAction.style.display = 'flex';
  }
}

// Создание списка товаров корзины:

function createCartList() {
  var cartList = '',
      cartTableList = '',
      newItem,
      qty,
      cartInfo = cart[cartId];
  for (key in cartInfo) {
    qty = cartInfo[key].qty;
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

// Получение данных по id товара:

function findCurData(id) {
  curArticul = null;
  curProduct = items.find(el => {
    if (el.sizes && el.sizes != 0) {
      for (item in el.sizes) {
        if (el.sizes[item].object_id == id) {
          curArticul = el.sizes[item];
          return true;
        }
      }
    } else {
      if (el.object_id == id) {
        curArticul = el;
        return true;
      }
    }
  });
}

// Получение данных по артиклу товара:

function findCurArticul(articul) {
  curArticul = null;
  curProduct = items.find(el => {
    if (el.sizes && el.sizes != 0) {
      for (item in el.sizes) {
        if (el.sizes[item].articul == articul) {
          curArticul = el.sizes[item];
          return true;
        }
      }
    } else {
      if (el.articul == articul) {
        curArticul = el;
        return true;
      }
    }
  });
}

// Создание одной строки корзины:

function createCartRow(qty, isBonus) {
  var newItem = cartRowTemplate,
      productOptions = '',
      productStatus = '';
  if (curProduct.sizes && Object.keys(curProduct.sizes).length > 1) {
    productOptions = `(${curProduct.options[40]}, ${curArticul.size})`;
  }
  if (curArticul.free_qty > 0) {
    var freeQty = parseInt(curArticul.free_qty, 10);
    qty = qty > freeQty ? freeQty : qty;
  } else {
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
    newItem = newItem
      .replace(/#qty#/gi, qty)
      .replace('#price#', curProduct.price_cur1.toLocaleString())
      .replace(/#free_qty#/gi, curArticul.free_qty);
  }
  return newItem;
}

// Создание одной строки корзины для копирования:

function createCartTableRow(qty) {
  var freeQty = parseInt(curArticul.free_qty, 10);
  var newItem = cartTableRowTemplate
    .replace('#id#', curArticul.object_id)
    .replace('#title#', curProduct.title)
    .replace('#articul#', curArticul.articul)
    .replace('#qty#', qty > freeQty ? freeQty : qty);
  return newItem;
}

//=====================================================================================================
//  Функции для изменения данных о количестве:
//=====================================================================================================

// Вывод информации о корзине:

function checkCart(card) {
  var input, id, qtyWrap, clicable, qty, freeQty,
      cartInfo = cart[cartId];
  card.querySelectorAll('.card-size').forEach(size => {
    input = size.querySelector('.choiced-qty');
    id = 'id_' + input.dataset.id;
    qtyWrap = size.querySelector('.qty');
    clicable = size.querySelector('.name.click');
    if (cartInfo && cartInfo[id]) {
      qty = cartInfo[id].qty;
      freeQty = parseInt(input.dataset.freeQty, 10);
    } else {
      qty = 0;
    }
    qty = qty > freeQty ? freeQty : qty;
    input.value = qty;
    input.dataset.value = qty;
    changeColors(qtyWrap, qty);
    changeNameBtn(clicable, qty);
    changeCardInfo(card);
  });
}

// Изменение информации о корзине:

function changeCart(event) {
  var current = event.currentTarget,
      curEl = current.closest('.manage'),
      sign = current.textContent,
      qtyWrap = current.closest('.qty'),
      input = qtyWrap.querySelector('.choiced-qty'),
      qty = parseInt(input.value, 10),
      freeQty = parseInt(input.dataset.freeQty, 10),
      id = input.dataset.id,
      actionId = curEl.dataset.actionId;

  qty = changeValue(sign, qty, freeQty);
  if (parseInt(input.dataset.value, 10) === qty) {
    return;
  }
  findCurData(id);
  if (!curProduct) {
    return;
  }
  input.value = qty;
  input.dataset.value = qty;
  saveCartInfo(id, {qty: qty, freeQty: freeQty, price: curProduct.price_cur1, retailPrice: curProduct.price_user1, actionId: actionId});
  changeColors(qtyWrap, qty);
  if (curEl.classList.contains('card')) {
    var clicable = qtyWrap.querySelector('.name.click');
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
  if (el) {
    if (qty == 0) {
      el.classList.remove('in-cart');
    } else {
      el.classList.add('in-cart');
    }
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
    var imgNumb = '';
    if (curProduct) {
      imgNumb = curProduct.images[0];
    }
    bonusRow.querySelector('.bonus-img').src = `http://b2b.topsports.ru/c/productpage/${imgNumb}.jpg`;
    bonusRow.style.display = 'flex';
  } else {
    bonusRow.style.display = 'none';
  }

  if (totals.amount > 0) {
    card.querySelector('.select-count').textContent = totals.amount;
    card.querySelector('.select-price').textContent = totals.discountPrice.toLocaleString();
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
  row.querySelector('.total .value').textContent = totals.discountPrice.toLocaleString();
  tableRow.querySelector('.total').textContent = totals.discountPrice;

  if (totals.discount && totals.discount.title) {
    var discount = totals.discount;

    var curFilter;
/* !!! Фильтр селектом */
    // curFilter = filterSelect.querySelector(`[value="${discount.id}"]`);
    // if (curFilter) {
    //   curFilter.style.display = 'block';
    // }
/* !!! Фильтр чекбоксом */
    curFilter = filterAction.querySelector(`[data-id="${discount.id}"]`);
    if (curFilter) {
      curFilter.style.display = 'block';
    }
    row.classList.add('discount');
    row.dataset.actionId = discount.id;
    row.querySelector('.action .value').textContent = discount.title;

    if (discount.bonus >= 0) {
      var bonusRow = document.querySelector(`.cart-row.bonus[data-id="${discount.articul}"]`);

      if (discount.bonus > 0) {
        if (bonusRow) {
          bonusRow.querySelector('.amount .bonus span').textContent = discount.bonus;
          cartTable.querySelector(`[data-id="${discount.articul}"] .qty`).textContent = discount.bonus;
        } else {
          findCurData(discount.articul);
          row.insertAdjacentHTML('afterend', createCartRow(discount.bonus, true));
          bonusRow = row.nextElementSibling;
          checkImg(bonusRow);
          bonusRow.dataset.parentId = id;
          bonusRow.dataset.actionId = discount.id;
          bonusRow.querySelector('.action .value').textContent = discount.title;
          if (!row.classList.contains('checked')) {
            bonusRow.classList.remove('checked');
          }
          tableRow.insertAdjacentHTML('afterend', createCartTableRow(discount.bonus));
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
    // curFilter = filterSelect.querySelector(`[value="0"]`);
    // if (curFilter) {
    //   curFilter.style.display = 'block';
    // }
/* !!! Фильтр чекбоксом */
    curFilter = filterAction.querySelector(`[data-id="0"]`);
    if (curFilter) {
      curFilter.style.display = 'block';
    }
  }
}

// Изменение общей информации о корзине:

function changeCartInfo() {
  var idList = getIdList();
  if (idList) {
    var totals = countFromCart(idList);
    cartAmount.textContent = totals.amount;
    cartMakeOrder.style.display = 'flex';

    if (totals.amount > 0) {
      cartOrderPrice.textContent = totals.discountPrice.toLocaleString();
      cartRetailPrice.textContent = totals.retailPrice.toLocaleString();
      if (totals.orderDiscount) {
        var discount = totals.orderDiscount;
        cartDiscountAmount.textContent = discount.amount.toLocaleString();
        cartDiscountPercent.textContent = discount.percent;
        cartDiscount.style.display = 'block';
      } else {
        cartDiscount.style.display = 'none';
      }
      warningBtn.innerHTML = 'Оформление заказа невозможно:<br>Необходимо выбрать <a href="/clients/">клиента</a>.'
    }
    return;
  } else {
    var notAvailable = cartRows.querySelectorAll('.cart-row.checked.not-available');
    if (notAvailable.length > 0) {
      warningBtn.innerHTML = 'Оформление заказа невозможно:<br>Выбранного товара нет в наличии.';
      cartMakeOrder.style.display = 'flex';
      orderBtn.style.display = 'none';
      warningBtn.style.display = 'block';
    } else {
      cartMakeOrder.style.display = 'none';
    }
    cartAmount.textContent = 0;
  }
  cartOrderPrice.textContent = 0;
  cartRetailPrice.textContent = 0;
  cartDiscount.style.display = 'none';
}

// Получение списка id товаров, выбранных в корзине:

function getIdList() {
  var selectedRows = cartRows.querySelectorAll('.cart-row.checked:not(.bonus):not(.not-available)');
  if (selectedRows.length === 0) {
    return undefined;
  }
  return Array.from(selectedRows).map(item => item.dataset.id);
}

//=====================================================================================================
//  Функции для работы с корзиной:
//=====================================================================================================

// Загрузка корзины из текстового поля:

function loadInCart() {
  if (!loadText.value || !/\S/.test(loadText.value)) {
    return;
  }
  var addInCart = [],
      error = '',
      strings, curString, id, qty, freeQty, discount, actionId;

  strings = loadText.value
    .split(/\n|\r\n/)
    .map(el => el.split(/\s/))
    .map(el => el.filter(el => el != ''))
    .filter(el => el.length > 0);

  strings.forEach(el => {
    if (el.length != 2) {
      error = 'Неверный формат вводимых данных';
      return;
    }
    findCurArticul(el[0]);
    if (curProduct) {
      id = curProduct.object_id;
      qty = parseInt(el[1], 10);
      if (isNaN(+qty)) {
        error = 'Неверно введено количество';
        return;
      }
      if (qty > 0) {
        freeQty = parseInt(curProduct.free_qty, 10);
        qty = freeQty > 0 && qty > freeQty ? freeQty : qty;
        actionId = 0;
        discount = findDiscount(id);
        if (discount && discount.dtitle) {
          actionId = discount.did;
        }
        addInCart.push({id: id, options: {qty: qty, freeQty: freeQty, price: curProduct.price_cur1, retailPrice: curProduct.price_user1, actionId: actionId}});
      }
    }
  });
  if (!error && addInCart.length == 0) {
    error = 'Не найдено ни одного артикула';
  }
  if (error) {
    showError(error);
    setTimeout(() => closeError(), 1000);
    return;
  }
  addInCart.forEach(el => {
    saveCartInfo(el.id, el.options);
  });
  renderCart();
  changeHeaderCart();
  if (addInCart.length < strings.length) {
    showError('При загрузке были найдены не все артикулы');
    setTimeout(() => closeError(), 1000);
  }
  loadText.value = '';
}

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
      if (row.dataset.actionId === selectedValue) {
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
  var current = event.target;
  if (!current.classList.contains('item') && !current.classList.contains('close-btn')){
    return;
  }
  if (current.classList.contains('item')) {
    current.classList.toggle('checked');
  }
  var allRows = cartRows.querySelectorAll('.cart-row'),
      menuTitle = filterAction.querySelector('.menu-title'),
      checked = filterAction.querySelectorAll('.item.checked');

  if (current.classList.contains('close-btn') || checked.length === 0) {
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
        if (row.dataset.actionId === item.dataset.id) {
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
  var id, actionId;
  if (confirm('Удалить выделенные товары из корзины?')) {
    cartRows.querySelectorAll('.cart-row.checked').forEach(row => {
      cartRows.removeChild(row);
      id = row.dataset.id;
      actionId = row.dataset.actionId;
      if (!cartRows.querySelector(`.cart-row.discount[data-action="${actionId}"]`)) {
/* !!! Фильтр селектом */
        // filterSelect.querySelector(`[value="${actionId}"]`).style.display = 'none';
/* !!! Фильтр чекбоксом */
        filterAction.querySelector(`[data-id="${actionId}"]`).style.display = 'none';
      }
      if (row.classList.contains('bonus')) {
        cartTable.firstChild.removeChild(cartTable.querySelector(`.bonus[data-id="${id}"]`));
      } else {
        cartTable.firstChild.removeChild(cartTable.querySelector(`[data-id="${id}"]`));
        saveCartInfo(id, {qty: 0});
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
        // filterSelect.value = 'all';
        // filterCart();
/* !!! Фильтр чекбоксом */
        filterCart1();
      }
    }
  }
}
