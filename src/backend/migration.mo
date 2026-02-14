import Map "mo:core/Map";
import Int "mo:core/Int";

module {
  type OldProduct = {
    id : Int;
    title : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
  };

  type OldMarketplaceData = {
    products : Map.Map<Int, OldProduct>;
    categories : Map.Map<Int, { id : Int; name : Text }>;
    carts : Map.Map<Principal, [ { productId : Int; quantity : Int } ]>;
    orders : Map.Map<Int, {
      id : Int;
      userId : Principal;
      items : [ { productId : Int; quantity : Int } ];
      total : Float;
      status : {
        #pending;
        #accepted;
        #declined;
        #paid;
        #shipped;
        #delivered;
        #canceled;
      };
      address : ?Text;
    }>;
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
    stock : Int;
  };

  type NewMarketplaceData = {
    products : Map.Map<Int, NewProduct>;
    categories : Map.Map<Int, { id : Int; name : Text }>;
    carts : Map.Map<Principal, [ { productId : Int; quantity : Int } ]>;
    orders : Map.Map<Int, {
      id : Int;
      userId : Principal;
      items : [ { productId : Int; quantity : Int } ];
      total : Float;
      status : {
        #pending;
        #accepted;
        #declined;
        #paid;
        #shipped;
        #delivered;
        #canceled;
      };
      address : ?Text;
    }>;
    nextProductId : Int;
    nextCategoryId : Int;
    nextOrderId : Int;
  };

  type OldActor = {
    adminBootstrapped : Bool;
    userProfiles : Map.Map<Principal, { name : Text }>;
    marketplaceData : OldMarketplaceData;
  };

  type NewActor = {
    adminBootstrapped : Bool;
    userProfiles : Map.Map<Principal, { name : Text }>;
    marketplaceData : NewMarketplaceData;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.marketplaceData.products.map<Int, OldProduct, NewProduct>(
      func(_productId, oldProduct) {
        { oldProduct with stock = 100 };
      }
    );

    let newMarketplaceData = {
      old.marketplaceData with
      products = newProducts
    };

    {
      old with
      marketplaceData = newMarketplaceData;
    };
  };
};
