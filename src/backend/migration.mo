import Map "mo:core/Map";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Principal "mo:core/Principal";

module {
  type Product = {
    id : Int;
    title : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
  };

  type Category = {
    id : Int;
    name : Text;
  };

  type CartItem = {
    productId : Int;
    quantity : Int;
  };

  type OrderStatus = {
    #pending;
    #paid;
    #shipped;
    #delivered;
    #canceled;
  };

  type OrderLegacy = {
    id : Int;
    userId : Principal;
    items : [CartItem];
    total : Float;
    status : OrderStatus;
  };

  type MarketplaceDataLegacy = {
    products : Map.Map<Int, Product>;
    categories : Map.Map<Int, Category>;
    carts : Map.Map<Principal, [CartItem]>;
    orders : Map.Map<Int, OrderLegacy>;
    nextProductId : Int;
    nextCategoryId : Int;
    nextOrderId : Int;
  };

  type Order = {
    id : Int;
    userId : Principal;
    items : [CartItem];
    total : Float;
    status : OrderStatus;
    address : ?Text;
  };

  type MarketplaceData = {
    products : Map.Map<Int, Product>;
    categories : Map.Map<Int, Category>;
    carts : Map.Map<Principal, [CartItem]>;
    orders : Map.Map<Int, Order>;
    nextProductId : Int;
    nextCategoryId : Int;
    nextOrderId : Int;
  };

  type ActorLegacy = {
    adminBootstrapped : Bool;
    marketplaceData : MarketplaceDataLegacy;
  };

  type Actor = {
    adminBootstrapped : Bool;
    marketplaceData : MarketplaceData;
  };

  public func run(actorLegacy : ActorLegacy) : Actor {
    let newOrders = actorLegacy.marketplaceData.orders.map<Int, OrderLegacy, Order>(
      func(_id, oldOrder) {
        { oldOrder with address = null };
      }
    );
    {
      adminBootstrapped = actorLegacy.adminBootstrapped;
      marketplaceData = {
        actorLegacy.marketplaceData with
        orders = newOrders;
      };
    };
  };
};
