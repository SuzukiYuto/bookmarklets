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
       t.forEach(function(table){
        var rows = Array.from(table.rows);
        var itemNumber = '';
        var headers = [];
        var itemNumberIndex = -1; // 'Item Number'の列インデックス
        // ヘッダー行を特定し、ヘッダー情報を取得
        for(var i = 0; i < rows.length; i++){
            var row = rows[i];
            var cells = Array.from(row.cells);
            var isHeader = cells.some(function(cell){ return cell.classList.contains('GMCellHeader') });
            if(isHeader){
                headers = cells.map(function(cell){
                    return cell.textContent.trim();
                });
                // 'Item Number'の列インデックスを取得
                itemNumberIndex = headers.indexOf('Item Number');
                break; // ヘッダー行は一つだけと仮定
            }
        }
        if(itemNumberIndex === -1){
            // 'Item Number'列が見つからなかった場合、次のテーブルへ
            return;
        }
        // データ行の処理
        for(var i = 0; i < rows.length; i++){
            var row = rows[i];
            var cells = Array.from(row.cells);
            var isHeader = cells.some(function(cell){ return cell.classList.contains('GMCellHeader') });
            if(isHeader){
                continue; // ヘッダー行はスキップ
            }
            // セルの値がない場合は無視
            var hasValue = cells.some(function(cell){
                var cellValue = cell.value !== undefined ? cell.value.trim() : cell.textContent.trim();
                return cellValue !== '';
            });
            if(!hasValue){
                continue;
            }
            // データ行の処理
            rowNumber++;
            // itemNumberを取得
            if(itemNumberIndex >= 0 && itemNumberIndex < cells.length){
                itemNumber = cells[itemNumberIndex].textContent.trim();
            } else {
                itemNumber = ''; // 該当セルがない場合は空文字列
            }
            cells.forEach(function(cell, index){
                var cellValue = cell.value !== undefined ? cell.value.trim() : cell.textContent.trim();
                if(cellValue === ''){
                    return; // セルの値がない場合は無視
                }
                var headerLabel = headers[index] || ''; // 対応するヘッダーを取得
                var csvRow = [h2T, rowNumber, itemNumber, headerLabel, cellValue];
                csvData.push(csvRow);
            });
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
