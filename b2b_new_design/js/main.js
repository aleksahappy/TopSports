'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Константы:

var alertsContainer = document.getElementById('alerts-container');

//=====================================================================================================
// Работа с окном уведомлений:
//=====================================================================================================

// Открытие окна уведомлений:

function showMessages() {
  openPopUp(alertsContainer, 'flex');
}

// Закрытие окна уведомлений:

function closeMessages() {
  closePopUp(alertsContainer);
}

//=====================================================================================================
// Работа с таблицами:
//=====================================================================================================

// Выравнивание столбцов таблицы при загрузке:

document.addEventListener('DOMContentLoaded', () => {
  var table = document.querySelector('.table-wrap');
  setTimeout(() => alignTableColumns(table), 10);
});

function alignTableColumns(table) {
  var headCells = table.querySelectorAll('.table-head th');
  headCells.forEach(headCell => {
    var bodyCell = table.querySelector(`.table-body > tr:first-child > td:nth-child(${headCell.id})`),
        headCellWidth = headCell.offsetWidth,
        bodyCellWidth = bodyCell.offsetWidth;
    if (headCellWidth > bodyCellWidth) {
      headCell.style.width = headCellWidth + 'px';
      headCell.style.minWidth = headCellWidth + 'px';
      headCell.style.maxWidth = headCellWidth + 'px';
      bodyCell.style.width = headCellWidth + 'px';
      bodyCell.style.minWidth = headCellWidth + 'px';
      bodyCell.style.maxWidth = headCellWidth + 'px';
    }
    if (headCellWidth < bodyCellWidth) {
      headCell.style.width = bodyCellWidth + 'px';
      headCell.style.minWidth = bodyCellWidth + 'px';
      headCell.style.maxWidth = bodyCellWidth + 'px';
      bodyCell.style.width = bodyCellWidth + 'px';
      bodyCell.style.minWidth = bodyCellWidth + 'px';
      bodyCell.style.maxWidth = bodyCellWidth + 'px';
    }
  });
}

// Изменение ширины столбоцов таблицы пользователем:

(function () {
  var curColumn = null,
      startOffset;

  var resizeBtns = document.querySelectorAll('.resize-btn');

  if (resizeBtns.length > 0) {
    resizeBtns.forEach(el => {
      el.addEventListener('mousedown', (event) => {
        curColumn = event.currentTarget.parentElement;
        console.log(curColumn);
        startOffset = curColumn.offsetWidth - event.pageX;
      });
    });

    document.addEventListener('mousemove', (event) => {
      if (curColumn) {
        var newWidth = startOffset + event.pageX + 'px',
            curTable = curColumn.closest('.table-wrap');
        curColumn.style.width = newWidth;
        curColumn.style.minWidth = newWidth;
        curColumn.style.maxWidth = newWidth;
        curTable.querySelectorAll(`.table-body td:nth-child(${curColumn.id})`).forEach(el => {
          el.style.width = newWidth;
          el.style.minWidth = newWidth;
          el.style.maxWidth = newWidth;
        });
      }
    });

    document.addEventListener('mouseup', () => {
      curColumn = null;
    });
  }
})();
