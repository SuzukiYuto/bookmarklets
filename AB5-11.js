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
        var wrapper = document.querySelector('#header_tab_wrapper');
　　var paragraphs = wrapper.querySelectorAll('p');
　　var innerTexts = Array.from(paragraphs).map(p => p.innerText);
　　
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

    // 略語を取得する関数（部分一致対応）
    function getAbbreviation(headerLabel){
        for (var key in headerAbbreviations){
            if(headerLabel.includes(key)){
                return headerAbbreviations[key];
            }
        }
        return headerLabel; // 略語が見つからない場合は元のラベルを返す
    }

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
                    if(cellText.includes('Item Number')){
                        itemNumberIndex = j;
                        break;
                    }
                }
                if(itemNumberIndex !== -1){
                    // "Item Number"以降のセルをheadersに格納
                    headers = cells.slice(itemNumberIndex).map(function(cell){
                        var headerLabel = '';
                        // cell内の<span>タグのみを探す
                        var headerElement = cell.querySelector('span[title]');
                        if(headerElement){
                            headerLabel = headerElement.getAttribute('title').trim();
                        } else {
                            headerLabel = cell.textContent.trim();
                        }
                        // ヘッダーラベルを略語に置き換え（部分一致）
                        return getAbbreviation(headerLabel);
                    });
                    break; // ヘッダー行は一つだけと仮定
                }
            }
        }
        if(headers.length > 0){
            break; // ヘッダーが見つかったらループを抜ける
        }
    }

    // "Item Number"を含むヘッダーがない場合は、headersのすべての文字列を表示
    if(headers.indexOf('IN') === -1){
        alert('ヘッダーに"Item Number"が見つかりませんでした。\n取得したヘッダー一覧:\n' + headers.join(', '));
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
    var csvContent = '<u>h2T,RowNum,Item Number,Label,value</u><br>\n';
    csvData.forEach(function(rowArray){
        var row = rowArray.map(function(field){
            var value = ('' + field).replace(/"/g, '""');
            if(value.search(/("|,|\n)/g) >= 0){
                value = '"' + value + '"';
            }
            return value;
        }).join(',');
        csvContent += row + '<br>\n';
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
    const getFormattedDate = (date) => {
  　return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  　　});
　　};


   function chk(ItemNumber, headerLabel, reportlabel) {
    var itemNumbers = ItemNumber.split(';');
    var headerLabels = headerLabel.split(';');
    var results = [];

    for(var i = 0; i < itemNumbers.length; i++) {
        var iNumber = itemNumbers[i];
        var valuesPerHeaderLabel = [];
        for(var j = 0; j < headerLabels.length; j++) {
            var hLabel = headerLabels[j];
            var values = [];
            for(var k = 0; k < csvData.length; k++) {
                var row = csvData[k];
                if(row[2] === iNumber && row[3] === hLabel) {
                    values.push(row[4]);
                }
            }
            if(values.length === 0) {
                values.push('not found');
            }
            // 各 headerLabel の値を '<br>' で連結
            var valueStr = values.join('<br>');
            valuesPerHeaderLabel.push(valueStr);
        }
        // headerLabel が複数の場合は ' - ' で連結
        var combinedValue = headerLabels.length > 1 ? valuesPerHeaderLabel.join(' - ') : valuesPerHeaderLabel.join('');
        results.push(combinedValue);
    }

    // ItemNumber が複数の場合は ', ' で連結
    var resultStr = itemNumbers.length > 1 ? results.join(', ') : results.join('');
    return reportlabel + ': ' + resultStr;
}

    // html header作成
    const date = new Date();

    var htmlContent = '<!DOCTYPE html><html><head><title>' + h2T + '</title>';
    htmlContent += '<style>.aaa {background-color: #4d9bc1;color: #fff;padding: 0 0.1em;} .bbb {background-color: #4d1bc1;color: #fff;padding: 0 0.1em;}</style></head><body>';
    htmlContent += '<b>AB整形結果：</b><br>Output Date: ' + getFormattedDate(date) + '<br>';
    htmlContent += innerTexts ;
    
    htmlContent += "<P><b>概要</b>(" + h2T + ")<br>"; 
    
     htmlContent += chk('AG0000002261', 'SV', '官能') + "<br>";
     htmlContent += chk('AG0000001114;AG0000001117', 'SV', '外観') + "<br>";
     htmlContent += chk('AG0000002265', 'SV', '外観(日)') + "<br>";
      htmlContent += chk('AG0000001251', 'LL;UL', '比重20℃') + "<br>";
       htmlContent += chk('AG0000001260', 'LL;UL', '屈折20℃') + "<br>";
     htmlContent += chk('AG0000001321', 'LL;UL', '重金属') + chk('AG0000001321', 'USN', '') + "<br>";
    htmlContent += chk('AG0000002301', 'LL;UL', 'ヒ素') + chk('AG0000002301', 'USN', '') +  "<br>";
    htmlContent += "GB: (未実装、手動確認ください)" + "<br>";
    htmlContent += "それ以外: (実装予定)" + "<br></P>";
   
    htmlContent += "<hr><b>詳細</b><br>"; 
    
    //table
    
    htmlContent += '<table border="1" cellpadding="5" cellspacing="0">';
    htmlContent += '<tr><th></th><th>' + h2T + '</th><th>Value</th><th>Comment etc.</th></tr>';

    // SPを用いてデータを表示
    Object.keys(SP).forEach(function(rowNum){
        var data = SP[rowNum].data;

        // デフォルトの背景色を設定
        var bgColor = 'white';

        // data['IN']の値によって背景色を変更
        if (data['QAT']) {
            if (data['QAT'].startsWith('In')) {
                style_str = 'aaa';
            } else if (data['QAT'].startsWith('St')) {
                style_str = 'bbb';
            }
            // 他の条件も追加可能
        }

        htmlContent += '<tr><td>' + rowNum + '</TD><TD>';
        htmlContent += (data['IN'] || '') + '</TD><TD>';
        htmlContent += '[<span class=' + style_str +'>' + (data['QAT'] || '') + '</span>] <b>' + (data['DJ'] || '') + '</b></br>';
        htmlContent += (data['ETR'] || '') + ' | ' +(data['LL'] || '') + ' - ' + (data['UL'] || '')  + ' (' + (data['EDADP'] || '') + ')' + (data['USN'] || '') + ', ';
        htmlContent += (data['SV'] || '') + '<br>';        
        htmlContent += (data['TF'] || '') + ' | '; 
        htmlContent += (data['QAT'] || '') + ' | '; 
        htmlContent += (data['GVS'] || '') + ' | '; 
        htmlContent += (data['TC2'] || '') + '<br>';      
        htmlContent += '</td><td>' + (data['CM'] || '') + '</td>';
        htmlContent += '</tr>';
    });

    htmlContent += '</table><p></p>';
    htmlContent += csvContent
    htmlContent += '</body></html>';

    // 新しいウィンドウにHTMLテーブルを表示
    w.document.write(htmlContent);
})();
