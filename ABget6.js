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
            // 行全体のテキストを合計して、文字数をチェック
            var rowTextLength = cells.reduce(function(acc, cell){
                var cellText = cell.textContent.trim();
                return acc + cellText.length;
            }, 0);
            if(isHeader && rowTextLength >= 10){
                var headerIndex = 0;
                cells.forEach(function(cell){
                    var headerLabel = '';
                    var colspan = cell.getAttribute('colspan');
                    colspan = colspan ? parseInt(colspan) : 1;
                    // cell内の<span>または<img>を探す
                    var headerElement = cell.querySelector('span[title], img[title]');
                    if(headerElement){
                        headerLabel = headerElement.getAttribute('title').trim();
                    } else {
                        headerLabel = cell.textContent.trim();
                    }
                    // colspanを考慮してheaders配列にヘッダーラベルを追加
                    for(var k = 0; k < colspan; k++){
                        headers.push(headerLabel);
                        headerIndex++;
                    }
                });
                break; // ヘッダー行は一つだけと仮定
            }
        }
        // ヘッダー情報を取得できなかった場合、次のテーブルへ
        if(headers.length === 0){
            return;
        }
        // ヘッダー情報をCSVに追加
        var headerRow = ['ヘッダー情報', '', '', '', '']; // ヘッダー情報の識別子として'ヘッダー情報'を追加
        headers.forEach(function(header){
            headerRow.push(header);
        });
        csvData.push(headerRow);
        // データ行の処理
        for(var i = 0; i < rows.length; i++){
            var row = rows[i];
            var cells = Array.from(row.cells);
            var isHeader = row.classList.contains('GMHeaderRow') || cells.some(function(cell){ return cell.classList.contains('GMCellHeader') });
            // ヘッダー行はスキップ
            if(isHeader){
                continue;
            }
            var itemNumber = '';
            var startIndex = -1;
            var cellIndex = 0;
            // 行内で"AG"で始まるセルを探す
            for(var j = 0; j < cells.length; j++){
                var cell = cells[j];
                var cellValue = cell.textContent.trim();
                var colspan = cell.getAttribute('colspan');
                colspan = colspan ? parseInt(colspan) : 1;
                if(cellValue.startsWith('AG') && startIndex === -1){
                    itemNumber = cellValue;
                    startIndex = cellIndex;
                    // "AG"で始まるセルのヘッダーを"Item Number"に設定
                    if(startIndex < headers.length){
                        headers[startIndex] = "Item Number";
                    }
                }
                cellIndex += colspan;
            }
            if(startIndex === -1){
                // "AG"で始まるセルが見つからなかった場合、次の行へ
                continue;
            }
            // データ行の処理
            rowNumber++;
            cellIndex = 0;
            for(var j = 0; j < cells.length; j++){
                var cell = cells[j];
                var cellValue = cell.value !== undefined ? cell.value.trim() : cell.textContent.trim();
                var colspan = cell.getAttribute('colspan');
                colspan = colspan ? parseInt(colspan) : 1;
                if(cellIndex >= startIndex){
                    if(cellValue === ''){
                        cellIndex += colspan;
                        continue; // セルの値がない場合は無視
                    }
                    var headerLabel = headers[cellIndex] || ''; // 対応するヘッダーを取得
                    var csvRow = [h2T, rowNumber, itemNumber, headerLabel, cellValue];
                    csvData.push(csvRow);
                }
                cellIndex += colspan;
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
