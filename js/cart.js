'use strict';

//=====================================================================================================
//  Функции добавления товаров в корзину:
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
    changeValue(event);
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


// Изменение информации о выбранном количестве товара и его стоимости:

function changeValue(objectId) {
  var card = event.currentTarget.closest('.card'),
      size = event.currentTarget.closest('.card-size'),
      articul = size.querySelector('.size-articul').textContent.replace('Артикул: ', ''),
      input = size.querySelector('.choice-gty'),
      inputValue = parseInt(input.value),
      qty = size.querySelector('.card-qty'),
      qtyValue = parseInt(qty.textContent);

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
  input.dataset.value = inputValue;

  changeColors(size, inputValue);
  changeCard(card);
  saveCartInfo(articul, inputValue, objectId);
  renderCart();
}

// Изменение цвета элементов карточки при измении количества выбранных товаров:

function changeColors(size, inputValue) {
  if (inputValue == 0) {
    size.classList.remove('in-cart');
  } else {
    size.classList.add('in-cart');
  }
}

// Изменение информации о выбранном количестве товара и его стоимости в карточке товара:

function changeCard(card) {
  var selectInfo = card.querySelector('.card-select-info'),
      sizes = card.querySelectorAll('.choice-gty'),
      curPrice = sizes[0].dataset.price,
      amount = card.querySelector('.select-count'),
      price = card.querySelector('.select-price');

  var totalAmount = 0;
  sizes.forEach(size => totalAmount += parseInt(size.value));
  var totalPrice = totalAmount * curPrice;

  amount.textContent = totalAmount;
  price.textContent = convertPrice(totalPrice);

  if (amount.textContent != 0) {
    selectInfo.style.visibility = 'visible';
  } else {
    selectInfo.style.visibility = 'hidden';
  }
}

// Сохранение данных о состоянии корзины:

function saveCartInfo(articul, value, objectId) {
  var cartInfo = getInfo(`cartInfo_${pageId}`)? getInfo(`cartInfo_${pageId}`) : {};
  if (value == 0) {
    delete cartInfo[articul];
  } else {
    if (!cartInfo[articul]) {
      cartInfo[articul] = {};
    }
    cartInfo[articul].qty = value;
    cartInfo[articul].objectId = objectId;
  }
  saveInfo(`cartInfo_${pageId}`, cartInfo);
}
