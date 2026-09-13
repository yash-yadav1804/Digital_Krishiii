from enum import StrEnum


class UserRole(StrEnum):
    ADMIN = "admin"
    FARMER = "farmer"
    SHOP_OWNER = "shop_owner"
    CUSTOMER = "customer"
