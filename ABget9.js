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
    var discardedData = []; // 破棄された行のデータを格納する配列
    var rowNumber = 0;
    t.forEach(function(table, tableIndex){
        var rows = Array.from(table.rows);
        var headers = [];
        var startHeaderIndex = -1; // "Item Number"があるセルのインデックス
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
                var foundItemNumber = false;
                for(var j = 0; j < cells.length; j++){
                    var cell = cells[j];
                    var headerLabel = '';
                    // cell内の<span>または<img>を探す
                    var headerElement = cell.querySelector('span[title], img[title]');
                    if(headerElement){
                        headerLabel = headerElement.getAttribute('title').trim();
                    } else {
                        headerLabel = cell.textContent.trim();
                    }
                    // "Item Number"が見つかった場合、開始インデックスを設定
                    if(headerLabel === 'Item Number' && startHeaderIndex === -1){
                        startHeaderIndex = headerIndex;
                        foundItemNumber = true;
                    }
                    headers.push(headerLabel);
                    headerIndex++;
                }
                // "Item Number"が見つかった場合、ヘッダーをスライス
                if(foundItemNumber && startHeaderIndex !== -1){
                    headers = headers.slice(startHeaderIndex);
                } else {
                    // "Item Number"が見つからなかった場合、次のテーブルへ
                    headers = [];
                }
                break; // ヘッダー行は一つだけと仮定
            }
        }
        // ヘッダー情報を取得できなかった場合、次のテーブルへ
        if(headers.length === 0){
            return;
        }
        // ヘッダー情報をCSVに追加
        var headerRow = ['ヘッダー情報', '', '', '', ''].concat(headers); // ヘッダー情報の識別子として'ヘッダー情報'を追加
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
            var startDataIndex = -1;
            // 行内で"AG"で始まるセルを探す
            for(var j = 0; j < cells.length; j++){
                var cell = cells[j];
                var cellValue = cell.textContent.trim();
                if(cellValue.startsWith('AG') && startDataIndex === -1){
                    itemNumber = cellValue;
                    startDataIndex = j;
                    break;
                }
            }
            if(startDataIndex === -1){
                // "AG"で始まるセルが見つからなかった場合、行を破棄データとして保存
                discardedData.push(cells.map(function(cell){ return cell.textContent.trim(); }));
                continue;
            }
            // データ行の処理
            rowNumber++;
            var dataCells = [];
            for(var j = startDataIndex; j < cells.length; j++){
                var cell = cells[j];
                var cellValue = cell.value !== undefined ? cell.value.trim() : cell.textContent.trim();
                if(cellValue === ''){
                    continue; // セルの値がない場合は無視
                }
                var headerLabel = headers[j - startDataIndex] || '';
                var csvRow = [h2T, rowNumber, itemNumber, headerLabel, cellValue];
                csvData.push(csvRow);
                dataCells.push(cellValue);
            }
            if(dataCells.length === 0){
                // データがない場合、行を破棄データとして保存
                discardedData.push(cells.map(function(cell){ return cell.textContent.trim(); }));
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
    // 破棄された行のデータをCSVに追加
    if(discardedData.length > 0){
        csvContent += '\n破棄された行のデータ:\n';
        discardedData.forEach(function(rowArray){
            var row = rowArray.map(function(field){
                var value = ('' + field).replace(/"/g, '""');
                if(value.search(/("|,|\n)/g) >= 0){
                    value = '"' + value + '"';
                }
                return value;
            }).join(',');
            csvContent += row + '\n';
        });
    }
    // 新しいウィンドウにCSVデータを表示
    w.document.write('<!DOCTYPE html><html><head><title>CSVデータ</title></head><body>');
    w.document.write('<pre>' + csvContent + '</pre>');
    // CSVファイルをダウンロードできるリンクを追加
    var encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    w.document.write('<a href="'+ encodedUri +'" download="data.csv">CSVファイルをダウンロード</a>');
    w.document.write('</body></html>');
})();
