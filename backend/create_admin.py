import os

from dotenv import load_dotenv

from database import database

from auth import hash_password


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# DATABASE
# =========================================================

users_collection = database["users"]


# =========================================================
# ADMIN DETAILS
# =========================================================

ADMIN_NAME = os.getenv(
    "ADMIN_NAME"
)

ADMIN_EMAIL = os.getenv(
    "ADMIN_EMAIL"
)

ADMIN_PASSWORD = os.getenv(
    "ADMIN_PASSWORD"
)


# =========================================================
# VALIDATION
# =========================================================

if not ADMIN_NAME:

    raise ValueError(
        "ADMIN_NAME is missing in .env"
    )


if not ADMIN_EMAIL:

    raise ValueError(
        "ADMIN_EMAIL is missing in .env"
    )


if not ADMIN_PASSWORD:

    raise ValueError(
        "ADMIN_PASSWORD is missing in .env"
    )


# =========================================================
# CHECK EXISTING ADMIN
# =========================================================

existing_admin = users_collection.find_one(
    {
        "email": ADMIN_EMAIL.lower()
    }
)


if existing_admin:

    if existing_admin.get("role") == "admin":

        print(
            "Admin account already exists."
        )

    else:

        users_collection.update_one(
            {
                "_id": existing_admin["_id"]
            },

            {
                "$set": {
                    "role": "admin"
                }
            }
        )

        print(
            "Existing account promoted to admin."
        )

else:

    hashed_password = hash_password(
        ADMIN_PASSWORD
    )

    admin_data = {

        "name": ADMIN_NAME,

        "email": ADMIN_EMAIL.lower(),

        "password": hashed_password,

        "role": "admin",

        "auth_provider": "email",

        "provider_id": None
    }

    users_collection.insert_one(
        admin_data
    )

    print(
        "Admin account created successfully."
    )


print(
    f"Admin email: {ADMIN_EMAIL}"
)