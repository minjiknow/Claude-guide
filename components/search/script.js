/**
 * search/script.js
 */

$(function () {
  initSearch();
});

function initSearch() {
  $('.search').on('submit', function (e) {
    e.preventDefault();
    var keyword = $(this).find('.searchInput').val().trim();
    if (!keyword) return;
    console.log('검색어:', keyword);
  });
}
