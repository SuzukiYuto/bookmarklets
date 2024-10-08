var title = document.title;
var table = document.querySelector('table');

if (!table) {
    alert('このページにはテーブルがありません。');
    return;
}

var rows = table.rows;

if (!rows || rows.length === 0) {
    alert('テーブルに行がありません。');
    return;
}

var csvContent = "\uFEFF";

for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].cells;
    if (!cells || cells.length === 0) continue;
    var rowContent = [];
    for (var j = 0; j < cells.length; j++) {
        rowContent.push(cells[j].innerText);
    }
    csvContent += rowContent.join(",") + "\n";
}

var encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
var link = document.createElement("a");
link.setAttribute("href", encodedUri);
link.setAttribute("download", title + ".csv");
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
