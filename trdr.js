 
    var counterCurrencyAmount = 5028.41;
    var baseCurrencyAmount = 17.60111686;
    var gain = document.getElementById("gain");
    var currentRate = document.getElementById("currentRate");
    var baseCurrencyValue = document.getElementById("baseCurrencyVal");
    var counterCurrencyValue = document.getElementById("counterCurrencyVal");
    var baseCurrencyLbl = document.getElementById("baseCurrencyLbl");
    var counterCurrencyLbl = document.getElementById("counterCurrencyLbl");
    var highestR = document.getElementById("highest");
    var lowestR = document.getElementById("lowest");
    var lastBuyRate = document.getElementById("lastb");
    var lastSellRate = document.getElementById("lasts");
    var tradeLog = document.getElementById("tradeLog");
    var buyingPercentage = 20;
    var sellingPercentage = 30;
    var waitToSell = 0;
    var waitToBuy = 0;
    var elapse = 0;
    var param = "BTC-USD";
    var percent = 0;
    var RATE = 0.0;
    var purRow = 0;
    var vndRow = 0;

    var timer;
    var CUR = {};
    CUR.JOE = 1.00;
    CUR.ETC = 2;
    CUR.USD = 840;
    CUR.INITIAL = 0;
    CUR.CURRENT = 0;
    const TRADE = [Buy, Sell];


    /*Took: 0.16700000 + 0.62300000 + 0.24726795                  = 1.03726795
      left: 0.02240535 + 0.01734505 + 0.01501393 + 0.01504101 +
            0.02022225 + 0.02172393 + 0.02383207                  = 0.13558359
            Trade Started on August 18: 4:58 PM
            WITH 1.03698145 BTC

            Started Wednesday Aug 19 with 1.05645516 BTC




            Joe curr	ETH	USD
            1.0000000	$2.000000	$780.00


            INITIAL	30.5245	25.65




    */


    function AddCurrencies(val) {
        var vals = val.split(":");
        baseCurrencyLbl.innerHTML = vals[0];
        counterCurrencyLbl.innerHTML = vals[1];
        tradeCurrencies.innerHTML = vals[2];
        param = vals[0] + "-" + vals[1];
        Initiate();
    }

    function Buy() {
        var v = parseFloat(counterCurrencyValue.innerHTML) / buyingPercentage;
        if (v > 0) {
            purRow++;
            vndRow = 0;
            var res = v / RATE;
            var f = res * 0.0014;
            res -= f;
            baseCurrencyAmount += res;
            counterCurrencyAmount -= v;
            baseCurrencyValue.innerHTML = baseCurrencyAmount.toFixed(7);
            counterCurrencyValue.innerHTML = counterCurrencyAmount.toFixed(4);
            CUR.CURRENT -= v / CUR.USD;
            CUR.CURRENT += res / CUR.ETC;
            UpdateGain();
            buyingPercentage--;
            sellingPercentage++;
            purRow++;
            lastBuyRate.value = RATE;
            tradeLog.innerHTML += `<p class="activB">Bought ${res} ${param.split("-")[0]} at rate:${RATE} at ${GetTime()} </p>`;
            tradeLog.lastElementChild.scrollIntoView();
        }
    }

    function Sell() {
        var btc = baseCurrencyAmount / sellingPercentage;
        if (btc > 0) {
            vndRow++;
            purRow = 0;
            var res = btc * RATE;
            var f = res * 0.14 / 100;
            res -= f;
            baseCurrencyAmount -= btc;
            counterCurrencyAmount += res;
            counterCurrencyValue.innerHTML = counterCurrencyAmount.toFixed(4);
            CUR.CURRENT -= btc / CUR.ETC;
            CUR.CURRENT += res / CUR.USD;
            baseCurrencyValue.innerHTML = baseCurrencyAmount.toFixed(7);
            UpdateGain();
            lastSellRate.value = RATE;
            vndRow++;
            buyingPercentage++;
            sellingPercentage--;
            tradeLog.innerHTML += `<p class="activS">Sold ${btc} ${param.split("-")[0]} at rate:${RATE} at ${GetTime()} </p>`;
            tradeLog.lastElementChild.scrollIntoView();
        }
    }

    function GetTime() {
        var D = new Date();
        var st = D.toLocaleDateString() + " " + D.toLocaleTimeString();
        return st;
    }

    function BuyIsProfitable() {
        var v = counterCurrencyAmount / buyingPercentage;
        if (v > 0 && purRow < 6) {
            var k = parseFloat(lastSellRate.value) + waitToBuy;
            var t = (k - RATE) * 100 / k;
            console.log(t);
            if (t >= 0.48) {
                waitToBuy += RATE * 0.0002;
                waitToSell = 0;
                return t;
            }
        }
        CheckStale();
        return -1;
    }

    function SellIsProfitable(r) {
        if (baseCurrencyAmount > 0 && vndRow < 6) {
            var d = parseFloat(lastBuyRate.value) + waitToSell;
            var t = (RATE - d) * 100 / RATE;
            if (t >= 0.48) {
                waitToSell += RATE * 0.0002;
                waitToBuy = 0;
                return t;
            }
        }
        CheckStale();
        return -1;
    }

    function CheckStale() {
        if (waitToSell !== 0 || waitToBuy !== 0)
            elapse++;
        if (elapse > 575) {
            waitToBuy = 0;
            waitToSell = 0
            elapse = 0;
        }
    }


    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }


    function UpdateCapital(el) {
        if (el.innerHTML === "START") {
            // var add = parseFloat(document.getElementById("capval").value);
            //baseCurrencyAmount += add;
            //counterCurrencyAmount += add; * parseFloat(currentRate.innerHTML) / 10;
            CUR.INITIAL = CUR.CURRENT = baseCurrencyAmount / CUR.ETC + counterCurrencyAmount / CUR.USD;
            console.log(CUR.CURRENT);
            baseCurrencyValue.innerHTML = baseCurrencyAmount.toFixed(4);
            counterCurrencyValue.innerHTML = counterCurrencyAmount.toFixed(4);
            el.innerHTML = "STOP";
            el.title = "Stop the trade";
            var crr = param.split("-");
            tradeLog.innerHTML += `<p clas="activ">Trading begins with ${baseCurrencyAmount} ${crr[0]} and ${counterCurrencyAmount} ${crr[1]} at ${GetTime()}</p>`;
            timer = setInterval(UpdateRate, 600);
        }
        else {
            clearInterval(timer);
            el.innerHTML = "START";
            el.title = "Begin the trade";
        }
    }



    function UpdateGain() {
        var g = (CUR.CURRENT - CUR.INITIAL) * 100 / CUR.CURRENT; console.log(CUR);
        gain.innerHTML = g.toFixed(2);
        if (percent < - 1)
            clearInterval(timer);
    }


    function UpdateRate() {
        Initiate();
        currentRate.innerHTML = RATE;
        var low = parseFloat(lowestR.innerHTML);
        var high = parseFloat(highestR.innerHTML);
        if (high < RATE)
            highestR.innerHTML = RATE;
        if (low > RATE)
            lowestR.innerHTML = RATE;
        var chk = [BuyIsProfitable(), SellIsProfitable()];
        var i = chk.indexOf(Math.max(...chk));
        if (chk[i] > 0) {
            console.log("here");
            TRADE[i]();
        }
    }


    function Initiate(q) {
        RATE = document.getElementsByClassName("sc-fepxGN kpvYqK")[0].innerText;
        currentRate.innerHTML = RATE;
        if (q) {
            lastSellRate.value = RATE;
            highestR.innerHTML = RATE;
            lowestR.innerHTML = RATE;
            lastBuyRate.value = RATE;
        }
    }

    function Initizate() {
        var req = new XMLHttpRequest();
        req.onload = function () {
            var data = JSON.parse(this.responseText);
            RATE = (data.USD.sell * 0.0365525).toFixed(4);
            currentRate.innerHTML = RATE;

            if (lastSellRate.value === '0') {
                lastSellRate.value = RATE + RATE * 0.0004;
                highestR.innerHTML = RATE;
                lowestR.innerHTML = RATE;
            }
            if (lastBuyRate.value === '0')
                lastBuyRate.value = RATE;
        };
        req.open("GET", "https://blockchain.info/ticker");
        req.send();
    }

    document.addEventListener('DOMContentLoaded', function () {
        Initiate(true);
    });
 