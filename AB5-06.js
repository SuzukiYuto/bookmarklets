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
    var headers = []; // 初期化を一度だけ行う

    // ヘッダーラベルとその略語のマッピング
    var headerAbbreviations = {
        'Item Number': 'IN',
        'Item Description': 'ID',
        'Item Description Japanese': 'IDJ',
        'Description Japanese': 'DJ',
        'Specification value': 'SV',
        'Unit_Specification Name': 'USN',
        'Lower Limit': 'LL',
        'Upper Limit': 'UL',
        'Guaranteed value(sales)': 'GVS',
        'Quality Assurance Type': 'QAT',
        'Report frequency': 'RF',
        'Test frequency': 'TF',
        'Test condition 2': 'TC2',
        'Criteria for acceptance': 'CA',
        'Entry type of result': 'ETR',
        'Specification for self recognizing': 'SSR',
        'Comment': 'CM',
        'Effective digit after decimal point': 'EDADP',
        'Test method (Supplier)': 'TM_S',
        'Condition of test method (Supplier)': 'CTM_S',
        'Frequency (Supplier)': 'F_S',
        'Unit': 'U',
        'Item (Supplier)': 'I_S'
    };

    // ヘッダー行を特定し、ヘッダー情報を取得
    for(var tableIndex = 0; tableIndex < t.length; tableIndex++){
        var table = t[tableIndex];
        var rows = Array.from(table.rows);
        for(var i = 0; i < rows.length; i++){
            var row = rows[i];
            var cells = Array.from(row.cells);
            var isHeader = row.classList.contains('GMHeaderRow') || cells.some(function(cell){ return cell.classList.contains('GMCellHeader') });
            if(isHeader){
                // "Item Number"があるか評価
                var itemNumberIndex = -1;
                for(var j = 0; j < cells.length; j++){
                    var cellText = cells[j].textContent.trim();
                    if(cellText === 'Item Number'){
                        itemNumberIndex = j;
                        break;
                    }
                }
                if(itemNumberIndex !== -1){
                    // "Item Number"以降のセルをheadersに格納
                    headers = cells.slice(itemNumberIndex).map(function(cell){
                        var headerLabel = '';
                        // cell内の<span>または<img>を探す
                        var headerElement = cell.querySelector('span[title], img[title]');
                        if(headerElement){
                            headerLabel = headerElement.getAttribute('title').trim();
                        } else {
                            headerLabel = cell.textContent.trim();
                        }
                        // ヘッダーラベルを略語に置き換え
                        return headerAbbreviations[headerLabel] || headerLabel;
                    });
                    break; // ヘッダー行は一つだけと仮定
                }
            }
        }
        if(headers.length > 0){
            break; // ヘッダーが見つかったらループを抜ける
        }
    }

    // "Item Number"を含まない場合は処理を終了
    if(headers.indexOf('IN') === -1){
        alert('"Item Number"を含むヘッダーが見つかりませんでした。');
        return;
    }

    // データ行の処理
    for(var tableIndex = 0; tableIndex < t.length; tableIndex++){
        var table = t[tableIndex];
        var rows = Array.from(table.rows);
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
            var headerIndex = 0; // ヘッダーのインデックスを初期化
            for(var j = startIndex; j < cells.length; j++, headerIndex++){
                var cell = cells[j];
                var cellValue = cell.value !== undefined ? cell.value.trim() : cell.textContent.trim();
                if(cellValue === ''){
                    continue; // セルの値がない場合は無視
                }
                var headerLabel = headers[headerIndex] || ''; // 対応するヘッダーを取得
                var csvRow = [h2T, rowNumber, itemNumber, headerLabel, cellValue];
                csvData.push(csvRow);
            }
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
    
    // csvDataを行番号ごとに整理
    var SP = {};
    csvData.forEach(function(row){
        // ヘッダー情報の行はスキップ
        if(row[0] === 'ヘッダー情報'){
            return;
        }
        var h2T = row[0];
        var rowNum = row[1];
        var itemNumber = row[2];
        var headerLabel = row[3];
        var cellValue = row[4];

        if(!SP[rowNum]){
            SP[rowNum] = {
                'h2T': h2T,
                'itemNumber': itemNumber,
                'data': {}
            };
        }
        SP[rowNum].data[headerLabel] = cellValue;
    });

    // HTMLテーブルを作成
    var htmlContent = '<!DOCTYPE html><html><head><title>データテーブル</title></head><body>';
    htmlContent += '<table border="1" cellpadding="5" cellspacing="0">';
    htmlContent += '<tr><th>' + h2T + '</th><th>Special</th></tr>';

    // SPを用いてデータを表示
    Object.keys(SP).forEach(function(rowNum){
        var data = SP[rowNum].data;

        htmlContent += '<tr><td>';
        htmlContent += (data['DJ'] || '') + '</br>';
        htmlContent += (data['LL'] || '') + ' - ' + (data['UL'] || '') + '</br>';
        htmlContent += (data['SV'] || '') + '</br>';        
        htmlContent += (data['QAT'] || '') + '</br>';        
        htmlContent += '</td><td>' + (data['CM'] || '') + '</td>';
        htmlContent += '</tr>';
    });

    htmlContent += '</table>';
    htmlContent += csvContent
    htmlContent += '</body></html>';

    // 新しいウィンドウにHTMLテーブルを表示
    w.document.write(htmlContent);
})();
