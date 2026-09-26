from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response,
    status,
)

from database import database

from schemas import (
    UserRegister,
    UserLogin,
)

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


users_collection = database["users"]


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user: UserRegister
):

    email = user.email.lower()


    existing_user = (
        users_collection.find_one(
            {
                "email": email
            }
        )
    )


    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    hashed_password = hash_password(
        user.password
    )


    user_data = {

        "name": user.name,

        "email": email,

        "password": hashed_password,

        "role": "user",

        "auth_provider": "email",

        "provider_id": None,

        "profile_image": None,

    }


    result = (
        users_collection.insert_one(
            user_data
        )
    )


    return {

        "message":
            "Account created successfully",

        "user": {

            "id":
                str(result.inserted_id),

            "name":
                user.name,

            "email":
                email,

            "role":
                "user",

            "profile_image":
                None,

        }
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login_user(
    user: UserLogin,
    response: Response
):

    email = user.email.lower()


    existing_user = (
        users_collection.find_one(
            {
                "email": email
            }
        )
    )


    if not existing_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    stored_password = (
        existing_user.get("password")
    )


    if not stored_password:

        raise HTTPException(
            status_code=400,
            detail=(
                "This account uses social login. "
                "Please use Google or GitHub."
            )
        )


    password_valid = verify_password(
        user.password,
        stored_password
    )


    if not password_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    token = create_access_token(
        str(
            existing_user["_id"]
        )
    )


    response.set_cookie(

        key="taskflow_token",

        value=token,

        httponly=True,

        secure=False,

        samesite="lax",

        max_age=60 * 60 * 24,

    )


    return {

        "message":
            "Login successful",

        "user": {

            "id":
                str(
                    existing_user["_id"]
                ),

            "name":
                existing_user.get(
                    "name",
                    ""
                ),

            "email":
                existing_user.get(
                    "email",
                    ""
                ),

            "role":
                existing_user.get(
                    "role",
                    "user"
                ),

            "profile_image":
                existing_user.get(
                    "profile_image"
                ),

        }
    }


# =========================================================
# CURRENT USER
# =========================================================

@router.get("/me")
def get_me(
    current_user=Depends(
        get_current_user
    )
):

    return {

        "user": {

            "id":
                str(
                    current_user["_id"]
                ),

            "name":
                current_user.get(
                    "name",
                    ""
                ),

            "email":
                current_user.get(
                    "email",
                    ""
                ),

            "role":
                current_user.get(
                    "role",
                    "user"
                ),

            "profile_image":
                current_user.get(
                    "profile_image"
                ),

        }
    }


# =========================================================
# LOGOUT
# =========================================================

@router.post("/logout")
def logout(
    response: Response
):

    response.delete_cookie(
        key="taskflow_token"
    )


    return {
        "message":
            "Logged out successfully"
    }