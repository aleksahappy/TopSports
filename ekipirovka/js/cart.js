'use strict';

//=====================================================================================================
//  Функции для добавления товаров в корзину:
//=====================================================================================================

// Удаление значения из инпута при его фокусе:

function onFocusInput(input) {
  if (input.value != '') {
    input.value = '';
  }
}

// Установка дефолтного значения в инпут:

function onBlurInput(input) {
  if (input.value == '') {
    input.value = 0;
  }
  changeValue(event);
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


// Изменение информации о выбранном количестве товара и его стоимости:

function changeValue(event) {
  var size = event.currentTarget.closest('.card-size');
  var articul = size.querySelector('.size-articul').textContent.replace('Артикул: ', '');
  var input = size.querySelector('.choice-gty');
  var inputValue = parseInt(input.value);
  var qty = size.querySelector('.card-qty');
  var qtyValue = parseInt(qty.textContent);
  var curPrice = input.dataset.price;

  var totalAmount = getInfo('cartInfo') ? getInfo('cartInfo').totalAmount : 0;
  var totalPrice = getInfo('cartInfo') ? getInfo('cartInfo').totalPrice : 0;

  if (event.currentTarget.value === undefined) {
    var sign = event.currentTarget.textContent;
    if (sign == '-') {
      if (inputValue > 0 ) {
        inputValue--;
      }
    }
    if (sign == '+') {
      if (inputValue < qtyValue) {
        inputValue++;
      }
    }
  } else {
    if (isNaN(inputValue)) {
      inputValue = 0;
    }
    if (inputValue > qtyValue) {
      inputValue = qtyValue;
    }
  }
  input.value = inputValue;

  var change = inputValue - parseInt(input.dataset.value);
  totalAmount = totalAmount + change;
  totalPrice = totalPrice + change * curPrice;

  input.dataset.value = inputValue;
  changeColors(size, inputValue);
  saveSizesInfo(articul, inputValue);
  saveCartInfo(totalAmount, totalPrice);
  changeFullCardInfo();
  changeCartInfo();
}

// Изменение цвета элементов карточки при измении количества выбранных товаров:

function changeColors(size, inputValue) {
  if (inputValue == 0) {
    size.classList.remove('in-cart');
  } else {
    size.classList.add('in-cart');
  }
}

// Сохранение данных о выбранных размерах:

function saveSizesInfo(key, value) {
  var sizesInfo = getInfo('sizesInfo') ? getInfo('sizesInfo') : {};
  sizesInfo[key] = value;
  saveInfo('sizesInfo', sizesInfo);
}

// Сохранение данных о состоянии корзины:

function saveCartInfo(totalAmount, totalPrice) {
  var cartInfo = getInfo('cartInfo')? getInfo('cartInfo') : {};
  cartInfo.totalAmount = totalAmount;
  cartInfo.totalPrice = totalPrice;
  saveInfo('cartInfo', cartInfo);
}

// Изменение информации о выбранном количестве товара и его стоимости в полной карточке товара:

function changeFullCardInfo() {
  var cardSelectInfo = document.querySelector('.full-card .card-selectInfo');
  var sizes = document.querySelectorAll('.full-card .choice-gty');
  var curPrice = sizes[0].dataset.price;
  var amount = document.querySelector('.full-card .select-count');
  var price = document.querySelector('.full-card .select-price');

  var fullCardAmount = 0;
  sizes.forEach(size => fullCardAmount = fullCardAmount + parseInt(size.value));
  var fullCardPrice = fullCardAmount * curPrice;

  amount.textContent = fullCardAmount;
  price.textContent = convertPrice(fullCardPrice);

  if (amount.textContent != 0) {
    cardSelectInfo.style.visibility = 'visible';
  } else {
    cardSelectInfo.style.visibility = 'hidden';
  }
}

// Изменение информации о выбранном количестве товара и его стоимости в информации о состоянии корзины:

function changeCartInfo() {
  if (getInfo('cartInfo')) {
    cartAmount.textContent = getInfo('cartInfo').totalAmount;
    cartPrice.textContent = convertPrice(getInfo('cartInfo').totalPrice);
  }
}

// Функция преобразования цены к формату с пробелами:

function convertPrice(price) {
  return (price + '').replace(/(\d{1,3})(?=((\d{3})*)$)/g, " $1");
}
