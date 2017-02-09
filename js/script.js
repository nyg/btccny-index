/* BTCChina */

var btcc = io145('https://websocket.btcc.com')

btcc.emit('subscribe', 'marketdata_cnybtc')
btcc.on('trade', function (data) {
    newTrade('b', data.price, data.amount)
});

/* Huobi */

var huobi = io.connect('hq.huobi.com');

huobi.emit('request', {
    symbolList: {
        tradeDetail: [{ symbolId: "btccny"}]
    },
    version: 1,
    msgType: "reqMsgSubscribe"
});

huobi.on('message', function(data) {
    for (var i = 0; i < data.payload.price.length; ++i) {
        newTrade('h', data.payload.price[i], data.payload.amount[i])
    }
});

/* OKCoin */

new OKCoin('cn', {
    ok_sub_spotcny_btc_trades: handleOKCoin,
}).start()

function handleOKCoin(message) {
    if (message.hasOwnProperty('data')) {
        message.data.forEach(function (trade) {
            newTrade('o', parseFloat(trade[1]), parseFloat(trade[2]))
        })
    }
}

/* Add each trade to a fixed-size queue and compute the VW average. */

var queue = new FixedQueue(100)

function newTrade(exchange, price, amount) {
    queue.add({ price: price, amount: amount })
    queue.computeAverage()
}

function FixedQueue(maxSize) {
    this._maxSize = maxSize
    this._storage = []
}

FixedQueue.prototype.add = function (element) {
    this._storage.push(element)
    if (this._storage.length > this._maxSize) {
        this._storage.shift()
    }
}

FixedQueue.prototype.computeAverage = function () {

    var sum = 0, coef = 0
    for (var i = 0; i < this._storage.length; i++) {
        sum += this._storage[i].price * this._storage[i].amount
        coef += this._storage[i].amount
    }

    document.title = (sum / coef).toFixed(2)
}
