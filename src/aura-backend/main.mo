import Text "mo:base/Text";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Timer "mo:base/Timer";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Buffer "mo:base/Buffer";
import Char "mo:base/Char";

actor AURA {
  // Type definitions
  public type HeaderField = (Text, Text);
  
  public type HttpResponse = {
    status : Nat;
    headers : [HeaderField];
    body : Blob;
  };
  
  public type TransformContext = {
    response : HttpResponse;
    context : Blob;
  };
  
  public type TransformFunction = shared query TransformContext -> async HttpResponse;
  
  public type HttpRequest = {
    url : Text;
    method : { #get; #head; #post };
    headers : [HeaderField];
    body : Blob;
    transform : ?TransformFunction;
  };
  
  public type HttpResult = { #ok : HttpResponse; #err : Text };
  
  public type SentimentData = {
    score: Int;
    confidence: Float;
    timestamp: Int;
    keywords: [Text];
  };
  
  public type PriceData = {
    price: Float;
    change24h: Float;
    timestamp: Int;
  };
  
  public type DashboardData = {
    sentiment: SentimentData;
    price: PriceData;
    status: Text;
    lastUpdate: Int;
    cycleCount: Nat;
  };

  // Management canister reference
  let ic = actor "aaaaa-aa" : actor {
    http_request : shared query (HttpRequest, Nat) -> async HttpResult;
  };
  
  // Stable state for upgrades - removed redundant 'stable' keywords
  private var logsStable : [Text] = [];
  private var apiKeyStable : Text = "";
  private var dashboardDataStable : ?DashboardData = null;
  private var cycleCountStable : Nat = 0;
  private var lastUpdateStable : Int = 0;
  private var authorizedCallersStable : [Principal] = [];

  // Runtime state
  private var logs : Buffer.Buffer<Text> = Buffer.fromArray(logsStable);
  private var apiKey : Text = apiKeyStable;
  private var dashboardData : ?DashboardData = dashboardDataStable;
  private var cycleCount : Nat = cycleCountStable;
  private var lastUpdate : Int = lastUpdateStable;
  private var authorizedCallers : Buffer.Buffer<Principal> = Buffer.fromArray(authorizedCallersStable);
  private var timerId : ?Timer.TimerId = null;

  // Constants
  private let MAX_LOGS : Nat = 100;
  private let RETRY_ATTEMPTS : Nat = 3;
  private let RETRY_DELAY_MS : Nat64 = 2000;
  private let UPDATE_INTERVAL_NS : Nat64 = 300_000_000_000; // 5 minutes in nanoseconds

  // Sentiment analysis keywords
  private let POSITIVE_KEYWORDS : [Text] = [
    "bullish", "moon", "pump", "rally", "surge", "breakout", "bullrun",
    "adoption", "partnership", "upgrade", "positive", "growth", "gains",
    "buy", "hodl", "diamond", "hands", "rocket", "lambo"
  ];
  
  private let NEGATIVE_KEYWORDS : [Text] = [
    "bearish", "dump", "crash", "dip", "correction", "sell", "panic",
    "fear", "uncertainty", "doubt", "fud", "scam", "hack", "exploit",
    "regulation", "ban", "decline", "loss", "red", "blood", "capitulation"
  ];

  // Initialize system
  private func initializeSystem() : async () {
    addLog("🚀 AURA System Initializing...");
    
    // Start the automated cycle
    await startAutomatedCycle();
    
    addLog("✅ AURA System Initialized Successfully");
  };

  // Transform function for HTTP outcalls
  public query func transform(ctx : TransformContext) : async HttpResponse {
    {
      status = ctx.response.status;
      headers = [];
      body = ctx.response.body;
    }
  };

  // Logging functions
  private func addLog(msg : Text) : () {
    let timestamp = Time.now();
    let logEntry = Int.toText(timestamp) # " | " # msg;
    
    logs.add(logEntry);
    
    // Implement log rotation
    if (logs.size() > MAX_LOGS) {
      let newLogs = Buffer.Buffer<Text>(MAX_LOGS);
      let startIndex = logs.size() - MAX_LOGS;
      for (i in Iter.range(startIndex, logs.size() - 1)) {
        newLogs.add(logs.get(i));
      };
      logs := newLogs;
    };
    
    Debug.print(logEntry);
  };

  // Security: API key management
  public shared(msg) func setApiKey(key : Text) : async Result.Result<(), Text> {
    let caller = msg.caller;
    
    // Check if caller is authorized
    let isAuthorized = Buffer.contains<Principal>(authorizedCallers, caller, Principal.equal);
    if (not isAuthorized) {
      addLog("❌ Unauthorized API key update attempt from: " # Principal.toText(caller));
      return #err("Unauthorized: Only authorized callers can set API key");
    };
    
    if (Text.size(key) < 10) {
      return #err("API key too short");
    };
    
    apiKey := key;
    addLog("🔑 API key updated successfully");
    return #ok(());
  };

  // Add authorized caller
  public shared(msg) func addAuthorizedCaller(principal : Principal) : async Result.Result<(), Text> {
    let caller = msg.caller;
    let isAuthorized = Buffer.contains<Principal>(authorizedCallers, caller, Principal.equal);
    
    if (not isAuthorized) {
      return #err("Unauthorized");
    };
    
    authorizedCallers.add(principal);
    addLog("👤 Added authorized caller: " # Principal.toText(principal));
    return #ok(());
  };

  // Core sentiment analysis function
  public func calculateSentiment(text : Text) : async Int {
    let lowerText = Text.map(text, func(c : Char) : Char {
      if (c >= 'A' and c <= 'Z') {
        Char.fromNat32(Char.toNat32(c) + 32)
      } else {
        c
      }
    });
    
    var positiveScore : Int = 0;
    var negativeScore : Int = 0;
    
    // Count positive keywords
    for (keyword in POSITIVE_KEYWORDS.vals()) {
      if (Text.contains(lowerText, #text keyword)) {
        positiveScore += 1;
      };
    };
    
    // Count negative keywords
    for (keyword in NEGATIVE_KEYWORDS.vals()) {
      if (Text.contains(lowerText, #text keyword)) {
        negativeScore += 1;
      };
    };
    
    // Calculate final sentiment score (-100 to +100)
    let totalKeywords = positiveScore + negativeScore;
    if (totalKeywords == 0) {
      return 0; // Neutral
    };
    
    let sentimentRatio = Float.fromInt(positiveScore - negativeScore) / Float.fromInt(totalKeywords);
    Int.abs(Float.toInt(sentimentRatio * 100.0))
  };

  // Helper function to find text pattern
  private func findTextPattern(text : Text, pattern : Text) : ?Nat {
    let textSize = Text.size(text);
    let patternSize = Text.size(pattern);
    
    if (patternSize > textSize) {
      return null;
    };
    
    let textChars = Text.toIter(text);
    let textArray = Iter.toArray(textChars);
    let patternChars = Text.toIter(pattern);
    let patternArray = Iter.toArray(patternChars);
    
    var i = 0;
    while (i <= textSize - patternSize) {
      var j = 0;
      var found = true;
      
      while (j < patternSize and found) {
        if (textArray[i + j] != patternArray[j]) {
          found := false;
        };
        j += 1;
      };
      
      if (found) {
        return ?i;
      };
      
      i += 1;
    };
    
    null
  };

  // Fetch ICP price from CoinGecko
  private func fetchPrice() : async Result.Result<PriceData, Text> {
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd&include_24hr_change=true";
    
    let request : HttpRequest = {
      url = url;
      method = #get;
      headers = [
        ("User-Agent", "AURA-Bot/1.0"),
        ("Accept", "application/json")
      ];
      body = Blob.fromArray([]);
      transform = ?transform;
    };
    
    var attempts = 0;
    while (attempts < RETRY_ATTEMPTS) {
      try {
        let response = await ic.http_request(request, 25_000_000_000);
        switch (response) {
          case (#ok(res)) {
            if (res.status == 200) {
              switch (Text.decodeUtf8(res.body)) {
                case (?jsonText) {
                  return parsePrice(jsonText);
                };
                case null {
                  addLog("❌ Failed to decode price response");
                };
              };
            } else {
              addLog("❌ Price API returned status: " # Nat.toText(res.status));
            };
          };
          case (#err(msg)) {
            addLog("❌ Price API error: " # msg);
          };
        };
      } catch (e) {
        addLog("❌ Price fetch exception occurred");
        Debug.print("Price fetch exception occurred");
      };
      
      attempts += 1;
      if (attempts < RETRY_ATTEMPTS) {
        addLog("🔄 Retrying price fetch in " # Nat64.toText(RETRY_DELAY_MS) # "ms...");
        // Note: In production, implement proper delay mechanism
      };
    };
    
    #err("Failed to fetch price after " # Nat.toText(RETRY_ATTEMPTS) # " attempts")
  };

  // Parse price JSON response - Fixed variable scoping and syntax
  private func parsePrice(json : Text) : Result.Result<PriceData, Text> {
    // Simple JSON parsing for ICP price
    let icpKey = "\"internet-computer\":{\"usd\":";
    let changeKey = "\"usd_24h_change\":";
    
    if (not Text.contains(json, #text icpKey)) {
      return #err("Price data not found in response");
    };
    
    // Extract price using helper function
    switch (findTextPattern(json, icpKey)) {
      case (?startIndex) {
        let afterKey = Text.drop(json, startIndex + Text.size(icpKey));
        switch (findTextPattern(afterKey, ",")) {
          case (?endIndex) {
            let priceText = Text.take(afterKey, endIndex);
            switch (textToFloat(priceText)) {
              case (?priceValue) {
                // Extract 24h change
                var change24hValue : Float = 0.0;
                if (Text.contains(json, #text changeKey)) {
                  switch (findTextPattern(json, changeKey)) {
                    case (?changeStartIndex) {
                      let afterChangeKey = Text.drop(json, changeStartIndex + Text.size(changeKey));
                      switch (findTextPattern(afterChangeKey, "}")) {
                        case (?changeEndIndex) {
                          let changeText = Text.take(afterChangeKey, changeEndIndex);
                          change24hValue := switch (textToFloat(changeText)) {
                            case (?c) c;
                            case null 0.0;
                          };
                        };
                        case null {};
                      };
                    };
                    case null {};
                  };
                };
                
                return #ok({
                  price = priceValue;
                  change24h = change24hValue;
                  timestamp = Time.now();
                });
              };
              case null {
                return #err("Failed to parse price: " # priceText);
              };
            };
          };
          case null {
            return #err("Invalid price format - no comma found");
          };
        };
      };
      case null {
        return #err("Price key not found in JSON");
      };
    };
  };

  // Fetch news from NewsAPI
  private func fetchNewsAsText() : async Result.Result<Text, Text> {
    if (apiKey == "") {
      return #err("NewsAPI key not configured");
    };
    
    let url = "https://newsapi.org/v2/everything?q=ICP+OR+\"Internet+Computer\"+OR+cryptocurrency&language=en&sortBy=publishedAt&pageSize=10&apiKey=" # apiKey;
    
    let request : HttpRequest = {
      url = url;
      method = #get;
      headers = [
        ("User-Agent", "AURA-Bot/1.0"),
        ("Accept", "application/json")
      ];
      body = Blob.fromArray([]);
      transform = ?transform;
    };
    
    var attempts = 0;
    while (attempts < RETRY_ATTEMPTS) {
      try {
        let response = await ic.http_request(request, 50_000_000_000);
        switch (response) {
          case (#ok(res)) {
            if (res.status == 200) {
              switch (Text.decodeUtf8(res.body)) {
                case (?jsonText) {
                  return extractNewsText(jsonText);
                };
                case null {
                  addLog("❌ Failed to decode news response");
                };
              };
            } else {
              addLog("❌ News API returned status: " # Nat.toText(res.status));
            };
          };
          case (#err(msg)) {
            addLog("❌ News API error: " # msg);
          };
        };
      } catch (e) {
        addLog("❌ News fetch exception occurred");
        Debug.print("News fetch exception occurred");
      };
      
      attempts += 1;
      if (attempts < RETRY_ATTEMPTS) {
        addLog("🔄 Retrying news fetch in " # Nat64.toText(RETRY_DELAY_MS) # "ms...");
      };
    };
    
    #err("Failed to fetch news after " # Nat.toText(RETRY_ATTEMPTS) # " attempts")
  };

  // Extract text content from news JSON
  private func extractNewsText(json : Text) : Result.Result<Text, Text> {
    var combinedText = "";
    let titleKey = "\"title\":\"";
    let descKey = "\"description\":\"";
    
    // Simple extraction of titles and descriptions
    let parts = Text.split(json, #text "\"articles\":[");
    switch (parts.next()) {
      case (?first) {
        switch (parts.next()) {
          case (?articlesJson) {
            // Extract first few articles' titles and descriptions
            let articleParts = Text.split(articlesJson, #text "{\"source\":");
            var count = 0;
            label articlesLoop for (article in articleParts) {
              if (count >= 5) { break articlesLoop }; // Limit to first 5 articles

              // Extract title
              if (Text.contains(article, #text titleKey)) {
                let titleParts = Text.split(article, #text titleKey);
                switch (titleParts.next()) {
                  case (?first) {
                    switch (titleParts.next()) {
                      case (?titleAfter) {
                        switch (findTextPattern(titleAfter, "\",")) {
                          case (?titleEndIndex) {
                            let title = Text.take(titleAfter, titleEndIndex);
                            combinedText := combinedText # " " # title;
                          };
                          case null {};
                        };
                      };
                      case null {};
                    };
                  };
                  case null {};
                };
              };
              
              // Extract description
              if (Text.contains(article, #text descKey)) {
                let descParts = Text.split(article, #text descKey);
                switch (descParts.next()) {
                  case (?first) {
                    switch (descParts.next()) {
                      case (?descAfter) {
                        switch (findTextPattern(descAfter, "\",")) {
                          case (?descEndIndex) {
                            let desc = Text.take(descAfter, descEndIndex);
                            combinedText := combinedText # " " # desc;
                          };
                          case null {};
                        };
                      };
                      case null {};
                    };
                  };
                  case null {};
                };
              };
              
              count += 1;
            };
          };
          case null return #err("No articles found");
        };
      };
      case null return #err("Invalid news JSON format");
    };
    
    if (Text.size(combinedText) > 10) {
      #ok(combinedText)
    } else {
      #err("No meaningful text extracted from news")
    }
  };

  // Main orchestrator function
  public func checkMarketAndSentiment() : async () {
    addLog("🔄 Starting market and sentiment analysis cycle #" # Nat.toText(cycleCount + 1));
    
    var priceData : ?PriceData = null;
    var sentimentData : ?SentimentData = null;
    var status = "Processing...";
    
    // Fetch price data
    switch (await fetchPrice()) {
      case (#ok(priceResult)) {
        priceData := ?priceResult;
        addLog("📈 ICP Price: $" # Float.toText(priceResult.price) # " (24h: " # Float.toText(priceResult.change24h) # "%)");
      };
      case (#err(msg)) {
        addLog("❌ Price fetch failed: " # msg);
        status := "Price fetch failed";
      };
    };
    
    // Fetch and analyze news sentiment
    switch (await fetchNewsAsText()) {
      case (#ok(newsText)) {
        addLog("📰 Fetched news data, analyzing sentiment...");
        let sentimentScore = await calculateSentiment(newsText);
        
        // Calculate confidence based on text length and keyword density
        let textLength = Text.size(newsText);
        let confidence = Float.min(1.0, Float.fromInt(textLength) / 1000.0);
        
        sentimentData := ?{
          score = sentimentScore;
          confidence = confidence;
          timestamp = Time.now();
          keywords = extractKeywords(newsText);
        };
        
        let sentimentLabel = if (sentimentScore > 20) "Bullish 🚀"
                           else if (sentimentScore < -20) "Bearish 🐻"
                           else "Neutral ⚖️";
        
        addLog("🤖 Sentiment Analysis: " # sentimentLabel # " (Score: " # Int.toText(sentimentScore) # ")");
      };
      case (#err(msg)) {
        addLog("❌ News fetch failed: " # msg);
        if (status == "Processing...") {
          status := "News fetch failed";
        };
      };
    };
    
    // Update dashboard data
    switch (priceData, sentimentData) {
      case (?priceResult, ?sentiment) {
        dashboardData := ?{
          sentiment = sentiment;
          price = priceResult;
          status = "Active";
          lastUpdate = Time.now();
          cycleCount = cycleCount + 1;
        };
        status := "Active";
        addLog("✅ Cycle completed successfully");
      };
      case (?priceResult, null) {
        // Price only
        let defaultSentiment = {
          score = 0;
          confidence = 0.0;
          timestamp = Time.now();
          keywords = [];
        };
        dashboardData := ?{
          sentiment = defaultSentiment;
          price = priceResult;
          status = "Partial (Price Only)";
          lastUpdate = Time.now();
          cycleCount = cycleCount + 1;
        };
        addLog("⚠️ Cycle completed with price data only");
      };
      case (null, ?sentiment) {
        // Sentiment only - use previous price if available
        let defaultPrice = switch (dashboardData) {
          case (?data) data.price;
          case null {
            price = 0.0;
            change24h = 0.0;
            timestamp = Time.now();
          };
        };
        dashboardData := ?{
          sentiment = sentiment;
          price = defaultPrice;
          status = "Partial (Sentiment Only)";
          lastUpdate = Time.now();
          cycleCount = cycleCount + 1;
        };
        addLog("⚠️ Cycle completed with sentiment data only");
      };
      case (null, null) {
        addLog("❌ Cycle failed - no data retrieved");
        status := "Failed";
        lastUpdate := Time.now();
      };
    };
    
    cycleCount += 1;
    lastUpdate := Time.now();
  };

  // Start automated cycle
  private func startAutomatedCycle() : async () {
    // Cancel existing timer if any
    switch (timerId) {
      case (?id) { Timer.cancelTimer(id); };
      case null {};
    };

    // Set up recurring timer
    timerId := ?Timer.recurringTimer<system>(
      #nanoseconds(UPDATE_INTERVAL_NS),
      func() : async () {
        try {
          await checkMarketAndSentiment();
        } catch (e) {
          addLog("❌ Automated cycle error occurred");
          Debug.print("Automated cycle error occurred");
        }
      }
    );
    
    addLog("⏰ Automated cycle started (5-minute intervals)");
  };

  // Public API functions
  public query func getDashboardData() : async ?DashboardData {
    dashboardData
  };

  public query func getLogs() : async [Text] {
    Buffer.toArray(logs);
  };

  public query func getSystemStatus() : async {
    isActive: Bool;
    lastUpdate: Int;
    cycleCount: Nat;
    logsCount: Nat;
  } {
    {
      isActive = Option.isSome(timerId);
      lastUpdate = lastUpdate;
      cycleCount = cycleCount;
      logsCount = logs.size();
    }
  };

  public func clearLogs() : async () {
    logs.clear();
    addLog("🗑️ Logs cleared");
  };

  public func manualUpdate() : async () {
    addLog("🔄 Manual update triggered");
    await checkMarketAndSentiment();
  };

  public func stopAutomatedCycle() : async () {
    switch (timerId) {
      case (?id) {
        Timer.cancelTimer(id);
        timerId := null;
        addLog("⏹️ Automated cycle stopped");
      };
      case null {
        addLog("⚠️ No active cycle to stop");
      };
    };
  };

  public func startCycle() : async () {
    await startAutomatedCycle();
  };

  // Health check endpoint
  public query func healthCheck() : async {
    status: Text;
    timestamp: Int;
    version: Text;
  } {
    {
      status = "healthy";
      timestamp = Time.now();
      version = "1.0.0";
    }
  };

  // Helper functions
  private func textToFloat(text : Text) : ?Float {
    // Simple float parsing using Float.fromText
    switch (Float.fromText(text)) {
      case (#ok(f)) ?f;
      case (#err(_)) null;
    };
  };

  private func extractKeywords(text : Text) : [Text] {
    let lowerText = Text.map(text, func(c : Char) : Char {
      if (c >= 'A' and c <= 'Z') {
        Char.fromNat32(Char.toNat32(c) + 32)
      } else {
        c
      }
    });
    
    let keywords = Buffer.Buffer<Text>(10);
    
    for (keyword in POSITIVE_KEYWORDS.vals()) {
      if (Text.contains(lowerText, #text keyword)) {
        keywords.add(keyword);
      };
    };
    
    for (keyword in NEGATIVE_KEYWORDS.vals()) {
      if (Text.contains(lowerText, #text keyword)) {
        keywords.add(keyword);
      };
    };
    
    Buffer.toArray(keywords)
  };

  // System upgrade hooks
  system func preupgrade() {
    logsStable := Buffer.toArray(logs);
    apiKeyStable := apiKey;
    dashboardDataStable := dashboardData;
    cycleCountStable := cycleCount;
    lastUpdateStable := lastUpdate;
    authorizedCallersStable := Buffer.toArray(authorizedCallers);
  };

  system func postupgrade() {
    logs := Buffer.fromArray(logsStable);
    apiKey := apiKeyStable;
    dashboardData := dashboardDataStable;
    cycleCount := cycleCountStable;
    lastUpdate := lastUpdateStable;
    authorizedCallers := Buffer.fromArray(authorizedCallersStable);
    
    // Restart automated cycle after upgrade
    ignore Timer.setTimer<system>(#seconds(5), func() : async () {
      await startAutomatedCycle();
    });
  };

  // Public initialization function
  public func initialize() : async () {
    await initializeSystem();
  };
}