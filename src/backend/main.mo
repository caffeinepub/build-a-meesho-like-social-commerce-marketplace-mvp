import Map "mo:core/Map";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  var adminBootstrapped = false;

  public type UserProfile = {
    name : Text;
  };

  public type Product = {
    id : Int;
    title : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
  };

  public type Category = {
    id : Int;
    name : Text;
  };

  public type CartItem = {
    productId : Int;
    quantity : Int;
  };

  public type Order = {
    id : Int;
    userId : Principal;
    items : [CartItem];
    total : Float;
    status : OrderStatus;
    address : ?Text;
  };

  public type OrderStatus = {
    #pending;
    #accepted;
    #declined;
    #paid;
    #shipped;
    #delivered;
    #canceled;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Int.compare(product1.id, product2.id);
    };

    public func compareByPrice(product1 : Product, product2 : Product) : Order.Order {
      Float.compare(product1.price, product2.price);
    };

    public func compareByCategory(product1 : Product, product2 : Product) : Order.Order {
      switch (Text.compare(product1.category, product2.category)) {
        case (#equal) { compare(product1, product2) };
        case (order) { order };
      };
    };
  };

  public type MarketplaceData = {
    products : Map.Map<Int, Product>;
    categories : Map.Map<Int, Category>;
    carts : Map.Map<Principal, [CartItem]>;
    orders : Map.Map<Int, Order>;
    nextProductId : Int;
    nextCategoryId : Int;
    nextOrderId : Int;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  var marketplaceData : MarketplaceData = {
    products = Map.empty<Int, Product>();
    categories = Map.empty<Int, Category>();
    carts = Map.empty<Principal, [CartItem]>();
    orders = Map.empty<Int, Order>();
    nextProductId = 1;
    nextCategoryId = 1;
    nextOrderId = 1;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Marketplace API
  public shared ({ caller }) func addProduct(title : Text, description : Text, price : Float, category : Text, imageUrl : Text) : async Int {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can add products");
    };
    let productId = marketplaceData.nextProductId;
    let newProduct : Product = {
      id = productId;
      title;
      description;
      price;
      category;
      imageUrl;
    };
    (marketplaceData.products).add(productId, newProduct);
    marketplaceData := {
      marketplaceData with
      products = marketplaceData.products;
      nextProductId = productId + 1;
    };
    productId;
  };

  public shared ({ caller }) func editProduct(id : Int, title : Text, description : Text, price : Float, category : Text, imageUrl : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can edit products");
    };
    let updatedProduct : Product = {
      id;
      title;
      description;
      price;
      category;
      imageUrl;
    };
    switch (marketplaceData.products.get(id)) {
      case (null) {
        Runtime.trap("Product with id " # id.toText() # " does not exist and cannot be updated");
      };
      case (?_) {
        (marketplaceData.products).add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Int) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can delete products");
    };
    if (not marketplaceData.products.containsKey(id)) {
      Runtime.trap("Product not found: " # id.toText());
    };
    switch (marketplaceData.products.get(id)) {
      case (null) {
        Runtime.trap("Product with id " # id.toText() # " does not exist and cannot be deleted");
      };
      case (?product) {
        switch (marketplaceData.categories.get(product.id)) {
          case (null) {};
          case (?_cat) {
            (marketplaceData.products).remove(id);
          };
        };
      };
    };
  };

  public query func getProduct(id : Int) : async Product {
    switch (marketplaceData.products.get(id)) {
      case (null) { Runtime.trap("Product not found: " # id.toText()) };
      case (?product) { product };
    };
  };

  public query func getAllProductsSortedById() : async [Product] {
    let productsIter = marketplaceData.products.values();
    productsIter.toArray().sort();
  };

  public query func getProductsByCategorySortedByPrice(category : Text) : async [Product] {
    (marketplaceData.products.values()).filter(
      func(product) { product.category == category }
    ).toArray().sort(Product.compareByPrice);
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    (marketplaceData.products.values()).filter(
      func(product) { product.category == category }
    ).toArray();
  };

  public query func getAllCategories() : async [Category] {
    marketplaceData.categories.values().toArray();
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access cart");
    };
    switch (marketplaceData.carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access orders");
    };
    let userId = Principal.fromText(caller.toText());
    (marketplaceData.orders.values()).filter(
      func(order) { order.userId.toText() == userId.toText() }
    ).toArray();
  };

  // New: Admin-only function to fetch all orders (order inbox for seller role)
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    marketplaceData.orders.values().toArray();
  };

  public shared ({ caller }) func createCategories(categories : [Category]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can create categories");
    };
    for (category in categories.values()) {
      let categoryId = marketplaceData.nextCategoryId;
      if ((marketplaceData.categories).isEmpty()) {
        (marketplaceData.categories).add(0, category);
      } else if (not marketplaceData.categories.containsKey(categoryId)) {
        (marketplaceData.categories).add(categoryId, category);
        marketplaceData := {
          marketplaceData with
          categories = marketplaceData.categories;
          nextCategoryId = categoryId + 1;
        };
      };
    };
  };

  public shared ({ caller }) func createInitialMarketplace(products : [Product], categories : [Category]) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can initialize store");
    };
    await createCategories(categories);
    for (product in products.values()) {
      let _ = await addProduct(product.title, product.description, product.price, product.category, product.imageUrl);
    };
    true;
  };

  // Cart and Order Management
  public shared ({ caller }) func addToCart(productId : Int, quantity : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };
    switch (marketplaceData.products.get(productId)) {
      case (null) { Runtime.trap("Product not found: " # productId.toText()) };
      case (?_) {
        switch (marketplaceData.carts.get(caller)) {
          case (null) {
            (marketplaceData.carts).add(caller, [{
              productId;
              quantity;
            }]);
          };
          case (?cart) {
            let index = cart.findIndex(func(item) { item.productId == productId });
            switch (index) {
              case (null) {
                let newItem = { productId; quantity };
                (marketplaceData.carts).add(caller, cart.concat([newItem]));
              };
              case (?idx) {
                if (quantity > 0) {
                  let updatedCart = Array.tabulate(cart.size(), func(i) {
                    if (i == idx) { { productId; quantity } } else { cart[i] };
                  });
                  (marketplaceData.carts).add(caller, updatedCart);
                } else if (quantity == 0) {
                  let updatedCart = cart.filter(func(item) { item.productId != productId });
                  (marketplaceData.carts).add(caller, updatedCart);
                } else {
                  Runtime.trap("Cannot have negative quantity.");
                };
              };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    (marketplaceData.carts).remove(caller);
  };

  public shared ({ caller }) func checkout(address : ?Text, paymentMethod : ?Text, message : ?Text) : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can checkout");
    };
    let userId = Principal.fromText(caller.toText());
    let cart = switch (marketplaceData.carts.get(caller)) {
      case (null) { return 0 };
      case (?cartItems) { cartItems };
    };

    let total = cart.foldLeft(
      0.0,
      func(acc, item) {
        let product : Product = switch (marketplaceData.products.get(item.productId)) {
          case (null) { return acc };
          case (?prod) { prod };
        };
        acc + (product.price * item.quantity.toFloat());
      },
    );

    let orderId = marketplaceData.nextOrderId;
    let newOrder : Order = {
      id = orderId;
      userId;
      items = cart;
      total;
      status = #pending;
      address;
    };

    (marketplaceData.orders).add(orderId, newOrder);
    marketplaceData := {
      marketplaceData with
      orders = marketplaceData.orders;
      nextOrderId = orderId + 1;
    };

    await clearCart();
    orderId;
  };

  // New: Admin-only function to accept or decline orders explicitly
  public shared ({ caller }) func updateOrderStatus(orderId : Int, newStatus : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    let currentOrder = switch (marketplaceData.orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found: " # orderId.toText()) };
      case (?order) { order };
    };

    let validTransition = switch (currentOrder.status, newStatus) {
      case (#pending, #accepted) { true };
      case (#pending, #declined) { true };
      case (_, _) { false };
    };

    if (not validTransition) {
      Runtime.trap(
        "Invalid status transition from " # debug_show (currentOrder.status) # " to " # debug_show (newStatus)
      );
    };

    let updatedOrder : Order = {
      currentOrder with status = newStatus;
    };
    (marketplaceData.orders).add(orderId, updatedOrder);
  };

  // This function bootstraps the admin system the first time by creating a new admin user.
  // It should only be called once at initialization and is guarded to prevent accidental overwrites.
  public shared ({ caller }) func bootstrapAdmin(_adminToken : Text, _userProvidedToken : Text) : async () {
    if (adminBootstrapped) {
      Runtime.trap(
        "Admin has already been bootstrapped . Contact the existing administrator for access"
      );
    };
    adminBootstrapped := true;
  };
};
