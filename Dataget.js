(function(){
    var r=[], idx=1, f=document.querySelectorAll('div.two_columns_short_field,div.two_columns_long_field,dl.side_by_side_text.updated');
    f.forEach(function(fd){
        var dt=fd.querySelectorAll('dt'), dd=fd.querySelectorAll('dd');
        dt.forEach(function(d, i){
            if(dd[i]){
                var ddd=dd[i], v=ddd.innerText.trim();
                r.push({i: idx++, id: ddd.id || 'No ID', l: d.innerText.trim(), v: v, h: v === '' || v === ' '});
            }
        });
    });
    var s=document.querySelector('select[name="revSelectName"]');
    if(s){
        var so=s.options[s.selectedIndex];
        r.push({i: idx++, id: so.value, l: 'Selected Option', v: so.innerText.trim(), h: false});
    }
    var st=document.getElementById('selectedTab');
    if(st){
        var stt=st.innerText.trim();
        r.push({i: idx++, id: 'selectedTab', l: 'Selected Tab', v: stt, h: false});
    }
    var bc=document.querySelector('.breadcrumb_wrapper ul.breadcrumbs');
    if(bc){
        var bci=bc.querySelectorAll('li'), bct=[];
        bci.forEach(function(li){
            bct.push(li.innerText.trim());
        });
        if(bct.length>0){
            r.push({i: idx++, id: 'breadcrumbs', l: 'breadcrumbs', v: bct.join(' > '), h: false});
        }
    }
    var title=document.querySelector('.column_one.layout h2') ? document.querySelector('.column_one.layout h2').innerText.trim() : 'Untitled';
    var d={}, vh=['Value1'];
    r.forEach(function(a){
        var id=a.id;
        if(!d[id]){
            d[id]={i:a.i, id:a.id, l:a.l, v:[]};
        }
        d[id].v[0]=a.v;
    });
    var w=window.open('','','width=800,height=600');
    w.document.write('<html><head><title>'+title+'</title></head><body></body></html>');
    var l=w.document.createElement('link');
    l.rel='stylesheet';
    l.href='https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css';
    w.document.head.appendChild(l);
    var s=w.document.createElement('script');
    s.type='text/javascript';
    s.src='https://code.jquery.com/jquery-3.3.1.min.js';
    s.onload=function(){
        var ts=w.document.createElement('script');
        ts.type='text/javascript';
        ts.src='https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.3/js/jquery.tablesorter.min.js';
        ts.onload=function(){
            var rb='<input type="radio" name="showAll" onclick="showAllRows();" checked> すべての項目を表示 <input type="radio" name="showAll" onclick="hideEmptyRows();"> 空の行を隠す<br>';
            w.document.body.innerHTML+=rb;
            var db=w.document.createElement('button');
            db.id='downloadCsv';
            db.innerText='データをディスクに保存...';
            w.document.body.appendChild(db);
            var lb=w.document.createElement('button');
            lb.id='loadCsv';
            lb.innerText='保存したデータを並べる';
            w.document.body.appendChild(lb);
            w.document.body.appendChild(w.document.createElement('br'));
            w.document.body.appendChild(w.document.createElement('br'));
            var tc=w.document.createElement('div');
            tc.id='tableContainer';
            w.document.body.appendChild(tc);
            function rebuildTable(){
                var tc=w.document.getElementById('tableContainer');
                tc.innerHTML='';
                var t=w.document.createElement('table');
                t.id='dataTable';
                t.className='table table-striped table-bordered';
                var hr=t.insertRow(), hs=['Index','Label'].concat(vh); // テーブルヘッダーからIDを除外
                hs.forEach(function(h){
                    var th=w.document.createElement('th');
                    th.appendChild(w.document.createTextNode(h));
                    hr.appendChild(th);
                });
                // 強調表示に使用する色の配列を定義
                var highlightColors = ['lightsalmon', 'lightgreen', 'lightblue', 'khaki', 'plum', 'lightgrey'];
                for(var id in d){
                    var data=d[id], row=t.insertRow();
                    row.id='row'+id;
                    var ci=row.insertCell();
                    ci.appendChild(w.document.createTextNode(data.i));
                    // ID列を非表示にするため、テーブルには追加しない
                    var cl=row.insertCell();
                    cl.appendChild(w.document.createTextNode(data.l));
                    data.v.forEach(function(v, i){
                        var cv=row.insertCell();
                        cv.appendChild(w.document.createTextNode(v || ''));
                        if(i > 0 && data.v[0] !== undefined && v !== undefined && data.v[0] !== v){
                            // インデックスに基づいて色を選択
                            var colorIndex = (i - 1) % highlightColors.length;
                            cv.style.backgroundColor = highlightColors[colorIndex];
                        }
                    });
                }
                tc.appendChild(t);
                w.jQuery(t).tablesorter(); // tablesorterを適用
            }
            rebuildTable();
            db.onclick=function(){
                // コメントの入力を促す
                var comment = prompt("コメントを入力してください：");
                // 現在の日時を取得
                var now = new Date();
                var dateString = now.getFullYear() + "/" + (now.getMonth()+1) + "/" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
                var csv='\uFEFF';
                // コメントと日時をCSVの先頭に追加
                csv += '"コメント","' + (comment ? comment.replace(/"/g, '""') : '') + '"\n';
                csv += '"日時","'+dateString+'"\n\n';
                var headers=['Index','ID','Label'].concat(vh); // CSVのヘッダーにIDを含める
                csv+=headers.map(function(h){return '"'+h.replace(/"/g,'""')+'"';}).join(',')+'\n';
                for(var id in d){
                    var data=d[id], row=[data.i, data.id, data.l]; // CSVのデータにIDを含める
                    data.v.forEach(function(v){
                        v=v||'';
                        v=v.replace(/"/g,'""');
                        row.push(v);
                    });
                    csv+=row.map(function(f){return '"'+f+'"';}).join(',')+'\n';
                }
                var ymd=[now.getFullYear().toString().slice(-2),(now.getMonth()+1).toString().padStart(2,'0'),now.getDate().toString().padStart(2,'0')].join('');
                var hms=[now.getHours().toString().padStart(2,'0'),now.getMinutes().toString().padStart(2,'0'),now.getSeconds().toString().padStart(2,'0')].join('');
                var filename=title+ymd+hms+'.csv';
                var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}), link=w.document.createElement('a');
                link.href=URL.createObjectURL(blob);
                link.download=filename;
                w.document.body.appendChild(link);
                link.click();
                w.document.body.removeChild(link);
            };
            lb.onclick=function(){
                var fi=w.document.createElement('input');
                fi.type='file';
                fi.accept='.csv';
                fi.style.display='none';
                fi.onchange=function(e){
                    var f=e.target.files[0];
                    if(f){
                        var r=new FileReader();
                        r.onload=function(e){
                            processLoadedCSV(e.target.result);
                        };
                        r.readAsText(f);
                    }
                };
                w.document.body.appendChild(fi);
                fi.click();
            };
            // 修正されたCSVToArray関数
            function CSVToArray(strData, strDelimiter) {
                // デリミタが指定されていない場合はカンマを使用
                strDelimiter = strDelimiter || ",";

                // 結果を格納する配列
                var arrData = [];
                // 各行を保持する変数
                var arrMatches = null;

                // 正規表現パターンの作成
                var regexPattern = new RegExp(
                    // デリミタ、改行、または行の先頭をキャプチャ
                    "(\\\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                    // 引用符で囲まれたフィールドをキャプチャ
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                    // 引用符で囲まれていないフィールドをキャプチャ
                    "([^\"\\" + strDelimiter + "\\r\\n]*))",
                    "gi"
                );

                // 正規表現を使用してデータをパース
                while ((arrMatches = regexPattern.exec(strData)) !== null) {
                    var strMatchedDelimiter = arrMatches[1];
                    var strMatchedValue;

                    // 新しい行が開始された場合、arrDataに新しい配列を追加
                    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
                        arrData.push([]);
                    }

                    // 引用符で囲まれた値を処理
                    if (arrMatches[2]) {
                        // エスケープされた引用符を元に戻す
                        strMatchedValue = arrMatches[2].replace(/\"\"/g, "\"");
                    } else {
                        // 引用符で囲まれていない値
                        strMatchedValue = arrMatches[3];
                    }

                    // 最初の行が存在しない場合、新しい行を追加
                    if (arrData.length === 0) {
                        arrData.push([]);
                    }

                    // 現在の行に値を追加
                    arrData[arrData.length - 1].push(strMatchedValue);
                }

                return arrData;
            }
            function processLoadedCSV(csvData){
                var pd = CSVToArray(csvData), headers = [], dataStartIndex = 0;
                // コメントと日時の行をスキップする
                for(var i = 0; i < pd.length; i++){
                    if(pd[i].length === 0){
                        dataStartIndex = i + 1;
                        break;
                    }
                }
                headers = pd[dataStartIndex];
                var vi = vh.length;
                vh.push('Value' + (vi + 1));
                for(var i = dataStartIndex + 1; i < pd.length; i++){
                    var row = pd[i], rowData = {};
                    for(var j = 0; j < headers.length; j++){
                        rowData[headers[j]] = row[j];
                    }
                    var id = rowData['ID'], v = rowData['Value1'] || rowData['Value'];
                    if(v === undefined){
                        v = rowData['Value' + (vi)];
                    }
                    if(!d[id]){
                        d[id] = {i: rowData['Index'], id: id, l: rowData['Label'], v: []};
                    }
                    d[id].v[vi] = v;
                }
                rebuildTable();
            }
            w.showAllRows=function(){
                var rows=w.document.querySelectorAll("#dataTable tr[id^='row']");
                rows.forEach(function(row){
                    row.style.display="";
                });
            };
            w.hideEmptyRows=function(){
                var rows=w.document.querySelectorAll("#dataTable tr[id^='row']");
                rows.forEach(function(row){
                    var hv=false;
                    for(var i=2; i<row.cells.length; i++){ // インデックスを調整
                        var v=row.cells[i].textContent.trim();
                        if(v!==""){
                            hv=true;
                            break;
                        }
                    }
                    if(!hv){
                        row.style.display="none";
                    }
                });
            };
        };
        w.document.head.appendChild(ts);
    };
    w.document.head.appendChild(s);
})();
