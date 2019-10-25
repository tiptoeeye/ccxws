const { expect } = require("chai");
const { testClient } = require("../test-runner");
const BitMEXClient = require("../../src/exchanges/bitmex-client");

testClient({
  clientFactory: () => new BitMEXClient(),
  clientName: "BitMEXClient",
  exchangeName: "BitMEX",
  markets: [
    {
      id: "XBTUSD",
      base: "BTC",
      quote: "USD",
    },
  ],

  testConnectEvents: true,
  testDisconnectEvents: true,
  testReconnectionEvents: true,
  testCloseEvents: true,

  hasTickers: false,
  hasTrades: true,
  hasCandles: false,
  hasLevel2Snapshots: false,
  hasLevel2Updates: true,
  hasLevel3Snapshots: false,
  hasLevel3Updates: false,

  trade: {
    hasTradeId: true,
    tests: (spec, result) => {
      it("trade.tradeId should be 32 hex characters", () => {
        expect(result.trade.tradeId).to.match(/^[a-f0-9]{32,32}$/);
      });
    },
  },

  l2snapshot: {
    hasTimestampMs: false,
    hasSequenceId: false,
    hasCount: false,
  },

  l2update: {
    hasSnapshot: true,
    hasTimestampMs: false,
    hasSequenceId: false,
    hasCount: false,
    done: (spec, result, update) => {
      let point = update.bids[0] || update.asks[0];
      if (point.meta.type === "update") result.hasUpdate = true;
      if (point.meta.type === "insert") result.hasInsert = true;
      if (point.meta.type === "delete") result.hasDelete = true;
      return result.hasUpdate && result.hasInsert && result.hasDelete;
    },
    tests: (spec, result) => {
      it("update.bid/ask should have meta.id", () => {
        let point = result.update.bids[0] || result.update.asks[0];
        expect(point.meta.id).to.be.greaterThan(0);
      });

      it("update.bid/ask should have meta.type", () => {
        let point = result.update.bids[0] || result.update.asks[0];
        expect(point.meta.type).to.be.match(/update|delete|insert/);
      });
    },
  },
});
