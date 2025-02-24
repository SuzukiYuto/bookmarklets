(function(){
    // 結果データの配列とdt/ddの各テキストを保存する配列
    var dataRows = [];
    var dtArray = [];
    var ddArray = [];
 
              // importance用のカテゴリを定義
              var importanceCategories = {
                "none": [
                    "",
                ],
                "カルテアップCC": [
                    "col_1001",
                    "col_1081",
                    "col_1084",
                    "col_1002",
                    "col_2027",
                    "col_1420",
                    "col_2494614",
                    "col_2494619",
                    "col_2494621",
                    "col_2495918",
                    "col_2494770",
                    "col_2481671",
                    "col_2481673",
                    "col_2481675",
                    "col_1563",
                    "col_2481682",
                    "col_2494192",
                    "col_1567",
                    "col_1546",
                    "col_2494225",
                    "col_2494245",
                    "col_2494262",
                    "col_1549",
                    "col_1551",
                    "col_1576",
                    "col_1577",
                    "col_2481722",
                    "col_1575",
                    "col_1554",
                    "col_1555",
                    "col_2481735",
                    "col_2491016",
                    "col_1562",
                    "col_2481742",
                    "col_2494744",
                    "col_2000003299"
                ],
                "外販CC": [
                    "col_1001",
                    "col_1081",
                    "col_1084",
                    "col_1002",
                    "col_2027",
                    "col_1420",
                    "col_2494614",
                    "col_2494619",
                    "col_2494621",
                    "col_2495918",
                    "col_2494770",
                    "col_2481671",
                    "col_2481673",
                    "col_2481675",
                    "col_1563",
                    "col_2481682",
                    "col_2494192",
                    "col_1567",
                    "col_1546",
                    "col_2494225",
                    "col_2494245",
                    "col_2494262",
                    "col_1549",
                    "col_1551",
                    "col_1576",
                    "col_1577",
                    "col_2481722",
                    "col_1575",
                    "col_1554",
                    "col_1555",
                    "col_2481735",
                    "col_2491016",
                    "col_1562",
                    "col_2481742",
                    "col_2494744",
                    "col_2000003299"
                ]
            };
// カウンター変数を定義（1から開始）
var counter = 1;

// 対象フィールド要素からdt/ddを取得
var fieldElements = document.querySelectorAll('div.two_columns_short_field,div.two_columns_long_field,dl.side_by_side_text.updated');
fieldElements.forEach(function(fieldElement){
    var dtElements = fieldElement.querySelectorAll('dt');
    var ddElements = fieldElement.querySelectorAll('dd');
    dtElements.forEach(function(dtElement, i){
        if(ddElements[i]){
            var ddElement = ddElements[i];
            var dtText = dtElement.innerText.trim();
            var ddText = ddElement.innerText.trim();
            dtArray.push(dtText);
            ddArray.push(ddText);
            dataRows.push({
                i: counter,  // 外部カウンターで連続番号を設定
                id: ddElement.id || 'No ID',
                l: dtText,
                v: ddText,
                h: (ddText === '' || ddText === ' ')
            });
            counter++;  // 次の番号へ
        }
    });
});
    
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
    
    // パンくずリスト取得
    var breadcrumbContainer = document.querySelector('.breadcrumb_wrapper ul.breadcrumbs');
    if(breadcrumbContainer){
        var breadcrumbItems = breadcrumbContainer.querySelectorAll('li');
        var breadcrumbsText = [];
        breadcrumbItems.forEach(function(li){
            breadcrumbsText.push(li.innerText.trim());
        });
        if(breadcrumbsText.length > 0){
            dataRows.push({
                i: 0,
                id: 'Data obtained',
                l: 'information',
                v: breadcrumbsText.join(' > ')+ ', '+ nameMatch[1]+'<br>'+Date(),
                h: false
            });
        }
    }
    
    // タイトル取得（なければ 'Untitled'）
    var title = document.querySelector('.column_one.layout h2')
                ? document.querySelector('.column_one.layout h2').innerText.trim()
                : 'Untitled';
    
    // dataRowsからIDごとにまとめる
    var dataDictionary = {};
    var valueHeaders = ['Value1'];
    dataRows.forEach(function(rowData){
        var id = rowData.id;
        if(!dataDictionary[id]){
            dataDictionary[id] = { i: rowData.i, l: rowData.l, v: [] };
        }
        dataDictionary[id].v[0] = rowData.v;
    });
    
    // 結果表示用ポップアップウィンドウ生成
    var popupWindow = window.open('','','width=1000,height=600');
    popupWindow.document.write('<html><head><title>'+title+'</title></head><body></body></html>');
    
    // Bootstrap CSS追加
    var cssLink = popupWindow.document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css';
    popupWindow.document.head.appendChild(cssLink);

    // popupWindowのheadにテーマCSS追加
    var tsThemeCss = popupWindow.document.createElement('link');
    tsThemeCss.rel = 'stylesheet';
    tsThemeCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.3/css/theme.bootstrap_4.min.css';
    popupWindow.document.head.appendChild(tsThemeCss);
    
    // jQuery読み込み
    var jqueryScript = popupWindow.document.createElement('script');
    jqueryScript.type = 'text/javascript';
    jqueryScript.src = 'https://code.jquery.com/jquery-3.3.1.min.js';
    jqueryScript.onload = function(){
            // タイトルを<h1>で表示
    var titleH1 = popupWindow.document.createElement('h1');
    titleH1.textContent = title;
    popupWindow.document.body.appendChild(titleH1);
        // ★先にshow/hide関数をグローバルに定義
        popupWindow.showAllRows = function(){
            var rows = popupWindow.document.querySelectorAll("#dataTable tr[id^='row']");
            rows.forEach(function(row){
                row.style.display = "";
            });
        };
        popupWindow.hideEmptyRows = function(){
            var rows = popupWindow.document.querySelectorAll("#dataTable tr[id^='row']");
            rows.forEach(function(row){
                var hasValue = false;
                for(var i = 4; i < row.cells.length; i++){
                    var cellValue = row.cells[i].textContent.trim();
                    if(cellValue !== ""){
                        hasValue = true;
                        break;
                    }
                }
                if(!hasValue){
                    row.style.display = "none";
                }
            });
        };
    
        var toggleButton = popupWindow.document.createElement('button');
        toggleButton.id = 'toggleShowHide';
        // 初期状態：すべての行表示中なので「空行を隠す」と表示
        toggleButton.innerText = 'Hide Empty Rows';
        popupWindow.document.body.appendChild(toggleButton);
    
        // 状態管理用フラグ（trueならすべて表示中）
        var showingAll = true;
        toggleButton.onclick = function(){
            if(showingAll){
                // すべて表示中なら空行を隠す
                popupWindow.hideEmptyRows();
                toggleButton.innerText = 'Show All Rows';
                toggleButton.title = 'Show All Rows';
                showingAll = false;
            } else {
                // 非表示状態ならすべて表示
                popupWindow.showAllRows();
                toggleButton.innerText = 'Hide Empty Rows';
                toggleButton.title = 'Hide Empty Rows';
                showingAll = true;
            }
        };
    
        // その他のボタン追加
        var downloadCsvButton = popupWindow.document.createElement('button');
        downloadCsvButton.id = 'downloadCsv';
        downloadCsvButton.innerText = 'Download CSV';
        downloadCsvButton.title = 'save data set (CSV file)';
        popupWindow.document.body.appendChild(downloadCsvButton);
        
        var loadCsvButton = popupWindow.document.createElement('button');
        loadCsvButton.id = 'loadCsv';
        loadCsvButton.innerText = 'Load CSV';
        loadCsvButton.title = "select saved CSV to compare";
        popupWindow.document.body.appendChild(loadCsvButton);
        
        var resetTableButton = popupWindow.document.createElement('button');
        resetTableButton.id = 'resetTable';
        resetTableButton.innerText = 'Reset Table';
        resetTableButton.title = 'Reset Table view/sort';
        popupWindow.document.body.appendChild(resetTableButton);
        
      
        
                // ドロップダウンがなければ作成してページ上部に挿入
                var importanceSelect = popupWindow.document.getElementById('importanceSelect');
                if (!importanceSelect) {
                    importanceSelect = popupWindow.document.createElement('select');
                    importanceSelect.id = 'importanceSelect';
                    for (var category in importanceCategories) {
                        var option = popupWindow.document.createElement('option');
                        option.value = category;
                        option.textContent = category;
                        importanceSelect.appendChild(option);
                    }
                    popupWindow.document.body.insertBefore(importanceSelect, popupWindow.document.body.firstChild);
                    importanceSelect.onchange = function(){
                        rebuildTable();
                    };
                }


        popupWindow.document.body.appendChild(popupWindow.document.createElement('br'));
        popupWindow.document.body.appendChild(popupWindow.document.createElement('br'));
        

        // 結果表示用コンテナ
        var tableContainerElement = popupWindow.document.createElement('div');
        tableContainerElement.id = 'tableContainer';
        popupWindow.document.body.appendChild(tableContainerElement);
        
        function rebuildTable(){
            var tableContainer = popupWindow.document.getElementById('tableContainer');
            
            // 既存テーブルがあれば削除
            var existingTable = popupWindow.document.getElementById('dataTable');
            if(existingTable){
                existingTable.parentNode.removeChild(existingTable);
            }
            
            // テーブル作成
            var tableElement = popupWindow.document.createElement('table');
            tableElement.id = 'dataTable';
            tableElement.className = 'table table-striped table-bordered';
            
            // ヘッダー作成：Index, ID, Importance, Label, その後にvalueHeaders
            var thead = popupWindow.document.createElement('thead');
            var headerRow = thead.insertRow();
            var headerTitles = ['Index', 'ID', 'Importance', 'Label'].concat(valueHeaders);
            headerTitles.forEach(function(headerTitle){
                var th = popupWindow.document.createElement('th');
                th.textContent = headerTitle;
                headerRow.appendChild(th);
            });
            tableElement.appendChild(thead);
            
            // tbody作成
            var tbody = popupWindow.document.createElement('tbody');
            // 選択されたimportanceカテゴリとそのIDリストを取得
            var selectedCategory = popupWindow.document.getElementById('importanceSelect').value;
            var importanceIds = importanceCategories[selectedCategory];
            
            // 各データ行生成
            for(var id in dataDictionary){
                var data = dataDictionary[id];
                var row = tbody.insertRow();
                row.id = 'row' + id;
                
                // Index
                var indexCell = row.insertCell();
                indexCell.textContent = data.i;
                
                // ID
                var idCell = row.insertCell();
                idCell.textContent = id;
                
                // Importance：対象IDならカテゴリ名を表示
                var impCell = row.insertCell();
                impCell.textContent = (importanceIds.indexOf(id) !== -1) ? selectedCategory : '';
                
                // Label
                var labelCell = row.insertCell();
                labelCell.textContent = data.l;
                
                // data.vの各値セル
                data.v.forEach(function(value, i) {
                    var valueCell = row.insertCell();
                    valueCell.textContent = value || '';
                    if(i > 0) {
                        if((data.v[0] || '').trim() === '') {
                            // value1が空の場合、現在のセルが非空なら色付け
                            if((value || '').trim() !== '') {
                                valueCell.style.backgroundColor = 'gold';
                            }
                        } else {
                        // value1が非空の場合、value1と一致しなければ色付け
                            if(value !== data.v[0]){
                                valueCell.style.backgroundColor = 'gold';
                            }
                        }
                    }
                });
            }
            tableElement.appendChild(tbody);
            tableContainer.innerHTML = '';
            tableContainer.appendChild(tableElement);
            
            // tablesorter設定（Bootstrapテーマ付き）
            if(popupWindow.jQuery && popupWindow.jQuery().tablesorter){
                popupWindow.jQuery(tableElement).tablesorter({
                    theme: 'bootstrap',
                    headerTemplate: '{content} {icon}'
                });
            } else {
                var tableSorterScript = popupWindow.document.createElement('script');
                tableSorterScript.type = 'text/javascript';
                tableSorterScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.3/js/jquery.tablesorter.min.js';
                tableSorterScript.onload = function(){
                    popupWindow.jQuery(tableElement).tablesorter({
                        theme: 'bootstrap',
                        headerTemplate: '{content} {icon}'
                    });
                };
                popupWindow.document.head.appendChild(tableSorterScript);
            }
        }
        
        // dt/ddテーブル再構築関数
        function rebuildDtDdTable(){
            var tableContainer = popupWindow.document.getElementById('tableContainer');
            tableContainer.innerHTML = '';
            var tableElement = popupWindow.document.createElement('table');
            tableElement.id = 'dtDdTable';
            tableElement.className = 'table table-striped table-bordered';
            var headerRow = tableElement.insertRow();
            var dtHeader = popupWindow.document.createElement('th');
            dtHeader.appendChild(popupWindow.document.createTextNode('dt'));
            headerRow.appendChild(dtHeader);
            var ddHeader = popupWindow.document.createElement('th');
            ddHeader.appendChild(popupWindow.document.createTextNode('dd'));
            headerRow.appendChild(ddHeader);
            for (var i = 0; i < dtArray.length; i++){
                var row = tableElement.insertRow();
                var dtCell = row.insertCell();
                dtCell.appendChild(popupWindow.document.createTextNode(dtArray[i]));
                var ddCell = row.insertCell();
                ddCell.appendChild(popupWindow.document.createTextNode(ddArray[i]));
            }
            tableContainer.appendChild(tableElement);
        }
        
        // CSV文字列を配列に変換する関数
        function CSVToArray(strData, strDelimiter){
            strDelimiter = (strDelimiter || ",");
            var regexPattern = new RegExp(
                ("(\\"+strDelimiter+"|\\r?\\n|\\r|^)" +
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                "([^\"\\"+strDelimiter+"\\r\\n]*))"),
                "gi"
            );
            var csvArray = [[]];
            var matches = null;
            while(matches = regexPattern.exec(strData)){
                var matchedDelimiter = matches[1];
                if(matchedDelimiter.length && matchedDelimiter !== strDelimiter){
                    csvArray.push([]);
                }
                var matchedValue;
                if(matches[2]){
                    matchedValue = matches[2].replace(/""/g, '"');
                }else{
                    matchedValue = matches[3];
                }
                csvArray[csvArray.length - 1].push(matchedValue);
            }
            return csvArray;
        }
        
        // CSV読み込み後にdataDictionary更新してテーブル再構築する関数
        function processLoadedCSV(csvData){
            var parsedData = CSVToArray(csvData), headers = parsedData[0], valueIndex = valueHeaders.length;
            valueHeaders.push('Value' + (valueIndex + 1));
            for(var i = 1; i < parsedData.length; i++){
                var row = parsedData[i], rowData = {};
                for(var j = 0; j < headers.length; j++){
                    rowData[headers[j]] = row[j];
                }
                var id = rowData['ID'], csvValue = rowData['Value1'] || rowData['Value'];
                if(csvValue === undefined){
                    csvValue = rowData['Value' + valueIndex];
                }
                if(!dataDictionary[id]){
                    dataDictionary[id] = { i: rowData['Index'], l: rowData['Label'], v: [] };
                }
                dataDictionary[id].v[valueIndex] = csvValue;
            }
            rebuildTable();
        }
        
        // 開発者ツール用（変数/関数をconsole出力）
        function showFunctionsAndArrays(){
            console.log("dtArray:", dtArray);
            console.log("ddArray:", ddArray);
            console.log("dataRows:", dataRows);
            console.log("dataDictionary:", dataDictionary);
            console.log("valueHeaders:", valueHeaders);
            console.log("rebuildTable:\n", rebuildTable.toString());
            console.log("rebuildDtDdTable:\n", rebuildDtDdTable.toString());
            console.log("CSVToArray:\n", CSVToArray.toString());
            console.log("processLoadedCSV:\n", processLoadedCSV.toString());
            alert("Check the console in DevTools for JS & Arrays.");
        }
        
        // 各ボタンのイベント設定
        downloadCsvButton.onclick = function(){
            var csv = '\uFEFF';
            var headers = ['Index','ID','Label'].concat(valueHeaders);
            csv += headers.map(function(header){ return '"' + header.replace(/"/g,'""') + '"'; }).join(',') + '\n';
            for(var id in dataDictionary){
                var data = dataDictionary[id];
                var row = [data.i, id, data.l];
                data.v.forEach(function(value){
                    value = value || '';
                    value = value.replace(/"/g,'""');
                    row.push(value);
                });
                csv += row.map(function(field){ return '"' + field + '"'; }).join(',') + '\n';
            }
            var now = new Date();
            var ymd = [now.getFullYear().toString().slice(-2), (now.getMonth()+1).toString().padStart(2,'0'), now.getDate().toString().padStart(2,'0')].join('');
            var hms = [now.getHours().toString().padStart(2,'0'), now.getMinutes().toString().padStart(2,'0'), now.getSeconds().toString().padStart(2,'0')].join('');
            var defaultFilename = title + '_' + ymd + '_' + hms + '.csv';
            
            // ユーザーにファイル名を確認／編集するプロンプトを表示
            var filename = popupWindow.prompt("ダウンロードするCSVのファイル名を確認してください。", defaultFilename);
            if(filename === null || filename.trim() === ''){
                // ユーザーがキャンセル、または空文字の場合はダウンロードを中止
                return;
            }
            
            var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            var downloadLink = popupWindow.document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = filename;
            popupWindow.document.body.appendChild(downloadLink);
            downloadLink.click();
            popupWindow.document.body.removeChild(downloadLink);
        };
        
        
        loadCsvButton.onclick = function(){
            var fileInput = popupWindow.document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.csv';
            fileInput.style.display = 'none';
            fileInput.onchange = function(e){
                var file = e.target.files[0];
                if(file){
                    var fileReader = new FileReader();
                    fileReader.onload = function(e){
                        processLoadedCSV(e.target.result);
                    };
                    fileReader.readAsText(file);
                }
            };
            popupWindow.document.body.appendChild(fileInput);
            fileInput.click();
        };
        
        
        resetTableButton.onclick = function(){
            rebuildTable();
            popupWindow.showAllRows();  // 全行を表示する
            showingAll = true;           // 状態を「すべて表示中」に戻す
            toggleButton.innerText = 'Hide Empty Rows';  // トグルボタンの表示を更新
        };
        
        // ★主要な配列・関数をグローバルに公開（DevToolsで確認可能）
        popupWindow.dtArray = dtArray;
        popupWindow.ddArray = ddArray;
        popupWindow.dataRows = dataRows;
        popupWindow.dataDictionary = dataDictionary;
        popupWindow.valueHeaders = valueHeaders;
        popupWindow.rebuildTable = rebuildTable;
        popupWindow.rebuildDtDdTable = rebuildDtDdTable;
        popupWindow.CSVToArray = CSVToArray;
        popupWindow.processLoadedCSV = processLoadedCSV;
        popupWindow.showFunctionsAndArrays = showFunctionsAndArrays;
        
        // ★初めにrebuildTable()を実行してテーブル表示
        rebuildTable();
    };
    popupWindow.document.head.appendChild(jqueryScript);
})();
