from fastapi import (
    APIRouter,
    Depends,
)

from auth import require_admin

from database import database


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


users_collection = database["users"]


# =========================================================
# GET ALL USERS
# ADMIN ONLY
# =========================================================

@router.get("/")
def get_users(
    current_user=Depends(
        require_admin
    )
):

    users = users_collection.find(
        {},
        {
            "password": 0
        }
    )


    return {
        "message": "Users fetched successfully",

        "users": [

            {
                "id": str(
                    user["_id"]
                ),

                "name": user.get(
                    "name",
                    ""
                ),

                "email": user.get(
                    "email",
                    ""
                ),

                "role": user.get(
                    "role",
                    "user"
                ),

                "profile_image": user.get(
                    "profile_image"
                ),

                "auth_provider": user.get(
                    "auth_provider",
                    "email"
                ),

            }

            for user in users

        ]
    }