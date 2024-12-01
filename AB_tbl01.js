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
            // 行全体のテキストを合計して、文字数をチェック
            var rowTextLength = cells.reduce(function(acc, cell){
                return acc + cell.textContent.trim().length;
            }, 0);
            if(rowTextLength >= 10){
                headerRowIndex = i;
                break;
            }
        }

        if(headerRowIndex === -1){
            // ヘッダー行が見つからなかった場合、次のテーブルへ
            return;
        }

        var headerRow = rows[headerRowIndex];
        var headerCells = Array.from(headerRow.cells);
        var startHeaderIndex = -1; // "Item Number"があるセルのインデックス

        // colspanを無視してヘッダーラベルを取得
        for(var i = 0; i < headerCells.length; i++){
            var cell = headerCells[i];
            var headerLabel = cell.textContent.trim();
            if(headerLabel === 'Item Number' && startHeaderIndex === -1){
                startHeaderIndex = i;
            }
            headers.push(headerLabel);
        }

        // "Item Number"が見つかった場合、ヘッダーをスライス
        if(startHeaderIndex !== -1){
            headers = headers.slice(startHeaderIndex);
        } else {
            // "Item Number"が見つからなかった場合、全ヘッダーを使用
            startHeaderIndex = 0;
        }

        // ヘッダー情報をCSVに追加
        var headerCsvRow = ['ヘッダー情報', '', '', '', ''].concat(headers);
        csvData.push(headerCsvRow);

        // データ行の処理
        for(var i = headerRowIndex + 1; i < rows.length; i++){
            var row = rows[i];
            var cells = Array.from(row.cells);
            var itemNumber = '';
            var startDataIndex = -1;
            // 左から順にセルを確認し、「AG」で始まるセルを探す
            for(var j = 0; j < cells.length; j++){
                var cell = cells[j];
                var cellValue = cell.textContent.trim();
                if(cellValue.startsWith('AG') && startDataIndex === -1){
                    itemNumber = cellValue;
                    startDataIndex = j;
                    // 「AG」で始まるセルのラベルを「Item Number」に設定
                    headers[0] = 'Item Number';
                    break;
                }
            }
            if(startDataIndex === -1){
                // 「AG」で始まるセルが見つからなかった場合、次の行へ
                continue;
            }
            // データセルの収集
            var dataCells = [];
            for(var j = startDataIndex; j < cells.length; j++){
                var cell = cells[j];
                var cellValue = cell.textContent.trim();
                dataCells.push(cellValue);
            }
            // ヘッダーとデータセルを対応させてCSVに追加
            for(var k = 0; k < dataCells.length; k++){
                var headerLabel = headers[k] || '';
                rowNumber++;
                var csvRow = [h2T, rowNumber, itemNumber, headerLabel, dataCells[k]];
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
    var w = window.open('', '_blank');
    w.document.write('<!DOCTYPE html><html><head><title>CSVデータ</title></head><body>');
    w.document.write('<pre>' + csvContent + '</pre>');
    // CSVファイルをダウンロードできるリンクを追加
    var encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    w.document.write('<a href="'+ encodedUri +'" download="data.csv">CSVファイルをダウンロード</a>');
    w.document.write('</body></html>');
})();
