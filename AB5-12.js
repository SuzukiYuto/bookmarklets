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
        alert('ABのBOMを開いてから選択してください。');
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

// 略語→正式名称のマッピングを作成
var abbreviationToHeader = Object.fromEntries(
    Object.entries(headerAbbreviations).map(([key, value]) => [value, key])
);

// 略語を元の名前に逆変換する関数
function getOriginalHeader(abbreviation) {
    return abbreviationToHeader[abbreviation] || abbreviation; // 略語が見つからない場合はそのまま返す
}

// HTMLテーブル生成
var csvContent = '<table border="1" cellpadding=5 style="border-collapse: collapse;">';
csvContent += '<thead><tr><th>AB number</th><th>RowNum</th><th>Item Number</th><th>Label</th><th>Full Name</th><th>Value</th></tr></thead>';
csvContent += '<tbody>';

csvData.forEach(function(rowArray) {
    var rowHtml = '';
    var fullName = '';

    rowArray.forEach(function(field, index) {
        // エスケープ処理
        var value = ('' + field).replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // 4番目（Label列）の次に正式名称列を追加
        if (index === 3) { // Label列に対応
            fullName = getOriginalHeader(value); // 略語を正式名称に変換
            rowHtml += `<td>${value}</td><td>${fullName}</td>`; // Labelと正式名称
        } else {
            rowHtml += `<td>${value}</td>`;
        }
    });

    csvContent += `<tr>${rowHtml}</tr>`;
});

csvContent += '</tbody></table>';

// 結果を出力
console.log(htmlContent);

     

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

    // html header作成
    const date = new Date();

    var htmlContent = '<!DOCTYPE html><html><head><title>' + h2T + '</title>';
    htmlContent += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">';
    htmlContent += '<link rel="stylesheet" href="https://mottie.github.io/tablesorter/css/theme.default.css">';
    htmlContent += '<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>';
    htmlContent += '<script src="https://mottie.github.io/tablesorter/js/jquery.tablesorter.min.js"></script>';
    htmlContent += '</head><body>';
    htmlContent += '<div class="container mt-4">';
    htmlContent += '<h1>AB整形結果</h1>';
    htmlContent += '<p><b>出力日時:</b> ' + date.toLocaleString() + '</p>';


// 指定されたIN値に対応するデータを返す関数
function getDataByIN(targetValue, labels) {
    var result = [];

    // labelsが単一の文字列の場合、配列に変換
    if (!Array.isArray(labels)) {
        labels = [labels];
    }

    Object.keys(SP).forEach(function(rowNum) {
        var data = SP[rowNum].data;

        if (data['IN'] === targetValue) {
            var rowContent = labels.map(label => {
                // ラベルが存在しない場合や値がnullまたは空文字列の場合は<N/A>
                return (data.hasOwnProperty(label) && data[label] && data[label].trim().length > 0)
                    ? data[label]
                    : '-';
            }).join(' | ');

            result.push(rowContent);
        }
    });

    // <br>で改行された文字列として返す
    return isEmpty(result.join('<br>'));
}

// 使用例: data['IN']が特定の値('targetValue')の場合のデータを取得
var matchingData = getDataByIN('AG0000002261','SV');

htmlContent += "<p><b>概要</b>(" + h2T + ")<br>";
htmlContent += "<table border='1' cellpadding='5px' style='border-collapse: collapse;'>";
htmlContent += "<tr><th>項目</th><th>QAT</th><th>CA</th><th>頻度</th><th>ETR</th>";
htmlContent += "<th>GVS</th><th>範囲</th><th>幅</th><th>単位</th><th>CM</th><th>TC2</th><th>判定</th></tr>";

var ids=['AG0000002261','AG0000001114','AG0000001117','AG0000002265','AG0000001251','AG0000001260','AG0000001321','AG0000002301']
var titles=['官能','外観','色調','外観(日)','比重_20/20','屈折率_20℃','重金属（食添）','ヒ素(食添法)']
for(var i = 0; i < ids.length; i++) {
htmlContent += '<TR><TD>' + titles[i] + '<TD>' + getDataByIN(ids[i],'QAT').split(' ')[0] + '</TD>';
htmlContent += '<TD>' + getDataByIN(ids[i],'CA') + '</td>';
htmlContent += '<TD>' + getDataByIN(ids[i],'TF') + '</td>';
htmlContent += '<TD>' + getDataByIN(ids[i],'ETR') + '</td>';
htmlContent += '<TD>' + getDataByIN(ids[i],'GVS') + '</td>';


if (getDataByIN(ids[i],'ETR').includes('Text')){
    htmlContent += '<TD>' + getDataByIN(ids[i],'SV') + '</TD><TD>-</TD>';
}else{
       htmlContent += '<TD>' + getDataByIN(ids[i],'LL') + ' - ' + getDataByIN(ids[i],'UL');
       htmlContent += ' (有効：' + getDataByIN(ids[i],'EDADP') + '桁) ' + '</TD>';
       htmlContent += '<TD>' + parseInt((parseFloat(getDataByIN(ids[i],'UL')) - parseFloat(getDataByIN(ids[i],'LL')))*1000)/1000+ '</TD>';
}
htmlContent += '<TD>' + getDataByIN(ids[i],'USN') + '</TD>';
htmlContent += '<TD>' + getDataByIN(ids[i],'CM') + '</TD>';
htmlContent += '<TD>' + getDataByIN(ids[i],'TC2') + '</TD>';
htmlContent += '<TD><input type="checkbox"></TD></TR>';
}

htmlContent +='</table>'

function getNonMatchingKeys(ids, label) { 
    var result = [];

    Object.keys(SP).forEach(function(rowNum) {
        var data = SP[rowNum].data;

        // キーがids配列に含まれない場合のみ処理
        if (!ids.includes(data['IN'])) {
            // 指定されたラベルに対応する値をチェック
            var value = data[label];
            if (value && value.trim().length > 0) {
                // 値が存在する場合のみ結果に追加
                result.push(value + ' (' + data['IN'] + ')');
            } else {
                // 値が存在しない場合は<N/A>で追加
                result.push(`${rowNum}: <N/A>`);
            }
        }
    });

    return result.join('<br>');
}
// 必要に応じて該当データを表示
    
function isEmpty(str) {
    if (str == null || typeof str === "undefined") {
      return 'なし';
    } else if(str.length===0){return 'なし';}else{return str;}

    return str.trim().length === 0;
  }

    htmlContent += '<p>上記以外の規格項目: ' + isEmpty(getNonMatchingKeys(ids,'DJ'));

    htmlContent += "</p><hr><b>詳細</b><br>"; 
    htmlContent += csvContent
    htmlContent += '<script>$(document).ready(function(){$("table.tablesorter").tablesorter();});</script>';
    htmlContent += '</div></body></html>';

    // 新しいウィンドウにHTMLテーブルを表示
    w.document.write(htmlContent);
})();
