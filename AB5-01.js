javascript:(function(){
    // 最初の要素からマッチングする文字列を取得
    var element1 = document.querySelector('.column_one.layout h2');
    var match = null;
    if (element1) {
        var text1 = element1.textContent.trim();
        match = text1.match(/[A-Z]{2}\d{10}/); // アルファベット2文字＋数字10文字にマッチ
        if (match) {
            console.log('Match found: ' + match[0]);
        }
    }

    // selectedTab の文字列を取得
    var element2 = document.querySelector('#selectedTab a');
    var text2 = null;
    if (element2) {
        text2 = element2.textContent.trim();
        console.log('Selected tab: ' + text2);
    }

    // 条件に応じた処理
    if (match && text2 === 'BOM') {
        var prefix = match[0].substring(0, 2); // 最初の2文字を取得
        if (prefix === 'AB') {
            // test1.js を読み込む
            var script = document.createElement('script');
            script.src = 'https://suzukiyuto.github.io/bookmarklets/AB5-12.js';
            document.body.appendChild(script);
        } else if (prefix === 'CH') {
            // アラートを表示して終了
            alert('その操作は対応していません');
            return;
        } 
    } else if (text2 === 'Title Block') {
        // test2.js を読み込む
        var script = document.createElement('script');
        script.src = 'https://suzukiyuto.github.io/bookmarklets/Dataget.js';
        document.body.appendChild(script);
    }else {
        // test3.js を読み込む
        var script = document.createElement('script');
        script.src = 'https://suzukiyuto.github.io/bookmarklets/Tableget.js';
        document.body.appendChild(script);
    }
})();
