import Map "mo:core/Map";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

module {
  type OldOrderStatus = {
    #pending;
    #paid;
    #shipped;
    #delivered;
    #canceled;
  };

  type OldOrder = {
    id : Int;
    userId : Principal;
    items : [OldCartItem];
    total : Float;
    status : OldOrderStatus;
    address : ?Text;
  };

  type OldCartItem = {
    productId : Int;
    quantity : Int;
  };

  type OldMarketplaceData = {
    products : Map.Map<Int, OldProduct>;
    categories : Map.Map<Int, OldCategory>;
    carts : Map.Map<Principal, [OldCartItem]>;
    orders : Map.Map<Int, OldOrder>;
    nextProductId : Int;
    nextCategoryId : Int;
    nextOrderId : Int;
  };

  type OldProduct = {
    id : Int;
    title : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
  };

  type OldCategory = {
    id : Int;
    name : Text;
  };

  type OldActor = {
    adminBootstrapped : Bool;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    marketplaceData : OldMarketplaceData;
  };

  type OldUserProfile = {
    name : Text;
  };

  // New Order Status with #accepted and #declined
  type NewOrderStatus = {
    #pending;
    #accepted;
    #declined;
    #paid;
    #shipped;
    #delivered;
    #canceled;
  };

  // New Order matches new version
  type NewOrder = {
    id : Int;
    userId : Principal;
    items : [NewCartItem];
    total : Float;
    status : NewOrderStatus;
    address : ?Text;
  };

  // New CartItem matches new version
  type NewCartItem = {
    productId : Int;
    quantity : Int;
  };

  type NewMarketplaceData = {
    products : Map.Map<Int, NewProduct>;
    categories : Map.Map<Int, NewCategory>;
    carts : Map.Map<Principal, [NewCartItem]>;
    orders : Map.Map<Int, NewOrder>;
    nextProductId : Int;
    nextCategoryId : Int;
    nextOrderId : Int;
  };

  type NewProduct = {
    id : Int;
    title : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
  };

  type NewCategory = {
    id : Int;
    name : Text;
  };

  type NewActor = {
    adminBootstrapped : Bool;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    marketplaceData : NewMarketplaceData;
  };

  type NewUserProfile = {
    name : Text;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newOrders = old.marketplaceData.orders.map<Int, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        {
          oldOrder with
          status = switch (oldOrder.status) {
            case (#pending) { #pending };
            case (#paid) { #paid };
            case (#shipped) { #shipped };
            case (#delivered) { #delivered };
            case (#canceled) { #canceled };
          };
        };
      }
    );
    let newMarketplaceData = {
      old.marketplaceData with
      orders = newOrders;
    };
    {
      old with
      marketplaceData = newMarketplaceData;
    };
  };
};
