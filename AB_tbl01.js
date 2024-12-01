(function(){
    // ご提供のHTMLテーブルをパースしてDOMに変換
    var parser = new DOMParser();
    var doc = parser.parseFromString(`YOUR_HTML_TABLE_STRING_HERE`, 'text/html');
    var table = doc.querySelector('tbody');

    var h2T = ''; // ヘッダー情報がないため空文字列を使用
    var csvData = [];
    var headers = [];
    var rows = Array.from(table.rows);

    // ヘッダー行を特定し、ヘッダー情報を取得
    // 最初の<tr>がヘッダーと仮定
    var headerRow = rows[0];
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
    for(var i = 1; i < rows.length; i++){ // ヘッダー行を除く
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
            var csvRow = [h2T, i, itemNumber, headerLabel, dataCells[k]];
            csvData.push(csvRow);
        }
    }
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
