(function(){
    function h(e){
        while(e.parentElement){
            e = e.parentElement;
            if(e.tagName.toLowerCase() === 'div' && e.classList.contains('GMChiled'))
                return true;
        }
        return false;
    }
    var s=document.querySelector('select[name="revSelectName"]');
    if(s){
        var so=s.options[s.selectedIndex];
        var revtext=so.innerText.trim();
    }
    
    var t = Array.from(document.querySelectorAll('table.GMSection')).filter(function(t){ return !h(t) });
    if(t.length === 0){
        alert('ABのBOMを開いてから選択してください。');
        return;
    }

    var titleElement = document.querySelector('title');
    if (titleElement) {
        var titleText = titleElement.textContent;
        var nameMatch = titleText.match(/\(([^)]+)\)/); // ()内の文字列を取得
        if (nameMatch && nameMatch[1]) {
            console.log("Name inside parentheses:", nameMatch[1]);
        } else {
            console.log("No name found inside parentheses.");
        }
    }

    var selectElement = document.querySelector('select[name="TABLE_VIEWS_LIST_3"]');
if (selectElement) {
    var selectedValue = selectElement.value; // 選択された値を取得
    var selectedText = selectElement.options[selectElement.selectedIndex].text.trim(); // 選択されたテキストを取得

    if (!selectedText.includes("Base View")) {
        alert("Warning: Views is selected to be " + selectedText + ", select 'Base View' and try again..");
        return;
    } else {
        console.log("Selected value is 'Base View'.");
    }
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
        'Target Specification': 'TS',
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
    
    htmlContent += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">'
    htmlContent += '<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.2/dist/js/bootstrap.bundle.min.js"></script>'
    htmlContent += '<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>';
    htmlContent += '<script src="https://mottie.github.io/tablesorter/js/jquery.tablesorter.min.js"></script>';
    htmlContent += '<style> .container {max-width: 100% !important;}</style></head><body>';
    htmlContent += '<div class="container lg">';
    htmlContent += '<b>Rev.:</b> ' + revtext + ',&#009;';
    htmlContent += '<b>Operator: </b>' + nameMatch[1] + ',&#009;';
    htmlContent += '<b>出力日時:</b> ' + date.toLocaleString() + '&#009;';
    htmlContent += '<hr style="width: 100%; border: 1px solid #ccc;">';


// 指定されたIN値に対応するデータを返す関数
function getDataByIN(targetValue, labels) {
    var result = [];

    // targetValueをカンマで分割して配列に変換
    var targetValues = targetValue.split(',');

    // labelsが単一の文字列の場合、配列に変換
    if (!Array.isArray(labels)) {
        labels = [labels];
    }

    Object.keys(SP).forEach(function(rowNum) {
        var data = SP[rowNum].data;

        // targetValuesの中から最初に一致する値を探す
        var matchingValue = targetValues.find(tv => data['IN'] === tv);

        if (matchingValue) {
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

htmlContent += "<p><H1>Specification</b> (" ;
htmlContent += innerTexts.join(' ').split(" • ")[1].split("_")[0] +" > ";
htmlContent += h2T + ")</h1><div class='container-fluid'>";
htmlContent += "<table class='table table-bordered table-striped w-100'>";

// ヘッダー配列
var headers = [
    "項目", "QAT", "TS", "CA", "頻度", "ETR", 
    "GVS", "範囲", "幅", "単位", "CM", "TC2", "Item Num", "判定"
];

// ヘルプ配列（各ヘッダーに対応）
var helpTexts = [
    "項目の説明", "品質保証タイプ", "テスト条件", "受け入れ基準", "頻度の説明", "結果入力の種類",
    "保証値", "許容範囲", "幅の説明", "単位の説明", "コメント", "テスト条件2", "アイテム番号", "判定条件"
];

// HTML生成
htmlContent += "<tr>";
    headers.forEach((header, index) => {
        var helpText = helpTexts[index] || "";
        htmlContent += `<th data-toggle="tooltip" data-placement="top" title="${helpText}">${header}</th>`;
    });
    htmlContent += "</tr>";

var ids=['AG0000002261,AG0000002447','AG0000001114','AG0000001117','AG0000002265','AG0000001251','AG0000001260','AG0000001321','AG0000002301']
var titles=['官能','外観','色調','外観(日)','比重_20/20','屈折率_20℃','重金属（食添）','ヒ素(食添法)']
for(var i = 0; i < ids.length; i++) {

htmlContent += '<TR><TD>' + titles[i] + '</TD>';
if (getDataByIN(ids[i],'IN').length < 3){htmlContent += '<TD colspan=11>設定なし</td><td>'  + ids[i] + '</td>';} 
else { 
htmlContent += '<TD>' + getDataByIN(ids[i],'QAT').split(' ')[0] + '</TD>';
htmlContent += '<TD>' + getDataByIN(ids[i],'TS') + '</TD>';
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
htmlContent += '<TD>' + getDataByIN(ids[i],'IN') + '</TD>';
    }
htmlContent += '<TD><input type="checkbox"></TD></TR>';
}

// idsを延べた
var ids_temp=['AG0000002261','AG0000002447','AG0000001114','AG0000001117','AG0000002265','AG0000001251','AG0000001260','AG0000001321','AG0000002301']

htmlContent +=  isEmptytbl(getNonMatchingKeys(ids_temp,'DJ'));
htmlContent +='</table></div>'
htmlContent += "</p><hr style='width: 100%; border: 1px solid #ccc;'>";
htmlContent += "<button class='btn btn-primary btn-sm' onclick='toggleDetails()'>全データ表示/非表示</button><br>";
htmlContent += "<div id='details-section' style='display:none;'>";
htmlContent += csvContent;
htmlContent += "</div>";
htmlContent += "<script>$(document).ready(function(){$('table.tablesorter').tablesorter();});";
htmlContent += "function toggleDetails() { var details = document.getElementById('details-section');";
htmlContent += "details.style.display = (details.style.display === 'none') ? 'block' : 'none'; }</script>";
htmlContent += "</div></body></html>";


// 新しいウィンドウにHTMLテーブルを表示
w.document.write(htmlContent);
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

function getNonMatchingKeys(ids, label) { 
    var result = [];

    // idsをカンマで分割して配列に変換
    var idList = Array.isArray(ids) ? ids : ids.split(',');

    Object.keys(SP).forEach(function(rowNum) {
        var data = SP[rowNum].data;
        var rowContent ="";

        // idListの中にdata['IN']が含まれていない場合のみ処理
        var isMatching = idList.some(id => id === data['IN']);
        
        
        if (!isMatching) {
            var rowContent = `<TR><TD>${data['DJ']}</TD>`;
            rowContent += `<TD>${getDataByIN(data['IN'],'QAT').split(' ')[0]}</TD>`;
            rowContent += `<TD>${getDataByIN(data['IN'],'TS')}</TD>`;
            rowContent += `<TD>${getDataByIN(data['IN'],'CA')}</TD>`;
            rowContent += `<TD>${getDataByIN(data['IN'],'TF')}</TD>`;
            rowContent += `<TD>${getDataByIN(data['IN'],'ETR')}</TD>`;
            rowContent += `<TD>${getDataByIN(data['IN'],'GVS')}</TD>`;

            if (getDataByIN(data['IN'],'ETR').includes('Text')) {
                rowContent += `<TD>${getDataByIN(data['IN'],'SV')}</TD><TD>-</TD>`;
            } else {
                rowContent += `<TD>${getDataByIN(data['IN'],'LL')} - ${getDataByIN(data['IN'],'UL')} (有効：${getDataByIN(data['IN'],'EDADP')}桁)</TD>`;
                rowContent += `<TD>${parseInt((parseFloat(getDataByIN(data['IN'],'UL')) - parseFloat(getDataByIN(data['IN'],'LL')))*1000)/1000}</TD>`;
            }
            rowContent += `<TD>${getDataByIN(data['IN'],'USN')}</TD>`;
            rowContent += `<TD>${getDataByIN(data['IN'],'CM')}</TD>`;
            rowContent += `<TD>${getDataByIN(data['IN'],'TC2')}</TD>`;
            rowContent += `<TD>${getDataByIN(data['IN'],'IN')}</TD>`;
            rowContent += `<TD><input type="checkbox"></TD>`;
            ids.push(data['IN'])
            result.push(rowContent);
           
        }
        

        // dataに含まれるすべてのキーと値をテーブル形式で追加

    });
    return result.join('');
}
// 必要に応じて該当データを表示
function isEmpty(str) {
    if (str == null || typeof str === "undefined" || str.length === 0) {
        return 'なし';
    }
    return str;
}
function isEmptytbl(str) {
    if (str == null || typeof str === "undefined" || str.length === 0) {
        return '<TR><TD colspan=14>上記以外の規格項目 :  なし</TD></TR>:';
    }
    return '<TR><td colspan=14></td></tr>'+str+'</TR>';
}    


})();
