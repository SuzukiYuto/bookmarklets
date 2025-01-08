javascript:(function(){
    const searchStrings = ["AN0000002653","AN0000003585","AN0000003608","AN0000003609","AN0000206778","AN0000000725","AN0000209707","AN0000000621","AN0000000997","AN0000001655","AN0000003782","AN0000003097","AN0000000649","AN0000000062","AN0000293329","AN0000003329","AN0000209110","AN0000218695","AN0000237804","AN0000237822","AN0000001083","AN0000002496","AN0000003496","AN0000003585","AN0000130849","AN0000209707","AN0000223956","AN0000228014","AN0000230154","AN0000252530","AN0000295029","AN0000003551","AN0000000384","AN0000002522","AN0000003458","AN0000003460","AN0000209110","AN0000215311","AN0000002444","AN0000000044","AN0000000259","AN0000003113","AN0000287795","AN0000002044","AN0000279947","AN0000000809","AN0000000810","AN0000000811","AN0000001105","AN0000305235","AN0000294619","AN0000305243","AN0000300031","AN0000003329","AN0000002715","AN0000002803","AN0000130778","AN0000133185","AN0000208437","AN0000215738","AN0000279946","AN0000002374","AN0000000049","AN0000000050","AN0000003253","AN0000003254","AN0000003333","AN0000003554","AN0000002020","AN0000003344","AN0000001937","AN0000003551","AN0000275703","AN0000000384","AN0000235293","AN0000257131","AN0000000535","AN0000000197","AN0000000385","AN0000000429","AN0000000439","AN0000000533","AN0000000643","AN0000000673","AN0000000701","AN0000000733","AN0000001233","AN0000001406","AN0000001937","AN0000293466","AN0000288297","AN0000296957"]; // 配列で指定
    let index = 0;

    function performSearch() {
        if (index < searchStrings.length) {
            document.getElementById("QUICKSEARCH_STRING").value = searchStrings[index];
            doSimpleSearch();
            setTimeout(() => clickBOM(false), 5000); // リトライフラグをfalseで初回実行
        }
    }

    function clickBOM(retry) {
        let bomLink = [...document.getElementsByTagName("a")].find(a => a.textContent.trim() === "BOM");
        if (bomLink) {
            bomLink.click();
            setTimeout(clickDI, 1000);
        } else if (!retry) { // 初回リトライの場合
            let searchLink = [...document.getElementsByTagName("a")].find(a => a.textContent.trim().includes(searchStrings[index]));
            if (searchLink) {
                searchLink.click();
                setTimeout(() => clickBOM(true), 300); // リトライフラグをtrueにして再試行
            }
        } else {
            alert("BOMが見つかりませんでした: " + searchStrings[index]);
            index++;
            if (index < searchStrings.length) {
                setTimeout(performSearch, 1000); // 次の検索を実行
            }
        }
    }

    function clickDI() {
        let itemTable = document.getElementById("ITEMTABLE_BOM");
        if (itemTable) {
            let diLink = [...itemTable.getElementsByTagName("a")].find(a => /^DI/.test(a.textContent.trim()));
            if (diLink) {
                diLink.click();
                setTimeout(clickTitleBlock, 1000);
            } else {
                let anLink = [...itemTable.getElementsByTagName("a")].find(a => /^AN/.test(a.textContent.trim()));
                if (anLink) {
                    anLink.click();
                    setTimeout(() => {
                        let bomLink = [...document.getElementsByTagName("a")].find(a => a.textContent.trim() === "BOM");
                        if (bomLink) {
                            bomLink.click();
                            setTimeout(() => {
                                diLink = [...itemTable.getElementsByTagName("a")].find(a => /^DI/.test(a.textContent.trim()));
                                if (diLink) {
                                    diLink.click();
                                    setTimeout(clickTitleBlock, 1000);
                                } else {
                                    console.warn("DIが見つかりませんでした");
                                }
                            }, 1000);
                        } else {
                            console.warn("BOMが見つかりませんでした");
                        }
                    }, 1000);
                } else {
                    console.warn("ANも見つかりませんでした");
                }
            }
        } else {
            console.warn("ITEMTABLE_BOMが見つかりません");
        }
    }

    function clickTitleBlock() {
        let titleBlockLink = [...document.getElementsByTagName("a")].find(a => a.textContent.trim() === "Title Block");
        if (titleBlockLink) {
            titleBlockLink.click();
            setTimeout(loadScript, 1000);
        }
    }

    function loadScript() {
        let script = document.createElement("script");
        script.src = "https://suzukiyuto.github.io/bookmarklets/AB5-01.js";
        document.body.appendChild(script);
        index++;
        if (index < searchStrings.length) {
            const randomDelay = Math.floor(Math.random() * 9000) + 1000; // 1000msから10000msの間のランダム値
            setTimeout(performSearch, randomDelay); // 次の検索を実行
        }
    }

    performSearch();
})();
