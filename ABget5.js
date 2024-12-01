(function(){
    function h(e){
        while(e.parentElement){
            e = e.parentElement;
            if(e.tagName.toLowerCase() === 'div' && e.classList.contains('GMChiled'))
                return true;
        }
        return false;
    }
    var t = Array.from(document.querySelectorAll('table.GMSection')).filter(function(t){ return !h(t) });
    if(t.length === 0){
        alert('classが"GMSection"のテーブルが見つかりませんでした。');
        return;
    }
    var h2 = document.querySelector('.column_one.layout h2'),
        h2T = h2 ? h2.textContent.trim() : '',
        w = window.open('', '_blank');
    var csvData = [];
    var rowNumber = 0;


    t.forEach(function(table, tableIndex){
        var rows = Array.from(table.rows);
        var headers = [];
 // ヘッダー行を特定し、ヘッダー情報を取得
        for(var i = 0; i < rows.length; i++){
            var row = rows[i];
            var cells = Array.from(row.cells);
            var isHeader = row.classList.contains('GMHeaderRow') || cells.some(function(cell){ return cell.classList.contains('GMCellHeader') });
            if(isHeader){
                headers = cells.map(function(cell){
                    var headerLabel = '';
                    // cell内の<span>または<img>を探す
                    var headerElement = cell.querySelector('span[title], img[title]');
                    if(headerElement){
                        headerLabel = headerElement.getAttribute('title').trim();
                    } else {
                        headerLabel = cell.textContent.trim();
                    }
                    return headerLabel;
                });
                break; // ヘッダー行は一つだけと仮定
            }
        }
        // ヘッダー情報をCSVに追加
        if(headers.length > 0){
            var headerRow = ['ヘッダー情報', '', '', '', '']; // ヘッダー情報の識別子として'ヘッダー情報'を追加
            headers.forEach(function(header){
                headerRow.push(header);
            });
            csvData.push(headerRow);
        }
        // データ行の処理
        for(var i = 0; i < rows.length; i++){
            var row = rows[i];
            var cells = Array.from(row.cells);
            var isHeader = cells.some(function(cell){ return cell.tagName.toLowerCase() === 'th' || cell.classList.contains('GMCellHeader') });
            if(isHeader){
                continue; // ヘッダー行はスキップ
            }
            var itemNumber = '';
            var startIndex = -1;
            // 行内で"AG"で始まるセルを探す
            for(var j = 0; j < cells.length; j++){
                var cellValue = cells[j].textContent.trim();
                if(cellValue.startsWith('AG')){
                    itemNumber = cellValue;
                    startIndex = j;
                    break;
                }
            }
            if(startIndex === -1){
                // "AG"で始まるセルが見つからなかった場合、次の行へ
                continue;
            }
            // データ行の処理
            rowNumber++;
            for(var j = startIndex; j < cells.length; j++){
                var cell = cells[j];
                var cellValue = cell.value !== undefined ? cell.value.trim() : cell.textContent.trim();
                if(cellValue === ''){
                    continue; // セルの値がない場合は無視
                }
                var headerLabel = headers[j] || ''; // 対応するヘッダーを取得
                var csvRow = [h2T, rowNumber, itemNumber, headerLabel, cellValue];
                csvData.push(csvRow);
            }
        }
    });




    // CSV文字列を作成
    var csvContent = 'h2T,行番号,Item Number,ラベル,セルの値\n';
    csvData.forEach(function(rowArray){
        var row = rowArray.map(function(field){
            var value = ('' + field).replace(/"/g, '""');
            if(value.search(/("|,|\n)/g) >= 0){
                value = '"' + value + '"';
            }
            return value;
        }).join(',');
        csvContent += row + '\n';
    });
    // 新しいウィンドウにCSVデータを表示
    w.document.write('<!DOCTYPE html><html><head><title>CSVデータ</title></head><body>');
    w.document.write('<pre>' + csvContent + '</pre>');
    // CSVファイルをダウンロードできるリンクを追加
    var encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    w.document.write('<a href="'+ encodedUri +'" download="data.csv">CSVファイルをダウンロード</a>');
    w.document.write('</body></html>');
})();
