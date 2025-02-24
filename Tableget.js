(function(){
    function h(e){
        while(e.parentElement){
            e=e.parentElement;
            if(e.tagName.toLowerCase()==='div' && e.classList.contains('GMChiled'))
                return true;
        }
        return false;
    }
    var t=Array.from(document.querySelectorAll('table.GMSection')).filter(function(t){return !h(t)});
    if(t.length===0){
        alert('AgileのAN/CC/AK>title blockか、AB>BOMを表示してから起動してください。');
        return;
    }
    var b=document.querySelector('.breadcrumb_wrapper ul.breadcrumbs'),
        bH=b?b.outerHTML:'',
        h2=document.querySelector('.column_one.layout h2'),
        h2T=h2?h2.textContent.trim():'',
        h2H=h2?h2.outerHTML:'',
        w=window.open('','_blank');
    w.document.write('<!DOCTYPE html><html><head><title>'+h2T+'</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"><script src="https://code.jquery.com/jquery-3.6.0.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.0/js/jquery.tablesorter.min.js"></script><style>body{overflow-x:auto}td.column-hidden,th.column-hidden{display:none}.table-container{overflow-x:auto}</style></head><body>');
    w.document.write(bH);
    w.document.write(h2H);
    var d=[], c=null;
    t.forEach(function(t){
        Array.from(t.rows).forEach(function(r){
            var rT=Array.from(r.cells).map(function(c){return c.textContent.trim()}).join('');
            if(rT.length>=1){
                var iH=Array.from(r.cells).some(function(c){return c.classList.contains('GMCellHeader')});
                if(iH){
                    c={id:t.id, className:t.className, rows:[]};
                    d.push(c);
                }
                if(c){
                    var s=false, rD=[];
                    Array.from(r.cells).forEach(function(cell){
                        var cT=cell.textContent.trim();
                        if(!s && cT!=='' && cT!=='0' && cT!=='Find Num')
                            s=true;
                        if(s){
                            var cD={text:cT, id:cell.id, className:cell.className};
                            rD.push(cD);
                        }
                    });
                    if(rD.length>0)
                        c.rows.push(rD);
                }
            }
        });
    });
    var o='';
    d.forEach(function(t,i){
        var m=0;
        t.rows.forEach(function(r){
            if(r.length>m) m=r.length;
        });
        var s=new Array(m).fill(0);
        for(var rI=1; rI<t.rows.length; rI++){
            var rD=t.rows[rI];
            for(var cI=0; cI<rD.length; cI++){
                var cD=rD[cI];
                var cL=(cD.text==='0'||cD.text==='Find Num')?0:cD.text.length;
                s[cI]+=cL;
            }
        }
        var cH=s.map(function(s){return s===0});
        o+='<div id="container_'+i+'"><button onclick="toggleColumns('+i+')" class="btn btn-primary">非表示列の表示/非表示</button> <button onclick="toggleTable('+i+')" class="btn btn-secondary">テーブルの表示/非表示</button><div class="table-container"><table class="table table-bordered sortable" id="table_'+i+'"';
        if(t.id){
            o+=' data-original-id="'+t.id+'"';
        }
        o+='>';
        // ヘッダー開始
        o+='<thead>';
        t.rows.forEach(function(r,rI){
            o+='<tr>';
            for(var cI=0; cI<m; cI++){
                var cD=r[cI], cT=rI===0?'th':'td';
                if(cD){
                    o+='<'+cT;
                    if(cD.id){
                        o+=' id="'+cD.id+'"';
                    }
                    var cC=cD.className||'';
                    if(cH[cI]) cC+=' column-hidden';
                    if(cC.trim()){
                        o+=' class="'+cC.trim()+'"';
                    }
                    o+='>'+cD.text+'</'+cT+'>';
                }else{
                    o+='<'+cT;
                    if(cH[cI]){
                        o+=' class="column-hidden"';
                    }
                    o+='></'+cT+'>';
                }
            }
            o+='</tr>';
            // ヘッダー終了、ボディ開始
            if(rI===0){
                o+='</thead><tbody>';
            }
        });
        // ボディ終了
        o+='</tbody></table></div></div><br>';
    });
    o+='<script>function toggleColumns(i){var t=document.getElementById("table_"+i);if(!t)return;var c=t.querySelectorAll(".column-hidden");c.forEach(function(c){var d=window.getComputedStyle(c).display;c.style.display=d==="none"?"table-cell":"none"})}function toggleTable(i){var c=document.getElementById("container_"+i);if(!c)return;var t=c.querySelector(".table-container"),d=window.getComputedStyle(t).display;t.style.display=d==="none"?"block":"none"}$(document).ready(function(){$(".sortable").each(function(){$(this).tablesorter();});});<\/script>';
    w.document.write(o);
    w.document.write('</body></html>');
})();
