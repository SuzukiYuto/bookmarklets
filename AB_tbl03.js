javascript:(function(){
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
        h2T = h2 ? h2.textContent.trim() : '';

    var csvData = [];
    var rowNumber = 0;
    t.forEach(function(table, tableIndex){
        var rows = Array.from(table.rows);
        var headers = [];
        var headerRowIndex = -1;

        // ヘッダー行を特定し、ヘッダー情報を取得
        for(var i = 0; i < rows.length; i++){
            var row = rows[i];
            var cells = Array.from(row.cells);
            var isHeaderRow = cells.some(function(cell){
                return cell.classList.contains('GMCellHeader');
            });
            if(isHeaderRow){
                var containsItemNumber = cells.some(function(cell){
                    return cell.textContent.trim() === 'Item Number';
                });
                if(containsItemNumber){
                    headerRowIndex = i;
                    break;
                }
            }
        }

        if(headerRowIndex === -1){
            // ヘッダー行が見つからなかった場合、次のテーブルへ
            return;
        }

        // ヘッダーラベルを取得
        var headerRow = rows[headerRowIndex];
        var headerCells = Array.from(headerRow.cells);
        headers = [];
        for(var i = 0; i < headerCells.length; i++){
            var cell = headerCells[i];
            var headerLabel = '';
            if(cell.classList.contains('GMCellHeader')){
                headerLabel = cell.textContent.trim();
            }
            headers.push(headerLabel);
        }

        // データ行の処理
        for(var i = headerRowIndex + 1; i < rows.length; i++){
            var row = rows[i];
            var cells = Array.from(row.cells);
            var itemNumber = '';
            var agCellIndex = -1;
            // 行内で「AG」で始まるセルを探す
            for(var j = 0; j < cells.length; j++){
                var cell = cells[j];
                var cellValue = cell.textContent.trim();
                if(cellValue.startsWith('AG')){
                    itemNumber = cellValue;
                    agCellIndex = j;
                    break;
                }
            }
            if(agCellIndex === -1){
                // 「AG」で始まるセルが見つからなかった場合、次の行へ
                continue;
            }
            // 「AG」セル以降のセルを収集（空欄も含む）
            var dataCells = [];
            for(var j = agCellIndex; j < cells.length; j++){
                var cell = cells[j];
                var cellValue = cell.textContent.trim();
                dataCells.push(cellValue);
            }
            // ヘッダーとデータセルを対応させてCSVに追加
            for(var k = 0; k < dataCells.length; k++){
                var headerIndex = agCellIndex + k;
                var headerLabel = '';
                if(k == 0){
                    headerLabel = 'Item Number';
                } else {
                    headerLabel = headers[headerIndex] || '';
                }
                var cellValue = dataCells[k];
                var csvRow = [h2T, rowNumber + 1, itemNumber, headerLabel, cellValue];
                csvData.push(csvRow);
            }
            rowNumber++;
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
    var w = window.open('', '_blank');
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>CSVデータ</title></head><body>');
    w.document.write('<pre>' + csvContent + '</pre>');
    // CSVファイルをダウンロードできるリンクを追加
    var encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    w.document.write('<a href="'+ encodedUri +'" download="data.csv">CSVファイルをダウンロード</a>');
    w.document.write('</body></html>');
})();
