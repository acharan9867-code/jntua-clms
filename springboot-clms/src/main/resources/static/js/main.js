/**
 * JNTUA CLMS — Main JS
 * Author: Charan Apilagunta | JNTUA CSE
 */

// Confirmation dialogs for destructive actions
document.querySelectorAll('.confirm-action').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    var msg = this.getAttribute('data-msg') || 'Are you sure?';
    if (!confirm(msg)) {
      e.preventDefault();
      return false;
    }
  });
});

// Auto-dismiss alerts after 5 seconds
setTimeout(function () {
  document.querySelectorAll('.alert.alert-success, .alert.alert-info').forEach(function (el) {
    var bsAlert = new bootstrap.Alert(el);
    bsAlert.close();
  });
}, 5000);

// Search input debounce
(function () {
  var searchInput = document.querySelector('input[name="keyword"]');
  if (!searchInput) return;
  var timer;
  searchInput.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      // Auto-submit search form after 600ms pause
      searchInput.closest('form').submit();
    }, 600);
  });
})();

// Highlight overdue rows
document.querySelectorAll('.table tbody tr').forEach(function (row) {
  var dueCell = row.querySelector('.due-date');
  if (!dueCell) return;
  var dueDate = new Date(dueCell.textContent.trim());
  if (!isNaN(dueDate) && dueDate < new Date()) {
    row.classList.add('table-danger');
  }
});

console.log('JNTUA CLMS | Designed by Charan Apilagunta');
