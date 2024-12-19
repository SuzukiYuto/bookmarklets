(function(){
    var r=[],f=document.querySelectorAll('div.two_columns_short_field,div.two_columns_long_field,dl.side_by_side_text.updated');
    f.forEach(function(fd){
        var dt=fd.querySelectorAll('dt'),dd=fd.querySelectorAll('dd');
        dt.forEach(function(d,i){
            if(dd[i]){
                var ddd=dd[i],v=ddd.innerText.trim();
                r.push({i:i,id:ddd.id||'No ID',l:d.innerText.trim(),v:v,h:v===''||v===' '});
            }
        });
    });
    var s=document.querySelector('select[name="revSelectName"]');
    if(s){
        var so=s.options[s.selectedIndex];
        r.push({i:'Selected Option',id:so.value,l:'Selected Option',v:so.innerText.trim(),h:false});
    }
    var st=document.getElementById('selectedTab');
    if(st){
        var stt=st.innerText.trim();
        r.push({i:'Selected Tab',id:'selectedTab',l:'Selected Tab',v:stt,h:false});
    }
    var bc=document.querySelector('.breadcrumb_wrapper ul.breadcrumbs');
    if(bc){
        var bci=bc.querySelectorAll('li'),bct=[];
        bci.forEach(function(li){
            bct.push(li.innerText.trim());
        });
        if(bct.length>0){
            r.push({i:0,id:'breadcrumbs',l:'breadcrumbs',v:bct.join(' > '),h:false});
        }
    }
    var title=document.querySelector('.column_one.layout h2')?document.querySelector('.column_one.layout h2').innerText.trim():'Untitled';
    var d={},vh=['Value1'];
    r.forEach(function(a){
        var id=a.id;
        if(!d[id]){
            d[id]={i:a.i,l:a.l,v:[]};
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
        var rb='<input type="radio" name="showAll" onclick="showAllRows();" checked> Show All <input type="radio" name="showAll" onclick="hideEmptyRows();"> Hide Empty Rows<br>';
        w.document.body.innerHTML+=rb;
        var db=w.document.createElement('button');
        db.id='downloadCsv';
        db.innerText='Download CSV';
        w.document.body.appendChild(db);
        var lb=w.document.createElement('button');
        lb.id='loadCsv';
        lb.innerText='Load CSV';
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
            var hr=t.insertRow(),hs=['Index','ID','Label'].concat(vh);
            hs.forEach(function(h){
                var th=w.document.createElement('th');
                th.appendChild(w.document.createTextNode(h));
                hr.appendChild(th);
            });
            for(var id in d){
                var data=d[id],row=t.insertRow();
                row.id='row'+id;
                var ci=row.insertCell();
                ci.appendChild(w.document.createTextNode(data.i));
                var cid=row.insertCell();
                cid.appendChild(w.document.createTextNode(id));
                var cl=row.insertCell();
                cl.appendChild(w.document.createTextNode(data.l));
                data.v.forEach(function(v,i){
                    var cv=row.insertCell();
                    cv.appendChild(w.document.createTextNode(v||''));
                    if(i>0&&data.v[0]!=undefined&&v!=undefined&&data.v[0]!==v){
                        cv.style.backgroundColor='gold';
                    }
                });
            }
            tc.appendChild(t);
            if(w.jQuery&&w.jQuery().tablesorter){
                w.jQuery(t).tablesorter();
            }else{
                var ts=w.document.createElement('script');
                ts.type='text/javascript';
                ts.src='https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.3/js/jquery.tablesorter.min.js';
                ts.onload=function(){
                    w.jQuery(t).tablesorter();
                };
                w.document.head.appendChild(ts);
            }
        }
        rebuildTable();
        db.onclick=function(){
            var csv='\uFEFF',headers=['Index','ID','Label'].concat(vh);
            csv+=headers.map(function(h){return '"'+h.replace(/"/g,'""')+'"';}).join(',')+'\n';
            for(var id in d){
                var data=d[id],row=[data.i,id,data.l];
                data.v.forEach(function(v){
                    v=v||'';
                    v=v.replace(/"/g,'""');
                    row.push(v);
                });
                csv+=row.map(function(f){return '"'+f+'"';}).join(',')+'\n';
            }
            var now=new Date(),ymd=[now.getFullYear().toString().slice(-2),(now.getMonth()+1).toString().padStart(2,'0'),now.getDate().toString().padStart(2,'0')].join(''),hms=[now.getHours().toString().padStart(2,'0'),now.getMinutes().toString().padStart(2,'0'),now.getSeconds().toString().padStart(2,'0')].join('');
            var filename=title+ymd+hms+'.csv';
            var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),link=w.document.createElement('a');
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
        function CSVToArray(strData,strDelimiter){
            strDelimiter=(strDelimiter||",");
            var objPattern=new RegExp(("(\\"+strDelimiter+"|\\r?\\n|\\r|^)"+"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|"+"([^\"\\"+strDelimiter+"\\r\\n]*))"),"gi");
            var arrData=[[]],arrMatches=null;
            while(arrMatches=objPattern.exec(strData)){
                var strMatchedDelimiter=arrMatches[1];
                if(strMatchedDelimiter.length&&strMatchedDelimiter!==strDelimiter){
                    arrData.push([]);
                }
                var strMatchedValue;
                if(arrMatches[2]){
                    strMatchedValue=arrMatches[2].replace(/""/g,'"');
                }else{
                    strMatchedValue=arrMatches[3];
                }
                arrData[arrData.length-1].push(strMatchedValue);
            }
            return arrData;
        }
        function processLoadedCSV(csvData){
            var pd=CSVToArray(csvData),headers=pd[0],vi=vh.length;
            vh.push('Value'+(vi+1));
            for(var i=1;i<pd.length;i++){
                var row=pd[i],rowData={};
                for(var j=0;j<headers.length;j++){
                    rowData[headers[j]]=row[j];
                }
                var id=rowData['ID'],v=rowData['Value1']||rowData['Value'];
                if(v===undefined){
                    v=rowData['Value'+(vi)];
                }
                if(!d[id]){
                    d[id]={i:rowData['Index'],l:rowData['Label'],v:[]};
                }
                d[id].v[vi]=v;
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
                for(var i=3;i<row.cells.length;i++){
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
    w.document.head.appendChild(s);
})();
