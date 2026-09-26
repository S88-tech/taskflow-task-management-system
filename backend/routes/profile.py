import os
import shutil

from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from auth import (
    get_current_user,
    hash_password,
    verify_password,
)

from database import database

from schemas import ChangePassword


router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


users_collection = database["users"]


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIR = (
    BASE_DIR
    / "uploads"
    / "profile_pics"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# GET CURRENT PROFILE
# =========================================================

@router.get("/")
def get_profile(
    current_user=Depends(get_current_user)
):

    return {
        "user": {
            "id": str(
                current_user["_id"]
            ),
            "name": current_user.get(
                "name",
                ""
            ),
            "email": current_user.get(
                "email",
                ""
            ),
            "role": current_user.get(
                "role",
                "user"
            ),
            "profile_image": current_user.get(
                "profile_image"
            ),
        }
    }


# =========================================================
# UPDATE PROFILE
# =========================================================

@router.put("/")
async def update_profile(
    name: str = Form(...),
    profile_picture: UploadFile | None = File(
        default=None
    ),
    current_user=Depends(get_current_user),
):

    name = name.strip()

    if len(name) < 2:

        raise HTTPException(
            status_code=400,
            detail="Name must contain at least 2 characters."
        )


    update_data = {
        "name": name
    }


    # =====================================================
    # PROFILE PICTURE
    # =====================================================

    if profile_picture:

        allowed_types = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
        }


        if (
            profile_picture.content_type
            not in allowed_types
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only JPG, PNG and WEBP "
                    "images are allowed."
                )
            )


        # -------------------------------------------------
        # Read file
        # -------------------------------------------------

        contents = await profile_picture.read()


        # -------------------------------------------------
        # 2 MB limit
        # -------------------------------------------------

        max_size = 2 * 1024 * 1024

        if len(contents) > max_size:

            raise HTTPException(
                status_code=400,
                detail="Profile picture must be smaller than 2 MB."
            )


        extension = allowed_types[
            profile_picture.content_type
        ]


        filename = (
            f"{current_user['_id']}"
            f"{extension}"
        )


        file_path = (
            UPLOAD_DIR
            / filename
        )


        # -------------------------------------------------
        # Remove old profile images
        # -------------------------------------------------

        for old_file in UPLOAD_DIR.glob(
            f"{current_user['_id']}.*"
        ):

            if old_file != file_path:

                try:
                    old_file.unlink()

                except OSError:
                    pass


        # -------------------------------------------------
        # Save new image
        # -------------------------------------------------

        with open(
            file_path,
            "wb"
        ) as buffer:

            buffer.write(contents)


        update_data[
            "profile_image"
        ] = (
            f"/uploads/profile_pics/"
            f"{filename}"
        )


    # =====================================================
    # UPDATE DATABASE
    # =====================================================

    users_collection.update_one(

        {
            "_id": current_user["_id"]
        },

        {
            "$set": update_data
        }

    )


    updated_user = (
        users_collection.find_one(
            {
                "_id": current_user["_id"]
            }
        )
    )


    return {
        "message": "Profile updated successfully",

        "user": {
            "id": str(
                updated_user["_id"]
            ),
            "name": updated_user.get(
                "name",
                ""
            ),
            "email": updated_user.get(
                "email",
                ""
            ),
            "role": updated_user.get(
                "role",
                "user"
            ),
            "profile_image": updated_user.get(
                "profile_image"
            ),
        }
    }


# =========================================================
# CHANGE PASSWORD
# =========================================================

@router.post("/change-password")
def change_password(
    password_data: ChangePassword,
    current_user=Depends(get_current_user),
):

    stored_password = (
        current_user.get("password")
    )


    if not stored_password:

        raise HTTPException(
            status_code=400,
            detail=(
                "Password change is not available "
                "for social-login accounts."
            )
        )


    # =====================================================
    # VERIFY CURRENT PASSWORD
    # =====================================================

    if not verify_password(
        password_data.current_password,
        stored_password
    ):

        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect."
        )


    # =====================================================
    # PREVENT SAME PASSWORD
    # =====================================================

    if verify_password(
        password_data.new_password,
        stored_password
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "New password must be different "
                "from your current password."
            )
        )


    # =====================================================
    # HASH NEW PASSWORD
    # =====================================================

    new_hashed_password = hash_password(
        password_data.new_password
    )


    users_collection.update_one(

        {
            "_id": current_user["_id"]
        },

        {
            "$set": {
                "password":
                    new_hashed_password
            }
        }

    )


    return {
        "message": "Password changed successfully."
    }